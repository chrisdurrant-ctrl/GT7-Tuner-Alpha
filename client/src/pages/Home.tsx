import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Database, Gauge } from 'lucide-react';
import { GT7_CARS, getStatistics } from '@/lib/gt7_cars';

/**
 * Home Page — GT7 Cars & Tuning Hub
 * Design: Dark Industrial / Motorsport HUD
 * - Cinematic hero banner with night racing atmosphere
 * - Electric red accents (GT7 signature color)
 * - Navigation buttons to Cars Database and Tuning Simulator
 * - Quick stats overview
 */
export default function Home() {
  const stats = getStatistics();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Banner */}
      <div className="relative h-screen max-h-96 md:max-h-[500px] overflow-hidden flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&q=80)',
            backgroundPosition: 'center 30%',
          }}
        />

        {/* Animated red accent lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            GRAN TURISMO 7
          </h1>
          <p className="text-lg text-gray-300">Complete Car Database By UXM4369</p>
        </div>

        {/* Red accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
      </div>

      <main className="container py-12 flex-1">
        {/* Stats Bar */}
        <Card className="bg-card border-border mb-12 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Total Cars</p>
              <p className="text-3xl font-bold mono-num text-primary">{stats.totalCars}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Manufacturers</p>
              <p className="text-3xl font-bold mono-num text-primary">{stats.uniqueManufacturers}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">PP Range</p>
              <p className="text-3xl font-bold mono-num text-primary">{stats.ppRange.min} – {stats.ppRange.max}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Year Range</p>
              <p className="text-3xl font-bold mono-num text-primary">{stats.yearRange.min} – {stats.yearRange.max}</p>
            </div>
          </div>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Cars Database Card */}
          <Card className="bg-card border-border p-8 hover:border-primary/50 transition-colors group">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Complete Car Database</h2>
                <p className="text-muted-foreground">Browse all {stats.totalCars} vehicles with detailed specs, filtering, and sorting</p>
              </div>
              <Database className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Search by manufacturer, model, or engine</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Filter by category, drivetrain, and more</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Sort by PP, price, power, weight, year</span>
              </div>
            </div>

            <a href="/cars" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors group">
              View All Cars
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </Card>

          {/* Tuning Simulator Card */}
          <Card className="bg-card border-border p-8 hover:border-primary/50 transition-colors group">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Tuning Simulator</h2>
                <p className="text-muted-foreground">Physics-based setup optimizer with 12 track-specific profiles</p>
              </div>
              <Gauge className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Real-time performance calculations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Track-specific tuning presets</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-primary">✓</span>
                <span>Interactive suspension & aerodynamics controls</span>
              </div>
            </div>

            <a href="/tuning" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 transition-colors group">
              Open Tuning Simulator
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="bg-secondary/30 border-border p-8">
          <h3 className="text-xl font-bold mb-6">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-primary">Complete Database</h4>
              <p className="text-sm text-muted-foreground">All 568 GT7 cars with comprehensive specifications including power, weight, aspirations, and pricing</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Physics Engine</h4>
              <p className="text-sm text-muted-foreground">Realistic GT7 physics calculations for acceleration, braking, cornering, and top speed</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-primary">Track Profiles</h4>
              <p className="text-sm text-muted-foreground">12 real GT7 tracks with optimized tuning presets for street, oval, technical, and rally circuits</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container">
          <p className="text-muted-foreground text-sm">Updated 26/04/2026</p>
        </div>
      </footer>
    </div>
  );
}
