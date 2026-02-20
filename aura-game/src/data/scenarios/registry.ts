import type { ScenarioSeed } from './utils.ts';
import { BORGES_LIBRARY_SCENARIO } from './borges-library.ts';
import { FEDERAL_RESERVE_SCENARIO } from './federal-reserve.ts';
import { FORBIDDEN_CITY_SCENARIO } from './forbidden-city.ts';
import { HERMITAGE_SCENARIO } from './hermitage.ts';
import { LOUVRE_SCENARIO } from './louvre.ts';
import { MOMA_SCENARIO } from './moma.ts';
import { ST_PETERS_SCENARIO } from './st-peters.ts';
import { TOPKAPI_SCENARIO } from './topkapi.ts';
import { TSMC_SCENARIO } from './tsmc.ts';

export const SCENARIO_SEEDS: readonly ScenarioSeed[] = [
  LOUVRE_SCENARIO,
  ST_PETERS_SCENARIO,
  TOPKAPI_SCENARIO,
  TSMC_SCENARIO,
  FORBIDDEN_CITY_SCENARIO,
  HERMITAGE_SCENARIO,
  FEDERAL_RESERVE_SCENARIO,
  MOMA_SCENARIO,
  BORGES_LIBRARY_SCENARIO,
] as const;
