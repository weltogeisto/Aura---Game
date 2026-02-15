import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import type { Scenario, ShotResult, Target } from '@/types';
import { DADAIST_SCORE, deterministicCriticLine } from '@/lib/shotResolution';


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
  const fireShotResult = useGameStore((state) => state.fireShotResult);
  const finalizeShot = useGameStore((state) => state.finalizeShot);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (gamePhase !== 'aiming') return;

    const handleClick = () => {
      if (!scene || !camera || !selectedScenario || shotLocked) return;

      const raycaster = new THREE.Raycaster();
      const sway = 0.008;
      const mouse = new THREE.Vector2(
        crosshairPosition.x * 2 - 1 + (Math.random() - 0.5) * sway,
        -(crosshairPosition.y * 2 - 1) + (Math.random() - 0.5) * sway
      );

      raycaster.setFromCamera(mouse, camera);

      const allObjects: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.userData.targetId) {
          allObjects.push(obj);
        }
      });

      const intersects = raycaster.intersectObjects(allObjects);
      const missTraceDistance = 45;

      if (intersects.length > 0) {
        const firstIntersect = intersects[0];
        const hitMesh = firstIntersect.object as THREE.Mesh;
        const hitTarget = hitMesh.userData.targetId as string;
        const hitValue = hitMesh.userData.value || 0;
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

        const attenuation = THREE.MathUtils.clamp(1 - firstIntersect.distance * 0.15, 0.6, 1);
        const adjustedDamage = Math.round(hitValue * attenuation);
        const hitTargetData = selectedScenario.targets.find((target) => target.id === hitTarget);
        const hitTargetType = (hitMesh.userData.targetType as Target['type'] | undefined)
          ?? hitTargetData?.type
          ?? null;
        const specialEffects = hitTargetData?.specialEffects ? [...hitTargetData.specialEffects] : [];
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
              return hitTarget ? [hitTarget] : [];
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
          hitTarget,
          hitTargetType,
          hitLocationLabel
        );

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
        const missEnd = raycaster.ray.at(missTraceDistance, new THREE.Vector3());
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

