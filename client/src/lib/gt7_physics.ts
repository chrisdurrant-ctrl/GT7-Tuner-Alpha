/**
 * Gran Turismo 7 Physics Engine
 * Realistic physics calculations based on GT7's actual mechanics
 * 
 * Includes:
 * - Acceleration calculations (power-to-weight ratio)
 * - Braking distance and deceleration
 * - Cornering grip and lateral acceleration
 * - Top speed calculations
 * - Suspension and handling dynamics
 * - Tire physics and grip coefficients
 */

export interface TuningSetup {
  // Engine
  powerBHP: number;
  powerRestriction: number; // 0-100%
  
  // Weight
  weightKg: number;
  ballastKg: number;
  ballastPosition: number; // -100 to 100 (front to rear)
  
  // Suspension
  rideHeightFront: number; // mm
  rideHeightRear: number; // mm
  antiRollBarFront: number; // 1-10
  antiRollBarRear: number; // 1-10
  naturalFrequencyFront: number; // Hz
  naturalFrequencyRear: number; // Hz
  damperExpansionFront: number; // 30-50 (rebound)
  damperExpansionRear: number; // 30-50 (rebound)
  damperCompressionFront: number; // 20-40
  damperCompressionRear: number; // 20-40
  camberFront: number; // degrees
  camberRear: number; // degrees
  toeInFront: number; // degrees
  toeInRear: number; // degrees
  
  // Aerodynamics
  downforceFront: number; // lbs
  downforceRear: number; // lbs
  frontSplitterFitted: boolean;
  rearWingFitted: boolean;
  
  // Brakes
  brakeSystemType: 'normal' | 'sports' | 'racing' | 'carbon';
  brakeBalance: number; // -5 to 5 (Front to Rear)
  
  // Differential
  differentialInitialTorque: number; // 5-60
  differentialAcceleration: number; // 5-60
  differentialBraking: number; // 5-60
  
  // Transmission
  gearRatios: number[]; // Multipliers for each gear
  finalDriveRatio: number;
  
  // Tires
  tirePressureFront: number; // psi
  tirePressureRear: number; // psi
  tireGripCoefficient: number; // 0.8-1.3 based on tire type
}

export interface PerformanceMetrics {
  // Acceleration
  acceleration0to60: number; // seconds
  acceleration0to100: number; // seconds
  acceleration0to200: number; // seconds
  accelerationRating: number; // 0-100
  
  // Braking
  brakingDistance100to0: number; // meters
  brakingDistance200to0: number; // meters
  brakingDeceleration: number; // g-force
  brakingRating: number; // 0-100
  
  // Cornering
  lateralAcceleration: number; // g-force
  corneringSpeed: number; // km/h (at 1.0g lateral)
  corneringRating: number; // 0-100
  
  // Top Speed
  topSpeed: number; // km/h
  topSpeedRating: number; // 0-100
  
  // Overall
  overallRating: number; // 0-100
  balanceScore: number; // How balanced the setup is
  handlingBalance: number; // -100 (Understeer) to 100 (Oversteer)
  aeroBalance: number; // Front %
  suspensionStiffness: number; // 0-100
}

// Constants based on GT7 physics
const GRAVITY = 9.81; // m/s²
const AIR_DENSITY = 1.225; // kg/m³
const DRAG_COEFFICIENT = 0.3; // Average for sports cars
const FRONTAL_AREA = 2.2; // m² Average

// Tire grip physics - Based on Flux89 / GT7 reality
export const TIRE_GRIP_COEFFICIENTS = {
  'comfort-hard': 0.75,
  'comfort-medium': 0.80,
  'comfort-soft': 0.85,
  'sports-hard': 0.90,
  'sports-medium': 0.95,
  'sports-soft': 1.00,
  'racing-hard': 1.15,
  'racing-medium': 1.25,
  'racing-soft': 1.35,
};

// Brake system multipliers
export const BRAKE_SYSTEMS = {
  normal: { name: 'Normal Brakes', multiplier: 1.0 },
  sports: { name: 'Sports Brakes & Pads', multiplier: 1.15 },
  racing: { name: 'Racing Brakes & Pads', multiplier: 1.35 },
  carbon: { name: 'Carbon Ceramic Discs & Pads', multiplier: 1.45 },
};

