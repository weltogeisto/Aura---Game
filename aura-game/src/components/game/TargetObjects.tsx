import type { Target } from '@/types';

interface TargetObjectsProps {
  targets: Target[];
}

export function TargetObjects({ targets }: TargetObjectsProps) {
  return (
    <group>
      {targets.map((target) => {
        const color =
          target.type === 'sculpture'
            ? 0xcccccc
            : target.type === 'easter-egg-dadaist'
              ? 0x8b4513
              : target.type === 'easter-egg-systemic'
                ? 0xff0000
                : 0xffff00;

        const emissive = target.type === 'easter-egg-systemic' ? 0xff0000 : 0x000000;

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
            {target.type === 'sculpture' && <sphereGeometry args={[target.radius, 32, 32]} />}
            {target.type === 'easter-egg-dadaist' && (
              <cylinderGeometry args={[target.radius, target.radius, target.radius * 2, 16]} />
            )}
            {target.type === 'easter-egg-systemic' && (
              <boxGeometry args={[target.radius, target.radius, target.radius]} />
            )}
            {(target.type === 'masterpiece' || target.type === 'other') && (
              <planeGeometry args={[target.radius * 2, target.radius * 2.5]} />
            )}
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              metalness={
                target.type === 'easter-egg-systemic'
                  ? 0.8
                  : target.type === 'easter-egg-dadaist'
                    ? 0.3
                    : target.type === 'sculpture'
                      ? 0.1
                      : 0
              }
              roughness={
                target.type === 'easter-egg-systemic'
                  ? 0.2
                  : target.type === 'easter-egg-dadaist'
                    ? 0.7
                    : target.type === 'sculpture'
                      ? 0.8
                      : 0.5
              }
            />
          </mesh>
        );
      })}
    </group>
  );
}
