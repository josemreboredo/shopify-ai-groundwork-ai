/**
 * Server-only access to the discovery service and the connector's OAuth server (ADR 0014, 0015).
 * DATA_STORE=file (default, local): clients/.work, shared with the CLI and skills; OAuth grants in memory.
 * DATA_STORE=postgres (Vercel): DATABASE_URL, e.g. Neon; engagements and OAuth grants in Postgres.
 */
import { neon } from '@neondatabase/serverless';
import { data } from 'react-router';

import { createDiscoveryService, ServiceError } from '../../discovery/service/index.js';
import { createOAuthServer } from '../../discovery/service/oauth.js';
import { createFileStore } from '../../discovery/service/stores/file-store.js';
import { createPostgresStore } from '../../discovery/service/stores/postgres-store.js';
import { createOAuthMemoryStore } from '../../discovery/service/stores/oauth-memory-store.js';
import { createOAuthPostgresStore } from '../../discovery/service/stores/oauth-postgres-store.js';

let service;
let oauthServer;

function storeKind() {
  const kind = process.env.DATA_STORE ?? (process.env.VERCEL ? 'postgres' : 'file');
  if (kind === 'file' && process.env.VERCEL) throw new Error('Local file storage is not available on Vercel — use DATA_STORE=postgres');
  if (kind !== 'file' && kind !== 'postgres') throw new Error(`Unknown DATA_STORE=${kind} — use file or postgres`);
  return kind;
}

function query() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for DATA_STORE=postgres');
  const sql = neon(process.env.DATABASE_URL);
  return (text, params) => sql.query(text, params);
}

/** Pilot (owner decision 2026-09-17): every signed-in user sees every engagement; ENGAGEMENT_VISIBILITY=own restricts. */
export const engagementVisibility = () => (process.env.ENGAGEMENT_VISIBILITY === 'own' ? 'own' : 'all');

export function discovery() {
  service ??= createDiscoveryService({
    store: storeKind() === 'postgres' ? createPostgresStore({ query: query() }) : createFileStore(),
    visibility: engagementVisibility(),
  });
  return service;
}

export function oauth() {
  oauthServer ??= createOAuthServer({ store: storeKind() === 'postgres' ? createOAuthPostgresStore({ query: query() }) : createOAuthMemoryStore() });
  return oauthServer;
}

/** Turn a service error into a route response; rethrow anything else. */
export function serviceFailure(err, extra = {}) {
  if (err instanceof ServiceError) {
    return data({ ...extra, error: err.message, errors: err.errors, blockers: err.blockers ?? [] }, { status: err.status });
  }
  throw err;
}
