import * as THREE from 'three';
import type { Scenario, ShotFeedback, ShotResult, Target } from '../../types/index.ts';
import type { ShotSimulationResult } from './simulation.ts';
import type { ScoreResolution } from '../scoring/shotScoring.ts';

const MISS_TRACE_DISTANCE = 45;
const UNMAPPED_TARGET_NOTE = 'Diagnostics: physics impact target could not be mapped to scenario target metadata.';

interface ResolveShotCommitPayloadInput {
  scenario: Scenario;
  simulation: ShotSimulationResult;
  scoreResolution: ScoreResolution;
  hitTargetData: Target | undefined;
  crosshairPosition: { x: number; y: number };
  ballisticsSeed: number;
  firedAt: number;
}

interface ResolveShotCommitPayloadOutput {
  resolvedTargetHit: boolean;
  result: ShotResult;
  feedback: ShotFeedback;
}

export function resolveShotCommitPayload({
  scenario,
  simulation,
  scoreResolution,
  hitTargetData,
  crosshairPosition,
  ballisticsSeed,
  firedAt,
}: ResolveShotCommitPayloadInput): ResolveShotCommitPayloadOutput {
  const resolvedTargetHit = Boolean(simulation.hit && simulation.hitPoint && hitTargetData);
  const hasUnmappedHitReference = Boolean(simulation.hit && simulation.hitPoint && !hitTargetData);

  const result = hasUnmappedHitReference
    ? {
        ...scoreResolution.result,
        specialEffects: [...scoreResolution.result.specialEffects, UNMAPPED_TARGET_NOTE],
      }
    : scoreResolution.result;

  if (resolvedTargetHit && simulation.hitPoint) {
    const hitPoint = simulation.hitPoint;
    const hitNormal = simulation.hitNormal ?? new THREE.Vector3(0, 0, 1);
    const hitDistance = simulation.hitDistance;
    const hitUv = simulation.hitUv;

    const impactOffset = hitNormal.clone().multiplyScalar(0.06);
    const traceEnd = hitPoint.clone().add(impactOffset);

    return {
      resolvedTargetHit,
      result,
      feedback: {
        active: true,
        hit: true,
        firedAt,
        crosshairPosition,
        hitDistance,
        damageScale: THREE.MathUtils.clamp(result.damageAmount / Math.max(scenario.totalMaxValue, 1), 0.1, 1),
        travelTimeMs: THREE.MathUtils.clamp((hitDistance / 45) * 1000, 140, 480),
        traceEnd: [traceEnd.x, traceEnd.y, traceEnd.z],
        hitPoint: [hitPoint.x, hitPoint.y, hitPoint.z],
        hitNormal: [hitNormal.x, hitNormal.y, hitNormal.z],
        impactUv: hitUv ? [hitUv.x, hitUv.y] : null,
        sampledValue: scoreResolution.sampledValue,
        usedFallbackSample: scoreResolution.usedFallbackSample,
        ballisticsSeed,
        scoreBreakdown: {
          sampledValue: scoreResolution.sampledValue,
          zoneMultiplier: scoreResolution.zoneMultiplier,
          criticalModifier: scoreResolution.criticalModifier,
        },
        isDadaistTrigger: scoreResolution.isDadaistTrigger,
        simulationEvents: simulation.events,
      },
    };
  }

  const missEnd = simulation.traceEnd;
  return {
    resolvedTargetHit,
    result,
    feedback: {
      active: true,
      hit: false,
      firedAt,
      crosshairPosition,
      hitDistance: MISS_TRACE_DISTANCE,
      damageScale: 0.15,
      travelTimeMs: THREE.MathUtils.clamp((MISS_TRACE_DISTANCE / 45) * 1000, 160, 420),
      traceEnd: [missEnd.x, missEnd.y, missEnd.z],
      ballisticsSeed,
      simulationEvents: simulation.events,
    },
  };
}
