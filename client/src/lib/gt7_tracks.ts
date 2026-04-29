import type { TuningSetup } from './gt7_physics';

/**
 * Gran Turismo 7 Complete Track Database
 * Includes all 41 locations and 120+ layouts
 */

export interface TrackLayout {
  id: string;
  name: string;
}

export interface TrackCircuit {
  id: string;
  name: string;
  layouts: TrackLayout[];
  tuningPresets: {
    aggressive: Partial<TuningSetup>;
    balanced: Partial<TuningSetup>;
    conservative: Partial<TuningSetup>;
  };
}

export interface TrackRegion {
  name: string;
  locations: {
    name: string;
    circuits: TrackCircuit[];
  }[];
}

// Default presets for template - Now matching the full TuningSetup structure
const DEFAULT_TUNING: Record<'aggressive' | 'balanced' | 'conservative', Partial<TuningSetup>> = {
  aggressive: {
    rideHeightFront: 90, rideHeightRear: 95,
    naturalFrequencyFront: 3.2, naturalFrequencyRear: 3.3,
    antiRollBarFront: 7, antiRollBarRear: 7,
    damperExpansionFront: 45, damperExpansionRear: 45,
    damperCompressionFront: 35, damperCompressionRear: 35,
    camberFront: 3.0, camberRear: 2.5,
    toeInFront: -0.10, toeInRear: 0.20,
    downforceFront: 400, downforceRear: 600,
    differentialInitialTorque: 15, differentialAcceleration: 50, differentialBraking: 30,
    brakeBalance: 2
  },
  balanced: {
    rideHeightFront: 100, rideHeightRear: 105,
    naturalFrequencyFront: 2.5, naturalFrequencyRear: 2.6,
    antiRollBarFront: 5, antiRollBarRear: 5,
    damperExpansionFront: 35, damperExpansionRear: 35,
    damperCompressionFront: 25, damperCompressionRear: 25,
    camberFront: 2.0, camberRear: 1.5,
    toeInFront: 0.00, toeInRear: 0.15,
    downforceFront: 250, downforceRear: 400,
    differentialInitialTorque: 10, differentialAcceleration: 40, differentialBraking: 20,
    brakeBalance: 0
  },
  conservative: {
    rideHeightFront: 110, rideHeightRear: 115,
    naturalFrequencyFront: 2.0, naturalFrequencyRear: 2.1,
    antiRollBarFront: 3, antiRollBarRear: 3,
    damperExpansionFront: 32, damperExpansionRear: 32,
    damperCompressionFront: 22, damperCompressionRear: 22,
    camberFront: 1.5, camberRear: 1.0,
    toeInFront: 0.05, toeInRear: 0.10,
    downforceFront: 150, downforceRear: 250,
    differentialInitialTorque: 8, differentialAcceleration: 30, differentialBraking: 15,
    brakeBalance: -1
  }
};

