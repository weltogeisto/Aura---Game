import test from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore } from '../src/stores/gameStore.ts';
import type { ShotFeedback, ShotResult } from '../src/types/index.ts';

const mockResult: ShotResult = {
  hitTargetId: 'target-1',
  hitTargetName: 'Target',
  damageAmount: 100,
  totalDamage: 100,
  breakdown: [],
  specialEffects: [],
};

const mockFeedback: ShotFeedback = {
  active: true,
  hit: true,
  firedAt: 1000,
  crosshairPosition: { x: 0.5, y: 0.5 },
};

const baseState = {
  gamePhase: 'aiming' as const,
  selectedScenario: null,
  crosshairPosition: { x: 0.5, y: 0.5 },
  shotFired: false,
  hasFired: false,
  shotTimestamp: null,
  fireBlocked: false,
  lastShotResult: null,
  shotFeedback: null,
  ammoRemaining: 1,
};

function resetStore() {
  useGameStore.setState(baseState);
}

test('fireShotResult only applies once (one-shot guard)', () => {
  resetStore();
  const originalDateNow = Date.now;
  Date.now = () => 1234;

  useGameStore.getState().fireShotResult(mockResult, mockFeedback);
  const afterFirstFire = useGameStore.getState();

  assert.equal(afterFirstFire.hasFired, true);
  assert.equal(afterFirstFire.ammoRemaining, 0);
  assert.equal(afterFirstFire.shotTimestamp, 1234);

  Date.now = () => 4567;
  useGameStore.getState().fireShotResult(
    { ...mockResult, totalDamage: 999 },
    { ...mockFeedback, firedAt: 999 }
  );

  const afterSecondFire = useGameStore.getState();
  assert.equal(afterSecondFire.shotTimestamp, 1234);
  assert.equal(afterSecondFire.lastShotResult?.totalDamage, 100);

  Date.now = originalDateNow;
});

test('resetRunState clears one-shot state and restores ammo', () => {
  resetStore();

  useGameStore.setState({
    shotFired: true,
    hasFired: true,
    shotTimestamp: 100,
    fireBlocked: true,
    lastShotResult: mockResult,
    shotFeedback: mockFeedback,
    ammoRemaining: 0,
  });

  useGameStore.getState().resetRunState();
  const state = useGameStore.getState();

  assert.equal(state.shotFired, false);
  assert.equal(state.hasFired, false);
  assert.equal(state.shotTimestamp, null);
  assert.equal(state.fireBlocked, false);
  assert.equal(state.lastShotResult, null);
  assert.equal(state.shotFeedback, null);
  assert.equal(state.ammoRemaining, 1);
});
