/**
 * Deterministic Seeded 2D Simplex Noise, 4-Bit Bitmask Auto-Tiling Engine & Paw-Print Decals
 */

import type { ElevationLayer } from '../types/math';

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

const GRAD2: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export class SeededSimplex2D {
  private readonly perm: Uint8Array;

  constructor(seed: number) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = (seed ^ 0x9e3779b9) >>> 0;
    for (let i = 255; i > 0; i--) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const j = s % (i + 1);
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255];
    }
  }

  /** Returns deterministic simplex noise normalized to [0, 1] */
  public sample(xin: number, yin: number): number {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);

    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;

    const ii = i & 255;
    const jj = j & 255;

    let n0 = 0;
    let n1 = 0;
    let n2 = 0;

    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      const g = GRAD2[this.perm[ii + this.perm[jj]] & 7];
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      const g = GRAD2[this.perm[ii + i1 + this.perm[jj + j1]] & 7];
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      const g = GRAD2[this.perm[ii + 1 + this.perm[jj + 1]] & 7];
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
    }

    const raw = 70 * (n0 + n1 + n2); // roughly [-1, 1]
    return Math.max(0, Math.min(1, raw * 0.5 + 0.5));
  }

  public sampleFbm(x: number, y: number, octaves = 3): number {
    let value = 0;
    let amp = 0.55;
    let freq = 1.0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      value += this.sample(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.05;
    }
    return norm > 0 ? value / norm : 0.5;
  }
}

export interface AutoTileMaskInfo {
  readonly bitmask: number; // N=1, E=2, S=4, W=8
  readonly hasNorth: boolean;
  readonly hasEast: boolean;
  readonly hasSouth: boolean;
  readonly hasWest: boolean;
}

export function evaluate4BitAutoTile(
  grid: ReadonlyArray<string>,
  col: number,
  row: number,
  matcher: (ch: string | undefined) => boolean
): AutoTileMaskInfo {
  const hasNorth = matcher(grid[row - 1]?.[col]);
  const hasEast = matcher(grid[row]?.[col + 1]);
  const hasSouth = matcher(grid[row + 1]?.[col]);
  const hasWest = matcher(grid[row]?.[col - 1]);
  const bitmask = (hasNorth ? 1 : 0) | (hasEast ? 2 : 0) | (hasSouth ? 4 : 0) | (hasWest ? 8 : 0);
  return { bitmask, hasNorth, hasEast, hasSouth, hasWest };
}

export interface SnowPawDecal {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  elevation: ElevationLayer;
  facingX: 1 | -1;
}

export class SnowPawDecalPool {
  private readonly decals: SnowPawDecal[] = [];
  private readonly maxDecals: number;

  constructor(maxDecals = 48) {
    this.maxDecals = maxDecals;
  }

  public stamp(x: number, y: number, elevation: ElevationLayer, facingX: 1 | -1): void {
    if (this.decals.length >= this.maxDecals) {
      this.decals.shift();
    }
    this.decals.push({ x, y, life: 3.2, maxLife: 3.2, elevation, facingX });
  }

  public update(dt: number): void {
    for (let i = this.decals.length - 1; i >= 0; i--) {
      this.decals[i].life -= dt;
      if (this.decals[i].life <= 0) {
        this.decals.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < this.decals.length; i++) {
      const d = this.decals[i];
      const alpha = Math.max(0, Math.min(0.45, (d.life / d.maxLife) * 0.45));
      ctx.fillStyle = `rgba(30, 58, 138, ${alpha.toFixed(3)})`;
      const px = Math.round(d.x);
      const py = Math.round(d.y);
      ctx.fillRect(px - 2, py, 2, 1);
      ctx.fillRect(px + 1, py + 1, 2, 1);
    }
  }

  public clear(): void {
    this.decals.length = 0;
  }
}
