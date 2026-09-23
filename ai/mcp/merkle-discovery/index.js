/**
 * @file mcp.js
 * @description "Merkle Discovery" connector tools for Claude (ADR 0015). Each
 * tool calls the discovery service as the signed-in Lead Consultant, so Claude
 * and the web app read and write the same engagement (shared memory). The
 * engine still validates every answer and decides the offer.
 *
 * @module ai/mcp/merkle-discovery/index
 */

import { z } from 'zod';

import { ServiceError } from '../../shared/index.js';
import { deckDataPages } from '../../shared/closing.js';
import { renderSummaryMarkdown } from '../../shared/summary.js';
import { LANGUAGES } from '../../shared/i18n.js';
import { safeLog } from '../../shared/safe-log.js';

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
const compactPreview = (p, estimate) => ({
  offer: p.offer,
  // The stage the estimate stands at, and what moved since the RFP — weeks and
  // gates only: the connector never carries Merkle's price band.
  ...(estimate ? { estimate } : {}),
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
 * @param {{ service: ReturnType<typeof import('../../shared/index.js').createDiscoveryService>, userOf: (ctx: object) => Promise<import('../../shared/index.js').User|null> | import('../../shared/index.js').User|null }} deps
 */
export function registerDiscoveryTools(server, { service, userOf }) {
  /** Run a service call as the connected consultant; service errors become tool errors. */
  const tool = (name, config, run) => server.registerTool(name, config, async (args, ctx) => {
    const started = Date.now();
    const log = (outcome, bytes) => safeLog('log', JSON.stringify({ mcp_tool: name, outcome, ms: Date.now() - started, ...(bytes !== undefined ? { kb: Math.round(bytes / 1024), tokens_est: Math.round(bytes / 4) } : {}) }));
    try {
      const user = await userOf(ctx);
      if (!user) { log('unauthorised'); return { isError: true, content: [{ type: 'text', text: 'Not signed in, or this account is no longer on the allowlist.' }] }; }
      const result = json(await run(user, args ?? {}));
      log('ok', Buffer.byteLength(result.content?.[0]?.text ?? ''));
      return result;
    } catch (err) {
      if (err instanceof ServiceError) {
        log(`rejected ${err.status}`);
        return { isError: true, content: [{ type: 'text', text: [err.message, ...err.errors].join('\n') }] };
      }
      log('crashed');
      throw err;
    }
  });

  /**
   * The drafting steps used to inline the whole verified reference — 69k tokens in
   * one result on a large engagement, nearly three times what an MCP client takes
   * in a single tool result. It now travels as an index, fetched with
   * get_reference one piece at a time.
   */
  const lean = (brief) => {
    if (!brief || typeof brief !== 'object') return brief;
    const { reference_chapters, verified_knowledge, ...rest } = brief;
    // The deck guide and the slide templates are identical for every engagement:
    // fetched once with get_reference rather than resent with every document.
    if (rest.step === 'document') {
      const pages = deckDataPages(rest.deck_xml ?? '');
      delete rest.instructions;
      delete rest.deck_schema;
      delete rest.deck_xml;
      rest.deck_data = pages.map((_, i) => `deck:data:${i + 1}`);
      rest.next = `Fetch with get_reference, in this order: deck:guide (how to write it), deck:schema (the slide templates), ${rest.deck_data.join(', ')} (this engagement's deck data), then the limits and chapters listed in the index. Write the deck and the annex and save both with save_closing_document.`;
    }
    const engagement = rest.engagement && typeof rest.engagement === 'object'
      ? (({ verified_knowledge: _k, ...e }) => e)(rest.engagement)
      : rest.engagement;
    return {
      ...rest,
      ...(engagement !== undefined ? { engagement } : {}),
      reference: 'Before you draft, call get_reference with this client and no section: it lists the verified Shopify knowledge for this engagement (documented limits, options already weighed, plan gates) and the reference chapters. Read the limits and the chapters for every area you decide on — a limit we have already written down and you leave out is the worst failure of this document.',
    };
  };

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
      language: z.enum(LANGUAGES).default('en').describe('The language the engagement is run in, and the language every client-facing document is written in'),
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
  }, async (user, { client }) => {
    const v = await service.getInterview(user, client, { limit: 1 });
    return compactPreview(v.preview, v.estimate);
  });

  tool('prepare_closing_document', {
    title: 'Start the Discovery Closing Document',
    description: 'Step 1 of the Discovery Closing Document. The engine decides the engagement from the answers (offer, gates, exit rules, open items). If step is "approach": draft the implementation approach as one JSON object following instructions and approach_schema from the engagement data, then call save_approach. If step is "document": write the document from deck_xml following instructions, then call save_closing_document.',
    inputSchema: z.object({ client: slug }),
    annotations: read,
  }, async (user, { client }) => lean(await service.prepareClosingDocument(user, client)));

  tool('save_approach', {
    title: 'Save the implementation approach',
    description: 'Step 2: save the approach JSON (capability_map, architecture_decisions, integration_architecture, data_model, non_functional, risk_register, app_shortlist, assumptions, phases). It is validated against the schema and the consulting standard (ADR 0017): every Shopify fact cites an official source (help.shopify.com, shopify.dev, apps.shopify.com), decisions and capabilities cite question ids, integrations cover every system, risks cite evidence; errors come back to fix — research the missing sources, never drop content to pass. On success returns deck_xml and the instructions to write the Discovery Closing Document (step 3).',
    inputSchema: z.object({ client: slug, approach: z.record(z.string(), z.unknown()).describe('The approach object matching approach_schema') }),
    annotations: write,
  }, async (user, { client, approach }) => lean(await service.saveApproach(user, client, approach, { via: 'claude' })));

  tool('save_closing_document', {
    title: 'Save the Discovery Closing Document',
    description: 'Step 3: save the Discovery Closing Document. "deck" is the deck as filled slide templates — follow deck_schema from the previous step, one message per slide, the headline of every slide is the takeaway. The web app renders it as a PowerPoint. "annex" is the annex document in Markdown: the analysis per decision, the capability analysis, appendices and the bibliography; Merkle\'s verified Shopify reference chapters are appended automatically. Each save gets its own version number and the previous version is kept. If the two together would be a very long tool call, save the deck first and then call this again with only "annex" — it is attached to the version you just saved, without creating a new one.',
    inputSchema: z.object({
      client: slug,
      deck: z.record(z.string(), z.unknown()).optional().describe('The filled deck: { slides: [...] } matching deck_schema'),
      annex: z.string().optional().describe('Annex document in Markdown'),
    }),
    annotations: write,
  }, (user, { client, deck, annex }) => service.saveClosingDocument(user, client, { deck, annex }, { via: 'claude' }));

  tool('prepare_clarifications', {
    title: 'Prepare the questions to send back on an RFP',
    description: 'After an RFP has been read in, the topics worth asking the client about before the proposal: the unknowns that move the offer, the Shopify plan, the store topology, the cost or the risk, grouped so one question covers several, with the documented trade-off to show and what we would assume if they do not answer. Write the questions from these topics and save them with save_clarifications.',
    inputSchema: z.object({ client: z.string().describe('Client slug') }),
    annotations: read,
  }, (user, { client }) => service.prepareClarifications(user, client));

  tool('save_clarifications', {
    title: 'Save the clarification questions',
    description: 'Save the questions to send to the client. One entry per question: "question" (the client-facing text, in their context), "why_we_ask" (the trade-off, with the Shopify source for any platform fact), "covers" (the discovery question ids it answers), "assume_if_unanswered" (what the proposal will state if they do not answer) and "impact_if_wrong" (what that costs us if it turns out wrong). Always send the whole list, including questions already saved. Re-saving is safe and is the normal way to add one: a question resting on the same "covers" keeps the Lead Consultant\'s accept or reject and who made it, and only genuinely new ground arrives undecided. Never leave a topic out to protect an earlier triage — that is the one thing this does not need protecting from.',
    inputSchema: z.object({
      client: z.string().describe('Client slug'),
      questions: z.array(z.object({
        question: z.string().describe('The question as the client reads it, opening in their own context'),
        why_we_ask: z.string().describe('What changes in the solution depending on the answer, with the official Shopify source for any platform fact'),
        covers: z.array(z.string()).describe('Discovery question ids this covers'),
        assume_if_unanswered: z.string().describe('What the proposal will assume if they do not answer'),
        impact_if_wrong: z.string().describe('What it costs us if that assumption turns out to be wrong — scope, plan, store count or run cost. An assumption with no consequence stated reads to a client as a gap rather than a decision.'),
      })).describe('Ordered by impact, highest first'),
    }),
    annotations: write,
  }, (user, { client, questions }) => service.saveClarifications(user, client, { questions }, { via: 'claude' }));

  tool('get_clarifications', {
    title: 'The questions already sent on this RFP',
    description: 'The clarification questions saved for this engagement, with what each one covers and what the proposal will assume if it comes back unanswered. Read it before writing the proposal: every question the client did not answer has to appear there as a stated assumption.',
    inputSchema: z.object({ client: slug }),
    annotations: read,
  }, (user, { client }) => service.getClarifications(user, client));

  tool('get_reference', {
    title: 'Read the verified Shopify reference',
    description: 'The Shopify knowledge Merkle has already verified for this engagement, one piece at a time so no single result is too large. Call it without a section for the index, then fetch what you need: "limits:N" (documented limits — what breaks a naive answer), "options:N" (options already weighed with pros and cons), "plan_gates", and "chapter:<slug>" (the reference chapters appended to the annex). Read the limits and the relevant chapters before drafting the approach and before writing the deck.',
    inputSchema: z.object({
      client: z.string().describe('Client slug'),
      section: z.string().optional().describe('Omit for the index; otherwise e.g. "limits:1", "options:2", "plan_gates", "chapter:shopify-markets"'),
    }),
    annotations: read,
  }, (user, { client, section }) => service.getReference(user, client, { section }));

  tool('get_closing_document', {
    title: 'Saved Discovery Closing Document',
    description: 'The latest saved Discovery Closing Document (deck narrative and annex, Markdown) with when and by whom it was saved, whether an approach is saved, and whether the document still matches the answers (freshness.changes lists the questions answered or changed since it was written — redraft when it is not up to date).',
    inputSchema: z.object({ client: slug }),
    annotations: read,
  }, (user, { client }) => service.getClosingDocument(user, client));

  tool('get_summary', {
    title: 'Engagement summary',
    description: 'Summary computed by the engine (no AI): offer, GO or STOP, scope gates, exit rules, minimum Shopify plan, app signals, open items, all answers by section in words, documents and notes. Returns Markdown for the Lead Consultant (internal, not a client document).',
    inputSchema: z.object({ client: slug }),
    annotations: read,
    /*
     * Without the price band, whatever the consultant's role.
     *
     * The band reaches a lead consultant reading a screen; it does not reach a
     * model that goes on to draft a client document from the same context. The
     * rule this tool has held from the start is that the engine keeps Merkle's
     * commercial position out of everything it generates, and a connector
     * transcript is the one place where "internal" and "generated" meet.
     */
  }, async (user, { client }) => ({ markdown: renderSummaryMarkdown(await service.getSummary(user, client, { pricing: false })) }));

  tool('list_answers', {
    title: 'Recorded answers',
    description: 'Answers recorded so far with source, status (confirmed or to confirm), channel (web, claude, cli) and citation. Use it to avoid duplicates and to summarise what still needs confirmation.',
    inputSchema: z.object({ client: slug, status: z.enum(['tbc', 'confirmed']).optional() }),
    annotations: read,
  }, async (user, { client, status }) => (await service.listAnswers(user, client)).filter((a) => !status || a.status === status));

  registerPrompts(server);
}

