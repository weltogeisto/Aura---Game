import type { Scenario, Target } from '@/types';

export const DADAIST_SCORE = 1917000001;

export function deterministicCriticLine(
  scenario: Scenario,
  totalScore: number,
  hitTargetId: string | null,
  hitTargetType: Target['type'] | null,
  hitLocationLabel: string
): string {
  if (hitTargetType === 'easter-egg-dadaist') {
    return 'Dadaist inversion confirmed: valuation collapses into pure gesture. The market applauds the void.';
  }

  const criticLines = scenario.criticLines;
  if (!criticLines) {
    return 'The critic is still taking notes.';
  }

  const ratio = scenario.totalMaxValue ? totalScore / scenario.totalMaxValue : 0;
  const pool = ratio >= 0.6 ? criticLines.high : ratio >= 0.25 ? criticLines.mid : criticLines.low;
  const seedInput = `${scenario.id}|${hitTargetId ?? 'miss'}|${totalScore}|${hitLocationLabel}`;
  const hash = seedInput
    .split('')
    .reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);

  return pool[hash % pool.length] ?? 'The critic is still taking notes.';
}
