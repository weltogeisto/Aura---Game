import type { ScenarioSeed } from './utils.ts';
import { SCENARIO_ENVIRONMENT_ASSETS } from './utils.ts';

export const TSMC_SCENARIO: ScenarioSeed = {
    id: 'tsmc',
    name: 'TSMC Clean Room - Fab 18',
    description: 'Tainan, Taiwan. Technological value balanced on a dust particle.',
    panoramaAsset: SCENARIO_ENVIRONMENT_ASSETS.tsmc,
    colorGrading: {
      tint: SCENARIO_ENVIRONMENT_ASSETS.tsmc.tint,
      tintStrength: SCENARIO_ENVIRONMENT_ASSETS.tsmc.tintStrength,
    },
    panoramaColor: '#d6d2a9',
    targets: [
      {
        id: 'euv-machine',
        name: 'ASML EUV Machine',
        value: 150000000,
        position: [1, 2.5, -10],
        radius: 2.2,
        type: 'other',
        material: 'steel',
        description: 'Lithography machine with the flattest mirrors on Earth.',
      },
      {
        id: 'zeiss-lens',
        name: 'Zeiss Lens Assembly',
        value: 50000000,
        position: [-3, 1.8, -9.5],
        radius: 0.9,
        type: 'masterpiece',
        material: 'optical-glass',
        description: 'Precision optics nested inside the machine housing.',
      },
      {
        id: 'wafer-carrier',
        name: 'Loaded Wafer Carrier',
        value: 10000000,
        position: [4, 0, -9],
        radius: 1.0,
        type: 'other',
        material: 'silicon',
        description: 'A pod containing thousands of processors.',
      },
      {
        id: 'cleanroom-glass',
        name: 'Clean Room Glass Partition',
        value: 100000,
        position: [-5, 1.5, -8],
        radius: 2.0,
        type: 'other',
        material: 'glass',
        description: 'Refraction puzzle between rooms.',
      },
      {
        id: 'oht-robot-arm',
        name: 'OHT Robot Arm',
        value: 5000000,
        position: [5, 4, -7],
        radius: 0.9,
        type: 'other',
        material: 'composite',
        description: 'Moving overhead transport arm.',
      },
      {
        id: 'dust-filter',
        name: 'Dust Filter Intake',
        value: 500,
        position: [-6, 5.5, -6],
        radius: 0.5,
        type: 'easter-egg-systemic',
        description: 'A tiny filter that can contaminate an entire fab.',
        specialEffects: [
          'Particle storm unleashed.',
          'Yield crash ripples through the fab.',
          'Global supply chain freezes.',
        ],
        overrideTotalDamage: 10000000000,
        breakdownMode: 'all-targets',
      },
      {
        id: 'wooden-chair',
        name: 'Wooden Chair',
        value: 45,
        position: [2, -0.5, -5.5],
        radius: 0.7,
        type: 'easter-egg-dadaist',
        description: 'An illegal seat in the temple of productivity.',
        specialEffects: [
          'Forbidden rest embraced.',
          'Productivity myth dissolves.',
        ],
        overrideTotalDamage: 0,
        breakdownMode: 'none',
      },
    ],
  
  scoring: {
    fallbackSampleValue: 6,
    defaultZoneMultiplier: 1.0,
    defaultCriticalModifier: 1.6,
    dadaistScore: 1917000001,
  },

  criticLines: {
    low: [
      'Glass partition. The particle count shifts. The yield does not recover for weeks.',
      'Silicon does not forgive contamination. The cascade begins at the molecular level.',
      'A small disruption. The supply chain will locate the source of its anxiety later.',
    ],
    mid: [
      'The optics are gone. The lead time for replacement: six to eight months.',
      'Clean room integrity: compromised. Somewhere, a smartphone misses its deadline.',
      'Precision requires conditions. The conditions are no longer what they were.',
    ],
    high: [
      'The EUV machine. The flattest mirrors on Earth, now redistributed across the floor.',
      'Thirty billion dollars of production capacity. The bullet cost considerably less.',
      'The atoms were always tungsten. The confidence was always misplaced.',
    ],
  },

  metadata: {
    region: 'Taiwan',
    difficulty: 'hard',
    status: 'playable',
  },};
