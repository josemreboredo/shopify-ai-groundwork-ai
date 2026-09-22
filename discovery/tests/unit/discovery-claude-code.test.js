/**
 * Claude Code mode: prepare → (agent writes extraction.json) → assemble →
 * (agent writes approach.json) → finish. The agent's files are replayed from
 * the golden fixtures; everything runs in temporary directories.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs   from 'node:fs';
import os   from 'node:os';
import path from 'node:path';

import { prepare, assembleWork, finishWork, workName, WORK_FILES, ACCOUNT_NOTICE } from '../../agents/discovery/claude-code.js';
import { flattenAnswers } from '../../agents/discovery/extract.js';
import { toApproachPayload } from '../../agents/discovery/approach.js';
import { InputRejectedError } from '../../agents/discovery/input.js';

const ROOT = path.join(import.meta.dirname, '..', '..');
const load = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'engagements', name), 'utf8'));
const ACME_MD = path.join(ROOT, 'docs', 'example-acme-questionnaire.md');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'discover-cc-'));
const write = (dir, name, value) => fs.writeFileSync(path.join(dir, name), typeof value === 'string' ? value : JSON.stringify(value));

/** What Claude Code would write as extraction.json for a fixture. */
function extractionFor(fixture) {
  const { schema_version, offer, exits, approach, provenance, notes, ...answers } = structuredClone(fixture);
  delete answers.meta.source;
  delete answers.meta.updated_at;
  delete answers.delivery?.go;
  return {
    answers: flattenAnswers(answers),
    provenance: Object.entries(provenance ?? {}).map(([pointer, p]) => ({ pointer, source: p.source, status: p.status, question_id: p.question_id ?? '', note: p.note ?? '' })),
    exit_candidates: [],
    open_items: (approach?.risks?.open_items ?? []).map((o) => ({ pointer: o.pointer, question_id: o.question_id ?? '', why: o.why })),
  };
}

/** A consent-only questionnaire file for fixtures without their own questionnaire. */
function consentFile(dir) {
  const file = path.join(dir, 'client-questionnaire.md');
  fs.writeFileSync(file, '**Q10.5.2** — Consent? *(required · consultant)*\n\n- [x] Yes\n- [ ] No\n');
  return file;
}

describe('Claude Code mode', () => {
  test('prepare refuses without consent and writes nothing', () => {
    const root = tmp();
    const file = path.join(root, 'q.md');
    fs.writeFileSync(file, '# no consent');
    assert.throws(() => prepare({ questionnaire: file, workRoot: root, today: '2026-09-16' }), InputRejectedError);
    assert.deepEqual(fs.readdirSync(root), ['q.md']);
  });

  test('prepare writes the redacted questionnaire, instructions and schema — never the original', () => {
    const root = tmp();
    const file = path.join(root, 'nordlicht-questionnaire.md');
    fs.writeFileSync(file, '**Q10.5.2** — Consent?\n\n- [x] Yes\n- [ ] No\n\nContact: owner@nordlicht.example\n');
    const { workDir, redactions } = prepare({ questionnaire: file, workRoot: root, today: '2026-09-16' });

    assert.equal(path.basename(workDir), 'nordlicht');
    assert.equal(redactions.emails, 1);
    assert.deepEqual(fs.readdirSync(workDir).sort(),
      [WORK_FILES.extractionInstructions, WORK_FILES.extractionSchema, WORK_FILES.questionnaire, WORK_FILES.state].sort());
    assert.doesNotMatch(fs.readFileSync(path.join(workDir, WORK_FILES.questionnaire), 'utf8'), /owner@nordlicht/);
  });

  for (const [file, questionnaire] of [['acme-watches.json', ACME_MD], ['foundation-minimal.json', null], ['stop-custom-checkout.json', null]]) {
    test(`${file}: prepare → assemble → finish reproduces the golden engagement`, () => {
      const fixture = load(file);
      const root = tmp();
      const outDir = tmp();
      const { workDir } = prepare({ questionnaire: questionnaire ?? consentFile(root), client: fixture.meta.client.slug, workRoot: root, today: '2026-09-16' });

      write(workDir, WORK_FILES.extraction, extractionFor(fixture));
      const assembled = assembleWork({ workDir });
      assert.equal(assembled.ok, true, JSON.stringify(assembled.errors));
      assert.equal(assembled.doc.offer.code, fixture.offer.code);
      assert.equal(fs.existsSync(path.join(workDir, WORK_FILES.approachInstructions)), fixture.delivery.go);

      if (fixture.delivery.go) {
        const finishedEarly = finishWork({ workDir, outDir });
        assert.equal(finishedEarly.ok, false, 'GO without approach.json must fail');
        write(workDir, WORK_FILES.approach, toApproachPayload(fixture.approach));
      }

      const finished = finishWork({ workDir, outDir });
      assert.equal(finished.ok, true, JSON.stringify(finished.errors));
      const { engagement } = finished;
      assert.deepEqual(engagement.exits.items.map((i) => `${i.rule_id}:${i.result}`), fixture.exits.items.map((i) => `${i.rule_id}:${i.result}`));
      assert.equal(engagement.delivery.go, fixture.delivery.go);
      assert.deepEqual(engagement.provenance, fixture.provenance);
      const expectedFiles = fixture.delivery.go
        ? ['app-shortlist.md', 'architecture.md', 'capability-map.md', 'delivery-plan.md', 'engagement.json', 'risks.md']
        : ['engagement.json', 'stop-report.md'];
      assert.deepEqual(fs.readdirSync(path.join(outDir, fixture.meta.client.slug)).sort(), expectedFiles);
    });
  }

  test('assemble reports shape and validation problems so the agent can fix them', () => {
    const root = tmp();
    const { workDir } = prepare({ questionnaire: consentFile(root), client: 'nordlicht-apparel', workRoot: root, today: '2026-09-16' });

    assert.match(assembleWork({ workDir }).errors[0], /extraction\.json not found/);

    write(workDir, WORK_FILES.extraction, 'not json');
    assert.match(assembleWork({ workDir }).errors[0], /not valid JSON/);

    write(workDir, WORK_FILES.extraction, { answers: [] });
    assert.equal(assembleWork({ workDir }).ok, false);

    const bad = extractionFor(load('foundation-minimal.json'));
    bad.answers.push({ pointer: '/offer/code', value_json: '"S"' });
    write(workDir, WORK_FILES.extraction, bad);
    const result = assembleWork({ workDir });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes('/offer/code')));
  });

  test('finish --dry-run writes nothing', () => {
    const fixture = load('stop-custom-checkout.json');
    const root = tmp();
    const outDir = tmp();
    const { workDir } = prepare({ questionnaire: consentFile(root), client: fixture.meta.client.slug, workRoot: root, today: '2026-09-16' });
    write(workDir, WORK_FILES.extraction, extractionFor(fixture));
    assert.equal(assembleWork({ workDir }).ok, true);
    const result = finishWork({ workDir, outDir, dryRun: true });
    assert.equal(result.ok, true);
    assert.deepEqual(fs.readdirSync(outDir), []);
  });

  test('work directory names are derived safely and the account notice names the migration', () => {
    assert.equal(workName('/x/ACME Watches_questionnaire.md'), 'acme-watches');
    assert.equal(workName('/x/../../etc.md'), 'etc');
    assert.equal(workName('/x/q.md', 'helix-audio'), 'helix-audio');
    assert.match(ACCOUNT_NOTICE, /personal Claude Pro/);
    assert.match(ACCOUNT_NOTICE, /dentsu's Claude Enterprise/);
  });
});
