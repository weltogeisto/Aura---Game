import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import type { Scenario, Target } from '../src/types/index.ts';
import { resolveMaterialBehavior, shouldRicochet } from '../src/lib/ballistics/materialBehavior.ts';
import { resolveShotScore } from '../src/lib/scoring/shotScoring.ts';
import type { ShotSimulationResult } from '../src/lib/ballistics/simulation.ts';

const baseTarget: Target = {
  id: 'test-target',
  name: 'Test Target',
  value: 1000,
  position: [0, 0, 0],
  radius: 1,
  type: 'masterpiece',
  material: 'oil-on-canvas',
};

const baseScenario: Scenario = {
  id: 'test-scenario',
  name: 'Test Scenario',
  description: 'Synthetic test scenario',
  panoramaAsset: {
    lowRes: 'data:image/svg+xml;base64,AA==',
    highRes: 'data:image/svg+xml;base64,AA==',
  },
  panoramaColor: '#ffffff',
  targets: [baseTarget],
  totalMaxValue: 1000,
  scoring: {
    fallbackSampleValue: 17,
    defaultZoneMultiplier: 1.1,
    defaultCriticalModifier: 1.3,
    dadaistScore: 1917000001,
  },
  criticLines: {
    low: ['Low'],
    mid: ['Mid'],
    high: ['High'],
  },
  metadata: {
    region: 'Test',
    difficulty: 'easy',
    status: 'playable',
    contentCompleteness: {
      targets: true,
      criticLines: true,
      panoramaAssets: true,
      scoring: true,
    },
  },
};

const hitSimulation: ShotSimulationResult = {
  events: [],
  hit: true,
  hitObject: null,
  hitPoint: new THREE.Vector3(0.1, 0.2, 0.3),
  hitNormal: new THREE.Vector3(0, 0, 1),
  hitDistance: 12,
  hitUv: null,
  traceEnd: new THREE.Vector3(0.1, 0.2, 0.4),
  energyLeft: 0.8,
};

test('ricochet threshold is deterministic at the angle boundary', () => {
  const marble = resolveMaterialBehavior('marble');

  assert.equal(shouldRicochet(marble.ricochetThresholdDeg - 0.001, marble), false);
  assert.equal(shouldRicochet(marble.ricochetThresholdDeg, marble), true);
  assert.equal(shouldRicochet(marble.ricochetThresholdDeg + 5, marble), true);
});

test('fallback scoring uses scenario fallback value when UV is unavailable', () => {
  const scored = resolveShotScore(baseScenario, hitSimulation, {
    ...baseTarget,
    valueMesh: [[NaN]],
  });

  assert.equal(scored.sampledValue, baseScenario.scoring?.fallbackSampleValue);
  assert.equal(scored.usedFallbackSample, true);
  assert.equal(scored.result.damageAmount, Math.round(17 * 1.1 * 1.3));
});

test('dadaist override score stays consistent independent of sampled damage', () => {
  const dadaistTarget: Target = {
    ...baseTarget,
    id: 'dadaist-target',
    type: 'easter-egg-dadaist',
    valueMesh: [[0]],
    zoneMultiplier: 0,
    criticalModifier: 5,
    overrideTotalDamage: 0,
  };

  const scored = resolveShotScore(
    {
      ...baseScenario,
      targets: [dadaistTarget],
      totalMaxValue: dadaistTarget.value,
    },
    hitSimulation,
    dadaistTarget
  );

  assert.equal(scored.result.damageAmount, 0);
  assert.equal(scored.result.totalDamage, 0);
  assert.equal(scored.result.totalScore, 1917000001);
  assert.equal(scored.isDadaistTrigger, true);
});
