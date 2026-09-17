/**
 * @file index.js
 * @description Discovery service (ADR 0014, 0015): the operations the Lead
 * Consultant web app and the Claude connector share — the shared memory of an
 * engagement. It wraps the 1.0.0 interview engine unchanged — code decides
 * offer, rules and validation — and adds storage, access control, provenance
 * (who recorded an answer, through which channel, from which document), a
 * review step for answers extracted from documents, and a document register.
 * Storage is an adapter (files locally, Postgres when hosted).
 *
 * @module discovery/service
 */

import { createSession, valuesAt } from '../agents/interview/session.js';
import { nextQuestions, questionById } from '../agents/interview/next.js';
import { recordAnswer, markQuestion, addNote } from '../agents/interview/answer.js';
import { preview } from '../agents/interview/preview.js';
import { findPersonalData } from '../agents/discovery/input.js';
import { questionBank } from '../schema/index.js';
import { fieldSpecs, normalizeValue, parseField, parseTable } from './fields.js';

/**
 * @typedef {object} InterviewStore
 * @property {() => Promise<object[]>} list
 * @property {(client: string) => Promise<object|null>} get
 * @property {(session: object) => Promise<void>} create
 * @property {(session: object) => Promise<void>} save
 */

/** @typedef {{ login: string, role: 'owner'|'consultant' }} User */
/** @typedef {'web'|'claude'|'cli'} Channel */
/** @typedef {{ document: string, location?: string, quote?: string }} Evidence */

export class ServiceError extends Error {
  /** @param {number} status @param {string} message @param {string[]} [errors] */
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const isoToday = () => new Date().toISOString().slice(0, 10);
const QUOTE_MAX = 300;

/**
 * Owners see every engagement; consultants only their own. Sessions created
 * before 2.0.0 (CLI, no owner) are visible to owners only.
 *
 * @param {User} user @param {object} session
 */
export const canAccess = (user, session) => user?.role === 'owner' || (Boolean(session.owner) && session.owner === user?.login);

/**
 * Users allowed to sign in, from comma-separated GitHub logins. Consultants
 * `*` opens sign-in to every GitHub account as consultant (owner decision,
 * 2026-09-17); owners are always listed by name.
 *
 * @param {string} login
 * @param {{ owners?: string, consultants?: string }} allowlist
 * @returns {User|null}
 */
export function userFor(login, { owners = '', consultants = '' }) {
  const split = (s) => s.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  const name = String(login ?? '').toLowerCase();
  if (!name || !/^[a-z0-9-]+$/.test(name)) return null;
  if (split(owners).includes(name)) return { login: name, role: 'owner' };
  if (isOpenSignIn({ consultants }) || split(consultants).includes(name)) return { login: name, role: 'consultant' };
  return null;
}

/** Sign-in open to every GitHub account (consultants "*"). @param {{ consultants?: string }} allowlist */
export const isOpenSignIn = ({ consultants = '' }) => consultants.split(',').map((x) => x.trim()).includes('*');

/**
 * Citation kept with an answer taken from a document.
 *
 * @param {Evidence} evidence
 */
export function citation({ document, location, quote }) {
  const q = quote?.trim() ? ` “${quote.trim().slice(0, QUOTE_MAX)}${quote.trim().length > QUOTE_MAX ? '…' : ''}”` : '';
  return `Source: ${document.trim()}${location?.trim() ? `, ${location.trim()}` : ''}${q}`;
}

/**
 * @param {{ store: InterviewStore, today?: () => string, visibility?: 'own'|'all' }} options
 *   visibility: 'own' (consultants see their own engagements, owners all) or
 *   'all' (every signed-in user sees and works on every engagement).
 */
export function createDiscoveryService({ store, today = isoToday, visibility = 'own' }) {
  /** @param {User} user @param {object} session */
  const allowed = (user, session) => Boolean(user) && (visibility === 'all' || canAccess(user, session));

  /** @param {User} user @param {string} client */
  async function load(user, client) {
    if (!user) throw new ServiceError(401, 'Sign in first');
    const session = await store.get(client);
    if (!session) throw new ServiceError(404, `No interview for ${client}`);
    if (!allowed(user, session)) throw new ServiceError(403, `No access to ${client}`);
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
      to_review: Object.values(session.provenance).filter((p) => p.status === 'tbc').length,
    };
  }

