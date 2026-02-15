import { create } from 'zustand';
import type { GameState, GamePhase, Scenario, ShotResult, ShotFeedback } from '@/types';

const RUN_STATE_RESET: Pick<
  GameState,
  | 'shotFired'
  | 'hasFired'
  | 'shotTimestamp'
  | 'fireBlocked'
  | 'lastShotResult'
  | 'shotFeedback'
  | 'ammoRemaining'
  | 'totalScore'
  | 'criticOutput'
  | 'shotLocked'
> = {
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

interface GameStore extends GameState {
  setGamePhase: (phase: GamePhase) => void;
  setSelectedScenario: (scenario: Scenario | null) => void;
  setCrosshairPosition: (x: number, y: number) => void;
  startRun: (scenario: Scenario) => void;
  enterAiming: () => void;
  commitShot: (result: ShotResult, feedback: ShotFeedback) => void;
  finalizeResults: () => void;
  restartScenario: () => void;
  setFireBlocked: (blocked: boolean) => void;
  clearShotFeedback: () => void;
  resetRunState: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gamePhase: 'start',
  selectedScenario: null,
  crosshairPosition: { x: 0.5, y: 0.5 },
  ...RUN_STATE_RESET,

  setGamePhase: (phase: GamePhase) =>
    set({ gamePhase: phase }),

  setSelectedScenario: (scenario: Scenario | null) =>
    set({ selectedScenario: scenario }),

  setCrosshairPosition: (x: number, y: number) =>
    set({ crosshairPosition: { x, y } }),

  startRun: (scenario: Scenario) =>
    set({
      selectedScenario: scenario,
      gamePhase: 'aiming',
      ...RUN_STATE_RESET,
    }),

  enterAiming: () =>
    set((state) => {
      if (!state.selectedScenario) {
        return state;
      }

      return {
        gamePhase: 'aiming',
        fireBlocked: false,
      };
    }),

  commitShot: (result: ShotResult, feedback: ShotFeedback) =>
    set((state) => {
      if (
        state.gamePhase !== 'aiming'
        || state.shotLocked
        || state.hasFired
        || state.ammoRemaining <= 0
      ) {
        return { fireBlocked: true };
      }

      return {
        shotFired: true,
        hasFired: true,
        shotTimestamp: Date.now(),
        fireBlocked: false,
        lastShotResult: result,
        gamePhase: 'shooting',
        shotFeedback: feedback,
        ammoRemaining: 0,
        totalScore: result.totalScore,
        criticOutput: result.criticLine,
        shotLocked: true,
      };
    }),

  finalizeResults: () =>
    set((state) => {
      if (state.gamePhase !== 'shooting' || !state.lastShotResult) {
        return state;
      }

      return {
        gamePhase: 'results',
      };
    }),

  restartScenario: () =>
    set((state) => {
      if (!state.selectedScenario) {
        return state;
      }

      return {
        gamePhase: 'aiming',
        ...RUN_STATE_RESET,
      };
    }),

  setFireBlocked: (blocked: boolean) =>
    set({ fireBlocked: blocked }),

  clearShotFeedback: () =>
    set({
      shotFeedback: null,
    }),

  resetRunState: () =>
    set({
      ...RUN_STATE_RESET,
    }),

  resetGame: () =>
    set({
      gamePhase: 'start',
      selectedScenario: null,
      crosshairPosition: { x: 0.5, y: 0.5 },
      ...RUN_STATE_RESET,
    }),
}));
