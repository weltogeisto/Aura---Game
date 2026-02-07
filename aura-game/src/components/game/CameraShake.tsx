import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';

export function CameraShake() {
  const { camera } = useThree();
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const baseRotation = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    baseRotation.current = {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z,
    };
  }, [camera]);

  useFrame(() => {
    if (!shotFeedback?.active) {
      camera.rotation.set(
        baseRotation.current.x,
        baseRotation.current.y,
        baseRotation.current.z
      );
      return;
    }

    const elapsed = (Date.now() - shotFeedback.firedAt) / 1000;
    if (elapsed > 0.35) {
      camera.rotation.set(
        baseRotation.current.x,
        baseRotation.current.y,
        baseRotation.current.z
      );
      return;
    }

    const intensity = (1 - elapsed / 0.35) * 0.02;
    camera.rotation.set(
      baseRotation.current.x + (Math.random() - 0.5) * intensity,
      baseRotation.current.y + (Math.random() - 0.5) * intensity,
      baseRotation.current.z
    );
  });

  return null;
}
