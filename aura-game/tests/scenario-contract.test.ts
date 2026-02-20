import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS, SCENARIO_MATURITY_MATRIX, SCENARIO_ROLLOUT_WAVES } from '../src/data/scenarios.ts';

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

test('scenario contract: maturity matrix gates playable scenarios', () => {
  for (const [id, scenario] of scenarioEntries) {
    const maturity = SCENARIO_MATURITY_MATRIX[id];
    assert.ok(maturity, `${id} must define maturity metadata`);
    assert.equal(scenario.metadata.status, maturity.status, `${id} status must match maturity matrix`);

    if (scenario.metadata.status !== 'playable') continue;

    assert.equal(
      Object.values(scenario.metadata.contentCompleteness).every(Boolean),
      true,
      `${id} playable scenarios require full content completeness`
    );
    assert.equal(
      Object.values(maturity.exitCriteria).every((criterion) => criterion.done),
      true,
      `${id} playable scenarios require all exit criteria done`
    );
  }
});

test('scenario contract: rollout wave 1 ships three playable scenarios including louvre', () => {
  const waveOne = SCENARIO_ROLLOUT_WAVES[1] ?? [];
  assert.equal(waveOne.length, 3, 'wave 1 must include exactly three scenarios');
  assert.equal(waveOne.includes('louvre'), true, 'wave 1 must include louvre');

  waveOne.forEach((scenarioId) => {
    assert.equal(SCENARIOS[scenarioId]?.metadata.status, 'playable', `${scenarioId} in wave 1 must be playable`);
  });
});
