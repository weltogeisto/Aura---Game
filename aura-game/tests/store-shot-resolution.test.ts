import test from 'node:test';
import assert from 'node:assert/strict';

import { SCENARIOS } from '../src/data/scenarios.ts';
import { useGameStore } from '../src/stores/gameStore.ts';
import { DADAIST_SCORE, deterministicCriticLine } from '../src/lib/shotResolution.ts';
import { resolveShotScore } from '../src/lib/scoring/shotScoring.ts';
import { resolveShotCommitPayload } from '../src/lib/ballistics/shotFeedback.ts';
import type { GameState, ShotFeedback, ShotResult } from '../src/types/index.ts';
import type { ShotSimulationResult } from '../src/lib/ballistics/simulation.ts';
import * as THREE from 'three';

const baseState: GameState = {
  gamePhase: 'aiming',
  selectedScenario: SCENARIOS.louvre,
  crosshairPosition: { x: 0.5, y: 0.5 },
  shotFired: false,
  hasFired: false,
  shotTimestamp: null,
  fireBlocked: false,
  lastShotResult: null,
  shotFeedback: null,
  ammoRemaining: 1,
  totalScore: 0,
  criticOutput: null,
  shotLocked: false,
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    aimAssist: false,
  },
  runTelemetry: {
    runStartedAt: null,
    firstShotAt: null,
    scoreBreakdownViewed: false,
    replayUsed: false,
  },
};

const mockFeedback: ShotFeedback = {
  active: true,
  hit: true,
  firedAt: 1000,
  crosshairPosition: { x: 0.5, y: 0.5 },
};

const resetStore = () => {
  useGameStore.setState(baseState);
};

test('store + shot resolution: critic line is deterministic for same payload', () => {
  const scenario = SCENARIOS.louvre;
  const hitLocationLabel = `${scenario.name} — Mona Lisa (Upper Center)`;

  const a = deterministicCriticLine(scenario, 100, 'mona-lisa', 'masterpiece', hitLocationLabel);
  const b = deterministicCriticLine(scenario, 100, 'mona-lisa', 'masterpiece', hitLocationLabel);

  assert.equal(a, b);
});

test('store + shot resolution: special effects and critic output propagate into run state', () => {
  resetStore();
  const scenario = SCENARIOS.louvre;
  const target = scenario.targets.find((entry) => entry.id === 'fire-sensor');
  if (!target) {
    throw new Error('fire-sensor target is required for this test.');
  }

  const result: ShotResult = {
    hitTargetId: target.id,
    hitTargetName: target.name,
    hitTargetType: target.type,
    hitLocationLabel: `${scenario.name} — ${target.name} (Midline Center)`,
    damageAmount: target.value,
    totalDamage: target.overrideTotalDamage ?? target.value,
    totalScore: target.overrideTotalDamage ?? target.value,
    breakdown: [],
    specialEffects: [...(target.specialEffects ?? [])],
    criticLine: deterministicCriticLine(
      scenario,
      target.overrideTotalDamage ?? target.value,
      target.id,
      target.type,
      `${scenario.name} — ${target.name} (Midline Center)`
    ),
  };

  useGameStore.getState().commitShot(result, mockFeedback);
  const state = useGameStore.getState();

  assert.deepEqual(state.lastShotResult?.specialEffects, target.specialEffects);
  assert.equal(state.criticOutput, result.criticLine);
  assert.equal(state.shotLocked, true);
  assert.equal(state.fireBlocked, false);
});

test('store + shot resolution: replay and full reset clear lock state and outputs', () => {
  resetStore();
  const result: ShotResult = {
    hitTargetId: 'louvre-hidden-dadaist-target',
    hitTargetName: 'Mop Bucket',
    hitTargetType: 'easter-egg-dadaist',
    hitLocationLabel: 'The Louvre - Salle des États — Mop Bucket (Midline Center)',
    damageAmount: 0,
    totalDamage: 0,
    totalScore: DADAIST_SCORE,
    breakdown: [],
    specialEffects: ['DUCHAMP MODE ACTIVATED.'],
    criticLine: deterministicCriticLine(
      SCENARIOS.louvre,
      DADAIST_SCORE,
      'louvre-hidden-dadaist-target',
      'easter-egg-dadaist',
      'The Louvre - Salle des États — Mop Bucket (Midline Center)'
    ),
  };

  useGameStore.getState().commitShot(result, mockFeedback);
  assert.equal(useGameStore.getState().shotLocked, true);

  useGameStore.getState().resetRunState();
  assert.equal(useGameStore.getState().shotLocked, false);
  assert.equal(useGameStore.getState().criticOutput, null);

  // Reset game phase to aiming so commitShot guard passes
  useGameStore.setState({ gamePhase: 'aiming' });
  useGameStore.getState().commitShot(result, mockFeedback);
  assert.equal(useGameStore.getState().shotLocked, true);

  useGameStore.getState().resetGame();
  const state = useGameStore.getState();
  assert.equal(state.shotLocked, false);
  assert.equal(state.lastShotResult, null);
  assert.equal(state.selectedScenario, null);
});

test('store + shot resolution: unknown simulation targetId resolves to miss score and miss feedback', () => {
  const scenario = SCENARIOS.louvre;
  const simulation: ShotSimulationResult = {
    events: [],
    hit: true,
    hitObject: {
      object: new THREE.Mesh(),
      targetId: 'unknown-target-id',
      targetName: 'Ghost Target',
      targetType: 'other',
    },
    hitPoint: new THREE.Vector3(1, 1, 1),
    hitNormal: new THREE.Vector3(0, 1, 0),
    hitDistance: 20,
    hitUv: null,
    traceEnd: new THREE.Vector3(1, 1, 1),
    energyLeft: 1,
  };

  const scoreResolution = resolveShotScore(scenario, simulation, undefined);
  const resolved = resolveShotCommitPayload({
    scenario,
    simulation,
    scoreResolution,
    hitTargetData: undefined,
    crosshairPosition: { x: 0.5, y: 0.5 },
    ballisticsSeed: 1337,
    firedAt: 123,
  });

  assert.equal(resolved.resolvedTargetHit, false);
  assert.equal(resolved.result.totalScore, 0);
  assert.equal(resolved.result.hitTargetId, null);
  assert.equal(resolved.feedback.hit, false);
  assert.match(
    resolved.result.specialEffects.join(' | '),
    /physics impact target could not be mapped to scenario target metadata/i
  );
});
