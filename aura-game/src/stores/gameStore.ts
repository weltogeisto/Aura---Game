import { create } from 'zustand';
import type { GameState, GamePhase, Scenario, ShotResult, ShotFeedback } from '@/types';

interface GameStore extends GameState {
  setGamePhase: (phase: GamePhase) => void;
  setSelectedScenario: (scenario: Scenario | null) => void;
  setCrosshairPosition: (x: number, y: number) => void;
  fireShotResult: (result: ShotResult, feedback: ShotFeedback) => void;
  finalizeShot: () => void;
  setFireBlocked: (blocked: boolean) => void;
  clearShotFeedback: () => void;
  resetRunState: () => void;
  resetGame: () => void;
  resetRunState: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gamePhase: 'start',
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

  setGamePhase: (phase: GamePhase) =>
    set({ gamePhase: phase }),

  setSelectedScenario: (scenario: Scenario | null) =>
    set({ selectedScenario: scenario }),

  resetRunState: () =>
    set({
      shotFired: false,
      lastShotResult: null,
      shotFeedback: null,
      ammoRemaining: 1,
      totalScore: 0,
      criticOutput: null,
      shotLocked: false,
    }),

  setCrosshairPosition: (x: number, y: number) =>
    set({ crosshairPosition: { x, y } }),

  fireShotResult: (result: ShotResult, feedback: ShotFeedback) =>
    set({
      shotFired: true,
      lastShotResult: result,
      gamePhase: 'shooting',
      shotFeedback: feedback,
      ammoRemaining: 0,
      totalScore: result.totalScore,
      criticOutput: result.criticLine,
      shotLocked: true,
    }),

  finalizeShot: () =>
    set({
      gamePhase: 'results',
    }),

  setFireBlocked: (blocked: boolean) =>
    set({ fireBlocked: blocked }),

  clearShotFeedback: () =>
    set({
      shotFeedback: null,
    }),

  resetRunState: () =>
    set({
      shotFired: false,
      hasFired: false,
      shotTimestamp: null,
      fireBlocked: false,
      lastShotResult: null,
      shotFeedback: null,
      ammoRemaining: 1,
    }),

  resetGame: () =>
    set({
      gamePhase: 'start',
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
    }),
}));
