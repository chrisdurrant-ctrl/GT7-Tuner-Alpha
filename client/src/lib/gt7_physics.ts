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
  damperExpansionFront: number; // 1-10 (rebound)
  damperExpansionRear: number; // 1-10 (rebound)
  damperCompressionFront: number; // 1-10
  damperCompressionRear: number; // 1-10
  camberFront: number; // degrees
  camberRear: number; // degrees
  toeInFront: number; // degrees
  toeInRear: number; // degrees
  
  // Aerodynamics
  downforceFront: number; // lbs
  downforceRear: number; // lbs
  
  // Brakes
  brakeSystemType: 'normal' | 'sports' | 'racing' | 'carbon';
  brakeBalance: number; // -5 to 5 (Front to Rear)
  
  // Differential
  differentialInitialTorque: number; // 0-100
  differentialAcceleration: number; // 0-100
  differentialBraking: number; // 0-100
  
  // Transmission
  gearRatios: number[]; // Multipliers for each gear
  finalDriveRatio: number;
  
  // Tires
  tirePressureFront: number; // psi
  tirePressureRear: number; // psi
  tireGripCoefficient: number; // 0.8-1.2 based on tire type
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
}

// Constants based on GT7 physics
const GRAVITY = 9.81; // m/s²
const AIR_DENSITY = 1.225; // kg/m³
const DRAG_COEFFICIENT = 0.3; // Average for sports cars
const FRONTAL_AREA = 2.2; // m² Average

