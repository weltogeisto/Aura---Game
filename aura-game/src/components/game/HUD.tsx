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
    <div className="pointer-events-auto absolute right-5 bottom-5 w-64 rounded-lg border border-white/10 bg-black/60 p-3 text-sm text-gray-200 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.2em] text-orange-200/80">
        {UI_COPY_MAP.accessibility.heading}
      </p>
      <div className="mt-2 space-y-2">
        {toggles.map((toggle) => (
          <label key={toggle.key} className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-300">{toggle.label}</span>
            <button
              type="button"
              onClick={() => setAccessibilityFlag(toggle.key, !accessibility[toggle.key])}
              className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${accessibility[toggle.key]
                ? 'bg-orange-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
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
  const typedCritic = useTypewriter(criticText, {
    disabled: reducedMotion || gamePhase !== 'shooting',
    speedMs: 16,
  });

  if ((gamePhase !== 'aiming' && gamePhase !== 'shooting') || !selectedScenario) {
    return null;
  }

  const isShooting = gamePhase === 'shooting';

  return (
    <div className="pointer-events-none fixed inset-0 z-30 scanlines">
      {/* Top-left: Scenario info */}
      <div className="absolute left-5 top-5 text-white">
        <p className="text-[10px] uppercase tracking-[0.28em] text-orange-300/70">
          Active scenario
        </p>
        <h2 className="font-display mt-0.5 text-xl font-bold text-orange-400 sm:text-2xl">
          {selectedScenario.name}
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          {isShooting ? MICROCOPY.shootingHint : MICROCOPY.aimingHint}
        </p>
      </div>

      {/* Top-right: Ammo counter */}
      <div className="absolute right-5 top-5 rounded-xl border border-red-900/50 bg-black/65 px-4 py-3 text-center backdrop-blur">
        <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500">Ammo</p>
        <p
          className={`font-display leading-none font-black ${ammoRemaining > 0 ? 'text-red-500' : 'text-gray-700'}`}
          style={{
            fontSize: '3.5rem',
            textShadow: ammoRemaining > 0 ? '0 0 20px rgba(239,68,68,0.5)' : 'none',
          }}
        >
          {ammoRemaining}
        </p>
        <p className="text-[8px] uppercase tracking-[0.35em] text-red-400/60">One Shot</p>
      </div>

      {/* Bottom-left: Controls or critic */}
      {gamePhase === 'aiming' ? (
        <div className="absolute bottom-5 left-5 space-y-1">
          {UI_COPY_MAP.hud.controls.map((control) => (
            <p key={control} className="text-xs text-gray-500">{control}</p>
          ))}
          {fireBlocked && (
            <p className="text-xs text-orange-300">{UI_COPY_MAP.hud.blockedShot}</p>
          )}
        </div>
      ) : (
        <div className="absolute bottom-5 left-5 max-w-md rounded-xl border border-orange-500/30 bg-black/55 px-4 py-3 backdrop-blur">
          <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300/70">
            {UI_COPY_MAP.hud.evaluating}
          </p>
          <p className="font-serif mt-2 text-sm italic leading-relaxed text-orange-100">
            &ldquo;{typedCritic.text}{typedCritic.done ? '' : '▌'}&rdquo;
          </p>
          {lastShotResult?.hitTargetName && (
            <p className="mt-1.5 text-xs text-orange-300/70">
              {UI_COPY_MAP.hud.registeredPrefix}{' '}
              <span className="font-semibold not-italic text-orange-200">
                {lastShotResult.hitTargetName}
              </span>
            </p>
          )}
        </div>
      )}

      <AccessibilityToggles />
    </div>
  );
}
