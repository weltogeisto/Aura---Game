import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import type { Scenario, Target } from '@/types';
import { simulateShot, type SimulationObject } from '@/lib/ballistics/simulation';
import type { BallisticsConfig } from '@/lib/ballistics/trajectory';
import { resolveShotScore } from '@/lib/scoring/shotScoring';


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
      const hitTargetData = simulation.hitObject?.targetId
        ? selectedScenario.targets.find((target) => target.id === simulation.hitObject?.targetId)
        : undefined;
      const scoreResolution = resolveShotScore(selectedScenario, simulation, hitTargetData);
      const result = scoreResolution.result;

      if (simulation.hit && simulation.hitObject?.targetId && simulation.hitPoint) {
        const hitPoint = simulation.hitPoint!;
        const hitNormal = simulation.hitNormal ?? new THREE.Vector3(0, 0, 1);
        const hitDistance = simulation.hitDistance;
        const hitUv = simulation.hitUv;

        const impactOffset = hitNormal.clone().multiplyScalar(0.06);
        const traceEnd = hitPoint.clone().add(impactOffset);

        commitShot(result, {
          active: true,
          hit: true,
          firedAt: Date.now(),
          crosshairPosition,
          hitDistance,
          damageScale: THREE.MathUtils.clamp(result.damageAmount / Math.max(selectedScenario.totalMaxValue, 1), 0.1, 1),
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
        });
      } else {
        const missEnd = simulation.traceEnd;
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
