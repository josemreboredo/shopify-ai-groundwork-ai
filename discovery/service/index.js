/**
 * @file index.js
 * @description Discovery service (ADR 0014): the operations the Lead Consultant
 * web app and the Claude connector share. It wraps the 1.0.0 interview engine
 * unchanged — code decides offer, rules and validation — and adds storage,
 * access control and form handling. Storage is an adapter (files locally,
 * Postgres when hosted).
 *
 * @module discovery/service
 */

import { createSession } from '../agents/interview/session.js';
import { nextQuestions, questionById } from '../agents/interview/next.js';
import { recordAnswer, markQuestion, addNote } from '../agents/interview/answer.js';
import { preview } from '../agents/interview/preview.js';
import { fieldSpecs, parseField } from './fields.js';

/**
 * @typedef {object} InterviewStore
 * @property {() => Promise<object[]>} list
 * @property {(client: string) => Promise<object|null>} get
 * @property {(session: object) => Promise<void>} create
 * @property {(session: object) => Promise<void>} save
 */

/** @typedef {{ login: string, role: 'owner'|'consultant' }} User */

export class ServiceError extends Error {
  /** @param {number} status @param {string} message @param {string[]} [errors] */
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const isoToday = () => new Date().toISOString().slice(0, 10);

/**
 * Owners see every engagement; consultants only their own. Sessions created
 * before 2.0.0 (CLI, no owner) are visible to owners only.
 *
 * @param {User} user @param {object} session
 */
export const canAccess = (user, session) => user?.role === 'owner' || (Boolean(session.owner) && session.owner === user?.login);

/**
 * Users allowed to sign in, from comma-separated GitHub logins.
 *
 * @param {string} login
 * @param {{ owners?: string, consultants?: string }} allowlist
 * @returns {User|null}
 */
export function userFor(login, { owners = '', consultants = '' }) {
  const split = (s) => s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  const name = String(login ?? '').toLowerCase();
  if (!name) return null;
  if (split(owners).includes(name)) return { login: name, role: 'owner' };
  if (split(consultants).includes(name)) return { login: name, role: 'consultant' };
  return null;
}

/**
 * @param {{ store: InterviewStore, today?: () => string }} options
 */
export function createDiscoveryService({ store, today = isoToday }) {
  /** @param {User} user @param {string} client */
  async function load(user, client) {
    if (!user) throw new ServiceError(401, 'Sign in first');
    const session = await store.get(client);
    if (!session) throw new ServiceError(404, `No interview for ${client}`);
    if (!canAccess(user, session)) throw new ServiceError(403, `No access to ${client}`);
    return session;
  }

  /** @param {object} session */
  function summary(session) {
    const p = preview(session, today());
    return {
      client: session.client,
      language: session.language,
      mode: session.mode,
      owner: session.owner ?? null,
      started_at: session.started_at,
      updated_at: session.updated_at,
      offer: p.offer,
      go: p.go,
      route: p.route ?? null,
      coverage: p.coverage,
    };
  }

  return {
    /** @param {User} user */
    async listEngagements(user) {
      if (!user) throw new ServiceError(401, 'Sign in first');
      const sessions = (await store.list()).filter((s) => canAccess(user, s));
      return sessions.map(summary).sort((a, b) => b.updated_at.localeCompare(a.updated_at) || a.client.localeCompare(b.client));
    },

    /** @param {User} user @param {{ client: string, language?: string, mode?: string }} input */
    async startInterview(user, { client, language, mode }) {
      if (!user) throw new ServiceError(401, 'Sign in first');
      let session;
      try {
        session = createSession({ client, language, mode, today: today() });
      } catch (err) {
        throw new ServiceError(400, err.message);
      }
      session.owner = user.login;
      if (await store.get(session.client)) throw new ServiceError(409, `An interview for ${session.client} already exists`);
      await store.create(session);
      return { client: session.client };
    },

    /** @param {User} user @param {string} client @param {{ limit?: number }} [options] */
    async getInterview(user, client, { limit = 3 } = {}) {
      const session = await load(user, client);
      const next = nextQuestions(session, { limit });
      return {
        engagement: summary(session),
        next: { ...next, questions: next.questions.map((q) => ({ ...q, inputs: fieldSpecs(q) })) },
        preview: preview(session, today()),
        notes: session.notes,
        tbc: session.tbc,
        skipped: session.skipped,
      };
    },

    /**
     * Record the answer to one question from form values; all fields of the
     * question are applied together or not at all.
     *
     * @param {User} user @param {string} client
     * @param {{ question_id: string, values: Record<string, string[]>, source?: string, status?: string, note?: string }} input
     */
    async answerQuestion(user, client, { question_id, values, source, status = 'confirmed', note }) {
      const session = await load(user, client);
      const question = questionById(question_id);
      if (!question) throw new ServiceError(400, `${question_id}: unknown question`);
      const specs = fieldSpecs({ fields: question.maps_to, answer_type: question.answer_type });
      const parsed = specs.map((spec) => ({ spec, result: parseField(spec, values[spec.pointer] ?? []) }));
      const errors = parsed.filter((p) => p.result && 'error' in p.result).map((p) => p.result.error);
      const answers = parsed.filter((p) => p.result && 'value' in p.result);
      if (!errors.length && !answers.length) errors.push('No answer given — mark the question TBC or skip it instead');
      if (errors.length) throw new ServiceError(400, 'Answer not recorded', errors);

      // Group fields are recorded as one object at their question field; other fields at their own pointer.
      const records = new Map();
      for (const { spec, result } of answers) {
        if (!spec.root) {
          records.set(spec.pointer, result.value);
          continue;
        }
        const group = records.get(spec.root) ?? {};
        const keys = spec.pointer.slice(spec.root.length + 1).split('/');
        let target = group;
        for (const key of keys.slice(0, -1)) target = target[key] ??= {};
        target[keys.at(-1)] = result.value;
        records.set(spec.root, group);
      }

      const draft = structuredClone(session);
      const src = source ?? (question.audience === 'consultant' ? 'consultant' : 'client');
      for (const [pointer, value] of records) {
        const r = recordAnswer(draft, { pointer, value, question_id, source: src, status, note: note?.trim() || undefined, today: today() });
        if (!r.ok) throw new ServiceError(400, 'Answer not recorded', r.errors);
      }
      await store.save(draft);
      return { ok: true, preview: preview(draft, today()) };
    },

    /** @param {User} user @param {string} client @param {{ question_id: string, as: 'tbc'|'skipped', note?: string }} input */
    async markQuestion(user, client, { question_id, as, note }) {
      const session = await load(user, client);
      const r = markQuestion(session, { question_id, as, note, today: today() });
      if (!r.ok) throw new ServiceError(400, 'Not recorded', r.errors);
      await store.save(session);
      return { ok: true };
    },

    /** @param {User} user @param {string} client @param {{ text: string }} input */
    async addNote(user, client, { text }) {
      const session = await load(user, client);
      const r = addNote(session, { text, today: today() });
      if (!r.ok) throw new ServiceError(400, 'Note not recorded', r.errors);
      await store.save(session);
      return { ok: true };
    },
  };
}
