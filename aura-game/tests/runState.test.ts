import test from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore } from '../src/stores/gameStore.ts';
import type { GameState, ShotFeedback, ShotResult } from '../src/types/index.ts';

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
  selectedScenario: null,
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

test('fireShotResult only applies once (one bullet only lock)', () => {
  resetStore();
  const originalDateNow = Date.now;

  Date.now = () => 1234;
  useGameStore.getState().fireShotResult(mockResult, mockFeedback);
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
  useGameStore.getState().fireShotResult(
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

test('resetRunState clears run fields and keeps replay path consistent', () => {
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

  useGameStore.getState().resetRunState();
  const state = useGameStore.getState();

  assert.equal(state.gamePhase, 'results');
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

test('phase transition start -> aiming -> shooting -> results and replay reset', () => {
  useGameStore.getState().resetGame();

  assert.equal(useGameStore.getState().gamePhase, 'start');

  useGameStore.getState().setGamePhase('aiming');
  assert.equal(useGameStore.getState().gamePhase, 'aiming');

  useGameStore.getState().fireShotResult(mockResult, mockFeedback);
  assert.equal(useGameStore.getState().gamePhase, 'shooting');

  useGameStore.getState().finalizeShot();
  assert.equal(useGameStore.getState().gamePhase, 'results');

  useGameStore.getState().resetGame();
  const replayState = useGameStore.getState();
  assert.equal(replayState.gamePhase, 'start');
  assert.equal(replayState.hasFired, false);
  assert.equal(replayState.ammoRemaining, 1);
  assert.equal(replayState.shotLocked, false);
});
