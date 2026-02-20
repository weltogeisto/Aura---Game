import { Howl } from 'howler';
import { EMBEDDED_AUDIO } from './embeddedAudio';

export type ImpactProfile = 'stone' | 'metal' | 'glass' | 'wood' | 'fabric';

const IMPACT_SOURCES: Record<ImpactProfile, string> = {
  stone: EMBEDDED_AUDIO['impact-stone'],
  metal: EMBEDDED_AUDIO['impact-metal'],
  glass: EMBEDDED_AUDIO['impact-glass'],
  wood: EMBEDDED_AUDIO['impact-wood'],
  fabric: EMBEDDED_AUDIO['impact-fabric'],
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

const impactCache = new Map<ImpactProfile, Howl>();
const ambientCache = new Map<string, Howl>();
const uiCache = new Map<keyof typeof UI_SOURCES, Howl>();

let activeAmbient: Howl | null = null;

const getImpactHowl = (profile: ImpactProfile): Howl => {
  const cached = impactCache.get(profile);
  if (cached) return cached;

  const howl = new Howl({ src: [IMPACT_SOURCES[profile]], volume: 0.62, preload: true });
  impactCache.set(profile, howl);
  return howl;
};

const getAmbientHowl = (src: string, gain: number): Howl => {
  const resolvedSource = resolveAmbientSource(src);
  const key = `${resolvedSource}|${gain.toFixed(2)}`;
  const cached = ambientCache.get(key);
  if (cached) return cached;

  const howl = new Howl({ src: [resolvedSource], loop: true, volume: gain, preload: true, html5: false });
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
