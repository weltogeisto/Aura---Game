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

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId && isScenarioPlayable(s));
    if (!scenario) return;

    startRun(scenario);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-gray-950/95 p-8 shadow-2xl md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-300">{UI_COPY_MAP.scenarioSelect.overline}</p>
        <h1 className="mt-3 text-4xl font-bold text-transparent bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text">
          {UI_COPY_MAP.scenarioSelect.heading}
        </h1>
        <p className="mt-3 text-sm text-gray-300">{UI_COPY_MAP.hints.scenarioPickerHint}</p>

        <div className="mt-6 space-y-3">
          {scenarios.map((scenario) => {
            const playable = isScenarioPlayable(scenario);
            const locked = scenario.metadata.status === 'locked';
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
                className={`w-full rounded-xl border p-4 text-left transition ${playable
                  ? 'border-orange-500/40 bg-orange-900/10 hover:border-orange-400 hover:bg-orange-900/20'
                  : 'cursor-not-allowed border-white/10 bg-gray-900/30 opacity-75'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{scenario.name}</h2>
                    <p className="mt-1 text-sm text-gray-300">{location}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${playable ? 'bg-orange-500/20 text-orange-200' : 'bg-gray-700/50 text-gray-300'}`}>
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
          className="mt-6 text-sm font-medium text-gray-400 transition hover:text-gray-200"
        >
          {UI_COPY_MAP.scenarioSelect.backToMenu}
        </button>
      </div>
    </div>
  );
}
