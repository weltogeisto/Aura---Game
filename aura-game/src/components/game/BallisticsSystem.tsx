import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import type { ShotResult } from '@/types';

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

      // Create raycaster
      const raycaster = new THREE.Raycaster();
      const sway = 0.008;
      const mouse = new THREE.Vector2(
        crosshairPosition.x * 2 - 1 + (Math.random() - 0.5) * sway,
        -(crosshairPosition.y * 2 - 1) + (Math.random() - 0.5) * sway
      );

      // Cast ray
      raycaster.setFromCamera(mouse, camera);

      // Get all meshes in the scene
      const allObjects: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData.targetId) {
          allObjects.push(obj);
        }
      });

      const intersects = raycaster.intersectObjects(allObjects);

      let hitTarget: string | null = null;
      let hitValue = 0;
      let totalDamage = 0;
      const missTraceDistance = 45;

      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        const hitMesh = firstIntersect.object as THREE.Mesh;
        hitTarget = hitMesh.userData.targetId as string;
        hitValue = hitMesh.userData.value || 0;
        const hitPoint = firstIntersect.point.clone();
        const hitNormal = firstIntersect.face?.normal
          ? firstIntersect.face.normal.clone()
          : new THREE.Vector3(0, 0, 1);

        if (firstIntersect.face && hitMesh.matrixWorld) {
          const normalMatrix = new THREE.Matrix3().getNormalMatrix(hitMesh.matrixWorld);
          hitNormal.applyMatrix3(normalMatrix).normalize();
        }
        const impactOffset = hitNormal.clone().multiplyScalar(0.06);
        const traceEnd = hitPoint.clone().add(impactOffset);

        // Calculate damage based on hit + simple distance attenuation
        const attenuation = THREE.MathUtils.clamp(1 - firstIntersect.distance * 0.15, 0.6, 1);
        const adjustedDamage = Math.round(hitValue * attenuation);
        totalDamage = adjustedDamage;
        const damageScale = THREE.MathUtils.clamp(
          adjustedDamage / Math.max(selectedScenario.totalMaxValue, 1),
          0.1,
          1
        );
        const travelTimeMs = THREE.MathUtils.clamp(
          (firstIntersect.distance / 45) * 1000,
          140,
          480
        );

        const hitTargetData = selectedScenario.targets.find((target) => target.id === hitTarget);
        const specialEffects = hitTargetData?.specialEffects ? [...hitTargetData.specialEffects] : [];
        totalDamage = hitTargetData?.overrideTotalDamage ?? adjustedDamage;
        const breakdownMode = hitTargetData?.breakdownMode ?? 'hit-target';

        // Create breakdown
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
              return selectedScenario.targets.filter((target) => target.id === hitTarget);
          }
        })();

        const breakdown = breakdownTargets.map((target) => {
          const damage =
            breakdownMode === 'hit-target'
              ? adjustedDamage
              : target.value;

          return {
            targetId: target.id,
            targetName: target.name,
            damage,
            percentage: (damage / selectedScenario.totalMaxValue) * 100,
          };
        });

        const result: ShotResult = {
          hitTargetId: hitTarget,
          hitTargetName: hitMesh.userData.targetName,
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
          hitDistance: firstIntersect.distance,
          damageScale,
          travelTimeMs,
          traceEnd: [traceEnd.x, traceEnd.y, traceEnd.z],
          hitPoint: [hitPoint.x, hitPoint.y, hitPoint.z],
          hitNormal: [hitNormal.x, hitNormal.y, hitNormal.z],
        });
        timeoutRef.current = window.setTimeout(() => finalizeShot(), 700);
      } else {
        const missEnd = raycaster.ray.at(missTraceDistance, new THREE.Vector3());
        const travelTimeMs = THREE.MathUtils.clamp((missTraceDistance / 45) * 1000, 160, 420);

        // Miss
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
          travelTimeMs,
          traceEnd: [missEnd.x, missEnd.y, missEnd.z],
        });
        timeoutRef.current = window.setTimeout(() => finalizeShot(), 700);
      }
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
