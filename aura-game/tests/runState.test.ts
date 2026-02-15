import test from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore } from '../src/stores/gameStore.ts';
import { canFire, canReplay, hasResult } from '../src/stores/gameSelectors.ts';
import type { GameState, Scenario, ShotFeedback, ShotResult } from '../src/types/index.ts';

const mockScenario: Scenario = {
  id: 'scenario-1',
  name: 'Test Scenario',
  description: 'Gallery room. Testing transitions.',
  isMvp: true,
  panoramaAsset: {
    lowRes: '/low.jpg',
    highRes: '/high.jpg',
  },
  panoramaColor: '#000000',
  targets: [],
  totalMaxValue: 100,
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
  scoring: {
    fallbackSampleValue: 5,
    defaultZoneMultiplier: 1,
    defaultCriticalModifier: 1,
    dadaistScore: 1917000001,
  },
  criticLines: {
    low: ['x'],
    mid: ['y'],
    high: ['z'],
  },
};

const mockResult: ShotResult = {
  hitTargetId: 'target-1',
  hitTargetName: 'Target',
  hitTargetType: 'masterpiece',
  hitLocationLabel: 'Gallery — Center',
  damageAmount: 100,
  totalDamage: 100,
  totalScore: 100,
  breakdown: [],
  specialEffects: [],
  criticLine: 'Direct hit.',
};

const mockFeedback: ShotFeedback = {
  active: true,
  hit: true,
  firedAt: 1000,
  crosshairPosition: { x: 0.5, y: 0.5 },
};

const baseState: GameState = {
  gamePhase: 'aiming',
  selectedScenario: mockScenario,
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
};

function resetStore() {
  useGameStore.setState(baseState);
}

test('commitShot only applies once and blocks illegal re-fire while locked', () => {
  resetStore();
  const originalDateNow = Date.now;

  Date.now = () => 1234;
  useGameStore.getState().commitShot(mockResult, mockFeedback);
  const afterFirstFire = useGameStore.getState();

  assert.equal(afterFirstFire.gamePhase, 'shooting');
  assert.equal(afterFirstFire.shotFired, true);
  assert.equal(afterFirstFire.hasFired, true);
  assert.equal(afterFirstFire.shotLocked, true);
  assert.equal(afterFirstFire.fireBlocked, false);
  assert.equal(afterFirstFire.ammoRemaining, 0);
  assert.equal(afterFirstFire.shotTimestamp, 1234);
  assert.equal(afterFirstFire.lastShotResult?.totalDamage, 100);

  Date.now = () => 4567;
  useGameStore.getState().commitShot(
    { ...mockResult, totalDamage: 999, totalScore: 999 },
    { ...mockFeedback, firedAt: 999 }
  );

  const afterSecondFire = useGameStore.getState();
  assert.equal(afterSecondFire.shotTimestamp, 1234);
  assert.equal(afterSecondFire.lastShotResult?.totalDamage, 100);
  assert.equal(afterSecondFire.totalScore, 100);
  assert.equal(afterSecondFire.fireBlocked, true);

  Date.now = originalDateNow;
});

test('finalizeResults is guarded when no shot exists', () => {
  resetStore();

  useGameStore.setState({ gamePhase: 'aiming', lastShotResult: null, hasFired: false });
  useGameStore.getState().finalizeResults();

  const state = useGameStore.getState();
  assert.equal(state.gamePhase, 'aiming');

  useGameStore.getState().commitShot(mockResult, mockFeedback);
  assert.equal(useGameStore.getState().gamePhase, 'shooting');

  useGameStore.getState().finalizeResults();
  assert.equal(useGameStore.getState().gamePhase, 'results');
});

test('restartScenario resets run fields and keeps selected scenario for replay', () => {
  resetStore();

  useGameStore.setState({
    gamePhase: 'results',
    shotFired: true,
    hasFired: true,
    shotTimestamp: 100,
    fireBlocked: true,
    lastShotResult: mockResult,
    shotFeedback: mockFeedback,
    ammoRemaining: 0,
    totalScore: 100,
    criticOutput: 'Direct hit.',
    shotLocked: true,
  });

  useGameStore.getState().restartScenario();
  const state = useGameStore.getState();

  assert.equal(state.gamePhase, 'aiming');
  assert.equal(state.selectedScenario?.id, mockScenario.id);
  assert.equal(state.shotFired, false);
  assert.equal(state.hasFired, false);
  assert.equal(state.shotTimestamp, null);
  assert.equal(state.fireBlocked, false);
  assert.equal(state.lastShotResult, null);
  assert.equal(state.shotFeedback, null);
  assert.equal(state.ammoRemaining, 1);
  assert.equal(state.totalScore, 0);
  assert.equal(state.criticOutput, null);
  assert.equal(state.shotLocked, false);
});

test('selectors stay stable for future hook wrappers', () => {
  resetStore();

  assert.equal(canFire(useGameStore.getState()), true);
  assert.equal(hasResult(useGameStore.getState()), false);
  assert.equal(canReplay(useGameStore.getState()), false);

  useGameStore.getState().commitShot(mockResult, mockFeedback);
  assert.equal(canFire(useGameStore.getState()), false);

  useGameStore.getState().finalizeResults();
  const finishedState = useGameStore.getState();
  assert.equal(hasResult(finishedState), true);
  assert.equal(canReplay(finishedState), true);

  useGameStore.getState().resetGame();
  const resetState = useGameStore.getState();
  assert.equal(canFire(resetState), false);
  assert.equal(hasResult(resetState), false);
  assert.equal(canReplay(resetState), false);
});
