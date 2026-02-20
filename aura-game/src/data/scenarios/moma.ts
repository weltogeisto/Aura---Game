import type { ScenarioSeed } from './utils.ts';
import { SCENARIO_ENVIRONMENT_ASSETS } from './utils.ts';

export const MOMA_SCENARIO: ScenarioSeed = {
    id: 'moma',
    name: 'MoMA - Contemporary Gallery',
    description: 'New York, USA. Modern art where destruction becomes creation.',
    panoramaAsset: SCENARIO_ENVIRONMENT_ASSETS.moma,
    colorGrading: {
      tint: SCENARIO_ENVIRONMENT_ASSETS.moma.tint,
      tintStrength: SCENARIO_ENVIRONMENT_ASSETS.moma.tintStrength,
    },
    panoramaColor: '#f5f5f5',
    targets: [
      {
        id: 'abstract-painting',
        name: 'Abstract Painting',
        value: 50000000,
        position: [2, 3, -10],
        radius: 1.8,
        type: 'masterpiece',
        material: 'oil-on-canvas',
        description: 'High-value abstraction with speculative pricing.',
      },
      {
        id: 'minimalist-sculpture',
        name: 'Minimalist Sculpture',
        value: 20000000,
        position: [-3, 0, -9],
        radius: 1.4,
        type: 'sculpture',
        material: 'steel',
        description: 'A geometric form that may be a bench.',
      },
      {
        id: 'conceptual-installation',
        name: 'Conceptual Installation',
        value: 10000000,
        position: [4, 1.5, -7.5],
        radius: 1.6,
        type: 'other',
        material: 'mixed-media',
        description: 'An installation that might not be visible.',
      },
      {
        id: 'blank-canvas',
        name: 'Blank White Canvas',
        value: 500000,
        position: [-5, 2.5, -8],
        radius: 1.4,
        type: 'easter-egg-dadaist',
        material: 'canvas',
        description: 'Shooting it turns you into the collaborator.',
        specialEffects: [
          'Authorship crisis declared.',
          'The act itself becomes the artwork.',
        ],
        overrideTotalDamage: 50000000,
        breakdownMode: 'none',
      },
      {
        id: 'fire-alarm',
        name: 'Fire Alarm Pull',
        value: 200,
        position: [5.5, -0.4, -6],
        radius: 0.5,
        type: 'easter-egg-systemic',
        description: 'Triggers a "happening" that inflates provenance.',
        specialEffects: [
          'Happening initiated.',
          'Provenance spikes across the gallery.',
        ],
        overrideTotalDamage: 50000000,
        breakdownMode: 'all-targets',
      },
      {
        id: 'empty-plinth',
        name: 'Empty Plinth',
        value: 0,
        position: [1, -0.5, -8],
        radius: 0.9,
        type: 'other',
        material: 'stone',
        description: 'It might be the artwork itself.',
      },
      {
        id: 'exit-sign',
        name: 'Exit Sign',
        value: 50,
        position: [-6, 4.5, -5],
        radius: 0.5,
        type: 'other',
        material: 'plastic',
        description: 'Definitely not art. Probably.',
      },
    ],
  
  scoring: {
    fallbackSampleValue: 5,
    defaultZoneMultiplier: 1.15,
    defaultCriticalModifier: 1.2,
    dadaistScore: 1917000001,
  },

  criticLines: {
    low: [
      'Empty plinth. The gallery insures the absence at a considerable premium.',
      'Institutional white. The bullet leaves a mark the curators already planned for.',
      'The exit sign is not part of the collection. The insurance adjuster will verify this.',
    ],
    mid: [
      'The sculpture was ambiguous. The damage makes it more so.',
      'Destruction as collaboration. The artist would not be entirely displeased.',
      'Conceptual form encounters material consequence. The irony holds its own.',
    ],
    high: [
      'Abstract painting: resolved. The ambiguity survived the bullet; the canvas did not.',
      'Fifty million dollars of speculation, disturbed. The market will reassess by Friday.',
      'High-value abstraction meets low-velocity argument. The provenance remains intact.',
    ],
  },

  metadata: {
    region: 'USA',
    difficulty: 'medium',
    status: 'playable',
  },};
