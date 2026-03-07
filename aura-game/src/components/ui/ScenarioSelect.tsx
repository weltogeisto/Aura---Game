import { useMemo } from 'react';
import { getScenariosList } from '@/data/scenarios';
import { isScenarioPlayable, sortScenariosByStatus } from './scenarioSelectModel';
import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';
import { getAllBestScores } from '@/lib/scores';
import { formatCurrency } from '@/lib/utils';
import type { ScenarioStatus } from '@/types';

const STATUS_LABELS: Record<ScenarioStatus, string> = {
  playable: 'Playable',
  prototype: 'Prototype',
  locked: 'Locked',
};

/** Make a semi-transparent tint from the scenario's panorama color */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(80,40,20,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function ScenarioSelect() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const startRun = useGameStore((state) => state.startRun);

  const scenarios = useMemo(() => sortScenariosByStatus(getScenariosList()), []);
  const bestScores = useMemo(() => getAllBestScores(), []);

  const playableCount = scenarios.filter((s) => s.metadata.status === 'playable').length;
  const prototypeCount = scenarios.filter((s) => s.metadata.status === 'prototype').length;
  const lockedCount = scenarios.filter((s) => s.metadata.status === 'locked').length;

  const totalBestScore = Object.values(bestScores).reduce(
    (sum, s) => sum + s.best,
    0,
  );

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId && isScenarioPlayable(s));
    if (!scenario) return;
    startRun(scenario);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/88 px-3 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-6xl max-h-[92dvh] overflow-y-auto rounded-2xl border border-white/10 bg-gray-950/97 p-4 shadow-2xl sm:p-6 md:p-8 xl:grid xl:grid-cols-[1.7fr_1fr] xl:gap-6">
        <section>
          <p className="text-xs uppercase tracking-[0.3em] text-orange-300">
            {UI_COPY_MAP.scenarioSelect.overline}
          </p>
          <h1 className="font-display mt-3 text-2xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text sm:text-4xl">
            {UI_COPY_MAP.scenarioSelect.heading}
          </h1>
          <p className="mt-3 text-sm text-gray-300">{UI_COPY_MAP.hints.scenarioPickerHint}</p>

          {/* Scenario cards */}
          <div className="mt-6 space-y-2">
            {scenarios.map((scenario, i) => {
              const playable = isScenarioPlayable(scenario);
              const best = bestScores[scenario.id];
              const accentColor = scenario.panoramaColor ?? '#7c3a1e';

              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario.id)}
                  disabled={!playable}
                  className={[
                    'w-full rounded-xl border p-3 text-left transition-all duration-200 sm:p-4',
                    'anim-slide-up',
                    playable
                      ? 'hover:-translate-y-0.5 hover:scale-[1.005] active:scale-[0.998]'
                      : 'cursor-not-allowed opacity-60',
                  ].join(' ')}
                  style={{
                    animationDelay: `${i * 45}ms`,
                    borderColor: playable ? `${accentColor}55` : 'rgba(255,255,255,0.08)',
                    background: playable
                      ? hexToRgba(accentColor, 0.06)
                      : 'rgba(20,20,25,0.4)',
                  }}
                >
                  <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Colour swatch dot */}
                        <span
                          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: accentColor }}
                        />
                        <h2 className="font-display text-lg font-bold text-white sm:text-xl">
                          {scenario.name}
                        </h2>
                        {best && (
                          <span className="font-mono rounded bg-orange-950/60 px-1.5 py-0.5 text-[10px] text-orange-300/90">
                            Best: {formatCurrency(best.best)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{scenario.description}</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:text-xs"
                        style={{
                          background: playable ? hexToRgba(accentColor, 0.25) : 'rgba(60,60,70,0.5)',
                          color: playable ? '#fde68a' : '#9ca3af',
                        }}
                      >
                        {STATUS_LABELS[scenario.metadata.status]}
                      </span>
                      <span className="font-mono text-[10px] text-gray-600">
                        {scenario.targets.length} targets · max {formatCurrency(scenario.totalMaxValue)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setGamePhase('menu')}
            className="mt-6 pb-1 text-sm font-medium text-gray-500 transition hover:text-gray-300"
          >
            {UI_COPY_MAP.scenarioSelect.backToMenu}
          </button>
        </section>

        {/* Sidebar */}
        <aside className="mt-6 space-y-4 xl:mt-0 xl:sticky xl:top-4 xl:self-start">
          {/* Mission brief */}
          <div className="rounded-xl border border-orange-500/30 bg-black/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">
              {UI_COPY_MAP.scenarioSelect.deskBriefHeading}
            </p>
            <p className="mt-2 text-sm text-gray-300">{UI_COPY_MAP.scenarioSelect.deskBriefBody}</p>
          </div>

          {/* Status counts */}
          <div className="rounded-xl border border-white/10 bg-gray-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Scenario status</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-orange-500/12 p-2 text-center text-orange-200">
                <p className="font-mono font-bold">{playableCount}</p>
                <p>Playable</p>
              </div>
              <div className="rounded-lg bg-blue-500/12 p-2 text-center text-blue-200">
                <p className="font-mono font-bold">{prototypeCount}</p>
                <p>Prototype</p>
              </div>
              <div className="rounded-lg bg-gray-700/50 p-2 text-center text-gray-400">
                <p className="font-mono font-bold">{lockedCount}</p>
                <p>Locked</p>
              </div>
            </div>
          </div>

          {/* Career total */}
          {totalBestScore > 0 && (
            <div className="rounded-xl border border-orange-500/20 bg-black/35 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-200">Career best total</p>
              <p className="font-mono mt-2 text-2xl font-bold text-orange-300">
                {formatCurrency(totalBestScore)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                across {Object.keys(bestScores).length} scenario{Object.keys(bestScores).length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Readiness notes */}
          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">
              {UI_COPY_MAP.scenarioSelect.readinessHeading}
            </p>
            <ul className="mt-2 space-y-2 text-sm text-gray-300">
              {UI_COPY_MAP.scenarioSelect.readinessItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
