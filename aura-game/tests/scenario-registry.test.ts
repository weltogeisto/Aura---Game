import test from 'node:test';
import assert from 'node:assert/strict';
import { getScenariosList } from '../src/data/scenarios.ts';

const EXPECTED_SCENARIO_IDS = [
  'louvre',
  'st-peters',
  'topkapi',
  'forbidden-city',
  'tsmc',
  'hermitage',
  'federal-reserve',
  'moma',
  'borges-library',
];

test('scenario registry is complete and includes all expected IDs', () => {
  const scenarios = getScenariosList();
  const scenarioIds = scenarios.map((scenario) => scenario.id);

  assert.equal(scenarios.length, EXPECTED_SCENARIO_IDS.length);
  assert.deepEqual(new Set(scenarioIds), new Set(EXPECTED_SCENARIO_IDS));
});

test('scenario completeness metadata is populated from validation', () => {
  const scenarios = getScenariosList();

  scenarios.forEach((scenario) => {
    assert.equal(typeof scenario.metadata.contentCompleteness.targets, 'boolean');
    assert.equal(typeof scenario.metadata.contentCompleteness.criticLines, 'boolean');
    assert.equal(typeof scenario.metadata.contentCompleteness.panoramaAssets, 'boolean');
    assert.equal(typeof scenario.metadata.contentCompleteness.scoring, 'boolean');

    if (scenario.metadata.status === 'playable') {
      assert.equal(scenario.metadata.contentCompleteness.targets, true);
      assert.equal(scenario.metadata.contentCompleteness.criticLines, true);
      assert.equal(scenario.metadata.contentCompleteness.panoramaAssets, true);
      assert.equal(scenario.metadata.contentCompleteness.scoring, true);
    }
  });
});
