import * as THREE from 'three';
import type { ShotSimulationEvent, Target } from '../../types/index.ts';
import { resolveMaterialBehavior, shouldRicochet } from './materialBehavior.ts';
import { buildTrajectory, seededRandom, type BallisticsConfig } from './trajectory.ts';

export interface SimulationObject {
  object: THREE.Object3D;
  targetId: string | null;
  targetName: string | null;
  targetType: Target['type'] | null;
  material?: string;
}

export interface ShotSimulationResult {
  events: ShotSimulationEvent[];
  hit: boolean;
  hitObject: SimulationObject | null;
  hitPoint: THREE.Vector3 | null;
  hitNormal: THREE.Vector3 | null;
  hitDistance: number;
  hitUv: THREE.Vector2 | null;
  traceEnd: THREE.Vector3;
  energyLeft: number;
}

const EPSILON = 0.02;
const MAX_RAY_DISTANCE = 400;
const DEFAULT_NORMAL = new THREE.Vector3(0, 1, 0);

export function simulateShot(
  camera: THREE.Camera,
  crosshair: { x: number; y: number },
  objects: SimulationObject[],
  config: BallisticsConfig
): ShotSimulationResult {
  const trajectory = buildTrajectory(camera, crosshair, config);
  const rng = seededRandom(config.seed ^ 0xa5a5a5a5);
  const raycaster = new THREE.Raycaster();

  let origin = trajectory.origin.clone();
  let direction = trajectory.velocity.clone().normalize();
  let traveledDistance = 0;
  let remainingDistance = config.maxDistance;
  let energy = 1;

  const events: ShotSimulationEvent[] = [];

  for (let interaction = 0; interaction < config.maxInteractions && remainingDistance > 0.001; interaction += 1) {
    raycaster.set(origin, direction);
    raycaster.far = Math.min(MAX_RAY_DISTANCE, remainingDistance);

    const intersections = raycaster.intersectObjects(objects.map((entry) => entry.object), true);
    if (intersections.length === 0) {
      const missPoint = origin.clone().addScaledVector(direction, remainingDistance);
      events.push(createEvent('miss', null, 'air', traveledDistance + remainingDistance, missPoint, DEFAULT_NORMAL, 90, energy, energy));
      return {
        events,
        hit: false,
        hitObject: null,
        hitPoint: null,
        hitNormal: null,
        hitDistance: traveledDistance + remainingDistance,
        hitUv: null,
        traceEnd: missPoint,
        energyLeft: energy,
      };
    }

    const hit = intersections[0];
    const objectRecord = objects.find((entry) => entry.object === hit.object || entry.object.uuid === hit.object.uuid) ?? null;
    const normal = resolveWorldNormal(hit);
    const hitPoint = hit.point.clone();
    const travelToHit = hit.distance;
    traveledDistance += travelToHit;
    remainingDistance -= travelToHit;

    if (objectRecord?.targetId) {
      events.push(createEvent('impact', objectRecord.targetId, objectRecord.material ?? 'target', traveledDistance, hitPoint, normal, impactAngleDeg(direction, normal), energy, energy));
      return {
        events,
        hit: true,
        hitObject: objectRecord,
        hitPoint,
        hitNormal: normal,
        hitDistance: traveledDistance,
        hitUv: hit.uv ? hit.uv.clone() : null,
        traceEnd: hitPoint.clone().addScaledVector(normal, 0.06),
        energyLeft: energy,
      };
    }

    const behavior = resolveMaterialBehavior(objectRecord?.material, objectRecord?.targetType ?? undefined);
    const angleDeg = impactAngleDeg(direction, normal);
    const canRicochet = shouldRicochet(angleDeg, behavior);

    events.push(createEvent('material-interaction', objectRecord?.targetId ?? null, behavior.key, traveledDistance, hitPoint, normal, angleDeg, energy, energy));

    if (canRicochet) {
      const reflected = direction.clone().reflect(normal).normalize();
      const deflectionDeg = THREE.MathUtils.lerp(behavior.deflectionDeg.min, behavior.deflectionDeg.max, rng());
      const axis = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize();
      reflected.applyAxisAngle(axis, THREE.MathUtils.degToRad(deflectionDeg));
      const nextEnergy = energy * (1 - behavior.ricochetEnergyLoss);

      events.push(createEvent('ricochet', objectRecord?.targetId ?? null, behavior.key, traveledDistance, hitPoint, normal, angleDeg, energy, nextEnergy));
      events.push(createEvent('deflection', objectRecord?.targetId ?? null, behavior.key, traveledDistance, hitPoint, normal, deflectionDeg, nextEnergy, nextEnergy));

      direction.copy(reflected);
      origin = hitPoint.clone().addScaledVector(direction, EPSILON);
      energy = nextEnergy;
      continue;
    }

    const canPenetrate = energy >= behavior.penetrationResistance;
    if (canPenetrate) {
      const nextEnergy = energy * (1 - behavior.penetrationEnergyLoss);
      events.push(createEvent('penetration', objectRecord?.targetId ?? null, behavior.key, traveledDistance, hitPoint, normal, angleDeg, energy, nextEnergy));

      energy = nextEnergy;
      origin = hitPoint.clone().addScaledVector(direction, EPSILON);
      continue;
    }

    return {
      events,
      hit: false,
      hitObject: objectRecord,
      hitPoint,
      hitNormal: normal,
      hitDistance: traveledDistance,
      hitUv: hit.uv ? hit.uv.clone() : null,
      traceEnd: hitPoint,
      energyLeft: energy,
    };
  }

  const exhaustedEnd = origin.clone();
  return {
    events,
    hit: false,
    hitObject: null,
    hitPoint: null,
    hitNormal: null,
    hitDistance: traveledDistance,
    hitUv: null,
    traceEnd: exhaustedEnd,
    energyLeft: energy,
  };
}

function createEvent(
  kind: ShotSimulationEvent['kind'],
  objectId: string | null,
  material: string,
  distance: number,
  point: THREE.Vector3,
  normal: THREE.Vector3,
  angleDeg: number,
  incomingEnergy: number,
  outgoingEnergy: number
): ShotSimulationEvent {
  return {
    kind,
    objectId,
    material,
    distance,
    point: [point.x, point.y, point.z],
    normal: [normal.x, normal.y, normal.z],
    angleDeg,
    incomingEnergy,
    outgoingEnergy,
  };
}

function resolveWorldNormal(intersection: THREE.Intersection): THREE.Vector3 {
  const mesh = intersection.object as THREE.Mesh;
  if (!intersection.face) {
    return DEFAULT_NORMAL.clone();
  }

  const normal = intersection.face.normal.clone();
  const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  return normal.applyMatrix3(normalMatrix).normalize();
}

function impactAngleDeg(direction: THREE.Vector3, normal: THREE.Vector3): number {
  const incoming = direction.clone().multiplyScalar(-1).normalize();
  const dot = THREE.MathUtils.clamp(incoming.dot(normal), -1, 1);
  return THREE.MathUtils.radToDeg(Math.acos(dot));
}
