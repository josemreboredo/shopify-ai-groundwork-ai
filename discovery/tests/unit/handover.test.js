/**
 * What delivery receives when a discovery closes.
 *
 * The backlog and the configuration workbook have existed since the beginning and
 * were reachable only by running npm scripts against an engagement.json the web
 * app never writes. Nothing new is generated here — the same selection and the
 * same exports as the CLI — so the tests hold it to that, and to the one case
 * where there is deliberately no backlog at all.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { handoverView, handoverFile, backlogBlocked } from '../../service/handover.js';
import { selectStories, summariseByEpic } from '../../agents/backlog/select.js';

const fixture = (name) => JSON.parse(fs.readFileSync(new URL(`../fixtures/engagements/${name}.json`, import.meta.url), 'utf8'));

describe('handover to delivery', () => {
  test('a GO engagement hands over a backlog with its epics and points', () => {
    const view = handoverView(fixture('acme-watches'));
    assert.equal(view.backlog.available, true);
    assert.ok(view.backlog.stories > 0);
    assert.ok(view.backlog.epics.length > 0);
    assert.equal(view.backlog.points, view.backlog.epics.reduce((n, e) => n + e.points, 0), 'the total is the sum, not a second opinion');
    assert.equal(view.backlog.stories, view.backlog.epics.reduce((n, e) => n + e.stories, 0));
  });

  test('it is the same backlog the CLI generates, not a second implementation', () => {
    const doc = fixture('acme-watches');
    const stories = selectStories(doc);
    const view = handoverView(doc);
    assert.equal(view.backlog.stories, stories.length);
    assert.deepEqual(view.backlog.epics, summariseByEpic(stories).map(({ epic, stories: n, points: p }) => ({ epic, stories: n, points: p })));
  });

  test('who the work falls to comes from the stories themselves', () => {
    const view = handoverView(fixture('acme-watches'));
    assert.ok(view.backlog.owners.length > 0);
    assert.equal(view.backlog.owners.reduce((n, o) => n + o.stories, 0), view.backlog.stories, 'every story has an owner');
    for (let i = 1; i < view.backlog.owners.length; i += 1) {
      assert.ok(view.backlog.owners[i - 1].stories >= view.backlog.owners[i].stories, 'ordered by how much of the build each carries');
    }
  });

  test('an engagement beyond the offers gets no backlog, and is told why', () => {
    const doc = fixture('stop-custom-checkout');
    const blocked = backlogBlocked(doc);
    assert.ok(blocked, 'a STOP engagement has no build backlog');
    assert.ok(blocked.why.length > 20, 'and the reason is a sentence, not a code');
    const view = handoverView(doc);
    assert.equal(view.backlog.available, false);
    assert.equal(handoverFile(doc, 'backlog.csv'), null);
    assert.equal(handoverFile(doc, 'backlog.md'), null);
  });

  test('the workbook is produced whatever the route — tax and shipping are collected either way', () => {
    for (const name of ['acme-watches', 'stop-custom-checkout']) {
      const doc = fixture(name);
      assert.equal(handoverView(doc).workbook.available, true);
      const md = handoverFile(doc, 'workbook.md');
      assert.ok(md && md.length > 200, `${name}: the workbook has content`);
    }
  });

  test('the Jira CSV and the readable backlog are both produced from a GO engagement', () => {
    const doc = fixture('acme-watches');
    const csv = handoverFile(doc, 'backlog.csv');
    assert.ok(csv.includes(','), 'it is a CSV');
    assert.ok(csv.split('\n').length > handoverView(doc).backlog.stories, 'one row per story at least');
    assert.match(handoverFile(doc, 'backlog.md'), /^#/m);
    assert.equal(handoverFile(doc, 'nonsense'), null, 'an unknown file is refused rather than guessed');
  });
});
