import type { GameState } from '@/types';

export const canFire = (state: GameState): boolean => (
  state.gamePhase === 'aiming'
  && !state.shotLocked
  && !state.hasFired
  && state.ammoRemaining > 0
);

export const hasResult = (state: GameState): boolean => Boolean(state.lastShotResult);

export const canReplay = (state: GameState): boolean => (
  state.gamePhase === 'results'
  && Boolean(state.selectedScenario)
  && hasResult(state)
);
