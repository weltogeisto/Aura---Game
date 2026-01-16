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

  // Prevent double-click issues with a ref to track if shot has been fired
  const hasFiredRef = useRef(false);

  useEffect(() => {
    // Reset the fired flag when game phase changes to aiming
    if (gamePhase === 'aiming') {
      hasFiredRef.current = false;
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase !== 'aiming') return;

    const handleClick = () => {
      // Prevent multiple shots (double-click protection)
      if (hasFiredRef.current) return;
      if (!scene || !camera || !selectedScenario) return;

      // Mark as fired immediately to prevent double-clicks
      hasFiredRef.current = true;

      // Create raycaster
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        crosshairPosition.x * 2 - 1,
        -(crosshairPosition.y * 2 - 1)
      );

      // Cast ray
      raycaster.setFromCamera(mouse, camera);

      // Get all meshes in the scene that are targets
      const allObjects: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData.targetId) {
          allObjects.push(obj);
        }
      });

      const intersects = raycaster.intersectObjects(allObjects);

      let hitTarget: string | null = null;
      let hitTargetName: string | null = null;
      let hitValue = 0;
      let totalDamage = 0;
      const specialEffects: string[] = [];

      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        const hitMesh = firstIntersect.object as THREE.Mesh;
        hitTarget = hitMesh.userData.targetId as string;
        hitTargetName = hitMesh.userData.targetName as string;
        hitValue = hitMesh.userData.value || 0;

        // Calculate damage based on hit
        totalDamage = hitValue;

        // Check for easter eggs
        if (hitTarget === 'fire-sensor') {
          // Systemic trigger: all paintings and sculptures destroyed by water
          specialEffects.push('Fire suppression system activated!');
          specialEffects.push('All paintings destroyed by water damage.');

          // Calculate total damage from all artwork (masterpieces + sculptures)
          totalDamage = selectedScenario.targets
            .filter(t => t.type === 'masterpiece' || t.type === 'sculpture')
            .reduce((sum, t) => sum + t.value, 0);

          specialEffects.push(`Total cultural damage: €${(totalDamage / 1000000000).toFixed(2)} Billion`);
        } else if (hitTarget === 'mop-bucket') {
          // Dadaist trigger: philosophical message about value
          specialEffects.push('DUCHAMP MODE ACTIVATED');
          specialEffects.push('All values have been philosophically inverted.');
          specialEffects.push('Is a mop bucket art? Is the Mona Lisa?');
          totalDamage = 0;
        }

        // Create breakdown - correctly calculate damage for each affected target
        const breakdown = selectedScenario.targets
          .filter(t => {
            if (hitTarget === 'fire-sensor') {
              // Fire sensor affects all masterpieces and sculptures
              return t.type === 'masterpiece' || t.type === 'sculpture';
            }
            // Normal hit only affects the specific target
            return t.id === hitTarget;
          })
          .map(t => {
            // For the Dadaist easter egg, all values become 0 (philosophically inverted)
            const isDadaistMode = hitTarget === 'mop-bucket';
            const effectiveDamage = isDadaistMode ? 0 : t.value;

            return {
              targetId: t.id,
              targetName: t.name,
              // Each target's damage is its own value (or 0 in Dadaist mode)
              damage: effectiveDamage,
              // Percentage is this target's value relative to total max value
              percentage: isDadaistMode ? 0 : (t.value / selectedScenario.totalMaxValue) * 100,
            };
          });

        const result: ShotResult = {
          hitTargetId: hitTarget,
          hitTargetName: hitTargetName,
          damageAmount: hitValue,
          totalDamage,
          breakdown,
          specialEffects,
        };

        fireShotResult(result);
      } else {
        // Miss - no target hit
        const result: ShotResult = {
          hitTargetId: null,
          hitTargetName: null,
          damageAmount: 0,
          totalDamage: 0,
          breakdown: [],
          specialEffects: ['Shot missed the target completely.'],
        };

        fireShotResult(result);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [gamePhase, selectedScenario, crosshairPosition, scene, camera, fireShotResult]);

  return null;
}
