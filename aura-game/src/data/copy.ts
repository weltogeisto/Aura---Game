import type { Scenario } from '../types/index.ts';
import { UI_COPY_MAP } from './uiCopyMap.ts';

const ensureSentencePunctuation = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  return /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

export const MICROCOPY = UI_COPY_MAP.hints;

export const STATUS_MICROCOPY = {
  playable: UI_COPY_MAP.scenarioSelect.statusPlayable,
  prototype: UI_COPY_MAP.scenarioSelect.statusPrototype,
  locked: UI_COPY_MAP.scenarioSelect.statusLocked,
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
