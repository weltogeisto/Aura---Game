export type GamePhase = 'menu' | 'scenario-select' | 'aiming' | 'shooting' | 'results';

export interface Target {
  id: string;
  name: string;
  value: number;
  position: [number, number, number];
  radius: number;
  type: 'masterpiece' | 'sculpture' | 'easter-egg-dadaist' | 'easter-egg-systemic' | 'other';
  material?: string;
  description?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  panoramaColor: string;
  targets: Target[];
  totalMaxValue: number;
}

export interface ShotResult {
  hitTargetId: string | null;
  hitTargetName: string | null;
  damageAmount: number;
  totalDamage: number;
  breakdown: {
    targetId: string;
    targetName: string;
    damage: number;
    percentage: number;
  }[];
  specialEffects: string[];
}

export interface GameState {
  gamePhase: GamePhase;
  selectedScenario: Scenario | null;
  crosshairPosition: { x: number; y: number };
  shotFired: boolean;
  lastShotResult: ShotResult | null;
  ammoRemaining: number;
}
