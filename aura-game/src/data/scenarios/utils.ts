import type { Scenario, ScenarioMetadata } from '../../types/index.ts';
import { normalizeScenarioCopy } from '../copy.ts';
import { validateScenarioDefinition } from './validation.ts';

export type ScenarioSeed = Omit<Scenario, 'totalMaxValue' | 'metadata'> & {
  metadata: Omit<ScenarioMetadata, 'contentCompleteness'>;
};

const sumTargetValues = (targets: Scenario['targets']): number =>
  targets.reduce((total, target) => total + target.value, 0);


const DEFAULT_SCORING = {
  fallbackSampleValue: 5,
  defaultZoneMultiplier: 1,
  defaultCriticalModifier: 1,
  dadaistScore: 1917000001,
} as const;

const DEFAULT_CRITIC_LINES = {
  low: ['The critic is still taking notes.'],
  mid: ['The critic is still taking notes.'],
  high: ['The critic is still taking notes.'],
};

const isNormalizedPosition = ([x, y, z]: [number, number, number]): boolean =>
  x >= 0 && x <= 1 && y >= 0 && y <= 1 && z >= 0 && z <= 1;

const toWorldPosition = ([x, y, z]: [number, number, number]): [number, number, number] => [
  x * 25,
  y * 6 + 0.5,
  z * -20 - 3,
];

const normalizeTargetPosition = (targets: Scenario['targets']): Scenario['targets'] =>
  targets.map((target) => ({
    ...target,
    position: isNormalizedPosition(target.position) ? toWorldPosition(target.position) : target.position,
  }));

const OFFLINE_ASSET_PREFIXES = ['data:', '/', './', '../'] as const;


const EMBEDDED_AMBIENT_PREFIX = 'data:audio/x-aura-ambient,';

const VENUE_IMPACT_PROFILE_MAP = {
  museum: ['glass', 'stone', 'wood'],
  cathedral: ['stone', 'wood'],
  industrial: ['metal', 'stone'],
  vault: ['metal', 'stone'],
  library: ['wood', 'fabric'],
} as const;

type VenueType = keyof typeof VENUE_IMPACT_PROFILE_MAP;

const resolveAmbientVenue = (ambient: string): VenueType | null => {
  if (!ambient.startsWith(EMBEDDED_AMBIENT_PREFIX)) return null;
  const venue = ambient.slice(EMBEDDED_AMBIENT_PREFIX.length);
  return venue in VENUE_IMPACT_PROFILE_MAP ? (venue as VenueType) : null;
};

const ensureVenueImpactProfile = (
  ambient: string,
  impactProfile: 'stone' | 'metal' | 'glass' | 'wood' | 'fabric'
): void => {
  const venue = resolveAmbientVenue(ambient);
  if (!venue) return;

  const allowedProfiles = VENUE_IMPACT_PROFILE_MAP[venue] as readonly string[];
  if (!allowedProfiles.includes(impactProfile)) {
    throw new Error(
      `Impact profile ${impactProfile} does not match venue ${venue}. Allowed: ${allowedProfiles.join(', ')}`
    );
  }
};


const ensureOfflineAssetPath = (assetPath: string): string => {
  const isOfflinePath = OFFLINE_ASSET_PREFIXES.some((prefix) => assetPath.startsWith(prefix));

  if (!isOfflinePath) {
    throw new Error(`Asset path must resolve offline: ${assetPath}`);
  }

  return assetPath;
};

const createScenarioPanoramaAsset = (
  scenarioId: string,
  palette: { tint: string; tintStrength: number }
) => ({
  lowRes: ensureOfflineAssetPath(`/assets/panoramas/${scenarioId}.svg`),
  mediumRes: ensureOfflineAssetPath(`/assets/panoramas/${scenarioId}.svg`),
  highRes: ensureOfflineAssetPath(`/assets/panoramas/${scenarioId}.svg`),
  tint: palette.tint,
  tintStrength: palette.tintStrength,
});

