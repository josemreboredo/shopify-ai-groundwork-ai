/**
 * @file file-store.js
 * @description Interview store on local files — the same
 * clients/.work/<slug>/interview.json the CLI and Claude Code skills use.
 *
 * @module ai/shared/stores/file-store
 */

import fs from 'node:fs';
import path from 'node:path';

import { WORK_ROOT } from '../../paths.js';
import { sessionFile, loadSession, saveSession, SLUG } from '../../engagement/session.js';

/**
 * @param {{ workRoot?: string }} [options]
 * @returns {import('../index.js').InterviewStore}
 */
export function createFileStore({ workRoot = WORK_ROOT } = {}) {
  return {
    async list() {
      if (!fs.existsSync(workRoot)) return [];
      return fs.readdirSync(workRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory() && SLUG.test(d.name) && fs.existsSync(path.join(workRoot, d.name, 'interview.json')))
        .map((d) => loadSession(sessionFile(workRoot, d.name)));
    },
    async get(client) {
      const file = sessionFile(workRoot, client);
      return fs.existsSync(file) ? loadSession(file) : null;
    },
    async create(session) {
      const file = sessionFile(workRoot, session.client);
      if (fs.existsSync(file)) throw new Error(`An interview for ${session.client} already exists`);
      saveSession(file, session);
    },
    async save(session) {
      saveSession(sessionFile(workRoot, session.client), session);
    },
    /** Deletes the whole work directory for the engagement, session included. */
    async remove(client) {
      if (!SLUG.test(client)) throw new Error(`${client}: not a client slug`);
      fs.rmSync(path.join(workRoot, client), { recursive: true, force: true });
    },
  };
}
