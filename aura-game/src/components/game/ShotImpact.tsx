import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';

function getImpactVectors(shotFeedback: ReturnType<typeof useGameStore.getState>['shotFeedback']) {
  const hitPosition = shotFeedback?.hitPoint
    ? new THREE.Vector3(shotFeedback.hitPoint[0], shotFeedback.hitPoint[1], shotFeedback.hitPoint[2])
    : new THREE.Vector3();

  const hitNormal = shotFeedback?.hitNormal
    ? new THREE.Vector3(shotFeedback.hitNormal[0], shotFeedback.hitNormal[1], shotFeedback.hitNormal[2])
    : new THREE.Vector3(0, 0, 1);

  return { hitPosition, hitNormal };
}

export function ShotImpact() {
  const { camera } = useThree();
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const particleOffsets = useMemo(() => {
    const offsets = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i += 1) {
      const spread = 0.24;
      offsets[i * 3] = Math.sin(i * 1.7) * spread;
      offsets[i * 3 + 1] = Math.cos(i * 1.3) * spread;
      offsets[i * 3 + 2] = Math.sin(i * 2.1) * Math.cos(i * 0.7) * spread;
    }
    return offsets;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const { hitPosition, hitNormal } = getImpactVectors(shotFeedback);
    const offset = hitNormal.multiplyScalar(0.06);
    meshRef.current.position.copy(hitPosition.add(offset));
  }, [shotFeedback]);

  useFrame(() => {
    if (!shotFeedback?.active || !shotFeedback.hit) {
      if (materialRef.current) materialRef.current.opacity = 0;
      if (particlesRef.current) particlesRef.current.visible = false;
      return;
    }

    const { hitPosition, hitNormal } = getImpactVectors(shotFeedback);
    const elapsed = (Date.now() - shotFeedback.firedAt) / 1000;
    const duration = 0.45;
    const progress = Math.min(elapsed / duration, 1);

    if (materialRef.current && meshRef.current) {
      materialRef.current.opacity = (1 - progress) * 0.85;
      const impactScale = shotFeedback.damageScale ?? 0.4;
      const scale = 0.25 + progress * (0.7 + impactScale);
      meshRef.current.scale.set(scale, scale, scale);
      const offset = hitNormal.clone().multiplyScalar(0.06);
      meshRef.current.position.copy(hitPosition.clone().add(offset));
      meshRef.current.lookAt(camera.position);
      meshRef.current.rotateOnAxis(hitNormal, Math.sin(progress * Math.PI) * 0.15);
    }

    if (particlesRef.current) {
      particlesRef.current.visible = true;
      const impactScale = shotFeedback.damageScale ?? 0.4;
      const scale = 0.35 + progress * (1.2 + impactScale);
      particlesRef.current.scale.set(scale, scale, scale);
      const offset = hitNormal.clone().multiplyScalar(0.06);
      particlesRef.current.position.copy(hitPosition.clone().add(offset));
      particlesRef.current.lookAt(camera.position);
    }
  });

  if (!shotFeedback?.hit || !shotFeedback?.hitPoint) return null;

  return (
    <group>
      <mesh ref={meshRef}>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial
          ref={materialRef}
          color="#ffd9b3"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <points ref={particlesRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleOffsets, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#ffe7c6" size={0.06} transparent opacity={0.7} depthWrite={false} />
      </points>
    </group>
  );
}
