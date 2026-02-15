import test from 'node:test';
import assert from 'node:assert/strict';
import { getScenariosList } from '../src/data/scenarios.ts';
import { sortScenariosByStatus } from '../src/components/ui/scenarioSelectModel.ts';

test('scenario sorting prioritizes playable then prototype then locked', () => {
  const sorted = sortScenariosByStatus(getScenariosList());
  const statuses = sorted.map((scenario) => scenario.metadata.status);

  const firstPrototype = statuses.indexOf('prototype');
  const firstLocked = statuses.indexOf('locked');

  if (firstPrototype !== -1) {
    assert.equal(statuses.slice(0, firstPrototype).every((status) => status === 'playable'), true);
  }

  if (firstLocked !== -1) {
    const prototypeBlock = statuses.slice(firstPrototype === -1 ? 0 : firstPrototype, firstLocked);
    assert.equal(prototypeBlock.every((status) => status === 'prototype'), true);
  }

  if (firstLocked !== -1) {
    assert.equal(statuses.slice(firstLocked).every((status) => status === 'locked'), true);
  }
});

test('scenario list contains non-playable entries for explicit status UX', () => {
  const scenarios = getScenariosList();
  const playableCount = scenarios.filter((scenario) => scenario.metadata.status === 'playable').length;
  const nonPlayableCount = scenarios.length - playableCount;

  assert.equal(playableCount > 0, true);
  assert.equal(nonPlayableCount > 0, true);
});
