/**
 * @file oauth-postgres-store.js
 * @description OAuth store on Postgres. Codes and tokens are stored only as
 * SHA-256 hashes; single use and rotation rely on DELETE … RETURNING.
 *
 * @module ai/shared/stores/oauth-postgres-store
 */

export const OAUTH_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS oauth_codes (
    code_hash text PRIMARY KEY,
    data jsonb NOT NULL,
    expires_at bigint NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS oauth_grants (
    refresh_hash text PRIMARY KEY,
    access_hash text UNIQUE NOT NULL,
    data jsonb NOT NULL,
    refresh_expires_at bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
];

/**
 * @param {{ query: (text: string, params?: unknown[]) => Promise<object[]> }} options
 * @returns {import('./oauth-memory-store.js').OAuthStore}
 */
export function createOAuthPostgresStore({ query }) {
  let ready;
  const ensure = () => (ready ??= (async () => {
    for (const sql of OAUTH_TABLES_SQL) await query(sql);
  })());
  const parse = (value) => (typeof value === 'string' ? JSON.parse(value) : value);
  const first = (rows) => (rows.length ? parse(rows[0].data) : null);

  return {
    async saveCode(code) {
      await ensure();
      await query('DELETE FROM oauth_codes WHERE expires_at < $1', [Math.floor(Date.now() / 1000)]);
      await query('INSERT INTO oauth_codes (code_hash, data, expires_at) VALUES ($1, $2::jsonb, $3)', [code.code_hash, JSON.stringify(code), code.expires_at]);
    },
    async takeCode(hash) {
      await ensure();
      return first(await query('DELETE FROM oauth_codes WHERE code_hash = $1 RETURNING data', [hash]));
    },
    async saveGrant(grant) {
      await ensure();
      await query('DELETE FROM oauth_grants WHERE refresh_expires_at < $1', [Math.floor(Date.now() / 1000)]);
      await query(
        'INSERT INTO oauth_grants (refresh_hash, access_hash, data, refresh_expires_at) VALUES ($1, $2, $3::jsonb, $4)',
        [grant.refresh_hash, grant.access_hash, JSON.stringify(grant), grant.refresh_expires_at],
      );
    },
    async findAccess(hash) {
      await ensure();
      return first(await query('SELECT data FROM oauth_grants WHERE access_hash = $1', [hash]));
    },
    async takeRefresh(hash) {
      await ensure();
      return first(await query('DELETE FROM oauth_grants WHERE refresh_hash = $1 RETURNING data', [hash]));
    },
  };
}
