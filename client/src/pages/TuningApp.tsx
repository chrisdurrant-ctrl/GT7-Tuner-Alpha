import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { GT7_CARS } from '@/lib/gt7_cars';
import {
  calculatePerformanceMetrics,
  type TuningSetup,
  type PerformanceMetrics,
} from '@/lib/gt7_physics';
import { GT7_TRACKS, getTrackRecommendation, type TrackProfile } from '@/lib/gt7_tracks';
import type { GT7Car } from '@/lib/gt7_cars';

/**
 * GT7 Tuning App — Physics-Based Setup Optimizer
 * Design: Dark Industrial / Motorsport HUD with real-time performance visualization
 * Features: Track-specific tuning profiles with automatic recommendations
 */
export default function TuningApp() {
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>(GT7_CARS[0]?.manufacturer || '');
  const [selectedModel, setSelectedModel] = useState<string>(GT7_CARS[0]?.model || '');
  const [selectedCar, setSelectedCar] = useState<GT7Car | null>(GT7_CARS[0] || null);
  const [selectedTrack, setSelectedTrack] = useState<TrackProfile | null>(GT7_TRACKS[0] || null);

  // Get unique manufacturers
  const manufacturers = useMemo(() => {
    const unique = Array.from(new Set(GT7_CARS.map(car => car.manufacturer))).sort();
    return unique;
  }, []);

  // Get models for selected manufacturer
  const models = useMemo(() => {
    if (!selectedManufacturer) return [];
    const filtered = GT7_CARS.filter(car => car.manufacturer === selectedManufacturer);
    const unique = Array.from(new Set(filtered.map(car => car.model))).sort();
    return unique;
  }, [selectedManufacturer]);

  // Update selected car when manufacturer or model changes
  useEffect(() => {
    if (selectedManufacturer && selectedModel) {
      const car = GT7_CARS.find(c => c.manufacturer === selectedManufacturer && c.model === selectedModel);
      if (car) setSelectedCar(car);
    }
  }, [selectedManufacturer, selectedModel]);
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
    tirePressureFront: 30,
    tirePressureRear: 30,
    tireGripCoefficient: 1.1,
  });

  const [tuningMode, setTuningMode] = useState<'acceleration' | 'cornering' | 'braking' | 'balanced' | 'track'>('balanced');
  const [trackPresetMode, setTrackPresetMode] = useState<'aggressive' | 'balanced' | 'conservative'>('balanced');
  
  // Custom BHP and weight for upgrades
  const [customBhp, setCustomBhp] = useState<number | null>(null);
  const [customWeight, setCustomWeight] = useState<number | null>(null);

  // Calculate performance metrics
  const metrics = useMemo(() => {
    if (!selectedCar) return null;
    
    // Use custom values if provided, otherwise use car defaults
    const bhp = customBhp !== null ? customBhp : selectedCar.power_bhp;
    const weight = customWeight !== null ? customWeight : selectedCar.weight_kg;
    
    if (!bhp || !weight) return null;
    return calculatePerformanceMetrics(bhp, weight, tuningSetup);
  }, [selectedCar, tuningSetup, customBhp, customWeight]);

  // Apply tuning presets
  const applyPreset = (mode: typeof tuningMode) => {
    setTuningMode(mode);
    const presets = {
      acceleration: {
        powerRestriction: 100,
        ballastKg: 0,
        downforceFront: 50,
        downforceRear: 75,
        antiRollBarFront: 3,
        antiRollBarRear: 3,
        brakeBalance: 50,
        differentialAcceleration: 80,
      },
      cornering: {
        powerRestriction: 90,
        ballastKg: 50,
        downforceFront: 200,
        downforceRear: 300,
        antiRollBarFront: 8,
        antiRollBarRear: 8,
        brakeBalance: 55,
        differentialAcceleration: 40,
      },
      braking: {
        powerRestriction: 80,
        ballastKg: 100,
        downforceFront: 150,
        downforceRear: 200,
        antiRollBarFront: 7,
        antiRollBarRear: 6,
        brakeBalance: 60,
        differentialBraking: 70,
      },
      balanced: {
        powerRestriction: 100,
        ballastKg: 20,
        downforceFront: 120,
        downforceRear: 150,
        antiRollBarFront: 5,
        antiRollBarRear: 5,
        brakeBalance: 55,
        differentialAcceleration: 60,
      },
      track: {},
    };

    setTuningSetup((prev) => ({
      ...prev,
      ...presets[mode],
    }));
  };

  // Apply track-specific preset
  const applyTrackPreset = (mode: 'aggressive' | 'balanced' | 'conservative') => {
    setTuningMode('track');
    setTrackPresetMode(mode);
    if (selectedTrack) {
      const trackPreset = selectedTrack.tuningPresets[mode];
      setTuningSetup((prev) => ({
        ...prev,
        ...trackPreset,
      }));
    }
  };

  const updateTuning = (key: keyof TuningSetup, value: any) => {
    setTuningSetup((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-500';
    if (rating >= 60) return 'text-yellow-500';
    if (rating >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 80) return 'bg-green-500/20';
    if (rating >= 60) return 'bg-yellow-500/20';
    if (rating >= 40) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const radarData = metrics
    ? [
        { name: 'Acceleration', value: metrics.accelerationRating },
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
      ]
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-4 mb-2">
            <a href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <span>←</span>
              <span className="text-sm font-medium">Back to Home</span>
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                GT7 TUNING SIMULATOR
              </h1>
              <p className="text-muted-foreground text-sm">Physics-based setup optimizer with track-specific profiles</p>
            </div>
            <div className="flex items-center gap-4 text-right">
              {selectedCar && (
                <div>
                  <p className="font-semibold">{selectedCar.manufacturer}</p>
                  <p className="text-sm text-muted-foreground">{selectedCar.model}</p>
                </div>
              )}
              {selectedTrack && (
                <div className="border-l border-border pl-4">
                  <p className="font-semibold text-primary">{selectedTrack.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTrack.location}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        {/* Car & Track Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Select Make</h2>
            <Select value={selectedManufacturer} onValueChange={(mfg) => {
              setSelectedManufacturer(mfg);
              // Reset model when manufacturer changes
              const firstModel = GT7_CARS.find(c => c.manufacturer === mfg)?.model;
              if (firstModel) setSelectedModel(firstModel);
            }}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Choose a make..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-96">
                {manufacturers.map((mfg) => (
                  <SelectItem key={mfg} value={mfg}>
                    {mfg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Select Model</h2>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Choose a model..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-96">
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Select Track</h2>
            <Select
              value={selectedTrack?.id || ''}
              onValueChange={(id) => {
                const track = GT7_TRACKS.find((t) => t.id === id);
                if (track) setSelectedTrack(track);
              }}
            >
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Choose a track..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-96">
                {GT7_TRACKS.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.name} ({track.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>

        {/* Custom BHP and Weight for Upgrades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Custom BHP</h2>
            <p className="text-sm text-muted-foreground mb-3">Stock: {selectedCar?.power_bhp || 0} BHP</p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter custom BHP..."
                value={customBhp !== null ? customBhp : ''}
                onChange={(e) => setCustomBhp(e.target.value ? parseFloat(e.target.value) : null)}
                className="bg-input border-border text-foreground"
              />
              {customBhp !== null && (
                <Button
                  variant="outline"
                  onClick={() => setCustomBhp(null)}
                  className="px-3"
                >
                  Reset
                </Button>
              )}
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Custom Weight</h2>
            <p className="text-sm text-muted-foreground mb-3">Stock: {selectedCar?.weight_kg || 0} kg</p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter custom weight (kg)..."
                value={customWeight !== null ? customWeight : ''}
                onChange={(e) => setCustomWeight(e.target.value ? parseFloat(e.target.value) : null)}
                className="bg-input border-border text-foreground"
              />
              {customWeight !== null && (
                <Button
                  variant="outline"
                  onClick={() => setCustomWeight(null)}
                  className="px-3"
                >
                  Reset
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Track Information */}
        {selectedTrack && (
          <Card className="bg-primary/10 border-primary/30 mb-8 p-6">
            <div className="flex items-start gap-4">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-primary mb-2">{selectedTrack.name}</p>
                <p className="text-sm text-foreground mb-3">{getTrackRecommendation(selectedTrack)}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-secondary/50">
                    {selectedTrack.type.charAt(0).toUpperCase() + selectedTrack.type.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/50">
                    {selectedTrack.difficulty.charAt(0).toUpperCase() + selectedTrack.difficulty.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/50">
                    {selectedTrack.length} km
                  </Badge>
                  <Badge variant="outline" className="bg-secondary/50">
                    {selectedTrack.corners} corners
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {selectedCar && metrics ? (
          <>
            {/* Preset Buttons */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">TUNING PRESETS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {(['acceleration', 'cornering', 'braking', 'balanced'] as const).map((mode) => (
                  <Button
                    key={mode}
                    onClick={() => applyPreset(mode)}
                    variant={tuningMode === mode && trackPresetMode === 'balanced' ? 'default' : 'outline'}
                    className={`capitalize ${tuningMode === mode && trackPresetMode === 'balanced' ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-accent'}`}
                  >
                    {mode}
                  </Button>
                ))}
              </div>

              {/* Track-Specific Presets */}
              {selectedTrack && (
                <>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">TRACK-SPECIFIC PRESETS</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(['aggressive', 'balanced', 'conservative'] as const).map((mode) => (
                      <Button
                        key={`track-${mode}`}
                        onClick={() => applyTrackPreset(mode)}
                        variant={tuningMode === 'track' && trackPresetMode === mode ? 'default' : 'outline'}
                        className={`capitalize ${tuningMode === 'track' && trackPresetMode === mode ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-accent'}`}
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Performance Radar */}
              <Card className="bg-card border-border p-6 lg:col-span-1">
                <h3 className="font-semibold mb-4">Performance Profile</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(0.22 0.008 260)" />
                    <PolarAngleAxis dataKey="name" stroke="oklch(0.75 0.005 240)" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="oklch(0.22 0.008 260)" />
                    <Radar name="Rating" dataKey="value" stroke="oklch(0.52 0.22 25)" fill="oklch(0.52 0.22 25)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* Key Metrics */}
              <Card className="bg-card border-border p-6 lg:col-span-2">
                <h3 className="font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded border border-border ${getRatingBgColor(metrics.accelerationRating)}`}>
                    <p className="text-xs text-muted-foreground">Acceleration</p>
                    <p className={`text-2xl font-bold mono-num ${getRatingColor(metrics.accelerationRating)}`}>
                      {metrics.accelerationRating.toFixed(0)}
                    </p>
                  </div>
                  <div className={`p-3 rounded border border-border ${getRatingBgColor(metrics.brakingRating)}`}>
                    <p className="text-xs text-muted-foreground">Braking</p>
                    <p className={`text-2xl font-bold mono-num ${getRatingColor(metrics.brakingRating)}`}>
                      {metrics.brakingRating.toFixed(0)}
                    </p>
                  </div>
                  <div className={`p-3 rounded border border-border ${getRatingBgColor(metrics.corneringRating)}`}>
                    <p className="text-xs text-muted-foreground">Cornering</p>
                    <p className={`text-2xl font-bold mono-num ${getRatingColor(metrics.corneringRating)}`}>
                      {metrics.corneringRating.toFixed(0)}
                    </p>
                  </div>
                  <div className={`p-3 rounded border border-border ${getRatingBgColor(metrics.topSpeedRating)}`}>
                    <p className="text-xs text-muted-foreground">Top Speed</p>
                    <p className={`text-2xl font-bold mono-num ${getRatingColor(metrics.topSpeedRating)}`}>
                      {metrics.topSpeedRating.toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Overall Rating */}
                <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Overall Rating</p>
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold text-primary mono-num">{metrics.overallRating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Balance: {metrics.balanceScore.toFixed(0)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tuning Controls */}
            <Tabs defaultValue="suspension" className="mb-8">
              <TabsList className="grid w-full grid-cols-4 bg-card border-border">
                <TabsTrigger value="suspension">Suspension</TabsTrigger>
                <TabsTrigger value="aerodynamics">Aero</TabsTrigger>
                <TabsTrigger value="drivetrain">Drivetrain</TabsTrigger>
                <TabsTrigger value="braking">Braking</TabsTrigger>
              </TabsList>

              {/* Suspension Tab */}
              <TabsContent value="suspension" className="space-y-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold mb-4">Suspension Setup</h3>
                  <div className="space-y-6">
                    {/* Anti-Roll Bars */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Anti-Roll Bar Front</label>
                        <span className="mono-num text-primary">{tuningSetup.antiRollBarFront?.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.antiRollBarFront || 5]}
                        onValueChange={(val) => updateTuning('antiRollBarFront', val[0])}
                        min={1}
                        max={10}
                        step={0.5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Stiffer = less roll, more understeer</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Anti-Roll Bar Rear</label>
                        <span className="mono-num text-primary">{tuningSetup.antiRollBarRear?.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.antiRollBarRear || 5]}
                        onValueChange={(val) => updateTuning('antiRollBarRear', val[0])}
                        min={1}
                        max={10}
                        step={0.5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Stiffer = less roll, more oversteer</p>
                    </div>

                    {/* Camber Angles */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Camber Front (°)</label>
                        <span className="mono-num text-primary">{tuningSetup.camberFront?.toFixed(1)}°</span>
                      </div>
                      <Slider
                        value={[tuningSetup.camberFront || 2.0]}
                        onValueChange={(val) => updateTuning('camberFront', val[0])}
                        min={0}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Negative camber increases cornering grip</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Camber Rear (°)</label>
                        <span className="mono-num text-primary">{tuningSetup.camberRear?.toFixed(1)}°</span>
                      </div>
                      <Slider
                        value={[tuningSetup.camberRear || 1.5]}
                        onValueChange={(val) => updateTuning('camberRear', val[0])}
                        min={0}
                        max={5}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Natural Frequency */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Natural Frequency Front (Hz)</label>
                        <span className="mono-num text-primary">{tuningSetup.naturalFrequencyFront?.toFixed(2)} Hz</span>
                      </div>
                      <Slider
                        value={[tuningSetup.naturalFrequencyFront || 2.0]}
                        onValueChange={(val) => updateTuning('naturalFrequencyFront', val[0])}
                        min={1.0}
                        max={5.0}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Higher = stiffer ride, lower = softer ride</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Natural Frequency Rear (Hz)</label>
                        <span className="mono-num text-primary">{tuningSetup.naturalFrequencyRear?.toFixed(2)} Hz</span>
                      </div>
                      <Slider
                        value={[tuningSetup.naturalFrequencyRear || 2.0]}
                        onValueChange={(val) => updateTuning('naturalFrequencyRear', val[0])}
                        min={1.0}
                        max={5.0}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Aerodynamics Tab */}
              <TabsContent value="aerodynamics" className="space-y-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold mb-4">Aerodynamics</h3>
                  <div className="space-y-6">
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
                      <p className="text-xs text-muted-foreground mt-1">More downforce = better grip, less top speed</p>
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

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Tire Grip Coefficient</label>
                        <span className="mono-num text-primary">{tuningSetup.tireGripCoefficient?.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.tireGripCoefficient || 1.1]}
                        onValueChange={(val) => updateTuning('tireGripCoefficient', val[0])}
                        min={0.8}
                        max={1.3}
                        step={0.05}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Comfort: 0.85, Sports: 0.95, Racing: 1.1, Slick: 1.2</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Drivetrain Tab */}
              <TabsContent value="drivetrain" className="space-y-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold mb-4">Differential & Power</h3>
                  <div className="space-y-6">
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
                      <p className="text-xs text-muted-foreground mt-1">Reduce power to meet PP restrictions</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Ballast Weight (kg)</label>
                        <span className="mono-num text-primary">{tuningSetup.ballastKg}</span>
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
                        <label className="text-sm font-medium">Differential Acceleration Sensitivity</label>
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
                      <p className="text-xs text-muted-foreground mt-1">Higher = more traction during acceleration</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Differential Braking Sensitivity</label>
                        <span className="mono-num text-primary">{tuningSetup.differentialBraking}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.differentialBraking || 50]}
                        onValueChange={(val) => updateTuning('differentialBraking', val[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Higher = more lock during braking</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Braking Tab */}
              <TabsContent value="braking" className="space-y-6">
                <Card className="bg-card border-border p-6">
                  <h3 className="font-semibold mb-4">Brake Setup</h3>
                  <div className="space-y-6">
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
                      <p className="text-xs text-muted-foreground mt-1">Normal: 1.0, Sports: 1.15, Racing: 1.35, Carbon: 1.4</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Brake Balance (Front/Rear)</label>
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
                      <p className="text-xs text-muted-foreground mt-1">50% = balanced, higher = more front bias</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Tire Pressure Front (psi)</label>
                        <span className="mono-num text-primary">{tuningSetup.tirePressureFront}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.tirePressureFront || 30]}
                        onValueChange={(val) => updateTuning('tirePressureFront', val[0])}
                        min={25}
                        max={35}
                        step={0.5}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium">Tire Pressure Rear (psi)</label>
                        <span className="mono-num text-primary">{tuningSetup.tirePressureRear}</span>
                      </div>
                      <Slider
                        value={[tuningSetup.tirePressureRear || 30]}
                        onValueChange={(val) => updateTuning('tirePressureRear', val[0])}
                        min={25}
                        max={35}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Performance Comparison Chart */}
            <Card className="bg-card border-border p-6">
              <h3 className="font-semibold mb-4">Performance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performanceData.map((item, idx) => (
                  <div key={idx} className="p-3 bg-secondary/50 rounded border border-border">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold mono-num text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card className="bg-card border-border p-8 text-center">
            <p className="text-muted-foreground">Select a car to begin tuning</p>
          </Card>
        )}
      </main>
    </div>
  );
}
