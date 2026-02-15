import { getScenariosList } from '@/data/scenarios';
import { useGameStore } from '@/stores/gameStore';
import { MICROCOPY } from '@/data/copy';
import type { ScenarioStatus } from '@/types';
import { sortScenariosByStatus } from './scenarioSelectModel';

const parseLocation = (description: string): { location: string; detail: string } => {
  const [location, ...rest] = description.split('. ');
  return {
    location,
    detail: rest.join('. ') || description,
  };
};

const statusLabel: Record<ScenarioStatus, string> = {
  playable: 'Playable',
  prototype: 'Prototype',
  locked: 'Locked',
};

export function ScenarioSelect() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const startRun = useGameStore((state) => state.startRun);

  const scenarios = sortScenariosByStatus(getScenariosList());

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario || scenario.metadata.status !== 'playable') return;

    startRun(scenario);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 py-8">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-gray-950/95 p-8 shadow-2xl md:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-orange-300">Scenario Selection</p>
        <h1 className="mt-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-4xl font-bold text-transparent">
          Choose your target room
        </h1>
        <p className="mt-3 text-sm text-gray-300">{MICROCOPY.scenarioPickerHint}</p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {scenarios.map((scenario) => {
            const { location, detail } = parseLocation(scenario.description);
            const locked = scenario.metadata.status === 'locked';
            const playable = scenario.metadata.status === 'playable';

            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario.id)}
                disabled={!playable}
                className={`rounded-xl border p-5 text-left transition ${
                  playable
                    ? 'border-white/10 bg-gray-900 hover:border-orange-400/50 hover:bg-gray-800'
                    : 'cursor-not-allowed border-white/5 bg-gray-900/40 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-300/90">{location}</p>
                  <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300">
                    {statusLabel[scenario.metadata.status]}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">{scenario.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{detail}</p>
                {!playable && (
                  <p className="mt-2 text-xs text-orange-200/80">
                    {locked
                      ? 'Room locked — content staged for later release.'
                      : 'Prototype room — visible for preview, not yet playable.'}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setGamePhase('menu')}
          className="mt-6 text-sm font-medium text-gray-400 transition hover:text-gray-200"
        >
          ← Back to main menu
        </button>
      </div>
    </div>
  );
}
