import { useGameStore } from '@/stores/gameStore';
import { MICROCOPY } from '@/data/copy';
import { UI_COPY_MAP } from '@/data/uiCopyMap';
import { useTypewriter } from '@/lib/useTypewriter';

function AccessibilityToggles() {
  const accessibility = useGameStore((state) => state.accessibility);
  const setAccessibilityFlag = useGameStore((state) => state.setAccessibilityFlag);

  const toggles: Array<{ key: keyof typeof accessibility; label: string }> = [
    { key: 'reducedMotion', label: UI_COPY_MAP.accessibility.reducedMotion },
    { key: 'highContrast', label: UI_COPY_MAP.accessibility.highContrast },
    { key: 'aimAssist', label: UI_COPY_MAP.accessibility.aimAssist },
  ];

  return (
    <div className="pointer-events-auto absolute right-6 bottom-6 w-72 rounded-lg border border-white/15 bg-black/55 p-3 text-sm text-gray-200">
      <p className="text-xs uppercase tracking-[0.2em] text-orange-200">{UI_COPY_MAP.accessibility.heading}</p>
      <div className="mt-2 space-y-2">
        {toggles.map((toggle) => (
          <label key={toggle.key} className="flex items-center justify-between gap-2">
            <span>{toggle.label}</span>
            <button
              type="button"
              onClick={() => setAccessibilityFlag(toggle.key, !accessibility[toggle.key])}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${accessibility[toggle.key]
                ? 'bg-orange-500 text-black'
                : 'bg-gray-800 text-gray-300'}`}
            >
              {accessibility[toggle.key] ? UI_COPY_MAP.accessibility.on : UI_COPY_MAP.accessibility.off}
            </button>
          </label>
        ))}
      </div>
    </div>
  );
}

export function HUD() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const selectedScenario = useGameStore((state) => state.selectedScenario);
  const ammoRemaining = useGameStore((state) => state.ammoRemaining);
  const fireBlocked = useGameStore((state) => state.fireBlocked);
  const lastShotResult = useGameStore((state) => state.lastShotResult);
  const reducedMotion = useGameStore((state) => state.accessibility.reducedMotion);
  const criticText = lastShotResult?.criticLine ?? UI_COPY_MAP.hud.evaluating;
  const typedCritic = useTypewriter(criticText, { disabled: reducedMotion || gamePhase !== 'shooting', speedMs: 16 });

  if ((gamePhase !== 'aiming' && gamePhase !== 'shooting') || !selectedScenario) {
    return null;
  }

  const isShooting = gamePhase === 'shooting';

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      <div className="absolute left-6 top-6 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Active scenario</p>
        <h2 className="mt-1 text-2xl font-semibold text-orange-400">{selectedScenario.name}</h2>
        <p className="mt-1 text-sm text-gray-300">{isShooting ? MICROCOPY.shootingHint : MICROCOPY.aimingHint}</p>
      </div>

      <div className="absolute right-6 top-6 rounded-lg bg-black/50 px-4 py-2 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-300">Ammo</p>
        <p className="text-3xl font-bold text-red-500">{ammoRemaining}</p>
      </div>

      {gamePhase === 'aiming' ? (
        <div className="absolute bottom-6 left-6 space-y-1 text-sm text-gray-300">
          {UI_COPY_MAP.hud.controls.map((control) => (
            <p key={control}>{control}</p>
          ))}
          {fireBlocked && <p className="text-orange-300">{UI_COPY_MAP.hud.blockedShot}</p>}
        </div>
      ) : (
        <div className="absolute bottom-6 left-6 max-w-xl rounded-lg border border-orange-500/35 bg-black/45 px-4 py-3 text-sm text-orange-100">
          <p className="font-medium">{UI_COPY_MAP.hud.evaluating}</p>
          <p className="mt-1 text-orange-200">{UI_COPY_MAP.hud.criticDeliveryPrefix} “{typedCritic.text}{typedCritic.done ? '' : '▌'}”</p>
          {lastShotResult?.hitTargetName && (
            <p className="mt-1 text-orange-200">
              {UI_COPY_MAP.hud.registeredPrefix} {lastShotResult.hitTargetName}
            </p>
          )}
        </div>
      )}

      <AccessibilityToggles />
    </div>
  );
}
