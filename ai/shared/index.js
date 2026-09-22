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
 * One file, not one per operation: every export here is a thin access-control
 * and validation wrapper around the same `session` — splitting it by concern
 * (interview, closing document, clarifications) would mean either passing
 * that session across module boundaries or re-deriving it, for no reader
 * benefit, since every operation is reached through `createDiscoveryService`
 * regardless. Individual functions stay small; this file is long because the
 * service surface is.
 *
 * @module ai/shared/index
 */

import { createSession, isAnswered, valuesAt } from '../engagement/session.js';
import { describeQuestion, nextQuestions, questionById, unansweredInMode } from '../engagement/next.js';
import { openItems } from '../engagement/open-items.js';
import { recordAnswer, markQuestion, addNote } from '../engagement/answer.js';
import { preview } from '../engagement/preview.js';
import { findPersonalData } from '../engine/input.js';
import { questionBank, questionForPointer } from '../schema/index.js';
import { fieldSpecs, normalizeValue, parseField, parseTable } from './fields.js';
import { quote, displayValue } from './summary.js';
import { approachBrief, closingStatus, deckBrief, deckDataPages, decideFromSession, finaliseEngagement, needsApproach, referencePiece } from './closing.js';
import { annexWithChapters, selectChapters } from './reference.js';
import { answerSnapshot, answerChanges, redraftPrompt } from './freshness.js';
import { deckErrors } from './deck-template.js';
import { findLeaks } from '../discovery-deck/build.js';
import { clarificationBrief, clarificationTopics, clarificationsPrompt } from '../bid/clarifications.js';
import { processOf, processMeta, PROCESS_IDS } from './process.js';
import { whatMoved } from './moved.js';
import { handoverView, handoverFile, backlogBlocked } from './handover.js';
import { statedAssumptions, triage, clarificationsFreshness, repliesReceived, replyPrompt, shapeChangingIds, changesShape } from './assumptions.js';
import { goNoGoView } from './go-no-go.js';
import { readiness, openPoints, technicalAnswer } from './readiness.js';
import { record as recordOutcomeEntry, ledger, OUTCOME_IDS } from './outcome.js';
import { coverage, LANGUAGES, supportedLanguage, translateHeading, translateQuestion, translateQuestions, translateRows, writtenIn } from './i18n.js';
import { deckToMarkdown } from './pptx.js';

/**
 * @typedef {object} InterviewStore
 * @property {() => Promise<object[]>} list
 * @property {(client: string) => Promise<object|null>} get
 * @property {(session: object) => Promise<void>} create
 * @property {(session: object) => Promise<void>} save
 * @property {(client: string) => Promise<void>} remove
 */

/** @typedef {{ login: string, role: 'owner'|'consultant' }} User */
/** @typedef {'web'|'claude'|'cli'} Channel */
/** @typedef {{ document: string, location?: string, quote?: string }} Evidence */

export { ServiceError } from './errors.js';
import { ServiceError } from './errors.js';

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

/**
 * Validation errors name a schema pointer; a consultant needs the question. Turns
 * "/meta/client must have required property 'name'" into "open Q1.1.1".
 *
 * @param {string[]} errors
 */
