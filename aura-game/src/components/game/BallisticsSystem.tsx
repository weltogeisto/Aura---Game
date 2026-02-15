import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { buildTrajectory, resolveImpact } from '@/lib/ballistics';
import { sampleValueMesh, scoreImpact } from '@/lib/valueMesh';
import type { ShotResult } from '@/types';

const DEFAULT_BALLISTICS = {
  swayRadians: 0.008,
  muzzleVelocity: 52,
  gravity: 9.81,
  maxDistance: 55,
  timeStep: 1 / 120,
};

export function BallisticsSystem() {
  const { scene, camera } = useThree();
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const crosshairPosition = useGameStore((state) => state.crosshairPosition);
  const fireShotResult = useGameStore((state) => state.fireShotResult);
  const finalizeShot = useGameStore((state) => state.finalizeShot);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (gamePhase !== 'aiming') return;

    const handleClick = () => {
      if (!scene || !camera || !selectedScenario) return;

      const allObjects: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData.targetId) {
          allObjects.push(obj);
        }
      });

      const ballisticsSeed = hashSeed(`${selectedScenario.id}:${crosshairPosition.x.toFixed(5)}:${crosshairPosition.y.toFixed(5)}`);
      const trajectory = buildTrajectory(camera, crosshairPosition, {
        ...DEFAULT_BALLISTICS,
        seed: ballisticsSeed,
      });

      const impact = resolveImpact(trajectory, allObjects, {
        ...DEFAULT_BALLISTICS,
        seed: ballisticsSeed,
      });

      if (impact) {
        const hitTarget = selectedScenario.targets.find((target) => target.id === impact.metadata.objectId);
        const sampled = sampleValueMesh(
          hitTarget?.valueMesh ?? [[hitTarget?.value ?? 0]],
          impact.uv ? { u: impact.uv.x, v: impact.uv.y } : null,
          hitTarget?.value ?? 0
        );
        const adjustedDamage = scoreImpact({
          sampledValue: sampled.value,
          zoneMultiplier: hitTarget?.zoneMultiplier ?? 1,
          criticalModifier: hitTarget?.criticalModifier ?? 1,
        });

        const totalDamage = hitTarget?.overrideTotalDamage ?? adjustedDamage;
        const breakdownMode = hitTarget?.breakdownMode ?? 'hit-target';
        const specialEffects = hitTarget?.specialEffects ? [...hitTarget.specialEffects] : [];
        const impactOffset = impact.normal.clone().multiplyScalar(0.06);
        const traceEnd = impact.point.clone().add(impactOffset);

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
              return hitTarget ? [hitTarget] : [];
          }
        })();

        const breakdown = breakdownTargets.map((target) => {
          const damage = breakdownMode === 'hit-target' ? adjustedDamage : target.value;
          return {
            targetId: target.id,
            targetName: target.name,
            damage,
            percentage: (damage / selectedScenario.totalMaxValue) * 100,
          };
        });

        const result: ShotResult = {
          hitTargetId: impact.metadata.objectId,
          hitTargetName: impact.metadata.objectName,
          damageAmount: adjustedDamage,
          totalDamage,
          breakdown,
          specialEffects,
        };

        fireShotResult(result, {
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
        const missTraceDistance = 45;
        const direction = trajectory.velocity.clone().normalize();
        const missEnd = trajectory.origin.clone().addScaledVector(direction, missTraceDistance);

        const result: ShotResult = {
          hitTargetId: null,
          hitTargetName: null,
          damageAmount: 0,
          totalDamage: 0,
          breakdown: [],
          specialEffects: ['Shot missed the target completely.'],
        };

        fireShotResult(result, {
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

      timeoutRef.current = window.setTimeout(() => finalizeShot(), 700);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [gamePhase, selectedScenario, crosshairPosition, scene, camera, fireShotResult, finalizeShot]);

  return null;
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
