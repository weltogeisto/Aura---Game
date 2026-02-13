import { useMemo } from 'react';
import * as THREE from 'three';

interface GalleryCeilingBaysProps {
  width: number;
  startY: number;
  z: number;
  material: THREE.Material;
}

export function GalleryCeilingBays({ width, startY, z, material }: GalleryCeilingBaysProps) {
  const bays = useMemo(() => {
    const bayCount = 6;
    const bayWidth = width / bayCount;

    return Array.from({ length: bayCount }, (_, index) => ({
      x: -width / 2 + bayWidth * (index + 0.5),
      width: bayWidth * 0.98,
      radius: 2.3 + (index % 2) * 0.3,
      rise: 0.9 + (index % 3) * 0.12,
    }));
  }, [width]);

  return (
    <group position={[0, startY, z]}>
      {bays.map((bay, index) => (
        <group key={`ceiling-bay-${index}`} position={[bay.x, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, bay.rise, bay.radius * 0.4]} material={material}>
            <cylinderGeometry args={[bay.radius, bay.radius, bay.width, 20, 1, true, Math.PI * 0.1, Math.PI * 0.8]} />
          </mesh>
          <mesh position={[0, 0.2, 0.65]} material={material}>
            <boxGeometry args={[bay.width * 0.98, 0.2, 0.22]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
