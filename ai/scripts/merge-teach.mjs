/**
 * Merge `teach` blocks written per section (scratchpad/why/*.out.json) into the
 * question bank. Validates shape and drops anything that does not belong to a
 * known question. Usage: node ai/scripts/merge-teach.mjs <dir>
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
const bankPath = new URL('../schema/question-bank.json', import.meta.url);
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
const byId = new Map(bank.questions.map((q) => [q.id, q]));

let merged = 0; const problems = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.out.json'))) {
  const blocks = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  for (const [id, raw] of Object.entries(blocks)) {
    const q = byId.get(id);
    if (!q) { problems.push(`${file}: unknown question ${id}`); continue; }
    if (!raw?.why?.trim()) { problems.push(`${file}: ${id} has no why`); continue; }
    const teach = { why: raw.why.trim() };
    if (Array.isArray(raw.options) && raw.options.length) {
      teach.options = raw.options.filter((o) => o?.option && o?.pros && o?.cons)
        .map((o) => ({ option: String(o.option).trim(), pros: String(o.pros).trim(), cons: String(o.cons).trim() }));
      if (!teach.options.length) delete teach.options;
    }
    if (raw.limits?.trim()) teach.limits = raw.limits.trim();
    const sources = (raw.sources ?? []).filter((s) => /^https:\/\//.test(s));
    if (sources.length) teach.sources = [...new Set(sources)];
    q.teach = teach;
    merged++;
  }
}
fs.writeFileSync(bankPath, `${JSON.stringify(bank, null, 2)}\n`);
const missing = bank.questions.filter((q) => !q.teach).map((q) => q.id);
console.log(`merged ${merged} teach blocks · ${bank.questions.length - missing.length}/${bank.questions.length} questions explained`);
if (missing.length) console.log(`still missing (${missing.length}): ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? '…' : ''}`);
for (const p of problems) console.log('!', p);
