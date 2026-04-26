import { useState, useMemo, useEffect } from 'react';
import { GT7_CARS, GT7Car } from '@/lib/gt7_cars';
import { GT7_TRACKS, TrackProfile } from '@/lib/gt7_tracks';
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
  calculateBalanceScore
} from '@/lib/gt7_physics';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

/**
 * GT7 Tuning Simulator
 * Design: Dark Industrial / Motorsport HUD with real-time performance visualization
 * Features: Track-specific tuning profiles with automatic recommendations
 */
export default function TuningApp() {
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>(GT7_CARS[0]?.manufacturer || '');
  const [selectedModel, setSelectedModel] = useState<string>(GT7_CARS[0]?.model || '');
  const [selectedCar, setSelectedCar] = useState<GT7Car | null>(GT7_CARS[0] || null);
  const [selectedTrack, setSelectedTrack] = useState<TrackProfile | null>(GT7_TRACKS[0] || null);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');

  // Update layout when track changes
  useEffect(() => {
    if (selectedTrack && selectedTrack.layouts && selectedTrack.layouts.length > 0) {
      setSelectedLayoutId(selectedTrack.layouts[0].id);
    } else {
      setSelectedLayoutId('');
    }
  }, [selectedTrack]);

  const activeLayout = useMemo(() => {
    if (!selectedTrack || !selectedLayoutId) return null;
    return selectedTrack.layouts?.find(l => l.id === selectedLayoutId) || null;
  }, [selectedTrack, selectedLayoutId]);

  // Get unique manufacturers
  const manufacturers = useMemo(() => {
    const unique = Array.from(new Set(GT7_CARS.map(car => car.manufacturer))).sort();
    return unique;
  }, []);

  // Get models for selected manufacturer
  const models = useMemo(() => {
    return GT7_CARS.filter(car => car.manufacturer === selectedManufacturer).map(car => car.model).sort();
  }, [selectedManufacturer]);

  // Tuning state
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
    damperExpansionFront: 5,
    damperExpansionRear: 5,
    damperCompressionFront: 5,
    damperCompressionRear: 5,
    camberFront: 2.0,
    camberRear: 1.5,
    toeInFront: 0.0,
    toeInRear: 0.2,
    downforceFront: 100,
    downforceRear: 150,
    brakePowerMultiplier: 1.35,
    brakeBalance: 55,
    differentialInitialTorque: 10,
    differentialAcceleration: 60,
    differentialBraking: 50,
    tirePressureFront: 30,
    tirePressureRear: 30,
    tireGripCoefficient: 1.1, // Racing: Hard default
  });

  const [customBhp, setCustomBhp] = useState<number | null>(null);
  const [customWeight, setCustomWeight] = useState<number | null>(null);
  const [tuningMode, setTuningMode] = useState<'balanced' | 'acceleration' | 'cornering' | 'braking' | 'track'>('balanced');

  // Update tuning state
  const updateTuning = (key: keyof TuningSetup, value: any) => {
    setTuningSetup(prev => ({ ...prev, [key]: value }));
  };

  // Apply tuning presets
  const applyPreset = (mode: typeof tuningMode) => {
    setTuningMode(mode);
    const presets = {
      acceleration: {
        powerRestriction: 100,
        ballastKg: 0,
        downforceFront: 50,
        downforceRear: 75,
        rideHeightFront: 90,
        rideHeightRear: 95,
        antiRollBarFront: 3,
        antiRollBarRear: 3,
        damperExpansionFront: 6,
        damperExpansionRear: 6,
        damperCompressionFront: 4,
        damperCompressionRear: 4,
        brakeBalance: 50,
        differentialInitialTorque: 15,
        differentialAcceleration: 80,
      },
      cornering: {
        powerRestriction: 90,
        ballastKg: 50,
        downforceFront: 200,
        downforceRear: 300,
        rideHeightFront: 80,
        rideHeightRear: 80,
        antiRollBarFront: 8,
        antiRollBarRear: 8,
        damperExpansionFront: 8,
        damperExpansionRear: 8,
        damperCompressionFront: 7,
        damperCompressionRear: 7,
        brakeBalance: 55,
        differentialInitialTorque: 10,
        differentialAcceleration: 40,
      },
      braking: {
        powerRestriction: 80,
        ballastKg: 100,
        downforceFront: 150,
        downforceRear: 200,
        rideHeightFront: 100,
        rideHeightRear: 110,
        antiRollBarFront: 7,
        antiRollBarRear: 6,
        damperExpansionFront: 7,
        damperExpansionRear: 7,
        damperCompressionFront: 8,
        damperCompressionRear: 8,
        brakeBalance: 60,
        differentialInitialTorque: 20,
        differentialBraking: 70,
      },
      balanced: {
        powerRestriction: 100,
        ballastKg: 20,
        downforceFront: 120,
        downforceRear: 150,
        rideHeightFront: 100,
        rideHeightRear: 100,
        antiRollBarFront: 5,
        antiRollBarRear: 5,
        damperExpansionFront: 5,
        damperExpansionRear: 5,
        damperCompressionFront: 5,
        damperCompressionRear: 5,
        brakeBalance: 55,
        differentialInitialTorque: 10,
        differentialAcceleration: 60,
      },
      track: {},
    };

    setTuningSetup((prev) => ({
      ...prev,
      ...presets[mode as keyof typeof presets],
    }));
  };

  const applyTrackPreset = (preset: 'aggressive' | 'balanced' | 'conservative') => {
    if (selectedTrack) {
      setTuningMode('track');
      setTuningSetup((prev) => ({
        ...prev,
        ...selectedTrack.tuningPresets[preset],
      }));
    }
  };

  // Calculate performance metrics
  const metrics = useMemo<PerformanceMetrics | null>(() => {
    if (!selectedCar) return null;

    const basePower = customBhp || selectedCar.power_bhp;
    const baseWeight = customWeight || selectedCar.weight_kg;

    const power = calculateEffectivePower(basePower, tuningSetup.powerRestriction || 100);
    const weight = calculateTotalWeight(baseWeight, tuningSetup.ballastKg || 0);
    const tireGrip = tuningSetup.tireGripCoefficient || 1.1;

    const accel0to60 = calculate0to60Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 60);
    const accel0to100 = calculate0to100Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 60);
    const accel0to200 = calculate0to200Time(power, weight, tireGrip, tuningSetup.differentialAcceleration || 60);

    const brake100to0 = calculateBrakingDistance100to0(
      weight,
      tuningSetup.brakePowerMultiplier || 1.35,
      tuningSetup.brakeBalance || 55,
      tireGrip,
      tuningSetup.differentialBraking || 50
    );

    const brake200to0 = calculateBrakingDistance200to0(
      weight,
      tuningSetup.brakePowerMultiplier || 1.35,
      tuningSetup.brakeBalance || 55,
      tireGrip,
      tuningSetup.differentialBraking || 50
    );

    const brakingDecel = calculateBrakingDeceleration(
      tuningSetup.brakePowerMultiplier || 1.35,
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
    const topSpeed = calculateTopSpeed(
      power,
      weight,
      tuningSetup.downforceFront || 100,
      tuningSetup.downforceRear || 150
    );

    const accelRating = calculateAccelerationRating(accel0to60, accel0to100, accel0to200);
    const brakingRating = calculateBrakingRating(brake100to0, brake200to0);
    const corneringRating = calculateCorneringRating(lateralG, corneringSpeed);
    const topSpeedRating = calculateTopSpeedRating(topSpeed);

    return {
      acceleration0to60: accel0to60,
      acceleration0to100: accel0to100,
      acceleration0to200: accel0to200,
      accelerationRating: accelRating,
      brakingDistance100to0: brake100to0,
      brakingDistance200to0: brake200to0,
      brakingDeceleration: brakingDecel,
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

  const radarData = metrics
    ? [
        { name: 'Accel', value: metrics.accelerationRating },
        { name: 'Braking', value: metrics.brakingRating },
        { name: 'Cornering', value: metrics.corneringRating },
        { name: 'Top Speed', value: metrics.topSpeedRating },
      ]
    : [];

  const performanceData = metrics
    ? [
        { label: '0-60 mph', value: metrics.acceleration0to60.toFixed(2) + 's' },
        { label: '0-100 mph', value: metrics.acceleration0to100.toFixed(2) + 's' },
        { label: '0-200 km/h', value: metrics.acceleration0to200.toFixed(2) + 's' },
        { label: 'Brake 100→0', value: metrics.brakingDistance100to0.toFixed(1) + 'm' },
        { label: 'Brake 200→0', value: metrics.brakingDistance200to0.toFixed(1) + 'm' },
        { label: 'Lateral G', value: metrics.lateralAcceleration.toFixed(2) + 'g' },
        { label: 'Cornering Speed', value: metrics.corneringSpeed.toFixed(0) + ' km/h' },
        { label: 'Top Speed', value: metrics.topSpeed.toFixed(0) + ' km/h' },
        { label: 'Track Layout', value: activeLayout ? activeLayout.name : 'Full' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">GT</div>
            <h1 className="text-xl font-bold tracking-tighter italic">TUNING SIMULATOR <span className="text-primary text-xs not-italic font-normal align-top ml-1">ALPHA</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Performance Rating</p>
              <p className="text-2xl font-black mono-num text-primary leading-none">{metrics?.overallRating.toFixed(1)}</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block"></div>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">Export Setup</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Car Selection */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Select Vehicle</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Manufacturer</label>
                <Select value={selectedManufacturer} onValueChange={(val) => {
                  setSelectedManufacturer(val);
                  const firstModel = GT7_CARS.find(car => car.manufacturer === val)?.model || '';
                  setSelectedModel(firstModel);
                  const car = GT7_CARS.find(car => car.manufacturer === val && car.model === firstModel);
                  if (car) setSelectedCar(car);
                }}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Manufacturer" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-96">
                    {manufacturers.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Model</label>
                <Select value={selectedModel} onValueChange={(val) => {
                  setSelectedModel(val);
                  const car = GT7_CARS.find(car => car.manufacturer === selectedManufacturer && car.model === val);
                  if (car) setSelectedCar(car);
                }}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-96">
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Track Selection */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Select Track</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Location</label>
                <Select value={selectedTrack?.id} onValueChange={(id) => {
                  const track = GT7_TRACKS.find(t => t.id === id);
                  if (track) setSelectedTrack(track);
                }}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose a track..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-96">
                    {GT7_TRACKS.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTrack && selectedTrack.layouts && selectedTrack.layouts.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground font-bold tracking-widest">Layout</label>
                  <Select value={selectedLayoutId} onValueChange={setSelectedLayoutId}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Choose a layout..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {selectedTrack.layouts.map((layout) => (
                        <SelectItem key={layout.id} value={layout.id}>
                          {layout.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>

          {/* Visualization */}
          <Card className="bg-card border-border p-6 flex flex-col items-center justify-center min-h-[250px]">
            <h2 className="text-lg font-semibold mb-2 self-start">Performance Balance</h2>
            <div className="w-full h-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#E8002D"
                    fill="#E8002D"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {selectedCar ? (
          <>
            {/* Tuning Presets */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Button 
                variant={tuningMode === 'balanced' ? 'default' : 'outline'} 
                onClick={() => applyPreset('balanced')}
                className="uppercase text-xs font-bold tracking-widest h-8"
              >Balanced</Button>
              <Button 
                variant={tuningMode === 'acceleration' ? 'default' : 'outline'} 
                onClick={() => applyPreset('acceleration')}
                className="uppercase text-xs font-bold tracking-widest h-8"
              >Acceleration</Button>
              <Button 
                variant={tuningMode === 'cornering' ? 'default' : 'outline'} 
                onClick={() => applyPreset('cornering')}
                className="uppercase text-xs font-bold tracking-widest h-8"
              >Cornering</Button>
              <Button 
                variant={tuningMode === 'braking' ? 'default' : 'outline'} 
                onClick={() => applyPreset('braking')}
                className="uppercase text-xs font-bold tracking-widest h-8"
              >Braking</Button>
              <div className="w-px h-8 bg-border mx-2"></div>
              <Button 
                variant={tuningMode === 'track' ? 'default' : 'outline'} 
                onClick={() => applyTrackPreset('aggressive')}
                className="uppercase text-xs font-bold tracking-widest h-8 border-primary text-primary"
              >Aggressive</Button>
              <Button 
                variant={tuningMode === 'track' ? 'default' : 'outline'} 
                onClick={() => applyTrackPreset('balanced')}
                className="uppercase text-xs font-bold tracking-widest h-8 border-primary text-primary"
              >Track Balanced</Button>
              <Button 
                variant={tuningMode === 'track' ? 'default' : 'outline'} 
                onClick={() => applyTrackPreset('conservative')}
                className="uppercase text-xs font-bold tracking-widest h-8 border-primary text-primary"
              >Conservative</Button>
            </div>

            {/* Tuning Controls */}
            <Tabs defaultValue="suspension" className="mb-8">
              <TabsList className="bg-card border border-border w-full justify-start overflow-x-auto">
                <TabsTrigger value="suspension" className="uppercase text-xs font-bold tracking-widest">Suspension</TabsTrigger>
                <TabsTrigger value="aerodynamics" className="uppercase text-xs font-bold tracking-widest">Aerodynamics</TabsTrigger>
                <TabsTrigger value="drivetrain" className="uppercase text-xs font-bold tracking-widest">Drivetrain</TabsTrigger>
                <TabsTrigger value="braking" className="uppercase text-xs font-bold tracking-widest">Braking</TabsTrigger>
              </TabsList>

              {/* Suspension Tab */}
              <TabsContent value="suspension" className="space-y-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold mb-4 uppercase text-xs tracking-widest text-primary">Suspension Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Ride Height */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Ride Height Front (mm)</label>
                        <span className="mono-num text-primary">{tuningSetup.rideHeightFront} mm</span>
                      </div>
                      <Slider
                        value={[tuningSetup.rideHeightFront || 100]}
                        onValueChange={(val) => updateTuning('rideHeightFront', val[0])}
                        min={50}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Ride Height Rear (mm)</label>
                        <span className="mono-num text-primary">{tuningSetup.rideHeightRear} mm</span>
                      </div>
                      <Slider
                        value={[tuningSetup.rideHeightRear || 100]}
                        onValueChange={(val) => updateTuning('rideHeightRear', val[0])}
                        min={50}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Anti-Roll Bars */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Anti-Roll Bar Front</label>
                        <span className="mono-num text-primary">{tuningSetup.antiRollBarFront}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.antiRollBarFront || 5]}
                        onValueChange={(val) => updateTuning('antiRollBarFront', val[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Anti-Roll Bar Rear</label>
                        <span className="mono-num text-primary">{tuningSetup.antiRollBarRear}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.antiRollBarRear || 5]}
                        onValueChange={(val) => updateTuning('antiRollBarRear', val[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Damper Expansion */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Damper Expansion Front</label>
                        <span className="mono-num text-primary">{tuningSetup.damperExpansionFront}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.damperExpansionFront || 5]}
                        onValueChange={(val) => updateTuning('damperExpansionFront', val[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Damper Expansion Rear</label>
                        <span className="mono-num text-primary">{tuningSetup.damperExpansionRear}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.damperExpansionRear || 5]}
                        onValueChange={(val) => updateTuning('damperExpansionRear', val[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Damper Compression */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Damper Compression Front</label>
                        <span className="mono-num text-primary">{tuningSetup.damperCompressionFront}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.damperCompressionFront || 5]}
                        onValueChange={(val) => updateTuning('damperCompressionFront', val[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Damper Compression Rear</label>
                        <span className="mono-num text-primary">{tuningSetup.damperCompressionRear}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.damperCompressionRear || 5]}
                        onValueChange={(val) => updateTuning('damperCompressionRear', val[0])}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Aerodynamics Tab */}
              <TabsContent value="aerodynamics" className="space-y-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold mb-4 uppercase text-xs tracking-widest text-primary">Aerodynamics & Tires</h3>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Front Downforce (lbs)</label>
                          <span className="mono-num text-primary">{tuningSetup.downforceFront}</span>
                        </div>
                        <Slider
                          value={[tuningSetup.downforceFront || 100]}
                          onValueChange={(val) => updateTuning('downforceFront', val[0])}
                          min={0}
                          max={500}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Rear Downforce (lbs)</label>
                          <span className="mono-num text-primary">{tuningSetup.downforceRear}</span>
                        </div>
                        <Slider
                          value={[tuningSetup.downforceRear || 150]}
                          onValueChange={(val) => updateTuning('downforceRear', val[0])}
                          min={0}
                          max={500}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium uppercase text-xs tracking-widest text-muted-foreground">Tire Compound</label>
                        <Select 
                          value={Object.keys(TIRE_GRIP_COEFFICIENTS).find(key => TIRE_GRIP_COEFFICIENTS[key as keyof typeof TIRE_GRIP_COEFFICIENTS] === tuningSetup.tireGripCoefficient) || 'racing-hard'} 
                          onValueChange={(val) => updateTuning('tireGripCoefficient', TIRE_GRIP_COEFFICIENTS[val as keyof typeof TIRE_GRIP_COEFFICIENTS])}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground w-full md:w-64">
                            <SelectValue placeholder="Select tire..." />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
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
                        <p className="text-xs text-muted-foreground mt-1">Grip Coefficient: <span className="text-primary font-bold">{tuningSetup.tireGripCoefficient?.toFixed(2)}</span></p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Drivetrain Tab */}
              <TabsContent value="drivetrain" className="space-y-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold mb-4 uppercase text-xs tracking-widest text-primary">Drivetrain & Power</h3>
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Power Restriction (%)</label>
                          <span className="mono-num text-primary">{tuningSetup.powerRestriction}%</span>
                        </div>
                        <Slider
                          value={[tuningSetup.powerRestriction || 100]}
                          onValueChange={(val) => updateTuning('powerRestriction', val[0])}
                          min={50}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Ballast Weight (kg)</label>
                          <span className="mono-num text-primary">{tuningSetup.ballastKg} kg</span>
                        </div>
                        <Slider
                          value={[tuningSetup.ballastKg || 0]}
                          onValueChange={(val) => updateTuning('ballastKg', val[0])}
                          min={0}
                          max={200}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Initial Torque</label>
                          <span className="mono-num text-primary">{tuningSetup.differentialInitialTorque}</span>
                        </div>
                        <Slider
                          value={[tuningSetup.differentialInitialTorque || 10]}
                          onValueChange={(val) => updateTuning('differentialInitialTorque', val[0])}
                          min={5}
                          max={60}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Acceleration Sensitivity</label>
                          <span className="mono-num text-primary">{tuningSetup.differentialAcceleration}</span>
                        </div>
                        <Slider
                          value={[tuningSetup.differentialAcceleration || 60]}
                          onValueChange={(val) => updateTuning('differentialAcceleration', val[0])}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Braking Tab */}
              <TabsContent value="braking" className="space-y-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold mb-4 uppercase text-xs tracking-widest text-primary">Brake Setup</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Brake Balance</label>
                        <span className="mono-num text-primary">{tuningSetup.brakeBalance}%</span>
                      </div>
                      <Slider
                        value={[tuningSetup.brakeBalance || 55]}
                        onValueChange={(val) => updateTuning('brakeBalance', val[0])}
                        min={40}
                        max={70}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Brake Power Multiplier</label>
                        <span className="mono-num text-primary">{tuningSetup.brakePowerMultiplier?.toFixed(2)}x</span>
                      </div>
                      <Slider
                        value={[tuningSetup.brakePowerMultiplier || 1.35]}
                        onValueChange={(val) => updateTuning('brakePowerMultiplier', val[0])}
                        min={1.0}
                        max={1.5}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Performance Summary */}
            <Card className="bg-card border-border p-6 mb-8">
              <h3 className="font-semibold mb-4 uppercase text-xs tracking-widest text-primary">Performance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {performanceData.map((item, idx) => (
                  <div key={idx} className="p-4 bg-secondary/30 rounded border border-border">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter mb-1">{item.label}</p>
                    <p className="text-xl font-black mono-num text-primary leading-none">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card className="bg-card border-border p-12 text-center">
            <p className="text-muted-foreground uppercase tracking-widest text-sm">Select a vehicle to initialize tuning simulation</p>
          </Card>
        )}
      </main>
    </div>
  );
}
