import type { Target } from '../../types/index.ts';

export interface MaterialBehavior {
  key: string;
  ricochetThresholdDeg: number;
  penetrationResistance: number;
  penetrationEnergyLoss: number;
  ricochetEnergyLoss: number;
  deflectionDeg: { min: number; max: number };
}

const DEFAULT_BEHAVIOR: MaterialBehavior = {
  key: 'generic-structure',
  ricochetThresholdDeg: 68,
  penetrationResistance: 0.65,
  penetrationEnergyLoss: 0.5,
  ricochetEnergyLoss: 0.42,
  deflectionDeg: { min: 2, max: 7 },
};

const MATERIAL_BEHAVIOR_TABLE: Record<string, MaterialBehavior> = {
  'oil-on-wood': {
    key: 'oil-on-wood',
    ricochetThresholdDeg: 76,
    penetrationResistance: 0.22,
    penetrationEnergyLoss: 0.16,
    ricochetEnergyLoss: 0.34,
    deflectionDeg: { min: 1, max: 4 },
  },
  'oil-on-canvas': {
    key: 'oil-on-canvas',
    ricochetThresholdDeg: 78,
    penetrationResistance: 0.18,
    penetrationEnergyLoss: 0.12,
    ricochetEnergyLoss: 0.3,
    deflectionDeg: { min: 1, max: 3 },
  },
  marble: {
    key: 'marble',
    ricochetThresholdDeg: 43,
    penetrationResistance: 0.9,
    penetrationEnergyLoss: 0.75,
    ricochetEnergyLoss: 0.3,
    deflectionDeg: { min: 6, max: 15 },
  },
  bronze: {
    key: 'bronze',
    ricochetThresholdDeg: 37,
    penetrationResistance: 0.95,
    penetrationEnergyLoss: 0.82,
    ricochetEnergyLoss: 0.26,
    deflectionDeg: { min: 5, max: 14 },
  },
  'gilded-bronze': {
    key: 'gilded-bronze',
    ricochetThresholdDeg: 35,
    penetrationResistance: 0.97,
    penetrationEnergyLoss: 0.85,
    ricochetEnergyLoss: 0.24,
    deflectionDeg: { min: 6, max: 16 },
  },
  glass: {
    key: 'glass',
    ricochetThresholdDeg: 62,
    penetrationResistance: 0.45,
    penetrationEnergyLoss: 0.35,
    ricochetEnergyLoss: 0.48,
    deflectionDeg: { min: 2, max: 8 },
  },
  wood: {
    key: 'wood',
    ricochetThresholdDeg: 74,
    penetrationResistance: 0.3,
    penetrationEnergyLoss: 0.28,
    ricochetEnergyLoss: 0.4,
    deflectionDeg: { min: 2, max: 6 },
  },
};

const MATERIAL_ALIASES: Record<string, string> = {
  'bulletproof-glass': 'glass',
  canvas: 'oil-on-canvas',
  stone: 'marble',
};

export function resolveMaterialBehavior(material: string | undefined, targetType?: Target['type']): MaterialBehavior {
  if (material) {
    const normalized = material.toLowerCase();
    const key = MATERIAL_ALIASES[normalized] ?? normalized;
    return MATERIAL_BEHAVIOR_TABLE[key] ?? DEFAULT_BEHAVIOR;
  }

  if (targetType === 'masterpiece') {
    return MATERIAL_BEHAVIOR_TABLE['oil-on-canvas'];
  }

  if (targetType === 'sculpture') {
    return MATERIAL_BEHAVIOR_TABLE.marble;
  }

  return DEFAULT_BEHAVIOR;
}

export function shouldRicochet(impactAngleDeg: number, behavior: MaterialBehavior): boolean {
  return impactAngleDeg >= behavior.ricochetThresholdDeg;
}
