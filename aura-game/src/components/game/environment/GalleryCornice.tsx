import { useMemo } from 'react';
import * as THREE from 'three';

interface GalleryCorniceProps {
  width: number;
  y: number;
  z: number;
  material: THREE.Material;
}

export function GalleryCornice({ width, y, z, material }: GalleryCorniceProps) {
  const segments = useMemo(() => {
    const bayCount = 9;
    const bayWidth = width / bayCount;

    return Array.from({ length: bayCount }, (_, index) => ({
      x: -width / 2 + bayWidth * (index + 0.5),
      width: bayWidth * (0.94 + (index % 2) * 0.04),
      depth: 0.28 + (index % 3) * 0.04,
    }));
  }, [width]);

  return (
    <group position={[0, y, z]}>
      <mesh material={material} position={[0, 0.22, 0.18]}>
        <boxGeometry args={[width, 0.28, 0.24]} />
      </mesh>
      {segments.map((segment, index) => (
        <mesh
          key={`cornice-segment-${index}`}
          material={material}
          position={[segment.x, 0, segment.depth * 0.5]}
        >
          <boxGeometry args={[segment.width, 0.24, segment.depth]} />
        </mesh>
      ))}
      <mesh material={material} position={[0, -0.18, 0.09]}>
        <boxGeometry args={[width, 0.16, 0.16]} />
      </mesh>
    </group>
  );
}
