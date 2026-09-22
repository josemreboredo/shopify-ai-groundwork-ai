/**
 * @file oauth.js
 * @description OAuth 2.1 authorization server for the Claude connector (ADR 0015).
 * Claude identifies itself with a Client ID Metadata Document (CIMD) hosted on
 * claude.ai, or with a pre-registered public client. PKCE S256 is required,
 * authorization codes are single-use, access and refresh tokens are random,
 * stored only as SHA-256 hashes, and refresh tokens rotate. The person behind a
 * grant signs in to the web app first (GitHub allowlist), so a token acts as
 * that Lead Consultant. Requirements: claude.com/docs/connectors/building/authentication.
 *
 * @module ai/shared/oauth
 */

import { createHash, randomBytes } from 'node:crypto';

export const CLAUDE_REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';
export const SCOPE = 'discovery';
const SUPPORTED_SCOPES = [SCOPE, 'offline_access'];
const CODE_TTL_S = 5 * 60;
const ACCESS_TTL_S = 60 * 60;
const REFRESH_TTL_S = 30 * 24 * 60 * 60;
const CIMD_HOSTS = ['claude.ai'];
const LOOPBACK = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)$/;

/** Pre-registered public clients ("Use your own OAuth client" in Claude). */
export const STATIC_CLIENTS = {
  'merkle-discovery-claude': { client_name: 'Claude', redirect_uris: [CLAUDE_REDIRECT_URI] },
};

const secret = () => randomBytes(32).toString('base64url');
export const hashToken = (value) => createHash('sha256').update(value).digest('hex');
export const pkceChallenge = (verifier) => createHash('sha256').update(verifier).digest('base64url');

/** @param {string} origin */
export const mcpResource = (origin) => `${origin}/mcp`;

/** RFC 8414 authorization server metadata. @param {string} origin */
export function authorizationServerMetadata(origin) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    client_id_metadata_document_supported: true,
    scopes_supported: SUPPORTED_SCOPES,
  };
}

/** RFC 9728 protected resource metadata for the MCP endpoint. @param {string} origin */
export function protectedResourceMetadata(origin) {
  return {
    resource: mcpResource(origin),
    authorization_servers: [origin],
    scopes_supported: [SCOPE],
    bearer_methods_supported: ['header'],
    resource_name: 'Merkle Discovery',
  };
}

/**
 * Redirect URI registered for a client: exact match, or a loopback URI with the
 * port ignored (RFC 8252, Claude Code).
 */
function redirectAllowed(registered, requested) {
  if (registered.includes(requested)) return true;
  const m = LOOPBACK.exec(requested);
  return Boolean(m) && registered.some((r) => {
    const reg = LOOPBACK.exec(r);
    return reg && reg[1] === m[1] && reg[3] === m[3];
  });
}

/** @typedef {{ client_id: string, client_name: string, redirect_uris: string[] }} Client */

/**
 * @param {{
 *   store: import('./stores/oauth-memory-store.js').OAuthStore,
 *   fetchJson?: (url: string) => Promise<object>,
 *   now?: () => number,
 *   cimdHosts?: string[],
 * }} options
 */
