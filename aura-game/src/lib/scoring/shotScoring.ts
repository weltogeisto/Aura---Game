import * as THREE from 'three';
import type { Scenario, ShotResult, Target } from '../../types/index.ts';
import { sampleValueMesh, scoreImpact } from '../valueMesh.ts';
import type { ShotSimulationResult } from '../ballistics/simulation.ts';

export const DEFAULT_DADAIST_SCORE = 1917000001;

export interface ScoreResolution {
  result: ShotResult;
  sampledValue: number;
  usedFallbackSample: boolean;
  zoneMultiplier: number;
  criticalModifier: number;
  isDadaistTrigger: boolean;
}

export function buildHitLocationLabel(hitPoint: THREE.Vector3, target: Target | undefined, scenario: Scenario): string {
  if (!target) {
    return `${scenario.name} — Unknown contact`;
  }

  const localPoint = hitPoint.clone().sub(new THREE.Vector3(...target.position));
  const horizontal = localPoint.x < -target.radius * 0.35 ? 'Left' : localPoint.x > target.radius * 0.35 ? 'Right' : 'Center';
  const vertical = localPoint.y > target.radius * 0.35 ? 'Upper' : localPoint.y < -target.radius * 0.35 ? 'Lower' : 'Midline';

  return `${scenario.name} — ${target.name} (${vertical} ${horizontal})`;
}

export function deterministicCriticLine(
  scenario: Scenario,
  totalScore: number,
  hitTargetId: string | null,
  hitTargetType: Target['type'] | null,
  hitLocationLabel: string
): string {
  if (hitTargetType === 'easter-egg-dadaist') {
    return 'Dadaist inversion confirmed: valuation collapses into pure gesture. The market applauds the void.';
  }

  const criticLines = scenario.criticLines;
  if (!criticLines) {
    return 'The critic is still taking notes.';
  }

  const ratio = scenario.totalMaxValue ? totalScore / scenario.totalMaxValue : 0;
  const pool = ratio >= 0.6 ? criticLines.high : ratio >= 0.25 ? criticLines.mid : criticLines.low;
  const seedInput = `${scenario.id}|${hitTargetId ?? 'miss'}|${totalScore}|${hitLocationLabel}`;
  const hash = seedInput.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
  return pool[hash % pool.length] ?? 'The critic is still taking notes.';
}

export function resolveShotScore(
  scenario: Scenario,
  simulation: ShotSimulationResult,
  target: Target | undefined
): ScoreResolution {
  if (!simulation.hit || !target || !simulation.hitPoint) {
    const missLocation = `${scenario.name} — No registered contact`;
    const criticLine = deterministicCriticLine(scenario, 0, null, null, missLocation);

    return {
      result: {
        hitTargetId: null,
        hitTargetName: null,
        hitTargetType: null,
        hitLocationLabel: missLocation,
        damageAmount: 0,
        totalDamage: 0,
        totalScore: 0,
        breakdown: [],
        specialEffects: ['Shot missed the target completely.'],
        criticLine,
        simulationEvents: simulation.events,
      },
      sampledValue: 0,
      usedFallbackSample: true,
      zoneMultiplier: 0,
      criticalModifier: 1,
      isDadaistTrigger: false,
    };
  }

  const fallbackSampleValue = scenario.scoring?.fallbackSampleValue ?? target.value;
  const sampled = sampleValueMesh(
    target.valueMesh ?? [[target.value]],
    simulation.hitUv ? { u: simulation.hitUv.x, v: simulation.hitUv.y } : null,
    fallbackSampleValue
  );

  const zoneMultiplier = target.zoneMultiplier ?? scenario.scoring?.defaultZoneMultiplier ?? 1;
  const criticalModifier = target.criticalModifier ?? scenario.scoring?.defaultCriticalModifier ?? 1;
  const damageAmount = scoreImpact({ sampledValue: sampled.value, zoneMultiplier, criticalModifier });

  const totalDamage = target.overrideTotalDamage ?? damageAmount;
  const dadaistScore = scenario.scoring?.dadaistScore ?? DEFAULT_DADAIST_SCORE;
  const isDadaistTrigger = target.type === 'easter-egg-dadaist';
  const totalScore = isDadaistTrigger ? dadaistScore : totalDamage;
  const breakdownMode = target.breakdownMode ?? 'hit-target';

  const breakdownTargets = getBreakdownTargets(scenario, breakdownMode, target.id);
  const breakdown = breakdownTargets.map((entry) => {
    const damage = breakdownMode === 'hit-target' ? damageAmount : entry.value;
    return {
      targetId: entry.id,
      targetName: entry.name,
      damage,
      percentage: (damage / Math.max(scenario.totalMaxValue, 1)) * 100,
    };
  });

  const hitLocationLabel = buildHitLocationLabel(simulation.hitPoint, target, scenario);
  const criticLine = deterministicCriticLine(scenario, totalScore, target.id, target.type, hitLocationLabel);

  return {
    result: {
      hitTargetId: target.id,
      hitTargetName: target.name,
      hitTargetType: target.type,
      hitLocationLabel,
      damageAmount,
      totalDamage,
      totalScore,
      breakdown,
      specialEffects: target.specialEffects ? [...target.specialEffects] : [],
      criticLine,
      resolvedWithOverride: typeof target.overrideTotalDamage === 'number',
      simulationEvents: simulation.events,
    },
    sampledValue: sampled.value,
    usedFallbackSample: sampled.usedFallback,
    zoneMultiplier,
    criticalModifier,
    isDadaistTrigger,
  };
}

function getBreakdownTargets(
  scenario: Scenario,
  mode: NonNullable<Target['breakdownMode']>,
  hitTargetId: string
): Scenario['targets'] {
  switch (mode) {
    case 'none':
      return [];
    case 'all-targets':
      return scenario.targets;
    case 'masterpieces-and-sculptures':
      return scenario.targets.filter((target) => target.type === 'masterpiece' || target.type === 'sculpture');
    case 'hit-target':
    default:
      return scenario.targets.filter((target) => target.id === hitTargetId);
  }
}
