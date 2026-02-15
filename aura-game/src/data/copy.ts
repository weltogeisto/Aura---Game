import type { Scenario } from '../types/index.ts';

const ensureSentencePunctuation = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

export const MICROCOPY = {
  gameTagline: 'One shot. One appraisal. No undo.',
  scenarioPickerHint: 'Choose your room, take the shot, live with the verdict.',
  aimingHint: 'Center your aim, then commit to the only shot.',
  shootingHint: 'Shot locked. Appraising impact…',
  resultsHint: 'Run archived. Decide what to do with the next attempt.',
} as const;

type ScenarioCopyShape = {
  description: string;
  targets: Scenario['targets'];
  criticLines?: Scenario['criticLines'];
};

export const normalizeScenarioCopy = <T extends ScenarioCopyShape>(scenario: T): T => ({
  ...scenario,
  description: ensureSentencePunctuation(scenario.description),
  targets: scenario.targets.map((target) => ({
    ...target,
    description: target.description ? ensureSentencePunctuation(target.description) : target.description,
    specialEffects: target.specialEffects?.map((effect) => ensureSentencePunctuation(effect)),
  })),
  criticLines: scenario.criticLines
    ? {
        low: scenario.criticLines.low.map(ensureSentencePunctuation),
        mid: scenario.criticLines.mid.map(ensureSentencePunctuation),
        high: scenario.criticLines.high.map(ensureSentencePunctuation),
      }
    : undefined,
});
