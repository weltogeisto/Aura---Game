import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { gameAudio, type ImpactProfile } from '@/audio/gameAudio';

const IMPACT_BY_MATERIAL_KEYWORD: Array<{ match: string; profile: ImpactProfile }> = [
  { match: 'glass', profile: 'glass' },
  { match: 'metal', profile: 'metal' },
  { match: 'bronze', profile: 'metal' },
  { match: 'gold', profile: 'metal' },
  { match: 'marble', profile: 'stone' },
  { match: 'stone', profile: 'stone' },
  { match: 'wood', profile: 'wood' },
  { match: 'canvas', profile: 'fabric' },
  { match: 'paper', profile: 'fabric' },
  { match: 'textile', profile: 'fabric' },
];

const resolveMaterialImpactProfile = (
  material: string | undefined,
  fallback: ImpactProfile = 'stone'
): ImpactProfile => {
  if (!material) return fallback;
  const lowered = material.toLowerCase();
  return IMPACT_BY_MATERIAL_KEYWORD.find((entry) => lowered.includes(entry.match))?.profile ?? fallback;
};

export function GameAudioDirector() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const shotFeedback = useGameStore((state) => state.shotFeedback);
  const shotTimestamp = useGameStore((state) => state.shotTimestamp);
  const fireBlocked = useGameStore((state) => state.fireBlocked);
  const lastShotResult = useGameStore((state) => state.lastShotResult);

  const prevPhase = useRef(gamePhase);
  const handledShotAt = useRef<number | null>(null);

  useEffect(() => {
    if (gamePhase === 'aiming' || gamePhase === 'shooting') {
      gameAudio.setAmbient(
        selectedScenario?.audioAsset?.ambient ?? null,
        selectedScenario?.audioAsset?.ambientGain ?? 0.2
      );
    } else {
      gameAudio.stopAmbient();
    }

    if (prevPhase.current !== gamePhase) {
      if (gamePhase === 'results' || gamePhase === 'scenario-select') gameAudio.playUi('confirm');
      if (gamePhase === 'menu' || gamePhase === 'start') gameAudio.playUi('back');
    }

    prevPhase.current = gamePhase;
  }, [gamePhase, selectedScenario]);

  useEffect(() => {
    if (!fireBlocked) return;
    gameAudio.playUi('blocked');
  }, [fireBlocked]);

  useEffect(() => {
    if (!shotFeedback?.active || !shotTimestamp || handledShotAt.current === shotTimestamp) return;

    const target = selectedScenario?.targets.find((entry) => entry.id === lastShotResult?.hitTargetId);
    const scenarioProfile = selectedScenario?.audioAsset?.impactProfile;
    const impactProfile = resolveMaterialImpactProfile(target?.material, scenarioProfile);

    gameAudio.playImpact(impactProfile);
    handledShotAt.current = shotTimestamp;
  }, [lastShotResult?.hitTargetId, selectedScenario, shotFeedback, shotTimestamp]);

  return null;
}
