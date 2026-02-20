import type { Scenario } from '../types/index.ts';
import { SCENARIO_SEEDS } from './scenarios/registry.ts';
import { createScenario } from './scenarios/utils.ts';

export const SCENARIOS: Record<string, Scenario> = Object.fromEntries(
  SCENARIO_SEEDS.map((seed) => [seed.id, createScenario(seed)])
);

export const getScenario = (id: string): Scenario | undefined => SCENARIOS[id];

export const getScenariosList = (): Scenario[] => Object.values(SCENARIOS);
