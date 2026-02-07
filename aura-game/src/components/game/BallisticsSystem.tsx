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

        // Calculate damage based on hit + simple distance attenuation
        const attenuation = THREE.MathUtils.clamp(1 - firstIntersect.distance * 0.15, 0.6, 1);
        const adjustedDamage = Math.round(hitValue * attenuation);
        totalDamage = adjustedDamage;

        // Check for easter eggs
        const specialEffects: string[] = [];

        if (hitTarget === 'fire-sensor') {
          // Systemic trigger: all paintings destroyed
          totalDamage = selectedScenario.totalMaxValue;
          specialEffects.push('Fire suppression system activated!');
          specialEffects.push('All paintings destroyed by water damage.');
          specialEffects.push('Total cultural damage: €3.5 Billion');
        } else if (hitTarget === 'mop-bucket') {
          // Dadaist trigger: values inverted
          specialEffects.push('DUCHAMP MODE ACTIVATED');
          specialEffects.push('All values have been philosophically inverted.');
          totalDamage = 0;
        }

        // Create breakdown
        const breakdown = selectedScenario.targets
          .filter(t => {
            if (hitTarget === 'fire-sensor') {
              return t.type === 'masterpiece' || t.type === 'sculpture';
            }
            return t.id === hitTarget;
          })
          .map(t => {
            if (hitTarget === 'fire-sensor') {
              return {
                targetId: t.id,
                targetName: t.name,
                damage: t.value,
                percentage: (t.value / selectedScenario.totalMaxValue) * 100,
              };
            }

            return {
              targetId: t.id,
              targetName: t.name,
              damage: t.id === hitTarget ? adjustedDamage : 0,
              percentage: (adjustedDamage / selectedScenario.totalMaxValue) * 100,
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
          hitPoint: [hitPoint.x, hitPoint.y, hitPoint.z],
          hitNormal: [hitNormal.x, hitNormal.y, hitNormal.z],
        });
        timeoutRef.current = window.setTimeout(() => finalizeShot(), 700);
      } else {
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
