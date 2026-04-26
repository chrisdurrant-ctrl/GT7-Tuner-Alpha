/**
 * Gran Turismo 7 Track Profiles
 * Includes real GT7 tracks with characteristics and optimized tuning presets
 */

import type { TuningSetup } from './gt7_physics';

export type TrackType = 'street' | 'oval' | 'technical' | 'mixed' | 'rally';
export type TrackDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TrackProfile {
  id: string;
  name: string;
  location: string;
  type: TrackType;
  difficulty: TrackDifficulty;
  length: number; // km
  corners: number;
  straights: number;
  elevation: number; // meters
  characteristics: string[];
  tuningPresets: {
    aggressive: Partial<TuningSetup>;
    balanced: Partial<TuningSetup>;
    conservative: Partial<TuningSetup>;
  };
  tips: string[];
}

export const GT7_TRACKS: TrackProfile[] = [
  // Street Circuits
  {
    id: 'tokyo-expressway-800m',
    name: 'Tokyo Expressway 800M',
    location: 'Tokyo, Japan',
    type: 'street',
    difficulty: 'intermediate',
    length: 0.8,
    corners: 8,
    straights: 3,
    elevation: 50,
    characteristics: ['tight corners', 'short straights', 'urban', 'tight braking zones'],
    tuningPresets: {
      aggressive: {
        downforceFront: 180,
        downforceRear: 220,
        rideHeightFront: 80,
        rideHeightRear: 80,
        antiRollBarFront: 8,
        antiRollBarRear: 7,
        damperExpansionFront: 8,
        damperExpansionRear: 8,
        damperCompressionFront: 7,
        damperCompressionRear: 7,
        brakeBalance: 58,
        differentialAcceleration: 50,
        differentialBraking: 70,
        camberFront: 2.5,
        camberRear: 2.0,
      },
      balanced: {
        downforceFront: 140,
        downforceRear: 170,
        rideHeightFront: 100,
        rideHeightRear: 100,
        antiRollBarFront: 6,
        antiRollBarRear: 5,
        damperExpansionFront: 5,
        damperExpansionRear: 5,
        damperCompressionFront: 5,
        damperCompressionRear: 5,
        brakeBalance: 55,
        differentialAcceleration: 60,
        differentialBraking: 60,
        camberFront: 2.0,
        camberRear: 1.5,
      },
      conservative: {
        downforceFront: 100,
        downforceRear: 120,
        rideHeightFront: 120,
        rideHeightRear: 120,
        antiRollBarFront: 4,
        antiRollBarRear: 3,
        damperExpansionFront: 4,
        damperExpansionRear: 4,
        damperCompressionFront: 3,
        damperCompressionRear: 3,
        brakeBalance: 52,
        differentialAcceleration: 70,
        differentialBraking: 50,
        camberFront: 1.5,
        camberRear: 1.0,
      },
    },
    tips: [
      'Focus on tight corner exit speed',
      'Use smooth steering inputs',
      'Brake late into tight corners',
      'Maintain momentum through chicanes',
    ],
  },
  {
    id: 'sardegna-windmills-800m',
    name: 'Sardegna Windmills 800M',
    location: 'Sardegna, Italy',
    type: 'street',
    difficulty: 'beginner',
    length: 0.8,
    corners: 6,
    straights: 3,
    elevation: 30,
    characteristics: ['flowing', 'open', 'moderate corners', 'good grip'],
    tuningPresets: {
      aggressive: {
        downforceFront: 120,
        downforceRear: 150,
        antiRollBarFront: 6,
        antiRollBarRear: 5,
        brakeBalance: 55,
        differentialAcceleration: 70,
        differentialBraking: 60,
        camberFront: 2.0,
        camberRear: 1.5,
      },
      balanced: {
        downforceFront: 100,
        downforceRear: 130,
        antiRollBarFront: 5,
        antiRollBarRear: 4,
        brakeBalance: 53,
        differentialAcceleration: 60,
        differentialBraking: 55,
        camberFront: 1.8,
        camberRear: 1.3,
      },
      conservative: {
        downforceFront: 80,
        downforceRear: 100,
        antiRollBarFront: 3,
        antiRollBarRear: 2,
        brakeBalance: 50,
        differentialAcceleration: 50,
        differentialBraking: 45,
        camberFront: 1.5,
        camberRear: 1.0,
      },
    },
    tips: [
      'Good track for learning racing lines',
      'Smooth throttle application',
      'Consistent braking points',
      'Build confidence gradually',
    ],
  },
  {
    id: 'los-santos-6-lap',
    name: 'Los Santos 6 Lap',
    location: 'Los Santos, USA',
    type: 'street',
    difficulty: 'advanced',
    length: 4.2,
    corners: 25,
    straights: 8,
    elevation: 120,
    characteristics: ['long', 'elevation changes', 'mixed corners', 'challenging'],
    tuningPresets: {
      aggressive: {
        downforceFront: 160,
        downforceRear: 200,
        antiRollBarFront: 7,
        antiRollBarRear: 6,
        brakeBalance: 57,
        differentialAcceleration: 55,
        differentialBraking: 65,
        camberFront: 2.3,
        camberRear: 1.8,
      },
      balanced: {
        downforceFront: 130,
        downforceRear: 160,
        antiRollBarFront: 5,
        antiRollBarRear: 4,
        brakeBalance: 54,
        differentialAcceleration: 60,
        differentialBraking: 58,
        camberFront: 2.0,
        camberRear: 1.5,
      },
      conservative: {
        downforceFront: 100,
        downforceRear: 120,
        antiRollBarFront: 4,
        antiRollBarRear: 3,
        brakeBalance: 51,
        differentialAcceleration: 65,
        differentialBraking: 50,
        camberFront: 1.5,
        camberRear: 1.0,
      },
    },
    tips: [
      'Manage tire temperature over long race',
      'Smooth inputs to preserve tires',
      'Plan fuel strategy carefully',
      'Elevation changes affect braking',
    ],
  },

  // High-Speed Ovals
  {
    id: 'monza-800m',
    name: 'Monza 800M',
    location: 'Monza, Italy',
    type: 'oval',
    difficulty: 'intermediate',
    length: 0.8,
    corners: 4,
    straights: 3,
    elevation: 20,
    characteristics: ['high-speed', 'long straights', 'fast corners', 'top speed critical'],
    tuningPresets: {
      aggressive: {
        downforceFront: 50,
        downforceRear: 80,
        antiRollBarFront: 2,
        antiRollBarRear: 2,
        brakeBalance: 52,
        differentialAcceleration: 80,
        differentialBraking: 40,
        camberFront: 1.0,
        camberRear: 0.5,
        powerRestriction: 100,
      },
      balanced: {
        downforceFront: 80,
        downforceRear: 120,
        antiRollBarFront: 3,
        antiRollBarRear: 3,
        brakeBalance: 53,
        differentialAcceleration: 70,
        differentialBraking: 50,
        camberFront: 1.5,
        camberRear: 1.0,
        powerRestriction: 100,
      },
      conservative: {
        downforceFront: 120,
        downforceRear: 160,
        antiRollBarFront: 4,
        antiRollBarRear: 4,
        brakeBalance: 54,
        differentialAcceleration: 60,
        differentialBraking: 60,
        camberFront: 2.0,
        camberRear: 1.5,
        powerRestriction: 90,
      },
    },
    tips: [
      'Minimize downforce for top speed',
      'Perfect racing line through fast corners',
      'Smooth steering inputs at high speed',
      'Manage fuel consumption',
      'Tire temperature management critical',
    ],
  },
  {
    id: 'le-mans-700m',
    name: 'Le Mans 700M',
    location: 'Le Mans, France',
    type: 'oval',
    difficulty: 'advanced',
    length: 0.7,
    corners: 3,
    straights: 2,
    elevation: 10,
    characteristics: ['very high-speed', 'minimal braking', 'endurance racing', 'top speed essential'],
    tuningPresets: {
      aggressive: {
        downforceFront: 40,
        downforceRear: 60,
        antiRollBarFront: 1,
        antiRollBarRear: 1,
        brakeBalance: 50,
        differentialAcceleration: 85,
        differentialBraking: 35,
        camberFront: 0.5,
        camberRear: 0.0,
        powerRestriction: 100,
      },
      balanced: {
        downforceFront: 70,
        downforceRear: 100,
        antiRollBarFront: 2,
        antiRollBarRear: 2,
        brakeBalance: 51,
        differentialAcceleration: 75,
        differentialBraking: 45,
        camberFront: 1.0,
        camberRear: 0.5,
        powerRestriction: 100,
      },
      conservative: {
        downforceFront: 110,
        downforceRear: 150,
        antiRollBarFront: 3,
        antiRollBarRear: 3,
        brakeBalance: 52,
        differentialAcceleration: 65,
        differentialBraking: 55,
        camberFront: 1.5,
        camberRear: 1.0,
        powerRestriction: 95,
      },
    },
    tips: [
      'Maximize straight-line speed',
      'Minimal downforce setup',
      'Fuel management crucial',
      'Tire durability important',
      'Smooth throttle control',
    ],
  },

  // Technical Circuits
  {
    id: 'suzuka-800m',
    name: 'Suzuka 800M',
    location: 'Suzuka, Japan',
    type: 'technical',
    difficulty: 'expert',
    length: 0.8,
    corners: 12,
    straights: 4,
    elevation: 80,
    characteristics: ['technical', 'elevation changes', 'demanding', 'precision required'],
    tuningPresets: {
      aggressive: {
        downforceFront: 200,
        downforceRear: 280,
        antiRollBarFront: 9,
        antiRollBarRear: 8,
        brakeBalance: 59,
        differentialAcceleration: 45,
        differentialBraking: 75,
        camberFront: 2.8,
        camberRear: 2.3,
      },
      balanced: {
        downforceFront: 160,
        downforceRear: 220,
        antiRollBarFront: 7,
        antiRollBarRear: 6,
        brakeBalance: 56,
        differentialAcceleration: 55,
        differentialBraking: 65,
        camberFront: 2.3,
        camberRear: 1.8,
      },
      conservative: {
        downforceFront: 120,
        downforceRear: 160,
        antiRollBarFront: 5,
        antiRollBarRear: 4,
        brakeBalance: 53,
        differentialAcceleration: 65,
        differentialBraking: 55,
        camberFront: 1.8,
        camberRear: 1.3,
      },
    },
    tips: [
      'Precision is more important than speed',
      'Perfect racing line through 130R',
      'Manage tire temperature carefully',
      'Elevation changes affect weight transfer',
      'Practice consistency',
    ],
  },
  {
    id: 'nurburgring-800m',
    name: 'Nürburgring 800M',
    location: 'Nürburgring, Germany',
    type: 'technical',
    difficulty: 'expert',
    length: 0.8,
    corners: 14,
    straights: 3,
    elevation: 150,
    characteristics: ['very technical', 'high elevation', 'demanding', 'wet weather risk'],
    tuningPresets: {
      aggressive: {
        downforceFront: 220,
        downforceRear: 300,
        antiRollBarFront: 10,
        antiRollBarRear: 9,
        brakeBalance: 60,
        differentialAcceleration: 40,
        differentialBraking: 80,
        camberFront: 3.0,
        camberRear: 2.5,
      },
      balanced: {
        downforceFront: 180,
        downforceRear: 240,
        antiRollBarFront: 8,
        antiRollBarRear: 7,
        brakeBalance: 57,
        differentialAcceleration: 50,
        differentialBraking: 70,
        camberFront: 2.5,
        camberRear: 2.0,
      },
      conservative: {
        downforceFront: 140,
        downforceRear: 180,
        antiRollBarFront: 6,
        antiRollBarRear: 5,
        brakeBalance: 54,
        differentialAcceleration: 60,
        differentialBraking: 60,
        camberFront: 2.0,
        camberRear: 1.5,
      },
    },
    tips: [
      'Master the Nordschleife sections',
      'Elevation changes are extreme',
      'Prepare for weather changes',
      'Tire management is critical',
      'Study track map thoroughly',
    ],
  },

  // Mixed Circuits
  {
    id: 'spa-francorchamps-800m',
    name: 'Spa-Francorchamps 800M',
    location: 'Spa, Belgium',
    type: 'mixed',
    difficulty: 'advanced',
    length: 0.8,
    corners: 8,
    straights: 4,
    elevation: 100,
    characteristics: ['mixed pace', 'elevation', 'weather sensitive', 'iconic corners'],
    tuningPresets: {
      aggressive: {
        downforceFront: 130,
        downforceRear: 170,
        antiRollBarFront: 6,
        antiRollBarRear: 5,
        brakeBalance: 56,
        differentialAcceleration: 60,
        differentialBraking: 60,
        camberFront: 2.2,
        camberRear: 1.7,
      },
      balanced: {
        downforceFront: 110,
        downforceRear: 140,
        antiRollBarFront: 5,
        antiRollBarRear: 4,
        brakeBalance: 54,
        differentialAcceleration: 65,
        differentialBraking: 55,
        camberFront: 2.0,
        camberRear: 1.5,
      },
      conservative: {
        downforceFront: 90,
        downforceRear: 110,
        antiRollBarFront: 4,
        antiRollBarRear: 3,
        brakeBalance: 52,
        differentialAcceleration: 70,
        differentialBraking: 50,
        camberFront: 1.5,
        camberRear: 1.0,
      },
    },
    tips: [
      'Balance speed and grip',
      'Eau Rouge requires smooth inputs',
      'Weather changes affect strategy',
      'Tire temperature management',
      'Practice wet weather driving',
    ],
  },
  {
    id: 'brands-hatch-800m',
    name: 'Brands Hatch 800M',
    location: 'Brands Hatch, UK',
    type: 'mixed',
    difficulty: 'intermediate',
    length: 0.8,
    corners: 10,
    straights: 3,
    elevation: 60,
    characteristics: ['mixed', 'elevation changes', 'technical', 'good learning track'],
    tuningPresets: {
      aggressive: {
        downforceFront: 150,
        downforceRear: 190,
        antiRollBarFront: 7,
        antiRollBarRear: 6,
        brakeBalance: 56,
        differentialAcceleration: 55,
        differentialBraking: 65,
        camberFront: 2.2,
        camberRear: 1.7,
      },
      balanced: {
        downforceFront: 120,
        downforceRear: 150,
        antiRollBarFront: 5,
        antiRollBarRear: 4,
        brakeBalance: 54,
        differentialAcceleration: 60,
        differentialBraking: 58,
        camberFront: 2.0,
        camberRear: 1.5,
      },
      conservative: {
        downforceFront: 90,
        downforceRear: 110,
        antiRollBarFront: 4,
        antiRollBarRear: 3,
        brakeBalance: 52,
        differentialAcceleration: 65,
        differentialBraking: 50,
        camberFront: 1.5,
        camberRear: 1.0,
      },
    },
    tips: [
      'Elevation changes affect braking',
      'Consistent corner exit speed',
      'Good for developing racecraft',
      'Smooth throttle application',
      'Practice trail braking',
    ],
  },

  // Rally Tracks
  {
    id: 'fishermans-ranch-800m',
    name: "Fisherman's Ranch 800M",
    location: 'California, USA',
    type: 'rally',
    difficulty: 'intermediate',
    length: 0.8,
    corners: 16,
    straights: 2,
    elevation: 200,
    characteristics: ['gravel', 'elevation', 'tight corners', 'off-road'],
    tuningPresets: {
      aggressive: {
        downforceFront: 80,
        downforceRear: 100,
        antiRollBarFront: 4,
        antiRollBarRear: 3,
        brakeBalance: 55,
        differentialAcceleration: 75,
        differentialBraking: 70,
        camberFront: 1.5,
        camberRear: 1.0,
        tireGripCoefficient: 0.95,
      },
      balanced: {
        downforceFront: 60,
        downforceRear: 80,
        antiRollBarFront: 3,
        antiRollBarRear: 2,
        brakeBalance: 53,
        differentialAcceleration: 70,
        differentialBraking: 65,
        camberFront: 1.3,
        camberRear: 0.8,
        tireGripCoefficient: 0.9,
      },
      conservative: {
        downforceFront: 40,
        downforceRear: 60,
        antiRollBarFront: 2,
        antiRollBarRear: 1,
        brakeBalance: 51,
        differentialAcceleration: 65,
        differentialBraking: 60,
        camberFront: 1.0,
        camberRear: 0.5,
        tireGripCoefficient: 0.85,
      },
    },
    tips: [
      'Smooth inputs on loose surface',
      'Manage weight transfer carefully',
      'Differential settings critical',
      'Tire choice affects grip',
      'Practice smooth steering',
    ],
  },
];

/**
 * Get track profile by ID
 */
export function getTrackById(id: string): TrackProfile | undefined {
  return GT7_TRACKS.find((track) => track.id === id);
}

/**
 * Get all tracks of a specific type
 */
export function getTracksByType(type: TrackType): TrackProfile[] {
  return GT7_TRACKS.filter((track) => track.type === type);
}

/**
 * Get all tracks of a specific difficulty
 */
export function getTracksByDifficulty(difficulty: TrackDifficulty): TrackProfile[] {
  return GT7_TRACKS.filter((track) => track.difficulty === difficulty);
}

/**
 * Get recommendation text based on track characteristics
 */
export function getTrackRecommendation(track: TrackProfile): string {
  const characteristics = track.characteristics.join(', ');
  const difficulty = track.difficulty.charAt(0).toUpperCase() + track.difficulty.slice(1);

  return `${track.name} is a ${difficulty} ${track.type} circuit with ${characteristics}. Focus on ${track.tips[0]?.toLowerCase() || 'smooth driving'}.`;
}
