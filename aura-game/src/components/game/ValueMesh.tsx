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
        const intensity = Math.min(target.value / scenario.totalMaxValue, 0.5);
        const size = target.radius * (2.4 + intensity * 8);
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
            <mesh>
              <planeGeometry args={[outerSize, outerSize]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.12 + intensity * 0.6}
                depthWrite={false}
                depthTest={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh>
              <planeGeometry args={[size, size]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.24 + intensity * 0.9}
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
