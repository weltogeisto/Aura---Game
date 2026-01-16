import { create } from 'zustand';
import type { GameState, GamePhase, Scenario, ShotResult } from '@/types';

interface GameStore extends GameState {
  setGamePhase: (phase: GamePhase) => void;
  setSelectedScenario: (scenario: Scenario | null) => void;
  setCrosshairPosition: (x: number, y: number) => void;
  fireShotResult: (result: ShotResult) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gamePhase: 'menu',
  selectedScenario: null,
  crosshairPosition: { x: 0.5, y: 0.5 },
  shotFired: false,
  lastShotResult: null,
  ammoRemaining: 1,

  setGamePhase: (phase: GamePhase) =>
    set({ gamePhase: phase }),

  setSelectedScenario: (scenario: Scenario | null) =>
    set({ selectedScenario: scenario }),

  setCrosshairPosition: (x: number, y: number) =>
    set({ crosshairPosition: { x, y } }),

  fireShotResult: (result: ShotResult) =>
    set({
      shotFired: true,
      lastShotResult: result,
      gamePhase: 'results',
      ammoRemaining: 0,
    }),

  resetGame: () =>
    set({
      gamePhase: 'menu',
      selectedScenario: null,
      crosshairPosition: { x: 0.5, y: 0.5 },
      shotFired: false,
      lastShotResult: null,
      ammoRemaining: 1,
    }),
}));
