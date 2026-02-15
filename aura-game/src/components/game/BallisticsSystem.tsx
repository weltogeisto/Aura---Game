import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import type { Scenario, ShotResult, Target } from '@/types';
import { DADAIST_SCORE, deterministicCriticLine } from '@/lib/shotResolution';
import { simulateShot, type SimulationObject } from '@/lib/ballistics/simulation';
import type { BallisticsConfig } from '@/lib/ballistics/trajectory';


const DEFAULT_BALLISTICS: BallisticsConfig = {
  seed: 0,
  swayRadians: 0.003,
  muzzleVelocity: 370,
  gravity: 9.81,
  maxDistance: 200,
  timeStep: 0.001,
  maxInteractions: 6,
};

function hashSeed(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function collectSimulationObjects(
  scene: THREE.Scene,
  scenario: Scenario
): SimulationObject[] {
  const objects: SimulationObject[] = [];
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const targetId = child.userData.targetId as string | undefined;
    if (!targetId) return;
    const target = scenario.targets.find((t) => t.id === targetId);
    objects.push({
      object: child,
      targetId: targetId ?? null,
      targetName: (child.userData.targetName as string) ?? target?.name ?? null,
      targetType: (child.userData.targetType as Target['type']) ?? target?.type ?? null,
      material: target?.material,
    });
  });
  return objects;
}

const buildHitLocationLabel = (
  hitPoint: THREE.Vector3,
  target: Target | undefined,
  scenario: Scenario
): string => {
  if (!target) {
    return 'Unknown contact';
  }

  const localPoint = hitPoint.clone().sub(new THREE.Vector3(...target.position));
  const horizontal = localPoint.x < -target.radius * 0.35
    ? 'Left'
    : localPoint.x > target.radius * 0.35
      ? 'Right'
      : 'Center';
  const vertical = localPoint.y > target.radius * 0.35
    ? 'Upper'
    : localPoint.y < -target.radius * 0.35
      ? 'Lower'
      : 'Midline';

  return `${scenario.name} — ${target.name} (${vertical} ${horizontal})`;
};


