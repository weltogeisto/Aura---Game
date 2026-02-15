import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildTrajectory, resolveImpact } from '../src/lib/ballistics.ts';
import { sampleValueMesh, scoreImpact } from '../src/lib/valueMesh.ts';

const config = {
  seed: 42,
  swayRadians: 0.01,
  muzzleVelocity: 50,
  gravity: 9.81,
  maxDistance: 50,
  timeStep: 1 / 240,
};

test('same seed + same input yields deterministic score', () => {
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  mesh.userData.targetId = 'target-a';
  mesh.userData.targetName = 'Target A';
  mesh.userData.targetType = 'masterpiece';
  mesh.updateMatrixWorld();

  const trajectoryA = buildTrajectory(camera, { x: 0.5, y: 0.5 }, config);
  const impactA = resolveImpact(trajectoryA, [mesh], config);
  assert.ok(impactA, 'first impact should be resolved');

  const sampleA = sampleValueMesh(
    [
      [10, 20],
      [30, 40],
    ],
    impactA!.uv ? { u: impactA!.uv.x, v: impactA!.uv.y } : null,
    5
  );
  const scoreA = scoreImpact({
    sampledValue: sampleA.value,
    zoneMultiplier: 1.2,
    criticalModifier: 1.5,
  });

  const trajectoryB = buildTrajectory(camera, { x: 0.5, y: 0.5 }, config);
  const impactB = resolveImpact(trajectoryB, [mesh], config);
  assert.ok(impactB, 'second impact should be resolved');

  const sampleB = sampleValueMesh(
    [
      [10, 20],
      [30, 40],
    ],
    impactB!.uv ? { u: impactB!.uv.x, v: impactB!.uv.y } : null,
    5
  );
  const scoreB = scoreImpact({
    sampledValue: sampleB.value,
    zoneMultiplier: 1.2,
    criticalModifier: 1.5,
  });

  assert.equal(scoreA, scoreB);
  assert.deepEqual(sampleA, sampleB);
});

test('UV boundary and fallback behavior', () => {
  const grid = [
    [1, 2],
    [3, 4],
  ];

  const lower = sampleValueMesh(grid, { u: 0, v: 0 }, 99);
  assert.equal(lower.value, 3, 'v=0 maps to bottom row due to v-flip');

  const upper = sampleValueMesh(grid, { u: 1, v: 1 }, 99);
  assert.equal(upper.value, 2, 'u=1 and v=1 clamp to top-right');

  const outOfRange = sampleValueMesh(grid, { u: -0.5, v: 1.3 }, 99);
  assert.equal(outOfRange.value, 1, 'out-of-range UV must clamp to valid cell');

  const noUv = sampleValueMesh(grid, null, 77);
  assert.equal(noUv.value, 77);
  assert.equal(noUv.usedFallback, true);
});
