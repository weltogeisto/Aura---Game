import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';

export function ShotImpact() {
  const { camera } = useThree();
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  const hitPosition = useMemo(() => {
    if (!shotFeedback?.hitPoint) return new THREE.Vector3();
    return new THREE.Vector3(
      shotFeedback.hitPoint[0],
      shotFeedback.hitPoint[1],
      shotFeedback.hitPoint[2]
    );
  }, [shotFeedback?.hitPoint]);

  const hitNormal = useMemo(() => {
    if (!shotFeedback?.hitNormal) return new THREE.Vector3(0, 0, 1);
    return new THREE.Vector3(
      shotFeedback.hitNormal[0],
      shotFeedback.hitNormal[1],
      shotFeedback.hitNormal[2]
    );
  }, [shotFeedback?.hitNormal]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(hitPosition);
  }, [hitPosition]);

  useFrame(() => {
    if (!shotFeedback?.active || !shotFeedback.hit) {
      if (materialRef.current) {
        materialRef.current.opacity = 0;
      }
      return;
    }

    const elapsed = (Date.now() - shotFeedback.firedAt) / 1000;
    const duration = 0.45;
    const progress = Math.min(elapsed / duration, 1);

    if (materialRef.current && meshRef.current) {
      materialRef.current.opacity = (1 - progress) * 0.85;
      const scale = 0.35 + progress * 0.9;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.position.copy(hitPosition);
      meshRef.current.lookAt(camera.position);
      meshRef.current.rotateOnAxis(hitNormal, Math.sin(progress * Math.PI) * 0.15);
    }
  });

  if (!shotFeedback?.hit || !shotFeedback?.hitPoint) {
    return null;
  }

  return (
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
  );
}
