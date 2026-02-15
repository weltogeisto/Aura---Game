import type { ScenarioSeed } from './utils.ts';
import { SCENARIO_ENVIRONMENT_ASSETS } from './utils.ts';

const LOUVRE_SCORING = {
  fallbackSampleValue: 5,
  defaultZoneMultiplier: 1.2,
  defaultCriticalModifier: 1.5,
  dadaistScore: 1917000001,
} as const;

export const LOUVRE_SCENARIO: ScenarioSeed = {
    id: 'louvre',
    name: 'The Louvre - Salle des États',
    description: 'Paris, France. One shot to maximize cultural damage in the most visited museum.',
    panoramaAsset: SCENARIO_ENVIRONMENT_ASSETS.louvre,
    colorGrading: {
      tint: SCENARIO_ENVIRONMENT_ASSETS.louvre.tint,
      tintStrength: SCENARIO_ENVIRONMENT_ASSETS.louvre.tintStrength,
    },
    panoramaColor: '#d4a574',
    scoring: LOUVRE_SCORING,
    targets: [
      {
        id: 'mona-lisa',
        name: 'Mona Lisa',
        value: 800000000,
        position: [1.5, 3.5, -11],
        radius: 1.2,
        type: 'masterpiece',
        material: 'oil-on-wood',
        description: 'Leonardo da Vinci\'s most famous painting, behind bulletproof glass.',
        zoneMultiplier: LOUVRE_SCORING.defaultZoneMultiplier,
        criticalModifier: LOUVRE_SCORING.defaultCriticalModifier,
      },
      {
        id: 'wedding-at-cana',
        name: 'Wedding at Cana',
        value: 300000000,
        position: [-6, 2.5, -11.5],
        radius: 2.5,
        type: 'masterpiece',
        material: 'oil-on-canvas',
        description: 'Veronese\'s massive canvas of biblical abundance.',
      },
      {
        id: 'venus-de-milo',
        name: 'Venus de Milo',
        value: 150000000,
        position: [5, 0.5, -8],
        radius: 1.0,
        type: 'sculpture',
        material: 'marble',
        description: 'Ancient Greek statue of the goddess of love.',
      },
      {
        id: 'winged-victory',
        name: 'Winged Victory',
        value: 140000000,
        position: [4, 2, -6],
        radius: 1.2,
        type: 'sculpture',
        material: 'marble',
        description: 'Nike of Samothrace, symbol of triumph.',
      },
      {
        id: 'fire-sensor',
        name: 'Fire Suppression Sensor',
        value: 200,
        position: [0, 7, -10],
        radius: 0.4,
        type: 'easter-egg-systemic',
        description: 'Hitting this triggers the sprinkler system, destroying all paintings.',
        specialEffects: [
          'Fire suppression system activated!',
          'All paintings destroyed by water damage.',
          'Total cultural damage: €3.5 Billion',
        ],
        overrideTotalDamage: 1390000215,
        breakdownMode: 'masterpieces-and-sculptures',
      },
      {
        id: 'louvre-hidden-dadaist-target',
        name: 'Mop Bucket (Duchamp\'s Ready-made)',
        value: 15,
        position: [8.6, -0.75, -13.2],
        radius: 0.7,
        type: 'easter-egg-dadaist',
        description: 'A nearly invisible mop bucket hidden in the Louvre shadows. Tagged as a Dadaist target for explicit hit detection.',
        specialEffects: [
          'DUCHAMP MODE ACTIVATED',
          'Deterministic critic pivot: anti-value receives premium valuation.',
        ],
        overrideTotalDamage: 0,
        breakdownMode: 'none',
        zoneMultiplier: 0,
        criticalModifier: 1,
      },
    ],
    criticLines: {
      low: [
        'A whisper of damage. The Louvre barely notices the breeze.',
        'A timid graze. History yawns and turns the page.',
      ],
      mid: [
        'Respectable damage—enough to make the curators flinch.',
        'A clean strike. The gallery will remember this silence.',
      ],
      high: [
        'Catastrophic. The canon reels beneath the blow.',
        'Devastation worthy of a manifesto. The walls will never forget.',
      ],
    },
  
  metadata: {
    region: 'France',
    difficulty: 'easy',
    status: 'playable',
  },};
