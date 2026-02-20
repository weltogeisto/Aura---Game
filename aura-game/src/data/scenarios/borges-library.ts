import type { ScenarioSeed } from './utils.ts';
import { SCENARIO_ENVIRONMENT_ASSETS } from './utils.ts';

export const BORGES_LIBRARY_SCENARIO: ScenarioSeed = {
    id: 'borges-library',
    name: 'The Borges Library - Canon Room',
    description: 'Impossible hexagonal chamber where ideas outweigh objects.',
    panoramaAsset: SCENARIO_ENVIRONMENT_ASSETS['borges-library'],
    colorGrading: {
      tint: SCENARIO_ENVIRONMENT_ASSETS['borges-library'].tint,
      tintStrength: SCENARIO_ENVIRONMENT_ASSETS['borges-library'].tintStrength,
    },
    panoramaColor: '#b48a5a',
    targets: [
      {
        id: 'gutenberg-bible',
        name: 'Gutenberg Bible',
        value: 0,
        position: [1, 2, -10],
        radius: 1.0,
        type: 'masterpiece',
        material: 'paper',
        description: 'Five billion copies make this one worthless.',
      },
      {
        id: 'critique-of-pure-reason',
        name: 'Critique of Pure Reason',
        value: 0,
        position: [-2, 2.5, -9.5],
        radius: 0.9,
        type: 'masterpiece',
        material: 'paper',
        description: 'Ideas already loose in the world.',
      },
      {
        id: 'das-kapital',
        name: 'Das Kapital',
        value: 0,
        position: [3.5, 1.5, -9],
        radius: 0.9,
        type: 'masterpiece',
        material: 'paper',
        description: 'The commodity form survives even the bullet.',
      },
      {
        id: 'stirner',
        name: "Stirner's The Ego and Its Own",
        value: 1000000000000,
        position: [-1, 0.5, -10.5],
        radius: 0.7,
        type: 'masterpiece',
        material: 'paper',
        description: 'The hidden book worth infinity.',
      },
      {
        id: 'blank-journal',
        name: 'Blank Journal',
        value: 1000000000000,
        position: [5.5, -0.3, -8],
        radius: 0.7,
        type: 'easter-egg-dadaist',
        material: 'paper',
        description: 'The unwritten book worth a trillion futures.',
        specialEffects: [
          'Infinite authorship unlocked.',
          'Every unwritten future collapses into value.',
        ],
        overrideTotalDamage: 1000000000000,
        breakdownMode: 'none',
      },
      {
        id: 'library-ethernet',
        name: 'Ethernet Cable',
        value: 500000000000,
        position: [4.5, -0.5, -6],
        radius: 0.4,
        type: 'easter-egg-systemic',
        description: 'Cuts the desire-mining algorithm.',
        specialEffects: [
          'Desire-mining algorithm terminated.',
          'The catalog dissolves into entropy.',
        ],
        overrideTotalDamage: 1000000000000,
        breakdownMode: 'all-targets',
      },
    ],
  
  scoring: {
    fallbackSampleValue: 5,
    defaultZoneMultiplier: 1.0,
    defaultCriticalModifier: 1.0,
    dadaistScore: 1917000001,
  },

  criticLines: {
    low: [
      'The commodity form survives the bullet. It was printed in five billion copies.',
      'Ideas already loose in the world. The book was the last thing holding them.',
      'Paper absorbs kinetic energy with characteristic humility.',
    ],
    mid: [
      'The catalog does not update. It never did.',
      'An argument, interrupted mid-sentence. The sentence continues elsewhere.',
      'The idea outlives the medium. This was known. It remains known.',
    ],
    high: [
      'Stirner. The book was waiting for someone who understood the gesture.',
      'A trillion-dollar premise, struck. The argument was never in the binding.',
      'The library has no outside. The shot has not left.',
    ],
  },

  metadata: {
    region: 'Impossible Archive',
    difficulty: 'hard',
    status: 'playable',
  },};
