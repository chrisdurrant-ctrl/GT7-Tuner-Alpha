import { useState, useMemo, useEffect } from 'react';
import { GT7_CARS, GT7Car } from '@/lib/gt7_cars';
import { TRACK_REGIONS, ALL_CIRCUITS, TrackCircuit } from '@/lib/gt7_tracks';
import { 
  TuningSetup, 
  PerformanceMetrics, 
  TIRE_GRIP_COEFFICIENTS,
  BRAKE_SYSTEMS,
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
  calculateBalanceScore
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
    rideHeight: [number | null, number | null],
    naturalFrequency: [number | null, number | null],
    downforceFront: [number | null, number | null],
    downforceRear: [number | null, number | null]
  }>({
    rideHeight: [null, null],
    naturalFrequency: [null, null],
    downforceFront: [null, null],
    downforceRear: [null, null]
  });

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
      rideHeight: [
        manualLimits.rideHeight[0] !== null ? manualLimits.rideHeight[0] : baseLimits.rideHeight[0],
        manualLimits.rideHeight[1] !== null ? manualLimits.rideHeight[1] : baseLimits.rideHeight[1]
      ] as [number, number],
      naturalFrequency: [
        manualLimits.naturalFrequency[0] !== null ? manualLimits.naturalFrequency[0] : baseLimits.naturalFrequency[0],
        manualLimits.naturalFrequency[1] !== null ? manualLimits.naturalFrequency[1] : baseLimits.naturalFrequency[1]
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

  const activeLayoutName = useMemo(() => {
    if (!selectedCircuit || !selectedLayoutId) return 'Full Course';
    return selectedCircuit.layouts?.find(l => l.id === selectedLayoutId)?.name || 'Full Course';
  }, [selectedCircuit, selectedLayoutId]);

  // --- ACTIONS ---
  const updateTuning = (key: keyof TuningSetup, value: any) => {
    setTuningSetup(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (mode: typeof tuningMode) => {
    setTuningMode(mode);
    
    const clamp = (val: number, range: [number, number]) => Math.min(Math.max(val, range[0]), range[1]);
    
    // Base NF offset (Rear is naturally stiffer in GT7)
    const nfBase = limits.naturalFrequency[0];
    const nfRange = limits.naturalFrequency[1] - limits.naturalFrequency[0];
    
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
      newSetup.rideHeightFront = clamp(limits.rideHeight[0] + 5, limits.rideHeight);
      newSetup.rideHeightRear = clamp(limits.rideHeight[0] + 10, limits.rideHeight);
      newSetup.naturalFrequencyFront = clamp(nfBase + nfRange * 0.4, limits.naturalFrequency);
      newSetup.naturalFrequencyRear = clamp(nfBase + nfRange * 0.45, limits.naturalFrequency);
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
      newSetup.rideHeightFront = clamp(limits.rideHeight[0] + 10, limits.rideHeight);
      newSetup.rideHeightRear = clamp(limits.rideHeight[0] + 20, limits.rideHeight);
      newSetup.naturalFrequencyFront = clamp(nfBase + nfRange * 0.3, limits.naturalFrequency);
      newSetup.naturalFrequencyRear = clamp(nfBase + nfRange * 0.35, limits.naturalFrequency);
      newSetup.antiRollBarFront = 4; newSetup.antiRollBarRear = 6;
      newSetup.differentialAcceleration = clamp(lsdAccel + 15, [5, 60]);
      newSetup.brakeBalance = 1;
      newSetup.downforceFront = clamp(isAero ? limits.downforceFront[0] + (limits.downforceFront[1] - limits.downforceFront[0]) * 0.2 : 50, limits.downforceFront);
      newSetup.downforceRear = clamp(isAero ? limits.downforceRear[0] + (limits.downforceRear[1] - limits.downforceRear[0]) * 0.2 : 75, limits.downforceRear);
    } else if (mode === 'cornering') {
      newSetup.rideHeightFront = clamp(limits.rideHeight[0], limits.rideHeight);
      newSetup.rideHeightRear = clamp(limits.rideHeight[0] + 5, limits.rideHeight);
      newSetup.naturalFrequencyFront = clamp(nfBase + nfRange * 0.7, limits.naturalFrequency);
      newSetup.naturalFrequencyRear = clamp(nfBase + nfRange * 0.75, limits.naturalFrequency);
      newSetup.antiRollBarFront = 7; newSetup.antiRollBarRear = 4;
      newSetup.camberFront = 3.0; newSetup.camberRear = 2.0;
      newSetup.brakeBalance = 2;
      newSetup.downforceFront = clamp(isAero ? limits.downforceFront[0] + (limits.downforceFront[1] - limits.downforceFront[0]) * 0.8 : 200, limits.downforceFront);
      newSetup.downforceRear = clamp(isAero ? limits.downforceRear[0] + (limits.downforceRear[1] - limits.downforceRear[0]) * 0.8 : 300, limits.downforceRear);
    } else if (mode === 'braking') {
      newSetup.rideHeightFront = clamp(limits.rideHeight[0] + 15, limits.rideHeight);
      newSetup.rideHeightRear = clamp(limits.rideHeight[0] + 15, limits.rideHeight);
      newSetup.naturalFrequencyFront = clamp(nfBase + nfRange * 0.5, limits.naturalFrequency);
      newSetup.naturalFrequencyRear = clamp(nfBase + nfRange * 0.5, limits.naturalFrequency);
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
    if (newSetup.rideHeightFront) newSetup.rideHeightFront = clamp(newSetup.rideHeightFront, limits.rideHeight);
    if (newSetup.rideHeightRear) newSetup.rideHeightRear = clamp(newSetup.rideHeightRear, limits.rideHeight);
    if (newSetup.naturalFrequencyFront) newSetup.naturalFrequencyFront = clamp(newSetup.naturalFrequencyFront, limits.naturalFrequency);
    if (newSetup.naturalFrequencyRear) newSetup.naturalFrequencyRear = clamp(newSetup.naturalFrequencyRear, limits.naturalFrequency);
    if (newSetup.downforceFront) newSetup.downforceFront = clamp(newSetup.downforceFront, limits.downforceFront);
    if (newSetup.downforceRear) newSetup.downforceRear = clamp(newSetup.downforceRear, limits.downforceRear);
    
    setTuningSetup(newSetup);
  };

  // --- CALCULATIONS ---
  const metrics = useMemo((): PerformanceMetrics => {
    if (!selectedCar) return {} as PerformanceMetrics;

    const power = calculateEffectivePower(parseInt(customBhp) || selectedCar.bhp, tuningSetup.powerRestriction || 100);
    const weight = calculateTotalWeight(parseInt(customWeight) || selectedCar.weight, tuningSetup.ballastKg || 0);
    const tireGrip = tuningSetup.tireGripCoefficient || 1.0;

    const t0to60 = calculate0to60Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 30);
    const t0to100 = calculate0to100Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 30);
    const t0to200 = calculate0to200Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 30);
    
    const brakeDist100 = calculateBrakingDistance100to0(weight, tuningSetup.brakeSystemType || 'normal', tuningSetup.brakeBalance || 0, tireGrip, tuningSetup.differentialBraking || 15);
    const brakeDist200 = calculateBrakingDistance200to0(weight, tuningSetup.brakeSystemType || 'normal', tuningSetup.brakeBalance || 0, tireGrip, tuningSetup.differentialBraking || 15);
    const brakeDecel = calculateBrakingDeceleration(tuningSetup.brakeSystemType || 'normal', tireGrip, tuningSetup.differentialBraking || 15);

    const latAccel = calculateLateralAcceleration(
      tuningSetup.downforceFront || 0,
      tuningSetup.downforceRear || 0,
      weight,
      tuningSetup.camberFront || 0,
      tuningSetup.camberRear || 0,
      tuningSetup.antiRollBarFront || 5,
      tuningSetup.antiRollBarRear || 5,
      tireGrip
    );

    const cornSpeed = calculateCorneringSpeed(latAccel);
    const tSpeed = calculateTopSpeed(power, weight, tuningSetup.downforceFront || 0, tuningSetup.downforceRear || 0);

    const accelRating = calculateAccelerationRating(t0to60, t0to100, t0to200);
    const brakeRating = calculateBrakingRating(brakeDist100, brakeDecel);
    const cornerRating = calculateCorneringRating(latAccel, cornSpeed);
    const topSpeedRating = calculateTopSpeedRating(tSpeed);
    const overall = calculateOverallRating(accelRating, brakeRating, cornerRating, topSpeedRating);
    const balance = calculateBalanceScore(tuningSetup as TuningSetup);

    return {
      acceleration0to60: t0to60,
      acceleration0to100: t0to100,
      acceleration0to200: t0to200,
      accelerationRating: accelRating,
      brakingDistance100to0: brakeDist100,
      brakingDistance200to0: brakeDist200,
      brakingDeceleration: brakeDecel,
      brakingRating: brakeRating,
      lateralAcceleration: latAccel,
      corneringSpeed: cornSpeed,
      corneringRating: cornerRating,
      topSpeed: tSpeed,
      topSpeedRating: topSpeedRating,
      overallRating: overall,
      balanceScore: balance
    };
  }, [selectedCar, tuningSetup, customBhp, customWeight]);

  const radarData = [
    { subject: 'Accel', A: metrics.accelerationRating, fullMark: 100 },
    { subject: 'Braking', A: metrics.brakingRating, fullMark: 100 },
    { subject: 'Cornering', A: metrics.corneringRating, fullMark: 100 },
    { subject: 'Top Speed', A: metrics.topSpeedRating, fullMark: 100 },
    { subject: 'Balance', A: metrics.balanceScore, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-mono uppercase tracking-wider">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CAR & TRACK SELECTION */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
            <h2 className="text-red-600 text-xl mb-4 border-b border-red-900/50 pb-2">Vehicle Selection</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Manufacturer</label>
                <Select value={selectedManufacturer} onValueChange={(val) => {
                  setSelectedManufacturer(val);
                  const firstModel = GT7_CARS.find(c => c.manufacturer === val)?.model || '';
                  setSelectedModel(firstModel);
                  setSelectedCar(GT7_CARS.find(c => c.model === firstModel) || null);
                }}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800">
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    {manufacturers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Model</label>
                <Select value={selectedModel} onValueChange={(val) => {
                  setSelectedModel(val);
                  setSelectedCar(GT7_CARS.find(c => c.model === val) || null);
                }}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    {models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
<div>
                <label className="text-xs text-zinc-500 mb-1 block">BHP</label>
                <Input 
                  type="number" 
                  value={customBhp || selectedCar?.bhp || ''} 
                  className="bg-zinc-950 border-zinc-800 h-8"
                  onChange={(e) => setCustomBhp(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Weight (KG)</label>
                <Input 
                  type="number" 
                  value={customWeight || selectedCar?.weight || ''} 
                  className="bg-zinc-950 border-zinc-800 h-8"
                  onChange={(e) => setCustomWeight(e.target.value)}
                />
              </div>
              </div>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
            <h2 className="text-red-600 text-xl mb-4 border-b border-red-900/50 pb-2 italic font-black tracking-tighter">Master Calibration</h2>
            <p className="text-[10px] text-zinc-500 mb-4 uppercase">Input your car's in-game limits for perfect setups</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Ride Height (Min/Max)</label>
                  <div className="flex gap-1">
                    <Input 
                      type="number" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]"
                      value={manualLimits.rideHeight[0] || ''}
                      onChange={(e) => setManualLimits(prev => ({ ...prev, rideHeight: [e.target.value ? parseInt(e.target.value) : null, prev.rideHeight[1]] }))}
                    />
                    <Input 
                      type="number" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]"
                      value={manualLimits.rideHeight[1] || ''}
                      onChange={(e) => setManualLimits(prev => ({ ...prev, rideHeight: [prev.rideHeight[0], e.target.value ? parseInt(e.target.value) : null] }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Nat. Freq. (Min/Max)</label>
                  <div className="flex gap-1">
                    <Input 
                      type="number" step="0.01" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]"
                      value={manualLimits.naturalFrequency[0] || ''}
                      onChange={(e) => setManualLimits(prev => ({ ...prev, naturalFrequency: [e.target.value ? parseFloat(e.target.value) : null, prev.naturalFrequency[1]] }))}
                    />
                    <Input 
                      type="number" step="0.01" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]"
                      value={manualLimits.naturalFrequency[1] || ''}
                      onChange={(e) => setManualLimits(prev => ({ ...prev, naturalFrequency: [prev.naturalFrequency[0], e.target.value ? parseFloat(e.target.value) : null] }))}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Aero Front (Min/Max)</label>
                  <div className="flex gap-1">
                    <Input 
                      type="number" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]"
                      value={manualLimits.downforceFront[0] || ''}
                      onChange={(e) => setManualLimits(prev => ({ ...prev, downforceFront: [e.target.value ? parseInt(e.target.value) : null, prev.downforceFront[1]] }))}
                    />
                    <Input 
                      type="number" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]"
                      value={manualLimits.downforceFront[1] || ''}
                      onChange={(e) => setManualLimits(prev => ({ ...prev, downforceFront: [prev.downforceFront[0], e.target.value ? parseInt(e.target.value) : null] }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block uppercase">Aero Rear (Min/Max)</label>
                  <div className="flex gap-1">
                    <Input 
                      type="number" placeholder="Min" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]"
                      value={manualLimits.downforceRear[0] || ''}
                      onChange={(e) => setManualLimits(prev => ({ ...prev, downforceRear: [e.target.value ? parseInt(e.target.value) : null, prev.downforceRear[1]] }))}
                    />
                    <Input 
                      type="number" placeholder="Max" className="bg-zinc-950 border-zinc-800 h-7 text-[10px]"
                      value={manualLimits.downforceRear[1] || ''}
                      onChange={(e) => setManualLimits(prev => ({ ...prev, downforceRear: [prev.downforceRear[0], e.target.value ? parseInt(e.target.value) : null] }))}
                    />
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-[10px] h-7 border-red-900/30 text-red-500 hover:bg-red-900/10"
                onClick={() => setManualLimits({ rideHeight: [null, null], naturalFrequency: [null, null], downforceFront: [null, null], downforceRear: [null, null] })}
              >Reset Calibration</Button>
            </div>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
            <h2 className="text-red-600 text-xl mb-4 border-b border-red-900/50 pb-2">Track Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Region</label>
                  <Select value={selectedRegion} onValueChange={(val) => {
                    setSelectedRegion(val);
                    const region = TRACK_REGIONS.find(r => r.name === val);
                    if (region) {
                      setSelectedLocation(region.locations[0].name);
                      setSelectedCircuit(region.locations[0].circuits[0]);
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

              {selectedCircuit?.layouts && selectedCircuit.layouts.length > 0 && (
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Layout</label>
                  <Select value={selectedLayoutId} onValueChange={setSelectedLayoutId}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      {selectedCircuit.layouts.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                    <Radar
                      name="Car"
                      dataKey="A"
                      stroke="#E8002D"
                      fill="#E8002D"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-zinc-950 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block">0-60 MPH</span>
                  <span className="text-lg text-zinc-100">{metrics.acceleration0to60.toFixed(2)}s</span>
                </div>
                <div className="bg-zinc-950 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block">Top Speed</span>
                  <span className="text-lg text-zinc-100">{Math.round(metrics.topSpeed)} km/h</span>
                </div>
                <div className="bg-zinc-950 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block">Braking (100-0)</span>
                  <span className="text-lg text-zinc-100">{metrics.brakingDistance100to0.toFixed(1)}m</span>
                </div>
                <div className="bg-zinc-950 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block">Lateral G</span>
                  <span className="text-lg text-zinc-100">{metrics.lateralAcceleration.toFixed(2)}G</span>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-zinc-400">Overall Rating</span>
                  <span className="text-xl text-red-600 font-bold">{Math.round(metrics.overallRating)}</span>
                </div>
                <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-red-600 h-full transition-all duration-500" 
                    style={{ width: `${metrics.overallRating}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: TUNING SHEET */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800 p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
              <div>
                <h1 className="text-3xl font-black italic text-zinc-100 tracking-tighter">
                  Tuning <span className="text-red-600">Simulator</span>
                </h1>
                <p className="text-xs text-zinc-500">Authentic GT7 Physics Engine v2.0</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={tuningMode === 'balanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyPreset('balanced')}
                  className={tuningMode === 'balanced' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}
                >Balanced</Button>
                <Button 
                  variant={tuningMode === 'acceleration' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyPreset('acceleration')}
                  className={tuningMode === 'acceleration' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}
                >Accel</Button>
                <Button 
                  variant={tuningMode === 'cornering' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyPreset('cornering')}
                  className={tuningMode === 'cornering' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}
                >Corner</Button>
                <Button 
                  variant={tuningMode === 'braking' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyPreset('braking')}
                  className={tuningMode === 'braking' ? 'bg-red-600 hover:bg-red-700' : 'border-zinc-800'}
                >Brake</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 bg-zinc-950 p-2 border border-zinc-800 rounded-sm">
              <span className="text-[10px] text-zinc-500 w-full mb-1 uppercase">Track Presets</span>
              <Button 
                variant="outline" size="xs" 
                onClick={() => applyTrackPreset('aggressive')}
                className="text-[10px] h-6 border-zinc-800 hover:bg-red-900/20"
              >Aggressive</Button>
              <Button 
                variant="outline" size="xs" 
                onClick={() => applyTrackPreset('balanced')}
                className="text-[10px] h-6 border-zinc-800 hover:bg-red-900/20"
              >Balanced</Button>
              <Button 
                variant="outline" size="xs" 
                onClick={() => applyTrackPreset('conservative')}
                className="text-[10px] h-6 border-zinc-800 hover:bg-red-900/20"
              >Conservative</Button>
            </div>

            <Tabs defaultValue="suspension" className="w-full">
              <TabsList className="bg-zinc-950 border border-zinc-800 w-full justify-start h-auto p-1 mb-6">
                <TabsTrigger value="suspension" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase text-xs py-2">Suspension</TabsTrigger>
                <TabsTrigger value="aero" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase text-xs py-2">Aerodynamics</TabsTrigger>
                <TabsTrigger value="drivetrain" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase text-xs py-2">Drivetrain</TabsTrigger>
                <TabsTrigger value="brakes" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase text-xs py-2">Brakes & Tires</TabsTrigger>
              </TabsList>

              {/* SUSPENSION TAB */}
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
                  {/* Order: Ride Height -> ARB -> Dampers -> NF -> Camber -> Toe */}
                  
                  {/* Ride Height */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Body Height Adj. (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.rideHeightFront} mm</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.rideHeightFront || 100]} 
                      min={limits.rideHeight[0]} max={limits.rideHeight[1]} step={1}
                      onValueChange={([val]) => updateTuning('rideHeightFront', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Body Height Adj. (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.rideHeightRear} mm</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.rideHeightRear || 100]} 
                      min={limits.rideHeight[0]} max={limits.rideHeight[1]} step={1}
                      onValueChange={([val]) => updateTuning('rideHeightRear', val)}
                    />
                  </div>

                  {/* Anti-Roll Bar */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Anti-Roll Bar (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.antiRollBarFront}</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.antiRollBarFront || 5]} 
                      min={1} max={10} step={1}
                      onValueChange={([val]) => updateTuning('antiRollBarFront', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Anti-Roll Bar (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.antiRollBarRear}</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.antiRollBarRear || 5]} 
                      min={1} max={10} step={1}
                      onValueChange={([val]) => updateTuning('antiRollBarRear', val)}
                    />
                  </div>

                  {/* Dampers Compression */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Damping Ratio (Compression F)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.damperCompressionFront}%</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.damperCompressionFront || 30]} 
                      min={limits.damperCompression[0]} max={limits.damperCompression[1]} step={1}
                      onValueChange={([val]) => updateTuning('damperCompressionFront', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Damping Ratio (Compression R)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.damperCompressionRear}%</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.damperCompressionRear || 30]} 
                      min={limits.damperCompression[0]} max={limits.damperCompression[1]} step={1}
                      onValueChange={([val]) => updateTuning('damperCompressionRear', val)}
                    />
                  </div>

                  {/* Dampers Expansion */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Damping Ratio (Expansion F)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.damperExpansionFront}%</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.damperExpansionFront || 40]} 
                      min={limits.damperExpansion[0]} max={limits.damperExpansion[1]} step={1}
                      onValueChange={([val]) => updateTuning('damperExpansionFront', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Damping Ratio (Expansion R)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.damperExpansionRear}%</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.damperExpansionRear || 40]} 
                      min={limits.damperExpansion[0]} max={limits.damperExpansion[1]} step={1}
                      onValueChange={([val]) => updateTuning('damperExpansionRear', val)}
                    />
                  </div>

                  {/* Natural Frequency */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Natural Frequency (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.naturalFrequencyFront?.toFixed(2)} Hz</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.naturalFrequencyFront || 2.0]} 
                      min={limits.naturalFrequency[0]} max={limits.naturalFrequency[1]} step={0.01}
                      onValueChange={([val]) => updateTuning('naturalFrequencyFront', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Natural Frequency (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.naturalFrequencyRear?.toFixed(2)} Hz</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.naturalFrequencyRear || 2.1]} 
                      min={limits.naturalFrequency[0]} max={limits.naturalFrequency[1]} step={0.01}
                      onValueChange={([val]) => updateTuning('naturalFrequencyRear', val)}
                    />
                  </div>

                  {/* Camber */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Negative Camber Angle (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.camberFront?.toFixed(1)}°</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.camberFront || 2.0]} 
                      min={0} max={10} step={0.1}
                      onValueChange={([val]) => updateTuning('camberFront', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Negative Camber Angle (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.camberRear?.toFixed(1)}°</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.camberRear || 1.5]} 
                      min={0} max={10} step={0.1}
                      onValueChange={([val]) => updateTuning('camberRear', val)}
                    />
                  </div>

                  {/* Toe */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Toe Angle (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.toeInFront?.toFixed(2)}°</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.toeInFront || 0.0]} 
                      min={-1.0} max={1.0} step={0.01}
                      onValueChange={([val]) => updateTuning('toeInFront', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Toe Angle (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.toeInRear?.toFixed(2)}°</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.toeInRear || 0.05]} 
                      min={-1.0} max={1.0} step={0.01}
                      onValueChange={([val]) => updateTuning('toeInRear', val)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* AERO TAB */}
              <TabsContent value="aero" className="space-y-8 mt-0">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <Button 
                    variant={tuningSetup.frontSplitterFitted ? 'default' : 'outline'}
                    onClick={() => updateTuning('frontSplitterFitted', !tuningSetup.frontSplitterFitted)}
                    className={tuningSetup.frontSplitterFitted ? 'bg-red-600' : 'border-zinc-800'}
                  >Front Splitter {tuningSetup.frontSplitterFitted ? 'Fitted' : 'None'}</Button>
                  <Button 
                    variant={tuningSetup.rearWingFitted ? 'default' : 'outline'}
                    onClick={() => updateTuning('rearWingFitted', !tuningSetup.rearWingFitted)}
                    className={tuningSetup.rearWingFitted ? 'bg-red-600' : 'border-zinc-800'}
                  >Rear Wing {tuningSetup.rearWingFitted ? 'Fitted' : 'None'}</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Downforce (Front)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.downforceFront} lbs</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.downforceFront || 100]} 
                      min={limits.downforceFront[0]} 
                      max={limits.downforceFront[1]} 
                      step={5}
                      onValueChange={([val]) => updateTuning('downforceFront', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Downforce (Rear)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.downforceRear} lbs</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.downforceRear || 150]} 
                      min={limits.downforceRear[0]} 
                      max={limits.downforceRear[1]} 
                      step={5}
                      onValueChange={([val]) => updateTuning('downforceRear', val)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* DRIVETRAIN TAB */}
              <TabsContent value="drivetrain" className="space-y-8 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Initial Torque</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.differentialInitialTorque}</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.differentialInitialTorque || 10]} 
                      min={5} max={60} step={1}
                      onValueChange={([val]) => updateTuning('differentialInitialTorque', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Acceleration Sensitivity</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.differentialAcceleration}</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.differentialAcceleration || 30]} 
                      min={5} max={60} step={1}
                      onValueChange={([val]) => updateTuning('differentialAcceleration', val)}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Braking Sensitivity</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.differentialBraking}</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.differentialBraking || 15]} 
                      min={5} max={60} step={1}
                      onValueChange={([val]) => updateTuning('differentialBraking', val)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* BRAKES & TIRES TAB */}
              <TabsContent value="brakes" className="space-y-8 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <label className="text-xs text-zinc-500 block mb-1">Brake System</label>
                    <Select value={tuningSetup.brakeSystemType} onValueChange={(val: any) => updateTuning('brakeSystemType', val)}>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="racing">Racing</SelectItem>
                        <SelectItem value="carbon">Carbon Ceramic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-zinc-500">Brake Balance (F - R)</span>
                      <span className="text-sm font-bold text-red-500">{tuningSetup.brakeBalance}</span>
                    </div>
                    <Slider 
                      value={[tuningSetup.brakeBalance || 0]} 
                      min={-5} max={5} step={1}
                      onValueChange={([val]) => updateTuning('brakeBalance', val)}
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600">
                      <span>FRONT</span>
                      <span>REAR</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs text-zinc-500 block mb-1">Tire Compound</label>
                    <Select value={Object.keys(TIRE_GRIP_COEFFICIENTS).find(k => TIRE_GRIP_COEFFICIENTS[k as keyof typeof TIRE_GRIP_COEFFICIENTS] === tuningSetup.tireGripCoefficient)} onValueChange={(val: any) => updateTuning('tireGripCoefficient', TIRE_GRIP_COEFFICIENTS[val as keyof typeof TIRE_GRIP_COEFFICIENTS])}>
                      <SelectTrigger className="bg-zinc-950 border-zinc-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <SelectItem value="comfort-hard">Comfort: Hard</SelectItem>
                        <SelectItem value="comfort-medium">Comfort: Medium</SelectItem>
                        <SelectItem value="comfort-soft">Comfort: Soft</SelectItem>
                        <SelectItem value="sports-hard">Sports: Hard</SelectItem>
                        <SelectItem value="sports-medium">Sports: Medium</SelectItem>
                        <SelectItem value="sports-soft">Sports: Soft</SelectItem>
                        <SelectItem value="racing-hard">Racing: Hard</SelectItem>
                        <SelectItem value="racing-medium">Racing: Medium</SelectItem>
                        <SelectItem value="racing-soft">Racing: Soft</SelectItem>
                      </SelectContent>
                    </Select>
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