export function BallisticsSystem() {
  const { scene, camera } = useThree();
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const crosshairPosition = useGameStore((state) => state.crosshairPosition);
  const shotLocked = useGameStore((state) => state.shotLocked);
  const commitShot = useGameStore((state) => state.commitShot);
  const finalizeResults = useGameStore((state) => state.finalizeResults);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (gamePhase !== 'aiming') return;

    const handleClick = () => {
      if (!scene || !camera || !selectedScenario || shotLocked) return;

      const ballisticsSeed = hashSeed(`${selectedScenario.id}|${crosshairPosition.x.toFixed(4)}|${crosshairPosition.y.toFixed(4)}`);
      const simulationObjects = collectSimulationObjects(scene, selectedScenario);
      const simulation = simulateShot(camera, crosshairPosition, simulationObjects, {
        ...DEFAULT_BALLISTICS,
        seed: ballisticsSeed,
      });

      const missTraceDistance = 45;

      if (simulation.hit && simulation.hitObject?.targetId) {
        const hitTargetId = simulation.hitObject.targetId;
        const hitPoint = simulation.hitPoint!;
        const hitNormal = simulation.hitNormal ?? new THREE.Vector3(0, 0, 1);
        const hitDistance = simulation.hitDistance;
        const hitUv = simulation.hitUv;

        const hitTargetData = selectedScenario.targets.find((target) => target.id === hitTargetId);
        const hitValue = hitTargetData?.value ?? 0;
        const hitTargetType = simulation.hitObject.targetType ?? hitTargetData?.type ?? null;
        const specialEffects = hitTargetData?.specialEffects ? [...hitTargetData.specialEffects] : [];

        const impactOffset = hitNormal.clone().multiplyScalar(0.06);
        const traceEnd = hitPoint.clone().add(impactOffset);

        const attenuation = THREE.MathUtils.clamp(1 - hitDistance * 0.15, 0.6, 1);
        const adjustedDamage = Math.round(hitValue * attenuation);
        const totalDamage = hitTargetData?.overrideTotalDamage ?? adjustedDamage;
        const totalScore = hitTargetType === 'easter-egg-dadaist' ? DADAIST_SCORE : totalDamage;
        const breakdownMode = hitTargetData?.breakdownMode ?? 'hit-target';

        const breakdownTargets = (() => {
          switch (breakdownMode) {
            case 'none':
              return [];
            case 'all-targets':
              return selectedScenario.targets;
            case 'masterpieces-and-sculptures':
              return selectedScenario.targets.filter(
                (target) => target.type === 'masterpiece' || target.type === 'sculpture'
              );
            case 'hit-target':
            default:
              return hitTargetData ? [hitTargetData] : [];
          }
        })();

        const breakdown = breakdownTargets.map((target) => ({
          targetId: target.id,
          targetName: target.name,
          damage: breakdownMode === 'hit-target' ? adjustedDamage : target.value,
          percentage:
            ((breakdownMode === 'hit-target' ? adjustedDamage : target.value)
              / selectedScenario.totalMaxValue)
            * 100,
        }));

        const hitLocationLabel = buildHitLocationLabel(hitPoint, hitTargetData, selectedScenario);
        const criticLine = deterministicCriticLine(
          selectedScenario,
          totalScore,
          hitTargetId,
          hitTargetType,
          hitLocationLabel
        );

        const result: ShotResult = {
          hitTargetId,
          hitTargetName: simulation.hitObject.targetName,
          hitTargetType,
          hitLocationLabel,
          damageAmount: adjustedDamage,
          totalDamage,
          totalScore,
          breakdown,
          specialEffects,
          criticLine,
          simulationEvents: simulation.events,
        };

        const sampledValue = hitTargetData?.valueMesh
          ? (hitTargetData.valueMesh[0]?.[0] ?? hitValue)
          : hitValue;

        commitShot(result, {
          active: true,
          hit: true,
          firedAt: Date.now(),
          crosshairPosition,
          hitDistance,
          damageScale: THREE.MathUtils.clamp(adjustedDamage / Math.max(selectedScenario.totalMaxValue, 1), 0.1, 1),
          travelTimeMs: THREE.MathUtils.clamp((hitDistance / 45) * 1000, 140, 480),
          traceEnd: [traceEnd.x, traceEnd.y, traceEnd.z],
          hitPoint: [hitPoint.x, hitPoint.y, hitPoint.z],
          hitNormal: [hitNormal.x, hitNormal.y, hitNormal.z],
          impactUv: hitUv ? [hitUv.x, hitUv.y] : null,
          sampledValue,
          usedFallbackSample: !hitTargetData?.valueMesh,
          ballisticsSeed,
          simulationEvents: simulation.events,
        });
      } else {
        const missEnd = simulation.traceEnd;
        const missLocationLabel = `${selectedScenario.name} — No registered contact`;
        const criticLine = deterministicCriticLine(
          selectedScenario,
          0,
          null,
          null,
          missLocationLabel
        );

        const result: ShotResult = {
          hitTargetId: null,
          hitTargetName: null,
          hitTargetType: null,
          hitLocationLabel: missLocationLabel,
          damageAmount: 0,
          totalDamage: 0,
          totalScore: 0,
          breakdown: [],
          specialEffects: ['Shot missed the target completely.'],
          criticLine,
          simulationEvents: simulation.events,
        };

        commitShot(result, {
          active: true,
          hit: false,
          firedAt: Date.now(),
          crosshairPosition,
          hitDistance: missTraceDistance,
          damageScale: 0.15,
          travelTimeMs: THREE.MathUtils.clamp((missTraceDistance / 45) * 1000, 160, 420),
          traceEnd: [missEnd.x, missEnd.y, missEnd.z],
          ballisticsSeed,
          simulationEvents: simulation.events,
        });
      }

      timeoutRef.current = window.setTimeout(() => finalizeResults(), 700);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [
    gamePhase,
    selectedScenario,
    crosshairPosition,
    scene,
    camera,
    shotLocked,
    commitShot,
    finalizeResults,
  ]);

  return null;
}
