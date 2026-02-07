import { Canvas } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import { Panorama } from './Panorama';
import { RoomShell } from './RoomShell';
import { TargetObjects } from './TargetObjects';
import { Crosshair } from './Crosshair';
import { BallisticsSystem } from './BallisticsSystem';
import { CameraShake } from './CameraShake';
import { ShotImpact } from './ShotImpact';
import { ShotTracer } from './ShotTracer';
import { ValueMesh } from './ValueMesh';

export function Scene() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);

  if ((gamePhase !== 'aiming' && gamePhase !== 'shooting') || !selectedScenario) {
    return null;
  }

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <fog attach="fog" args={['#1b1416', 12, 180]} />
        <Panorama color={selectedScenario.panoramaColor} />
        <RoomShell />
        <ValueMesh scenario={selectedScenario} />
        <TargetObjects targets={selectedScenario.targets} />
        <BallisticsSystem />
        <CameraShake />
        <ShotImpact />
        <ShotTracer />
      </Canvas>
      <Crosshair />
    </>
  );
}
