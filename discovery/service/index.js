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

import { createSession, isAnswered, valuesAt } from '../agents/interview/session.js';
import { describeQuestion, nextQuestions, questionById, unansweredInMode } from '../agents/interview/next.js';
import { openItems } from '../agents/interview/open-items.js';
import { recordAnswer, markQuestion, addNote } from '../agents/interview/answer.js';
import { preview } from '../agents/interview/preview.js';
import { findPersonalData } from '../agents/discovery/input.js';
import { questionBank } from '../schema/index.js';
import { fieldSpecs, normalizeValue, parseField, parseTable } from './fields.js';
import { displayValue } from './summary.js';
import { approachBrief, closingStatus, deckBrief, decideFromSession, finaliseEngagement, needsApproach } from './closing.js';
import { annexWithChapters, selectChapters } from './reference.js';
import { answerSnapshot, answerChanges, redraftPrompt } from './freshness.js';
import { deckErrors } from './deck-template.js';
import { deckToMarkdown } from './pptx.js';

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

/** A STOP engagement has a recorded route (Larger Engagement or no bid). @param {object} doc */
const stopRouteChosen = (doc) => Boolean(doc.delivery?.route);
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
/** Document versions: 1.0 on the first save, then 1.1, 1.2 … @param {string|undefined} previous */
function nextVersion(previous) {
  const [major, minor] = String(previous ?? '').split('.').map(Number);
  return Number.isFinite(major) && Number.isFinite(minor) ? `${major}.${minor + 1}` : '1.0';
}

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
      closing_document_at: session.closing?.document?.saved_at ?? null,
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

  /** State of a question in a session. @param {object} session @param {object} q */
  function questionState(session, q) {
    const commented = session.commented ?? {};
    if (q.id in commented) return { state: 'commented', note: commented[q.id] };
    if (q.maps_to.some((p) => isAnswered(session.answers, p))) {
      const provenance = q.maps_to.map((p) => Object.entries(session.provenance).find(([k]) => k === p || k.startsWith(`${p}/`))?.[1]).find(Boolean);
      return { state: 'answered', note: provenance?.note ?? '', to_confirm: provenance?.status === 'tbc', via: provenance?.via ?? null };
    }
    if (q.id in session.tbc) return { state: 'tbc', note: session.tbc[q.id] };
    if (q.id in session.skipped) return { state: 'skipped', note: session.skipped[q.id] };
    return { state: 'open', note: '' };
  }

  /** Questions of the interview grouped by section, with state and answer in words. @param {object} session @param {{ includeOpen: boolean }} options */
  function reviewSections(session, { includeOpen }) {
    const open = new Set(unansweredInMode(session).map((q) => q.id));
    const sections = new Map();
    for (const q of questionBank.questions) {
      const s = questionState(session, q);
      if (s.state === 'open' && (!includeOpen || !open.has(q.id))) continue;
      const d = describeQuestion(q);
      const value = q.maps_to.map((p) => displayValue(p, valuesAt(session.answers, p)[0])).filter(Boolean).join(' · ');
      if (!sections.has(d.section)) sections.set(d.section, { title: d.section, questions: [] });
      sections.get(d.section).questions.push({ id: q.id, subsection: d.subsection, text: q.text, priority: q.priority, audience: q.audience, value, ...s });
    }
    return [...sections.values()];
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

    /**
     * Every question of the interview by section — answered, TBC, not applicable,
     * clarified by comment or still open — for reviewing and changing answers.
     *
     * @param {User} user @param {string} client
     */
    async reviewQuestions(user, client) {
      const session = await load(user, client);
      return { engagement: summary(session), sections: reviewSections(session, { includeOpen: true }) };
    },

    /**
     * One question with its current values, to change an answer.
     *
     * @param {User} user @param {string} client @param {string} questionId
     */
    async getQuestion(user, client, questionId) {
      const session = await load(user, client);
      const q = questionById(questionId);
      if (!q) throw new ServiceError(404, `${questionId}: unknown question`);
      const described = describeQuestion(q);
      const inputs = fieldSpecs(described);
      return {
        engagement: summary(session),
        question: { ...described, inputs },
        values: Object.fromEntries(inputs.map((i) => [i.pointer, valuesAt(session.answers, i.pointer)[0] ?? null])),
        ...questionState(session, q),
      };
    },

    /** Put a question back in the queue (removes TBC, not applicable or comment-only). @param {User} user @param {string} client @param {{ question_id: string }} input */
    async reopenQuestion(user, client, { question_id }) {
      const session = await load(user, client);
      if (!questionById(question_id)) throw new ServiceError(404, `${question_id}: unknown question`);
      delete session.tbc[question_id];
      delete session.skipped[question_id];
      if (session.commented) delete session.commented[question_id];
      session.updated_at = today();
      await store.save(session);
      return { ok: true };
    },

    /** Remove the recorded answer of a question so it is open again. @param {User} user @param {string} client @param {{ question_id: string }} input */
    async clearAnswer(user, client, { question_id }) {
      const session = await load(user, client);
      const q = questionById(question_id);
      if (!q) throw new ServiceError(404, `${question_id}: unknown question`);
      if (question_id === 'Q10.5.2') throw new ServiceError(400, 'Consent cannot be cleared — record No instead if the client withdrew it');
      for (const pointer of q.maps_to) {
        const keys = pointer.split('/').slice(1);
        let parent = session.answers;
        for (const k of keys.slice(0, -1)) parent = parent?.[k];
        if (parent && typeof parent === 'object') delete parent[keys.at(-1)];
        for (const k of Object.keys(session.provenance)) if (k === pointer || k.startsWith(`${pointer}/`)) delete session.provenance[k];
      }
      delete session.tbc[question_id];
      delete session.skipped[question_id];
      if (session.commented) delete session.commented[question_id];
      session.updated_at = today();
      await store.save(session);
      return { ok: true };
    },

    /**
     * Engagement summary from code (no AI): offer, decision, gates, exit rules,
     * plan, app signals, open items, answers by section, documents and notes.
     *
     * @param {User} user @param {string} client
     */
    async getSummary(user, client) {
      const session = await load(user, client);
      return {
        engagement: summary(session),
        preview: preview(session, today()),
        open_items: openItems(session).map((i) => ({ ...i, question: questionById(i.question_id)?.text ?? null })),
        sections: reviewSections(session, { includeOpen: false }),
        documents: session.documents ?? [],
        notes: session.notes,
        generated_at: today(),
      };
    },

    /**
     * Start the Discovery Closing Document: the engine decides the engagement
     * from the answers; returns what Claude drafts next — the approach, or
     * directly the document when no approach is needed (no bid).
     *
     * @param {User} user @param {string} client
     */
    async prepareClosingDocument(user, client) {
      const session = await load(user, client);
      const decided = decideFromSession(session, today());
      if (!decided.ok) throw new ServiceError(400, 'The answers can’t be turned into an engagement yet', decided.errors);
      const { doc } = decided;
      const status = closingStatus(doc);
      if (!doc.delivery.go && !stopRouteChosen(doc)) {
        throw new ServiceError(409, 'Discovery hit a STOP: record how Merkle proceeds (Q10.5.5 — Larger Engagement or no bid) before the closing document', doc.exits.items.filter((i) => i.result === 'STOP').map((i) => `${i.rule_id}: ${i.evidence}`));
      }
      if (needsApproach(doc)) return { status, step: 'approach', ...approachBrief(doc) };
      const final = finaliseEngagement(doc, null);
      if (!final.ok) throw new ServiceError(400, 'Engagement not valid', final.errors);
      return { status, step: 'document', ...deckBrief(final.engagement) };
    },

    /**
     * Save the implementation approach Claude drafted (validated against the
     * approach schema and the engagement); returns the deck data and prompt.
     *
     * @param {User} user @param {string} client @param {object} approach
     * @param {{ via?: Channel }} [options]
     */
    async saveApproach(user, client, approach, { via = 'claude' } = {}) {
      const session = await load(user, client);
      const decided = decideFromSession(session, today());
      if (!decided.ok) throw new ServiceError(400, 'The answers can’t be turned into an engagement yet', decided.errors);
      const final = finaliseEngagement(decided.doc, approach);
      if (!final.ok) throw new ServiceError(400, 'Approach not saved', final.errors);
      session.closing = { ...session.closing, approach: { payload: approach, saved_at: today(), by: user.login, via } };
      session.updated_at = today();
      await store.save(session);
      return { status: closingStatus(decided.doc), step: 'document', ...deckBrief(final.engagement) };
    },

    /**
     * Save the Discovery Closing Document: the deck narrative (`markdown`, what the
     * Lead Consultant presents) and optionally the annex (`annex`, the detailed
     * analysis, reference chapters and bibliography). The previous version is kept.
     *
     * @param {User} user @param {string} client @param {{ markdown: string, annex?: string }} input
     * @param {{ via?: Channel }} [options]
     */
    async saveClosingDocument(user, client, { deck, annex, markdown }, { via = 'claude' } = {}) {
      const session = await load(user, client);
      const annexText = String(annex ?? '').trim();
      let text = String(markdown ?? '').trim();
      if (deck) {
        const problems = deckErrors(deck);
        if (problems.length) throw new ServiceError(400, 'Deck not saved', problems);
        text = deckToMarkdown(deck);
      } else if (text.length < 500) {
        throw new ServiceError(400, 'Nothing to save — fill the deck templates (deck) or send the document as markdown');
      }
      if (annexText && annexText.length < 500) throw new ServiceError(400, 'The annex is too short — write the analysis, or leave it out');
      const personal = findPersonalData(`${text}\n${annexText}`);
      if (personal.length) throw new ServiceError(400, 'Document not saved', [`the document ${personal.join(' and ')} — remove personal data`]);
      const previous = session.closing?.document;
      const version = nextVersion(previous?.version);
      session.closing = {
        ...session.closing,
        document: { markdown: `${text}
`, ...(deck ? { deck } : {}), ...(annexText ? { annex: `${annexText}\n` } : {}), version, saved_at: today(), by: user.login, via, answers: answerSnapshot(session) },
        history: [...(previous ? [{ version: previous.version ?? '1.0', saved_at: previous.saved_at, by: previous.by, via: previous.via, markdown: previous.markdown, ...(previous.deck ? { deck: previous.deck } : {}), ...(previous.annex ? { annex: previous.annex } : {}) }] : []), ...(session.closing?.history ?? [])].slice(0, 5),
      };
      session.updated_at = today();
      await store.save(session);
      return { ok: true, saved_at: today(), version, annex: Boolean(annexText), versions: 1 + session.closing.history.length };
    },

    /**
     * Everything needed to build a download: the deck Claude filled, the annex
     * with the reference chapters appended, and the version for the file name.
     *
     * @param {User} user @param {string} client
     */
    async getClosingDownloads(user, client) {
      const session = await load(user, client);
      const doc = session.closing?.document;
      if (!doc) return null;
      const decided = decideFromSession(session, today());
      const engagement = decided.ok ? decided.doc : {};
      return {
        version: doc.version ?? '1.0',
        saved_at: doc.saved_at,
        deck: doc.deck ?? null,
        markdown: doc.markdown,
        annex: doc.annex ? annexWithChapters(doc.annex, engagement) : null,
      };
    },

    /**
     * The annex document with Merkle's verified Shopify reference chapters for
     * this engagement appended (the chapters are not stored per engagement).
     *
     * @param {User} user @param {string} client
     */
    async getClosingAnnex(user, client) {
      const session = await load(user, client);
      const annex = session.closing?.document?.annex;
      if (!annex) return null;
      const decided = decideFromSession(session, today());
      const doc = decided.ok ? decided.doc : {};
      return { markdown: annexWithChapters(annex, doc), chapters: selectChapters(doc).map((c) => ({ slug: c.slug, title: c.title, verified: c.verified })) };
    },

    /** The saved closing document, its approach status and whether it still matches the answers. @param {User} user @param {string} client */
    async getClosingDocument(user, client) {
      const session = await load(user, client);
      const describe = (pointer) => {
        const p = session.provenance[pointer];
        return { question_id: p?.question_id ?? null, question: p?.question_id ? questionById(p.question_id)?.text ?? null : null };
      };
      const freshness = session.closing?.document
        ? answerChanges(session.closing.document.answers, session, describe)
        : { known: false, up_to_date: true, changes: [] };
      const doc = session.closing?.document;
      return {
        freshness: { ...freshness, redraft_prompt: redraftPrompt(client, freshness.changes) },
        version: doc?.version ?? (doc ? '1.0' : null),
        engagement: summary(session),
        approach: session.closing?.approach ? { saved_at: session.closing.approach.saved_at, by: session.closing.approach.by, via: session.closing.approach.via } : null,
        document: session.closing?.document ?? null,
        history: (session.closing?.history ?? []).map(({ saved_at, by, via, version }) => ({ saved_at, by, via, version: version ?? '1.0' })),
      };
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
