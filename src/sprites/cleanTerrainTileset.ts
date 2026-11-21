/**
 * Layer 3 — Clean 16-Bit Auto-Tiled Terrain Tileset
 *
 * STRICT CLEAN ART RULES:
 * - NO neon-green vertical striped circles
 * - NO checkerboard tree spam on every ground tile
 * - NO raw unrendered tile gaps or broken water chunks
 * - Crisp 16x16 pre-baked offscreen tiles for all 6 Arc biomes, 3-tier cliffs,
 *   wooden/stone railed bridges, swaying tall stealth grass, and shallow water splashes.
 */

import type { ArcNumber, TileId } from '../types/world';
import type { AtlasTileCode } from '../atlas/atlasTypes';
import {
  TERRAIN_TILESET_16X16,
  WATERFALL_CASCADE_FRAMES,
  type TerrainTileMatrix,
} from './terrainAndFoliageTileset';
import { renderPixelMatrixToCanvas } from './spriteMatrixTypes';

export interface BiomeSurfacePalette {
  readonly arc: ArcNumber;
  readonly grassPrimary: string;
  readonly grassHighlight: string;
  readonly grassShadow: string;
  readonly roadPrimary: string;
  readonly roadEdge: string;
  readonly cliffFace: string;
  readonly cliffTop: string;
  readonly waterDeep: string;
  readonly waterFoam: string;
}

export const CLEAN_BIOME_PALETTES: Readonly<Record<ArcNumber, BiomeSurfacePalette>> = {
  1: {
    arc: 1,
    grassPrimary: '#3f7d47',
    grassHighlight: '#4e9657',
    grassShadow: '#32663a',
    roadPrimary: '#b89462',
    roadEdge: '#8d6c43',
    cliffFace: '#5b534b',
    cliffTop: '#7a7066',
    waterDeep: '#2563eb',
    waterFoam: '#bae6fd',
  },
  2: {
    arc: 2,
    grassPrimary: '#6d7552',
    grassHighlight: '#838c64',
    grassShadow: '#555c3f',
    roadPrimary: '#8c7a6b',
    roadEdge: '#615347',
    cliffFace: '#4b4649',
    cliffTop: '#6b6569',
    waterDeep: '#3b6ea5',
    waterFoam: '#cbd5e1',
  },
  3: {
    arc: 3,
    grassPrimary: '#7c503a',
    grassHighlight: '#966147',
    grassShadow: '#5e3b2a',
    roadPrimary: '#6e5c53',
    roadEdge: '#4a3d36',
    cliffFace: '#3d2c28',
    cliffTop: '#5c413b',
    waterDeep: '#dc2626',
    waterFoam: '#fde047',
  },
  4: {
    arc: 4,
    grassPrimary: '#2f7f7d',
    grassHighlight: '#3f9c99',
    grassShadow: '#236362',
    roadPrimary: '#d6be8a',
    roadEdge: '#ad9461',
    cliffFace: '#355c7d',
    cliffTop: '#5680a3',
    waterDeep: '#0369a1',
    waterFoam: '#7dd3fc',
  },
  5: {
    arc: 5,
    grassPrimary: '#635c4f',
    grassHighlight: '#7a7262',
    grassShadow: '#4a453b',
    roadPrimary: '#857762',
    roadEdge: '#5e5241',
    cliffFace: '#3e3a37',
    cliffTop: '#615952',
    waterDeep: '#0f766e',
    waterFoam: '#99f6e4',
  },
  6: {
    arc: 6,
    grassPrimary: '#362e59',
    grassHighlight: '#4a3f78',
    grassShadow: '#261f42',
    roadPrimary: '#524b73',
    roadEdge: '#393354',
    cliffFace: '#231e3d',
    cliffTop: '#433878',
    waterDeep: '#6d28d9',
    waterFoam: '#e9d5ff',
  },
};

export function tileCodeToTileId(code: number): TileId {
  switch (code) {
    case 1:
      return 'dirt_road';
    case 2:
      return 'tall_stealth_grass';
    case 3:
      return 'river_water';
    case 4:
      return 'shallow_ford';
    case 5:
      return 'wood_bridge';
    case 6:
      return 'stone_bridge';
    case 7:
      return 'cliff_wall';
    case 8:
      return 'stair_ramp';
    case 9:
      return 'cobble_patio';
    case 10:
      return 'lava';
    case 11:
      return 'ice_sheet';
    case 12:
      return 'cracking_ice';
    case 13:
      return 'acid_bog';
    case 14:
      return 'conveyor_belt';
    case 15:
      return 'star_forge_tile';
    case 0:
    default:
      return 'grass';
  }
}

const CLEAN_TILE_CACHE = new Map<string, HTMLCanvasElement>();

export function getCleanTerrainTileCanvas(
  tileCode: number,
  arc: ArcNumber,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const clampedCode = (tileCode >= 0 && tileCode <= 15 ? tileCode : 0) as AtlasTileCode;
  const key = `cleanTile:${arc}:${clampedCode}`;
  const cached = CLEAN_TILE_CACHE.get(key);
  if (cached) return cached;

  const baseMatrix: TerrainTileMatrix | undefined = TERRAIN_TILESET_16X16[clampedCode];
  if (!baseMatrix) return null;

  const biome = CLEAN_BIOME_PALETTES[arc];
  const palette: Record<string, string> = { ...baseMatrix.palette };

  if (clampedCode === 0) {
    palette.g = biome.grassPrimary;
    palette.h = biome.grassHighlight;
    palette.d = biome.grassShadow;
  } else if (clampedCode === 1) {
    palette.r = biome.roadPrimary;
    palette.e = biome.roadEdge;
  } else if (clampedCode === 3) {
    palette.w = biome.waterDeep;
    palette.f = biome.waterFoam;
  } else if (clampedCode === 7) {
    palette.c = biome.cliffFace;
    palette.t = biome.cliffTop;
  }

  const canvas = renderPixelMatrixToCanvas(
    baseMatrix.pixels,
    palette,
    baseMatrix.width,
    baseMatrix.height,
  );
  CLEAN_TILE_CACHE.set(key, canvas);
  return canvas;
}

/**
 * Renders subtle swaying tall-stealth-grass blades (clean 16-bit tufts, never noisy circles).
 */
export function drawSwayingStealthGrassOverlay(
  ctx: CanvasRenderingContext2D,
  worldX: number,
  worldY: number,
  tileSize: number,
  timeSec: number,
  arc: ArcNumber,
): void {
  const biome = CLEAN_BIOME_PALETTES[arc];
  const sway = Math.sin(timeSec * 3.1 + worldX * 0.08 + worldY * 0.05) * 1.4;
  ctx.fillStyle = biome.grassShadow;
  for (let i = 0; i < 3; i++) {
    const bx = Math.round(worldX + 3 + i * 5);
    const by = Math.round(worldY + tileSize - 4);
    ctx.fillRect(bx + Math.round(sway * 0.4), by - 5, 2, 5);
    ctx.fillStyle = biome.grassHighlight;
    ctx.fillRect(bx + Math.round(sway), by - 7, 1, 3);
    ctx.fillStyle = biome.grassShadow;
  }
}

export { TERRAIN_TILESET_16X16, WATERFALL_CASCADE_FRAMES };
