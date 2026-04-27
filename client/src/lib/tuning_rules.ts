/**
 * GT7 Tuning Rules and Limits
 * This file defines the authentic limits for different car categories
 * and suspension types based on Gran Turismo 7 physics.
 */

export type CarCategory = 'road' | 'gr3' | 'gr4' | 'grb' | 'race' | 'vgt';

export interface SuspensionLimits {
  rideHeight: [number, number];
  naturalFrequency: [number, number];
  damperExpansion: [number, number];
  damperCompression: [number, number];
}

export const CATEGORY_LIMITS: Record<CarCategory, SuspensionLimits> = {
  road: {
    rideHeight: [80, 200],
    naturalFrequency: [1.00, 3.50],
    damperExpansion: [1, 10],
    damperCompression: [1, 10],
  },
  gr4: {
    rideHeight: [60, 130],
    naturalFrequency: [2.50, 4.50],
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
    naturalFrequency: [1.50, 3.00],
    damperExpansion: [20, 40],
    damperCompression: [15, 35],
  },
  race: { // Gr.1, Gr.2, etc.
    rideHeight: [45, 90],
    naturalFrequency: [3.50, 5.50],
    damperExpansion: [35, 55],
    damperCompression: [25, 45],
  },
  vgt: {
    rideHeight: [40, 100],
    naturalFrequency: [2.50, 5.00],
    damperExpansion: [30, 50],
    damperCompression: [20, 40],
  }
};

export const UPGRADE_MODIFIERS = {
  standard: { nf_mult: 1.0, rh_offset: 0 },
  street: { nf_mult: 1.1, rh_offset: -10 },
  sports: { nf_mult: 1.3, rh_offset: -20 },
  racing: { nf_mult: 1.6, rh_offset: -35 },
};

/**
 * Get dynamic limits based on car category and suspension upgrade
 */
export function getDynamicLimits(category: CarCategory, upgrade: keyof typeof UPGRADE_MODIFIERS): SuspensionLimits {
  const base = CATEGORY_LIMITS[category] || CATEGORY_LIMITS.road;
  const mod = UPGRADE_MODIFIERS[upgrade];

  // If road car and racing suspension, use Gr.4 style limits
  if (category === 'road' && upgrade === 'racing') {
    return CATEGORY_LIMITS.gr4;
  }

  // Otherwise scale based on upgrade
  return {
    rideHeight: [Math.max(40, base.rideHeight[0] + mod.rh_offset), base.rideHeight[1]],
    naturalFrequency: [base.naturalFrequency[0], Math.min(6.0, base.naturalFrequency[1] * mod.nf_mult)],
    damperExpansion: upgrade === 'racing' || category !== 'road' ? [30, 50] : [1, 10],
    damperCompression: upgrade === 'racing' || category !== 'road' ? [20, 40] : [1, 10],
  };
}
