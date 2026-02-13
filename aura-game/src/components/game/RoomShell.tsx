import { useMemo } from 'react';
import type * as THREE from 'three';
import type { RenderTier } from '@/lib/renderSettings';
import { GalleryCeilingBays } from './environment/GalleryCeilingBays';
import { GalleryCornice } from './environment/GalleryCornice';
import { GalleryWallPanels } from './environment/GalleryWallPanels';
import {
  buildGalleryMaterial,
  createPlasterPbrTextures,
  createWoodPbrTextures,
  type PbrTextureSet,
} from './environment/materials';

const FLOOR_Y = -0.85;
const ROOM_DEPTH = 42;
const ROOM_WIDTH = 38;
const WALL_HEIGHT = 14;
const WALL_Z = -13;
const PLINTH_HEIGHT = 1.25;

interface RoomShellProps {
  textureSize: number;
  renderTier: RenderTier;
}

const useGalleryTextures = (textureSize: number) =>
  useMemo(
    () => ({
      floor: createWoodPbrTextures(textureSize, [6, 7]),
      wall: createPlasterPbrTextures(textureSize, [3.2, 1.8]),
      trim: createPlasterPbrTextures(textureSize, [8, 2.4]),
      ceiling: createPlasterPbrTextures(textureSize, [4.8, 2.6]),
    }),
    [textureSize]
  );

const useGalleryMaterial = (
  tier: RenderTier,
  color: string,
  textures: PbrTextureSet,
  roughness: number,
  metalness: number,
  normalScale?: number
) =>
  useMemo(
    () => buildGalleryMaterial(tier, color, textures, roughness, metalness, normalScale),
    [color, metalness, normalScale, roughness, textures, tier]
  );

export function RoomShell({ textureSize, renderTier }: RoomShellProps) {
  const textures = useGalleryTextures(textureSize);

  const floorMaterial = useGalleryMaterial(renderTier, '#a57552', textures.floor, 0.58, 0.05, 0.64);
  const wallMaterial = useGalleryMaterial(renderTier, '#ecd3b5', textures.wall, 0.9, 0.02, 0.3);
  const trimMaterial = useGalleryMaterial(renderTier, '#ceb293', textures.trim, 0.77, 0.03, 0.45);
  const ceilingMaterial = useGalleryMaterial(renderTier, '#f0dcc2', textures.ceiling, 0.84, 0.01, 0.36);

  return (
    <group>
      <group name="floor">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, -ROOM_DEPTH / 2]} material={floorMaterial}>
          <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        </mesh>
      </group>

      <group name="lower-wall-plinth" position={[0, FLOOR_Y + PLINTH_HEIGHT * 0.5, WALL_Z + 0.09]}>
        <mesh material={trimMaterial}>
          <boxGeometry args={[ROOM_WIDTH, PLINTH_HEIGHT, 0.24]} />
        </mesh>
        <mesh position={[0, PLINTH_HEIGHT * 0.45, 0.09]} material={trimMaterial}>
          <boxGeometry args={[ROOM_WIDTH * 0.985, 0.14, 0.18]} />
        </mesh>
      </group>

      <group name="wall-panels">
        <mesh position={[0, FLOOR_Y + WALL_HEIGHT / 2, WALL_Z]} material={wallMaterial}>
          <planeGeometry args={[ROOM_WIDTH, WALL_HEIGHT]} />
        </mesh>
        <GalleryWallPanels
          width={ROOM_WIDTH}
          baseY={FLOOR_Y + PLINTH_HEIGHT}
          z={WALL_Z}
          wallMaterial={wallMaterial as THREE.Material}
          frameMaterial={trimMaterial as THREE.Material}
        />
      </group>

      <group name="cornice">
        <GalleryCornice
          width={ROOM_WIDTH}
          y={FLOOR_Y + WALL_HEIGHT - 1.2}
          z={WALL_Z + 0.06}
          material={trimMaterial as THREE.Material}
        />
      </group>

      <group name="ceiling-bays">
        <GalleryCeilingBays
          width={ROOM_WIDTH}
          startY={FLOOR_Y + WALL_HEIGHT - 1.5}
          z={WALL_Z + 0.12}
          material={ceilingMaterial as THREE.Material}
        />
      </group>
    </group>
  );
}
