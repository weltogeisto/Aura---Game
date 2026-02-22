import { Howl } from 'howler';
import { EMBEDDED_AUDIO, IMPACT_AUDIO_MATRIX } from './embeddedAudio';

export type ImpactProfile = 'stone' | 'metal' | 'glass' | 'wood' | 'fabric';

const IMPACT_PROFILE_GAIN: Record<ImpactProfile, number> = {
  stone: 0.96,
  metal: 0.9,
  glass: 0.86,
  wood: 0.94,
  fabric: 1,
};

const SCENARIO_MIX_GAIN: Record<string, { ambient: number; impact: number }> = {
  louvre: { ambient: 0.95, impact: 0.9 },
  'st-peters': { ambient: 0.88, impact: 0.94 },
  topkapi: { ambient: 0.92, impact: 1 },
  'forbidden-city': { ambient: 0.96, impact: 0.97 },
  tsmc: { ambient: 0.85, impact: 0.92 },
  hermitage: { ambient: 0.93, impact: 0.95 },
  'federal-reserve': { ambient: 0.9, impact: 0.98 },
  moma: { ambient: 0.97, impact: 0.86 },
  'borges-library': { ambient: 0.94, impact: 0.93 },
};

const UI_SOURCES = {
  confirm: EMBEDDED_AUDIO['ui-confirm'],
  back: EMBEDDED_AUDIO['ui-back'],
  blocked: EMBEDDED_AUDIO['ui-blocked'],
} as const;

const EMBEDDED_AMBIENT_PREFIX = 'data:audio/x-aura-ambient,';

const resolveAmbientSource = (src: string): string => {
  if (!src.startsWith(EMBEDDED_AMBIENT_PREFIX)) return src;

  const ambientId = src.slice(EMBEDDED_AMBIENT_PREFIX.length);
  const embedded = EMBEDDED_AUDIO[`ambient-${ambientId}` as keyof typeof EMBEDDED_AUDIO];
  return embedded ?? src;
};

const impactCache = new Map<string, Howl>();
const ambientCache = new Map<string, Howl>();
const uiCache = new Map<keyof typeof UI_SOURCES, Howl>();

let activeAmbient: Howl | null = null;
let activeScenarioId: string | null = null;

const resolveScenarioMix = () =>
  (activeScenarioId ? SCENARIO_MIX_GAIN[activeScenarioId] : undefined) ?? { ambient: 1, impact: 1 };

const clampGain = (gain: number): number => Math.min(1, Math.max(0, gain));

const getImpactVariant = (profile: ImpactProfile) => {
  const variants = IMPACT_AUDIO_MATRIX[profile];
  return variants[Math.floor(Math.random() * variants.length)] ?? variants[0];
};

const getImpactHowl = (profile: ImpactProfile): Howl => {
  const variant = getImpactVariant(profile);
  const scenarioMix = resolveScenarioMix();
  const volume = clampGain(variant.baseGain * IMPACT_PROFILE_GAIN[profile] * scenarioMix.impact);
  const key = `${profile}|${variant.label}|${volume.toFixed(2)}`;

  const cached = impactCache.get(key);
  if (cached) return cached;

  const howl = new Howl({ src: [variant.src], volume, preload: true });
  impactCache.set(key, howl);
  return howl;
};

const getAmbientHowl = (src: string, gain: number): Howl => {
  const resolvedSource = resolveAmbientSource(src);
  const calibratedGain = clampGain(gain * resolveScenarioMix().ambient);
  const key = `${resolvedSource}|${calibratedGain.toFixed(2)}`;
  const cached = ambientCache.get(key);
  if (cached) return cached;

  const howl = new Howl({ src: [resolvedSource], loop: true, volume: calibratedGain, preload: true, html5: false });
  ambientCache.set(key, howl);
  return howl;
};

const getUiHowl = (kind: keyof typeof UI_SOURCES): Howl => {
  const cached = uiCache.get(kind);
  if (cached) return cached;

  const howl = new Howl({ src: [UI_SOURCES[kind]], volume: 0.5, preload: true });
  uiCache.set(kind, howl);
  return howl;
};

export const gameAudio = {
  setScenarioMix(scenarioId: string | null): void {
    activeScenarioId = scenarioId;
  },

  setAmbient(src: string | null, gain = 0.2): void {
    if (!src) {
      this.stopAmbient();
      return;
    }

    const ambient = getAmbientHowl(src, gain);
    if (activeAmbient === ambient) return;

    if (activeAmbient?.playing()) activeAmbient.fade(activeAmbient.volume(), 0, 180);
    activeAmbient?.stop();
    activeAmbient = ambient;

    if (!activeAmbient.playing()) activeAmbient.play();
  },

  stopAmbient(): void {
    if (!activeAmbient) return;
    if (activeAmbient.playing()) activeAmbient.fade(activeAmbient.volume(), 0, 160);
    activeAmbient.stop();
    activeAmbient = null;
  },

  playImpact(profile: ImpactProfile): void {
    getImpactHowl(profile).play();
  },

  playUi(kind: keyof typeof UI_SOURCES): void {
    getUiHowl(kind).play();
  },
};
