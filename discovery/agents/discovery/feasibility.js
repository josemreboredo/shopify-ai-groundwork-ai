/**
 * @file feasibility.js
 * @description Can this client actually operate what we are recommending?
 *
 * The engine decides what can be built. Nothing until now asked whether the
 * business on the other side of the table can run it: a two-person team with no
 * developer and a "we'll manage it ourselves" support model, handed a two-store
 * estate and three custom builds, has been sold something technically correct and
 * operationally impossible. "Technically yes, organisationally no" is the sentence
 * a consultant adds over an architect, and it was missing from every document this
 * tool produced.
 *
 * The facts are already in the questionnaire — how many people get an admin login,
 * what support model they expect, whether a retainer is signed, what they said
 * they would pay monthly for apps. This reads the drafted solution against them.
 *
 * It deliberately does not repeat the engine's own rules: exit rule 11.15 already
 * covers a launch date that does not fit the offer, and 11.16 covers a missing
 * decision-maker. These findings are about the *solution* meeting the
 * *organisation*, which no rule looks at.
 *
 * @module discovery/feasibility
 */

import { runCostFor } from './economics.js';

/** Support models that mean nobody is contracted to change the store after launch. */
const UNSUPPORTED = new Set(['self_sufficient']);

/**
 * What the client told us about their capacity to run this.
 *
 * @param {object} doc
 * @returns {object}
 */
export function organisationalProfile(doc) {
  const d = doc.delivery ?? {};
  const retainer = d.grow_retainer ?? {};
  return {
    admin_users: doc.shopify?.staff_users,
    support_model: d.support_model,
    retainer_signed: retainer.signed === true,
    retainer_months: retainer.months,
    training_requested: (d.training ?? []).length > 0,
    sops_required: d.sops_required === true,
    platform_watch: d.platform_watch,
    app_budget_monthly: doc.business?.app_cost_ceiling_monthly,
    stakeholders: (doc.stakeholders ?? []).length,
    from: ['Q1.2.6 admin logins', 'Q10.3.1 training', 'Q10.3.3 support model', 'Q10.3.4 retainer', 'Q0.6.3 monthly app ceiling'],
  };
}

/**
 * Where the recommendation asks more of the client's organisation than the client
 * said it has.
 *
 * @param {object} payload  Drafted approach
 * @param {object} doc      Decided engagement
 * @returns {{ id: string, severity: 'high'|'medium', finding: string, why_it_matters: string, evidence: string }[]}
 */
export function feasibilityFindings(payload, doc) {
  const out = [];
  const p = organisationalProfile(doc);
  const capabilities = payload.capability_map ?? [];
  const custom = capabilities.filter((c) => c.resolution === 'custom');
  const tierHigh = capabilities.filter((c) => ['T3', 'T4'].includes(c.gaia_tier));
  const noOneToCallLater = UNSUPPORTED.has(p.support_model) && !p.retainer_signed;

  // 1 — a solution only a developer can change, and nobody contracted to change it
  if (custom.length && noOneToCallLater) {
    out.push({
      id: 'custom-without-support',
      severity: 'high',
      finding: `${custom.length} requirement${custom.length > 1 ? 's are' : ' is'} resolved with custom work, and the client expects to run the store themselves with no retainer signed`,
      why_it_matters: 'Custom work needs a developer for every future change. Without one contracted, the store freezes at go-live and the first Shopify release that breaks it has no owner',
      evidence: `Q10.3.3 support model "${p.support_model}" · Q10.3.4 retainer not signed · ${custom.map((c) => c.requirement).slice(0, 3).join('; ')}`,
    });
  }

  // 2 — a multi-store estate against the size of the team that has to run it
  const topology = doc.markets?.topology?.recommendation;
  if (['expansion_stores', 'hybrid'].includes(topology)) {
    const small = (p.admin_users ?? 0) > 0 && p.admin_users <= 5;
    if (small || noOneToCallLater) {
      out.push({
        id: 'multi-store-vs-team',
        severity: 'high',
        finding: `The topology is ${topology.replace(/_/g, ' ')} — every catalogue, theme and app change is made in each store — and the client has ${p.admin_users ?? 'an unstated number of'} admin users${noOneToCallLater ? ' with no support contracted after launch' : ''}`,
        why_it_matters: 'Nothing is synced between Shopify stores. A second estate is a permanent tax on a team that may not have the hands for it, and it is the client who pays it every day',
        evidence: `Q1.2.6 ${p.admin_users ?? 'not answered'} admin logins · Q10.3.3 ${p.support_model ?? 'not answered'}`,
      });
    }
  }

  // 3 — the app bill against the ceiling the client gave us
  const ceiling = p.app_budget_monthly;
  const subs = runCostFor(doc).totals.subscriptions_per_month;
  if (ceiling?.amount !== undefined) {
    for (const [currency, amount] of Object.entries(subs)) {
      const comparable = !ceiling.currency || ceiling.currency === currency;
      if (comparable && amount > ceiling.amount) {
        out.push({
          id: `app-budget:${currency}`,
          severity: 'high',
          finding: `The recommended apps come to ${amount} ${currency} a month against a stated ceiling of ${ceiling.amount} ${ceiling.currency ?? currency}`,
          why_it_matters: 'The client named the number; a shortlist above it is a conversation to have in the document, not a surprise on the first invoice',
          evidence: 'Q0.6.3 monthly app ceiling',
        });
      }
    }
  }

  // 4 — work that lands on the client's team, with no training asked for
  const merchantWork = capabilities.filter((c) => ['app', 'theme'].includes(c.resolution)).length;
  if (merchantWork >= 3 && !p.training_requested && !p.sops_required) {
    out.push({
      id: 'no-training-for-new-work',
      severity: 'medium',
      finding: `${merchantWork} requirements land in tools the client's team operates day to day, and no training or written procedure was asked for`,
      why_it_matters: 'A capability nobody was taught to use is a capability the client does not have, whatever the document says',
      evidence: 'Q10.3.1 training · Q10.3.2 SOPs',
    });
  }

  // 5 — a T3/T4 build against a team that expects to be self-sufficient
  if (tierHigh.length >= 2 && UNSUPPORTED.has(p.support_model)) {
    out.push({
      id: 'complexity-vs-self-sufficiency',
      severity: 'medium',
      finding: `${tierHigh.length} requirements are new capabilities or integrations (T3/T4) and the client expects to be self-sufficient after launch`,
      why_it_matters: 'Self-sufficiency is realistic for configuration and content, and rarely for integrations and data models. Say which half the client will own',
      evidence: `Q10.3.3 ${p.support_model} · ${tierHigh.map((c) => c.requirement).slice(0, 3).join('; ')}`,
    });
  }

  // 6 — nobody watching the platform, on a solution that depends on it moving
  if (p.platform_watch === false && (custom.length || tierHigh.length)) {
    out.push({
      id: 'no-platform-watch',
      severity: 'medium',
      finding: 'The client will not re-verify apps and Shopify features at each Edition, and the solution depends on capabilities that change twice a year',
      why_it_matters: 'Shopify ships in Editions and deprecates on a published schedule. Somebody has to be reading those notes, or the store rots quietly',
      evidence: 'Q10.3.6 platform watch',
    });
  }

  return out;
}
