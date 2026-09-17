/**
 * @file memory-store.js
 * @description In-memory interview store (tests and local experiments).
 *
 * @module discovery/service/stores/memory-store
 */

/** @returns {import('../index.js').InterviewStore} */
export function createMemoryStore() {
  const sessions = new Map();
  const copy = (s) => structuredClone(s);
  return {
    async list() {
      return [...sessions.values()].map(copy);
    },
    async get(client) {
      return sessions.has(client) ? copy(sessions.get(client)) : null;
    },
    async create(session) {
      if (sessions.has(session.client)) throw new Error(`An interview for ${session.client} already exists`);
      sessions.set(session.client, copy(session));
    },
    async save(session) {
      if (!sessions.has(session.client)) throw new Error(`No interview for ${session.client}`);
      sessions.set(session.client, copy(session));
    },
  };
}
