import * as THREE from 'three';
import { buildTrajectory, seededRandom, type BallisticsConfig, type ShotTrajectory } from './ballistics/trajectory.ts';

const DEFAULT_IMPACT_NORMAL = new THREE.Vector3(0, 0, 1);

export type { BallisticsConfig, ShotTrajectory };

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

export { seededRandom, buildTrajectory };

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

    if (segmentLength === 0) break;

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
