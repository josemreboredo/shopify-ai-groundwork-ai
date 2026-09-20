/**
 * @file summary.js
 * @description Readable answers and the engagement summary (web app page,
 * Markdown download, Claude connector). Code only — no AI: the offer, rules and
 * open items come from the engine.
 *
 * @module discovery/service/summary
 */

import { schemaNodeAt, enumValues, optionLabel } from '../schema/index.js';

/**
 * A recorded value in words: option codes as labels, lists joined, table rows one per line.
 *
 * @param {string} pointer  Schema pointer of the value
 * @param {unknown} value
 * @returns {string}
 */
export function displayValue(pointer, value) {
  if (value === null || value === undefined) return '';
  const node = schemaNodeAt(pointer);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') return enumValues(node) && node?.type !== 'array' ? optionLabel(value) : value;
  if (typeof value === 'number') return value.toLocaleString('en');
  if (Array.isArray(value)) {
    const items = value.map((item) => displayValue(`${pointer}/*`, item));
    return value.some((item) => item && typeof item === 'object') ? items.join('\n') : items.join(', ');
  }
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${displayValue(`${pointer}/${k}`, v)}`)
      .join(' · ');
  }
  return String(value);
}

const STATE_LABEL = { answered: 'Answered', tbc: 'TBC', skipped: 'Not applicable', commented: 'Clarified by comment', open: 'Open' };

const cell = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\n/g, '<br>');

/**
 * Markdown summary for download or sharing inside Merkle (includes the offer
 * the engine computed — internal, not a client document).
 *
 * @param {ReturnType<import('./index.js').createDiscoveryService>['getSummary'] extends (...a: any) => Promise<infer R> ? R : never} s
 */
/**
 * How the offer and the route read together.
 *
 * The classification is real — it is what the scope gates say — but an exit rule
 * can take the engagement outside the offers, and at that point the
 * classification stops being the answer. Printed as two flat lines it read
 * "Offer: M · Ecommerce Scale" above "STOP — route: larger engagement", which is
 * the tool appearing to contradict itself on its own summary page.
 *
 * And nothing is stopping. A Larger Engagement is the largest deal shape in this
 * workspace; the word STOP is the engine's internal name for an exit rule and has
 * no business on a page a consultant reads.
 *
 * @param {{ offer: object, go: boolean, route?: string|null }} p  engine preview
 */
export function offerStanding(p) {
  const name = `${p.offer.code} · ${p.offer.name}`;
  // An empty record classifies as the smallest offer and reads GO, because no
  // gate has fired — so the list stated a commercial position on a bid nobody
  // had opened. Nothing recorded is not a small engagement; it is not an
  // engagement yet.
  const c = p.coverage ?? {};
  if (!(c.required_answered ?? 0)) {
    return {
      applies: false,
      unknown: true,
      short: '—',
      headline: 'Not classified yet',
      standing: 'Nothing has been recorded, so there is no offer to state',
      tone: '',
      note: null,
    };
  }
  if (p.go) {
    return {
      applies: true,
      short: p.offer.code,
      headline: name,
      standing: 'Within the standard offers',
      tone: 'go',
      note: p.offer.provisional ? 'Provisional — some scope gates are still unknown' : null,
    };
  }
  const route = String(p.route ?? '').trim();
  return {
    applies: false,
    // What the offer column says. It said "M · Ecommerce Scale" beside a status
    // of "Larger Engagement", which is the classification the exit rules have
    // already superseded — the same contradiction fixed on the other pages.
    short: ROUTE_SHORT[route] ?? 'Beyond the offers',
    headline: ROUTE_HEADLINE[route] ?? 'Beyond the standard offers',
    standing: route ? 'Beyond the standard offers' : 'Beyond the standard offers — the route is not recorded yet',
    tone: route === 'no_bid' ? 'stop' : 'flag',
    note: `The scope gates classify it as ${name}, which is not the answer here: an exit rule takes it outside, so it is scoped and priced on its own.`,
  };
}

const ROUTE_SHORT = { larger_engagement: 'Larger Engagement', no_bid: 'No bid' };

const ROUTE_HEADLINE = {
  larger_engagement: 'Larger Engagement — an Enterprise Engagement opening with a dedicated Discovery Phase',
  no_bid: 'No bid',
};

export function renderSummaryMarkdown(s) {
  const p = s.preview;
  const lines = [
    `# Discovery summary — ${s.engagement.client}`,
    '',
    `> Internal working summary for the Lead Consultant (not a client document). Generated ${s.generated_at} from the discovery tool; demo or anonymised data only during the pilot.`,
    '',
    '## Status',
    '',
    ...(() => {
      const st = offerStanding(p);
      return [
        `- **Where it lands:** ${st.headline}`,
        `- **Standing:** ${st.standing}`,
        ...(st.note ? [`- **Note:** ${st.note}`] : []),
      ];
    })(),
    `- **Coverage:** ${p.coverage.required_answered} of ${p.coverage.required_total} required questions answered · ${p.coverage.required_tbc} TBC · ${p.coverage.required_commented ?? 0} clarified by comment · ${p.coverage.required_open} open`,
    `- **Interview:** ${s.engagement.mode} mode · ${s.engagement.language} · updated ${s.engagement.updated_at}`,
    ...(p.plan_suggestion ? [`- **Minimum Shopify plan for these answers:** ${p.plan_suggestion.value} — ${p.plan_suggestion.reasons.join('; ')}`] : []),
    '',
    '## Scope gates and L triggers',
    '',
    ...Object.entries(p.scope_gates).map(([id, state]) => `- ${id.replace(/_/g, ' ')}: ${state}`),
    ...Object.entries(p.l_triggers).map(([id, state]) => `- L trigger ${id.replace(/_/g, ' ')}: ${state}`),
    '',
    '## Exit rules',
    '',
    ...(p.exit_rules.length ? p.exit_rules.map((r) => `- **${r.rule} ${r.result}** — ${r.evidence}`) : ['None fired.']),
    '',
    '## App signals',
    '',
    ...(() => {
      const signals = Object.entries(p.app_signals ?? {}).filter(([, reasons]) => reasons.length);
      return signals.length ? signals.map(([area, reasons]) => `- ${area.replace(/_/g, ' ')}: ${reasons.join('; ')}`) : ['None — native Shopify covers the answers so far.'];
    })(),
    '',
    `## Open items (${s.open_items.length})`,
    '',
    ...(s.open_items.length ? s.open_items.map((i) => `- **${i.question_id}** ${i.question ?? ''} — ${i.why}`) : ['None.']),
    '',
  ];
  for (const section of s.sections) {
    lines.push(`## ${section.title}`, '', '| # | Question | Answer | Status |', '|---|---|---|---|');
    for (const q of section.questions) {
      const answer = [q.value, q.note ? `_${q.note}_` : ''].filter(Boolean).join('<br>');
      lines.push(`| ${q.id} | ${cell(q.text)} | ${cell(answer)} | ${STATE_LABEL[q.state]}${q.to_confirm ? ' (to confirm)' : ''} |`);
    }
    lines.push('');
  }
  if (s.documents.length) {
    lines.push('## Documents used', '', ...s.documents.map((d) => `- ${d.name} · ${d.type}${d.date ? ` · ${d.date}` : ''}${d.summary ? ` — ${d.summary}` : ''}`), '');
  }
  if (s.notes.length) {
    lines.push('## Consultant notes', '', ...s.notes.map((n) => `- ${n.at}: ${n.text}`), '');
  }
  return `${lines.join('\n').trim()}\n`;
}