  /**
   * Apply the answers to one question on a draft session, all or nothing.
   *
   * @param {object} draft
   * @param {object} question
   * @param {Map<string, unknown>} records  pointer → value
   * @param {{ user: User, via: Channel, source?: string, status?: string, note?: string }} meta
   */
  function applyAnswers(draft, question, records, { user, via, source, status = 'confirmed', note }) {
    const src = source ?? (question.audience === 'consultant' ? 'consultant' : 'client');
    for (const [pointer, raw] of records) {
      const { value, errors } = normalizeValue(pointer, raw);
      if (errors.length) throw new ServiceError(400, `${question.id}: answer not recorded`, errors);
      const r = recordAnswer(draft, { pointer, value, question_id: question.id, source: src, status, note: note?.trim() || undefined, today: today() });
      if (!r.ok) throw new ServiceError(400, `${question.id}: answer not recorded`, r.errors);
      // Channel and author stay in the session only (the engagement contract keeps source, status and note).
      draft.provenance[pointer] = { ...draft.provenance[pointer], via, by: user.login, at: today() };
    }
  }

  return {
    /** @param {User} user */
    async listEngagements(user) {
      if (!user) throw new ServiceError(401, 'Sign in first');
      const sessions = (await store.list()).filter((s) => allowed(user, s));
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
      session.documents = [];
      // Same message whether or not the owner can see it: slugs of other consultants' clients are not revealed.
      if (await store.get(session.client)) throw new ServiceError(409, `The client slug ${session.client} is not available — choose another one`);
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
        commented: session.commented ?? {},
        documents: session.documents ?? [],
      };
    },

    /**
     * Record the answer to one question from web form values; all fields of the
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
      const parsed = specs.map((spec) => ({ spec, result: spec.kind === 'table' ? parseTable(spec, values) : parseField(spec, values[spec.pointer] ?? []) }));
      const errors = parsed.filter((p) => p.result && 'error' in p.result).map((p) => p.result.error);
      const answers = parsed.filter((p) => p.result && 'value' in p.result);
      if (!errors.length && !answers.length) {
        // A comment alone is a valid answer: the question counts as clarified and the comment stays an open item.
        if (note?.trim()) {
          const r = markQuestion(session, { question_id, as: 'commented', note, today: today() });
          if (!r.ok) throw new ServiceError(400, 'Comment not recorded', r.errors);
          await store.save(session);
          return { ok: true, commented: true, preview: preview(session, today()) };
        }
        errors.push('Give an answer, or write a comment that answers or clarifies the question');
      }
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
      applyAnswers(draft, question, records, { user, via: 'web', source, status, note });
      await store.save(draft);
      return { ok: true, preview: preview(draft, today()) };
    },

    /**
     * Record answers from Claude (typed JSON values). Each question is applied
     * all or nothing; answers taken from a document carry a citation and stay
     * "to confirm" until the Lead Consultant confirms them (ADR 0015).
     *
     * @param {User} user @param {string} client
     * @param {{ question_id: string, values: Record<string, unknown>, source?: string, status?: string, note?: string, evidence?: Evidence }[]} items
     * @param {{ via?: Channel }} [options]
     */
    async recordAnswers(user, client, items, { via = 'claude' } = {}) {
      const session = await load(user, client);
      let draft = structuredClone(session);
      const results = [];
      for (const item of items) {
        const question = questionById(item.question_id);
        if (!question) {
          results.push({ question_id: item.question_id, ok: false, errors: [`${item.question_id}: unknown question`] });
          continue;
        }
        const entries = Object.entries(item.values ?? {});
        if (!entries.length) {
          results.push({ question_id: question.id, ok: false, errors: ['No values given'] });
          continue;
        }
        const fromDocument = Boolean(item.evidence?.document?.trim());
        const note = [fromDocument ? citation(item.evidence) : '', item.note?.trim() ?? ''].filter(Boolean).join(' — ');
        const attempt = structuredClone(draft);
        try {
          applyAnswers(attempt, question, new Map(entries), {
            user, via, note,
            source: item.source ?? (fromDocument ? 'client' : undefined),
            status: fromDocument ? 'tbc' : item.status ?? 'confirmed',
          });
          draft = attempt;
          results.push({ question_id: question.id, ok: true, status: fromDocument ? 'tbc' : item.status ?? 'confirmed' });
        } catch (err) {
          if (!(err instanceof ServiceError)) throw err;
          results.push({ question_id: question.id, ok: false, errors: err.errors.length ? err.errors : [err.message] });
        }
      }
      if (results.some((r) => r.ok)) await store.save(draft);
      return { results, preview: preview(draft, today()) };
    },

