import { useState, useMemo, useEffect } from 'react';
import { GT7_CARS, GT7Car } from '@/lib/gt7_cars';
import { TRACK_REGIONS, TrackCircuit } from '@/lib/gt7_tracks';
import { 
  TuningSetup, 
  PerformanceMetrics, 
  TIRE_GRIP_COEFFICIENTS,
  calculateEffectivePower,
  calculateTotalWeight,
  calculate0to60Time,
  calculate0to100Time,
  calculate0to200Time,
  calculateBrakingDistance100to0,
  calculateBrakingDistance200to0,
  calculateBrakingDeceleration,
  calculateLateralAcceleration,
  calculateCorneringSpeed,
  calculateTopSpeed,
  calculateAccelerationRating,
  calculateBrakingRating,
  calculateCorneringRating,
  calculateTopSpeedRating,
  calculateOverallRating,
  calculateHandlingBalance,
  calculateAeroBalance,
  calculateSuspensionStiffness
} from '@/lib/gt7_physics';
import { getDynamicLimits, CarCategory } from '@/lib/tuning_rules';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';

export default function TuningApp() {
  // --- STATE ---
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>(GT7_CARS[0]?.manufacturer || '');
  const [selectedModel, setSelectedModel] = useState<string>(GT7_CARS[0]?.model || '');
  const [selectedCar, setSelectedCar] = useState<GT7Car | null>(GT7_CARS[0] || null);
  
  // Hierarchical Track Selection
  const [selectedRegion, setSelectedRegion] = useState<string>(TRACK_REGIONS[0].name);
  const [selectedLocation, setSelectedLocation] = useState<string>(TRACK_REGIONS[0].locations[0].name);
  const [selectedCircuit, setSelectedCircuit] = useState<TrackCircuit | null>(TRACK_REGIONS[0].locations[0].circuits[0]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');

  const [tuningSetup, setTuningSetup] = useState<Partial<TuningSetup>>({
    powerRestriction: 100,
    ballastKg: 0,
    ballastPosition: 0,
    rideHeightFront: 100,
    rideHeightRear: 100,
    antiRollBarFront: 5,
    antiRollBarRear: 5,
    naturalFrequencyFront: 2.0,
    naturalFrequencyRear: 2.1,
    damperExpansionFront: 40,
    damperExpansionRear: 40,
    damperCompressionFront: 30,
    damperCompressionRear: 30,
    camberFront: 2.0,
    camberRear: 1.5,
    toeInFront: 0.0,
    toeInRear: 0.05,
    downforceFront: 100,
    downforceRear: 150,
    frontSplitterFitted: false,
    rearWingFitted: false,
    brakeSystemType: 'racing',
    brakeBalance: 0,
    differentialInitialTorque: 10,
    differentialAcceleration: 30,
    differentialBraking: 15,
    tirePressureFront: 30,
    tirePressureRear: 30,
    tireGripCoefficient: 1.15, // Racing: Hard
  });

  const [suspensionType, setSuspensionType] = useState<'standard' | 'street' | 'sports' | 'racing'>('standard');
  const [customBhp, setCustomBhp] = useState<string>('');
  const [customWeight, setCustomWeight] = useState<string>('');
  const [tuningMode, setTuningMode] = useState<'balanced' | 'acceleration' | 'cornering' | 'braking' | 'track'>('balanced');

  // Manual Limits for Master Calibration
  const [manualLimits, setManualLimits] = useState<{
    rideHeightFront: [number | null, number | null],
    rideHeightRear: [number | null, number | null],
    naturalFrequencyFront: [number | null, number | null],
    naturalFrequencyRear: [number | null, number | null],
    downforceFront: [number | null, number | null],
    downforceRear: [number | null, number | null]
  }>({
    rideHeightFront: [null, null],
    rideHeightRear: [null, null],
    naturalFrequencyFront: [null, null],
    naturalFrequencyRear: [null, null],
    downforceFront: [null, null],
    downforceRear: [null, null]
  });

  const [troubleshootIssue, setTroubleshootIssue] = useState<string>('');
  const [troubleshootSteps, setTroubleshootSteps] = useState<{part: string, action: string, reason: string}[]>([]);

  // --- MEMOS ---
  const carCategory = useMemo((): CarCategory => {
    if (!selectedCar) return 'road';
    const model = selectedCar.model.toLowerCase();
    if (model.includes('gr.3') || model.includes('gt3')) return 'gr3';
    if (model.includes('gr.4') || model.includes('gt4')) return 'gr4';
    if (model.includes('gr.b') || model.includes('rally')) return 'grb';
    if (model.includes('gr.1') || model.includes('gr.2') || model.includes('race car')) return 'race';
    if (model.includes('vgt') || model.includes('vision')) return 'vgt';
    if (model.includes('ferrari') || model.includes('lamborghini') || model.includes('porsche') || model.includes('mclaren')) return 'supercar';
    return 'road';
  }, [selectedCar]);

  const limits = useMemo(() => {
    const baseLimits = getDynamicLimits(carCategory, suspensionType, selectedCar?.tuningLimits);
    
    // Override with manual limits if provided
    return {
      ...baseLimits,
      rideHeightFront: [
        manualLimits.rideHeightFront[0] !== null ? manualLimits.rideHeightFront[0] : baseLimits.rideHeight[0],
        manualLimits.rideHeightFront[1] !== null ? manualLimits.rideHeightFront[1] : baseLimits.rideHeight[1]
      ] as [number, number],
      rideHeightRear: [
        manualLimits.rideHeightRear[0] !== null ? manualLimits.rideHeightRear[0] : baseLimits.rideHeight[0],
        manualLimits.rideHeightRear[1] !== null ? manualLimits.rideHeightRear[1] : baseLimits.rideHeight[1]
      ] as [number, number],
      naturalFrequencyFront: [
        manualLimits.naturalFrequencyFront[0] !== null ? manualLimits.naturalFrequencyFront[0] : baseLimits.naturalFrequency[0],
        manualLimits.naturalFrequencyFront[1] !== null ? manualLimits.naturalFrequencyFront[1] : baseLimits.naturalFrequency[1]
      ] as [number, number],
      naturalFrequencyRear: [
        manualLimits.naturalFrequencyRear[0] !== null ? manualLimits.naturalFrequencyRear[0] : baseLimits.naturalFrequency[0],
        manualLimits.naturalFrequencyRear[1] !== null ? manualLimits.naturalFrequencyRear[1] : baseLimits.naturalFrequency[1]
      ] as [number, number],
      downforceFront: [
        manualLimits.downforceFront[0] !== null ? manualLimits.downforceFront[0] : (tuningSetup.frontSplitterFitted ? 150 : 50),
        manualLimits.downforceFront[1] !== null ? manualLimits.downforceFront[1] : (tuningSetup.frontSplitterFitted ? 800 : 500)
      ] as [number, number],
      downforceRear: [
        manualLimits.downforceRear[0] !== null ? manualLimits.downforceRear[0] : (tuningSetup.rearWingFitted ? 250 : 100),
        manualLimits.downforceRear[1] !== null ? manualLimits.downforceRear[1] : (tuningSetup.rearWingFitted ? 1200 : 600)
      ] as [number, number]
    };
  }, [carCategory, suspensionType, selectedCar, manualLimits, tuningSetup.frontSplitterFitted, tuningSetup.rearWingFitted]);

  const manufacturers = useMemo(() => Array.from(new Set(GT7_CARS.map(car => car.manufacturer))).sort(), []);
  const models = useMemo(() => GT7_CARS.filter(car => car.manufacturer === selectedManufacturer).map(car => car.model).sort(), [selectedManufacturer]);
  
  const currentRegion = useMemo(() => TRACK_REGIONS.find(r => r.name === selectedRegion), [selectedRegion]);
  const currentLocations = useMemo(() => currentRegion?.locations || [], [currentRegion]);
  const currentLocation = useMemo(() => currentLocations.find(l => l.name === selectedLocation), [currentLocations, selectedLocation]);
  const currentCircuits = useMemo(() => currentLocation?.circuits || [], [currentLocation]);

  useEffect(() => {
    if (selectedCircuit?.layouts && selectedCircuit.layouts.length > 0) {
      setSelectedLayoutId(selectedCircuit.layouts[0].id);
    } else {
      setSelectedLayoutId('');
    }
  }, [selectedCircuit]);

  // --- ACTIONS ---
  const updateTuning = (key: keyof TuningSetup, value: any) => {
    setTuningSetup(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (mode: typeof tuningMode) => {
    setTuningMode(mode);
    
    const clamp = (val: number, range: [number, number]) => Math.min(Math.max(val, range[0]), range[1]);
    
    // Base NF offset
    const nfBaseFront = limits.naturalFrequencyFront[0];
    const nfRangeFront = limits.naturalFrequencyFront[1] - limits.naturalFrequencyFront[0];
    const nfBaseRear = limits.naturalFrequencyRear[0];
    const nfRangeRear = limits.naturalFrequencyRear[1] - limits.naturalFrequencyRear[0];
    
    // Differential Baseline by Drivetrain (Flux89)
    const drivetrain = selectedCar?.drivetrain || 'FR';
    let lsdInit = 10, lsdAccel = 30, lsdBraking = 15;
    if (drivetrain === 'FF') { lsdInit = 15; lsdAccel = 35; lsdBraking = 10; }
    else if (drivetrain === 'MR') { lsdInit = 8; lsdAccel = 15; lsdBraking = 25; }
    else if (drivetrain === 'RR') { lsdInit = 10; lsdAccel = 15; lsdBraking = 30; }
    else if (drivetrain === 'AWD') { lsdInit = 8; lsdAccel = 20; lsdBraking = 10; }

    const newSetup: Partial<TuningSetup> = { ...tuningSetup };

    // Auto-adjust Aero Parts based on mode
    if (mode === 'cornering') {
      newSetup.frontSplitterFitted = true;
      newSetup.rearWingFitted = true;
    } else if (mode === 'acceleration') {
      newSetup.frontSplitterFitted = false;
      newSetup.rearWingFitted = false;
    }

    const isAero = newSetup.frontSplitterFitted || newSetup.rearWingFitted || carCategory !== 'road';

    if (mode === 'balanced') {
      newSetup.rideHeightFront = clamp(limits.rideHeightFront[0] + 5, limits.rideHeightFront);
      newSetup.rideHeightRear = clamp(limits.rideHeightRear[0] + 10, limits.rideHeightRear);
      newSetup.naturalFrequencyFront = clamp(nfBaseFront + nfRangeFront * 0.4, limits.naturalFrequencyFront);
      newSetup.naturalFrequencyRear = clamp(nfBaseRear + nfRangeRear * 0.45, limits.naturalFrequencyRear);
      newSetup.antiRollBarFront = 5; newSetup.antiRollBarRear = 5;
      newSetup.damperCompressionFront = 30; newSetup.damperCompressionRear = 30;
      newSetup.damperExpansionFront = 40; newSetup.damperExpansionRear = 40;
      newSetup.brakeBalance = 0;
      newSetup.differentialInitialTorque = lsdInit;
      newSetup.differentialAcceleration = lsdAccel;
      newSetup.differentialBraking = lsdBraking;
      newSetup.downforceFront = clamp(isAero ? limits.downforceFront[0] + (limits.downforceFront[1] - limits.downforceFront[0]) * 0.4 : 100, limits.downforceFront);
      newSetup.downforceRear = clamp(isAero ? limits.downforceRear[0] + (limits.downforceRear[1] - limits.downforceRear[0]) * 0.4 : 150, limits.downforceRear);
    } else if (mode === 'acceleration') {
      newSetup.rideHeightFront = clamp(limits.rideHeightFront[0] + 10, limits.rideHeightFront);
      newSetup.rideHeightRear = clamp(limits.rideHeightRear[0] + 20, limits.rideHeightRear);
      newSetup.naturalFrequencyFront = clamp(nfBaseFront + nfRangeFront * 0.3, limits.naturalFrequencyFront);
      newSetup.naturalFrequencyRear = clamp(nfBaseRear + nfRangeRear * 0.35, limits.naturalFrequencyRear);
      newSetup.antiRollBarFront = 4; newSetup.antiRollBarRear = 6;
      newSetup.differentialAcceleration = clamp(lsdAccel + 15, [5, 60]);
      newSetup.brakeBalance = 1;
      newSetup.downforceFront = clamp(isAero ? limits.downforceFront[0] + (limits.downforceFront[1] - limits.downforceFront[0]) * 0.2 : 50, limits.downforceFront);
      newSetup.downforceRear = clamp(isAero ? limits.downforceRear[0] + (limits.downforceRear[1] - limits.downforceRear[0]) * 0.2 : 75, limits.downforceRear);
    } else if (mode === 'cornering') {
      newSetup.rideHeightFront = clamp(limits.rideHeightFront[0], limits.rideHeightFront);
      newSetup.rideHeightRear = clamp(limits.rideHeightRear[0] + 5, limits.rideHeightRear);
      newSetup.naturalFrequencyFront = clamp(nfBaseFront + nfRangeFront * 0.7, limits.naturalFrequencyFront);
      newSetup.naturalFrequencyRear = clamp(nfBaseRear + nfRangeRear * 0.75, limits.naturalFrequencyRear);
      newSetup.antiRollBarFront = 7; newSetup.antiRollBarRear = 4;
      newSetup.camberFront = 3.0; newSetup.camberRear = 2.0;
      newSetup.brakeBalance = 2;
      newSetup.downforceFront = clamp(isAero ? limits.downforceFront[0] + (limits.downforceFront[1] - limits.downforceFront[0]) * 0.8 : 200, limits.downforceFront);
      newSetup.downforceRear = clamp(isAero ? limits.downforceRear[0] + (limits.downforceRear[1] - limits.downforceRear[0]) * 0.8 : 300, limits.downforceRear);
    } else if (mode === 'braking') {
      newSetup.rideHeightFront = clamp(limits.rideHeightFront[0] + 15, limits.rideHeightFront);
      newSetup.rideHeightRear = clamp(limits.rideHeightRear[0] + 15, limits.rideHeightRear);
      newSetup.naturalFrequencyFront = clamp(nfBaseFront + nfRangeFront * 0.5, limits.naturalFrequencyFront);
      newSetup.naturalFrequencyRear = clamp(nfBaseRear + nfRangeRear * 0.5, limits.naturalFrequencyRear);
      newSetup.differentialBraking = clamp(lsdBraking + 15, [5, 60]);
      newSetup.brakeBalance = -2;
      newSetup.downforceFront = clamp(isAero ? limits.downforceFront[0] + (limits.downforceFront[1] - limits.downforceFront[0]) * 0.6 : 150, limits.downforceFront);
      newSetup.downforceRear = clamp(isAero ? limits.downforceRear[0] + (limits.downforceRear[1] - limits.downforceRear[0]) * 0.6 : 200, limits.downforceRear);
    }

    setTuningSetup(newSetup);
  };

  const applyTrackPreset = (type: 'aggressive' | 'balanced' | 'conservative') => {
    if (!selectedCircuit) return;
    setTuningMode('track');
    
    const preset = selectedCircuit.tuningPresets[type];
    const clamp = (val: number, range: [number, number]) => Math.min(Math.max(val, range[0]), range[1]);
    
    const newSetup = { ...tuningSetup, ...preset };
    
    // Auto-adjust Aero Parts for track presets
    newSetup.frontSplitterFitted = true;
    newSetup.rearWingFitted = true;
    
    // Ensure all values are within car-specific limits
    if (newSetup.rideHeightFront) newSetup.rideHeightFront = clamp(newSetup.rideHeightFront, limits.rideHeightFront);
    if (newSetup.rideHeightRear) newSetup.rideHeightRear = clamp(newSetup.rideHeightRear, limits.rideHeightRear);
    if (newSetup.naturalFrequencyFront) newSetup.naturalFrequencyFront = clamp(newSetup.naturalFrequencyFront, limits.naturalFrequencyFront);
    if (newSetup.naturalFrequencyRear) newSetup.naturalFrequencyRear = clamp(newSetup.naturalFrequencyRear, limits.naturalFrequencyRear);
    if (newSetup.downforceFront) newSetup.downforceFront = clamp(newSetup.downforceFront, limits.downforceFront);
    if (newSetup.downforceRear) newSetup.downforceRear = clamp(newSetup.downforceRear, limits.downforceRear);
    
    setTuningSetup(newSetup);
  };

  const proOptimize = () => {
    const power = parseInt(customBhp) || selectedCar?.bhp || 500;
    const weight = parseInt(customWeight) || selectedCar?.weight || 1200;
    
    const pwr = weight / power;
    const nfBaseFront = limits.naturalFrequencyFront[0];
    const nfRangeFront = limits.naturalFrequencyFront[1] - limits.naturalFrequencyFront[0];
    const nfBaseRear = limits.naturalFrequencyRear[0];
    const nfRangeRear = limits.naturalFrequencyRear[1] - limits.naturalFrequencyRear[0];
    
    const optimizedSetup: Partial<TuningSetup> = { ...tuningSetup };
    const clamp = (val: number, range: [number, number]) => Math.min(Math.max(val, range[0]), range[1]);
    
    optimizedSetup.naturalFrequencyFront = clamp(nfBaseFront + nfRangeFront * (pwr > 3 ? 0.4 : 0.6), limits.naturalFrequencyFront);
    optimizedSetup.naturalFrequencyRear = clamp(nfBaseRear + nfRangeRear * (pwr > 3 ? 0.45 : 0.65), limits.naturalFrequencyRear);
    
    optimizedSetup.rideHeightFront = limits.rideHeightFront[0] + 5;
    optimizedSetup.rideHeightRear = limits.rideHeightRear[0] + 15;
    
    setTuningSetup(optimizedSetup);
  };

  // --- CALCULATIONS ---
  const metrics = useMemo((): PerformanceMetrics => {
    if (!selectedCar) return {} as PerformanceMetrics;

    const power = calculateEffectivePower(parseInt(customBhp) || selectedCar.bhp, tuningSetup.powerRestriction || 100);
    const weight = calculateTotalWeight(parseInt(customWeight) || selectedCar.weight, tuningSetup.ballastKg || 0);
    const tireGrip = tuningSetup.tireGripCoefficient || 1.0;

    const t0to60 = calculate0to60Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 30);
    const tTopSpeed = calculateTopSpeed(power, weight, tuningSetup.downforceRear || 150);
    
    const handlingBalance = calculateHandlingBalance(
      tuningSetup.rideHeightFront || 100, tuningSetup.rideHeightRear || 100,
      tuningSetup.antiRollBarFront || 5, tuningSetup.antiRollBarRear || 5,
      tuningSetup.downforceFront || 100, tuningSetup.downforceRear || 150
    );

    const aeroBalance = calculateAeroBalance(tuningSetup.downforceFront || 100, tuningSetup.downforceRear || 150);
    const stiffness = calculateSuspensionStiffness(tuningSetup.naturalFrequencyFront || 2.0, tuningSetup.naturalFrequencyRear || 2.0);

    return {
      acceleration0to60: t0to60,
      topSpeed: tTopSpeed,
      handlingBalance,
      aeroBalance,
      suspensionStiffness: stiffness,
      overallRating: calculateOverallRating({
        accel: calculateAccelerationRating(t0to60),
        braking: 80,
        cornering: calculateCorneringRating(calculateCorneringSpeed(weight, tuningSetup.downforceFront || 100, tireGrip)),
        topSpeed: calculateTopSpeedRating(tTopSpeed)
      })
    } as PerformanceMetrics;
  }, [selectedCar, customBhp, customWeight, tuningSetup]);

  const radarData = useMemo(() => [
    { subject: 'Accel', A: calculateAccelerationRating(metrics.acceleration0to60) },
    { subject: 'Braking', A: 80 },
    { subject: 'Cornering', A: calculateCorneringRating(calculateCorneringSpeed(calculateTotalWeight(parseInt(customWeight) || selectedCar?.weight || 1200, 0), tuningSetup.downforceFront || 100, tuningSetup.tireGripCoefficient || 1.15)) },
    { subject: 'Top Speed', A: calculateTopSpeedRating(metrics.topSpeed) },
    { subject: 'Balance', A: 100 - Math.abs(metrics.handlingBalance) }
  ], [metrics, selectedCar, customWeight, tuningSetup]);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-red-600/30 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SELECTION & METRICS */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
            <h2 className="text-red-600 text-xl mb-4 border-b border-red-900/50 pb-2">Select Vehicle</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block uppercase">Manufacturer</label>
                  <Select value={selectedManufacturer} onValueChange={(val) => {
                    setSelectedManufacturer(val);
                    const firstModel = GT7_CARS.find(c => c.manufacturer === val)?.model || '';
                    setSelectedModel(firstModel);
                    setSelectedCar(GT7_CARS.find(c => c.model === firstModel) || null);
                    setCustomBhp('');
                    setCustomWeight('');
                  }}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      {manufacturers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block uppercase">Model</label>
                  <Select value={selectedModel} onValueChange={(val) => {
                    setSelectedModel(val);
                    setSelectedCar(GT7_CARS.find(c => c.model === val) || null);
                    setCustomBhp('');
                    setCustomWeight('');
                  }}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100 h-64">
                      {models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block uppercase">Custom BHP</label>
                  <Input 
                    type="number" 
                    placeholder={selectedCar?.bhp?.toString() || "BHP"} 
                    className="bg-zinc-950 border-zinc-800"
                    value={customBhp}
                    onChange={(e) => setCustomBhp(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block uppercase">Custom Weight (KG)</label>
                  <Input 
                    type="number" 
                    placeholder={selectedCar?.weight?.toString() || "KG"} 
                    className="bg-zinc-950 border-zinc-800"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-red-900/50 pb-2">
              <h2 className="text-red-600 text-lg italic font-black tracking-tighter uppercase">Master Calibration</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] h-6 text-zinc-500 hover:text-red-500"
                onClick={() => setManualLimits({ 
                  rideHeightFront: [null, null], rideHeightRear: [null, null],
                  naturalFrequencyFront: [null, null], naturalFrequencyRear: [null, null],
                  downforceFront: [null, null], downforceRear: [null, null] 
                })}
              >Reset</Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Ride Height Front</label>
                  <div className="flex gap-1">
                    <Input type="number" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.rideHeightFront[0] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, rideHeightFront: [e.target.value ? parseInt(e.target.value) : null, prev.rideHeightFront[1]] }))} />
                    <Input type="number" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.rideHeightFront[1] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, rideHeightFront: [prev.rideHeightFront[0], e.target.value ? parseInt(e.target.value) : null] }))} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Ride Height Rear</label>
                  <div className="flex gap-1">
                    <Input type="number" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.rideHeightRear[0] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, rideHeightRear: [e.target.value ? parseInt(e.target.value) : null, prev.rideHeightRear[1]] }))} />
                    <Input type="number" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.rideHeightRear[1] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, rideHeightRear: [prev.rideHeightRear[0], e.target.value ? parseInt(e.target.value) : null] }))} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Nat. Freq. Front</label>
                  <div className="flex gap-1">
                    <Input type="number" step="0.01" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.naturalFrequencyFront[0] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, naturalFrequencyFront: [e.target.value ? parseFloat(e.target.value) : null, prev.naturalFrequencyFront[1]] }))} />
                    <Input type="number" step="0.01" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.naturalFrequencyFront[1] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, naturalFrequencyFront: [prev.naturalFrequencyFront[0], e.target.value ? parseFloat(e.target.value) : null] }))} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Nat. Freq. Rear</label>
                  <div className="flex gap-1">
                    <Input type="number" step="0.01" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.naturalFrequencyRear[0] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, naturalFrequencyRear: [e.target.value ? parseFloat(e.target.value) : null, prev.naturalFrequencyRear[1]] }))} />
                    <Input type="number" step="0.01" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.naturalFrequencyRear[1] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, naturalFrequencyRear: [prev.naturalFrequencyRear[0], e.target.value ? parseFloat(e.target.value) : null] }))} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Aero Front</label>
                  <div className="flex gap-1">
                    <Input type="number" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.downforceFront[0] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, downforceFront: [e.target.value ? parseInt(e.target.value) : null, prev.downforceFront[1]] }))} />
                    <Input type="number" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.downforceFront[1] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, downforceFront: [prev.downforceFront[0], e.target.value ? parseInt(e.target.value) : null] }))} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Aero Rear</label>
                  <div className="flex gap-1">
                    <Input type="number" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.downforceRear[0] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, downforceRear: [e.target.value ? parseInt(e.target.value) : null, prev.downforceRear[1]] }))} />
                    <Input type="number" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]" value={manualLimits.downforceRear[1] || ''} onChange={(e) => setManualLimits(prev => ({ ...prev, downforceRear: [prev.downforceRear[0], e.target.value ? parseInt(e.target.value) : null] }))} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
            <h2 className="text-red-600 text-xl mb-4 border-b border-red-900/50 pb-2">Track Selection</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block uppercase">Region</label>
                  <Select value={selectedRegion} onValueChange={(val) => {
                    setSelectedRegion(val);
                    const reg = TRACK_REGIONS.find(r => r.name === val);
                    if (reg) {
                      setSelectedLocation(reg.locations[0].name);
                      setSelectedCircuit(reg.locations[0].circuits[0]);
                    }
                  }}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      {TRACK_REGIONS.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Location</label>
                  <Select value={selectedLocation} onValueChange={(val) => {
                    setSelectedLocation(val);
                    const loc = currentLocations.find(l => l.name === val);
                    if (loc) setSelectedCircuit(loc.circuits[0]);
                  }}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      {currentLocations.map(l => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Circuit</label>
                <Select value={selectedCircuit?.name} onValueChange={(val) => {
                  setSelectedCircuit(currentCircuits.find(c => c.name === val) || null);
                }}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    {currentCircuits.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
            <h2 className="text-red-600 text-xl mb-4 border-b border-red-900/50 pb-2">Performance Summary</h2>
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Radar name="Car" dataKey="A" stroke="#E8002D" fill="#E8002D" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider">
                    <span className="text-zinc-500">Handling Balance</span>
                    <span className={metrics.handlingBalance < -10 ? "text-blue-500" : metrics.handlingBalance > 10 ? "text-orange-500" : "text-green-500"}>
                      {metrics.handlingBalance < -10 ? "Understeer" : metrics.handlingBalance > 10 ? "Oversteer" : "Neutral"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-800 z-10" />
                    <div 
                      className={`h-full absolute transition-all duration-500 ${metrics.handlingBalance < 0 ? "bg-blue-600" : "bg-orange-600"}`}
                      style={{ 
                        left: metrics.handlingBalance < 0 ? `${50 + metrics.handlingBalance / 2}%` : "50%",
                        width: `${Math.abs(metrics.handlingBalance) / 2}%`
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase">
                  <div className="bg-zinc-950 p-2 border border-zinc-800">
                    <span className="text-zinc-500 block mb-1">Aero Balance</span>
                    <span className="text-zinc-100 font-bold">{Math.round(metrics.aeroBalance)}% FRONT</span>
                  </div>
                  <div className="bg-zinc-950 p-2 border border-zinc-800">
                    <span className="text-zinc-500 block mb-1">Stiffness</span>
                    <span className="text-zinc-100 font-bold">{Math.round(metrics.suspensionStiffness)}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-zinc-400">Overall Rating</span>
                  <span className="text-xl text-red-600 font-bold">{Math.round(metrics.overallRating)}</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${metrics.overallRating}%` }} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-4 shadow-2xl">
            <h2 className="text-red-600 text-lg italic font-black tracking-tighter uppercase mb-4 border-b border-red-900/50 pb-2">Handling Fixer</h2>
            <div className="space-y-4">
              <Select value={troubleshootIssue} onValueChange={(val) => {
                setTroubleshootIssue(val);
                const steps = [];
                if (val === 'understeer_entry') {
                  steps.push({ part: 'Ride Height', action: 'Lower Front / Raise Rear', reason: 'Shifts weight to front wheels for better turn-in' });
                  steps.push({ part: 'Anti-Roll Bar', action: 'Soften Front / Stiffen Rear', reason: 'Increases front mechanical grip' });
                } else if (val === 'oversteer_exit') {
                  steps.push({ part: 'LSD Acceleration', action: 'Lower Value', reason: 'Reduces wheel spin under power' });
                  steps.push({ part: 'Rear Wing', action: 'Increase Downforce', reason: 'Adds high-speed stability' });
                } else if (val === 'bumpy_track') {
                  steps.push({ part: 'Natural Frequency', action: 'Lower Values', reason: 'Allows suspension to absorb bumps better' });
                  steps.push({ part: 'Dampers', action: 'Soften Compression', reason: 'Prevents car from bouncing off curbs' });
                }
                setTroubleshootSteps(steps);
              }}>
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                  <SelectValue placeholder="Select a handling issue..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="understeer_entry">Understeer on Corner Entry</SelectItem>
                  <SelectItem value="oversteer_exit">Oversteer on Corner Exit</SelectItem>
                  <SelectItem value="bumpy_track">Car unstable on bumps/curbs</SelectItem>
                </SelectContent>
              </Select>
              {troubleshootSteps.length > 0 && (
                <div className="space-y-2">
                  {troubleshootSteps.map((step, i) => (
                    <div key={i} className="bg-zinc-950 p-2 border border-zinc-800 rounded-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-red-500 uppercase">{step.part}</span>
                        <span className="text-[10px] text-zinc-100 font-black">{step.action}</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 italic">{step.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: TUNING SHEET */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
              <div>
                <h1 className="text-3xl font-black italic text-zinc-100 tracking-tighter">Tuning <span className="text-red-600">Simulator</span></h1>
                <p className="text-xs text-zinc-500">Ultimate Precision Edition v3.0</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" size="sm" onClick={proOptimize} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-bold uppercase italic tracking-tighter">Pro-Optimize</Button>
                <Button variant={tuningMode === 'balanced' ? 'default' : 'outline'} size="sm" onClick={() => applyPreset('balanced')} className={tuningMode === 'balanced' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}>Balanced</Button>
                <Button variant={tuningMode === 'acceleration' ? 'default' : 'outline'} size="sm" onClick={() => applyPreset('acceleration')} className={tuningMode === 'acceleration' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}>Accel</Button>
                <Button variant={tuningMode === 'cornering' ? 'default' : 'outline'} size="sm" onClick={() => applyPreset('cornering')} className={tuningMode === 'cornering' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}>Corner</Button>
                <Button variant={tuningMode === 'braking' ? 'default' : 'outline'} size="sm" onClick={() => applyPreset('braking')} className={tuningMode === 'braking' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}>Brake</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 bg-zinc-950 p-2 border border-zinc-800 rounded-sm">
              <span className="text-[10px] text-zinc-500 w-full mb-1 uppercase">Track Presets</span>
              <Button variant="outline" size="xs" onClick={() => applyTrackPreset('aggressive')} className="text-[10px] h-6 border-zinc-800 hover:bg-red-900/20">Aggressive</Button>
              <Button variant="outline" size="xs" onClick={() => applyTrackPreset('balanced')} className="text-[10px] h-6 border-zinc-800 hover:bg-red-900/20">Balanced</Button>
              <Button variant="outline" size="xs" onClick={() => applyTrackPreset('conservative')} className="text-[10px] h-6 border-zinc-800 hover:bg-red-900/20">Conservative</Button>
            </div>

            <Tabs defaultValue="suspension" className="w-full">
              <TabsList className="bg-zinc-950 border border-zinc-800 w-full justify-start h-auto p-1 mb-6">
                <TabsTrigger value="suspension" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase text-xs py-2">Suspension</TabsTrigger>
                <TabsTrigger value="aero" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase text-xs py-2">Aerodynamics</TabsTrigger>
                <TabsTrigger value="drivetrain" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase text-xs py-2">Drivetrain</TabsTrigger>
                <TabsTrigger value="brakes" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase text-xs py-2">Brakes & Tires</TabsTrigger>
              </TabsList>

              <TabsContent value="suspension" className="space-y-8 mt-0">
                <div className="bg-zinc-950 p-4 border border-zinc-800 rounded-sm mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-zinc-400">Suspension Upgrade</span>
                    <Select value={suspensionType} onValueChange={(val: any) => setSuspensionType(val)}>
                      <SelectTrigger className="w-48 bg-zinc-900 border-zinc-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="street">Street</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="racing">Racing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Body Height Adj. (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.rideHeightFront} mm</span>
                    </div>
                    <Slider value={[tuningSetup.rideHeightFront || 100]} min={limits.rideHeightFront[0]} max={limits.rideHeightFront[1]} step={1} onValueChange={([val]) => updateTuning('rideHeightFront', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Body Height Adj. (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.rideHeightRear} mm</span>
                    </div>
                    <Slider value={[tuningSetup.rideHeightRear || 100]} min={limits.rideHeightRear[0]} max={limits.rideHeightRear[1]} step={1} onValueChange={([val]) => updateTuning('rideHeightRear', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Anti-Roll Bar (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.antiRollBarFront}</span>
                    </div>
                    <Slider value={[tuningSetup.antiRollBarFront || 5]} min={1} max={10} step={1} onValueChange={([val]) => updateTuning('antiRollBarFront', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Anti-Roll Bar (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.antiRollBarRear}</span>
                    </div>
                    <Slider value={[tuningSetup.antiRollBarRear || 5]} min={1} max={10} step={1} onValueChange={([val]) => updateTuning('antiRollBarRear', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Damping Ratio (Compression F)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.damperCompressionFront}%</span>
                    </div>
                    <Slider value={[tuningSetup.damperCompressionFront || 30]} min={1} max={100} step={1} onValueChange={([val]) => updateTuning('damperCompressionFront', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Damping Ratio (Compression R)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.damperCompressionRear}%</span>
                    </div>
                    <Slider value={[tuningSetup.damperCompressionRear || 30]} min={1} max={100} step={1} onValueChange={([val]) => updateTuning('damperCompressionRear', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Damping Ratio (Expansion F)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.damperExpansionFront}%</span>
                    </div>
                    <Slider value={[tuningSetup.damperExpansionFront || 40]} min={1} max={100} step={1} onValueChange={([val]) => updateTuning('damperExpansionFront', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Damping Ratio (Expansion R)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.damperExpansionRear}%</span>
                    </div>
                    <Slider value={[tuningSetup.damperExpansionRear || 40]} min={1} max={100} step={1} onValueChange={([val]) => updateTuning('damperExpansionRear', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Natural Frequency (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.naturalFrequencyFront?.toFixed(2)} Hz</span>
                    </div>
                    <Slider value={[tuningSetup.naturalFrequencyFront || 2.0]} min={limits.naturalFrequencyFront[0]} max={limits.naturalFrequencyFront[1]} step={0.01} onValueChange={([val]) => updateTuning('naturalFrequencyFront', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Natural Frequency (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.naturalFrequencyRear?.toFixed(2)} Hz</span>
                    </div>
                    <Slider value={[tuningSetup.naturalFrequencyRear || 2.1]} min={limits.naturalFrequencyRear[0]} max={limits.naturalFrequencyRear[1]} step={0.01} onValueChange={([val]) => updateTuning('naturalFrequencyRear', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Negative Camber Angle (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.camberFront?.toFixed(1)}°</span>
                    </div>
                    <Slider value={[tuningSetup.camberFront || 2.0]} min={0} max={10} step={0.1} onValueChange={([val]) => updateTuning('camberFront', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Negative Camber Angle (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.camberRear?.toFixed(1)}°</span>
                    </div>
                    <Slider value={[tuningSetup.camberRear || 1.5]} min={0} max={10} step={0.1} onValueChange={([val]) => updateTuning('camberRear', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Toe Angle (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.toeInFront?.toFixed(2)}</span>
                    </div>
                    <Slider value={[tuningSetup.toeInFront || 0]} min={-1} max={1} step={0.01} onValueChange={([val]) => updateTuning('toeInFront', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Toe Angle (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.toeInRear?.toFixed(2)}</span>
                    </div>
                    <Slider value={[tuningSetup.toeInRear || 0.05]} min={-1} max={1} step={0.01} onValueChange={([val]) => updateTuning('toeInRear', val)} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="aero" className="space-y-8 mt-0">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Button variant={tuningSetup.frontSplitterFitted ? 'default' : 'outline'} onClick={() => updateTuning('frontSplitterFitted', !tuningSetup.frontSplitterFitted)} className={tuningSetup.frontSplitterFitted ? 'bg-red-600 border-red-600' : 'border-zinc-800'}>Front Splitter</Button>
                  <Button variant={tuningSetup.rearWingFitted ? 'default' : 'outline'} onClick={() => updateTuning('rearWingFitted', !tuningSetup.rearWingFitted)} className={tuningSetup.rearWingFitted ? 'bg-red-600 border-red-600' : 'border-zinc-800'}>Rear Wing</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Downforce (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.downforceFront} lbs</span>
                    </div>
                    <Slider value={[tuningSetup.downforceFront || 100]} min={limits.downforceFront[0]} max={limits.downforceFront[1]} step={5} onValueChange={([val]) => updateTuning('downforceFront', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Downforce (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.downforceRear} lbs</span>
                    </div>
                    <Slider value={[tuningSetup.downforceRear || 150]} min={limits.downforceRear[0]} max={limits.downforceRear[1]} step={5} onValueChange={([val]) => updateTuning('downforceRear', val)} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="drivetrain" className="space-y-8 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Initial Torque</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.differentialInitialTorque}</span>
                    </div>
                    <Slider value={[tuningSetup.differentialInitialTorque || 10]} min={5} max={60} step={1} onValueChange={([val]) => updateTuning('differentialInitialTorque', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Acceleration Sensitivity</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.differentialAcceleration}</span>
                    </div>
                    <Slider value={[tuningSetup.differentialAcceleration || 30]} min={5} max={60} step={1} onValueChange={([val]) => updateTuning('differentialAcceleration', val)} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Braking Sensitivity</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.differentialBraking}</span>
                    </div>
                    <Slider value={[tuningSetup.differentialBraking || 15]} min={5} max={60} step={1} onValueChange={([val]) => updateTuning('differentialBraking', val)} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="brakes" className="space-y-8 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <span className="text-xs text-zinc-500 block">Tire Compound</span>
                    <Select value={tuningSetup.tireGripCoefficient?.toString()} onValueChange={(val) => updateTuning('tireGripCoefficient', parseFloat(val))}>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        {Object.entries(TIRE_GRIP_COEFFICIENTS).map(([name, val]) => <SelectItem key={name} value={val.toString()}>{name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Brake Balance</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.brakeBalance}</span>
                    </div>
                    <Slider value={[tuningSetup.brakeBalance || 0]} min={-5} max={5} step={1} onValueChange={([val]) => updateTuning('brakeBalance', val)} />
                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase"><span>Front Bias</span><span>Rear Bias</span></div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
