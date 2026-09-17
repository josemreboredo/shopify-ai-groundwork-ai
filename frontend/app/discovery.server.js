/**
 * Server-only access to the discovery service (ADR 0014).
 * DATA_STORE=file (default, local): clients/.work, shared with the CLI and skills.
 * DATA_STORE=postgres (Vercel): DATABASE_URL, e.g. Neon in an EU region.
 */
import { neon } from '@neondatabase/serverless';
import { data } from 'react-router';

import { createDiscoveryService, ServiceError } from '../../discovery/service/index.js';
import { createFileStore } from '../../discovery/service/stores/file-store.js';
import { createPostgresStore } from '../../discovery/service/stores/postgres-store.js';

let service;

function store() {
  const kind = process.env.DATA_STORE ?? (process.env.VERCEL ? 'postgres' : 'file');
  if (kind === 'postgres') {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for DATA_STORE=postgres');
    const sql = neon(process.env.DATABASE_URL);
    return createPostgresStore({ query: (text, params) => sql.query(text, params) });
  }
  if (kind === 'file') {
    if (process.env.VERCEL) throw new Error('Local file storage is not available on Vercel — use DATA_STORE=postgres');
    return createFileStore();
  }
  throw new Error(`Unknown DATA_STORE=${kind} — use file or postgres`);
}

export function discovery() {
  service ??= createDiscoveryService({ store: store() });
  return service;
}

/** Turn a service error into a route response; rethrow anything else. */
export function serviceFailure(err, extra = {}) {
  if (err instanceof ServiceError) {
    return data({ ...extra, error: err.message, errors: err.errors }, { status: err.status });
  }
  throw err;
}
