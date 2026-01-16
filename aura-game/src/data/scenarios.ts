import type { Scenario } from '@/types';

export const SCENARIOS: Record<string, Scenario> = {
  louvre: {
    id: 'louvre',
    name: 'The Louvre - Salle des États',
    description: 'Paris, France. One shot to maximize cultural damage in the most visited museum.',
    panoramaColor: '#d4a574',
    targets: [
      {
        id: 'mona-lisa',
        name: 'Mona Lisa',
        value: 800000000,
        position: [0, 0.2, 0],
        radius: 0.15,
        type: 'masterpiece',
        material: 'oil-on-wood',
        description: 'Leonardo da Vinci\'s most famous painting, behind bulletproof glass.',
      },
      {
        id: 'wedding-at-cana',
        name: 'Wedding at Cana',
        value: 300000000,
        position: [-0.3, 0, 0.2],
        radius: 0.25,
        type: 'masterpiece',
        material: 'oil-on-canvas',
        description: 'Veronese\'s massive canvas of biblical abundance.',
      },
      {
        id: 'venus-de-milo',
        name: 'Venus de Milo',
        value: 150000000,
        position: [0.3, -0.1, -0.1],
        radius: 0.12,
        type: 'sculpture',
        material: 'marble',
        description: 'Ancient Greek statue of the goddess of love.',
      },
      {
        id: 'winged-victory',
        name: 'Winged Victory',
        value: 140000000,
        position: [0.25, 0.15, -0.2],
        radius: 0.15,
        type: 'sculpture',
        material: 'marble',
        description: 'Nike of Samothrace, symbol of triumph.',
      },
      {
        id: 'fire-sensor',
        name: 'Fire Suppression Sensor',
        value: 200,
        position: [0, 0.5, 0],
        radius: 0.05,
        type: 'easter-egg-systemic',
        description: 'Hitting this triggers the sprinkler system, destroying all paintings.',
      },
      {
        id: 'mop-bucket',
        name: 'Mop Bucket (Duchamp\'s Ready-made)',
        value: 15,
        position: [0.4, -0.3, 0.3],
        radius: 0.08,
        type: 'easter-egg-dadaist',
        description: 'An ordinary mop bucket. But is it art? Is value arbitrary?',
      },
    ],
    totalMaxValue: 3500000000,
  },
};

export const getScenario = (id: string): Scenario | undefined => {
  return SCENARIOS[id];
};

export const getScenariosList = (): Scenario[] => {
  return Object.values(SCENARIOS);
};
