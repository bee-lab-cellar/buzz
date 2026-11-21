export type AtlasTileCode =
  | 0 // Grass
  | 1 // DirtRoad (+20% Move Speed)
  | 2 // TallStealthGrass (2.0x Ambush Crit)
  | 3 // RiverWater
  | 4 // ShallowFord (Wet status)
  | 5 // WoodBridge
  | 6 // StoneBridge
  | 7 // CliffWall
  | 8 // StairRamp
  | 9 // CobblePatio
  | 10 // Lava
  | 11 // IceSheet
  | 12 // CrackingIce
  | 13 // AcidBog
  | 14 // ConveyorBelt
  | 15; // StarForgeTile

export interface RiverWaterfallSpec {
  x: number;
  y: number;
  dropHeightPx: number;
  sprayRadius: number;
}

export interface RiverPathSpec {
  x0: number;
  y0: number;
  cx1: number;
  cy1: number;
  cx2: number;
  cy2: number;
  x1: number;
  y1: number;
  width: number;
  flowVx: number;
  flowVy: number;
  liquid: 'water' | 'acid' | 'lava' | 'void_stream';
  waterfalls: RiverWaterfallSpec[];
}

export interface TrapInstance {
  id: string;
  x: number;
  y: number;
  type:
    | 'swinging_log'
    | 'rolling_boulder'
    | 'bounce_mushroom'
    | 'cracking_ice'
    | 'explosive_minecart'
    | 'laser_prism'
    | 'quicksand_whirlpool'
    | 'dart_totem'
    | 'rune_drawbridge'
    | 'trench_landmine'
    | 'blizzard_brazier'
    | 'factory_crusher'
    | 'battering_ram_payload'
    | 'wildfire_barrel'
    | 'rising_acid_tide'
    | 'rotating_firebar'
    | 'updraft_geyser'
    | 'oxygen_vent'
    | 'steam_mecha_bay'
    | 'black_hole_well'
    | 'sawmill_buzzsaw'
    | 'bear_trap'
    | 'chain_lightning_pylon';
  triggerInterval: number;
  direction: 'N' | 'S' | 'E' | 'W' | 'RADIAL';
  damage: number;
  patrolPath: Array<{ x: number; y: number }>;
}

export interface LandmarkSpec {
  id: string;
  name: string;
  x: number;
  y: number;
  loreSummary: string;
  auraColor: string;
}

export interface DialogueLineSpec {
  speaker: 'Nyx' | 'King Leo' | 'Wolf-King Fenrir' | 'The Great Duck' | 'Advisor Whiskers' | 'Regional Boss';
  portrait: string;
  text: string;
}

export interface AtlasActEntry {
  actId: number;
  arc: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  subRegion: string;
  tileGrid: number[][]; // Explicit 14 rows x 24 columns
  elevationGrid: number[][]; // Explicit 14 rows x 24 columns (tiers 0, 1, 2)
  riverPath: RiverPathSpec | null;
  traps: TrapInstance[];
  landmark: LandmarkSpec;
  cutsceneScript: DialogueLineSpec[];
}
