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
    naturalFrequencyRear: 2.0,
    damperExpansionFront: 35,
    damperExpansionRear: 35,
    damperCompressionFront: 25,
    damperCompressionRear: 25,
    camberFront: 2.0,
    camberRear: 1.5,
    toeInFront: 0.0,
    toeInRear: 0.2,
    downforceFront: 100,
    downforceRear: 150,
    brakeSystemType: 'racing',
    brakeBalance: 0,
    differentialInitialTorque: 10,
    differentialAcceleration: 60,
    differentialBraking: 50,
    tirePressureFront: 30,
    tirePressureRear: 30,
    tireGripCoefficient: 1.1,
  });

  const [hasFrontSplitter, setHasFrontSplitter] = useState(false);
  const [hasRearWing, setHasRearWing] = useState(false);
  const [suspensionType, setSuspensionType] = useState<'standard' | 'street' | 'sports' | 'racing'>('standard');

  const [customBhp, setCustomBhp] = useState<number | null>(null);
  const [customWeight, setCustomWeight] = useState<number | null>(null);
  const [tuningMode, setTuningMode] = useState<'balanced' | 'acceleration' | 'cornering' | 'braking' | 'track'>('balanced');

  // --- EFFECTS & MEMOS ---
  const manufacturers = useMemo(() => Array.from(new Set(GT7_CARS.map(car => car.manufacturer))).sort(), []);
  const models = useMemo(() => GT7_CARS.filter(car => car.manufacturer === selectedManufacturer).map(car => car.model).sort(), [selectedManufacturer]);
  
  const currentRegion = useMemo(() => TRACK_REGIONS.find(r => r.name === selectedRegion), [selectedRegion]);
  const currentLocations = useMemo(() => currentRegion?.locations || [], [currentRegion]);
  const currentLocation = useMemo(() => currentLocations.find(l => l.name === selectedLocation), [currentLocations, selectedLocation]);
  const currentCircuits = useMemo(() => currentLocation?.circuits || [], [currentLocation]);

  // Dynamic Suspension Limits based on Car Type and Upgrade
  const suspensionLimits = useMemo(() => {
    const isRaceCar = selectedCar?.category?.includes('Gr.') || selectedCar?.model.includes('Gr.') || selectedCar?.model.includes('GT3') || selectedCar?.model.includes('Race Car');
    const isVisionGT = selectedCar?.model.includes('VGT') || selectedCar?.model.includes('Vision Gran Turismo');
    const isSupercar = selectedCar?.model.includes('Ferrari') || selectedCar?.model.includes('Lamborghini') || selectedCar?.model.includes('Porsche') || selectedCar?.model.includes('McLaren');
    
    // Default ranges based on upgrade
    let rhMin = 80, rhMax = 200;
    let nfMin = 1.0, nfMax = 3.0;
    let dampExpMin = 1, dampExpMax = 10;
    let dampCompMin = 1, dampCompMax = 10;

    if (isRaceCar || suspensionType === 'racing') {
      rhMin = 50; rhMax = 120;
      nfMin = 2.0; nfMax = 5.0;
      dampExpMin = 30; dampExpMax = 50;
      dampCompMin = 20; dampCompMax = 40;
    } else if (suspensionType === 'sports') {
      rhMin = 70; rhMax = 150;
      nfMin = 1.5; nfMax = 3.5;
      dampExpMin = 10; dampExpMax = 30;
      dampCompMin = 5; dampCompMax = 20;
    } else if (suspensionType === 'street') {
      rhMin = 80; rhMax = 180;
      nfMin = 1.2; nfMax = 2.5;
    }

    // Override with Car-Specific Limits if they exist in the database
    if (selectedCar?.tuningLimits) {
      if (selectedCar.tuningLimits.rideHeight) {
        rhMin = selectedCar.tuningLimits.rideHeight[0];
        rhMax = selectedCar.tuningLimits.rideHeight[1];
      }
      if (selectedCar.tuningLimits.naturalFrequency) {
        nfMin = selectedCar.tuningLimits.naturalFrequency[0];
        nfMax = selectedCar.tuningLimits.naturalFrequency[1];
      }
    }

    return { rhMin, rhMax, nfMin, nfMax, dampExpMin, dampExpMax, dampCompMin, dampCompMax };
  }, [selectedCar, suspensionType]);

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
    
    // Helper to clamp values to car-specific limits
    const clampNF = (val: number) => Math.min(Math.max(val, suspensionLimits.nfMin), suspensionLimits.nfMax);
    const clampRH = (val: number) => Math.min(Math.max(val, suspensionLimits.rhMin), suspensionLimits.rhMax);
    const clampExp = (val: number) => Math.min(Math.max(val, suspensionLimits.dampExpMin), suspensionLimits.dampExpMax);
    const clampComp = (val: number) => Math.min(Math.max(val, suspensionLimits.dampCompMin), suspensionLimits.dampCompMax);

    const isRaceCar = selectedCar?.category?.includes('Gr.') || selectedCar?.model.includes('Gr.') || selectedCar?.model.includes('GT3') || selectedCar?.model.includes('Race Car');
    
    const presets = {
      acceleration: {
        rideHeightFront: clampRH(suspensionLimits.rhMin + 10), rideHeightRear: clampRH(suspensionLimits.rhMin + 15),
        naturalFrequencyFront: clampNF(suspensionLimits.nfMin + 0.8), naturalFrequencyRear: clampNF(suspensionLimits.nfMin + 0.8),
        antiRollBarFront: 3, antiRollBarRear: 3,
        damperExpansionFront: clampExp(suspensionLimits.dampExpMin + 12), damperExpansionRear: clampExp(suspensionLimits.dampExpMin + 12),
        damperCompressionFront: clampComp(suspensionLimits.dampCompMin + 12), damperCompressionRear: clampComp(suspensionLimits.dampCompMin + 12),
        camberFront: 1.5, camberRear: 1.0,
        toeInFront: -0.05, toeInRear: 0.10,
        downforceFront: isRaceCar ? 400 : (hasFrontSplitter ? 350 : 50),
        downforceRear: isRaceCar ? 700 : (hasRearWing ? 550 : 75),
        brakeBalance: 1,
        differentialInitialTorque: 15, differentialAcceleration: 55, differentialBraking: 35,
      },
      cornering: {
        rideHeightFront: clampRH(suspensionLimits.rhMin), rideHeightRear: clampRH(suspensionLimits.rhMin),
        naturalFrequencyFront: clampNF(suspensionLimits.nfMax), naturalFrequencyRear: clampNF(suspensionLimits.nfMax),
        antiRollBarFront: 8, antiRollBarRear: 8,
        damperExpansionFront: clampExp(suspensionLimits.dampExpMax - 2), damperExpansionRear: clampExp(suspensionLimits.dampExpMax - 2),
        damperCompressionFront: clampComp(suspensionLimits.dampCompMax - 2), damperCompressionRear: clampComp(suspensionLimits.dampCompMax - 2),
        camberFront: 3.5, camberRear: 3.0,
        toeInFront: -0.15, toeInRear: 0.25,
        downforceFront: isRaceCar ? 600 : (hasFrontSplitter ? 750 : 200),
        downforceRear: isRaceCar ? 1000 : (hasRearWing ? 1100 : 300),
        brakeBalance: 2,
        differentialInitialTorque: 10, differentialAcceleration: 35, differentialBraking: 25,
      },
      braking: {
        rideHeightFront: clampRH(suspensionLimits.rhMin + 20), rideHeightRear: clampRH(suspensionLimits.rhMin + 30),
        naturalFrequencyFront: clampNF(suspensionLimits.nfMin + 1.0), naturalFrequencyRear: clampNF(suspensionLimits.nfMin + 1.2),
        antiRollBarFront: 7, antiRollBarRear: 6,
        damperExpansionFront: clampExp(suspensionLimits.dampExpMin + 10), damperExpansionRear: clampExp(suspensionLimits.dampExpMin + 10),
        damperCompressionFront: clampComp(suspensionLimits.dampCompMin + 15), damperCompressionRear: clampComp(suspensionLimits.dampCompMin + 15),
        camberFront: 2.5, camberRear: 2.0,
        toeInFront: 0.05, toeInRear: 0.15,
        downforceFront: isRaceCar ? 500 : (hasFrontSplitter ? 500 : 150),
        downforceRear: isRaceCar ? 800 : (hasRearWing ? 800 : 200),
        brakeBalance: -2,
        differentialInitialTorque: 20, differentialAcceleration: 30, differentialBraking: 55,
      },
      balanced: {
        rideHeightFront: clampRH(suspensionLimits.rhMin + 20), rideHeightRear: clampRH(suspensionLimits.rhMin + 20),
        naturalFrequencyFront: clampNF(suspensionLimits.nfMin + 0.5), naturalFrequencyRear: clampNF(suspensionLimits.nfMin + 0.5),
        antiRollBarFront: 5, antiRollBarRear: 5,
        damperExpansionFront: clampExp(suspensionLimits.dampExpMin + 5), damperExpansionRear: clampExp(suspensionLimits.dampExpMin + 5),
        damperCompressionFront: clampComp(suspensionLimits.dampCompMin + 5), damperCompressionRear: clampComp(suspensionLimits.dampCompMin + 5),
        camberFront: 2.0, camberRear: 1.5,
        toeInFront: 0.00, toeInRear: 0.15,
        downforceFront: isRaceCar ? 350 : (hasFrontSplitter ? 400 : 120),
        downforceRear: isRaceCar ? 600 : (hasRearWing ? 650 : 150),
        brakeBalance: 0,
        brakeSystemType: 'racing',
        differentialInitialTorque: 10, differentialAcceleration: 45, differentialBraking: 20,
      },
      track: {},
    };

    setTuningSetup(prev => ({ ...prev, ...presets[mode as keyof typeof presets] }));
  };

  const applyTrackPreset = (preset: 'aggressive' | 'balanced' | 'conservative') => {
    if (selectedCircuit) {
      setTuningMode('track');
      const trackData = selectedCircuit.tuningPresets[preset];
      
      // Helper to clamp values to car-specific limits
      const clampNF = (val: number) => Math.min(Math.max(val, suspensionLimits.nfMin), suspensionLimits.nfMax);
      const clampRH = (val: number) => Math.min(Math.max(val, suspensionLimits.rhMin), suspensionLimits.rhMax);
      const clampExp = (val: number) => Math.min(Math.max(val, suspensionLimits.dampExpMin), suspensionLimits.dampExpMax);
      const clampComp = (val: number) => Math.min(Math.max(val, suspensionLimits.dampCompMin), suspensionLimits.dampCompMax);

      const clampedData = {
        ...trackData,
        rideHeightFront: trackData.rideHeightFront ? clampRH(trackData.rideHeightFront) : undefined,
        rideHeightRear: trackData.rideHeightRear ? clampRH(trackData.rideHeightRear) : undefined,
        naturalFrequencyFront: trackData.naturalFrequencyFront ? clampNF(trackData.naturalFrequencyFront) : undefined,
        naturalFrequencyRear: trackData.naturalFrequencyRear ? clampNF(trackData.naturalFrequencyRear) : undefined,
        damperExpansionFront: trackData.damperExpansionFront ? clampExp(trackData.damperExpansionFront) : undefined,
        damperExpansionRear: trackData.damperExpansionRear ? clampExp(trackData.damperExpansionRear) : undefined,
        damperCompressionFront: trackData.damperCompressionFront ? clampComp(trackData.damperCompressionFront) : undefined,
        damperCompressionRear: trackData.damperCompressionRear ? clampComp(trackData.damperCompressionRear) : undefined,
      };

      setTuningSetup(prev => ({ ...prev, ...clampedData }));
    }
  };

  // --- CALCULATIONS ---
  const metrics = useMemo<PerformanceMetrics | null>(() => {
    if (!selectedCar) return null;
    const power = calculateEffectivePower(customBhp || selectedCar.power_bhp, tuningSetup.powerRestriction || 100);
    const weight = calculateTotalWeight(customWeight || selectedCar.weight_kg, tuningSetup.ballastKg || 0);
    const tireGrip = tuningSetup.tireGripCoefficient || 1.1;

    const accel0to60 = calculate0to60Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 60);
    const accel0to100 = calculate0to100Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 60);
    const accel0to200 = calculate0to200Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 60);

    const brake100to0 = calculateBrakingDistance100to0(
      weight, 
      tuningSetup.brakeSystemType || 'racing', 
      tuningSetup.brakeBalance || 0, 
      tireGrip, 
      tuningSetup.differentialBraking || 50
    );

    const lateralG = calculateLateralAcceleration(
      tuningSetup.downforceFront || 100,
      tuningSetup.downforceRear || 150,
      weight,
      tuningSetup.camberFront || 2.0,
      tuningSetup.camberRear || 1.5,
      tuningSetup.antiRollBarFront || 5,
      tuningSetup.antiRollBarRear || 5,
      tireGrip
    );

    const corneringSpeed = calculateCorneringSpeed(lateralG);
    const topSpeed = calculateTopSpeed(power, weight, tuningSetup.downforceFront || 100, tuningSetup.downforceRear || 150);

    const accelRating = calculateAccelerationRating(accel0to60, accel0to100, accel0to200);
    const brakingRating = calculateBrakingRating(brake100to0, brake100to0 * 2.5);
    const corneringRating = calculateCorneringRating(lateralG, corneringSpeed);
    const topSpeedRating = calculateTopSpeedRating(topSpeed);

    return {
      acceleration0to60: accel0to60,
      acceleration0to100: accel0to100,
      acceleration0to200: accel0to200,
      accelerationRating: accelRating,
      brakingDistance100to0: brake100to0,
      brakingDistance200to0: brake100to0 * 2.5,
      brakingDeceleration: 1.2,
      brakingRating: brakingRating,
      lateralAcceleration: lateralG,
      corneringSpeed: corneringSpeed,
      corneringRating: corneringRating,
      topSpeed: topSpeed,
      topSpeedRating: topSpeedRating,
      overallRating: calculateOverallRating(accelRating, brakingRating, corneringRating, topSpeedRating),
      balanceScore: calculateBalanceScore(accelRating, brakingRating, corneringRating, topSpeedRating),
    };
  }, [selectedCar, tuningSetup, customBhp, customWeight]);

  const radarData = metrics ? [
    { name: 'Accel', value: metrics.accelerationRating },
    { name: 'Braking', value: metrics.brakingRating },
    { name: 'Cornering', value: metrics.corneringRating },
    { name: 'Top Speed', value: metrics.topSpeedRating },
  ] : [];

  const performanceData = metrics ? [
    { label: '0-60 mph', value: metrics.acceleration0to60.toFixed(2) + 's' },
    { label: 'Brake 100→0', value: metrics.brakingDistance100to0.toFixed(1) + 'm' },
    { label: 'Lateral G', value: metrics.lateralAcceleration.toFixed(2) + 'g' },
    { label: 'Top Speed', value: metrics.topSpeed.toFixed(0) + ' km/h' },
    { label: 'Layout', value: activeLayoutName },
  ] : [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-primary uppercase leading-none mb-2">GT7 Tuner Alpha</h1>
          <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] font-bold">Performance Simulator v2.0</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Current Rating</p>
            <p className="text-3xl font-black mono-num text-primary">{metrics?.overallRating.toFixed(0) || '00'}</p>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Balance Score</p>
            <p className="text-3xl font-black mono-num text-blue-500">{metrics?.balanceScore.toFixed(0) || '00'}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Car Selection */}
          <Card className="bg-card border-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-primary">Select Vehicle</h2>
            <div className="space-y-4">
              <Select value={selectedManufacturer} onValueChange={(val) => {
                setSelectedManufacturer(val);
                const firstModel = GT7_CARS.find(car => car.manufacturer === val)?.model || '';
                setSelectedModel(firstModel);
                setSelectedCar(GT7_CARS.find(car => car.manufacturer === val && car.model === firstModel) || null);
              }}>
                <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Manufacturer" /></SelectTrigger>
                <SelectContent className="max-h-80">{manufacturers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
              
              <Select value={selectedModel} onValueChange={(val) => {
                setSelectedModel(val);
                setSelectedCar(GT7_CARS.find(car => car.manufacturer === selectedManufacturer && car.model === val) || null);
              }}>
                <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Model" /></SelectTrigger>
                <SelectContent className="max-h-80">{models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Custom BHP</label>
                  <Input 
                    type="number" 
                    placeholder={selectedCar?.power_bhp?.toString() || "0"} 
                    value={customBhp || ''} 
                    onChange={(e) => setCustomBhp(e.target.value ? parseInt(e.target.value) : null)}
                    className="h-8 text-xs bg-input border-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Custom KG</label>
                  <Input 
                    type="number" 
                    placeholder={selectedCar?.weight_kg?.toString() || "0"} 
                    value={customWeight || ''} 
                    onChange={(e) => setCustomWeight(e.target.value ? parseInt(e.target.value) : null)}
                    className="h-8 text-xs bg-input border-border"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Hierarchical Track Selection */}
          <Card className="bg-card border-border p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4 text-primary">Select Track</h2>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Select value={selectedRegion} onValueChange={(val) => {
                setSelectedRegion(val);
                const firstLoc = TRACK_REGIONS.find(r => r.name === val)?.locations[0];
                setSelectedLocation(firstLoc?.name || '');
                setSelectedCircuit(firstLoc?.circuits[0] || null);
              }}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Region" /></SelectTrigger>
                <SelectContent>{TRACK_REGIONS.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={(val) => {
                setSelectedLocation(val);
                setSelectedCircuit(currentLocations.find(l => l.name === val)?.circuits[0] || null);
              }}>
                <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>{currentLocations.map(l => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select value={selectedCircuit?.id} onValueChange={(id) => setSelectedCircuit(ALL_CIRCUITS.find(c => c.id === id) || null)}>
                <SelectTrigger><SelectValue placeholder="Circuit" /></SelectTrigger>
                <SelectContent className="max-h-80">{currentCircuits.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              {selectedCircuit?.layouts && (
                <Select value={selectedLayoutId} onValueChange={setSelectedLayoutId}>
                  <SelectTrigger className="bg-secondary/30"><SelectValue placeholder="Layout" /></SelectTrigger>
                  <SelectContent>{selectedCircuit.layouts.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
          </Card>

          {/* Performance Visualization */}
          <Card className="bg-card border-border p-5 flex flex-col items-center justify-center">
            <div className="w-full h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                  <Radar dataKey="value" stroke="#E8002D" fill="#E8002D" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {selectedCar ? (
          <>
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['balanced', 'acceleration', 'cornering', 'braking'].map(mode => (
                <Button key={mode} variant={tuningMode === mode ? 'default' : 'outline'} onClick={() => applyPreset(mode as any)} className="uppercase text-[10px] font-bold h-7 px-3">{mode}</Button>
              ))}
              <div className="w-px h-7 bg-border mx-1"></div>
              {['aggressive', 'balanced', 'conservative'].map(p => (
                <Button key={p} variant="outline" onClick={() => applyTrackPreset(p as any)} className="uppercase text-[10px] font-bold h-7 px-3 border-primary/50 text-primary">Track {p}</Button>
              ))}
            </div>

            {/* Tuning Tabs */}
            <Tabs defaultValue="suspension" className="mb-8">
              <TabsList className="bg-card border border-border w-full justify-start h-10">
                <TabsTrigger value="suspension" className="text-xs font-bold uppercase">Suspension</TabsTrigger>
                <TabsTrigger value="aerodynamics" className="text-xs font-bold uppercase">Aero & Tires</TabsTrigger>
                <TabsTrigger value="drivetrain" className="text-xs font-bold uppercase">Drivetrain</TabsTrigger>
                <TabsTrigger value="braking" className="text-xs font-bold uppercase">Braking</TabsTrigger>
              </TabsList>

              {/* Suspension Tab */}
              <TabsContent value="suspension">
                <Card className="p-6 bg-card border-border">
                  <div className="flex justify-end mb-6">
                    <Select value={suspensionType} onValueChange={(v: any) => setSuspensionType(v)}>
                      <SelectTrigger className="h-8 w-40 text-xs uppercase"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard Suspension</SelectItem>
                        <SelectItem value="street">Street Suspension</SelectItem>
                        <SelectItem value="sports">Sports Suspension</SelectItem>
                        <SelectItem value="racing">Racing Suspension</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* 1. Ride Height */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Body Height Adjustment (F/R) [{suspensionLimits.rhMin}-{suspensionLimits.rhMax}]</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.rideHeightFront}mm</span>
                          <Slider value={[Math.min(Math.max(tuningSetup.rideHeightFront || 100, suspensionLimits.rhMin), suspensionLimits.rhMax)]} onValueChange={([v]) => updateTuning('rideHeightFront', v)} min={suspensionLimits.rhMin} max={suspensionLimits.rhMax} step={1} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.rideHeightRear}mm</span>
                          <Slider value={[Math.min(Math.max(tuningSetup.rideHeightRear || 100, suspensionLimits.rhMin), suspensionLimits.rhMax)]} onValueChange={([v]) => updateTuning('rideHeightRear', v)} min={suspensionLimits.rhMin} max={suspensionLimits.rhMax} step={1} />
                        </div>
                      </div>
                    </div>
                    {/* 2. Anti-Roll Bar */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Anti-Roll Bar (F/R) [1-10]</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.antiRollBarFront}</span>
                          <Slider value={[tuningSetup.antiRollBarFront || 5]} onValueChange={([v]) => updateTuning('antiRollBarFront', v)} min={1} max={10} step={1} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.antiRollBarRear}</span>
                          <Slider value={[tuningSetup.antiRollBarRear || 5]} onValueChange={([v]) => updateTuning('antiRollBarRear', v)} min={1} max={10} step={1} />
                        </div>
                      </div>
                    </div>
                    {/* 3. Dampers Compression */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Damping Ratio: Compression (F/R) [{suspensionLimits.dampCompMin}-{suspensionLimits.dampCompMax}]</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.damperCompressionFront}</span>
                          <Slider value={[tuningSetup.damperCompressionFront || 25]} onValueChange={([v]) => updateTuning('damperCompressionFront', v)} min={suspensionLimits.dampCompMin} max={suspensionLimits.dampCompMax} step={1} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.damperCompressionRear}</span>
                          <Slider value={[tuningSetup.damperCompressionRear || 25]} onValueChange={([v]) => updateTuning('damperCompressionRear', v)} min={suspensionLimits.dampCompMin} max={suspensionLimits.dampCompMax} step={1} />
                        </div>
                      </div>
                    </div>
                    {/* 4. Dampers Expansion */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Damping Ratio: Expansion (F/R) [{suspensionLimits.dampExpMin}-{suspensionLimits.dampExpMax}]</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.damperExpansionFront}</span>
                          <Slider value={[tuningSetup.damperExpansionFront || 35]} onValueChange={([v]) => updateTuning('damperExpansionFront', v)} min={suspensionLimits.dampExpMin} max={suspensionLimits.dampExpMax} step={1} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.damperExpansionRear}</span>
                          <Slider value={[tuningSetup.damperExpansionRear || 35]} onValueChange={([v]) => updateTuning('damperExpansionRear', v)} min={suspensionLimits.dampExpMin} max={suspensionLimits.dampExpMax} step={1} />
                        </div>
                      </div>
                    </div>
                    {/* 5. Natural Frequency */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Natural Frequency (F/R) [{suspensionLimits.nfMin.toFixed(2)}-{suspensionLimits.nfMax.toFixed(2)}]</label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.naturalFrequencyFront?.toFixed(2)} Hz</span>
                          <Slider 
                            value={[Math.min(Math.max(tuningSetup.naturalFrequencyFront || 2.0, suspensionLimits.nfMin), suspensionLimits.nfMax)]} 
                            onValueChange={([v]) => updateTuning('naturalFrequencyFront', v)} 
                            min={suspensionLimits.nfMin} 
                            max={suspensionLimits.nfMax} 
                            step={0.01} 
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.naturalFrequencyRear?.toFixed(2)} Hz</span>
                          <Slider 
                            value={[Math.min(Math.max(tuningSetup.naturalFrequencyRear || 2.0, suspensionLimits.nfMin), suspensionLimits.nfMax)]} 
                            onValueChange={([v]) => updateTuning('naturalFrequencyRear', v)} 
                            min={suspensionLimits.nfMin} 
                            max={suspensionLimits.nfMax} 
                            step={0.01} 
                          />
                        </div>
                      </div>
                    </div>
                    {/* 6. Negative Camber Angle */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Negative Camber Angle (F/R) [0.0-10.0]</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.camberFront?.toFixed(1)}°</span>
                          <Slider value={[tuningSetup.camberFront || 2.0]} onValueChange={([v]) => updateTuning('camberFront', v)} min={0.0} max={10.0} step={0.1} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.camberRear?.toFixed(1)}°</span>
                          <Slider value={[tuningSetup.camberRear || 1.5]} onValueChange={([v]) => updateTuning('camberRear', v)} min={0.0} max={10.0} step={0.1} />
                        </div>
                      </div>
                    </div>
                    {/* 7. Toe Angle */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Toe Angle (F/R) [-1.00-1.00]</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.toeInFront?.toFixed(2)}°</span>
                          <Slider value={[tuningSetup.toeInFront || 0]} onValueChange={([v]) => updateTuning('toeInFront', v)} min={-1.0} max={1.0} step={0.01} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.toeInRear?.toFixed(2)}°</span>
                          <Slider value={[tuningSetup.toeInRear || 0]} onValueChange={([v]) => updateTuning('toeInRear', v)} min={-1.0} max={1.0} step={0.01} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Aero & Tires */}
              <TabsContent value="aerodynamics">
                <Card className="p-6 bg-card border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Aerodynamics (lbs)</label>
                        <div className="flex gap-2">
                          <Button 
                            variant={hasFrontSplitter ? "default" : "outline"} 
                            size="sm" 
                            className="h-6 text-[9px] uppercase px-2"
                            onClick={() => setHasFrontSplitter(!hasFrontSplitter)}
                          >
                            Front Splitter
                          </Button>
                          <Button 
                            variant={hasRearWing ? "default" : "outline"} 
                            size="sm" 
                            className="h-6 text-[9px] uppercase px-2"
                            onClick={() => setHasRearWing(!hasRearWing)}
                          >
                            Rear Wing
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] mono-num text-primary">
                            <span>Front {hasFrontSplitter && <span className="text-[8px] text-muted-foreground ml-1">(Splitter Active)</span>}</span>
                            <span>{tuningSetup.downforceFront} lbs</span>
                          </div>
                          <Slider 
                            value={[tuningSetup.downforceFront || 100]} 
                            onValueChange={([v]) => updateTuning('downforceFront', v)} 
                            min={isRaceCar || isVisionGT ? 200 : 0} 
                            max={isRaceCar || isVisionGT ? 1200 : (hasFrontSplitter ? 800 : 500)} 
                            step={5} 
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] mono-num text-primary">
                            <span>Rear {(hasRearWing || isRaceCar) && <span className="text-[8px] text-muted-foreground ml-1">({isRaceCar ? 'Race Wing' : 'Custom Wing'} Active)</span>}</span>
                            <span>{tuningSetup.downforceRear} lbs</span>
                          </div>
                          <Slider 
                            value={[tuningSetup.downforceRear || 150]} 
                            onValueChange={([v]) => updateTuning('downforceRear', v)} 
                            min={isRaceCar || isVisionGT ? 400 : 0} 
                            max={isRaceCar || isVisionGT ? 2000 : (hasRearWing ? 1200 : 500)} 
                            step={5} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Tire Compound</label>
                      <Select value={Object.keys(TIRE_GRIP_COEFFICIENTS).find(k => TIRE_GRIP_COEFFICIENTS[k as keyof typeof TIRE_GRIP_COEFFICIENTS] === tuningSetup.tireGripCoefficient) || 'racing-hard'} onValueChange={v => updateTuning('tireGripCoefficient', TIRE_GRIP_COEFFICIENTS[v as keyof typeof TIRE_GRIP_COEFFICIENTS])}>
                        <SelectTrigger><SelectValue placeholder="Select Tire" /></SelectTrigger>
                        <SelectContent className="max-h-80">
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
                      <p className="text-[10px] mono-num text-primary">Grip Multiplier: {tuningSetup.tireGripCoefficient?.toFixed(2)}</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Drivetrain Tab */}
              <TabsContent value="drivetrain">
                <Card className="p-6 bg-card border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Initial Torque</label>
                      <span className="block text-xs mono-num text-primary">{tuningSetup.differentialInitialTorque}</span>
                      <Slider value={[tuningSetup.differentialInitialTorque || 10]} onValueChange={([v]) => updateTuning('differentialInitialTorque', v)} min={5} max={60} step={1} />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Acceleration Sensitivity</label>
                      <span className="block text-xs mono-num text-primary">{tuningSetup.differentialAcceleration}</span>
                      <Slider value={[tuningSetup.differentialAcceleration || 45]} onValueChange={([v]) => updateTuning('differentialAcceleration', v)} min={5} max={60} step={1} />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Braking Sensitivity</label>
                      <span className="block text-xs mono-num text-primary">{tuningSetup.differentialBraking}</span>
                      <Slider value={[tuningSetup.differentialBraking || 20]} onValueChange={([v]) => updateTuning('differentialBraking', v)} min={5} max={60} step={1} />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Braking Tab */}
              <TabsContent value="braking">
                <Card className="p-6 bg-card border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Brake System</label>
                      <Select value={tuningSetup.brakeSystemType} onValueChange={v => updateTuning('brakeSystemType', v)}>
                        <SelectTrigger><SelectValue placeholder="Select Brakes" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(BRAKE_SYSTEMS).map(([id, info]) => <SelectItem key={id} value={id}>{info.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Brake Balance (F -5 to R 5)</label>
                      <div className="flex justify-between text-[10px] mono-num text-primary">
                        <span>F {tuningSetup.brakeBalance && tuningSetup.brakeBalance < 0 ? Math.abs(tuningSetup.brakeBalance) : 0}</span>
                        <span>R {tuningSetup.brakeBalance && tuningSetup.brakeBalance > 0 ? tuningSetup.brakeBalance : 0}</span>
                      </div>
                      <Slider value={[tuningSetup.brakeBalance || 0]} onValueChange={([v]) => updateTuning('brakeBalance', v)} min={-5} max={5} step={1} />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Performance Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {performanceData.map((item, idx) => (
                <div key={idx} className="p-4 bg-secondary/20 rounded border border-border">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">{item.label}</p>
                  <p className="text-lg font-black mono-num text-primary leading-none">{item.value}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <Card className="p-20 text-center border-dashed border-2">
            <p className="text-muted-foreground uppercase tracking-widest text-sm">Initialize Car Data to Begin</p>
          </Card>
        )}
      </main>
    </div>
  );
}
