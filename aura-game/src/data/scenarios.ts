import type { Scenario, ScenarioStatus } from '../types/index.ts';
import { SCENARIO_SEEDS } from './scenarios/registry.ts';
import { createScenario } from './scenarios/utils.ts';

export const SCENARIOS: Record<string, Scenario> = Object.fromEntries(
  SCENARIO_SEEDS.map((seed) => [seed.id, createScenario(seed)])
);

export const getScenario = (id: string): Scenario | undefined => SCENARIOS[id];

export const getScenariosList = (): Scenario[] => Object.values(SCENARIOS);

/** Per-scenario release and content-readiness metadata. */
export interface ScenarioMaturityEntry {
  /** Release wave this scenario ships in (1 = first batch). */
  releaseWave: number;
  /** 0–1 float used for ordering within a wave. Higher = more ready. */
  contentReadiness: number;
  /** Must match the scenario file's metadata.status. */
  status: ScenarioStatus;
  /** Named exit criteria that must all be done before promotion to 'playable'. */
  exitCriteria: Record<string, { done: boolean; requirement: string }>;
}

/**
 * Maturity matrix for all nine scenarios.
 * - status must stay in sync with each scenario file's metadata.status
 * - Wave 1 must contain exactly three entries (CI gate in check-scenario-integrity.mjs)
 */
export const SCENARIO_MATURITY_MATRIX: Record<string, ScenarioMaturityEntry> = {
  louvre: {
    releaseWave: 1,
    contentReadiness: 1.0,
    status: 'playable',
    exitCriteria: {
      criticLines: { done: true, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: true, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: true, requirement: 'Ship SVG panorama' },
    },
  },
  'st-peters': {
    releaseWave: 1,
    contentReadiness: 0.9,
    status: 'playable',
    exitCriteria: {
      criticLines: { done: true, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: true, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: true, requirement: 'Ship SVG panorama' },
    },
  },
  topkapi: {
    releaseWave: 1,
    contentReadiness: 0.85,
    status: 'playable',
    exitCriteria: {
      criticLines: { done: true, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: true, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: true, requirement: 'Ship SVG panorama' },
    },
  },
  tsmc: {
    releaseWave: 2,
    contentReadiness: 0.8,
    status: 'playable',
    exitCriteria: {
      criticLines: { done: true, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: true, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: true, requirement: 'Ship SVG panorama' },
    },
  },
  'forbidden-city': {
    releaseWave: 2,
    contentReadiness: 0.3,
    status: 'locked',
    exitCriteria: {
      criticLines: { done: false, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: false, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: false, requirement: 'Ship high-res panorama' },
    },
  },
  hermitage: {
    releaseWave: 2,
    contentReadiness: 0.4,
    status: 'locked',
    exitCriteria: {
      criticLines: { done: false, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: true, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: false, requirement: 'Ship SVG panorama' },
    },
  },
  'federal-reserve': {
    releaseWave: 3,
    contentReadiness: 0.25,
    status: 'locked',
    exitCriteria: {
      criticLines: { done: false, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: false, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: false, requirement: 'Ship high-res panorama' },
    },
  },
  moma: {
    releaseWave: 2,
    contentReadiness: 0.75,
    status: 'playable',
    exitCriteria: {
      criticLines: { done: true, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: true, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: true, requirement: 'Ship SVG panorama' },
    },
  },
  'borges-library': {
    releaseWave: 2,
    contentReadiness: 0.85,
    status: 'playable',
    exitCriteria: {
      criticLines: { done: true, requirement: 'Complete low/mid/high critic pools' },
      scoring: { done: true, requirement: 'Calibrate zone and critical modifiers' },
      panoramaAsset: { done: true, requirement: 'Ship SVG panorama' },
    },
  },
};

export const SCENARIO_ROLLOUT_WAVES = Object.entries(SCENARIO_MATURITY_MATRIX)
  .sort(([, left], [, right]) => {
    if (left.releaseWave === right.releaseWave) {
      return left.contentReadiness - right.contentReadiness;
    }

    return left.releaseWave - right.releaseWave;
  })
  .reduce<Record<number, string[]>>((waves, [scenarioId, maturity]) => {
    const wave = maturity.releaseWave;
    if (!waves[wave]) {
      waves[wave] = [];
    }
    waves[wave].push(scenarioId);
    return waves;
  }, {});