/**
 * Calculate effective power after restriction
 */
export function calculateEffectivePower(basePower: number, restriction: number): number {
  return basePower * (restriction / 100);
}

/**
 * Calculate total vehicle weight including ballast
 */
export function calculateTotalWeight(baseWeight: number, ballast: number): number {
  return baseWeight + ballast;
}

/**
 * Calculate power-to-weight ratio (BHP/kg)
 */
export function calculatePowerToWeightRatio(power: number, weight: number): number {
  return power / weight;
}

/**
 * Calculate 0-60 mph acceleration time
 */
export function calculate0to60Time(
  power: number,
  weight: number,
  tireGrip: number,
  differentialAccel: number
): number {
  const pwRatio = calculatePowerToWeightRatio(power, weight);
  
  // Adjusted for tire grip and differential effectiveness (5-60 scale)
  const gripFactor = (tireGrip / 1.0) * (1 + (differentialAccel - 5) / 500);
  const acceleration = (pwRatio * GRAVITY * gripFactor) / 2;
  
  const distance = 26.82 * 26.82 / (2 * acceleration);
  const time = Math.sqrt(2 * distance / acceleration);
  
  return Math.max(1.8, time); // Minimum realistic time
}

/**
 * Calculate 0-100 mph acceleration time
 */
export function calculate0to100Time(
  power: number,
  weight: number,
  tireGrip: number,
  differentialAccel: number
): number {
  const pwRatio = calculatePowerToWeightRatio(power, weight);
  const gripFactor = (tireGrip / 1.0) * (1 + (differentialAccel - 5) / 500);
  const acceleration = (pwRatio * GRAVITY * gripFactor) / 2.5;
  
  const distance = 44.7 * 44.7 / (2 * acceleration);
  const time = Math.sqrt(2 * distance / acceleration);
  
  return Math.max(3.2, time);
}

/**
 * Calculate 0-200 km/h acceleration time
 */
export function calculate0to200Time(
  power: number,
  weight: number,
  tireGrip: number,
  differentialAccel: number
): number {
  const pwRatio = calculatePowerToWeightRatio(power, weight);
  const gripFactor = (tireGrip / 1.0) * (1 + (differentialAccel - 5) / 500);
  const acceleration = (pwRatio * GRAVITY * gripFactor) / 3;
  
  const distance = 55.56 * 55.56 / (2 * acceleration);
  const time = Math.sqrt(2 * distance / acceleration);
  
  return Math.max(4.5, time);
}

/**
 * Calculate braking distance from 100 km/h to 0
 */
export function calculateBrakingDistance100to0(
  weight: number,
  brakeSystem: keyof typeof BRAKE_SYSTEMS,
  brakeBalance: number,
  tireGrip: number,
  differentialBraking: number
): number {
  const initialSpeed = 27.78;
  const brakePower = BRAKE_SYSTEMS[brakeSystem].multiplier;
  // Differential braking helps stability, slight effect on distance
  const gripFactor = (tireGrip / 1.0) * (1 + (differentialBraking - 5) / 1000);
  const deceleration = (brakePower * GRAVITY * gripFactor) / 1.4;
  
  // Brake balance effect (-5 to 5). 0 is optimal for distance in this model.
  const balanceFactor = 1.0 - (Math.abs(brakeBalance) / 50);
  
  const distance = (initialSpeed * initialSpeed) / (2 * deceleration * balanceFactor);
  return Math.max(18, distance);
}

/**
 * Calculate braking distance from 200 km/h to 0
 */
export function calculateBrakingDistance200to0(
  weight: number,
  brakeSystem: keyof typeof BRAKE_SYSTEMS,
  brakeBalance: number,
  tireGrip: number,
  differentialBraking: number
): number {
  const initialSpeed = 55.56;
  const brakePower = BRAKE_SYSTEMS[brakeSystem].multiplier;
  const gripFactor = (tireGrip / 1.0) * (1 + (differentialBraking - 5) / 1000);
  const deceleration = (brakePower * GRAVITY * gripFactor) / 1.4;
  const balanceFactor = 1.0 - (Math.abs(brakeBalance) / 50);
  
  const distance = (initialSpeed * initialSpeed) / (2 * deceleration * balanceFactor);
  
  return Math.max(45, distance);
}

