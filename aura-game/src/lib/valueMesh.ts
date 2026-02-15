export type ValueMeshGrid = number[][];

const NORMALIZED_MIN = 0;
const NORMALIZED_MAX = 1;
const MIN_ZONE_MULTIPLIER = 0;
const MIN_CRITICAL_MODIFIER = 1;

export interface ValueMeshSample {
  value: number;
  usedFallback: boolean;
  uv: { u: number; v: number } | null;
}

export interface ScoreInput {
  sampledValue: number;
  zoneMultiplier: number;
  criticalModifier: number;
}

export function sampleValueMesh(
  valueMesh: ValueMeshGrid,
  uv: { u: number; v: number } | null,
  fallbackValue: number
): ValueMeshSample {
  if (!uv || valueMesh.length === 0 || valueMesh[0]?.length === 0) {
    return { value: fallbackValue, usedFallback: true, uv: null };
  }

  const height = valueMesh.length;
  const width = valueMesh[0].length;
  const clampedU = clamp01(uv.u);
  const clampedV = clamp01(uv.v);

  const x = Math.min(width - 1, Math.floor(clampedU * width));
  const y = Math.min(height - 1, Math.floor((1 - clampedV) * height));

  const sampled = valueMesh[y]?.[x];
  if (typeof sampled !== 'number' || Number.isNaN(sampled)) {
    return {
      value: fallbackValue,
      usedFallback: true,
      uv: { u: clampedU, v: clampedV },
    };
  }

  return {
    value: sampled,
    usedFallback: false,
    uv: { u: clampedU, v: clampedV },
  };
}

export function scoreImpact({ sampledValue, zoneMultiplier, criticalModifier }: ScoreInput): number {
  const rawScore = sampledValue
    * Math.max(zoneMultiplier, MIN_ZONE_MULTIPLIER)
    * Math.max(criticalModifier, MIN_CRITICAL_MODIFIER);
  return Math.round(rawScore);
}

function clamp01(value: number) {
  return Math.max(NORMALIZED_MIN, Math.min(NORMALIZED_MAX, value));
}
