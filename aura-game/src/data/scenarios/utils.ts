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

const ensureOfflineAssetPath = (assetPath: string): string => {
  const isOfflinePath = OFFLINE_ASSET_PREFIXES.some((prefix) => assetPath.startsWith(prefix));

  if (!isOfflinePath) {
    throw new Error(`Asset path must resolve offline: ${assetPath}`);
  }

  return assetPath;
};

const toPanoramaDataUri = (
  scenarioId: string,
  palette: { sky: string; wall: string; accent: string },
  detailLevel: 'low' | 'high'
): string => {
  const stripeCount = detailLevel === 'high' ? 40 : 20;
  const lineCount = detailLevel === 'high' ? 80 : 28;

  const stripes = Array.from({ length: stripeCount }, (_, index) => {
    const x = (index / stripeCount) * 100;
    const width = detailLevel === 'high' ? 1.5 : 2.8;
    const opacity = detailLevel === 'high' ? 0.17 : 0.11;
    return `<rect x='${x}' y='26' width='${width}' height='54' fill='${palette.accent}' opacity='${opacity}' />`;
  }).join('');

  const lines = Array.from({ length: lineCount }, (_, index) => {
    const y = 25 + index * (55 / lineCount);
    const opacity = detailLevel === 'high' ? 0.07 : 0.045;
    return `<line x1='0' y1='${y}' x2='100' y2='${y}' stroke='${palette.accent}' stroke-opacity='${opacity}' stroke-width='0.22' />`;
  }).join('');

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50' preserveAspectRatio='none'>
      <defs>
        <linearGradient id='g-${scenarioId}' x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stop-color='${palette.sky}' />
          <stop offset='55%' stop-color='${palette.wall}' />
          <stop offset='100%' stop-color='${palette.accent}' />
        </linearGradient>
      </defs>
      <rect width='100' height='50' fill='url(#g-${scenarioId})' />
      <ellipse cx='50' cy='27' rx='58' ry='20' fill='${palette.wall}' opacity='0.22' />
      ${stripes}
      ${lines}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const createScenarioPanoramaAsset = (
  scenarioId: string,
  palette: { sky: string; wall: string; accent: string; tint: string; tintStrength: number }
) => ({
  lowRes: ensureOfflineAssetPath(toPanoramaDataUri(scenarioId, palette, 'low')),
  mediumRes: ensureOfflineAssetPath(toPanoramaDataUri(scenarioId, palette, 'high')),
  highRes: ensureOfflineAssetPath(toPanoramaDataUri(scenarioId, palette, 'high')),
  tint: palette.tint,
  tintStrength: palette.tintStrength,
});

export const SCENARIO_ENVIRONMENT_ASSETS: Record<
  string,
  ReturnType<typeof createScenarioPanoramaAsset>
> = {
  louvre: createScenarioPanoramaAsset('louvre', {
    sky: '#f2d8b2',
    wall: '#c99564',
    accent: '#825735',
    tint: '#fff4dc',
    tintStrength: 0.22,
  }),
  'st-peters': createScenarioPanoramaAsset('st-peters', {
    sky: '#efe2cd',
    wall: '#ceb898',
    accent: '#8f7a5f',
    tint: '#f6efdf',
    tintStrength: 0.2,
  }),
  topkapi: createScenarioPanoramaAsset('topkapi', {
    sky: '#5a4332',
    wall: '#7d5b43',
    accent: '#2f2117',
    tint: '#f8d29f',
    tintStrength: 0.25,
  }),
  'forbidden-city': createScenarioPanoramaAsset('forbidden-city', {
    sky: '#cf5757',
    wall: '#a11c1c',
    accent: '#560f0f',
    tint: '#ffc8af',
    tintStrength: 0.26,
  }),
  tsmc: createScenarioPanoramaAsset('tsmc', {
    sky: '#ecedd8',
    wall: '#bec1b0',
    accent: '#66798a',
    tint: '#e6fbff',
    tintStrength: 0.16,
  }),
  hermitage: createScenarioPanoramaAsset('hermitage', {
    sky: '#d3e8f6',
    wall: '#a9c8de',
    accent: '#5d778a',
    tint: '#e5f5ff',
    tintStrength: 0.18,
  }),
  'federal-reserve': createScenarioPanoramaAsset('federal-reserve', {
    sky: '#ddcda0',
    wall: '#9f8b58',
    accent: '#584927',
    tint: '#fff7d0',
    tintStrength: 0.22,
  }),
  moma: createScenarioPanoramaAsset('moma', {
    sky: '#fdfdfd',
    wall: '#ebebeb',
    accent: '#919191',
    tint: '#ffffff',
    tintStrength: 0.08,
  }),
  'borges-library': createScenarioPanoramaAsset('borges-library', {
    sky: '#d8b98f',
    wall: '#b48a5a',
    accent: '#513521',
    tint: '#f6d1a1',
    tintStrength: 0.2,
  }),
};

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
