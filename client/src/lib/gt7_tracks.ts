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
    rideHeightFront: 80, rideHeightRear: 85,
    naturalFrequencyFront: 3.2, naturalFrequencyRear: 3.2,
    damperExpansionFront: 8, damperExpansionRear: 8,
    damperCompressionFront: 7, damperCompressionRear: 7,
    camberFront: 3.0, camberRear: 2.5,
    toeInFront: -0.10, toeInRear: 0.20,
  },
  balanced: {
    rideHeightFront: 100, rideHeightRear: 100,
    naturalFrequencyFront: 2.5, naturalFrequencyRear: 2.5,
    damperExpansionFront: 5, damperExpansionRear: 5,
    damperCompressionFront: 5, damperCompressionRear: 5,
    camberFront: 2.0, camberRear: 1.5,
    toeInFront: 0.00, toeInRear: 0.15,
  },
  conservative: {
    rideHeightFront: 120, rideHeightRear: 125,
    naturalFrequencyFront: 1.8, naturalFrequencyRear: 1.8,
    damperExpansionFront: 4, damperExpansionRear: 4,
    damperCompressionFront: 3, damperCompressionRear: 3,
    camberFront: 1.0, camberRear: 0.5,
    toeInFront: 0.05, toeInRear: 0.10,
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
            type: 'real', difficulty: 'expert', length: 25.37, corners: 170, straights: 10, elevation: 300,
            characteristics: ['long', 'narrow', 'bumpy'],
            layouts: [
              { id: 'nurb-24h', name: '24h Layout', length: 25.37, corners: 170 },
              { id: 'nurb-nords', name: 'Nordschleife', length: 20.83, corners: 154 },
              { id: 'nurb-gp', name: 'Grand Prix', length: 5.15, corners: 15 }
            ],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
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
            type: 'real', difficulty: 'intermediate', length: 3.91, corners: 9, straights: 2, elevation: 35,
            characteristics: ['cambered', 'elevation'],
            layouts: [
              { id: 'bh-gp', name: 'Grand Prix Circuit', length: 3.91, corners: 9 },
              { id: 'bh-indy', name: 'Indy Circuit', length: 1.94, corners: 6 }
            ],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Commit through Paddock Hill Bend']
          }
        ]
      },
      {
        name: 'Belgium',
        circuits: [
          {
            id: 'spa',
            name: 'Circuit de Spa-Francorchamps',
            type: 'real', difficulty: 'advanced', length: 7.00, corners: 20, straights: 5, elevation: 100,
            characteristics: ['high-speed', 'elevation'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Flat out through Eau Rouge']
          }
        ]
      },
      {
        name: 'Italy',
        circuits: [
          {
            id: 'monza',
            name: 'Autodromo Nazionale Monza',
            type: 'real', difficulty: 'intermediate', length: 5.79, corners: 11, straights: 4, elevation: 10,
            characteristics: ['high-speed', 'heavy braking'],
            layouts: [
              { id: 'monza-full', name: 'Full Course', length: 5.79, corners: 11 },
              { id: 'monza-no-chicane', name: 'No Chicane', length: 5.75, corners: 8 }
            ],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Attack the curbs in the chicanes']
          },
          {
            id: 'maggiore',
            name: 'Autodrome Lago Maggiore',
            type: 'technical', difficulty: 'intermediate', length: 5.81, corners: 17, straights: 3, elevation: 40,
            characteristics: ['technical', 'original'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Smooth steering through technical sections']
          }
        ]
      },
      {
        name: 'France',
        circuits: [
          {
            id: 'le-mans',
            name: 'Circuit de la Sarthe',
            type: 'real', difficulty: 'advanced', length: 13.62, corners: 38, straights: 5, elevation: 40,
            characteristics: ['long straights', 'high speed'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Minimize downforce for top speed']
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
            type: 'real', difficulty: 'intermediate', length: 3.60, corners: 11, straights: 2, elevation: 55,
            characteristics: ['corkscrew', 'technical'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Master the Corkscrew']
          },
          {
            id: 'watkins-glen',
            name: 'Watkins Glen',
            type: 'real', difficulty: 'intermediate', length: 5.42, corners: 11, straights: 3, elevation: 35,
            characteristics: ['flowing', 'high-speed'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Speed through the Esses is vital']
          },
          {
            id: 'daytona',
            name: 'Daytona International Speedway',
            type: 'oval', difficulty: 'intermediate', length: 5.73, corners: 12, straights: 2, elevation: 0,
            characteristics: ['banking', 'oval', 'road course'],
            layouts: [
              { id: 'daytona-tri', name: 'Tri-Oval', length: 4.02, corners: 3 },
              { id: 'daytona-road', name: 'Road Course', length: 5.73, corners: 12 }
            ],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Drafting is key on the oval']
          }
        ]
      },
      {
        name: 'Brazil',
        circuits: [
          {
            id: 'interlagos',
            name: 'Autódromo de Interlagos',
            type: 'real', difficulty: 'intermediate', length: 4.30, corners: 15, straights: 2, elevation: 43,
            characteristics: ['anti-clockwise', 'technical infield'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Focus on exit speed from Junção']
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
            type: 'real', difficulty: 'expert', length: 5.80, corners: 18, straights: 4, elevation: 40,
            characteristics: ['figure-eight', 'technical'],
            layouts: [
              { id: 'suzuka-full', name: 'Full Course', length: 5.80, corners: 18 },
              { id: 'suzuka-east', name: 'East Course', length: 2.24, corners: 9 }
            ],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Maintain rhythm through the Esses']
          },
          {
            id: 'tsukuba',
            name: 'Tsukuba Circuit',
            type: 'real', difficulty: 'beginner', length: 2.04, corners: 8, straights: 2, elevation: 0,
            characteristics: ['short', 'technical'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Patience in the hairpins']
          },
          {
            id: 'fuji',
            name: 'Fuji Speedway',
            type: 'real', difficulty: 'intermediate', length: 4.56, corners: 16, straights: 1, elevation: 35,
            characteristics: ['long straight', 'technical final sector'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Speed on the main straight is vital']
          }
        ]
      },
      {
        name: 'Australia',
        circuits: [
          {
            id: 'bathurst',
            name: 'Mount Panorama',
            type: 'real', difficulty: 'expert', length: 6.21, corners: 23, straights: 2, elevation: 174,
            characteristics: ['mountain', 'narrow', 'elevation'],
            tuningPresets: { aggressive: { ...DEFAULT_SUSPENSION.aggressive }, balanced: { ...DEFAULT_SUSPENSION.balanced }, conservative: { ...DEFAULT_SUSPENSION.conservative } },
            tips: ['Don\'t hit the walls on the mountain']
          }
        ]
      }
    ]
  }
];

export const ALL_CIRCUITS: TrackCircuit[] = TRACK_REGIONS.flatMap(r => r.locations.flatMap(l => l.circuits));

export function getCircuitById(id: string): TrackCircuit | undefined {
  return ALL_CIRCUITS.find(c => c.id === id);
}
