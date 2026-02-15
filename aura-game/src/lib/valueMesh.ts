export type ValueMeshGrid = number[][];

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
  const rawScore = sampledValue * Math.max(zoneMultiplier, 0) * Math.max(criticalModifier, 1);
  return Math.round(rawScore);
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}
