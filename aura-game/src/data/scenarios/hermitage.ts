import type { ScenarioSeed } from './utils.ts';
import { SCENARIO_ENVIRONMENT_ASSETS } from './utils.ts';

const HERMITAGE_SCORING = {
  fallbackSampleValue: 5,
  defaultZoneMultiplier: 1.18,
  defaultCriticalModifier: 1.35,
  dadaistScore: 1917000001,
} as const;

export const HERMITAGE_SCENARIO: ScenarioSeed = {
    id: 'hermitage',
    name: 'The Hermitage - Peacock Clock Room',
    description: 'St. Petersburg, Russia. Mechanical complexity and political economy.',
    panoramaAsset: SCENARIO_ENVIRONMENT_ASSETS.hermitage,
    colorGrading: {
      tint: SCENARIO_ENVIRONMENT_ASSETS.hermitage.tint,
      tintStrength: SCENARIO_ENVIRONMENT_ASSETS.hermitage.tintStrength,
    },
    panoramaColor: '#b1c6d6',
    scoring: HERMITAGE_SCORING,
    targets: [
      {
        id: 'peacock-clock',
        name: 'Peacock Clock',
        value: 30000000,
        position: [1, 2, -10.5],
        radius: 1.5,
        type: 'masterpiece',
        material: 'gilded-brass',
        description: '18th-century automaton with delicate gears.',
      },
      {
        id: 'crystal-chandelier',
        name: 'Crystal Chandelier',
        value: 5000000,
        position: [-2, 6, -8],
        radius: 1.2,
        type: 'sculpture',
        material: 'crystal',
        description: 'Shatter-prone chandelier glittering above.',
      },
      {
        id: 'mosaic-table',
        name: 'Florentine Mosaic Table',
        value: 15000000,
        position: [4.5, 0, -9],
        radius: 1.4,
        type: 'other',
        material: 'stone-inlay',
        description: 'Stone inlay table with high craftsmanship value.',
      },
      {
        id: 'gilded-column',
        name: 'Gilded Column',
        value: 2000000,
        position: [-5, 2, -7.5],
        radius: 1.8,
        type: 'other',
        material: 'gold-leaf',
        description: 'Decorative column with minimal structural consequence.',
      },
      {
        id: 'parquet-floor',
        name: 'Parquet Floor',
        value: 500000,
        position: [0, -0.6, -9.5],
        radius: 2.0,
        type: 'other',
        material: 'wood',
        description: 'Highly polished parquet flooring.',
      },
      {
        id: 'putin-portrait',
        name: 'Putin Portrait',
        value: 100,
        position: [-3, -0.6, -6],
        radius: 0.5,
        type: 'easter-egg-dadaist',
        description: 'A tiny portrait that revalues everything into oligarch prices.',
        specialEffects: [
          'Oligarch revaluation triggered.',
          'Every artifact suddenly appreciates.',
        ],
        overrideTotalDamage: 50000000,
        breakdownMode: 'none',
      },
      {
        id: 'chandelier-chain',
        name: 'Chandelier Chain',
        value: 50,
        position: [2.5, 7, -5],
        radius: 0.4,
        type: 'easter-egg-systemic',
        description: 'A fragile chain that drops the chandelier.',
        specialEffects: [
          'Chain snapped.',
          'The chandelier crashes through the room.',
        ],
        overrideTotalDamage: 50000000,
        breakdownMode: 'all-targets',
      },
    ],

  criticLines: {
    low: [
      'A polite disturbance in imperial ornament. The parquet absorbs the insult.',
      'The room sighs, but the court etiquette still holds.',
      'Minor damage, major gossip. Conservators log it as a manageable scandal.',
    ],
    mid: [
      'Mechanism and monarchy both take a hit. The symbolism starts to wobble.',
      'A calibrated strike: enough ruin to summon emergency committees.',
      'Gold leaf flakes like confidence. The hall feels suddenly mortal.',
    ],
    high: [
      'The Peacock Clock goes from marvel to autopsy. History loses its rhythm.',
      'Catastrophic impact: splendor collapses into expensive fragments.',
      'Imperial theater, interrupted by force. Restoration becomes an era-long project.',
    ],
  },
  
  metadata: {
    region: 'Russia',
    difficulty: 'medium',
    status: 'playable',
  },};
