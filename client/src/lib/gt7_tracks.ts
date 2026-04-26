import type { TuningSetup } from './gt7_physics';

export type TrackType = 'street' | 'oval' | 'technical' | 'mixed' | 'rally' | 'real';
export type TrackDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TrackLayout {
  id: string;
  name: string;
  length: number;
  corners: number;
}

export interface TrackCircuit {
  id: string;
  name: string;
  type: TrackType;
  difficulty: TrackDifficulty;
  length: number;
  corners: number;
  straights: number;
  elevation: number;
  characteristics: string[];
  layouts?: TrackLayout[];
  tuningPresets: {
    aggressive: Partial<TuningSetup>;
    balanced: Partial<TuningSetup>;
    conservative: Partial<TuningSetup>;
  };
  tips: string[];
}

export interface TrackRegion {
  name: string;
  locations: {
    name: string;
    circuits: TrackCircuit[];
  }[];
}

const DEFAULT_SUSPENSION = {
  aggressive: {
    rideHeightFront: 80,
    rideHeightRear: 85,
    naturalFrequencyFront: 3.2,
    naturalFrequencyRear: 3.2,
    damperExpansionFront: 8,
    damperExpansionRear: 8,
    damperCompressionFront: 7,
    damperCompressionRear: 7,
    toeInFront: -0.10,
    toeInRear: 0.20,
  },
  balanced: {
    rideHeightFront: 100,
    rideHeightRear: 100,
    naturalFrequencyFront: 2.5,
    naturalFrequencyRear: 2.5,
    damperExpansionFront: 5,
    damperExpansionRear: 5,
    damperCompressionFront: 5,
    damperCompressionRear: 5,
    toeInFront: 0.00,
    toeInRear: 0.15,
  },
  conservative: {
    rideHeightFront: 120,
    rideHeightRear: 125,
    naturalFrequencyFront: 1.8,
    naturalFrequencyRear: 1.8,
    damperExpansionFront: 4,
    damperExpansionRear: 4,
    damperCompressionFront: 3,
    damperCompressionRear: 3,
    toeInFront: 0.05,
    toeInRear: 0.10,
  }
};

export const TRACK_REGIONS: TrackRegion[] = [
  {
    name: 'Europe',
    locations: [
      {
        name: 'Germany',
        circuits: [
          {
            id: 'nurburgring',
            name: 'Nürburgring',
            type: 'real',
            difficulty: 'expert',
            length: 25.37,
            corners: 170,
            straights: 10,
            elevation: 300,
            characteristics: ['long', 'narrow', 'bumpy'],
            layouts: [
              { id: 'nurb-24h', name: '24h Layout', length: 25.37, corners: 170 },
              { id: 'nurb-nords', name: 'Nordschleife', length: 20.83, corners: 154 },
              { id: 'nurb-gp', name: 'Grand Prix', length: 5.15, corners: 15 }
            ],
            tuningPresets: {
              aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 220, downforceRear: 300 },
              balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 180, downforceRear: 240 },
              conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 140, downforceRear: 180 },
            },
            tips: ['Focus on suspension travel for bumps']
          }
        ]
      },
      {
        name: 'United Kingdom',
        circuits: [
          {
            id: 'brands-hatch',
            name: 'Brands Hatch',
            type: 'real',
            difficulty: 'intermediate',
            length: 3.91,
            corners: 9,
            straights: 2,
            elevation: 35,
            characteristics: ['cambered', 'elevation'],
            layouts: [
              { id: 'bh-gp', name: 'Grand Prix Circuit', length: 3.91, corners: 9 },
              { id: 'bh-indy', name: 'Indy Circuit', length: 1.94, corners: 6 }
            ],
            tuningPresets: {
              aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 190, downforceRear: 260 },
              balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 160, downforceRear: 210 },
              conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 130, downforceRear: 170 },
            },
            tips: ['Commit through Paddock Hill Bend']
          }
        ]
      }
    ]
  },
  {
    name: 'Americas',
    locations: [
      {
        name: 'USA',
        circuits: [
          {
            id: 'laguna-seca',
            name: 'Laguna Seca',
            type: 'real',
            difficulty: 'intermediate',
            length: 3.60,
            corners: 11,
            straights: 2,
            elevation: 55,
            characteristics: ['corkscrew', 'technical'],
            tuningPresets: {
              aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 180, downforceRear: 240 },
              balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 150, downforceRear: 200 },
              conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 120, downforceRear: 160 },
            },
            tips: ['Master the Corkscrew']
          }
        ]
      }
    ]
  },
  {
    name: 'Asia-Oceania',
    locations: [
      {
        name: 'Japan',
        circuits: [
          {
            id: 'suzuka',
            name: 'Suzuka Circuit',
            type: 'real',
            difficulty: 'expert',
            length: 5.80,
            corners: 18,
            straights: 4,
            elevation: 40,
            characteristics: ['figure-eight', 'technical'],
            layouts: [
              { id: 'suzuka-full', name: 'Full Course', length: 5.80, corners: 18 },
              { id: 'suzuka-east', name: 'East Course', length: 2.24, corners: 9 }
            ],
            tuningPresets: {
              aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 200, downforceRear: 280 },
              balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 160, downforceRear: 220 },
              conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 120, downforceRear: 160 },
            },
            tips: ['Maintain rhythm through the Esses']
          }
        ]
      }
    ]
  }
];

// Flat list for backward compatibility or helper functions
export const ALL_CIRCUITS: TrackCircuit[] = TRACK_REGIONS.flatMap(r => r.locations.flatMap(l => l.circuits));

export function getCircuitById(id: string): TrackCircuit | undefined {
  return ALL_CIRCUITS.find(c => c.id === id);
}
