import type { Scenario } from '../types/index.ts';
import { SCENARIO_SEEDS } from './scenarios/registry.ts';
import { createScenario } from './scenarios/utils.ts';

export const SCENARIOS: Record<string, Scenario> = Object.fromEntries(
  SCENARIO_SEEDS.map((seed) => [seed.id, createScenario(seed)])
);

export const getScenario = (id: string): Scenario | undefined => SCENARIOS[id];

export const getScenariosList = (): Scenario[] => Object.values(SCENARIOS);

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
