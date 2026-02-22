import { getScenariosList } from '@/data/scenarios';
import { isScenarioPlayable, sortScenariosByStatus } from './scenarioSelectModel';
import { useGameStore } from '@/stores/gameStore';
import { UI_COPY_MAP } from '@/data/uiCopyMap';
import type { ScenarioStatus } from '@/types';

const parseLocation = (description: string): { location: string; detail: string } => {
  const [location, ...rest] = description.split('. ');
  return {
    location,
    detail: rest.join('. ') || description,
  };
};

const STATUS_LABELS: Record<ScenarioStatus, string> = {
  playable: 'Playable',
  prototype: 'Prototype',
  locked: 'Locked',
};

export function ScenarioSelect() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const startRun = useGameStore((state) => state.startRun);

  const scenarios = sortScenariosByStatus(getScenariosList());
  const playableCount = scenarios.filter((scenario) => scenario.metadata.status === 'playable').length;
  const prototypeCount = scenarios.filter((scenario) => scenario.metadata.status === 'prototype').length;
  const lockedCount = scenarios.filter((scenario) => scenario.metadata.status === 'locked').length;

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId && isScenarioPlayable(s));
    if (!scenario) return;

    startRun(scenario);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 px-3 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-6xl max-h-[92dvh] overflow-y-auto rounded-2xl border border-white/10 bg-gray-950/95 p-4 shadow-2xl sm:p-6 md:p-8 xl:grid xl:grid-cols-[1.7fr_1fr] xl:gap-6">
        <section>
          <p className="text-xs uppercase tracking-[0.3em] text-orange-300">{UI_COPY_MAP.scenarioSelect.overline}</p>
          <h1 className="mt-3 text-2xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text sm:text-4xl">
            {UI_COPY_MAP.scenarioSelect.heading}
          </h1>
          <p className="mt-3 text-sm text-gray-300">{UI_COPY_MAP.hints.scenarioPickerHint}</p>

          <div className="mt-6 space-y-3">
            {scenarios.map((scenario) => {
            const playable = isScenarioPlayable(scenario);
            const { location, detail } = parseLocation(scenario.description);
            const statusExplain = scenario.metadata.status === 'locked'
              ? UI_COPY_MAP.scenarioSelect.statusLocked
              : scenario.metadata.status === 'prototype'
                ? UI_COPY_MAP.scenarioSelect.statusPrototype
                : UI_COPY_MAP.scenarioSelect.statusPlayable;

              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario.id)}
                  disabled={!playable}
                  className={`w-full rounded-xl border p-3 text-left transition sm:p-4 ${playable
                    ? 'border-orange-500/40 bg-orange-900/10 hover:border-orange-400 hover:bg-orange-900/20'
                    : 'cursor-not-allowed border-white/10 bg-gray-900/30 opacity-75'}`}
                >
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white sm:text-xl">{scenario.name}</h2>
                      <p className="mt-1 text-sm text-gray-300">{location}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] sm:px-3 sm:text-xs ${playable ? 'bg-orange-500/20 text-orange-200' : 'bg-gray-700/50 text-gray-300'}`}>
                      {STATUS_LABELS[scenario.metadata.status]}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{detail}</p>
                  <p className="mt-2 text-xs text-orange-200/80">{statusExplain}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.limitations.heading}</p>
            <p className="mt-2 text-sm text-gray-300">{UI_COPY_MAP.limitations.items[1]}</p>
          </div>

          <button
            onClick={() => setGamePhase('menu')}
            className="mt-6 pb-1 text-sm font-medium text-gray-400 transition hover:text-gray-200"
          >
            {UI_COPY_MAP.scenarioSelect.backToMenu}
          </button>
        </section>

        <aside className="mt-6 space-y-4 xl:mt-0 xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-xl border border-orange-500/35 bg-black/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.scenarioSelect.deskBriefHeading}</p>
            <p className="mt-2 text-sm text-gray-300">{UI_COPY_MAP.scenarioSelect.deskBriefBody}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-gray-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-300">Scenario status</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-orange-500/15 p-2 text-center text-orange-100">
                <p className="font-semibold">{playableCount}</p>
                <p>Playable</p>
              </div>
              <div className="rounded-lg bg-blue-500/15 p-2 text-center text-blue-100">
                <p className="font-semibold">{prototypeCount}</p>
                <p>Prototype</p>
              </div>
              <div className="rounded-lg bg-gray-700/60 p-2 text-center text-gray-200">
                <p className="font-semibold">{lockedCount}</p>
                <p>Locked</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/35 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.scenarioSelect.readinessHeading}</p>
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
