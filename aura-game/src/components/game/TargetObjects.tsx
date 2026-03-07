import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/gameStore';
import type { Target } from '@/types';

interface TargetObjectsProps {
  targets: Target[];
}

interface TargetHitData {
  targetId: string;
  targetName: string;
  targetType: Target['type'];
  value: number;
  hitTag?: 'dadaist';
}

const SHOW_DEBUG_PRIMITIVES = import.meta.env.DEV && import.meta.env.VITE_SHOW_TARGET_DEBUG === 'true';

const createTargetHitData = (target: Target): TargetHitData => ({
  targetId: target.id,
  targetName: target.name,
  targetType: target.type,
  value: target.value,
  hitTag: target.type === 'easter-egg-dadaist' ? 'dadaist' : undefined,
});

const roughnessOffsetFromId = (targetId: string): number => {
  const seed = targetId
    .split('')
    .reduce((acc, character, index) => acc + character.charCodeAt(0) * (index + 1), 0);
  return ((seed % 7) - 3) * 0.015;
};

const getSculptureMaterialPreset = (material?: string) => {
  const materialKey = (material ?? '').toLowerCase();
  if (materialKey.includes('gild') || materialKey.includes('gold')) {
    return { color: '#c9a84f', emissive: '#2b1f08', metalness: 0.92, roughness: 0.2 };
  }
  if (materialKey.includes('bronze')) {
    return { color: '#7b5a3e', emissive: '#19120b', metalness: 0.82, roughness: 0.34 };
  }
  return { color: '#d8d8d6', emissive: '#101010', metalness: 0.15, roughness: 0.58 };
};

