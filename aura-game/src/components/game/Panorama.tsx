import { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export function Panorama() {
  const texture = useLoader(THREE.TextureLoader, '/panorama.svg');

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh>
      <sphereGeometry args={[100, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}
