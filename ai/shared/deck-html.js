/**
 * @file deck-html.js
 * @description The same filled deck templates as HTML, for the preview in the web
 * app (and for checking the layout without opening PowerPoint). Mirrors
 * `deck-render.js` — same slides, same styling, 16:9.
 *
 * @module ai/shared/deck-html
 */

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const arr = (value) => (Array.isArray(value) ? value : value === undefined || value === null || value === '' ? [] : [value]);
const li = (items = []) => `<ul>${arr(items).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const cells = (values = [], tag = 'td') => arr(values).map((v) => `<${tag}>${esc(v)}</${tag}>`).join('');
const head = (message, kicker) => `<div class="head"><span class="rule"></span><h2>${esc(message)}</h2>${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}</div>`;
const foot = (note) => (note ? `<p class="foot">${esc(note)}</p>` : '');

const SLIDE_HTML = {
  title: (s) => `<div class="dark title"><span class="rule"></span><h1>${esc(s.project)}</h1><p class="client">${esc(s.client)}</p><p class="sub">${esc(s.subtitle)}</p><p class="meta">${esc([s.consultant, s.date].filter(Boolean).join(' · '))}</p></div>`,

  agenda: (s) => `${head(s.headline)}<ol class="agenda">${arr(s.items).map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`,

  section: (s) => `<div class="dark section"><p class="num">${esc(s.number)}</p><h1>${esc(s.title)}</h1>${s.kicker ? `<p class="sub">${esc(s.kicker)}</p>` : ''}</div>`,

  statement: (s) => `<div class="dark statement"><span class="rule"></span><h1>${esc(s.headline)}</h1>${li(s.support)}${s.evidence ? `<p class="meta">${esc(s.evidence)}</p>` : ''}</div>`,

  bullets: (s) => `${head(s.headline)}<div class="body big">${li(s.bullets)}</div>${foot(s.footnote)}`,

  two_column: (s) => `${head(s.headline)}<div class="cols">
    <div class="box"><h3>${esc(s.left?.title)}</h3>${li(s.left?.bullets)}</div>
    <div class="box panel"><h3>${esc(s.right?.title)}</h3>${li(s.right?.bullets)}</div>
  </div>${foot(s.footnote)}`,

  kpis: (s) => `${head(s.headline)}<div class="cards">${arr(s.cards).map((c) => `
    <div class="card"><span class="rule"></span><p class="metric">${esc(c.metric)}</p><p class="value">${esc(c.baseline)} → ${esc(c.target)}</p><p class="horizon">${esc(c.horizon ?? '')}</p></div>`).join('')}</div>${foot(s.footnote)}`,

  decision: (s) => `${head(s.decision, `${s.topic} — ${s.question}`)}
    <table><thead><tr>${cells(['Option', 'Pros', 'Cons'], 'th')}</tr></thead><tbody>
      ${arr(s.options).map((o) => `<tr class="${o.chosen ? 'chosen' : ''}">${cells([`${o.chosen ? '✓ ' : ''}${o.option}`, o.pros, o.cons])}</tr>`).join('')}
    </tbody></table>
    <div class="callout"><p>${esc(s.rationale)}</p><p class="tags">${esc([s.status && `Status: ${s.status}`, s.plan_impact && `Plan impact: ${s.plan_impact}`, s.evidence && `Evidence: ${s.evidence}`].filter(Boolean).join('   ·   '))}</p></div>
    ${foot(arr(s.sources).join('  ·  '))}`,

  problem_solution: (s) => `${head(s.shopify_answer, `${s.problem}${s.evidence ? `   ·   ${s.evidence}` : ''}`)}
    <div class="cost"><h3>What it costs today</h3><p>${esc(s.cost_today)}</p></div>
    <div class="box panel changes"><h3>What changes</h3>${li(s.what_changes)}</div>
    ${s.measure ? `<p class="measure">Measured by: ${esc(s.measure)}</p>` : ''}
    ${foot(arr(s.sources).join('  ·  '))}`,

  requirement: (s) => `${head(s.decision, `${s.requirement}${s.evidence ? `   ·   ${s.evidence}` : ''}`)}
    <p class="level ${esc(String(s.level).toLowerCase())}">${esc(String(s.level).toUpperCase())}</p>
    <div class="grid">
      <div class="box panel"><h3>What Shopify does as standard</h3><p>${esc(s.shopify_standard)}</p></div>
      <div class="box panel"><h3>Why this and not less</h3><p>${esc(s.why)}</p></div>
      <div class="box"><h3>What this covers</h3>${li(s.covers)}</div>
      <div class="box warn"><h3>What it does not cover</h3>${li(s.not_covered)}</div>
    </div>${foot(arr(s.sources).join('  ·  '))}`,

  app_case: (s) => `${head(`${s.app} — ${s.requirement}`, s.cost ? `List price: ${s.cost}` : '')}
    <div class="callout"><h3>Why an app at all</h3><p>${esc(s.native_gap)}</p></div>
    <div class="cols">
      <div class="box"><h3>What it covers</h3>${li(s.covers)}</div>
      <div class="box warn"><h3>What it does not cover</h3>${li(s.not_covered)}</div>
    </div>
    ${arr(s.alternatives).length ? `<h3 class="also">Also considered</h3>${li(arr(s.alternatives).map((a) => `${a.option} — ${a.why_not}`))}` : ''}
    ${foot(arr(s.sources).join('  ·  '))}`,

  gaps: (s) => `${head(s.headline)}<table><thead><tr>${cells(['Requirement', 'Status', 'What it means', 'What we propose'], 'th')}</tr></thead><tbody>
    ${arr(s.items).map((i) => `<tr>${cells([i.requirement, i.status, i.consequence, i.option])}</tr>`).join('')}</tbody></table>${foot(s.footnote)}`,

  integration: (s) => `${head(`${s.system} — ${s.role}`, [s.pattern, s.direction, s.frequency].filter(Boolean).join('   ·   '))}
    <div class="cols">
      <div class="box panel"><h3>Shopify side</h3>${li(s.apis)}</div>
      <div class="box warn"><h3>When it fails</h3><p>${esc(s.failure)}</p></div>
    </div>${s.evidence ? `<p class="tags">Evidence: ${esc(s.evidence)}</p>` : ''}${foot(arr(s.sources).join('  ·  '))}`,

  data_model: (s) => `${head(s.headline)}<table><thead><tr>${cells(['Object', 'Kind', 'Name', 'Purpose', 'Written by'], 'th')}</tr></thead><tbody>
    ${arr(s.entries).map((e) => `<tr>${cells([e.object, e.kind, e.name, e.purpose, e.source])}</tr>`).join('')}</tbody></table>
    ${arr(s.not_modelled).length ? `<div class="box warn spaced"><h3>What Shopify cannot model</h3>${li(s.not_modelled)}</div>` : ''}${foot(s.footnote)}`,

  migration: (s) => `${head(s.headline)}<table><thead><tr>${cells(['Data', 'Volume', 'How it moves'], 'th')}</tr></thead><tbody>
    ${arr(s.moves).map((m) => `<tr>${cells([m.data, m.volume ?? '', m.how])}</tr>`).join('')}</tbody></table>
    <div class="cols spaced">
      <div class="box warn"><h3>What does not move</h3>${li(s.does_not_move)}</div>
      <div class="box panel"><h3>Cut-over</h3><ol>${arr(s.cutover).map((c) => `<li>${esc(c)}</li>`).join('')}</ol></div>
    </div>${foot(arr(s.sources).join('  ·  '))}`,

  nfr: (s) => `${head(s.headline)}<table><thead><tr>${cells(['Area', 'Target', 'How we meet it', 'How it is verified'], 'th')}</tr></thead><tbody>
    ${arr(s.items).map((i) => `<tr>${cells([i.area, i.target, i.approach, i.verified])}</tr>`).join('')}</tbody></table>${foot(s.footnote)}`,

  open_decisions: (s) => `${head(s.headline)}<table><thead><tr>${cells(['Decision', 'Owner', 'Needed by', 'If it slips'], 'th')}</tr></thead><tbody>
    ${arr(s.decisions).map((d) => `<tr>${cells([d.decision, d.owner, d.needed_by, d.if_late])}</tr>`).join('')}</tbody></table>${foot(s.footnote)}`,

  out_of_scope: (s) => `${head(s.headline)}<div class="cols">
    <div class="box panel"><h3>Later phases</h3>${li(s.later_phases)}</div>
    <div class="box warn"><h3>Not included</h3>${li(s.exclusions)}</div></div>${foot(s.footnote)}`,

  operating_model: (s) => `${head(s.headline, s.support ? `Support model: ${s.support}` : '')}
    <table><thead><tr>${cells(['Area', 'Client', 'Merkle'], 'th')}</tr></thead><tbody>
    ${arr(s.responsibilities).map((r) => `<tr>${cells([r.area, r.client, r.merkle])}</tr>`).join('')}</tbody></table>
    ${arr(s.enablement).length ? `<h3 class="also">Handover and enablement</h3>${li(s.enablement)}` : ''}${foot(s.footnote)}`,

  run_cost: (s) => `${head(s.headline)}<table><thead><tr>${cells(['Item', 'Cost', 'Period', 'Note'], 'th')}</tr></thead><tbody>
    ${arr(s.items).map((i) => `<tr>${cells([i.item, i.cost, i.period, i.note ?? ''])}</tr>`).join('')}</tbody></table>
    ${s.total ? `<p class="total">Known monthly total: ${esc(s.total)}</p>` : ''}${foot(s.footnote)}`,

  ai_commerce: (s) => `${head(s.headline)}<div class="cost"><h3>Where you stand today</h3><p>${esc(s.today)}</p></div>
    <div class="cols">
      <div class="box warn"><h3>What you must decide</h3>${li(s.decisions)}</div>
      <div class="box"><h3 class="navy-text">What has to be ready</h3>${li(s.readiness)}</div>
    </div>${foot(s.footnote)}`,

  conclusion: (s) => `<div class="dark conclusion"><span class="rule"></span><h1>${esc(s.headline)}</h1>
    <div class="three">
      <div><h3>What it delivers</h3>${li(s.delivers)}</div>
      <div><h3 class="warn-text">What it does not solve</h3>${li(s.limits)}</div>
      <div><h3>What we need from you</h3>${li(s.ask)}</div>
    </div>${s.evidence ? `<p class="meta">${esc(s.evidence)}</p>` : ''}</div>`,

  architecture: (s) => `${head(s.headline)}<div class="layers">${arr(s.layers).map((l, i) => `
    <div class="layer"><div class="layer-name ${i === 0 ? 'first' : ''}">${esc(l.name)}</div>
      <div class="layer-items">${arr(l.items).map((item) => `<span class="chip">${esc(item)}</span>`).join('')}</div></div>`).join('')}</div>${foot(s.footnote)}`,

  table: (s) => `${head(s.headline)}<table><thead><tr>${cells(arr(s.columns), 'th')}</tr></thead><tbody>
    ${arr(s.rows).map((r) => `<tr>${cells(r)}</tr>`).join('')}</tbody></table>${foot(s.footnote)}`,

  risks: (s) => `${head(s.headline)}<table><thead><tr>${cells(['Risk', 'Likelihood', 'Impact', 'Mitigation', 'Owner'], 'th')}</tr></thead><tbody>
    ${arr(s.risks).map((r) => `<tr>${cells([r.risk, r.likelihood, r.impact, r.mitigation, r.owner])}</tr>`).join('')}</tbody></table>${foot(s.footnote)}`,

  roadmap: (s) => `${head(s.headline)}<div class="phases">${arr(s.phases).map((p, i) => `
    <div class="phase"><div class="phase-head ${i === 0 ? 'first' : ''}"><strong>${esc(p.name)}</strong>${p.timing ? `<span>${esc(p.timing)}</span>` : ''}</div>${li(p.items)}</div>`).join('')}</div>${foot(s.footnote)}`,

  split: (s) => `${head(s.headline)}<div class="bar">${arr(s.segments).map((g, i) => `
    <span class="seg s${i}" style="width:${Math.max(Number(g.percent) || 0, 2)}%">${Math.round(Number(g.percent) || 0)}%</span>`).join('')}</div>
    <ul class="legend">${arr(s.segments).map((g, i) => `<li><span class="dot s${i}"></span>${esc(g.label)} — ${esc(g.value)}</li>`).join('')}</ul>${foot(s.footnote)}`,

  next_steps: (s) => `${head(s.headline)}<div class="cols">
    <div class="box"><h3 class="navy-head">Merkle</h3>${li(s.merkle)}</div>
    <div class="box"><h3 class="red-head">Client</h3>${li(s.client)}</div>
  </div>${s.dates ? `<p class="dates">${esc(s.dates)}</p>` : ''}`,

  investment: (s) => `${head(s.headline)}<div class="cols">
    <div class="box dark-box"><p class="offer">${esc(s.offer)}</p><p class="band">${esc(s.band)}</p></div>
    <div class="box"><h3>Recurring, billed by third parties</h3>${li(s.recurring)}</div>
  </div>${s.note ? `<p class="foot">${esc(s.note)}</p>` : ''}`,
};

/** The layouts a deck can be built from — the count the public pages quote. */
export const SLIDE_LAYOUTS = Object.keys(SLIDE_HTML);

const CSS = `
:root { --ink:#0A1540; --navy:#040E4B; --red:#DD3039; --muted:#60607D; --line:#D6D6DF; --panel:#F2F2F4; }
* { box-sizing:border-box; }
body { margin:0; background:#E9E9EE; font-family:'Figtree',Arial,system-ui,sans-serif; color:var(--ink); }
.slide { width:1280px; height:720px; background:#fff; margin:20px auto; padding:56px 64px 48px; position:relative; overflow:hidden; box-shadow:0 2px 12px rgba(10,21,64,.12); }
.slide .num-badge { position:absolute; right:32px; bottom:18px; font-size:12px; color:var(--muted); }
.slide .brand { position:absolute; left:64px; bottom:18px; font-size:11px; color:var(--muted); letter-spacing:.02em; }
.rule { display:block; width:52px; height:5px; background:var(--red); margin-bottom:18px; }
h1 { font-size:46px; line-height:1.06; margin:0 0 14px; letter-spacing:-0.01em; }
h2 { font-size:30px; line-height:1.15; margin:0 0 6px; letter-spacing:-0.01em; }
h3 { font-size:14px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:0 0 8px; }
.kicker { color:var(--muted); font-size:16px; margin:2px 0 0; }
.head { margin-bottom:22px; }
.dark { position:absolute; inset:0; background:#000; color:#fff; padding:64px; display:flex; flex-direction:column; justify-content:center; }
.dark h1 { color:#fff; }
.dark .client { font-size:24px; margin:0 0 14px; }
.dark .sub, .dark li { color:#C9C9D6; font-size:18px; }
.dark .meta { color:#8888A1; font-size:14px; margin-top:auto; }
.dark .num { color:var(--red); font-weight:700; font-size:18px; margin:0 0 10px; letter-spacing:.08em; }
.statement h1 { font-size:38px; max-width:78%; }
ul { margin:0; padding-left:20px; } li { margin:7px 0; font-size:17px; line-height:1.4; }
.body.big li { font-size:19px; }
.agenda { columns:2; column-gap:48px; padding-left:22px; } .agenda li { font-size:18px; margin:10px 0; }
table { width:100%; border-collapse:collapse; margin-top:4px; }
th { background:var(--navy); color:#fff; text-align:left; font-size:13px; padding:10px 12px; font-weight:700; }
td { padding:10px 12px; font-size:14px; border-bottom:1px solid var(--line); vertical-align:top; }
tbody tr:nth-child(even) td { background:var(--panel); }
tr.chosen td { font-weight:600; box-shadow:inset 3px 0 0 var(--red); }
.callout { background:var(--panel); border-left:5px solid var(--red); padding:14px 18px; margin-top:18px; }
.callout p { margin:0; font-size:15px; } .callout .tags { margin-top:8px; font-size:13px; font-weight:700; color:var(--navy); }
.cols { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.box { border:1px solid var(--line); padding:16px 18px; } .box.panel { background:var(--panel); }
.box.warn { border-color:var(--red); background:#FFF3F3; } .box.warn h3 { color:var(--red); }
.box p { margin:0; font-size:15px; line-height:1.45; }
.level { display:inline-block; background:var(--navy); color:#fff; font-size:11px; font-weight:700; letter-spacing:.08em; padding:4px 12px; margin:0 0 14px; }
.level.custom { background:var(--red); } .level.app { background:#41547D; }
.cards { display:grid; grid-auto-flow:column; gap:18px; }
.card { background:var(--panel); padding:18px; } .card .rule { width:100%; height:5px; margin:-18px -18px 14px; width:calc(100% + 36px); }
.card .metric { color:var(--muted); font-size:15px; margin:0 0 10px; } .card .value { font-size:26px; font-weight:700; margin:0; } .card .horizon { color:var(--muted); font-size:14px; margin:6px 0 0; }
.layers { display:grid; gap:12px; }
.layer { display:grid; grid-template-columns:230px 1fr; gap:14px; align-items:center; }
.layer-name { background:var(--panel); padding:14px 16px; font-weight:700; font-size:15px; } .layer-name.first { background:var(--navy); color:#fff; }
.layer-items { display:flex; gap:10px; flex-wrap:wrap; }
.chip { border:1px solid var(--line); padding:10px 14px; font-size:14px; background:#fff; }
.phases { display:grid; grid-auto-flow:column; gap:14px; }
.phase-head { background:var(--panel); padding:10px 14px; display:flex; flex-direction:column; } .phase-head.first { background:var(--navy); color:#fff; }
.phase-head span { font-size:12px; color:var(--muted); } .phase-head.first span { color:#C9C9D6; }
.phase li { font-size:14px; }
.bar { display:flex; height:54px; margin:10px 0 22px; } .seg { color:#fff; font-weight:700; display:flex; align-items:center; justify-content:center; font-size:17px; }
.s0 { background:var(--navy); } .s1 { background:#41547D; } .s2 { background:var(--red); } .s3 { background:var(--muted); }
.legend { list-style:none; padding:0; } .legend li { display:flex; align-items:center; gap:10px; font-size:16px; }
.legend .dot { width:14px; height:14px; display:inline-block; }
.navy-head { color:#fff; background:var(--navy); padding:8px 12px; margin:-16px -18px 12px; }
.red-head { color:#fff; background:var(--red); padding:8px 12px; margin:-16px -18px 12px; }
.dates { background:var(--panel); padding:12px 16px; font-weight:700; margin-top:16px; }
.dark-box { background:#000; color:#fff; border:0; } .dark-box .offer { color:#C9C9D6; font-size:15px; margin:0 0 10px; } .dark-box .band { font-size:32px; font-weight:700; margin:0; }
.also { margin-top:16px; }
.spaced { margin-top:14px; }
.total { background:#000; color:#fff; padding:12px 16px; font-weight:700; margin:14px 0 0; }
.tags { font-size:13px; font-weight:700; color:var(--navy); margin:12px 0 0; }
.navy-text { color:var(--navy); } .warn-text { color:#FF8A8A; }
.conclusion h1 { font-size:34px; max-width:88%; margin-bottom:26px; }
.three { display:grid; grid-template-columns:1fr 1fr 1fr; gap:26px; }
.three h3 { color:#C9C9D6; } .three li { font-size:15px; color:#fff; }
.cost { background:#000; color:#fff; padding:14px 18px; margin-bottom:14px; } .cost h3 { color:#C9C9D6; margin-bottom:6px; } .cost p { margin:0; font-size:16px; }
.changes { margin-bottom:14px; }
.measure { border:2px solid var(--red); color:var(--red); font-weight:700; padding:10px 16px; margin:0; font-size:15px; }
.foot { position:absolute; left:64px; right:64px; bottom:40px; font-size:12px; color:var(--muted); margin:0; }
`;

/**
 * The deck as a standalone HTML page, one slide per 16:9 frame.
 *
 * @param {{ slides: Array<object> }} deck
 * @param {{ client?: string, version?: string }} [options]
 * @returns {string}
 */
export function deckToHtml(deck, { client = '', version = '' } = {}) {
  const slides = (Array.isArray(deck?.slides) ? deck.slides : []).map((s, i) => {
    const render = SLIDE_HTML[s.layout];
    if (!render) return '';
    const dark = s.layout === 'title' || s.layout === 'section' || s.layout === 'statement';
    return `<section class="slide${dark ? ' is-dark' : ''}">${render(s)}
      ${dark ? '' : `<span class="brand">${esc([client, version && `v${version}`].filter(Boolean).join('  ·  '))}</span><span class="num-badge">${i + 1}</span>`}
    </section>`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(client)} — Discovery Closing Deck${version ? ` v${version}` : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>${slides}</body></html>`;
}
