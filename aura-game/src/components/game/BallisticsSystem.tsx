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

const AIM_ASSIST_RADIUS_PX = 72;

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

function resolveAimAssistCrosshair(
  scenario: Scenario,
  camera: THREE.Camera,
  crosshair: { x: number; y: number }
): { x: number; y: number } {
  const centerX = crosshair.x * window.innerWidth;
  const centerY = crosshair.y * window.innerHeight;

  let best: { x: number; y: number; distance: number } | null = null;
  const projected = new THREE.Vector3();

  for (const target of scenario.targets) {
    projected.set(target.position[0], target.position[1], target.position[2]).project(camera);
    if (projected.z < -1 || projected.z > 1) continue;

    const screenX = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    const dx = screenX - centerX;
    const dy = screenY - centerY;
    const distance = Math.hypot(dx, dy);
    if (distance > AIM_ASSIST_RADIUS_PX) continue;

    if (!best || distance < best.distance) {
      best = { x: screenX / window.innerWidth, y: screenY / window.innerHeight, distance };
    }
  }

  return best ? { x: best.x, y: best.y } : crosshair;
}

export function BallisticsSystem() {
  const { scene, camera } = useThree();
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const crosshairPosition = useGameStore((state) => state.crosshairPosition);
  const shotLocked = useGameStore((state) => state.shotLocked);
  const aimAssist = useGameStore((state) => state.accessibility.aimAssist);
  const commitShot = useGameStore((state) => state.commitShot);
  const finalizeResults = useGameStore((state) => state.finalizeResults);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (gamePhase !== 'aiming') return;

    const handleClick = () => {
      if (!scene || !camera || !selectedScenario || shotLocked) return;

      const effectiveCrosshair = aimAssist
        ? resolveAimAssistCrosshair(selectedScenario, camera, crosshairPosition)
        : crosshairPosition;

      const ballisticsSeed = hashSeed(`${selectedScenario.id}|${effectiveCrosshair.x.toFixed(4)}|${effectiveCrosshair.y.toFixed(4)}`);
      const simulationObjects = collectSimulationObjects(scene, selectedScenario);
      const simulation = simulateShot(camera, effectiveCrosshair, simulationObjects, {
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
        crosshairPosition: effectiveCrosshair,
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
    aimAssist,
    commitShot,
    finalizeResults,
  ]);

  return null;
}
