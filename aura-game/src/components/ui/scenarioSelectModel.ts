import type { Scenario, ScenarioStatus } from '../../types/index.ts';

export const sortScenariosByStatus = (scenarios: Scenario[]): Scenario[] => {
  const statusOrder: ScenarioStatus[] = ['playable', 'prototype', 'locked'];
  return [...scenarios].sort(
    (a, b) => statusOrder.indexOf(a.metadata.status) - statusOrder.indexOf(b.metadata.status)
  );
};
