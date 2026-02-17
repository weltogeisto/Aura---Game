import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import type { Scenario, Target } from '@/types';
import { simulateShot, type SimulationObject } from '@/lib/ballistics/simulation';
import type { BallisticsConfig } from '@/lib/ballistics/trajectory';
import { resolveShotScore } from '@/lib/scoring/shotScoring';
import { resolveShotCommitPayload } from '@/lib/ballistics/shotFeedback';


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
  const unmappedTargetIds = new Set<string>();
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const targetId = child.userData.targetId as string | undefined;
    if (!targetId) return;
    const target = scenario.targets.find((t) => t.id === targetId);
    if (!target) {
      unmappedTargetIds.add(targetId);
    }
    objects.push({
      object: child,
      targetId: targetId ?? null,
      targetName: (child.userData.targetName as string) ?? target?.name ?? null,
      targetType: (child.userData.targetType as Target['type']) ?? target?.type ?? null,
      material: target?.material,
    });
  });

  if (unmappedTargetIds.size > 0) {
    console.warn(
      `[BallisticsSystem] Unmapped target mesh ids in scenario "${scenario.id}": ${Array.from(unmappedTargetIds).join(', ')}`
    );
  }

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

      const hitTargetData = simulation.hitObject?.targetId
        ? selectedScenario.targets.find((target) => target.id === simulation.hitObject?.targetId)
        : undefined;
      const scoreResolution = resolveShotScore(selectedScenario, simulation, hitTargetData);
      const { result, feedback } = resolveShotCommitPayload({
        scenario: selectedScenario,
        simulation,
        scoreResolution,
        hitTargetData,
        crosshairPosition,
        ballisticsSeed,
        firedAt: Date.now(),
      });

      commitShot(result, feedback);

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
