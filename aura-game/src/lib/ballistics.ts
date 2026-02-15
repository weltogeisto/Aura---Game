import * as THREE from 'three';

const RNG_INCREMENT = 0x6d2b79f5;
const RNG_SHIFT_A = 15;
const RNG_SHIFT_B = 7;
const RNG_SHIFT_C = 14;
const RNG_MULTIPLIER_A_MASK = 1;
const RNG_MULTIPLIER_B_MASK = 61;
const UINT32_DIVISOR = 4294967296;
const DEFAULT_IMPACT_NORMAL = new THREE.Vector3(0, 0, 1);

export interface BallisticsConfig {
  seed: number;
  swayRadians: number;
  muzzleVelocity: number;
  gravity: number;
  maxDistance: number;
  timeStep: number;
}

export interface ImpactMetadata {
  objectId: string | null;
  objectName: string | null;
  objectType: string | null;
}

export interface ImpactResult {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
  uv: THREE.Vector2 | null;
  metadata: ImpactMetadata;
  object: THREE.Object3D;
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
  const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
  direction.applyEuler(euler).normalize();

  return {
    origin: raycaster.ray.origin.clone(),
    velocity: direction.multiplyScalar(config.muzzleVelocity),
  };
}

export function resolveImpact(
  trajectory: ShotTrajectory,
  targets: THREE.Object3D[],
  config: BallisticsConfig
): ImpactResult | null {
  const raycaster = new THREE.Raycaster();
  const position = trajectory.origin.clone();
  const velocity = trajectory.velocity.clone();
  const gravityStep = new THREE.Vector3(0, -config.gravity * config.timeStep, 0);
  let traveled = 0;

  while (traveled < config.maxDistance) {
    const next = position.clone().addScaledVector(velocity, config.timeStep);
    const segment = next.clone().sub(position);
    const segmentLength = segment.length();

    if (segmentLength === 0) {
      break;
    }

    raycaster.set(position, segment.normalize());
    raycaster.far = segmentLength;

    const intersections = raycaster.intersectObjects(targets, true);
    if (intersections.length > 0) {
      const hit = intersections[0];
      const hitMesh = hit.object as THREE.Mesh;
      const normal = hit.face?.normal ? hit.face.normal.clone() : DEFAULT_IMPACT_NORMAL.clone();

      if (hit.face) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(hitMesh.matrixWorld);
        normal.applyMatrix3(normalMatrix).normalize();
      }

      return {
        point: hit.point.clone(),
        normal,
        distance: traveled + hit.distance,
        uv: hit.uv ? hit.uv.clone() : null,
        metadata: {
          objectId: String(hit.object.userData.targetId ?? hit.object.uuid),
          objectName: (hit.object.userData.targetName as string | undefined) ?? hit.object.name ?? null,
          objectType: (hit.object.userData.targetType as string | undefined) ?? hit.object.type ?? null,
        },
        object: hit.object,
      };
    }

    position.copy(next);
    velocity.add(gravityStep);
    traveled += segmentLength;
  }

  return null;
}