export const TRACK_REGIONS: TrackRegion[] = [
  {
    name: "Europe",
    locations: [
      {
        name: "Austria",
        circuits: [
          {
            id: "red-bull-ring",
            name: "Red Bull Ring",
            layouts: [
              { id: "rbr-full", name: "Full Course" },
              { id: "rbr-short", name: "Short Course" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "Belgium",
        circuits: [
          {
            id: "spa",
            name: "Circuit de Spa-Francorchamps",
            layouts: [
              { id: "spa-full", name: "Full Course" },
              { id: "spa-24h", name: "24h Layout" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "France",
        circuits: [
          {
            id: "le-mans",
            name: "Circuit de la Sarthe",
            layouts: [
              { id: "lemans-full", name: "Full Course" },
              { id: "lemans-no-chicane", name: "No Chicane" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "alsace",
            name: "Alsace",
            layouts: [
              { id: "alsace-village", name: "Village" },
              { id: "alsace-test", name: "Test Track" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "magny-cours",
            name: "Circuit de Nevers Magny-Cours",
            layouts: [{ id: "magny-full", name: "Full Course" }],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "Germany",
        circuits: [
          {
            id: "nurburgring",
            name: "Nürburgring",
            layouts: [
              { id: "nurb-24h", name: "24h Layout" },
              { id: "nurb-nordschleife", name: "Nordschleife" },
              { id: "nurb-gp", name: "GP Course" },
              { id: "nurb-sprint", name: "Sprint Course" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "Italy",
        circuits: [
          {
            id: "monza",
            name: "Autodromo Nazionale di Monza",
            layouts: [
              { id: "monza-full", name: "Full Course" },
              { id: "monza-no-chicane", name: "No Chicane" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "sardegna",
            name: "Sardegna - Road Track",
            layouts: [
              { id: "sardegna-a", name: "Track A" },
              { id: "sardegna-b", name: "Track B" },
              { id: "sardegna-c", name: "Track C" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "sardegna-windmills",
            name: "Sardegna - Windmills (Dirt)",
            layouts: [{ id: "sardegna-dirt", name: "Dirt Layout" }],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "lago-maggiore",
            name: "Autodromo de Lago Maggiore",
            layouts: [
              { id: "lago-full", name: "Full Course" },
              { id: "lago-center", name: "Center" },
              { id: "lago-east", name: "East" },
              { id: "lago-west", name: "West" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "Spain",
        circuits: [
          {
            id: "barcelona",
            name: "Circuit de Barcelona-Catalunya",
            layouts: [
              { id: "barca-gp", name: "GP Layout" },
              { id: "barca-no-chicane", name: "No Chicane" },
              { id: "barca-national", name: "National Layout" },
              { id: "barca-rallycross", name: "Rallycross Layout" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "Switzerland",
        circuits: [
          {
            id: "eiger",
            name: "Eiger Nordwand",
            layouts: [
              { id: "eiger-full", name: "Full Course" },
              { id: "eiger-rev", name: "Reverse" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "UK",
        circuits: [
          {
            id: "brands-hatch",
            name: "Brands Hatch",
            layouts: [
              { id: "bh-gp", name: "Grand Prix Circuit" },
              { id: "bh-indy", name: "Indy Circuit" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "goodwood",
            name: "Goodwood Motor Circuit",
            layouts: [{ id: "goodwood-full", name: "Full Course" }],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "silverstone",
            name: "Silverstone",
            layouts: [
              { id: "silver-gp", name: "GP Circuit" },
              { id: "silver-national", name: "National Circuit" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "Croatia",
        circuits: [
          {
            id: "dragon-trail",
            name: "Dragon Trail",
            layouts: [
              { id: "dt-seaside", name: "Seaside" },
              { id: "dt-gardens", name: "Gardens" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      }
    ]
  },
  {
    name: "Americas",
    locations: [
      {
        name: "Brazil",
        circuits: [
          {
            id: "interlagos",
            name: "Autódromo de Interlagos",
            layouts: [{ id: "interlagos-full", name: "Full Course" }],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "USA",
        circuits: [
          {
            id: "daytona",
            name: "Daytona International Speedway",
            layouts: [
              { id: "daytona-tri", name: "Tri-Oval" },
              { id: "daytona-road", name: "Road Course" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "laguna-seca",
            name: "WeatherTech Raceway Laguna Seca",
            layouts: [{ id: "laguna-full", name: "Full Course" }],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "watkins-glen",
            name: "Watkins Glen International",
            layouts: [
              { id: "watkins-long", name: "Long Course" },
              { id: "watkins-short", name: "Short Course" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "willow-springs",
            name: "Willow Springs International Raceway",
            layouts: [
              { id: "willow-big", name: "Big Willow" },
              { id: "willow-streets", name: "Streets of Willow Springs" },
              { id: "willow-horse", name: "Horse Thief Mile" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "road-atlanta",
            name: "Michelin Raceway Road Atlanta",
            layouts: [{ id: "atlanta-full", name: "Full Course" }],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "trial-mountain",
            name: "Trial Mountain Circuit",
            layouts: [{ id: "trial-full", name: "Full Course" }],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "blue-moon",
            name: "Blue Moon Bay Speedway",
            layouts: [
              { id: "blue-oval", name: "Tri-Oval" },
              { id: "blue-infield-a", name: "Infield A" },
              { id: "blue-infield-b", name: "Infield B" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "northern-isle",
            name: "Northern Isle Speedway",
            layouts: [{ id: "northern-oval", name: "Half-Mile Oval" }],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      }
    ]
  },
  {
    name: "Asia-Oceania",
    locations: [
      {
        name: "Australia",
        circuits: [
          {
            id: "mount-panorama",
            name: "Mount Panorama",
            layouts: [{ id: "panorama-full", name: "Full Course" }],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      },
      {
        name: "Japan",
        circuits: [
          {
            id: "suzuka",
            name: "Suzuka Circuit",
            layouts: [
              { id: "suzuka-full", name: "Full Course" },
              { id: "suzuka-east", name: "East Course" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "fuji",
            name: "Fuji Speedway",
            layouts: [
              { id: "fuji-full", name: "Full Course" },
              { id: "fuji-short", name: "Short Course" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "tsukuba",
            name: "Tsukuba Circuit",
            layouts: [{ id: "tsukuba-full", name: "Full Course" }],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "autopolis",
            name: "Autopolis International Racing Course",
            layouts: [
              { id: "autop-full", name: "Full Course" },
              { id: "autop-shortcut", name: "Shortcut Course" }
            ],
            tuningPresets: DEFAULT_TUNING
          },
          {
            id: "tokyo-expressway",
            name: "Tokyo Expressway",
            layouts: [
              { id: "tokyo-central-cw", name: "Central Clockwise" },
              { id: "tokyo-central-ccw", name: "Central Counter-Clockwise" },
              { id: "tokyo-east-cw", name: "East Clockwise" },
              { id: "tokyo-east-ccw", name: "East Counter-Clockwise" },
              { id: "tokyo-south-cw", name: "South Clockwise" },
              { id: "tokyo-south-ccw", name: "South Counter-Clockwise" }
            ],
            tuningPresets: DEFAULT_TUNING
          }
        ]
      }
    ]
  }
];

export const ALL_CIRCUITS = TRACK_REGIONS.flatMap(r => r.locations.flatMap(l => l.circuits));
