import type { ScenarioSeed } from './utils.ts';
import { SCENARIO_ENVIRONMENT_ASSETS } from './utils.ts';

export const ST_PETERS_SCENARIO: ScenarioSeed = {
    id: 'st-peters',
    name: "St. Peter's Basilica - Nave",
    description: 'Vatican City. Sacred architecture where atmosphere outvalues material.',
    panoramaAsset: SCENARIO_ENVIRONMENT_ASSETS['st-peters'],
    colorGrading: {
      tint: SCENARIO_ENVIRONMENT_ASSETS['st-peters'].tint,
      tintStrength: SCENARIO_ENVIRONMENT_ASSETS['st-peters'].tintStrength,
    },
    panoramaColor: '#cbb89a',
    targets: [
      {
        id: 'pieta',
        name: 'The Pietà',
        value: 1000000000,
        position: [2, 2.5, -11],
        radius: 1.4,
        type: 'sculpture',
        material: 'marble',
        description: 'Michelangelo\'s sculpture behind protective glass.',
      },
      {
        id: 'baldachin',
        name: 'Bernini Baldachin',
        value: 500000000,
        position: [-3, 3.5, -10],
        radius: 2.0,
        type: 'sculpture',
        material: 'bronze',
        description: 'Monumental bronze canopy over the papal altar.',
      },
      {
        id: 'st-peters-chair',
        name: "St. Peter's Chair",
        value: 200000000,
        position: [4, 2, -8],
        radius: 1.6,
        type: 'sculpture',
        material: 'gilded-bronze',
        description: 'The Cathedra Petri, gilded and elevated.',
      },
      {
        id: 'mosaic-floor',
        name: 'Cosmati Mosaic Floor',
        value: 2000000,
        position: [-1, -0.5, -9],
        radius: 1.8,
        type: 'other',
        material: 'stone',
        description: 'Intricate marble inlay with centuries of foot traffic.',
      },
      {
        id: 'marble-column',
        name: 'Marble Column',
        value: 10000000,
        position: [-6, 2, -7],
        radius: 1.5,
        type: 'other',
        material: 'marble',
        description: 'Massive structural column with minimal damage payoff.',
      },
      {
        id: 'pipe-organ-bellows',
        name: 'Pipe Organ Bellows',
        value: 5000,
        position: [6, 5, -6],
        radius: 0.6,
        type: 'easter-egg-systemic',
        description: 'Hidden bellows trigger a shockwave through stained glass.',
        specialEffects: [
          'Organ shockwave unleashed.',
          'Stained glass fractures across the nave.',
          'Sacred atmosphere collapses into rubble.',
        ],
        overrideTotalDamage: 1000000000,
        breakdownMode: 'all-targets',
      },
      {
        id: 'dan-brown-novel',
        name: 'Dan Brown Novel',
        value: 12,
        position: [2, -0.6, -5],
        radius: 0.3,
        type: 'easter-egg-dadaist',
        description: 'A paperback conspiracy that manufactures value from myth.',
        specialEffects: [
          'Myth machine engaged.',
          'Conspiracy fiction inflates devotional value.',
        ],
        overrideTotalDamage: 500000000,
        breakdownMode: 'none',
      },
    ],
  
  scoring: {
    fallbackSampleValue: 10,
    defaultZoneMultiplier: 1.1,
    defaultCriticalModifier: 1.4,
    dadaistScore: 1917000001,
  },

  criticLines: {
    low: [
      'Stone. Centuries of compression, briefly interrupted.',
      'The faithful have endured worse. This registers as weather.',
      'Masonry absorbs the impact. The liturgy absorbs the rest.',
    ],
    mid: [
      'The bronze holds. The symbolism does not.',
      'Consecrated space. The air still hums with something other than fear.',
      'Conservation will be expensive. The institution will survive.',
    ],
    high: [
      'The Pietà knew suffering. It knew it abstractly. Now it is acquainted.',
      'Bernini understood force. This is force he did not anticipate.',
      'Two thousand years of institutional memory. A hole in it now.',
    ],
  },

  metadata: {
    region: 'Vatican City',
    difficulty: 'medium',
    status: 'playable',
  },};