export function createOAuthServer({ store, fetchJson = defaultFetchJson, now = () => Date.now(), cimdHosts = CIMD_HOSTS }) {
  const seconds = () => Math.floor(now() / 1000);

  /** @param {string} clientId @returns {Promise<Client|null>} */
  async function resolveClient(clientId) {
    if (STATIC_CLIENTS[clientId]) return { client_id: clientId, ...STATIC_CLIENTS[clientId] };
    let url;
    try {
      url = new URL(clientId);
    } catch {
      return null;
    }
    // CIMD documents are fetched only from known Claude hosts (no arbitrary outbound requests).
    if (url.protocol !== 'https:' || !cimdHosts.includes(url.hostname) || url.hash) return null;
    try {
      const doc = await fetchJson(url.toString());
      if (doc?.client_id !== clientId || !Array.isArray(doc.redirect_uris) || !doc.redirect_uris.length) return null;
      return { client_id: clientId, client_name: String(doc.client_name ?? url.hostname), redirect_uris: doc.redirect_uris.map(String) };
    } catch {
      return null;
    }
  }

  /** @param {{ client_id: string, login: string, scope: string, resource: string }} grant */
  async function issue({ client_id, login, scope, resource }) {
    const access = secret();
    const refresh = secret();
    await store.saveGrant({
      access_hash: hashToken(access),
      refresh_hash: hashToken(refresh),
      client_id, login, scope, resource,
      access_expires_at: seconds() + ACCESS_TTL_S,
      refresh_expires_at: seconds() + REFRESH_TTL_S,
    });
    return { access_token: access, token_type: 'Bearer', expires_in: ACCESS_TTL_S, refresh_token: refresh, scope };
  }

  const tokenError = (error, description, status = 400) => ({ status, body: { error, error_description: description } });

  return {
    resolveClient,

    /**
     * Validate an authorization request. Errors before the client and redirect
     * URI are trusted must be shown to the user, never redirected.
     *
     * @param {Record<string, string|null>} params
     * @param {string} origin
     */
    async validateAuthorize(params, origin) {
      const client = params.client_id ? await resolveClient(params.client_id) : null;
      if (!client) return { ok: false, redirect: false, error: 'invalid_client', description: 'Unknown client' };
      if (!params.redirect_uri || !redirectAllowed(client.redirect_uris, params.redirect_uri)) {
        return { ok: false, redirect: false, error: 'invalid_request', description: 'Redirect URI not registered for this client' };
      }
      const fail = (error, description) => ({ ok: false, redirect: true, error, description, redirect_uri: params.redirect_uri, state: params.state ?? null });
      if (params.response_type !== 'code') return fail('unsupported_response_type', 'Only the authorization code flow is supported');
      if (!params.code_challenge || params.code_challenge_method !== 'S256') return fail('invalid_request', 'PKCE with S256 is required');
      const requested = (params.scope ?? SCOPE).split(' ').filter(Boolean);
      if (requested.some((s) => !SUPPORTED_SCOPES.includes(s))) return fail('invalid_scope', 'Unsupported scope');
      if (params.resource && params.resource.replace(/\/$/, '') !== mcpResource(origin)) return fail('invalid_target', 'Unknown resource');
      return {
        ok: true,
        client,
        request: {
          client_id: client.client_id,
          redirect_uri: params.redirect_uri,
          state: params.state ?? null,
          code_challenge: params.code_challenge,
          scope: [...new Set([SCOPE, ...requested])].join(' '),
          resource: mcpResource(origin),
        },
      };
    },

    /**
     * The signed-in consultant approved: issue a single-use code.
     *
     * @param {{ client_id: string, redirect_uri: string, state: string|null, code_challenge: string, scope: string, resource: string }} request
     * @param {string} login
     * @returns {Promise<string>} redirect URL
     */
    async approve(request, login) {
      const code = secret();
      await store.saveCode({ code_hash: hashToken(code), ...request, login, expires_at: seconds() + CODE_TTL_S });
      const url = new URL(request.redirect_uri);
      url.searchParams.set('code', code);
      if (request.state) url.searchParams.set('state', request.state);
      return url.toString();
    },

    /** @param {{ redirect_uri: string, state: string|null }} request @param {string} [error] */
    deny(request, error = 'access_denied') {
      const url = new URL(request.redirect_uri);
      url.searchParams.set('error', error);
      if (request.state) url.searchParams.set('state', request.state);
      return url.toString();
    },

    /**
     * Token endpoint (application/x-www-form-urlencoded body).
     *
     * @param {Record<string, string|null>} form
     * @returns {Promise<{ status: number, body: object }>}
     */
    async token(form) {
      if (form.grant_type === 'authorization_code') {
        if (!form.code || !form.code_verifier || !form.client_id || !form.redirect_uri) return tokenError('invalid_request', 'code, code_verifier, client_id and redirect_uri are required');
        const grant = await store.takeCode(hashToken(form.code));
        if (!grant || grant.expires_at < seconds()) return tokenError('invalid_grant', 'Authorization code is invalid or expired');
        if (grant.client_id !== form.client_id || grant.redirect_uri !== form.redirect_uri) return tokenError('invalid_grant', 'Authorization code was issued to another client or redirect URI');
        if (pkceChallenge(form.code_verifier) !== grant.code_challenge) return tokenError('invalid_grant', 'PKCE verification failed');
        return { status: 200, body: await issue(grant) };
      }
      if (form.grant_type === 'refresh_token') {
        if (!form.refresh_token || !form.client_id) return tokenError('invalid_request', 'refresh_token and client_id are required');
        const grant = await store.takeRefresh(hashToken(form.refresh_token));
        if (!grant || grant.refresh_expires_at < seconds() || grant.client_id !== form.client_id) return tokenError('invalid_grant', 'Refresh token is invalid or expired');
        return { status: 200, body: await issue(grant) };
      }
      return tokenError('unsupported_grant_type', 'Use authorization_code or refresh_token');
    },

    /**
     * Verify a bearer token for the MCP endpoint.
     *
     * @param {string|undefined} bearer @param {string} origin
     * @returns {Promise<{ login: string, client_id: string, scopes: string[], expires_at: number }|null>}
     */
    async verify(bearer, origin) {
      if (!bearer) return null;
      const grant = await store.findAccess(hashToken(bearer));
      if (!grant || grant.access_expires_at < seconds() || grant.resource !== mcpResource(origin)) return null;
      return { login: grant.login, client_id: grant.client_id, scopes: grant.scope.split(' '), expires_at: grant.access_expires_at };
    },
  };
}

/** @param {string} url */
async function defaultFetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (text.length > 20_000) throw new Error('Client metadata document too large');
  return JSON.parse(text);
}
