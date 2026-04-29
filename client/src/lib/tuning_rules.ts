/**
 * GT7 Tuning Rules and Limits
 * This file defines the authentic limits for different car categories
 * and suspension types based on Gran Turismo 7 physics and Flux89 logic.
 */

export type CarCategory = 'road' | 'gr3' | 'gr4' | 'grb' | 'race' | 'vgt' | 'supercar';

export interface SuspensionLimits {
  rideHeight: [number, number];
  naturalFrequency: [number, number];
  damperExpansion: [number, number];
  damperCompression: [number, number];
}

export const CATEGORY_LIMITS: Record<CarCategory, SuspensionLimits> = {
  road: {
    rideHeight: [80, 200],
    naturalFrequency: [1.00, 3.10],
    damperExpansion: [30, 50],
    damperCompression: [20, 40],
  },
  supercar: {
    rideHeight: [70, 150],
    naturalFrequency: [1.50, 4.00],
    damperExpansion: [30, 50],
    damperCompression: [20, 40],
  },
  gr4: {
    rideHeight: [60, 130],
    naturalFrequency: [2.00, 4.50],
    damperExpansion: [30, 50],
    damperCompression: [20, 40],
  },
  gr3: {
    rideHeight: [50, 100],
    naturalFrequency: [3.00, 5.00],
    damperExpansion: [30, 50],
    damperCompression: [20, 40],
  },
  grb: { // Rally
    rideHeight: [120, 250],
    naturalFrequency: [1.50, 3.50],
    damperExpansion: [30, 50],
    damperCompression: [20, 40],
  },
  race: { // Gr.1, Gr.2, etc.
    rideHeight: [45, 90],
    naturalFrequency: [3.50, 6.00],
    damperExpansion: [30, 50],
    damperCompression: [20, 40],
  },
  vgt: {
    rideHeight: [40, 100],
    naturalFrequency: [2.50, 5.50],
    damperExpansion: [30, 50],
    damperCompression: [20, 40],
  }
};

/**
 * Get dynamic limits based on car category and suspension upgrade
 */
export function getDynamicLimits(
  category: CarCategory, 
  upgrade: 'standard' | 'street' | 'sports' | 'racing',
  carSpecificLimits?: Partial<SuspensionLimits>
): SuspensionLimits {
  const base = CATEGORY_LIMITS[category] || CATEGORY_LIMITS.road;
  
  // Default limits for non-racing suspension on road cars
  const isRacingSuspension = upgrade === 'racing' || category !== 'road';
  
  const limits: SuspensionLimits = {
    rideHeight: [...base.rideHeight] as [number, number],
    naturalFrequency: [...base.naturalFrequency] as [number, number],
    damperExpansion: isRacingSuspension ? [30, 50] : [1, 10],
    damperCompression: isRacingSuspension ? [20, 40] : [1, 10],
  };

  // Adjust NF and Ride Height based on upgrade tier for road cars
  if (category === 'road' || category === 'supercar') {
    if (upgrade === 'standard') {
      limits.naturalFrequency[1] = Math.min(limits.naturalFrequency[1], 1.80);
      limits.rideHeight[0] += 20;
    } else if (upgrade === 'street') {
      limits.naturalFrequency[1] = Math.min(limits.naturalFrequency[1], 2.20);
      limits.rideHeight[0] += 10;
    } else if (upgrade === 'sports') {
      limits.naturalFrequency[1] = Math.min(limits.naturalFrequency[1], 2.60);
      limits.rideHeight[0] += 5;
    }
  }

  // Apply car-specific overrides if they exist
  if (carSpecificLimits) {
    if (carSpecificLimits.rideHeight) limits.rideHeight = carSpecificLimits.rideHeight;
    if (carSpecificLimits.naturalFrequency) limits.naturalFrequency = carSpecificLimits.naturalFrequency;
    if (carSpecificLimits.damperExpansion) limits.damperExpansion = carSpecificLimits.damperExpansion;
    if (carSpecificLimits.damperCompression) limits.damperCompression = carSpecificLimits.damperCompression;
  }

  return limits;
}
