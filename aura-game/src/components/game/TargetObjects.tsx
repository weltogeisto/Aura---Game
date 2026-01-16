import * as THREE from 'three';
import type { Target } from '@/types';

interface TargetObjectsProps {
  targets: Target[];
}

// Helper to determine geometry type based on target type
type GeometryType = 'sphere' | 'cylinder' | 'box' | 'plane';

function getGeometryType(targetType: Target['type']): GeometryType {
  switch (targetType) {
    case 'sculpture':
      return 'sphere';
    case 'easter-egg-dadaist':
      return 'cylinder';
    case 'easter-egg-systemic':
      return 'box';
    default:
      return 'plane';
  }
}

// Helper to get material properties based on target type
function getMaterialProps(targetType: Target['type']) {
  // Base properties for each type
  const baseProps = {
    sculpture: { color: 0xcccccc, emissive: 0x000000, metalness: 0.1, roughness: 0.8 },
    'easter-egg-dadaist': { color: 0x8b4513, emissive: 0x000000, metalness: 0.3, roughness: 0.7 },
    'easter-egg-systemic': { color: 0xff0000, emissive: 0xff0000, metalness: 0.8, roughness: 0.2 },
    masterpiece: { color: 0xffff00, emissive: 0x000000, metalness: 0, roughness: 0.5 },
    other: { color: 0xffff00, emissive: 0x000000, metalness: 0, roughness: 0.5 },
  };

  return baseProps[targetType] || baseProps.other;
}

export function TargetObjects({ targets }: TargetObjectsProps) {
  return (
    <group>
      {/* Scene Lighting */}
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <ambientLight intensity={0.5} />

      {/* Render each target as a 3D mesh */}
      {targets.map((target) => {
        const geometryType = getGeometryType(target.type);
        const materialProps = getMaterialProps(target.type);

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
            {/* Render appropriate geometry based on target type */}
            {geometryType === 'sphere' && (
              <sphereGeometry args={[target.radius, 32, 32]} />
            )}
            {geometryType === 'cylinder' && (
              <cylinderGeometry args={[target.radius, target.radius, target.radius * 2, 16]} />
            )}
            {geometryType === 'box' && (
              <boxGeometry args={[target.radius, target.radius, target.radius]} />
            )}
            {geometryType === 'plane' && (
              <planeGeometry args={[target.radius * 2, target.radius * 2.5]} />
            )}
            <meshStandardMaterial
              {...materialProps}
              // Make planes double-sided for reliable raycast hit detection
              side={geometryType === 'plane' ? THREE.DoubleSide : THREE.FrontSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
