import type { Target } from '@/types';

interface TargetObjectsProps {
  targets: Target[];
  onTargetClick: (targetId: string) => void;
}

export function TargetObjects({ targets, onTargetClick }: TargetObjectsProps) {
  return (
    <group>
      {/* Lighting */}
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <ambientLight intensity={0.5} />

      {/* Render each target */}
      {targets.map((target) => {
        const color =
          target.type === 'sculpture'
            ? 0xcccccc
            : target.type === 'easter-egg-dadaist'
              ? 0x8b4513
              : target.type === 'easter-egg-systemic'
                ? 0xff0000
                : 0xffff00;

        const emissive =
          target.type === 'easter-egg-systemic' ? 0xff0000 : 0x000000;

        let GeometryComponent;
        let geometryProps: any = {};

        if (target.type === 'sculpture') {
          GeometryComponent = 'sphereGeometry';
          geometryProps = { args: [target.radius, 32, 32] };
        } else if (target.type === 'easter-egg-dadaist') {
          GeometryComponent = 'cylinderGeometry';
          geometryProps = { args: [target.radius, target.radius, target.radius * 2, 16] };
        } else if (target.type === 'easter-egg-systemic') {
          GeometryComponent = 'boxGeometry';
          geometryProps = { args: [target.radius, target.radius, target.radius] };
        } else {
          GeometryComponent = 'planeGeometry';
          geometryProps = { args: [target.radius * 2, target.radius * 2.5] };
        }

        return (
          <mesh
            key={target.id}
            position={target.position}
            userData={{
              targetId: target.id,
              targetName: target.name,
              value: target.value,
            }}
          >
            {GeometryComponent === 'sphereGeometry' && (
              <sphereGeometry args={[target.radius, 32, 32]} />
            )}
            {GeometryComponent === 'cylinderGeometry' && (
              <cylinderGeometry args={[target.radius, target.radius, target.radius * 2, 16]} />
            )}
            {GeometryComponent === 'boxGeometry' && (
              <boxGeometry args={[target.radius, target.radius, target.radius]} />
            )}
            {GeometryComponent === 'planeGeometry' && (
              <planeGeometry args={[target.radius * 2, target.radius * 2.5]} />
            )}
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              metalness={target.type === 'easter-egg-systemic' ? 0.8 : target.type === 'easter-egg-dadaist' ? 0.3 : target.type === 'sculpture' ? 0.1 : 0}
              roughness={target.type === 'easter-egg-systemic' ? 0.2 : target.type === 'easter-egg-dadaist' ? 0.7 : target.type === 'sculpture' ? 0.8 : 0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}
