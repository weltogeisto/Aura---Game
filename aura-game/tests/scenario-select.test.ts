import test from 'node:test';
import assert from 'node:assert/strict';
import { getScenariosList } from '../src/data/scenarios.ts';
import { isScenarioPlayable, sortScenariosByStatus } from '../src/components/ui/scenarioSelectModel.ts';

test('scenario sorting prioritizes playable then prototype then locked', () => {
  const sorted = sortScenariosByStatus(getScenariosList());
  const orderWeight = { playable: 0, prototype: 1, locked: 2 } as const;
  const weights = sorted.map((scenario) => orderWeight[scenario.metadata.status]);

  for (let i = 1; i < weights.length; i++) {
    assert.equal(weights[i] >= weights[i - 1], true, 'scenario status order must be monotonic');
  }
});

test('scenario list contains non-playable entries for explicit status UX', () => {
  const scenarios = getScenariosList();
  const playableCount = scenarios.filter((scenario) => scenario.metadata.status === 'playable').length;
  const nonPlayableCount = scenarios.length - playableCount;

  assert.equal(playableCount > 0, true);
  assert.equal(nonPlayableCount > 0, true);
});


test('scenario interactivity is strictly status-driven', () => {
  const scenarios = getScenariosList();

  scenarios.forEach((scenario) => {
    assert.equal(isScenarioPlayable(scenario), scenario.metadata.status === 'playable');
  });
});

test('scenario select lock coverage includes at least one non-playable entry', () => {
  const scenarios = getScenariosList();
  const nonPlayable = scenarios.filter((scenario) => !isScenarioPlayable(scenario));

  assert.equal(nonPlayable.length > 0, true);
  assert.equal(nonPlayable.some((scenario) => ['prototype', 'locked'].includes(scenario.metadata.status)), true);
});