/** Wraps a target group with hit-reaction animation (scale pulse + Z recoil) */
function HitAnimatedGroup({
  targetId,
  children,
  position,
  isPainting = false,
}: {
  targetId: string;
  children: React.ReactNode;
  position: [number, number, number];
  isPainting?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const animStartRef = useRef<number | null>(null);
  const reducedMotion = useGameStore((state) => state.accessibility.reducedMotion);
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const isHit = lastShotResult?.hitTargetId === targetId;

  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion || !isHit) {
      if (groupRef.current && !isHit) {
        // Reset transform if no longer hit
        groupRef.current.scale.setScalar(1);
        groupRef.current.position.set(...position);
      }
      return;
    }

    if (animStartRef.current === null) {
      animStartRef.current = 0;
    }

    animStartRef.current += delta;
    const t = animStartRef.current;
    const duration = 0.7;

    if (t >= duration) {
      groupRef.current.scale.setScalar(1);
      groupRef.current.position.set(...position);
      return;
    }

    const progress = t / duration;

    // Scale pulse: 1.0 → 1.06 → 0.97 → 1.0
    let scale: number;
    if (progress < 0.2) {
      scale = 1 + (progress / 0.2) * 0.06;
    } else if (progress < 0.45) {
      scale = 1.06 - ((progress - 0.2) / 0.25) * 0.09;
    } else {
      const easeBack = (progress - 0.45) / 0.55;
      scale = 0.97 + easeBack * 0.03;
    }
    groupRef.current.scale.setScalar(scale);

    // Paintings recoil backward (Z), then spring back
    if (isPainting) {
      const recoilZ = progress < 0.25
        ? position[2] - (progress / 0.25) * 0.12
        : position[2] - (1 - (progress - 0.25) / 0.75) * 0.12;
      groupRef.current.position.set(position[0], position[1], recoilZ);
    }
  });

  // Reset animation timer when hit status changes
  useFrame(() => {
    if (!isHit) {
      animStartRef.current = null;
    } else if (animStartRef.current === null) {
      animStartRef.current = 0;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}

function PaintingTarget({ target }: { target: Target }) {
  const hitData = createTargetHitData(target);
  const frameWidth = target.radius * 2.3;
  const frameHeight = target.radius * 2.9;
  const frameDepth = target.radius * 0.14;
  const canvasInset = target.radius * 0.18;
  const canvasWidth = frameWidth - canvasInset * 2;
  const canvasHeight = frameHeight - canvasInset * 2;
  const variation = roughnessOffsetFromId(target.id);
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const isHit = lastShotResult?.hitTargetId === target.id;

  return (
    <HitAnimatedGroup targetId={target.id} position={target.position} isPainting>
      <mesh userData={hitData} castShadow receiveShadow>
        <boxGeometry args={[frameWidth, frameHeight, frameDepth]} />
        <meshStandardMaterial
          color="#4d3523"
          metalness={0.35}
          roughness={0.5 + variation}
          emissive={isHit ? '#4a2000' : '#000000'}
          emissiveIntensity={isHit ? 0.8 : 0}
        />
      </mesh>

      <mesh position={[0, 0, frameDepth * 0.52]} userData={hitData}>
        <planeGeometry args={[canvasWidth, canvasHeight]} />
        <meshStandardMaterial
          color="#d8c9a7"
          roughness={0.72 + variation}
          metalness={0.04}
          emissive={isHit ? '#3d2900' : '#000000'}
          emissiveIntensity={isHit ? 0.6 : 0}
        />
      </mesh>

      <mesh
        position={[0, -(frameHeight * 0.5 + target.radius * 0.17), frameDepth * 0.3]}
        userData={hitData}
      >
        <boxGeometry args={[frameWidth * 0.52, target.radius * 0.2, target.radius * 0.04]} />
        <meshStandardMaterial color="#f2ede3" roughness={0.88} metalness={0.05} />
      </mesh>

      {SHOW_DEBUG_PRIMITIVES && (
        <mesh userData={hitData}>
          <planeGeometry args={[target.radius * 2, target.radius * 2.5]} />
          <meshBasicMaterial color="#ff00ff" wireframe transparent opacity={0.3} />
        </mesh>
      )}
    </HitAnimatedGroup>
  );
}

function SculptureTarget({ target }: { target: Target }) {
  const hitData = createTargetHitData(target);
  const sculptureMaterial = getSculptureMaterialPreset(target.material);
  const pedestalRadius = target.radius * 0.75;
  const pedestalHeight = target.radius * 1.05;
  const sculptureHeight = target.radius * 1.2;
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const isHit = lastShotResult?.hitTargetId === target.id;

  return (
    <HitAnimatedGroup targetId={target.id} position={target.position}>
      <mesh position={[0, -pedestalHeight * 0.5, 0]} userData={hitData} receiveShadow>
        <cylinderGeometry args={[pedestalRadius, pedestalRadius * 1.1, pedestalHeight, 24]} />
        <meshStandardMaterial color="#f0efe9" metalness={0.05} roughness={0.72} />
      </mesh>

      <mesh
        position={[0, pedestalHeight * 0.5 + sculptureHeight * 0.35, 0]}
        userData={hitData}
        castShadow
      >
        <icosahedronGeometry args={[target.radius, 3]} />
        <meshStandardMaterial
          {...sculptureMaterial}
          emissive={isHit ? '#ffffff' : sculptureMaterial.emissive}
          emissiveIntensity={isHit ? 1.0 : 0}
        />
      </mesh>

      {SHOW_DEBUG_PRIMITIVES && (
        <mesh position={[0, pedestalHeight * 0.55 + sculptureHeight * 0.3, 0]} userData={hitData}>
          <sphereGeometry args={[target.radius, 20, 20]} />
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.35} />
        </mesh>
      )}
    </HitAnimatedGroup>
  );
}

function InteractiveObjectTarget({ target }: { target: Target }) {
  const hitData = createTargetHitData(target);
  const isSystemic = target.type === 'easter-egg-systemic';
  const isDadaist = target.type === 'easter-egg-dadaist';
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const isHit = lastShotResult?.hitTargetId === target.id;

  return (
    <HitAnimatedGroup targetId={target.id} position={target.position}>
      <mesh userData={hitData} castShadow>
        <boxGeometry args={[target.radius * 1.8, target.radius * 1.2, target.radius * 1.1]} />
        <meshStandardMaterial
          color={isSystemic ? '#8b0000' : '#6a503f'}
          emissive={isHit ? '#ff4000' : (isSystemic ? '#360000' : '#1b130f')}
          emissiveIntensity={isHit ? 1.2 : 0}
          metalness={isSystemic ? 0.82 : 0.18}
          roughness={isSystemic ? 0.24 : 0.64}
          transparent={isDadaist}
          opacity={isDadaist ? 0.12 : 1}
        />
      </mesh>

      <mesh position={[0, target.radius * 0.12, target.radius * 0.57]} userData={hitData}>
        <planeGeometry args={[target.radius * 1.2, target.radius * 0.56]} />
        <meshStandardMaterial
          color={isSystemic ? '#ff3a3a' : '#c9b18f'}
          emissive={isSystemic ? '#4d0606' : '#000000'}
          metalness={isSystemic ? 0.65 : 0.1}
          roughness={isSystemic ? 0.2 : 0.5}
          transparent={isDadaist}
          opacity={isDadaist ? 0.12 : 1}
        />
      </mesh>

      {SHOW_DEBUG_PRIMITIVES && (
        <mesh userData={hitData}>
          {target.type === 'easter-egg-dadaist' ? (
            <cylinderGeometry args={[target.radius, target.radius, target.radius * 2, 16]} />
          ) : target.type === 'easter-egg-systemic' ? (
            <boxGeometry args={[target.radius, target.radius, target.radius]} />
          ) : (
            <sphereGeometry args={[target.radius, 20, 20]} />
          )}
          <meshBasicMaterial color="#ffff00" wireframe transparent opacity={0.35} />
        </mesh>
      )}
    </HitAnimatedGroup>
  );
}

export function TargetObjects({ targets }: TargetObjectsProps) {
  return (
    <group>
      <hemisphereLight color={0xffe7c2} groundColor={0xffd1a1} intensity={0.65} />
      <directionalLight position={[6, 12, 6]} intensity={0.45} color={0xfff1d6} />
      <directionalLight position={[-4, 9, -6]} intensity={0.3} color={0xffe6c7} />
      <ambientLight intensity={0.6} />

      {targets.map((target) => {
        if (target.type === 'masterpiece') {
          return <PaintingTarget key={target.id} target={target} />;
        }
        if (target.type === 'sculpture') {
          return <SculptureTarget key={target.id} target={target} />;
        }
        return <InteractiveObjectTarget key={target.id} target={target} />;
      })}
    </group>
  );
}
