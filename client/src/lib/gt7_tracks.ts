/**
 * Gran Turismo 7 Track Profiles
 * Includes real GT7 tracks with characteristics and optimized tuning presets
 */

import type { TuningSetup } from './gt7_physics';

export type TrackType = 'street' | 'oval' | 'technical' | 'mixed' | 'rally' | 'real';
export type TrackDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TrackLayout {
  id: string;
  name: string;
  length: number;
  corners: number;
  type?: TrackType;
  difficulty?: TrackDifficulty;
}

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
  layouts?: TrackLayout[];
  tuningPresets: {
    aggressive: Partial<TuningSetup>;
    balanced: Partial<TuningSetup>;
    conservative: Partial<TuningSetup>;
  };
  tips: string[];
}

/**
 * Default tuning values for new suspension parameters
 */
const DEFAULT_SUSPENSION = {
  aggressive: {
    rideHeightFront: 80,
    rideHeightRear: 85,
    damperExpansionFront: 8,
    damperExpansionRear: 8,
    damperCompressionFront: 7,
    damperCompressionRear: 7,
  },
  balanced: {
    rideHeightFront: 100,
    rideHeightRear: 100,
    damperExpansionFront: 5,
    damperExpansionRear: 5,
    damperCompressionFront: 5,
    damperCompressionRear: 5,
  },
  conservative: {
    rideHeightFront: 120,
    rideHeightRear: 125,
    damperExpansionFront: 4,
    damperExpansionRear: 4,
    damperCompressionFront: 3,
    damperCompressionRear: 3,
  }
};

