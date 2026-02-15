import { getScenariosList } from '@/data/scenarios';
import { useGameStore } from '@/stores/gameStore';

export function ScenarioSelect() {
  const setGamePhase = useGameStore((state) => state.setGamePhase);
  const setSelectedScenario = useGameStore((state) => state.setSelectedScenario);
  const resetRunState = useGameStore((state) => state.resetRunState);

  const scenarios = getScenariosList().filter((scenario) => scenario.isMvp);

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      resetRunState();
      setSelectedScenario(scenario);
      resetRunState();
      setGamePhase('aiming');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          Select Scenario
        </h1>
        <div className="grid grid-cols-1 gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleSelectScenario(scenario.id)}
              className="p-4 text-left bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            >
              <h3 className="text-xl font-semibold text-white">{scenario.name}</h3>
              <p className="text-gray-400 text-sm">{scenario.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
