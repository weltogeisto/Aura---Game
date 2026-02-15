import type { Scenario, ScenarioContentCompleteness } from '../../types/index.ts';

export interface ScenarioValidationResult {
  completeness: ScenarioContentCompleteness;
  errors: string[];
}

const hasCriticLines = (scenario: Pick<Scenario, 'criticLines'>): boolean => {
  const lines = scenario.criticLines;
  if (!lines) return false;
  return lines.low.length > 0 && lines.mid.length > 0 && lines.high.length > 0;
};

const hasPanoramaAssets = (scenario: Pick<Scenario, 'panoramaAsset'>): boolean => {
  return Boolean(scenario.panoramaAsset.lowRes && scenario.panoramaAsset.highRes);
};

const hasScoring = (scenario: Pick<Scenario, 'scoring'>): boolean => {
  if (!scenario.scoring) return false;
  const { fallbackSampleValue, defaultZoneMultiplier, defaultCriticalModifier, dadaistScore } = scenario.scoring;
  return [fallbackSampleValue, defaultZoneMultiplier, defaultCriticalModifier, dadaistScore].every(
    (value) => Number.isFinite(value)
  );
};

export const validateScenarioDefinition = (
  scenario: Pick<Scenario, 'id' | 'targets' | 'criticLines' | 'panoramaAsset' | 'scoring'> & {
    metadata: Pick<Scenario['metadata'], 'status'>;
  }
): ScenarioValidationResult => {
  const completeness: ScenarioContentCompleteness = {
    targets: scenario.targets.length > 0,
    criticLines: hasCriticLines(scenario),
    panoramaAssets: hasPanoramaAssets(scenario),
    scoring: hasScoring(scenario),
  };

  const errors: string[] = [];

  if (!completeness.targets) {
    errors.push('must include at least one target');
  }

  if (!completeness.panoramaAssets) {
    errors.push('must include lowRes and highRes panorama assets');
  }

  if (scenario.metadata.status === 'playable') {
    if (!completeness.criticLines) errors.push('playable scenarios require low/mid/high critic lines');
    if (!completeness.scoring) errors.push('playable scenarios require complete scoring fields');
  }

  return { completeness, errors };
};
