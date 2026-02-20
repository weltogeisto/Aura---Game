import type { Scenario, ScenarioStatus } from '../../types/index.ts';
import { SCENARIO_MATURITY_MATRIX } from '../../data/scenarios.ts';

export const sortScenariosByStatus = (scenarios: Scenario[]): Scenario[] => {
  const statusOrder: ScenarioStatus[] = ['playable', 'prototype', 'locked'];
  return [...scenarios].sort(
    (a, b) => statusOrder.indexOf(a.metadata.status) - statusOrder.indexOf(b.metadata.status)
  );
};

export const isScenarioPlayable = (scenario: Scenario): boolean => scenario.metadata.status === 'playable';

export const getScenarioStatusMessage = (scenario: Scenario): string => {
  const maturity = SCENARIO_MATURITY_MATRIX[scenario.id];
  const remaining = Object.values(maturity.exitCriteria).filter((criterion) => !criterion.done);

  if (maturity.status === 'playable') {
    return `Wave ${maturity.releaseWave} · Ready to play now.`;
  }

  const nextGate = remaining[0]?.requirement ?? 'Final release gates pending.';
  return `Wave ${maturity.releaseWave} · Coming soon: ${nextGate}`;
};
