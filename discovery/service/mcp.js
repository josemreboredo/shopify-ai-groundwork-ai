/**
 * @file mcp.js
 * @description "Merkle Discovery" connector tools for Claude (ADR 0015). Each
 * tool calls the discovery service as the signed-in Lead Consultant, so Claude
 * and the web app read and write the same engagement (shared memory). The
 * engine still validates every answer and decides the offer.
 *
 * @module discovery/service/mcp
 */

import { z } from 'zod';

import { ServiceError } from './index.js';

export const SERVER_INSTRUCTIONS = `Merkle Discovery: Shopify discovery engagements shared with the Lead Consultant web app.
- Interim pilot: demo or anonymised engagements and documents only — no real client data.
- Consent first: an engagement needs the client's consent for AI processing (question Q10.5.2) before any other answer. Record it only when the Lead Consultant confirms the client agreed.
- Documents (RFPs, briefs, requirements): register each with register_document, find matching questions with find_questions or get_interview, then record answers with record_answers and evidence (document, section or page, short quote). Answers from documents stay "to confirm" until the Lead Consultant confirms them in the web app.
- Values must match each question's inputs (allowed values, item fields). Never record personal data (names, e-mail addresses, phone numbers) — record roles instead.
- The engine decides the offer, scope gates, exit rules and Shopify plan: report only what get_preview returns; never compute or promise an offer or price yourself.`;

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,62}$/).describe('Client slug, e.g. acme-watches');
const questionId = z.string().regex(/^Q\d+\.\d+\.\d+$/).describe('Question id, e.g. Q3.1.1');

const json = (value) => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] });

/**
 * Compact question for the model: what to ask and how to answer.
 *
 * @param {object} q
 */
const compactQuestion = (q) => ({
  id: q.id,
  section: q.subsection ?? null,
  text: q.text,
  help: q.help ?? null,
  priority: q.priority ?? null,
  audience: q.audience ?? null,
  inputs: q.inputs.map((i) => ({
    pointer: i.pointer,
    kind: i.kind,
    ...(i.label ? { label: i.label } : {}),
    ...(i.vocabulary ? { accepts: `${i.vocabulary} name or code` } : {}),
    ...(i.options ? { allowed_values: i.options.map((o) => o.value) } : {}),
    ...(i.columns ? {
      value: 'array of objects, one per row',
      columns: i.columns.map((c) => ({ key: c.key, kind: c.kind, required: c.required, ...(c.vocabulary ? { accepts: `${c.vocabulary} name or code` } : {}), ...(c.options ? { allowed_values: c.options.map((o) => o.value) } : {}) })),
    } : {}),
  })),
  ...(q.state ? { state: q.state } : {}),
});

/**
 * Compact preview: the engine's view of the engagement.
 *
 * @param {object} p
 */
const compactPreview = (p) => ({
  offer: p.offer,
  go: p.go,
  route: p.route ?? null,
  scope_gates: p.scope_gates,
  l_triggers: p.l_triggers,
  exit_rules: p.exit_rules,
  plan_suggestion: p.plan_suggestion ?? null,
  coverage: p.coverage,
  app_signals: Object.fromEntries(Object.entries(p.app_signals ?? {}).filter(([, reasons]) => reasons.length)),
});

/**
 * Register the connector tools on an MCP server.
 *
 * @param {{ registerTool: Function }} server
 * @param {{ service: ReturnType<typeof import('./index.js').createDiscoveryService>, userOf: (ctx: object) => Promise<import('./index.js').User|null> | import('./index.js').User|null }} deps
 */
