import type { Scenario } from '../types/index.ts';
import { createScenario } from './scenarios/utils.ts';
import { LOUVRE_SCENARIO } from './scenarios/louvre.ts';
import { ST_PETERS_SCENARIO } from './scenarios/st-peters.ts';
import { TOPKAPI_SCENARIO } from './scenarios/topkapi.ts';
import { FORBIDDEN_CITY_SCENARIO } from './scenarios/forbidden-city.ts';
import { TSMC_SCENARIO } from './scenarios/tsmc.ts';
import { HERMITAGE_SCENARIO } from './scenarios/hermitage.ts';
import { FEDERAL_RESERVE_SCENARIO } from './scenarios/federal-reserve.ts';
import { MOMA_SCENARIO } from './scenarios/moma.ts';
import { BORGES_LIBRARY_SCENARIO } from './scenarios/borges-library.ts';

const scenarioSeeds = [
  LOUVRE_SCENARIO,
  ST_PETERS_SCENARIO,
  TOPKAPI_SCENARIO,
  FORBIDDEN_CITY_SCENARIO,
  TSMC_SCENARIO,
  HERMITAGE_SCENARIO,
  FEDERAL_RESERVE_SCENARIO,
  MOMA_SCENARIO,
  BORGES_LIBRARY_SCENARIO,
];

export const SCENARIOS: Record<string, Scenario> = Object.fromEntries(
  scenarioSeeds.map((seed) => [seed.id, createScenario(seed)])
);

export const getScenario = (id: string): Scenario | undefined => SCENARIOS[id];

export const getScenariosList = (): Scenario[] => Object.values(SCENARIOS);
