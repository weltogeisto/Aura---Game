import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';

export function ShotTracer() {
  const { camera } = useThree();
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const materialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const attributeRef = useRef<THREE.BufferAttribute | null>(null);
  const basePositionsRef = useRef<Float32Array>(new Float32Array(6));

  useFrame(() => {
    if (!shotFeedback?.active || !shotFeedback?.traceEnd || !geometryRef.current) {
      if (materialRef.current) {
        materialRef.current.opacity = 0;
      }
      return;
    }

    const elapsed = Date.now() - shotFeedback.firedAt;
    const travelTimeMs = shotFeedback.travelTimeMs ?? 260;
    const progress = Math.min(elapsed / travelTimeMs, 1);
    const start = camera.position.clone();
    const end = new THREE.Vector3(
      shotFeedback.traceEnd[0],
      shotFeedback.traceEnd[1],
      shotFeedback.traceEnd[2]
    );
    const currentEnd = start.clone().lerp(end, progress);
    const basePositions = basePositionsRef.current;

    basePositions[0] = start.x;
    basePositions[1] = start.y;
    basePositions[2] = start.z;
    basePositions[3] = currentEnd.x;
    basePositions[4] = currentEnd.y;
    basePositions[5] = currentEnd.z;

    if (!attributeRef.current) {
      attributeRef.current = new THREE.BufferAttribute(basePositions, 3);
      geometryRef.current.setAttribute('position', attributeRef.current);
    } else {
      attributeRef.current.needsUpdate = true;
    }
    geometryRef.current.computeBoundingSphere();

    if (materialRef.current) {
      materialRef.current.opacity = (1 - progress) * 0.85;
    }
  });

  if (!shotFeedback?.traceEnd) {
    return null;
  }

  return (
    <line>
      <bufferGeometry ref={geometryRef} />
      <lineBasicMaterial
        ref={materialRef}
        color="#fce2be"
        transparent
        opacity={0}
        linewidth={1}
      />
    </line>
  );
}
