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
 *   blocked  403 or 429: help.shopify.com refuses scripted requests, so the page
 *            cannot be checked from a script. Not a failure, and not a pass.
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

  const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'discovery/schema/question-bank.json'), 'utf8'));
  for (const q of bank.questions) {
    for (const u of q.teach?.sources ?? []) add(u, q.id);
    for (const n of q.shopify?.native ?? []) if (n.docs) add(n.docs, q.id);
    for (const e of q.shopify?.extension_points ?? []) if (e.docs) add(e.docs, q.id);
  }
  const refDir = path.join(ROOT, 'discovery/docs/reference');
  for (const file of fs.readdirSync(refDir).filter((f) => f.endsWith('.md'))) {
    for (const m of fs.readFileSync(path.join(refDir, file), 'utf8').matchAll(/https:\/\/[^\s)\]—]+/g)) add(m[0], file.replace('.md', ''));
  }
  const engine = fs.readFileSync(path.join(ROOT, 'discovery/agents/discovery/topology.js'), 'utf8');
  for (const m of engine.matchAll(/'(https:\/\/[^']+)'/g)) add(m[1], 'topology.js');
  const plan = fs.readFileSync(path.join(ROOT, 'discovery/agents/discovery/plan.js'), 'utf8');
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
  const results = await checkAll(sources);
  const by = (state) => results.filter((r) => r.state === state);

  for (const r of by('dead')) console.log(`✗ dead    ${r.url}\n          cited by ${r.where.join(', ')} — ${r.status} ${r.error ?? ''}`);
  for (const r of by('moved')) console.log(`→ moved   ${r.url}\n          now at ${r.final}\n          cited by ${r.where.join(', ')}`);

  console.log(`\nok ${by('ok').length} · moved ${by('moved').length} · dead ${by('dead').length} · blocked ${by('blocked').length} (help.shopify.com refuses scripted requests — check those by hand)`);
  if (process.argv.includes('--strict') && (by('dead').length || by('moved').length)) process.exit(1);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