export function registerDiscoveryTools(server, { service, userOf }) {
  /** Run a service call as the connected consultant; service errors become tool errors. */
  const tool = (name, config, run) => server.registerTool(name, config, async (args, ctx) => {
    try {
      const user = await userOf(ctx);
      if (!user) return { isError: true, content: [{ type: 'text', text: 'Not signed in, or this account is no longer on the allowlist.' }] };
      return json(await run(user, args ?? {}));
    } catch (err) {
      if (err instanceof ServiceError) {
        return { isError: true, content: [{ type: 'text', text: [err.message, ...err.errors].join('\n') }] };
      }
      throw err;
    }
  });

  const read = { readOnlyHint: true, openWorldHint: false };
  const write = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };

  tool('list_engagements', {
    title: 'List engagements',
    description: 'Engagements you can access, with offer, status, coverage and answers waiting for review.',
    inputSchema: z.object({}),
    annotations: read,
  }, (user) => service.listEngagements(user));

  tool('start_interview', {
    title: 'Start an engagement',
    description: 'Create a new discovery engagement owned by you. The first question is always consent for AI processing (Q10.5.2).',
    inputSchema: z.object({
      client: slug,
      language: z.string().regex(/^[a-z]{2}$/).default('en').describe('Conversation language (ISO 639-1)'),
      mode: z.enum(['quick', 'standard', 'full']).default('standard').describe('quick: required questions; standard: + recommended; full: everything'),
    }),
    annotations: write,
  }, (user, { client, language, mode }) => service.startInterview(user, { client, language, mode }));

  tool('get_interview', {
    title: 'Next questions and status',
    description: 'The next open questions for the interview mode (with how to answer each), the engine preview, questions marked TBC, registered documents and notes.',
    inputSchema: z.object({ client: slug, limit: z.number().int().min(1).max(60).default(10) }),
    annotations: read,
  }, async (user, { client, limit }) => {
    const v = await service.getInterview(user, client, { limit });
    return {
      engagement: v.engagement,
      consent_required: Boolean(v.next.consent_required),
      remaining: v.next.remaining,
      questions: v.next.questions.map(compactQuestion),
      preview: compactPreview(v.preview),
      tbc: v.tbc,
      commented: v.commented,
      documents: v.documents,
      notes: v.notes,
    };
  });

  tool('find_questions', {
    title: 'Find questions for a topic',
    description: 'Search the whole question bank by topic (e.g. "payment providers", "B2B price lists", "ERP integration") to map document content to questions. Returns how to answer each and whether it is open, answered, TBC or skipped.',
    inputSchema: z.object({ client: slug, query: z.string().min(3), limit: z.number().int().min(1).max(50).default(15) }),
    annotations: read,
  }, async (user, { client, query, limit }) => (await service.findQuestions(user, client, { query, limit })).map(compactQuestion));

  tool('record_answers', {
    title: 'Record answers',
    description: 'Record answers to one or more questions. values maps each input pointer of the question to a JSON value (a group can be one object at the question field). With evidence (from a document) the answer is recorded as "to confirm" with a citation until the Lead Consultant confirms it. Each question is validated and applied on its own; the result lists errors per question.',
    inputSchema: z.object({
      client: slug,
      answers: z.array(z.object({
        question_id: questionId,
        values: z.record(z.string(), z.unknown()).describe('pointer → value, e.g. { "/payments/providers": ["Adyen"] }'),
        source: z.enum(['client', 'consultant', 'inferred']).optional().describe('Who the answer comes from (default: client; consultant questions: consultant)'),
        status: z.enum(['confirmed', 'tbc']).optional().describe('Ignored when evidence is given (always "to confirm")'),
        note: z.string().max(1000).optional().describe('Original wording or caveats; no personal data'),
        evidence: z.object({
          document: z.string().min(1).describe('Document name as registered'),
          location: z.string().optional().describe('Section, page or slide'),
          quote: z.string().max(600).optional().describe('Short quote supporting the answer'),
        }).optional(),
      })).min(1).max(50),
    }),
    annotations: write,
  }, async (user, { client, answers }) => {
    const r = await service.recordAnswers(user, client, answers, { via: 'claude' });
    return { results: r.results, preview: compactPreview(r.preview) };
  });

  tool('mark_questions', {
    title: 'Mark questions TBC, not applicable or clarified by a comment',
    description: 'Mark questions as TBC (the client confirms later), skipped (not applicable) or commented (the source answers in words that no allowed value captures, e.g. "we only ship inside the EU" — the comment is required and stays an open item).',
    inputSchema: z.object({
      client: slug,
      items: z.array(z.object({ question_id: questionId, as: z.enum(['tbc', 'skipped', 'commented']), note: z.string().max(1000).optional() })).min(1).max(50),
    }),
    annotations: write,
  }, async (user, { client, items }) => {
    const results = [];
    for (const item of items) {
      try {
        await service.markQuestion(user, client, item);
        results.push({ question_id: item.question_id, ok: true });
      } catch (err) {
        if (!(err instanceof ServiceError)) throw err;
        results.push({ question_id: item.question_id, ok: false, errors: [err.message, ...err.errors] });
      }
    }
    return { results };
  });

  tool('add_note', {
    title: 'Add a consultant note',
    description: 'Context that is not an answer (in English, no personal data).',
    inputSchema: z.object({ client: slug, text: z.string().min(1).max(2000) }),
    annotations: write,
  }, (user, { client, text }) => service.addNote(user, client, { text }));

  tool('register_document', {
    title: 'Register a document',
    description: 'Record that a document (kept in the Claude Project, not uploaded here) is used for this engagement: name, type, date and a one-line summary of what it covers.',
    inputSchema: z.object({
      client: slug,
      name: z.string().min(1).max(200),
      type: z.enum(['rfp', 'brief', 'requirements', 'architecture', 'meeting_notes', 'other']).default('other'),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      summary: z.string().max(500).default(''),
    }),
    annotations: write,
  }, (user, { client, name, type, date, summary }) => service.registerDocument(user, client, { name, type, date, summary }, { via: 'claude' }));

  tool('get_preview', {
    title: 'Offer and exit rules',
    description: "The engine's current view: offer (provisional while gates are unknown), GO or STOP and route, scope gates, exit rules with evidence, minimum Shopify plan, coverage and app signals.",
    inputSchema: z.object({ client: slug }),
    annotations: read,
  }, async (user, { client }) => compactPreview((await service.getInterview(user, client, { limit: 1 })).preview));

  tool('list_answers', {
    title: 'Recorded answers',
    description: 'Answers recorded so far with source, status (confirmed or to confirm), channel (web, claude, cli) and citation. Use it to avoid duplicates and to summarise what still needs confirmation.',
    inputSchema: z.object({ client: slug, status: z.enum(['tbc', 'confirmed']).optional() }),
    annotations: read,
  }, async (user, { client, status }) => (await service.listAnswers(user, client)).filter((a) => !status || a.status === status));
}