/**
 * Calculate braking deceleration in g-force
 */
export function calculateBrakingDeceleration(
  brakeSystem: keyof typeof BRAKE_SYSTEMS,
  tireGrip: number,
  differentialBraking: number
): number {
  const brakePower = BRAKE_SYSTEMS[brakeSystem].multiplier;
  const gripFactor = (tireGrip / 1.0) * (1 + (differentialBraking - 5) / 1000);
  const deceleration = (brakePower * gripFactor) / 1.4;
  
  return deceleration;
}

/**
 * Calculate lateral acceleration (cornering grip) in g-force
 */
export function calculateLateralAcceleration(
  downforceFront: number,
  downforceRear: number,
  weight: number,
  camberFront: number,
  camberRear: number,
  antiRollBarFront: number,
  antiRollBarRear: number,
  tireGrip: number
): number {
  // Total downforce in kg
  const totalDownforceKg = (downforceFront + downforceRear) * 0.453592;
  
  // Camber effect (Optimal around 2.0-3.0 for racing tires)
  const camberEffect = 1 + (Math.min(camberFront, 3.0) / 10) * 0.15;
  
  // ARB effect
  const arbEffect = 1 + ((antiRollBarFront + antiRollBarRear) / 20) * 0.1;
  
  // Total grip
  const totalGrip = (totalDownforceKg + weight * tireGrip) / weight;
  
  const lateralAccel = totalGrip * camberEffect * arbEffect;
  
  return Math.min(lateralAccel, 3.5); // Cap at 3.5g for extreme downforce cars
}

/**
 * Calculate cornering speed at 1.0g lateral acceleration
 */
export function calculateCorneringSpeed(
  lateralAcceleration: number,
  cornerRadius: number = 100 // meters
): number {
  const speed = Math.sqrt(lateralAcceleration * GRAVITY * cornerRadius);
  return speed * 3.6;
}

/**
 * Calculate top speed based on power and aerodynamic drag
 */
export function calculateTopSpeed(
  power: number,
  weight: number,
  downforceFront: number,
  downforceRear: number
): number {
  const powerWatts = power * 745.7;
  const totalDownforceKg = (downforceFront + downforceRear) * 0.453592;
  
  // Increased downforce = increased drag
  const dragCoeff = DRAG_COEFFICIENT * (1 + totalDownforceKg / (weight * 5));
  const dragFactor = 0.5 * AIR_DENSITY * dragCoeff * FRONTAL_AREA;
  
  const topSpeedMs = Math.pow(powerWatts / dragFactor, 1 / 3);
  return topSpeedMs * 3.6;
}

/**
 * Calculate acceleration rating (0-100)
 */
export function calculateAccelerationRating(
  time0to60: number,
  time0to100: number,
  time0to200: number
): number {
  const ref0to60 = 2.0;
  const ref0to100 = 4.5;
  const ref0to200 = 9.0;
  
  const score60 = Math.max(0, 100 - (time0to60 - ref0to60) * 20);
  const score100 = Math.max(0, 100 - (time0to100 - ref0to100) * 10);
  const score200 = Math.max(0, 100 - (time0to200 - ref0to200) * 5);
  
  return (score60 * 0.4 + score100 * 0.3 + score200 * 0.3);
}

/**
 * Calculate braking rating (0-100)
 */
export function calculateBrakingRating(
  distance100: number,
  deceleration: number
): number {
  const refDistance = 25.0;
  const refDecel = 1.5;
  
  const scoreDist = Math.max(0, 100 - (distance100 - refDistance) * 4);
  const scoreDecel = Math.min(100, (deceleration / refDecel) * 100);
  
  return (scoreDist * 0.6 + scoreDecel * 0.4);
}

/**
 * Calculate cornering rating (0-100)
 */
