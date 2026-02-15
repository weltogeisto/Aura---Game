import * as THREE from 'three';

const RNG_INCREMENT = 0x6d2b79f5;
const RNG_SHIFT_A = 15;
const RNG_SHIFT_B = 7;
const RNG_SHIFT_C = 14;
const RNG_MULTIPLIER_A_MASK = 1;
const RNG_MULTIPLIER_B_MASK = 61;
const UINT32_DIVISOR = 4294967296;

export interface BallisticsConfig {
  seed: number;
  swayRadians: number;
  muzzleVelocity: number;
  gravity: number;
  maxDistance: number;
  timeStep: number;
  maxInteractions: number;
}

export interface ShotTrajectory {
  origin: THREE.Vector3;
  velocity: THREE.Vector3;
}

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += RNG_INCREMENT;
    let t = state;
    t = Math.imul(t ^ (t >>> RNG_SHIFT_A), t | RNG_MULTIPLIER_A_MASK);
    t ^= t + Math.imul(t ^ (t >>> RNG_SHIFT_B), t | RNG_MULTIPLIER_B_MASK);
    return ((t ^ (t >>> RNG_SHIFT_C)) >>> 0) / UINT32_DIVISOR;
  };
}

export function buildTrajectory(
  camera: THREE.Camera,
  crosshair: { x: number; y: number },
  config: BallisticsConfig
): ShotTrajectory {
  const mouse = new THREE.Vector2(crosshair.x * 2 - 1, -(crosshair.y * 2 - 1));
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const rng = seededRandom(config.seed);
  const yaw = (rng() - 0.5) * config.swayRadians;
  const pitch = (rng() - 0.5) * config.swayRadians;

  const direction = raycaster.ray.direction.clone();
  direction.applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')).normalize();

  return {
    origin: raycaster.ray.origin.clone(),
    velocity: direction.multiplyScalar(config.muzzleVelocity),
  };
}
