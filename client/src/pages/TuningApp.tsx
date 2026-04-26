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

  // Dynamic Ride Height Limits based on Car Type
  const rideHeightLimits = useMemo(() => {
    if (!selectedCar) return { min: 50, max: 200 };
    // Racing cars (Gr.3, Gr.4, etc.) go lower
    const isRaceCar = selectedCar.model.includes('Gr.') || selectedCar.model.includes('GT3') || selectedCar.model.includes('Race Car');
    if (isRaceCar) return { min: 50, max: 120 };
    // Road cars are higher
    return { min: 80, max: 200 };
  }, [selectedCar]);

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
    const presets = {
      acceleration: {
        rideHeightFront: rideHeightLimits.min + 10, rideHeightRear: rideHeightLimits.min + 15,
        naturalFrequencyFront: 2.8, naturalFrequencyRear: 2.8,
        antiRollBarFront: 3, antiRollBarRear: 3,
        damperExpansionFront: 42, damperExpansionRear: 42,
        damperCompressionFront: 32, damperCompressionRear: 32,
        camberFront: 1.5, camberRear: 1.0,
        toeInFront: -0.05, toeInRear: 0.10,
        downforceFront: hasFrontSplitter ? 350 : 50,
        downforceRear: hasRearWing ? 550 : 75,
        differentialInitialTorque: 15, differentialAcceleration: 55,
      },
      cornering: {
        rideHeightFront: rideHeightLimits.min, rideHeightRear: rideHeightLimits.min,
        naturalFrequencyFront: 3.5, naturalFrequencyRear: 3.5,
        antiRollBarFront: 8, antiRollBarRear: 8,
        damperExpansionFront: 48, damperExpansionRear: 48,
        damperCompressionFront: 38, damperCompressionRear: 38,
        camberFront: 3.5, camberRear: 3.0,
        toeInFront: -0.15, toeInRear: 0.25,
        downforceFront: hasFrontSplitter ? 750 : 200,
        downforceRear: hasRearWing ? 1100 : 300,
        differentialInitialTorque: 10, differentialAcceleration: 35,
      },
      braking: {
        rideHeightFront: rideHeightLimits.min + 20, rideHeightRear: rideHeightLimits.min + 30,
        naturalFrequencyFront: 3.0, naturalFrequencyRear: 3.2,
        antiRollBarFront: 7, antiRollBarRear: 6,
        damperExpansionFront: 40, damperExpansionRear: 40,
        damperCompressionFront: 35, damperCompressionRear: 35,
        camberFront: 2.5, camberRear: 2.0,
        toeInFront: 0.05, toeInRear: 0.15,
        downforceFront: hasFrontSplitter ? 500 : 150,
        downforceRear: hasRearWing ? 800 : 200,
        brakeBalance: -2,
        differentialInitialTorque: 20, differentialBraking: 55,
      },
      balanced: {
        rideHeightFront: rideHeightLimits.min + 20, rideHeightRear: rideHeightLimits.min + 20,
        naturalFrequencyFront: 2.5, naturalFrequencyRear: 2.5,
        antiRollBarFront: 5, antiRollBarRear: 5,
        damperExpansionFront: 35, damperExpansionRear: 35,
        damperCompressionFront: 25, damperCompressionRear: 25,
        camberFront: 2.0, camberRear: 1.5,
        toeInFront: 0.00, toeInRear: 0.15,
        downforceFront: hasFrontSplitter ? 400 : 120,
        downforceRear: hasRearWing ? 650 : 150,
        brakeBalance: 0,
        differentialInitialTorque: 10, differentialAcceleration: 45,
      },
      track: {},
    };

    setTuningSetup(prev => ({ ...prev, ...presets[mode as keyof typeof presets] }));
  };

  const applyTrackPreset = (preset: 'aggressive' | 'balanced' | 'conservative') => {
    if (selectedCircuit) {
      setTuningMode('track');
      setTuningSetup(prev => ({ ...prev, ...selectedCircuit.tuningPresets[preset] }));
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">GT</div>
            <h1 className="text-xl font-bold tracking-tighter italic uppercase">Tuning Simulator</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Overall Rating</p>
              <p className="text-2xl font-black mono-num text-primary leading-none">{metrics?.overallRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {/* Selection Area */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Ride Height */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Ride Height (F/R)</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.rideHeightFront} mm</span>
                          <Slider value={[tuningSetup.rideHeightFront || rideHeightLimits.min]} onValueChange={([v]) => updateTuning('rideHeightFront', v)} min={rideHeightLimits.min} max={rideHeightLimits.max} step={1} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.rideHeightRear} mm</span>
                          <Slider value={[tuningSetup.rideHeightRear || rideHeightLimits.min]} onValueChange={([v]) => updateTuning('rideHeightRear', v)} min={rideHeightLimits.min} max={rideHeightLimits.max} step={1} />
                        </div>
                      </div>
                    </div>
                    {/* Anti-Roll Bar */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Anti-Roll Bar (F/R)</label></div>
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
                    {/* Natural Frequency */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Natural Frequency (F/R)</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.naturalFrequencyFront?.toFixed(2)} Hz</span>
                          <Slider value={[tuningSetup.naturalFrequencyFront || 2.0]} onValueChange={([v]) => updateTuning('naturalFrequencyFront', v)} min={1.0} max={5.0} step={0.05} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.naturalFrequencyRear?.toFixed(2)} Hz</span>
                          <Slider value={[tuningSetup.naturalFrequencyRear || 2.0]} onValueChange={([v]) => updateTuning('naturalFrequencyRear', v)} min={1.0} max={5.0} step={0.05} />
                        </div>
                      </div>
                    </div>
                    {/* Camber Angle */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Camber Angle (F/R)</label></div>
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
                    {/* Toe Angle */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Toe Angle (F/R)</label></div>
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
                    {/* Dampers Expansion */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Damper Expansion (F/R) [Range: 30-50]</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.damperExpansionFront}</span>
                          <Slider value={[tuningSetup.damperExpansionFront || 35]} onValueChange={([v]) => updateTuning('damperExpansionFront', v)} min={30} max={50} step={1} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.damperExpansionRear}</span>
                          <Slider value={[tuningSetup.damperExpansionRear || 35]} onValueChange={([v]) => updateTuning('damperExpansionRear', v)} min={30} max={50} step={1} />
                        </div>
                      </div>
                    </div>
                    {/* Dampers Compression */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end"><label className="text-xs font-bold uppercase text-muted-foreground">Damper Compression (F/R) [Range: 20-40]</label></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.damperCompressionFront}</span>
                          <Slider value={[tuningSetup.damperCompressionFront || 25]} onValueChange={([v]) => updateTuning('damperCompressionFront', v)} min={20} max={40} step={1} />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] mono-num text-primary">{tuningSetup.damperCompressionRear}</span>
                          <Slider value={[tuningSetup.damperCompressionRear || 25]} onValueChange={([v]) => updateTuning('damperCompressionRear', v)} min={20} max={40} step={1} />
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
                            min={0} 
                            max={hasFrontSplitter ? 800 : 500} 
                            step={5} 
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] mono-num text-primary">
                            <span>Rear {hasRearWing && <span className="text-[8px] text-muted-foreground ml-1">(Custom Wing Active)</span>}</span>
                            <span>{tuningSetup.downforceRear} lbs</span>
                          </div>
                          <Slider 
                            value={[tuningSetup.downforceRear || 150]} 
                            onValueChange={([v]) => updateTuning('downforceRear', v)} 
                            min={0} 
                            max={hasRearWing ? 1200 : 500} 
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
                          <SelectItem value="racing-slick">Racing: Slick</SelectItem>
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
                        <span>F {tuningSetup.brakeBalance && tuningSetup.brakeBalance < 0 ? tuningSetup.brakeBalance : 0}</span>
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