export function calculateCorneringRating(
  lateralAccel: number,
  corneringSpeed: number
): number {
  const refAccel = 2.0;
  const refSpeed = 150;
  
  const scoreAccel = Math.min(100, (lateralAccel / refAccel) * 100);
  const scoreSpeed = Math.min(100, (corneringSpeed / refSpeed) * 100);
  
  return (scoreAccel * 0.7 + scoreSpeed * 0.3);
}

/**
 * Calculate top speed rating (0-100)
 */
export function calculateTopSpeedRating(speed: number): number {
  const refSpeed = 400;
  return Math.min(100, (speed / refSpeed) * 100);
}

/**
 * Calculate overall rating (0-100)
 */
export function calculateOverallRating(
  accel: number,
  brake: number,
  corner: number,
  topSpeed: number
): number {
  return (accel * 0.3 + brake * 0.2 + corner * 0.3 + topSpeed * 0.2);
}

/**
 * Calculate balance score (0-100)
 * Higher is better, 100 means perfect balance
 */
export function calculateBalanceScore(setup: TuningSetup): number {
  let score = 100;
  
  // Ride height rake (ideal is 0 to +10mm rear)
  const rake = setup.rideHeightRear - setup.rideHeightFront;
  if (rake < 0) score -= Math.abs(rake) * 2; // Negative rake is bad
  if (rake > 20) score -= (rake - 20) * 1; // Excessive rake
  
  // Downforce balance (ideal is roughly 1:2 to 1:3 front to rear)
  if (setup.downforceFront > 0 && setup.downforceRear > 0) {
    const ratio = setup.downforceRear / setup.downforceFront;
    if (ratio < 1.5) score -= (1.5 - ratio) * 20;
    if (ratio > 4.0) score -= (ratio - 4.0) * 10;
  }
  
  // Natural frequency balance (Rear should be slightly stiffer)
  const nfDiff = setup.naturalFrequencyRear - setup.naturalFrequencyFront;
  if (nfDiff < 0) score -= Math.abs(nfDiff) * 15;
  if (nfDiff > 0.5) score -= (nfDiff - 0.5) * 10;
  
  return Math.max(0, score);
}

/**
 * Calculate handling balance (-100 to 100)
 * Negative = Understeer, Positive = Oversteer
 */
export function calculateHandlingBalance(setup: TuningSetup): number {
  let balance = 0;
  
  // ARB Balance
  const arbDiff = setup.antiRollBarRear - setup.antiRollBarFront;
  balance += arbDiff * 10;
  
  // NF Balance
  const nfDiff = (setup.naturalFrequencyRear - setup.naturalFrequencyFront) * 100;
  balance += (nfDiff - 10) * 2; // Offset by 0.1Hz as neutral
  
  // Camber Balance
  const camberDiff = setup.camberFront - setup.camberRear;
  balance += camberDiff * 5;
  
  // Toe Balance
  balance -= setup.toeInFront * 100;
  balance += setup.toeInRear * 200;
  
  // Aero Balance
  if (setup.downforceFront > 0 && setup.downforceRear > 0) {
    const aeroRatio = setup.downforceFront / (setup.downforceFront + setup.downforceRear);
    balance += (aeroRatio - 0.33) * 300; // 33% front is neutral
  }
  
  // Brake Balance
  balance += setup.brakeBalance * 5;
  
  return Math.min(100, Math.max(-100, balance));
}

/**
 * Calculate aero balance percentage (Front %)
 */
export function calculateAeroBalance(setup: TuningSetup): number {
  const total = setup.downforceFront + setup.downforceRear;
  if (total === 0) return 0;
  return (setup.downforceFront / total) * 100;
}

/**
 * Calculate overall suspension stiffness (0-100)
 */
export function calculateSuspensionStiffness(setup: TuningSetup, limits: [number, number]): number {
  const avgNF = (setup.naturalFrequencyFront + setup.naturalFrequencyRear) / 2;
  const range = limits[1] - limits[0];
  if (range === 0) return 50;
  return ((avgNF - limits[0]) / range) * 100;
}