/**
 * Prompt templates the Lead Consultant picks in Claude instead of typing an
 * instruction: the connector cannot start work by itself (MCP is client-driven),
 * so the next best thing is that starting it takes one click.
 *
 * @param {{ registerPrompt?: Function }} server
 */
export function registerPrompts(server) {
  if (typeof server.registerPrompt !== 'function') return;
  const message = (text) => ({ messages: [{ role: 'user', content: { type: 'text', text } }] });

  server.registerPrompt('draft_closing_document', {
    title: 'Draft the client document',
    description: 'Research, decide and write the deck and annex — a Discovery Closing Document, or a proposal on a bid — then save both.',
    argsSchema: { client: z.string().describe('Client slug, e.g. acme-watches') },
  }, ({ client }) => message(`Draft the client document for ${client}. prepare_closing_document returns "document": what this one is called — a Discovery Closing Document, or a Proposal when Merkle is answering an RFP. Use that name for it throughout.

Work as a Shopify Solution Architect: call prepare_closing_document, read the whole engagement, research every Shopify fact in the official documentation before you state it, draft and save the approach, then fill the deck templates and write the annex and save both with save_closing_document. Tell me the version you saved, the decisions taken and what is still to validate.`));

  server.registerPrompt('redraft_closing_document', {
    title: 'Redraft after answers changed',
    description: 'Check what changed since the last version and rewrite the document accordingly.',
    argsSchema: { client: z.string().describe('Client slug, e.g. acme-watches') },
  }, ({ client }) => message(`Redraft the client document for ${client} — prepare_closing_document returns "document", the name this one goes by.

Call get_closing_document first and read freshness.changes — those are the answers that moved since the last version.

Then redraft in full: prepare_closing_document, draft the approach again from what it returns, save_approach, and only then write the deck and the annex and save both with save_closing_document. Changed answers can move the engine's own decisions — the market topology among them — so a deck rewritten on top of the previous approach would argue from a position the evidence no longer supports.

Tell me which decisions, risks or scope items the changes moved, and which stayed the same and why.`));

  server.registerPrompt('write_clarifications', {
    title: 'Write the questions to send on an RFP',
    description: 'The few considered questions Merkle sends back after reading an RFP, each showing the trade-off it turns on.',
    argsSchema: { client: z.string().describe('Client slug, e.g. acme-watches') },
  }, ({ client }) => message(`Write Merkle's clarification questions on the RFP for ${client}.

Call prepare_clarifications and work only from the topics it gives you — the engine has already taken out everything it could safely assume, so do not add questions back. Research every Shopify fact in the official documentation before you state it.

Write one question per topic, opening in the client's own words and followed by a short "Why we ask" that shows what changes in the solution depending on the answer. Then save them with save_clarifications, recording for each one which discovery questions it covers and what the proposal will assume if it comes back unanswered.

These go to the client before we bid. A long list says we have not read their document; a short one, each question showing we already know the trade-off, says the opposite.`));

  server.registerPrompt('prefill_from_documents', {
    title: 'Pre-fill the engagement from the documents',
    description: 'Read the RFP and other documents in this project and record what they answer, with citations.',
    argsSchema: { client: z.string().describe('Client slug, e.g. acme-watches') },
  }, ({ client }) => message(`Read the documents in this project and pre-fill the engagement ${client}.

Register each document, map what it says to the questionnaire with find_questions, and record answers with record_answers including the evidence (document, section, short quote). Mark anything unclear as TBC with a note instead of guessing. Then summarise what you recorded and what is still open.`));
}
