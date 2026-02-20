import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS } from '../src/data/scenarios.ts';
import { SCENARIO_SEEDS } from '../src/data/scenarios/registry.ts';

const scenarioEntries = Object.entries(SCENARIOS);

test('scenario contract: scenario IDs are unique and match registry keys', () => {
  const ids = new Set<string>();

  for (const [key, scenario] of scenarioEntries) {
    assert.equal(scenario.id, key, `Scenario ${key} must expose matching id`);
    assert.ok(!ids.has(scenario.id), `Scenario id ${scenario.id} must be unique`);
    ids.add(scenario.id);
  }
});

test('scenario contract: required scoring and critic fields are present', () => {
  for (const [id, scenario] of scenarioEntries) {
    assert.ok(scenario.scoring, `${id} must define scoring block`);
    assert.ok(scenario.criticLines, `${id} must define critic lines`);

    assert.ok((scenario.scoring?.fallbackSampleValue ?? 0) > 0, `${id} fallbackSampleValue must be > 0`);
    assert.ok((scenario.scoring?.defaultZoneMultiplier ?? 0) > 0, `${id} defaultZoneMultiplier must be > 0`);
    assert.ok((scenario.scoring?.defaultCriticalModifier ?? 0) > 0, `${id} defaultCriticalModifier must be > 0`);
    assert.ok(Number.isFinite(scenario.scoring?.dadaistScore), `${id} dadaistScore must be finite`);

    assert.ok((scenario.criticLines?.low.length ?? 0) > 0, `${id} criticLines.low must not be empty`);
    assert.ok((scenario.criticLines?.mid.length ?? 0) > 0, `${id} criticLines.mid must not be empty`);
    assert.ok((scenario.criticLines?.high.length ?? 0) > 0, `${id} criticLines.high must not be empty`);
  }
});

test('scenario contract: registry seeds stay in sync with built scenario map', () => {
  const seedIds = SCENARIO_SEEDS.map((seed) => seed.id).sort();
  const mapIds = Object.keys(SCENARIOS).sort();

  assert.deepEqual(seedIds, mapIds, 'SCENARIO_SEEDS and SCENARIOS must expose same IDs');
});