function blockersFromErrors(errors) {
  const seen = new Set();
  const out = [];
  for (const error of errors) {
    const pointer = /(\/[a-z_]+(?:\/[a-z_0-9*]+)*)/i.exec(String(error))?.[1];
    const missing = /required property '([^']+)'/.exec(String(error))?.[1];
    const q = questionForPointer(missing && pointer ? `${pointer}/${missing}` : pointer);
    const key = q?.id ?? error;
    if (seen.has(key)) continue;
    seen.add(key);
    // The schema's own sentence — "/meta/client must have required property
    // 'name'" — is where the validator stopped, not where the consultant has to
    // go. Where the pointer resolves to a question, the question is the whole
    // message; where it does not, the raw text is all we have, so it is shown
    // under a sentence a reader can act on rather than as the message itself.
    out.push(q
      ? { question_id: q.id, what: q.text, why: null }
      : { what: 'Something the engine needs has not been recorded', why: error });
  }
  return out;
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
  /**
   * What each document actually produced.
   *
   * "RFP.pdf · rfp" tells a consultant nothing about whether reading it was
   * worth anything. The count comes from the citation kept with each answer,
   * which begins "Source: <document>" — the document is not stored as its own
   * field on the answer, so this is a match on that prefix rather than a join.
   *
   * @param {object} session
   */
  function documentYield(session) {
    const entries = Object.values(session.provenance ?? {});
    return (session.documents ?? []).map((d) => {
      // Exactly this document. `startsWith` let "RFP.pdf" absorb every answer
      // cited to "RFP.pdf annex", and nothing on the page could show it.
      const from = entries.filter((p) => typeof p.note === 'string'
        && (p.note === `Source: ${d.name}` || p.note.startsWith(`Source: ${d.name},`) || p.note.startsWith(`Source: ${d.name} “`) || p.note.startsWith(`Source: ${d.name} —`)));
      const sections = new Set(from.map((p) => String(p.question_id ?? '').replace(/^Q/, '').split('.')[0]).filter(Boolean));
      return { ...d, answers: from.length, sections: sections.size, to_confirm: from.filter((p) => p.status === 'tbc').length };
    });
  }

  /**
   * The assumptions a proposal will state because the Lead Consultant decided a
   * question was not worth asking. Computed here so every path into the deck
   * carries them — they were built for the screen and travelled nowhere else,
   * so a proposal stated none of them while the app promised that it would.
   *
   * @param {object} session @param {object} doc  decided engagement
   */
  const statedFor = (session, doc) => statedAssumptions(doc, session.closing?.clarifications ?? null);

  /** The outcome record for a session, with the engine's position frozen into it. */
  function outcomeFor(session, input, meta) {
    const decided = decideFromSession(session, today());
    const p = decided.ok ? preview(session, today()) : null;
    return recordOutcomeEntry(session, input, {
      ...meta,
      offer: p ? { code: p.offer?.code, go: p.go, route: p.route } : null,
      position: decided.ok
        ? { assumptions: statedFor(session, decided.doc).length, decisions_settled: readiness(decided.doc, { provenance: session.provenance }).decisions.settled }
        : null,
    });
  }

  function summary(session) {
    const p = preview(session, today());
    return {
      // The trading name, collected at Q1.1.1 and never shown: every page of a
      // record was headed by its URL slug.
      client_name: session.answers?.meta?.client?.name ?? null,
      client: session.client,
      language: session.language,
      mode: session.mode,
      process: processOf(session.process),
      won: session.won ?? null,
      outcome: session.outcome?.current ?? null,
      owner: session.owner ?? null,
      started_at: session.started_at,
      updated_at: session.updated_at,
      offer: p.offer,
      go: p.go,
      route: p.route ?? null,
      coverage: p.coverage,
      // Questions, not pointers — and the same questions Review lists, not a
      // second walk over the provenance. Counting the provenance said 91 where
      // Review's own rows said 90: an entry marked tbc whose question no longer
      // reads as answered counts in one and not the other. Review is where the
      // work is done, so Review's rows are the unit everything else reports.
      to_review: awaitingConfirmation(session),
      // What the step spine reads. It renders on every page, so the counts travel
      // with the engagement rather than costing each page another call.
      documents: (session.documents ?? []).length,
      clarifications_at: session.closing?.clarifications?.saved_at ?? null,
      // Saved is not decided. The ribbon marked the step done when Claude saved,
      // while the proposal refused to run until every question was triaged — the
      // spine said finished and the next step said blocked.
      clarifications_undecided: (session.closing?.clarifications?.questions ?? []).filter((q) => (q.status ?? 'proposed') === 'proposed').length,
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

  /**
   * Questions waiting on a human to accept what was extracted — the rows Review
   * shows under "to confirm", counted once here so the spine, the status and the
   * page cannot disagree.
   *
   * @param {object} session
   * @returns {number}
   */
  function awaitingConfirmation(session) {
    let n = 0;
    for (const q of questionBank.questions) if (questionState(session, q).to_confirm) n += 1;
    return n;
  }

  /** State of a question in a session. @param {object} session @param {object} q */
  function questionState(session, q) {
    const commented = session.commented ?? {};
    if (q.id in commented) return { state: 'commented', note: commented[q.id] };
    if (q.maps_to.some((p) => isAnswered(session.answers, p))) {
      // Every pointer the question fills, not the first one that happens to have
      // provenance. Fifteen questions fill two or three fields, and reading the
      // row's state off one of them made a question with one field confirmed and
      // two waiting render as "Answered", with no Confirm button, hidden from the
      // to-confirm filter and out of the bulk card — while the counter that feeds
      // the spine kept counting the two. Nothing on any screen named the
      // question, and nothing could clear it.
      const entries = q.maps_to.flatMap((p) => Object.entries(session.provenance)
        .filter(([k]) => k === p || k.startsWith(`${p}/`))
        .map(([, v]) => v));
      const first = entries.find(Boolean);
      return {
        state: 'answered',
        note: first?.note ?? '',
        to_confirm: entries.some((e) => e?.status === 'tbc'),
        via: first?.via ?? null,
      };
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

    /**
     * Delete an engagement and everything recorded in it: answers, documents,
     * notes, the approach and every version of the closing document. There is no
     * undo, so the caller must send the client slug back as confirmation.
     *
     * @param {User} user @param {string} client @param {{ confirm?: string }} input
     */
    async deleteEngagement(user, client, { confirm } = {}) {
      const session = await load(user, client);
      if (user.role !== 'owner' && session.owner && session.owner !== user.login) {
        throw new ServiceError(403, 'Only the consultant who owns this engagement, or an owner, can delete it');
      }
      if (String(confirm ?? '').trim() !== session.client) {
        throw new ServiceError(400, `Type the client slug ${session.client} to confirm the deletion`);
      }
      await store.remove(session.client);
      return { ok: true, client: session.client, deleted: true };
    },

    /** @param {User} user @param {{ client: string, language?: string, mode?: string }} input */
    async startInterview(user, { client, language, mode, process }) {
      if (!user) throw new ServiceError(401, 'Sign in first');
      let session;
      try {
        session = createSession({ client, language, mode, process: processOf(process), today: today() });
      } catch (err) {
        throw new ServiceError(400, err.message);
      }
      session.owner = user.login;
      session.documents = [];
      // Same message whether or not the owner can see it: slugs of other consultants' clients are not revealed.
      if (await store.get(session.client)) {
        throw new ServiceError(409, `You already have a record called ${session.client}`, [], [{
          question_id: null,
          what: `Open ${session.client}`,
          why: 'Names are how records are addressed, so two cannot share one. Open the one that exists, or start this under another name.',
          href: `/engagements/${session.client}`,
        }]);
      }
      await store.create(session);
      return { client: session.client };
    },

    /** @param {User} user @param {string} client @param {{ limit?: number }} [options] */
    async getInterview(user, client, { limit = 3, section = null } = {}) {
      const session = await load(user, client);
      const next = nextQuestions(session, { limit, section });
      return {
        engagement: summary(session),
        language: coverage(session.language),
        next: { ...next, questions: translateQuestions(next.questions, session.language).map((q) => ({ ...q, inputs: fieldSpecs(q) })) },
        preview: preview(session, today()),
        notes: session.notes,
        document_yield: documentYield(session),
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

      const before = preview(session, today());
      const draft = structuredClone(session);
      applyAnswers(draft, question, records, { user, via: 'web', source, status, note });
      await store.save(draft);
      // In the words it was stored as, so the page can say it back. Recording an
      // answer made the card disappear and said nothing, which made a mis-click
      // on a select invisible until somebody found it in Review.
      const stored = reviewSections(draft, { includeOpen: false })
        .flatMap((sec) => sec.questions)
        .find((q) => q.id === question.id);
      const after = preview(draft, today());
      return {
        ok: true,
        preview: after,
        recorded: stored ? { id: stored.id, value: stored.value, state: stored.state } : null,
        // What this answer changed — said once, where the consultant is looking,
        // instead of left for them to notice in a column nobody watches.
        moved: whatMoved(before, after),
      };
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
     * By pointer for a single field, or by question id for a whole row of the
     * review table — one question can fill several fields, and a consultant
     * reading a row has confirmed the row, not one of its pointers.
     *
     * @param {User} user @param {string} client
     * @param {{ pointer?: string, question_id?: string }} input
     */
    async confirmAnswer(user, client, { pointer, question_id }) {
      const session = await load(user, client);
      const mark = (key) => {
        session.provenance[key] = { ...session.provenance[key], status: 'confirmed', confirmed_by: user.login, confirmed_at: today() };
      };
      let confirmed = 0;
      if (question_id) {
        for (const [key, p] of Object.entries(session.provenance)) {
          if (p.question_id === question_id && p.status === 'tbc') { mark(key); confirmed += 1; }
        }
        if (!confirmed) throw new ServiceError(404, `Nothing waiting for confirmation on ${question_id}`);
      } else {
        if (!session.provenance[pointer]) throw new ServiceError(404, `No answer recorded at ${pointer}`);
        mark(pointer);
        confirmed = 1;
      }
      session.updated_at = today();
      await store.save(session);
      return { ok: true, confirmed };
    },

    /**
     * Confirm every answer that is waiting, in one go.
     *
     * Forty-six confirmations one at a time is not a review, it is a reason to
     * skip reviewing — so this exists. But it records that it happened: an answer
     * confirmed in bulk is marked as such, because months later "did a human check
     * this?" is a real question, and "yes, all forty-six in one click" is a
     * different answer from "yes, one by one". The citation on each answer is what
     * makes the bulk confirmation defensible; hiding how it was done would not.
     *
     * @param {User} user @param {string} client
     */
    async confirmAllAnswers(user, client) {
      const session = await load(user, client);
      const waiting = Object.entries(session.provenance).filter(([, p]) => p.status === 'tbc');
      if (!waiting.length) throw new ServiceError(409, 'Nothing is waiting for confirmation');
      for (const [pointer, p] of waiting) {
        session.provenance[pointer] = {
          ...p,
          status: 'confirmed',
          confirmed_by: user.login,
          confirmed_at: today(),
          confirmed_in_bulk: true,
        };
      }
      session.updated_at = today();
      await store.save(session);
      return { ok: true, confirmed: new Set(waiting.map(([, p]) => p.question_id).filter(Boolean)).size };
    },

    /**
     * Every question of the interview by section — answered, TBC, not applicable,
     * clarified by comment or still open — for reviewing and changing answers.
     *
     * @param {User} user @param {string} client
     */
    async reviewQuestions(user, client) {
      const session = await load(user, client);
      const sections = reviewSections(session, { includeOpen: true }).map((section) => ({
        ...section,
        title: translateHeading(section.title, session.language),
        questions: translateRows(section.questions, session.language)
          .map((q) => ({ ...q, subsection: translateHeading(q.subsection, session.language, 'subsections') })),
      }));
      return { engagement: summary(session), language: coverage(session.language), sections };
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
      const described = translateQuestion(describeQuestion(q), session.language);
      const inputs = fieldSpecs(described);
      return {
        engagement: summary(session),
        language: coverage(session.language),
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
    async getSummary(user, client, { pricing = user.role === 'owner' } = {}) {
      const session = await load(user, client);
      const decided = decideFromSession(session, today());
      const saved = session.closing?.clarifications ?? null;
      const brief = decided.ok ? clarificationBrief(decided.doc) : { topics: [], cannot_price_until_answered: [] };
      return {
        engagement: summary(session),
        preview: preview(session, today()),
        // What is left before this can be priced, and what each gap costs. Not
        // the same question step 3 answers: that one is a position taken once in
        // a room, this is a work state re-answered on every upload.
        readiness: decided.ok
          ? readiness(decided.doc, {
            process: processOf(session.process),
            provenance: session.provenance,
            toReview: summary(session).to_review,
            triage: triage(saved),
            openTopics: brief.topics,
            cannotPrice: brief.cannot_price_until_answered,
            assumptions: statedAssumptions(decided.doc, saved),
            documents: documentYield(session),
          })
          : null,
        // When the engine cannot weigh the answers yet, what is missing — named
        // and linked, as every other blocked page in the app now does.
        blocked: decided.ok ? null : { errors: decided.errors, blockers: blockersFromErrors(decided.errors) },
        // What the engine quoted, and the arithmetic behind it. The page has
        // warned that it carries the price band since long before it did.
        quote: decided.ok
          ? quote(decided.doc, { pricing, provisional: preview(session, today()).offer.provisional === true })
          : null,
        // What the offer owes the client whatever its commercial shape: what it
        // would be built on, and which plan the requirements force.
        technical: decided.ok ? technicalAnswer(decided.doc) : null,
        open_items: openItems(session).map((i) => ({ ...i, question: questionById(i.question_id)?.text ?? null })),
        // What is open, grouped by what it costs rather than by where it came from.
        open_points: decided.ok ? openPoints(brief.topics, statedAssumptions(decided.doc, saved), brief.cannot_price_until_answered) : { blocks_a_price: [], priced_on_an_assumption: [] },
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
      if (!decided.ok) {
        throw new ServiceError(400, 'Some answers are still missing', decided.errors, blockersFromErrors(decided.errors));
      }
      const { doc } = decided;
      const status = closingStatus(doc);
      if (!doc.delivery.go && !stopRouteChosen(doc)) {
        const stops = doc.exits.items.filter((i) => i.result === 'STOP');
        throw new ServiceError(
          409,
          'This engagement is beyond the standard offers, so the next step is a decision rather than a document',
          stops.map((i) => `${i.rule_id}: ${i.evidence}`),
          [{
            question_id: 'Q10.5.5',
            what: 'Record how Merkle proceeds',
            why: `The requirements go beyond the S/M/L offers (${stops.map((i) => i.evidence).join('; ')}). Nothing stops here: either Merkle proposes a Larger Engagement — an Enterprise Engagement opening with a full, consultant-led Discovery Phase, with the client deck produced and shared as usual but no Jira backlog, because that is defined during the Discovery Phase — or Merkle does not bid. The document is written differently for each, which is why it waits for this answer.`,
          }],
        );
      }
      const document = processMeta(session.process).document;

      // A bid does not get written while questions are still waiting on a human.
      // Every one of them is either asked or assumed — that is the rule the whole
      // Q&A step rests on — and a proposal drafted mid-triage states neither: the
      // undecided ones are silently absent from the questions and from the
      // assumptions, which is the outcome the step exists to prevent.
      const undecided = (session.closing?.clarifications?.questions ?? []).filter((q) => (q.status ?? 'proposed') === 'proposed');
      if (processOf(session.process) === 'rfp' && undecided.length) {
        throw new ServiceError(
          409,
          `${undecided.length} question${undecided.length === 1 ? ' is' : 's are'} still waiting on you`,
          undecided.map((q) => q.question),
          [{
            what: 'Decide each question in RFP Q&A — ask it, or state it as an assumption',
            why: 'Anything left undecided reaches the client as neither: it is not in the questions you send and it is not in the assumptions the proposal states. Deciding takes one click each, and rejecting is a decision, not a gap.',
          }],
        );
      }

      if (needsApproach(doc)) return { status, step: 'approach', document, ...approachBrief(doc) };
      const final = finaliseEngagement(doc, null);
      if (!final.ok) throw new ServiceError(400, 'Engagement not valid', final.errors);
      return { status, step: 'document', document, ...deckBrief(final.engagement, { assumptions: statedFor(session, decided.doc), process: session.process, language: session.language }) };
    },

    /**
     * The questions Merkle sends back after reading an RFP. The engine chooses the
     * topics — the unknowns that move the offer, the plan, the topology, the cost
     * or the risk — and Claude writes the few questions from them.
     *
     * @param {User} user @param {string} client
     */
    async prepareClarifications(user, client) {
      const session = await load(user, client);
      const decided = decideFromSession(session, today());
      if (!decided.ok) throw new ServiceError(400, 'Some answers are still missing', decided.errors, blockersFromErrors(decided.errors));
      const brief = clarificationBrief(decided.doc);
      // No topics means one of two opposite things, and treating both as "read
      // the RFP in first" left a well-answered bid unable to finish its own
      // step: nothing to ask, and a page telling you to go and read documents
      // you had already read.
      if (!brief.topics.length) {
        const read = (session.documents ?? []).length > 0 || Object.keys(session.provenance ?? {}).length > 0;
        if (!read) {
          throw new ServiceError(409, 'Nothing worth asking the client yet', [], [{
            what: 'Pre-fill the engagement from the RFP first',
            why: 'The engine only asks about unknowns that move the offer, the plan, the store topology, the cost or the risk. With nothing recorded yet it has nothing to weigh — read the documents in, then come back.',
          }]);
        }
        return { instructions: clarificationsPrompt(session.language), ...brief, settled: true };
      }
      return { instructions: clarificationsPrompt(session.language), ...brief };
    },

    /**
     * Save the questions Claude wrote, ready to send to the client.
     *
     * @param {User} user @param {string} client
     * @param {{ questions: object[] }} input @param {{ via?: Channel }} [options]
     */
    async saveClarifications(user, client, { questions }, { via = 'claude' } = {}) {
      const session = await load(user, client);
      const list = Array.isArray(questions) ? questions : [];
      const problems = [];
      if (!list.length) problems.push('write at least one question');
      list.forEach((q, i) => {
        const where = `question ${i + 1}`;
        if (!q.question?.trim()) problems.push(`${where}: the question itself is missing`);
        if (!q.why_we_ask?.trim()) problems.push(`${where}: say why we ask — the trade-off is what shows we know the subject`);
        if (!(q.covers ?? []).length) problems.push(`${where}: record which discovery questions it covers`);
        if (!q.assume_if_unanswered?.trim()) problems.push(`${where}: say what we will assume in the proposal if they do not answer`);
        if (!q.impact_if_wrong?.trim()) problems.push(`${where}: say what it costs us if that assumption is wrong — without it the proposal states a gap rather than a decision`);
      });
      if (problems.length) throw new ServiceError(400, 'Questions not saved', problems);
      // Writing the questions again is a normal thing to do — the engagement moves
      // and the engine finds more — and it used to cost the Lead Consultant every
      // decision they had already taken. A rewritten question that rests on the
      // same discovery questions is the same question in better words, so it
      // keeps its verdict; anything genuinely new arrives undecided.
      const previous = session.closing?.clarifications?.questions ?? [];
      // Every discovery question the rewrite rests on must already have been ruled
      // on. A narrower question is inside what was approved; a broader one asks
      // something nobody agreed to send, and inheriting a verdict there would put
      // a question in front of a client on an approval that never covered it.
      const decidedBefore = (covers) => previous.find((old) => (old.status ?? 'proposed') !== 'proposed'
        && (covers ?? []).length
        && (covers ?? []).every((c) => (old.covers ?? []).includes(c)));

      session.closing = {
        ...session.closing,
        clarifications: {
          // Every question arrives proposed. The model drafts; the Lead Consultant
          // decides what is actually sent, because it is their name on the mail.
          questions: list.map((q, i) => {
            const kept = decidedBefore(q.covers);
            // The question's own fields first, so a payload cannot carry a status
            // or a decider past the lines that compute them. Zod strips unknown
            // keys on the connector today, and the guarantee should not rest on
            // that: a forged `accepted` is a question sent to a client.
            return {
              ...q,
              id: `q${i + 1}`,
              status: kept?.status ?? 'proposed',
              ...(kept ? { decided_at: kept.decided_at, decided_by: kept.decided_by, carried_over: true } : {}),
            };
          }),
          saved_at: today(),
          by: user.login,
          via,
          // Which language the model was told to write in. Without it a saved
          // document cannot say what language it is, and the engagement's
          // language can be corrected afterwards.
          language: session.language ?? 'en',
        },
      };
      session.updated_at = today();
      await store.save(session);
      return { ok: true, saved_at: today(), questions: list.length };
    },

    /**
     * The saved questions, for the app to show and download and for Claude to
     * read back before it writes the proposal — what was asked, and what the
     * proposal has to state as an assumption wherever the answer never came.
     *
     * @param {User} user @param {string} client
     */
    async getClarifications(user, client) {
      const session = await load(user, client);
      const saved = session.closing?.clarifications ?? null;
      const decided = decideFromSession(session, today());
      const topics = decided.ok ? clarificationTopics(decided.doc) : [];
      return {
        engagement: summary(session),
        clarifications: saved,
        // The internal copy carries what we would assume and who decided it.
        // It is a download, and a download leaves the building.
        pricing: user.role === 'owner',
        triage: triage(saved),
        // The questions are a snapshot and the engagement moves under them.
        freshness: clarificationsFreshness(topics, saved),
        // And the ones we sent have to come home. Each carries the discovery
        // questions it covers, so a reply is checkable rather than remembered.
        replies: decided.ok ? repliesReceived(decided.doc, saved) : { asked: 0, back: 0, waiting: [], rows: [] },
        reply_prompt: decided.ok ? replyPrompt(client, repliesReceived(decided.doc, saved).rows) : null,
        // What the proposal will state because nobody told us otherwise — from the
        // engine, and from every question the consultant decided not to ask.
        assumptions: statedAssumptions(decided.ok ? decided.doc : null, saved),
        documents: (session.documents ?? []).map(({ name, type, date }) => ({ name, type, date })),
      };
    },

    /**
     * The verified reference for an engagement, in pieces small enough to travel as
     * one tool result each. Called with no section it returns the index; with a
     * section it returns that piece. The closing-document steps used to inline all
     * of it — 69k tokens in a single result on a large engagement, nearly three
     * times what an MCP client accepts in one — so the client truncated it and the
     * model drafted against half the data.
     *
     * @param {User} user @param {string} client @param {{ section?: string }} [input]
     */
    async getReference(user, client, { section } = {}) {
      const session = await load(user, client);
      const decided = decideFromSession(session, today());
      if (!decided.ok) throw new ServiceError(400, 'Some answers are still missing', decided.errors, blockersFromErrors(decided.errors));
      // Exactly this section, or its numbered pages. `startsWith` also matched
      // anything beginning with it, so "deck:dataX" fell into the deck branch.
      if (/^deck:data(:\d+)?$/.test(String(section ?? ''))) {
        // The deck data is built from the approach as saved, so it needs one first.
        const approach = session.closing?.approach?.payload;
        if (!approach) throw new ServiceError(409, 'Save the approach first — the deck data is built from it', [], [{ what: 'Draft and save the approach with save_approach' }]);
        const final = finaliseEngagement(decided.doc, approach);
        if (!final.ok) throw new ServiceError(400, 'The saved approach no longer fits the answers — draft it again', final.errors);
        const pages = deckDataPages(deckBrief(final.engagement, { assumptions: statedFor(session, decided.doc), process: session.process, language: session.language }).deck_xml);
        const n = Number(String(section).split(':')[2] ?? 1);
        if (!Number.isInteger(n) || n < 1 || n > pages.length) throw new ServiceError(404, `${section}: there are ${pages.length} pages of deck data`);
        return { section, page: n, of: pages.length, deck_xml: pages[n - 1] };
      }
      return referencePiece(decided.doc, section);
    },

    /**
     * The consultant has just sent the drafting instruction to Claude. Drafting
     * happens in another application and can take three quarters of an hour, and
     * the page said "Not generated yet" throughout — identical to never having
     * pressed the button. Recording the moment is what lets it say which of the
     * two a reader is looking at.
     *
     * @param {User} user @param {string} client
     */
    async noteDraftRequested(user, client) {
      const session = await load(user, client);
      session.closing = { ...session.closing, requested: { at: new Date().toISOString(), by: user.login } };
      session.updated_at = today();
      await store.save(session);
      return { ok: true, requested_at: session.closing.requested.at };
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
      return { status: closingStatus(decided.doc), step: 'document', document: processMeta(session.process).document, ...deckBrief(final.engagement, { assumptions: statedFor(session, decided.doc), process: session.process, language: session.language }) };
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
      const previousDocument = session.closing?.document;
      // The annex may arrive in a second call, so a long document never has to fit
      // in one tool call: it is attached to the version already saved.
      if (!deck && !text && annexText && previousDocument) {
        if (annexText.length < 500) throw new ServiceError(400, 'The annex is too short — write the analysis, or leave it out');
        const personalAnnex = findPersonalData(annexText);
        if (personalAnnex.length) throw new ServiceError(400, 'Annex not saved', [`the annex ${personalAnnex.join(' and ')} — remove personal data`]);
        session.closing = { ...session.closing, document: { ...previousDocument, annex: `${annexText}\n` } };
        session.updated_at = today();
        await store.save(session);
        return { ok: true, saved_at: previousDocument.saved_at, version: previousDocument.version ?? '1.0', annex: true, attached_to_existing_version: true, versions: 1 + (session.closing.history ?? []).length };
      }
      if (deck) {
        const decided = decideFromSession(session, today());
        const problems = deckErrors(deck, decided.ok ? decided.doc : {});
        if (problems.length) throw new ServiceError(400, 'Deck not saved', problems);
        text = deckToMarkdown(deck);
        // The live/MCP deck schema has no internal-only section (unlike the CLI
        // XML builder's "consultant-notes"): everything Claude writes here is
        // treated as client-facing, so it is checked whole, with no part to strip.
        if (decided.ok) {
          const leaks = findLeaks(text, decided.doc);
          if (leaks.length) throw new ServiceError(400, 'Deck not saved', [`internal data found in the deck (${leaks.join(', ')}) — Merkle's commercial position must never reach a client document`]);
        }
      } else if (text.length < 500) {
        throw new ServiceError(400, 'Nothing to save — fill the deck templates (deck), or send only the annex to attach it to the version already saved');
      }
      if (annexText && annexText.length < 500) throw new ServiceError(400, 'The annex is too short — write the analysis, or leave it out');
      const personal = findPersonalData(`${text}\n${annexText}`);
      if (personal.length) throw new ServiceError(400, 'Document not saved', [`the document ${personal.join(' and ')} — remove personal data`]);
      const previous = previousDocument;
      const version = nextVersion(previous?.version);
      session.closing = {
        ...session.closing,
        document: { markdown: `${text}
`, ...(deck ? { deck } : {}), ...(annexText ? { annex: `${annexText}\n` } : {}), version, saved_at: today(), by: user.login, via, language: session.language ?? 'en', answers: answerSnapshot(session) },
        history: [...(previous ? [{ version: previous.version ?? '1.0', saved_at: previous.saved_at, by: previous.by, via: previous.via, language: previous.language, markdown: previous.markdown, ...(previous.deck ? { deck: previous.deck } : {}), ...(previous.annex ? { annex: previous.annex } : {}) }] : []), ...(session.closing?.history ?? [])].slice(0, 5),
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
        // The PowerPoint titles itself after the process, and the route was
        // reading it off an `engagement` key this never returned — so every
        // PowerPoint download threw. Nothing covered it, which is how 412 tests
        // passed over it.
        process: processOf(session.process),
        // Merkle's commercial position lives in the consultant notes, and a
        // download is a file that leaves the building. Only an owner gets the
        // whole document; everyone else gets the client part.
        pricing: user.role === 'owner',
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
        freshness: { ...freshness, redraft_prompt: redraftPrompt(client, freshness.changes, processMeta(session.process).document) },
        // The consultant-notes section of a saved document holds the price band
        // and the commercial warnings, and the Markdown download returned it whole.
        pricing: user.role === 'owner',
        version: doc?.version ?? (doc ? '1.0' : null),
        engagement: summary(session),
        approach: session.closing?.approach ? { saved_at: session.closing.approach.saved_at, by: session.closing.approach.by, via: session.closing.approach.via } : null,
        document: session.closing?.document ?? null,
        // When the instruction was last sent to Claude, so the page can tell
        // "still working" from "nobody ever pressed Enter".
        requested: session.closing?.requested ?? null,
        history: (session.closing?.history ?? []).map(({ saved_at, by, via, version }) => ({ saved_at, by, via, version: version ?? '1.0' })),
      };
    },

    /**
     * Change the interview mode after it started. An engagement that began as a
     * quick interview and grew — or a question bank that gained a question after
     * the interview ran — otherwise has no way to reach the questions it now
     * needs, because the mode decides which priorities are ever asked.
     *
     * @param {User} user @param {string} client @param {{ mode: 'quick'|'standard'|'full' }} input
     */
    async setInterviewMode(user, client, { mode }) {
      const session = await load(user, client);
      if (!['quick', 'standard', 'full'].includes(mode)) throw new ServiceError(400, `mode must be quick, standard or full (got ${mode})`);
      const before = session.mode;
      session.mode = mode;
      session.updated_at = today();
      await store.save(session);
      const open = nextQuestions(session, { limit: 500 });
      return { ok: true, mode, was: before, remaining: open.remaining };
    },

    /**
     * What language this engagement is run in, how much of the question bank
     * exists in it, and what the model has already written — in which language.
     *
     * @param {User} user @param {string} client
     */
    async languageState(user, client) {
      const session = await load(user, client);
      return writtenIn(session);
    },

    /**
     * Correct the language the engagement is run in.
     *
     * There was no way to do this, and an engagement created in the wrong
     * language stayed in it for ever — asked in English, and every document
     * written in English, on a record labelled French.
     *
     * It is always allowed, because refusing a correction leaves a record
     * permanently wrong, which is worse than the mismatch it avoids. Nothing
     * recorded moves: answers are held in English whatever language the
     * questions were asked in, and a quotation from the client's own RFP is
     * theirs and is never touched. The questions simply re-render.
     *
     * What does not move is anything the model already wrote — the clarification
     * questions, which may already be in the client's inbox, and every saved
     * version of the document. Those keep the language they were written in, so
     * the caller is told exactly which ones are now out of step rather than
     * finding out from a client.
     *
     * @param {User} user @param {string} client @param {{ language: string }} input
     */
    async setLanguage(user, client, { language }) {
      const session = await load(user, client);
      if (!supportedLanguage(language)) {
        throw new ServiceError(400, `language must be one of ${LANGUAGES.join(', ')} (got ${language || 'nothing'})`);
      }
      const was = session.language ?? 'en';
      session.language = language;
      session.updated_at = today();
      await store.save(session);
      return { ok: true, language, was, written_in: writtenIn(session), coverage: coverage(language) };
    },

    /**
     * Move a record between the two processes. Everything recorded stays exactly
     * as it is — the engine reads it the same way either way. What changes is the
     * order of the steps and the words, which is the whole point: a bid that is
     * being run as if it were a discovery asks the client sixty questions.
     *
     * @param {User} user @param {string} client @param {{ process: 'rfp'|'discovery' }} input
     */
    async setProcess(user, client, { process }) {
      const session = await load(user, client);
      if (!PROCESS_IDS.includes(process)) throw new ServiceError(400, `process must be one of ${PROCESS_IDS.join(', ')} (got ${process})`);
      const was = processOf(session.process);
      session.process = process;
      // Back to being a bid means it has not been won — a record must not carry a
      // win it does not have, however it got there.
      if (process === 'rfp') delete session.won;
      session.updated_at = today();
      await store.save(session);
      return { ok: true, process, was };
    },

    /**
     * Merkle won the bid. It becomes an engagement and the work carries on in the
     * same record: the RFP, every answer read out of it with its citation, the
     * questions sent to the client and every version of the proposal stay exactly
     * where they are. That is the whole reason a bid was never a separate object.
     *
     * Winning is a milestone, not a correction, so it is its own action and it is
     * dated. Someone who simply created the record as the wrong kind uses
     * setProcess instead, and nothing claims a bid was won that was not.
     *
     * @param {User} user @param {string} client
     */
    async markBidWon(user, client) {
      const session = await load(user, client);
      if (processOf(session.process) !== 'rfp') {
        throw new ServiceError(409, 'Only a bid can be won — this is already an engagement');
      }
      session.process = 'discovery';
      session.won = { at: today(), from: 'rfp', by: user.login };
      // One event, one record. Winning by this button and recording the outcome
      // "won" were two separate writes that never met, so the ledger — whose
      // entire purpose is counting wins — missed every bid won this way.
      session.outcome = outcomeFor(session, { outcome: 'won' }, { by: user.login, at: today() });
      session.updated_at = today();
      await store.save(session);
      return { ok: true, process: 'discovery', won_at: session.won.at };
    },

    /**
     * The evidence a Solution Architect takes to the bid/no-bid meeting. The
     * decision is not taken here and this never renders one.
     *
     * @param {User} user @param {string} client
     */
    async getGoNoGo(user, client) {
      const session = await load(user, client);
      const decided = decideFromSession(session, today());
      if (!decided.ok) throw new ServiceError(400, 'Some answers are still missing', decided.errors, blockersFromErrors(decided.errors));
      const p = preview(session, today());
      return {
        engagement: summary(session),
        // Merkle's commercial bands travel only to owners, as everywhere else.
        // The position turns on what a person has confirmed, not on what a model
        // extracted, so the confirmation count from Review goes in with it.
        go_no_go: goNoGoView(
          decided.doc,
          { coverage: p.coverage, to_review: summary(session).to_review, documents: (session.documents ?? []).length, record: processMeta(session.process).record.toLowerCase() },
          session.closing?.clarifications ?? null,
          { pricing: user.role === 'owner' },
        ),
        documents: (session.documents ?? []).map(({ name, type, date }) => ({ name, type, date })),
      };
    },

    /**
     * What delivery receives: the Jira backlog and the configuration workbook.
     * Both existed only as CLI commands against an engagement.json the web app
     * never writes, so the engagement path looked as if it ended at the closing
     * document. It ends here.
     *
     * @param {User} user @param {string} client
     */
    async getHandover(user, client) {
      const session = await load(user, client);
      const decided = decideFromSession(session, today());
      if (!decided.ok) throw new ServiceError(400, 'Some answers are still missing', decided.errors, blockersFromErrors(decided.errors));
      const final = finaliseEngagement(decided.doc, session.closing?.approach?.payload ?? null);
      const doc = final.ok ? final.engagement : decided.doc;
      // What the backlog does not rest on. It is built from the answers that
      // exist, so on an unfinished discovery it is a complete-looking artefact
      // resting on questions nobody asked — and the page said "ready" with
      // nothing to the contrary. Delivery opens this on day one.
      const e = summary(session);
      const rests_on = {
        required_answered: e.coverage?.required_answered ?? 0,
        required_total: e.coverage?.required_total ?? 0,
        to_review: e.to_review ?? 0,
        closing_document_at: e.closing_document_at ?? null,
        assumptions: statedFor(session, decided.doc).length,
      };
      return { engagement: e, handover: { ...handoverView(doc), rests_on } };
    },

    /**
     * One handover file, built the same way the CLI builds it.
     *
     * @param {User} user @param {string} client
     * @param {'backlog.csv'|'backlog.md'|'workbook.md'} which
     */
    async getHandoverFile(user, client, which) {
      const session = await load(user, client);
      const decided = decideFromSession(session, today());
      if (!decided.ok) throw new ServiceError(400, 'Some answers are still missing', decided.errors, blockersFromErrors(decided.errors));
      const final = finaliseEngagement(decided.doc, session.closing?.approach?.payload ?? null);
      const content = handoverFile(final.ok ? final.engagement : decided.doc, which);
      if (content === null) {
        const blocked = backlogBlocked(final.ok ? final.engagement : decided.doc);
        throw new ServiceError(409, 'No backlog for this engagement', [], blocked ? [{ what: blocked.label ?? 'Beyond the standard offers', why: blocked.why }] : []);
      }
      return content;
    },

    /**
     * Accept or reject a proposed question — one, or all of them at once.
     *
     * This is the decision the whole RFP step turns on. An accepted question goes
     * to the client in the Q&A window. A rejected one does not disappear: what we
     * would have asked becomes a stated assumption in the proposal, so the thing
     * we chose not to ask is still written down and still answerable later. That
     * is the difference between a decision and an omission.
     *
     * @param {User} user @param {string} client
     * @param {{ id?: string, status: 'accepted'|'rejected'|'proposed', all?: boolean }} input
     */
    async decideClarifications(user, client, { id, status, all = false }) {
      const session = await load(user, client);
      const saved = session.closing?.clarifications;
      if (!saved?.questions?.length) throw new ServiceError(409, 'There are no questions to decide on yet');
      if (!['accepted', 'rejected', 'proposed'].includes(status)) throw new ServiceError(400, `status must be accepted, rejected or proposed (got ${status})`);
      if (!all && !saved.questions.some((q) => q.id === id)) throw new ServiceError(404, `No question ${id}`);
      // Which of these decide the shape of the solution rather than a detail
      // inside one. Assuming an answer to "is this headless" is assuming the
      // size of the engagement, and the tool used to let that happen in one
      // silent click.
      const decided = decideFromSession(session, today());
      const shaping = shapeChangingIds(decided.ok ? clarificationTopics(decided.doc) : []);

      // "All" means all the undecided ones. It used to mean every question, so
      // deciding the rest in one click silently reversed a rejection already
      // taken and deleted the assumption it had created — with its consequence,
      // its owner and its date — and said nothing.
      const touches = (q) => (all ? (q.status ?? 'proposed') === 'proposed' : q.id === id);
      saved.questions = saved.questions.map((q) => (touches(q)
        ? { ...q, status, decided_at: today(), decided_by: user.login, ...(changesShape(q, shaping) ? { shape_changing: true } : {}) }
        : q));
      session.closing = { ...session.closing, clarifications: saved };
      session.updated_at = today();
      await store.save(session);
      const count = (s) => saved.questions.filter((q) => q.status === s).length;
      // Not a refusal — it is the consultant's decision — but it is not allowed
      // to be silent. A price built on a guess about the offer size is a
      // different commercial object from one built on a guess about a detail.
      const assumedShape = saved.questions.filter((q) => q.status === 'rejected' && q.shape_changing);
      return {
        ok: true,
        accepted: count('accepted'),
        rejected: count('rejected'),
        proposed: count('proposed'),
        ...(assumedShape.length ? {
          warning: `${assumedShape.length} of the questions you decided not to ask change the shape of the solution, not a detail inside it. The proposal will state an assumption about what Merkle is being asked to build, and the offer size rests on it.`,
          shape_assumed: assumedShape.map((q) => q.question),
        } : {}),
      };
    },

    /**
     * Record what happened to a bid.
     *
     * Winning had a button and nothing else did — not a loss, not a submission,
     * not a decision to walk away. So the one dataset only Merkle can accumulate
     * was thrown away on every engagement, and the price bands stayed calibrated
     * on nothing because nothing was ever recorded to calibrate them against.
     *
     * The engine's own position is frozen with it, because the question a year
     * from now is what it said at the time.
     *
     * @param {User} user @param {string} client
     * @param {{ outcome: string, submitted_price?: number, currency?: string, note?: string }} input
     */
    async recordOutcome(user, client, { outcome, submitted_price, currency, note }) {
      const session = await load(user, client);
      if (!OUTCOME_IDS.includes(outcome)) throw new ServiceError(400, `outcome must be one of ${OUTCOME_IDS.join(', ')} (got ${outcome})`);
      // This is the calibration dataset. "abc" became NaN, passed the
      // `!== undefined` guard and was stored as null — a silent hole in the one
      // record that exists to be counted later.
      if (submitted_price !== undefined && submitted_price !== null
        && (!Number.isFinite(submitted_price) || submitted_price < 0)) {
        throw new ServiceError(400, 'The price submitted has to be a number', [`got ${JSON.stringify(submitted_price)}`]);
      }
      const decided = decideFromSession(session, today());
      const p = decided.ok ? preview(session, today()) : null;
      const saved = session.closing?.clarifications ?? null;
      // Recording a win on a bid is the same event as pressing "we won it": the
      // record becomes an engagement, whichever door it came through.
      if (outcome === 'won' && processOf(session.process) === 'rfp') {
        session.process = 'discovery';
        session.won = { at: today(), from: 'rfp', by: user.login };
      }
      session.outcome = recordOutcomeEntry(session, { outcome, submitted_price, currency, note }, {
        by: user.login,
        at: today(),
        offer: p ? { code: p.offer?.code, go: p.go, route: p.route } : null,
        position: decided.ok
          ? (() => {
            const state = { provenance: session.provenance, process: processOf(session.process) };
            const r = readiness(decided.doc, state);
            return {
              verdict: goNoGoView(decided.doc, { coverage: p?.coverage, to_review: summary(session).to_review, documents: (session.documents ?? []).length }, saved).recommendation.verdict,
              assumptions: statedAssumptions(decided.doc, saved).length,
              decisions_settled: r.decisions.settled,
            };
          })()
          : null,
      });
      session.updated_at = today();
      await store.save(session);
      return { ok: true, ...session.outcome };
    },

    /** What the ledger can say across every engagement, and what it cannot say yet. */
    async getLedger(user) {
      if (!user) throw new ServiceError(401, 'Sign in first');
      const sessions = (await store.list()).filter((s) => allowed(user, s));
      return ledger(sessions.map((s) => ({
        client: s.client,
        process: processOf(s.process),
        outcome: s.outcome?.current ?? null,
        history: s.outcome?.history ?? [],
      })));
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
