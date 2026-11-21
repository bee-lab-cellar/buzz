/**
 * Pillar 2 — Clean 16-Bit SNES-Style Biome Floor & Outer-Edge Framing Tileset
 *
 * STRICT CLEAN ARENA RULES:
 * - ZERO checkerboard tree spam on interior ground tiles.
 * - ZERO neon-green vertical striped laser circles.
 * - ZERO floating `CUT LOG` clutter labels.
 * - Trees & cliffs frame ONLY the outer perimeter (`row === 0 || row === rows-1 || col === 0 || col === cols-1`)
 *   so combat arenas remain wide open, crisp, and readable at 60FPS!
 */

import type { ArcNumber } from '../types/world';
import {
  CLEAN_BIOME_PALETTES,
  drawSwayingStealthGrassOverlay,
  getCleanTerrainTileCanvas,
  tileCodeToTileId,
} from './cleanTerrainTileset';

export const CLEAN_ARENA_DESIGN_RULES = {
  forbidInteriorTreeCheckerboard: true,
  forbidGreenStripedCircles: true,
  forbidFloatingCutLogLabels: true,
  perimeterFramingOnly: true,
} as const;

/**
 * Strips any accidental interior cliff/tree checkerboard spam from a mutable 14x24 tile grid
 * while preserving outer perimeter borders, rivers, bridges, and cobblestone patios.
 */
export function enforceOpenArenaPerimeterFraming(tileGrid: number[][]): void {
  const rows = tileGrid.length;
  const cols = rows > 0 ? tileGrid[0].length : 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isPerimeter = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      if (isPerimeter) {
        if (tileGrid[r][c] === 0) {
          tileGrid[r][c] = 7; // Clean outer cliff/canopy border
        }
      } else if (tileGrid[r][c] === 7) {
        // Keep interior arenas wide open & readable
        tileGrid[r][c] = 0;
      }
    }
  }
}

export function renderCleanBiomeGrid(
  ctx: CanvasRenderingContext2D,
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  arc: ArcNumber,
  tileSizePx: number,
  timeSec: number,
): void {
  const rows = tileGrid.length;
  const cols = rows > 0 ? tileGrid[0].length : 0;
  ctx.imageSmoothingEnabled = false;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const code = tileGrid[r][c];
      const tileCanvas = getCleanTerrainTileCanvas(code, arc);
      const wx = c * tileSizePx;
      const wy = r * tileSizePx;
      if (tileCanvas) {
        ctx.drawImage(tileCanvas, wx, wy, tileSizePx, tileSizePx);
      } else {
        ctx.fillStyle = CLEAN_BIOME_PALETTES[arc].grassPrimary;
        ctx.fillRect(wx, wy, tileSizePx, tileSizePx);
      }
      if (code === 2) {
        drawSwayingStealthGrassOverlay(ctx, wx, wy, tileSizePx, timeSec, arc);
      }
    }
  }
}

export {
  CLEAN_BIOME_PALETTES,
  drawSwayingStealthGrassOverlay,
  getCleanTerrainTileCanvas,
  tileCodeToTileId,
};
