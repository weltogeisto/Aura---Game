import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import type { Scenario, Target } from '@/types';
import { simulateShot, type SimulationObject } from '@/lib/ballistics/simulation';
import { resolveShotScore } from '@/lib/scoring/shotScoring';
import type { BallisticsConfig } from '@/lib/ballistics/trajectory';

const DEFAULT_BALLISTICS: BallisticsConfig = {
  seed: 0,
  swayRadians: 0.008,
  muzzleVelocity: 52,
  gravity: 9.81,
  maxDistance: 55,
  timeStep: 1 / 120,
  maxInteractions: 6,
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

      const hitTarget = simulation.hitObject?.targetId
        ? selectedScenario.targets.find((target) => target.id === simulation.hitObject?.targetId)
        : undefined;

        const result: ShotResult = {
          hitTargetId: hitTarget,
          hitTargetName: hitMesh.userData.targetName,
          hitTargetType,
          hitLocationLabel,
          damageAmount: adjustedDamage,
          totalDamage,
          totalScore,
          breakdown,
          specialEffects,
          criticLine,
        };

        commitShot(result, {
          active: true,
          hit: true,
          firedAt: Date.now(),
          crosshairPosition,
          hitDistance: impact.distance,
          damageScale: THREE.MathUtils.clamp(adjustedDamage / Math.max(selectedScenario.totalMaxValue, 1), 0.1, 1),
          travelTimeMs: THREE.MathUtils.clamp((impact.distance / 45) * 1000, 140, 480),
          traceEnd: [traceEnd.x, traceEnd.y, traceEnd.z],
          hitPoint: [impact.point.x, impact.point.y, impact.point.z],
          hitNormal: [impact.normal.x, impact.normal.y, impact.normal.z],
          impactUv: impact.uv ? [impact.uv.x, impact.uv.y] : null,
          sampledValue: sampled.value,
          usedFallbackSample: sampled.usedFallback,
          ballisticsSeed,
        });
      } else {
        const missEnd = raycaster.ray.at(missTraceDistance, new THREE.Vector3());
        const travelTimeMs = THREE.MathUtils.clamp((missTraceDistance / 45) * 1000, 160, 420);
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

function collectSimulationObjects(scene: THREE.Scene, scenario: Scenario): SimulationObject[] {
  const objects: SimulationObject[] = [];

  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;

    const targetId = typeof obj.userData.targetId === 'string' ? obj.userData.targetId : null;
    const linkedTarget = targetId
      ? scenario.targets.find((target) => target.id === targetId)
      : undefined;

    objects.push({
      object: obj,
      targetId,
      targetName:
        (obj.userData.targetName as string | undefined)
        ?? linkedTarget?.name
        ?? obj.name
        ?? null,
      targetType:
        (obj.userData.targetType as Target['type'] | undefined)
        ?? linkedTarget?.type
        ?? null,
      material: linkedTarget?.material,
    });
  });

  return objects;
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