// Tire grip physics
export const TIRE_GRIP_COEFFICIENTS = {
  'comfort-hard': 0.75,
  'comfort-medium': 0.80,
  'comfort-soft': 0.85,
  'sports-hard': 0.90,
  'sports-medium': 0.95,
  'sports-soft': 1.00,
  'racing-hard': 1.10,
  'racing-medium': 1.20,
  'racing-soft': 1.30,
  'racing-slick': 1.40,
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
 * Based on power-to-weight ratio and tire grip
 */
export function calculate0to60Time(
  power: number,
  weight: number,
  tireGrip: number,
  differentialAccel: number
): number {
  const pwRatio = calculatePowerToWeightRatio(power, weight);
  
  // Base formula: time = sqrt(2 * distance / acceleration)
  // 0-60 mph = 0-26.82 m/s
  // Adjusted for tire grip and differential effectiveness
  const gripFactor = (tireGrip / 1.0) * (1 + differentialAccel / 200);
  const acceleration = (pwRatio * GRAVITY * gripFactor) / 2;
  
  const distance = 26.82 * 26.82 / (2 * acceleration);
  const time = Math.sqrt(2 * distance / acceleration);
  
  return Math.max(2.0, time); // Minimum 2 seconds
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
  const gripFactor = (tireGrip / 1.0) * (1 + differentialAccel / 200);
  const acceleration = (pwRatio * GRAVITY * gripFactor) / 2.5;
  
  const distance = 44.7 * 44.7 / (2 * acceleration);
  const time = Math.sqrt(2 * distance / acceleration);
  
  return Math.max(3.5, time);
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
  const gripFactor = (tireGrip / 1.0) * (1 + differentialAccel / 200);
  const acceleration = (pwRatio * GRAVITY * gripFactor) / 3;
  
  const distance = 55.56 * 55.56 / (2 * acceleration);
  const time = Math.sqrt(2 * distance / acceleration);
  
  return Math.max(5.0, time);
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
  const gripFactor = (tireGrip / 1.0) * (1 + differentialBraking / 200);
  const deceleration = (brakePower * GRAVITY * gripFactor) / 1.5;
  
  // Convert -5..5 to a factor (0 is optimal, deviations reduce efficiency slightly)
  const balanceFactor = 1.0 - (Math.abs(brakeBalance) / 25);
  
  const distance = (initialSpeed * initialSpeed) / (2 * deceleration * balanceFactor);
  return Math.max(20, distance);
}

/**
 * Calculate braking distance from 200 km/h to 0
 */
export function calculateBrakingDistance200to0(
  weight: number,
  brakePower: number,
  brakeBalance: number,
  tireGrip: number,
  differentialBraking: number
): number {
  // Speed: 200 km/h = 55.56 m/s
  const initialSpeed = 55.56;
  
  const gripFactor = (tireGrip / 1.0) * (1 + differentialBraking / 200);
  const deceleration = (brakePower * GRAVITY * gripFactor) / 1.5;
  const balanceFactor = 0.8 + (Math.abs(brakeBalance - 50) / 100) * 0.4;
  
  const distance = (initialSpeed * initialSpeed) / (2 * deceleration * balanceFactor);
  
  return Math.max(50, distance);
}

/**
 * Calculate braking deceleration in g-force
 */
export function calculateBrakingDeceleration(
  brakePower: number,
  tireGrip: number,
  differentialBraking: number
): number {
  const gripFactor = (tireGrip / 1.0) * (1 + differentialBraking / 200);
  const deceleration = (brakePower * gripFactor) / 1.5;
  
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
  // Total downforce in kg (1 lbs ≈ 0.453592 kg)
  const totalDownforceKg = (downforceFront + downforceRear) * 0.453592;
  
  // Camber angle effect on grip (0-3 degrees optimal)
  const camberEffect = 1 + (Math.min(camberFront, camberRear) / 5) * 0.2;
  
  // Anti-roll bar stiffness effect (reduces roll, improves grip)
  const arbEffect = 1 + ((antiRollBarFront + antiRollBarRear) / 20) * 0.15;
  
  // Total grip = (downforce + tire grip) / weight
  const totalGrip = (totalDownforceKg + weight * tireGrip) / weight;
  
  // Lateral acceleration = grip * g * effects
  const lateralAccel = totalGrip * GRAVITY * camberEffect * arbEffect;
  
  return Math.min(lateralAccel / GRAVITY, 2.5); // Cap at 2.5g
}

/**
 * Calculate cornering speed at 1.0g lateral acceleration
 */
export function calculateCorneringSpeed(
  lateralAcceleration: number,
  cornerRadius: number = 100 // meters
): number {
  // v = sqrt(a * r)
  const speed = Math.sqrt(lateralAcceleration * GRAVITY * cornerRadius);
  
  // Convert m/s to km/h
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
  // Convert power to watts (1 BHP ≈ 745.7 watts)
  const powerWatts = power * 745.7;
  
  // Total downforce increases drag
  const totalDownforceKg = (downforceFront + downforceRear) * 0.453592;
  
  // Drag force = 0.5 * air_density * drag_coefficient * frontal_area * v²
  // At top speed, power = drag force * velocity
  // power = 0.5 * rho * Cd * A * v³
  // v = (power / (0.5 * rho * Cd * A))^(1/3)
  
  const dragCoeff = DRAG_COEFFICIENT * (1 + totalDownforceKg / (weight * 10));
  const dragFactor = 0.5 * AIR_DENSITY * dragCoeff * FRONTAL_AREA;
  
  const topSpeedMs = Math.pow(powerWatts / dragFactor, 1 / 3);
  
  // Convert m/s to km/h
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
  // Reference times for 100 rating (very fast cars)
  const ref0to60 = 2.5;
  const ref0to100 = 5.0;
  const ref0to200 = 10.0;
  
  const score60 = Math.max(0, 100 - (time0to60 / ref0to60) * 50);
  const score100 = Math.max(0, 100 - (time0to100 / ref0to100) * 50);
  const score200 = Math.max(0, 100 - (time0to200 / ref0to200) * 50);
  
  return (score60 + score100 + score200) / 3;
}

/**
 * Calculate braking rating (0-100)
 */
export function calculateBrakingRating(
  distance100to0: number,
  distance200to0: number
): number {
  // Reference distances for 100 rating (excellent brakes)
  const ref100to0 = 30;
  const ref200to0 = 80;
  
  const score100 = Math.max(0, 100 - (distance100to0 / ref100to0) * 50);
  const score200 = Math.max(0, 100 - (distance200to0 / ref200to0) * 50);
  
  return (score100 + score200) / 2;
}

/**
 * Calculate cornering rating (0-100)
 */
export function calculateCorneringRating(lateralAcceleration: number): number {
  // Reference lateral acceleration for 100 rating
  const refLateral = 2.0;
  
  const score = Math.max(0, Math.min(100, (lateralAcceleration / refLateral) * 100));
  
  return score;
}

/**
 * Calculate top speed rating (0-100)
 */
export function calculateTopSpeedRating(topSpeed: number): number {
  // Reference top speed for 100 rating
  const refTopSpeed = 350; // km/h
  
  const score = Math.max(0, Math.min(100, (topSpeed / refTopSpeed) * 100));
  
  return score;
}

/**
 * Calculate balance score (how well-rounded the setup is)
 */
export function calculateBalanceScore(
  accelRating: number,
  brakingRating: number,
  corneringRating: number,
  topSpeedRating: number
): number {
  // Calculate standard deviation to measure balance
  const ratings = [accelRating, brakingRating, corneringRating, topSpeedRating];
  const mean = ratings.reduce((a, b) => a + b) / ratings.length;
  const variance = ratings.reduce((a, b) => a + Math.pow(b - mean, 2)) / ratings.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = better balance
  // Max std dev = 50, min = 0
  const balanceScore = Math.max(0, 100 - (stdDev / 50) * 100);
  
  return balanceScore;
}

/**
 * Calculate overall performance rating
 */
export function calculateOverallRating(
  accelRating: number,
  brakingRating: number,
  corneringRating: number,
  topSpeedRating: number
): number {
  // Weighted average (cornering is most important for lap times)
  const weights = {
    accel: 0.2,
    braking: 0.25,
    cornering: 0.35,
    topSpeed: 0.2,
  };
  
  const overall =
    accelRating * weights.accel +
    brakingRating * weights.braking +
    corneringRating * weights.cornering +
    topSpeedRating * weights.topSpeed;
  
  return Math.min(100, overall);
}

/**
 * Calculate all performance metrics from a tuning setup
 */
export function calculatePerformanceMetrics(
  basePower: number,
  baseWeight: number,
  setup: Partial<TuningSetup>
): PerformanceMetrics {
  // Apply defaults
  const s = {
    powerBHP: basePower,
    powerRestriction: 100,
    weightKg: baseWeight,
    ballastKg: 0,
    ballastPosition: 0,
    rideHeightFront: 100,
    rideHeightRear: 100,
    antiRollBarFront: 5,
    antiRollBarRear: 5,
    naturalFrequencyFront: 2.0,
    naturalFrequencyRear: 2.0,
    camberFront: 2.0,
    camberRear: 1.5,
    toeInFront: 0.2,
    toeInRear: 0.1,
    downforceFront: 100,
    downforceRear: 150,
    brakePowerMultiplier: 1.35,
    brakeBalance: 55,
    differentialInitialTorque: 50,
    differentialAcceleration: 60,
    differentialBraking: 50,
    gearRatios: [3.5, 2.5, 1.8, 1.3, 1.0, 0.8],
    finalDriveRatio: 3.5,
    tirePressureFront: 30,
    tirePressureRear: 30,
    tireGripCoefficient: 1.1,
    ...setup,
  };
  
  // Calculate effective values
  const effectivePower = calculateEffectivePower(s.powerBHP, s.powerRestriction);
  const totalWeight = calculateTotalWeight(s.weightKg, s.ballastKg);
  
  // Acceleration metrics
  const accel0to60 = calculate0to60Time(
    effectivePower,
    totalWeight,
    s.tireGripCoefficient,
    s.differentialAcceleration
  );
  const accel0to100 = calculate0to100Time(
    effectivePower,
    totalWeight,
    s.tireGripCoefficient,
    s.differentialAcceleration
  );
  const accel0to200 = calculate0to200Time(
    effectivePower,
    totalWeight,
    s.tireGripCoefficient,
    s.differentialAcceleration
  );
  const accelRating = calculateAccelerationRating(accel0to60, accel0to100, accel0to200);
  
  // Braking metrics
  const brake100to0 = calculateBrakingDistance100to0(
    totalWeight,
    s.brakePowerMultiplier,
    s.brakeBalance,
    s.tireGripCoefficient,
    s.differentialBraking
  );
  const brake200to0 = calculateBrakingDistance200to0(
    totalWeight,
    s.brakePowerMultiplier,
    s.brakeBalance,
    s.tireGripCoefficient,
    s.differentialBraking
  );
  const brakeDecel = calculateBrakingDeceleration(
    s.brakePowerMultiplier,
    s.tireGripCoefficient,
    s.differentialBraking
  );
  const brakingRating = calculateBrakingRating(brake100to0, brake200to0);
  
  // Cornering metrics
  const lateralAccel = calculateLateralAcceleration(
    s.downforceFront,
    s.downforceRear,
    totalWeight,
    s.camberFront,
    s.camberRear,
    s.antiRollBarFront,
    s.antiRollBarRear,
    s.tireGripCoefficient
  );
  const corneringSpeed = calculateCorneringSpeed(lateralAccel);
  const corneringRating = calculateCorneringRating(lateralAccel);
  
  // Top speed
  const topSpeed = calculateTopSpeed(
    effectivePower,
    totalWeight,
    s.downforceFront,
    s.downforceRear
  );
  const topSpeedRating = calculateTopSpeedRating(topSpeed);
  
  // Overall ratings
  const balanceScore = calculateBalanceScore(accelRating, brakingRating, corneringRating, topSpeedRating);
  const overallRating = calculateOverallRating(accelRating, brakingRating, corneringRating, topSpeedRating);
  
  return {
    acceleration0to60: accel0to60,
    acceleration0to100: accel0to100,
    acceleration0to200: accel0to200,
    accelerationRating: accelRating,
    brakingDistance100to0: brake100to0,
    brakingDistance200to0: brake200to0,
    brakingDeceleration: brakeDecel,
    brakingRating: brakingRating,
    lateralAcceleration: lateralAccel,
    corneringSpeed: corneringSpeed,
    corneringRating: corneringRating,
    topSpeed: topSpeed,
    topSpeedRating: topSpeedRating,
    overallRating: overallRating,
    balanceScore: balanceScore,
  };
}