const createScenarioAudioAsset = (
  ambient: string,
  impactProfile: 'stone' | 'metal' | 'glass' | 'wood' | 'fabric',
  ambientGain: number
) => {
  ensureVenueImpactProfile(ambient, impactProfile);

  return {
    ambient: ensureOfflineAssetPath(ambient),
    impactProfile,
    ambientGain,
  };
};

export const SCENARIO_ENVIRONMENT_ASSETS: Record<
  string,
  ReturnType<typeof createScenarioPanoramaAsset>
> = {
  louvre: createScenarioPanoramaAsset('louvre', {
    tint: '#fff4dc',
    tintStrength: 0.22,
  }),
  'st-peters': createScenarioPanoramaAsset('st-peters', {
    tint: '#f6efdf',
    tintStrength: 0.2,
  }),
  topkapi: createScenarioPanoramaAsset('topkapi', {
    tint: '#f8d29f',
    tintStrength: 0.25,
  }),
  'forbidden-city': createScenarioPanoramaAsset('forbidden-city', {
    tint: '#ffc8af',
    tintStrength: 0.26,
  }),
  tsmc: createScenarioPanoramaAsset('tsmc', {
    tint: '#e6fbff',
    tintStrength: 0.16,
  }),
  hermitage: createScenarioPanoramaAsset('hermitage', {
    tint: '#e5f5ff',
    tintStrength: 0.18,
  }),
  'federal-reserve': createScenarioPanoramaAsset('federal-reserve', {
    tint: '#fff7d0',
    tintStrength: 0.22,
  }),
  moma: createScenarioPanoramaAsset('moma', {
    tint: '#ffffff',
    tintStrength: 0.08,
  }),
  'borges-library': createScenarioPanoramaAsset('borges-library', {
    tint: '#f6d1a1',
    tintStrength: 0.2,
  }),
};

export const SCENARIO_AUDIO_ASSETS = {
  louvre: createScenarioAudioAsset('data:audio/x-aura-ambient,museum', 'glass', 0.2),
  'st-peters': createScenarioAudioAsset('data:audio/x-aura-ambient,cathedral', 'stone', 0.26),
  topkapi: createScenarioAudioAsset('data:audio/x-aura-ambient,museum', 'stone', 0.22),
  'forbidden-city': createScenarioAudioAsset('data:audio/x-aura-ambient,cathedral', 'wood', 0.2),
  tsmc: createScenarioAudioAsset('data:audio/x-aura-ambient,industrial', 'metal', 0.18),
  hermitage: createScenarioAudioAsset('data:audio/x-aura-ambient,museum', 'stone', 0.21),
  'federal-reserve': createScenarioAudioAsset('data:audio/x-aura-ambient,vault', 'metal', 0.24),
  moma: createScenarioAudioAsset('data:audio/x-aura-ambient,museum', 'glass', 0.18),
  'borges-library': createScenarioAudioAsset('data:audio/x-aura-ambient,library', 'wood', 0.24),
} as const;

export const createScenario = (scenario: ScenarioSeed): Scenario => {
  const normalizedScenario = normalizeScenarioCopy(scenario);
  const targets = normalizeTargetPosition(normalizedScenario.targets);

  const scenarioWithCompleteness: Scenario = {
    ...normalizedScenario,
    scoring: normalizedScenario.scoring ?? DEFAULT_SCORING,
    criticLines: normalizedScenario.criticLines ?? DEFAULT_CRITIC_LINES,
    targets,
    totalMaxValue: sumTargetValues(targets),
    metadata: {
      ...normalizedScenario.metadata,
      contentCompleteness: validateScenarioDefinition(normalizedScenario).completeness,
    },
  };

  const validation = validateScenarioDefinition(scenarioWithCompleteness);
  if (validation.errors.length > 0) {
    throw new Error(`Scenario ${scenario.id} failed validation: ${validation.errors.join('; ')}`);
  }

  return scenarioWithCompleteness;
};
