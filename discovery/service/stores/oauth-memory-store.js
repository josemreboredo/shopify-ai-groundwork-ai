/**
 * @file oauth-memory-store.js
 * @description In-memory OAuth store (tests and local development; grants are lost on restart).
 *
 * @module discovery/service/stores/oauth-memory-store
 */

/**
 * @typedef {object} OAuthStore
 * @property {(code: object) => Promise<void>} saveCode
 * @property {(codeHash: string) => Promise<object|null>} takeCode      Returns and deletes (single use)
 * @property {(grant: object) => Promise<void>} saveGrant
 * @property {(accessHash: string) => Promise<object|null>} findAccess
 * @property {(refreshHash: string) => Promise<object|null>} takeRefresh  Returns and deletes the grant (rotation)
 */

/** @returns {OAuthStore} */
export function createOAuthMemoryStore() {
  const codes = new Map();
  const grants = new Map();
  return {
    async saveCode(code) {
      codes.set(code.code_hash, { ...code });
    },
    async takeCode(hash) {
      const code = codes.get(hash) ?? null;
      codes.delete(hash);
      return code;
    },
    async saveGrant(grant) {
      grants.set(grant.refresh_hash, { ...grant });
    },
    async findAccess(hash) {
      for (const g of grants.values()) if (g.access_hash === hash) return { ...g };
      return null;
    },
    async takeRefresh(hash) {
      const grant = grants.get(hash) ?? null;
      grants.delete(hash);
      return grant;
    },
  };
}
