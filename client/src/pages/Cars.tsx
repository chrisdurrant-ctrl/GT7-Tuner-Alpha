import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpDown,
  Search,
  X,
} from 'lucide-react';
import { GT7_CARS, getUniqueManufacturers, getUniqueCategories, getUniqueDrivetrains, getStatistics } from '@/lib/gt7_cars';
import type { GT7Car } from '@/lib/gt7_cars';

type SortField = 'pp' | 'price' | 'power_bhp' | 'weight_kg' | 'year' | 'manufacturer' | 'model';
type SortOrder = 'asc' | 'desc';

/**
 * Cars Database Page
 * Design: Dark Industrial / Motorsport HUD
 * - Full-width sortable table with all 568 GT7 cars
 * - Advanced filtering by manufacturer, category, drivetrain
 * - Real-time search across model names and engines
 */
export default function Cars() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDrivetrain, setSelectedDrivetrain] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('manufacturer');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const stats = useMemo(() => getStatistics(), []);
  const manufacturers = useMemo(() => getUniqueManufacturers(), []);
  const categories = useMemo(() => getUniqueCategories(), []);
  const drivetrains = useMemo(() => getUniqueDrivetrains(), []);

  // Filter and sort cars
  const filteredCars = useMemo(() => {
    let filtered = GT7_CARS;

    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        car =>
          car.manufacturer.toLowerCase().includes(q) ||
          car.model.toLowerCase().includes(q) ||
          car.engine.toLowerCase().includes(q)
      );
    }

    // Manufacturer filter
    if (selectedManufacturer) {
      filtered = filtered.filter(car => car.manufacturer === selectedManufacturer);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(car => car.category === selectedCategory);
    }

    // Drivetrain filter
    if (selectedDrivetrain) {
      filtered = filtered.filter(car => car.drivetrain === selectedDrivetrain);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (aVal === null || aVal === undefined) aVal = sortField === 'pp' ? -Infinity : 0;
      if (bVal === null || bVal === undefined) bVal = sortField === 'pp' ? -Infinity : 0;

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchQuery, selectedManufacturer, selectedCategory, selectedDrivetrain, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedManufacturer('');
    setSelectedCategory('');
    setSelectedDrivetrain('');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Road Car': 'bg-blue-500/20 text-blue-300',
      'Sports Car': 'bg-purple-500/20 text-purple-300',
      'Race Car': 'bg-red-500/20 text-red-300',
      'Rally Car': 'bg-yellow-500/20 text-yellow-300',
      'Truck': 'bg-green-500/20 text-green-300',
      'Kart': 'bg-pink-500/20 text-pink-300',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300';
  };

  const getPPColor = (pp: number) => {
    if (pp >= 700) return 'text-red-500';
    if (pp >= 500) return 'text-orange-500';
    if (pp >= 300) return 'text-yellow-500';
    return 'text-blue-500';
  };

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
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            COMPLETE CAR DATABASE
          </h1>
          <p className="text-muted-foreground text-sm">Browse all {GT7_CARS.length} vehicles</p>
        </div>
      </div>

      <main className="container py-8">
        {/* Stats Bar */}
        <Card className="bg-card border-border mb-8 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Total Cars</p>
              <p className="text-2xl font-bold mono-num text-primary">{stats.totalCars}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Manufacturers</p>
              <p className="text-2xl font-bold mono-num text-primary">{stats.uniqueManufacturers}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">PP Range</p>
              <p className="text-2xl font-bold mono-num text-primary">{stats.ppRange.min} – {stats.ppRange.max}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Year Range</p>
              <p className="text-2xl font-bold mono-num text-primary">{stats.yearRange.min} – {stats.yearRange.max}</p>
            </div>
          </div>
        </Card>

        {/* Search and Filters */}
        <Card className="bg-card border-border mb-8 p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by manufacturer, model, or engine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="All Manufacturers" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-96">
                  {manufacturers.map((mfg) => (
                    <SelectItem key={mfg} value={mfg}>
                      {mfg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-96">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDrivetrain} onValueChange={setSelectedDrivetrain}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="All Drivetrains" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border max-h-96">
                  {drivetrains.map((dt) => (
                    <SelectItem key={dt} value={dt}>
                      {dt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedManufacturer || selectedCategory || selectedDrivetrain) && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredCars.length} of {GT7_CARS.length} cars
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('manufacturer')}>
                  <div className="flex items-center gap-2">
                    Manufacturer
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('model')}>
                  <div className="flex items-center gap-2">
                    Model
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('pp')}>
                  <div className="flex items-center justify-center gap-2">
                    PP
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Drivetrain</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('power_bhp')}>
                  <div className="flex items-center justify-center gap-2">
                    Power
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center font-semibold text-foreground cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('weight_kg')}>
                  <div className="flex items-center justify-center gap-2">
                    Weight
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Aspiration</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Engine</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground cursor-pointer hover:bg-secondary/50" onClick={() => handleSort('year')}>
                  <div className="flex items-center justify-center gap-2">
                    Year
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right font-semibold text-foreground">Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{car.manufacturer}</td>
                  <td className="px-4 py-3">{car.model}</td>
                  <td className={`px-4 py-3 text-center font-bold mono-num ${getPPColor(car.pp)}`}>
                    {car.pp.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${getCategoryColor(car.category)} border-0`}>
                      {car.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{car.drivetrain}</td>
                  <td className="px-4 py-3 text-center mono-num">
                    {car.power_bhp ? `${car.power_bhp}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center mono-num">
                    {car.weight_kg ? `${car.weight_kg}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">{car.aspiration || '—'}</td>
                  <td className="px-4 py-3 text-sm">{car.engine || '—'}</td>
                  <td className="px-4 py-3 text-center mono-num">{car.year || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {car.price ? (
                      <span className="text-red-500">{car.price.toLocaleString()}</span>
                    ) : (
                      <span className="text-red-500">FREE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCars.length === 0 && (
          <Card className="bg-card border-border p-8 text-center">
            <p className="text-muted-foreground">No cars found matching your filters.</p>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-muted-foreground text-sm">Updated 26/04/2026</p>
            <a href="/tuning" className="mt-4 md:mt-0 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium">
              → Go to Tuning Simulator
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
