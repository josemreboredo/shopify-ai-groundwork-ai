#!/usr/bin/env node
/**
 * @file check-sources.mjs
 * @description Checks that every Shopify page we cite still exists and still
 * lives at the URL we cite. Nothing else in the pipeline does this: the approach
 * validator checks that a source is on an official domain, not that the page is
 * there — so a renamed help-centre page would go on being cited silently, and a
 * client would click through to a generic index.
 *
 * It classifies rather than pretends:
 *   ok       200, and the final URL is the one we cite
 *   moved    200, but it redirects somewhere else — the citation is stale
 *   blocked  403 or 429: help.shopify.com refuses scripted requests. Those pages
 *            are checked a second way — against Shopify's own sitemap, which
 *            robots.txt allows and which lists every published help article. A
 *            cited page that is not in the sitemap has been renamed or removed.
 *   dead     404, 410 or a network error
 *
 * Usage:
 *   npm run sources:check              # report
 *   npm run sources:check -- --strict  # exit 1 on moved or dead
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const CONCURRENCY = 8;

/** Every Shopify URL the tool can put in front of a client, with where it comes from. */
export function citedSources() {
  const found = new Map();
  const add = (url, where) => {
    if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/\S/.test(url) || url.includes('{')) return; // bare hosts and template URLs in code samples
    const clean = url.replace(/[.,;)\]]+$/, '');
    if (!found.has(clean)) found.set(clean, new Set());
    found.get(clean).add(where);
  };

  const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'ai/schema/question-bank.json'), 'utf8'));
  for (const q of bank.questions) {
    for (const u of q.teach?.sources ?? []) add(u, q.id);
    for (const n of q.shopify?.native ?? []) if (n.docs) add(n.docs, q.id);
    for (const e of q.shopify?.extension_points ?? []) if (e.docs) add(e.docs, q.id);
  }
  // The offering cites Shopify too, and for a while nothing checked it: the
  // gates carry the thresholds a price is argued from, so a page that moved
  // under one of them is worth more than a page that moved under a question.
  const offering = JSON.parse(fs.readFileSync(path.join(ROOT, 'ai/schema/offering.json'), 'utf8'));
  for (const g of offering.scope_gates ?? []) for (const u of g.sources ?? []) add(u, `gate:${g.id}`);
  for (const t of offering.l_triggers ?? []) for (const u of t.sources ?? []) add(u, `trigger:${t.id}`);
  for (const r of offering.exit_rules ?? []) for (const u of r.sources ?? []) add(u, `rule:${r.id}`);

  const refDir = path.join(ROOT, 'ai/docs/reference');
  for (const file of fs.readdirSync(refDir).filter((f) => f.endsWith('.md'))) {
    for (const m of fs.readFileSync(path.join(refDir, file), 'utf8').matchAll(/https:\/\/[^\s)\]—]+/g)) add(m[0], file.replace('.md', ''));
  }
  const engine = fs.readFileSync(path.join(ROOT, 'ai/engine/topology.js'), 'utf8');
  for (const m of engine.matchAll(/'(https:\/\/[^']+)'/g)) add(m[1], 'topology.js');
  const plan = fs.readFileSync(path.join(ROOT, 'ai/engine/plan.js'), 'utf8');
  for (const m of plan.matchAll(/`\$\{H\}([^`]+)`/g)) add(`https://help.shopify.com/en/manual/${m[1]}`, 'plan.js');

  return [...found.entries()].map(([url, where]) => ({ url, where: [...where] })).sort((a, b) => a.url.localeCompare(b.url));
}

const same = (a, b) => a.replace(/\/+$/, '') === b.replace(/\/+$/, '');

/** @param {{url: string, where: string[]}} source */
async function check(source) {
  try {
    const res = await fetch(source.url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (res.status === 403 || res.status === 429) return { ...source, state: 'blocked', status: res.status };
    if (res.status === 404 || res.status === 410) return { ...source, state: 'dead', status: res.status };
    if (!res.ok) return { ...source, state: 'dead', status: res.status };
    if (!same(res.url, source.url)) return { ...source, state: 'moved', status: res.status, final: res.url };
    return { ...source, state: 'ok', status: res.status };
  } catch (err) {
    return { ...source, state: 'dead', status: 'ERR', error: String(err.message ?? err).slice(0, 80) };
  }
}

const SITEMAP = 'https://help.shopify.com/sitemap-en.xml';
const bare = (url) => url.split('#')[0].split('?')[0].replace(/\/+$/, '');

/**
 * Every English help-centre article Shopify publishes. One request, no bot
 * protection, and robots.txt allows it — which is how the 160-odd pages that
 * refuse scripted requests get checked at all.
 *
 * @returns {Promise<Set<string>|null>} null when the sitemap itself cannot be read
 */
export async function helpCentreIndex() {
  try {
    const res = await fetch(SITEMAP, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
    if (!res.ok) return null;
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => bare(m[1]));
    return urls.length > 100 ? new Set(urls) : null;
  } catch {
    return null;
  }
}

/** The likeliest new home of a renamed page: same last segment, or same last two. */
function suggest(url, index) {
  const parts = bare(url).split('/');
  const last = parts.at(-1);
  const tail = parts.slice(-2).join('/');
  const candidates = [...index].filter((u) => u.endsWith(`/${tail}`) || u.endsWith(`/${last}`));
  return candidates.sort((a, b) => a.length - b.length).slice(0, 2);
}

export async function checkAll(sources = citedSources()) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < sources.length) out.push(await check(sources[i++]));
  }));
  return out.sort((a, b) => a.url.localeCompare(b.url));
}

async function main() {
  const sources = citedSources();
  console.log(`Checking ${sources.length} cited Shopify pages…\n`);
  const [results, index] = await Promise.all([checkAll(sources), helpCentreIndex()]);
  const by = (state) => results.filter((r) => r.state === state);

  for (const r of by('dead')) console.log(`✗ dead    ${r.url}\n          cited by ${r.where.join(', ')} — ${r.status} ${r.error ?? ''}`);
  for (const r of by('moved')) console.log(`→ moved   ${r.url}\n          now at ${r.final}\n          cited by ${r.where.join(', ')}`);

  // The pages that refuse scripted requests, checked against Shopify's sitemap.
  let unlisted = [];
  if (index) {
    unlisted = by('blocked').filter((r) => r.url.startsWith('https://help.shopify.com/') && !index.has(bare(r.url)));
    for (const r of unlisted) {
      const guesses = suggest(r.url, index);
      console.log(`? unlisted ${r.url}\n          not in Shopify's help-centre sitemap — renamed or removed\n          cited by ${r.where.join(', ')}${guesses.length ? `\n          try: ${guesses.join('\n               ')}` : ''}`);
    }
  } else {
    console.log('! the help-centre sitemap could not be read, so blocked pages were not checked');
  }

  console.log(`\nok ${by('ok').length} · moved ${by('moved').length} · dead ${by('dead').length}`
    + (index ? ` · in the sitemap ${by('blocked').length - unlisted.length} · unlisted ${unlisted.length}` : ` · unchecked ${by('blocked').length}`));
  if (process.argv.includes('--strict') && (by('dead').length || by('moved').length || unlisted.length)) process.exit(1);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
