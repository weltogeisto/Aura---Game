import { createRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import type { Scenario } from '@/types';

interface ValueMeshProps {
  scenario: Scenario;
}

export function ValueMesh({ scenario }: ValueMeshProps) {
  const { camera } = useThree();
  const meshRefs = useMemo(
    () => scenario.targets.map(() => createRef<THREE.Group>()),
    [scenario.targets]
  );

  useFrame(() => {
    meshRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.lookAt(camera.position);
      }
    });
  });

  return (
    <group>
      {scenario.targets.map((target, index) => {
        const intensity = Math.min(target.value / scenario.totalMaxValue, 0.65);
        const size = target.radius * (3 + intensity * 10);
        const color =
          target.type === 'masterpiece'
            ? '#ffb86c'
            : target.type === 'sculpture'
              ? '#9fd3ff'
              : target.type === 'easter-egg-systemic'
                ? '#ff6b6b'
                : '#c9f18f';

        const outerSize = size * 1.25;
        return (
          <group key={`value-${target.id}`} position={target.position} ref={meshRefs[index]}>
            <mesh renderOrder={2}>
              <planeGeometry args={[outerSize, outerSize]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.18 + intensity * 0.7}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh renderOrder={3}>
              <planeGeometry args={[size, size]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.32 + intensity * 1.1}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