export { STATE_LABEL };

/**
 * Where a record is in its own process.
 *
 * The offer and the status are two different axes and the list had them fighting:
 * "M · Ecommerce Scale" under Offer and "Larger Engagement" under Status, which
 * are an answer and its own supersession sitting side by side. The offer says
 * what commercial shape this is. This says how far along it is — and a bid and
 * an engagement are not far along the same thing.
 *
 * @param {object} e  an engagement summary
 */
export function statusOf(e) {
  const bid = e.process !== 'discovery';

  // A recorded outcome is the end of the story, whichever process it was.
  if (e.outcome && e.outcome !== 'submitted') {
    return { id: e.outcome, label: OUTCOME_LABEL[e.outcome] ?? e.outcome, tone: e.outcome === 'won' ? 'go' : e.outcome === 'lost' ? 'stop' : 'flag' };
  }
  if (e.outcome === 'submitted') return { id: 'bidded', label: 'Bidded', tone: 'go' };

  if (bid) {
    if (e.closing_document_at) return { id: 'proposal_written', label: 'Proposal written', tone: 'go' };
    if (e.clarifications_undecided) return { id: 'questions_to_decide', label: `${e.clarifications_undecided} questions to decide`, tone: 'flag' };
    if (e.clarifications_at) return { id: 'pending_questions', label: 'Questions with the client', tone: 'flag' };
    if (!e.documents) return { id: 'open', label: 'Open — nothing read yet', tone: '' };
    if (e.to_review) return { id: 'to_confirm', label: `${e.to_review} to confirm`, tone: 'flag' };
    return { id: 'reading', label: 'Read, not yet asked', tone: '' };
  }

  // A document saved before the interview finished is not an agreed scope. The
  // list read "Scope agreed" on a record 1 of 85 through its questions, because
  // this checked the document before it checked the work behind it.
  const cov = e.coverage ?? {};
  const covered = (cov.required_total ?? 0) > 0 && cov.required_answered >= cov.required_total;
  if (e.closing_document_at && covered) return { id: 'scope_agreed', label: 'Scope agreed', tone: 'go' };
  if (e.closing_document_at) return { id: 'document_ahead', label: 'Document ahead of the answers', tone: 'flag' };
  if (e.to_review) return { id: 'reviewing', label: `${e.to_review} to confirm`, tone: 'flag' };
  const c = e.coverage ?? {};
  if ((c.required_total ?? 0) && c.required_answered >= c.required_total) return { id: 'ready_to_close', label: 'Ready to close', tone: 'go' };
  return { id: 'interviewing', label: `Interviewing — ${c.required_answered ?? 0} of ${c.required_total ?? 0}`, tone: '' };
}

const OUTCOME_LABEL = { won: 'Won', lost: 'Lost', no_bid: 'No bid', withdrawn: 'Withdrawn' };
