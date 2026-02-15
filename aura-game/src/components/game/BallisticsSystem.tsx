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
  const fireShotResult = useGameStore((state) => state.fireShotResult);
  const finalizeShot = useGameStore((state) => state.finalizeShot);
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

      const scoreResolution = resolveShotScore(selectedScenario, simulation, hitTarget);
      const travelTimeMs = THREE.MathUtils.clamp((simulation.hitDistance / 45) * 1000, 140, 520);
      const damageScale = THREE.MathUtils.clamp(
        scoreResolution.result.damageAmount / Math.max(selectedScenario.totalMaxValue, 1),
        0.1,
        1
      );

      fireShotResult(scoreResolution.result, {
        active: true,
        hit: simulation.hit,
        firedAt: Date.now(),
        crosshairPosition,
        hitDistance: simulation.hitDistance,
        damageScale,
        travelTimeMs,
        traceEnd: [simulation.traceEnd.x, simulation.traceEnd.y, simulation.traceEnd.z],
        hitPoint: simulation.hitPoint
          ? [simulation.hitPoint.x, simulation.hitPoint.y, simulation.hitPoint.z]
          : undefined,
        hitNormal: simulation.hitNormal
          ? [simulation.hitNormal.x, simulation.hitNormal.y, simulation.hitNormal.z]
          : undefined,
        impactUv: simulation.hitUv ? [simulation.hitUv.x, simulation.hitUv.y] : null,
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

      timeoutRef.current = window.setTimeout(() => finalizeShot(), 700);
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
    fireShotResult,
    finalizeShot,
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
