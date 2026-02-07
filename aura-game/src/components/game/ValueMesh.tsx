import type { Scenario } from '@/types';

interface ValueMeshProps {
  scenario: Scenario;
}

export function ValueMesh({ scenario }: ValueMeshProps) {
  return (
    <group>
      {scenario.targets.map((target) => {
        const intensity = Math.min(target.value / scenario.totalMaxValue, 0.35);
        const size = target.radius * (1.8 + intensity * 6);
        const color =
          target.type === 'masterpiece'
            ? '#ffb86c'
            : target.type === 'sculpture'
              ? '#9fd3ff'
              : target.type === 'easter-egg-systemic'
                ? '#ff6b6b'
                : '#c9f18f';

        return (
          <mesh
            key={`value-${target.id}`}
            position={target.position}
            onUpdate={(self) => self.lookAt(0, 0, 0)}
          >
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.12 + intensity * 0.8}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}
