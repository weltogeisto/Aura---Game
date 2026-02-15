export type GamePhase = 'start' | 'louvre' | 'menu' | 'scenario-select' | 'aiming' | 'shooting' | 'results';

export interface Target {
  id: string;
  name: string;
  value: number;
  position: [number, number, number];
  radius: number;
  type: 'masterpiece' | 'sculpture' | 'easter-egg-dadaist' | 'easter-egg-systemic' | 'other';
  material?: string;
  description?: string;
  zoneMultiplier?: number;
  criticalModifier?: number;
  valueMesh?: number[][];
  specialEffects?: string[];
  overrideTotalDamage?: number;
  breakdownMode?: 'hit-target' | 'masterpieces-and-sculptures' | 'all-targets' | 'none';
}

export interface ScenarioScoring {
  fallbackSampleValue: number;
  defaultZoneMultiplier: number;
  defaultCriticalModifier: number;
  dadaistScore: number;
}

export type ScenarioStatus = 'prototype' | 'playable' | 'locked';

export interface ScenarioContentCompleteness {
  targets: boolean;
  criticLines: boolean;
  panoramaAssets: boolean;
  scoring: boolean;
}

export interface ScenarioMetadata {
  region: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: ScenarioStatus;
  contentCompleteness: ScenarioContentCompleteness;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  metadata: ScenarioMetadata;
  panoramaAsset: {
    lowRes: string;
    mediumRes?: string;
    highRes: string;
  };
  colorGrading?: {
    lutAsset?: string;
    tint?: string;
    tintStrength?: number;
  };
  panoramaColor: string;
  targets: Target[];
  totalMaxValue: number;
  scoring?: ScenarioScoring;
  criticLines?: {
    low: string[];
    mid: string[];
    high: string[];
  };
}

export interface ShotResult {
  hitTargetId: string | null;
  hitTargetName: string | null;
  hitTargetType: Target['type'] | null;
  hitLocationLabel: string;
  damageAmount: number;
  totalDamage: number;
  totalScore: number;
  breakdown: {
    targetId: string;
    targetName: string;
    damage: number;
    percentage: number;
  }[];
  specialEffects: string[];
  criticLine: string;
  scenarioId?: string;
  scenarioName?: string;
  resolvedWithOverride?: boolean;
  simulationEvents?: ShotSimulationEvent[];
}

export interface ShotSimulationEvent {
  kind: 'material-interaction' | 'ricochet' | 'penetration' | 'deflection' | 'impact' | 'miss';
  objectId: string | null;
  material: string;
  distance: number;
  point: [number, number, number];
  normal: [number, number, number];
  angleDeg: number;
  incomingEnergy: number;
  outgoingEnergy: number;
}

export interface ShotFeedback {
  active: boolean;
  hit: boolean;
  firedAt: number;
  crosshairPosition: { x: number; y: number };
  hitDistance?: number;
  damageScale?: number;
  travelTimeMs?: number;
  traceEnd?: [number, number, number];
  hitPoint?: [number, number, number];
  hitNormal?: [number, number, number];
  impactUv?: [number, number] | null;
  sampledValue?: number;
  usedFallbackSample?: boolean;
  ballisticsSeed?: number;
  scoreBreakdown?: {
    sampledValue: number;
    zoneMultiplier: number;
    criticalModifier: number;
  };
  isDadaistTrigger?: boolean;
  simulationEvents?: ShotSimulationEvent[];
}

export interface GameState {
  gamePhase: GamePhase;
  selectedScenario: Scenario | null;
  crosshairPosition: { x: number; y: number };
  shotFired: boolean;
  hasFired: boolean;
  shotTimestamp: number | null;
  fireBlocked: boolean;
  lastShotResult: ShotResult | null;
  shotFeedback: ShotFeedback | null;
  ammoRemaining: number;
  totalScore: number;
  criticOutput: string | null;
  shotLocked: boolean;
}
