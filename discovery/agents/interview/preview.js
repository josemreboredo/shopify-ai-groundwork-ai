/**
 * @file preview.js
 * @description Live preview during the interview: offer, scope gates,
 * L triggers, exit rules, route, plan suggestion and coverage, computed by the
 * same code as discovery.
 * A gate or trigger whose inputs are all unanswered is "unknown", not "inactive".
 *
 * @module interview/preview
 */

import { offering, questionBank } from '../../schema/index.js';
import { assemble } from '../discovery/engine.js';
import { classifyOffer } from '../discovery/classify.js';
import { evaluateExits } from '../discovery/exits.js';
import { appSignals } from '../discovery/app-signals.js';
import { planSuggestion } from '../discovery/plan.js';
import { isAnswered } from './session.js';
import { unansweredInMode } from './next.js';

/**
 * @param {object} answers
 * @param {string[]} inputs
 */
const anyInputKnown = (answers, inputs) => inputs.some((p) => !p.startsWith('/offer/') && isAnswered(answers, p));

/**
 * @param {import('./session.js').Session} session
 * @param {string} today
 */
export function preview(session, today) {
  const doc = assemble(session.answers, { today, clientSlug: session.client, source: 'chatbot' });
  doc.offer = classifyOffer(doc);
  const exits = evaluateExits(doc);

  const state = (definitions, computed) => Object.fromEntries(definitions.map((d) => [
    d.id,
    anyInputKnown(session.answers, d.inputs) ? (computed[d.id].active ? 'active' : 'inactive') : 'unknown',
  ]));
  const gates = state(offering.scope_gates, doc.offer.scope_gates);
  const lTriggers = state(offering.l_triggers, doc.offer.l_triggers);
  const unknown = [...Object.values(gates), ...Object.values(lTriggers)].filter((s) => s === 'unknown').length;

  const required = questionBank.questions.filter((q) => q.priority === 'required');
  const requiredIds = new Set(required.map((q) => q.id));
  const openRequired = unansweredInMode(session).filter((q) => q.priority === 'required' && !(q.id in session.tbc));
  const tbcRequired = Object.keys(session.tbc).filter((id) => requiredIds.has(id)).length;

  return {
    offer: {
      code: doc.offer.code,
      name: doc.offer.name,
      provisional: unknown > 0,
      ...(unknown > 0 ? { unknown_gates_or_triggers: unknown } : {}),
    },
    scope_gates: gates,
    l_triggers: lTriggers,
    exit_rules: exits.items.map((i) => ({ rule: i.rule_id, result: i.result, evidence: i.evidence })),
    go: !exits.triggered,
    ...(exits.triggered ? { route: doc.delivery?.route ?? 'not decided' } : {}),
    ...(planSuggestion(doc) ? { plan_suggestion: planSuggestion(doc) } : {}),
    app_signals: appSignals(doc),
    coverage: {
      required_answered: required.filter((q) => q.maps_to.some((p) => isAnswered(session.answers, p))).length,
      required_tbc: tbcRequired,
      required_open: openRequired.length,
      required_total: required.length,
    },
  };
}
