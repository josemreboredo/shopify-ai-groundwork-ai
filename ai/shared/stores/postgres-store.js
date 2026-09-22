/**
 * @file postgres-store.js
 * @description Interview store on Postgres (hosted 2.0.0, ADR 0014). One row per
 * engagement with the session as JSONB. Driver-agnostic: pass a `query(text,
 * params)` function returning rows (e.g. Neon's `sql.query`), so the store moves
 * unchanged to a dentsu Postgres.
 *
 * @module ai/shared/stores/postgres-store
 */

export const TABLE_SQL = `CREATE TABLE IF NOT EXISTS discovery_interviews (
  client text PRIMARY KEY,
  owner text,
  session jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

/**
 * @param {{ query: (text: string, params?: unknown[]) => Promise<object[]> }} options
 * @returns {import('../index.js').InterviewStore}
 */
export function createPostgresStore({ query }) {
  let ready;
  const ensure = () => (ready ??= query(TABLE_SQL));
  const parse = (value) => (typeof value === 'string' ? JSON.parse(value) : value);

  return {
    async list() {
      await ensure();
      const rows = await query('SELECT session FROM discovery_interviews ORDER BY updated_at DESC');
      return rows.map((r) => parse(r.session));
    },
    async get(client) {
      await ensure();
      const rows = await query('SELECT session FROM discovery_interviews WHERE client = $1', [client]);
      return rows.length ? parse(rows[0].session) : null;
    },
    async create(session) {
      await ensure();
      const rows = await query(
        'INSERT INTO discovery_interviews (client, owner, session) VALUES ($1, $2, $3::jsonb) ON CONFLICT (client) DO NOTHING RETURNING client',
        [session.client, session.owner ?? null, JSON.stringify(session)],
      );
      if (!rows.length) throw new Error(`An interview for ${session.client} already exists`);
    },
    async save(session) {
      await ensure();
      const rows = await query(
        'UPDATE discovery_interviews SET session = $2::jsonb, owner = $3, updated_at = now() WHERE client = $1 RETURNING client',
        [session.client, JSON.stringify(session), session.owner ?? null],
      );
      if (!rows.length) throw new Error(`No interview for ${session.client}`);
    },
    async remove(client) {
      await ensure();
      await query('DELETE FROM discovery_interviews WHERE client = $1', [client]);
    },
  };
}
