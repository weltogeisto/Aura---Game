import { Canvas } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { Panorama } from './Panorama';
import { TargetObjects } from './TargetObjects';
import { Crosshair } from './Crosshair';
import { BallisticsSystem } from './BallisticsSystem';

export function Scene() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);

  if (gamePhase !== 'aiming' || !selectedScenario) {
    return null;
  }

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <fog attach="fog" args={['#0b0b0f', 8, 120]} />
        <Panorama color={selectedScenario.panoramaColor} />
        <TargetObjects targets={selectedScenario.targets} onTargetClick={() => {}} />
        <BallisticsSystem />
      </Canvas>
      <Crosshair />
    </>
  );
}
