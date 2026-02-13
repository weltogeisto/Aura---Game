import { createRef, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import type { Scenario, Target } from '@/types';

interface ValueMeshProps {
  scenario: Scenario;
}

function formatValue(value: number): string {
  return `€${new Intl.NumberFormat('en-US').format(Math.round(value))}`;
}

function createLabelTexture(target: Target): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    fallback.needsUpdate = true;
    return fallback;
  }

  ctx.fillStyle = 'rgba(245, 240, 230, 0.92)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#E5DFD3';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  ctx.fillStyle = '#666666';
  ctx.font = "500 26px 'IBM Plex Mono', 'Courier New', monospace";
  ctx.fillText('LOT REFERENCE', 36, 56);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = "600 56px 'Playfair Display', 'Times New Roman', serif";
  ctx.fillText(target.name.toUpperCase(), 36, 128);

  ctx.fillStyle = '#1A1A1A';
  ctx.font = "500 42px 'IBM Plex Mono', 'Courier New', monospace";
  ctx.fillText(formatValue(target.value), 36, 202);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function ValueMesh({ scenario }: ValueMeshProps) {
  const { camera } = useThree();
  const crosshairPosition = useGameStore((state) => state.crosshairPosition);
  const gamePhase = useGameStore((state) => state.gamePhase);
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const [focusedTargetId, setFocusedTargetId] = useState<string | null>(null);
  const focusedTargetRef = useRef<string | null>(null);

  const meshRefs = useMemo(
    () => scenario.targets.map(() => createRef<THREE.Group>()),
    [scenario.targets]
  );

  const labelTextures = useMemo(() => {
    return Object.fromEntries(
      scenario.targets.map((target) => [target.id, createLabelTexture(target)])
    ) as Record<string, THREE.CanvasTexture>;
  }, [scenario.targets]);

  const lockedTargetId = shotFeedback?.active && shotFeedback.hit ? lastShotResult?.hitTargetId ?? null : null;
  const hasSpecialEvent =
    Boolean(lastShotResult?.specialEffects?.length) || (shotFeedback?.damageScale ?? 0) > 0.85;

  useFrame(() => {
    meshRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.lookAt(camera.position);
      }
    });

    if (gamePhase !== 'aiming' && gamePhase !== 'shooting') {
      if (focusedTargetRef.current) {
        focusedTargetRef.current = null;
        setFocusedTargetId(null);
      }
      return;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(crosshairPosition.x * 2 - 1, -(crosshairPosition.y * 2 - 1));
    raycaster.setFromCamera(mouse, camera);

    let nearestTargetId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    scenario.targets.forEach((target) => {
      const sphere = new THREE.Sphere(
        new THREE.Vector3(target.position[0], target.position[1], target.position[2]),
        target.radius * 1.35
      );
      const hitPoint = raycaster.ray.intersectSphere(sphere, new THREE.Vector3());
      if (hitPoint) {
        const distance = camera.position.distanceTo(hitPoint);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestTargetId = target.id;
        }
      }
    });

    if (focusedTargetRef.current !== nearestTargetId) {
      focusedTargetRef.current = nearestTargetId;
      setFocusedTargetId(nearestTargetId);
    }
  });

  return (
    <group>
      {scenario.targets.map((target, index) => {
        const isRevealed = target.id === focusedTargetId || target.id === lockedTargetId;
        const showSpecialEventGlow = hasSpecialEvent && target.id === lockedTargetId;

        const plateWidth = Math.max(1.4, target.radius * 2.4);
        const plateHeight = plateWidth * 0.36;
        const stanchionY = Math.max(0.48, target.position[1] - target.radius * 0.65);

        return (
          <group
            key={`value-${target.id}`}
            position={[target.position[0], stanchionY, target.position[2] + target.radius * 0.95]}
            ref={meshRefs[index]}
          >
            <mesh renderOrder={2} position={[0, -0.18, 0]}>
              <circleGeometry args={[Math.max(0.05, target.radius * 0.09), 20]} />
              <meshStandardMaterial
                color={isRevealed ? '#C9A227' : '#666666'}
                emissive={showSpecialEventGlow ? '#8B0000' : '#000000'}
                emissiveIntensity={showSpecialEventGlow ? 0.35 : 0}
                transparent
                opacity={isRevealed ? 0.45 : 0.2}
                roughness={0.8}
                metalness={0.05}
              />
            </mesh>

            {isRevealed && (
              <mesh renderOrder={3} position={[0, 0.14, 0]}>
                <planeGeometry args={[plateWidth, plateHeight]} />
                <meshBasicMaterial
                  map={labelTextures[target.id]}
                  transparent
                  opacity={0.95}
                  depthWrite={false}
                />
              </mesh>
            )}

            {showSpecialEventGlow && (
              <mesh renderOrder={4} position={[0, 0.14, -0.01]}>
                <planeGeometry args={[plateWidth * 1.06, plateHeight * 1.25]} />
                <meshBasicMaterial
                  color="#C9A227"
                  transparent
                  opacity={0.22}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