    /**
     * Recorded answers with provenance, for review. Answers "to confirm" first.
     *
     * @param {User} user @param {string} client
     */
    async listAnswers(user, client) {
      const session = await load(user, client);
      return Object.entries(session.provenance)
        .map(([pointer, p]) => ({
          pointer,
          question_id: p.question_id ?? null,
          question: p.question_id ? questionById(p.question_id)?.text ?? null : null,
          value: valuesAt(session.answers, pointer)[0] ?? null,
          source: p.source,
          status: p.status,
          via: p.via ?? 'cli',
          by: p.by ?? null,
          at: p.at ?? null,
          note: p.note ?? '',
        }))
        .sort((a, b) => (a.status === 'tbc' ? 0 : 1) - (b.status === 'tbc' ? 0 : 1) || (a.question_id ?? '').localeCompare(b.question_id ?? '', undefined, { numeric: true }));
    },

    /**
     * Confirm an answer recorded "to confirm" (e.g. extracted from a document).
     *
     * @param {User} user @param {string} client @param {{ pointer: string }} input
     */
    async confirmAnswer(user, client, { pointer }) {
      const session = await load(user, client);
      const p = session.provenance[pointer];
      if (!p) throw new ServiceError(404, `No answer recorded at ${pointer}`);
      session.provenance[pointer] = { ...p, status: 'confirmed', confirmed_by: user.login, confirmed_at: today() };
      session.updated_at = today();
      await store.save(session);
      return { ok: true };
    },

    /** @param {User} user @param {string} client @param {{ question_id: string, as: 'tbc'|'skipped'|'commented', note?: string }} input */
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

    /**
     * Register a document used in the discovery (the file itself stays in the
     * Claude Project — ADR 0015).
     *
     * @param {User} user @param {string} client
     * @param {{ name: string, type?: string, date?: string, summary?: string }} input
     * @param {{ via?: Channel }} [options]
     */
    async registerDocument(user, client, { name, type = 'other', date, summary: about = '' }, { via = 'claude' } = {}) {
      const session = await load(user, client);
      if (!name?.trim()) throw new ServiceError(400, 'Document name required');
      const personal = findPersonalData(`${name} ${about}`);
      if (personal.length) throw new ServiceError(400, 'Document not registered', [`document details ${personal.join(' and ')} — do not record personal data`]);
      const documents = session.documents ?? [];
      const entry = { name: name.trim(), type, ...(date ? { date } : {}), summary: about.trim(), added_by: user.login, via, added_at: today() };
      const i = documents.findIndex((d) => d.name === entry.name);
      if (i >= 0) documents[i] = entry;
      else documents.push(entry);
      session.documents = documents;
      session.updated_at = today();
      await store.save(session);
      return { ok: true, documents };
    },

    /**
     * Questions matching a topic (for mapping a document to the question bank),
     * with whether each is already answered, TBC or skipped.
     *
     * @param {User} user @param {string} client @param {{ query: string, limit?: number }} input
     */
    async findQuestions(user, client, { query, limit = 15 }) {
      const session = await load(user, client);
      const terms = String(query ?? '').toLowerCase().split(/\W+/).filter((t) => t.length > 2);
      if (!terms.length) throw new ServiceError(400, 'Give at least one search term of three or more letters');
      const scored = questionBank.questions
        .map((q) => {
          const text = `${q.id} ${q.text} ${q.help ?? ''} ${q.maps_to.join(' ')}`.toLowerCase();
          return { q, score: terms.filter((t) => text.includes(t)).length };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(limit, 50));
      return scored.map(({ q }) => {
        const answered = q.maps_to.some((m) => valuesAt(session.answers, m).length > 0);
        const state = answered ? 'answered' : q.id in session.tbc ? 'tbc' : q.id in session.skipped ? 'skipped' : 'open';
        return { id: q.id, text: q.text, help: q.help ?? null, answer_type: q.answer_type, fields: q.maps_to, inputs: fieldSpecs({ fields: q.maps_to, answer_type: q.answer_type }), state };
      });
    },
  };
}
