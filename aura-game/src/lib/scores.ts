const SCORES_KEY = 'aura-scores-v1';

export interface ScenarioScore {
  best: number;
  runs: number;
  lastScore: number;
}

function readAll(): Record<string, ScenarioScore> {
  if (typeof globalThis.localStorage === 'undefined') return {};
  try {
    const raw = globalThis.localStorage.getItem(SCORES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ScenarioScore>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, ScenarioScore>): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  try {
    globalThis.localStorage.setItem(SCORES_KEY, JSON.stringify(data));
  } catch {
    // Ignore write failures (private mode / quota exceeded)
  }
}

export function getScenarioBestScore(scenarioId: string): ScenarioScore | null {
  return readAll()[scenarioId] ?? null;
}

export function saveScenarioScore(
  scenarioId: string,
  score: number,
): { isNewRecord: boolean; record: ScenarioScore } {
  const all = readAll();
  const existing = all[scenarioId];
  const isNewRecord = !existing || score > existing.best;
  const record: ScenarioScore = {
    best: isNewRecord ? score : existing.best,
    runs: (existing?.runs ?? 0) + 1,
    lastScore: score,
  };
  all[scenarioId] = record;
  writeAll(all);
  return { isNewRecord, record };
}

export function getAllBestScores(): Record<string, ScenarioScore> {
  return readAll();
}

export function clearAllScores(): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  try {
    globalThis.localStorage.removeItem(SCORES_KEY);
  } catch {
    // Ignore
  }
}