export const GT7_TRACKS: TrackProfile[] = [
  // --- REAL WORLD CIRCUITS ---
  {
    id: 'nurburgring-24h',
    name: 'Nürburgring 24h',
    location: 'Nürburg, Germany',
    type: 'real',
    difficulty: 'expert',
    length: 25.37,
    corners: 170,
    straights: 10,
    elevation: 300,
    characteristics: ['extremely long', 'narrow', 'bumps', 'elevation changes'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 220, downforceRear: 300, antiRollBarFront: 7, antiRollBarRear: 6, camberFront: 2.8, camberRear: 2.3 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 180, downforceRear: 240, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.2, camberRear: 1.8 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 140, downforceRear: 180, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.8, camberRear: 1.5 },
    },
    tips: ['Suspension travel is key for bumps', 'Study the track sections', 'Manage tire wear carefully'],
  },
  {
    id: 'circuit-de-la-sarthe',
    name: 'Circuit de la Sarthe',
    location: 'Le Mans, France',
    type: 'real',
    difficulty: 'advanced',
    length: 13.62,
    corners: 38,
    straights: 5,
    elevation: 40,
    characteristics: ['long straights', 'high speed', 'heavy braking'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, rideHeightFront: 70, rideHeightRear: 75, downforceFront: 100, downforceRear: 140, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.5, camberRear: 1.0 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, rideHeightFront: 90, rideHeightRear: 95, downforceFront: 130, downforceRear: 170, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.0, camberRear: 1.5 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, rideHeightFront: 110, rideHeightRear: 115, downforceFront: 160, downforceRear: 200, antiRollBarFront: 6, antiRollBarRear: 6, camberFront: 2.5, camberRear: 2.0 },
    },
    tips: ['Minimize downforce for top speed', 'Stable braking for Mulsanne corners', 'Fuel management is critical'],
  },
  {
    id: 'suzuka-circuit',
    name: 'Suzuka Circuit',
    location: 'Suzuka, Japan',
    type: 'real',
    difficulty: 'expert',
    length: 5.80,
    corners: 18,
    straights: 4,
    elevation: 40,
    characteristics: ['figure-eight', 'technical', 'high-speed corners'],
    layouts: [
      { id: 'suzuka-full', name: 'Full Course', length: 5.80, corners: 18 },
      { id: 'suzuka-east', name: 'East Course', length: 2.24, corners: 9 }
    ],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 200, downforceRear: 280, antiRollBarFront: 8, antiRollBarRear: 8, camberFront: 3.0, camberRear: 2.5 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 160, downforceRear: 220, antiRollBarFront: 6, antiRollBarRear: 6, camberFront: 2.3, camberRear: 1.8 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 120, downforceRear: 160, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 1.8, camberRear: 1.3 },
    },
    tips: ['Precision through the Esses', 'High downforce for 130R stability', 'Maintain momentum'],
  },
  {
    id: 'spa-francorchamps',
    name: 'Spa-Francorchamps',
    location: 'Stavelot, Belgium',
    type: 'real',
    difficulty: 'advanced',
    length: 7.00,
    corners: 20,
    straights: 5,
    elevation: 100,
    characteristics: ['high speed', 'elevation changes', 'long straights'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 150, downforceRear: 200, antiRollBarFront: 6, antiRollBarRear: 6, camberFront: 2.5, camberRear: 2.0 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 180, downforceRear: 240, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.2, camberRear: 1.7 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 210, downforceRear: 280, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.8, camberRear: 1.3 },
    },
    tips: ['Flat out through Eau Rouge', 'Stability for Raidillon', 'Speed through sector 1 and 3'],
  },
  {
    id: 'mount-panorama',
    name: 'Mount Panorama',
    location: 'Bathurst, Australia',
    type: 'real',
    difficulty: 'expert',
    length: 6.21,
    corners: 23,
    straights: 2,
    elevation: 174,
    characteristics: ['narrow mountain section', 'extreme elevation', 'long straights'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, rideHeightFront: 90, rideHeightRear: 95, downforceFront: 160, downforceRear: 220, antiRollBarFront: 7, antiRollBarRear: 6, camberFront: 2.5, camberRear: 2.0 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, rideHeightFront: 105, rideHeightRear: 110, downforceFront: 130, downforceRear: 180, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.0, camberRear: 1.5 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, rideHeightFront: 120, rideHeightRear: 125, downforceFront: 100, downforceRear: 140, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.5, camberRear: 1.0 },
    },
    tips: ['Don\'t hit the walls on the mountain', 'Brake early for the Chase', 'Maintain high exit speed onto Conrod Straight'],
  },
  {
    id: 'laguna-seca',
    name: 'WeatherTech Raceway Laguna Seca',
    location: 'California, USA',
    type: 'real',
    difficulty: 'intermediate',
    length: 3.60,
    corners: 11,
    straights: 2,
    elevation: 55,
    characteristics: ['the corkscrew', 'technical', 'low grip sand'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 180, downforceRear: 240, antiRollBarFront: 8, antiRollBarRear: 7, camberFront: 2.8, camberRear: 2.2 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 150, downforceRear: 200, antiRollBarFront: 6, antiRollBarRear: 5, camberFront: 2.2, camberRear: 1.7 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 120, downforceRear: 160, antiRollBarFront: 4, antiRollBarRear: 3, camberFront: 1.7, camberRear: 1.2 },
    },
    tips: ['Commit to the Corkscrew', 'Watch out for sand on track edges', 'Trail braking is effective here'],
  },
  {
    id: 'interlagos',
    name: 'Autódromo de Interlagos',
    location: 'São Paulo, Brazil',
    type: 'real',
    difficulty: 'intermediate',
    length: 4.30,
    corners: 15,
    straights: 2,
    elevation: 43,
    characteristics: ['anti-clockwise', 'technical infield', 'banked start-finish'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 170, downforceRear: 230, antiRollBarFront: 7, antiRollBarRear: 7, camberFront: 2.6, camberRear: 2.1 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 140, downforceRear: 190, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.1, camberRear: 1.6 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 110, downforceRear: 150, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.6, camberRear: 1.1 },
    },
    tips: ['Focus on exit speed from Junção', 'Smooth steering through the infield', 'Manage tires on long left-handers'],
  },
  {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    location: 'Monza, Italy',
    type: 'real',
    difficulty: 'intermediate',
    length: 5.79,
    corners: 11,
    straights: 4,
    elevation: 10,
    characteristics: ['very high speed', 'heavy braking', 'curb riding'],
    layouts: [
      { id: 'monza-full', name: 'Full Course', length: 5.79, corners: 11 },
      { id: 'monza-no-chicane', name: 'No Chicane', length: 5.75, corners: 8 }
    ],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, rideHeightFront: 75, rideHeightRear: 80, downforceFront: 60, downforceRear: 100, antiRollBarFront: 5, antiRollBarRear: 4, camberFront: 1.2, camberRear: 0.8 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, rideHeightFront: 95, rideHeightRear: 100, downforceFront: 90, downforceRear: 130, antiRollBarFront: 6, antiRollBarRear: 5, camberFront: 1.8, camberRear: 1.3 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, rideHeightFront: 115, rideHeightRear: 120, downforceFront: 120, downforceRear: 160, antiRollBarFront: 7, antiRollBarRear: 6, camberFront: 2.2, camberRear: 1.7 },
    },
    tips: ['Attack the curbs in the chicanes', 'Minimize drag for the straights', 'Brake stability is crucial'],
  },
  {
    id: 'brands-hatch',
    name: 'Brands Hatch',
    location: 'Kent, UK',
    type: 'real',
    difficulty: 'intermediate',
    length: 3.91,
    corners: 9,
    straights: 2,
    elevation: 35,
    characteristics: ['cambered corners', 'elevation', 'narrow'],
    layouts: [
      { id: 'brands-hatch-gp', name: 'Grand Prix Circuit', length: 3.91, corners: 9 },
      { id: 'brands-hatch-indy', name: 'Indy Circuit', length: 1.94, corners: 6 }
    ],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 190, downforceRear: 260, antiRollBarFront: 8, antiRollBarRear: 7, camberFront: 2.8, camberRear: 2.3 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 160, downforceRear: 210, antiRollBarFront: 6, antiRollBarRear: 5, camberFront: 2.2, camberRear: 1.7 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 130, downforceRear: 170, antiRollBarFront: 5, antiRollBarRear: 4, camberFront: 1.7, camberRear: 1.2 },
    },
    tips: ['Commit through Paddock Hill Bend', 'Precision through Druids', 'Use the corner banking'],
  },
  {
    id: 'watkins-glen',
    name: 'Watkins Glen International',
    location: 'New York, USA',
    type: 'real',
    difficulty: 'intermediate',
    length: 5.42,
    corners: 11,
    straights: 3,
    elevation: 35,
    characteristics: ['high speed', 'blue barriers', 'flowing'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 170, downforceRear: 230, antiRollBarFront: 7, antiRollBarRear: 7, camberFront: 2.5, camberRear: 2.0 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 140, downforceRear: 190, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.0, camberRear: 1.5 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 110, downforceRear: 150, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.5, camberRear: 1.0 },
    },
    tips: ['Speed through the Esses is vital', 'Be careful at the Bus Stop chicane', 'Maintain rhythm'],
  },

  // --- ORIGINAL CIRCUITS ---
  {
    id: 'deep-forest-raceway',
    name: 'Deep Forest Raceway',
    location: 'Switzerland',
    type: 'technical',
    difficulty: 'intermediate',
    length: 4.25,
    corners: 15,
    straights: 3,
    elevation: 60,
    characteristics: ['forest setting', 'tunnels', 'technical hairpins'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 180, downforceRear: 240, antiRollBarFront: 8, antiRollBarRear: 7, camberFront: 2.7, camberRear: 2.2 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 150, downforceRear: 200, antiRollBarFront: 6, antiRollBarRear: 5, camberFront: 2.2, camberRear: 1.7 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 120, downforceRear: 160, antiRollBarFront: 4, antiRollBarRear: 3, camberFront: 1.7, camberRear: 1.2 },
    },
    tips: ['Watch out for the narrow bridge', 'Late apex for the final corner', 'Manage elevation changes'],
  },
  {
    id: 'trial-mountain',
    name: 'Trial Mountain Circuit',
    location: 'USA',
    type: 'technical',
    difficulty: 'intermediate',
    length: 5.44,
    corners: 15,
    straights: 3,
    elevation: 110,
    characteristics: ['mountain setting', 'long back straight', 'high-speed curves'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 170, downforceRear: 230, antiRollBarFront: 7, antiRollBarRear: 7, camberFront: 2.5, camberRear: 2.0 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 140, downforceRear: 190, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.0, camberRear: 1.5 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 110, downforceRear: 150, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.5, camberRear: 1.0 },
    },
    tips: ['Attack the curbs in the final chicane', 'Carry speed through the tunnels', 'Watch for the dinosaurs!'],
  },
  {
    id: 'high-speed-ring',
    name: 'High Speed Ring',
    location: 'Japan',
    type: 'oval',
    difficulty: 'beginner',
    length: 4.00,
    corners: 6,
    straights: 2,
    elevation: 10,
    characteristics: ['banked corners', 'high speed', 'simple layout'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, rideHeightFront: 80, rideHeightRear: 85, downforceFront: 80, downforceRear: 120, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.5, camberRear: 1.0 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, rideHeightFront: 100, rideHeightRear: 105, downforceFront: 110, downforceRear: 150, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.0, camberRear: 1.5 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, rideHeightFront: 120, rideHeightRear: 125, downforceFront: 140, downforceRear: 180, antiRollBarFront: 6, antiRollBarRear: 6, camberFront: 2.5, camberRear: 2.0 },
    },
    tips: ['Carry speed through the banking', 'Smooth steering is essential', 'Drafting is very effective here'],
  },
  {
    id: 'dragon-trail-seaside',
    name: 'Dragon Trail - Seaside',
    location: 'Croatia',
    type: 'mixed',
    difficulty: 'advanced',
    length: 5.21,
    corners: 18,
    straights: 3,
    elevation: 40,
    characteristics: ['chicane of death', 'coastal views', 'technical sections'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, downforceFront: 180, downforceRear: 240, antiRollBarFront: 8, antiRollBarRear: 7, camberFront: 2.8, camberRear: 2.3 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, downforceFront: 150, downforceRear: 200, antiRollBarFront: 6, antiRollBarRear: 5, camberFront: 2.2, camberRear: 1.7 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, downforceFront: 120, downforceRear: 160, antiRollBarFront: 4, antiRollBarRear: 3, camberFront: 1.7, camberRear: 1.2 },
    },
    tips: ['Survive the "Chicane of Death"', 'Carry speed onto the start-finish straight', 'Smooth transition through hairpins'],
  },
  {
    id: 'tokyo-expressway-central',
    name: 'Tokyo Expressway - Central Clockwise',
    location: 'Tokyo, Japan',
    type: 'street',
    difficulty: 'intermediate',
    length: 7.30,
    corners: 13,
    straights: 2,
    elevation: 20,
    characteristics: ['narrow', 'walls', 'urban', 'night racing'],
    tuningPresets: {
      aggressive: { ...DEFAULT_SUSPENSION.aggressive, rideHeightFront: 80, rideHeightRear: 80, downforceFront: 120, downforceRear: 160, antiRollBarFront: 6, antiRollBarRear: 6, camberFront: 2.0, camberRear: 1.5 },
      balanced: { ...DEFAULT_SUSPENSION.balanced, rideHeightFront: 100, rideHeightRear: 100, downforceFront: 150, downforceRear: 200, antiRollBarFront: 5, antiRollBarRear: 5, camberFront: 2.2, camberRear: 1.7 },
      conservative: { ...DEFAULT_SUSPENSION.conservative, rideHeightFront: 120, rideHeightRear: 120, downforceFront: 180, downforceRear: 240, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 1.8, camberRear: 1.3 },
    },
    tips: ['Don\'t touch the walls', 'Stable braking is vital', 'Watch out for traffic in events'],
  },

  // --- RALLY CIRCUITS ---
  {
    id: 'fishermans-ranch',
    name: 'Fishermans Ranch',
    location: 'USA',
    type: 'rally',
    difficulty: 'expert',
    length: 6.89,
    corners: 40,
    straights: 2,
    elevation: 150,
    characteristics: ['dirt', 'jumps', 'sliding'],
    tuningPresets: {
      aggressive: { rideHeightFront: 180, rideHeightRear: 190, damperExpansionFront: 3, damperExpansionRear: 3, damperCompressionFront: 3, damperCompressionRear: 3, downforceFront: 50, downforceRear: 80, antiRollBarFront: 2, antiRollBarRear: 2, camberFront: 1.0, camberRear: 0.5 },
      balanced: { rideHeightFront: 200, rideHeightRear: 210, damperExpansionFront: 4, damperExpansionRear: 4, damperCompressionFront: 4, damperCompressionRear: 4, downforceFront: 70, downforceRear: 100, antiRollBarFront: 3, antiRollBarRear: 3, camberFront: 1.5, camberRear: 1.0 },
      conservative: { rideHeightFront: 220, rideHeightRear: 230, damperExpansionFront: 5, damperExpansionRear: 5, damperCompressionFront: 5, damperCompressionRear: 5, downforceFront: 90, downforceRear: 120, antiRollBarFront: 4, antiRollBarRear: 4, camberFront: 2.0, camberRear: 1.5 },
    },
    tips: ['Soft suspension for jumps', 'Counter-steer early', 'Manage weight transfer'],
  },
  {
    id: 'colorado-springs',
    name: 'Colorado Springs - Lake',
    location: 'Colorado, USA',
    type: 'rally',
    difficulty: 'intermediate',
    length: 2.99,
    corners: 18,
    straights: 2,
    elevation: 30,
    characteristics: ['dirt', 'flowing', 'dusty'],
    tuningPresets: {
      aggressive: { rideHeightFront: 170, rideHeightRear: 180, damperExpansionFront: 3, damperExpansionRear: 3, damperCompressionFront: 3, damperCompressionRear: 3, downforceFront: 60, downforceRear: 90, antiRollBarFront: 3, antiRollBarRear: 2, camberFront: 1.2, camberRear: 0.7 },
      balanced: { rideHeightFront: 190, rideHeightRear: 200, damperExpansionFront: 4, damperExpansionRear: 4, damperCompressionFront: 4, damperCompressionRear: 4, downforceFront: 80, downforceRear: 110, antiRollBarFront: 4, antiRollBarRear: 3, camberFront: 1.6, camberRear: 1.1 },
      conservative: { rideHeightFront: 210, rideHeightRear: 220, damperExpansionFront: 5, damperExpansionRear: 5, damperCompressionFront: 5, damperCompressionRear: 5, downforceFront: 100, downforceRear: 130, antiRollBarFront: 5, antiRollBarRear: 4, camberFront: 2.0, camberRear: 1.5 },
    },
    tips: ['Maintain rhythm through the flowing dirt', 'Watch for bumps near the lake', 'Use the handbrake for tight hairpins'],
  }
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
