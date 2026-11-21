/**
 * Layer 3 — Act Landmarks (48x48) & Upgradable Capital Hub Buildings (24x24)
 * Pre-baked offscreen pixel-art caches with zero `any`.
 */

import type { CapitalBuildingId } from '../game/types';
import {
  CAPITAL_BUILDING_MATRICES_24X24,
  LANDMARK_MATRICES_48X48,
  getCapitalBuildingSpriteMatrix,
  getLandmarkSpriteMatrix,
  type StaticSpriteMatrix,
} from './landmarksAndBuildingsMatrices';
import { renderPixelMatrixToCanvas } from './spriteMatrixTypes';

const LANDMARK_CANVAS_CACHE = new Map<string, HTMLCanvasElement>();

export function getPrebakedLandmarkCanvas(landmarkId: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const matrix: StaticSpriteMatrix = getLandmarkSpriteMatrix(landmarkId);
  const key = `landmark:${matrix.id}`;
  const cached = LANDMARK_CANVAS_CACHE.get(key);
  if (cached) return cached;

  const canvas = renderPixelMatrixToCanvas(
    matrix.pixels,
    matrix.palette,
    matrix.width,
    matrix.height,
  );
  LANDMARK_CANVAS_CACHE.set(key, canvas);
  return canvas;
}

export function getPrebakedCapitalBuildingCanvas(
  buildingId: CapitalBuildingId,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const matrix: StaticSpriteMatrix = getCapitalBuildingSpriteMatrix(buildingId);
  const key = `capital:${matrix.id}`;
  const cached = LANDMARK_CANVAS_CACHE.get(key);
  if (cached) return cached;

  const canvas = renderPixelMatrixToCanvas(
    matrix.pixels,
    matrix.palette,
    matrix.width,
    matrix.height,
  );
  LANDMARK_CANVAS_CACHE.set(key, canvas);
  return canvas;
}

export function drawLandmarkWithAura(
  ctx: CanvasRenderingContext2D,
  landmarkId: string,
  x: number,
  y: number,
  auraColor: string,
  timeSec: number,
): void {
  const canvas = getPrebakedLandmarkCanvas(landmarkId);
  if (!canvas) return;

  const pulseRadius = 22 + Math.sin(timeSec * 2.6) * 2.5;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = auraColor;
  ctx.beginPath();
  ctx.ellipse(Math.round(x), Math.round(y + 4), pulseRadius, pulseRadius * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.drawImage(canvas, Math.round(x - canvas.width / 2), Math.round(y - canvas.height + 6));
  ctx.restore();
}

export {
  CAPITAL_BUILDING_MATRICES_24X24,
  LANDMARK_MATRICES_48X48,
  getCapitalBuildingSpriteMatrix,
  getLandmarkSpriteMatrix,
};
