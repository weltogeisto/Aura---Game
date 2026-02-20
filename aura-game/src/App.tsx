import './App.css';
import { useGameStore } from '@/stores/gameStore';
import { MainMenu } from '@/components/ui/MainMenu';
import { ScenarioSelect } from '@/components/ui/ScenarioSelect';
import { ResultsScreen } from '@/components/ui/ResultsScreen';
import { Scene } from '@/components/game/Scene';
import { HUD } from '@/components/game/HUD';
import { ShotEffects } from '@/components/game/ShotEffects';
import { StartView } from '@/components/ui/StartView';
import { hasResult } from '@/stores/gameSelectors';

function App() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const showResults = useGameStore((state) => state.gamePhase === 'results' && hasResult(state));
  const showRunView = useGameStore((state) => state.gamePhase === 'aiming' || state.gamePhase === 'shooting');
  const highContrast = useGameStore((state) => state.accessibility.highContrast);

  return (
    <div className={`w-screen h-screen overflow-hidden ${highContrast ? 'accessibility-high-contrast bg-black' : 'bg-black'}`}>
      {gamePhase === 'start' && <StartView />}
      {gamePhase === 'menu' && <MainMenu />}
      {gamePhase === 'scenario-select' && <ScenarioSelect />}
      {showRunView && (
        <>
          <Scene />
          <HUD />
          <ShotEffects />
        </>
      )}
      {showResults && <ResultsScreen />}
    </div>
  );
}

export default App;
