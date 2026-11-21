/**
 * Pillar 1 — Real-Time 2D Visibility Polygon & Raycasted Dynamic Pixel Shadow Engine
 *
 * Casts crisp pixel-snapped dynamic shadows from cliff ledges, castle walls, torches,
 * Nyx's Starlight beams, and Dragon fireballs onto a half-res offscreen lighting buffer
 * composited cleanly at 60FPS with ZERO `ctx.shadowBlur`!
 */

import type { Ray2D, ReadonlyVec2, Segment2D, Vec2 } from '../types/math';
import type { LightingOccluder } from '../types/world';

export interface DynamicLightSource {
  readonly id: string;
  readonly position: ReadonlyVec2;
  readonly radius: number;
  readonly colorHex: string;
  readonly intensity: number;
  readonly kind: 'torch' | 'starlight_beam' | 'dragon_fireball' | 'shrine_aura';
}

export interface VisibilityPolygonResult {
  readonly lightId: string;
  readonly origin: ReadonlyVec2;
  readonly vertices: ReadonlyArray<Vec2>;
}

/**
 * Exact 2D ray-segment intersection. Returns distance `t` along ray or `null` if no hit.
 */
export function intersectRaySegment(ray: Ray2D, seg: Segment2D): number | null {
  const rDx = ray.direction.x;
  const rDy = ray.direction.y;
  const sDx = seg.b.x - seg.a.x;
  const sDy = seg.b.y - seg.a.y;

  const denom = rDx * sDy - rDy * sDx;
  if (Math.abs(denom) <= 1e-9) return null;

  const qpx = seg.a.x - ray.origin.x;
  const qpy = seg.a.y - ray.origin.y;
  const t = (qpx * sDy - qpy * sDx) / denom;
  const u = (qpx * rDy - qpy * rDx) / denom;

  if (t >= 0 && t <= ray.maxDistance && u >= 0 && u <= 1) {
    return t;
  }
  return null;
}

export function extractOccluderSegments(
  occluders: ReadonlyArray<LightingOccluder>,
  boundsWidth: number,
  boundsHeight: number,
): Segment2D[] {
  const segs: Segment2D[] = [
    { a: { x: 0, y: 0 }, b: { x: boundsWidth, y: 0 } },
    { a: { x: boundsWidth, y: 0 }, b: { x: boundsWidth, y: boundsHeight } },
    { a: { x: boundsWidth, y: boundsHeight }, b: { x: 0, y: boundsHeight } },
    { a: { x: 0, y: boundsHeight }, b: { x: 0, y: 0 } },
  ];

  for (let i = 0; i < occluders.length; i++) {
    const occ = occluders[i];
    if (!occ.castsShadow) continue;
    const verts = occ.polygon.vertices;
    for (let j = 0; j < verts.length; j++) {
      segs.push({
        a: verts[j],
        b: verts[(j + 1) % verts.length],
      });
    }
  }
  return segs;
}

/**
 * Computes the exact 2D angular-sweep visibility polygon for a point light source
 * against all cliff/wall occluder segments.
 */
export function computeVisibilityPolygon(
  light: DynamicLightSource,
  segments: ReadonlyArray<Segment2D>,
): VisibilityPolygonResult {
  const angles: number[] = [];
  const ox = light.position.x;
  const oy = light.position.y;
  const maxR = Math.max(16, light.radius);

  // Add base compass angles so open circular ranges stay smooth
  const baseSteps = 16;
  for (let i = 0; i < baseSteps; i++) {
    angles.push((Math.PI * 2 * i) / baseSteps - Math.PI);
  }

  // Cast twin jitter rays (±0.00025 rad) at every segment endpoint within radius
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const pts: readonly [ReadonlyVec2, ReadonlyVec2] = [seg.a, seg.b];
    for (let p = 0; p < 2; p++) {
      const dx = pts[p].x - ox;
      const dy = pts[p].y - oy;
      if (dx * dx + dy * dy > (maxR * 1.45) * (maxR * 1.45)) continue;
      const ang = Math.atan2(dy, dx);
      angles.push(ang - 0.00025, ang, ang + 0.00025);
    }
  }

  angles.sort((a, b) => a - b);

  const vertices: Vec2[] = [];
  for (let i = 0; i < angles.length; i++) {
    const ang = angles[i];
    const dirX = Math.cos(ang);
    const dirY = Math.sin(ang);
    const ray: Ray2D = {
      origin: light.position,
      direction: { x: dirX, y: dirY },
      maxDistance: maxR,
    };

    let closest = maxR;
    for (let s = 0; s < segments.length; s++) {
      const hitT = intersectRaySegment(ray, segments[s]);
      if (hitT !== null && hitT < closest) {
        closest = hitT;
      }
    }

    vertices.push({
      x: Math.round(ox + dirX * closest),
      y: Math.round(oy + dirY * closest),
    });
  }

  return {
    lightId: light.id,
    origin: light.position,
    vertices,
  };
}

/**
 * Half-Resolution Offscreen Dynamic Pixel Lighting Compositor.
 * ZERO `ctx.shadowBlur` — pure crisp raycasted visibility polygons + radial alpha falloff.
 */
export class RaycastPixelLightingBuffer {
  private readonly width: number;
  private readonly height: number;
  private readonly canvas: HTMLCanvasElement | null;
  private readonly ctx: CanvasRenderingContext2D | null;

  constructor(logicalWidth = 480, logicalHeight = 270) {
    this.width = Math.max(64, Math.floor(logicalWidth / 2));
    this.height = Math.max(64, Math.floor(logicalHeight / 2));
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx = this.canvas.getContext('2d');
      if (this.ctx) {
        this.ctx.imageSmoothingEnabled = false;
      }
    } else {
      this.canvas = null;
      this.ctx = null;
    }
  }

  public renderToTarget(
    targetCtx: CanvasRenderingContext2D,
    logicalWidth: number,
    logicalHeight: number,
    ambientDarknessAlpha: number,
    ambientTintHex: string,
    lights: ReadonlyArray<DynamicLightSource>,
    occluders: ReadonlyArray<LightingOccluder>,
  ): void {
    if (!this.canvas || !this.ctx || ambientDarknessAlpha <= 0.01) return;
    const lctx = this.ctx;
    const scaleX = this.width / logicalWidth;
    const scaleY = this.height / logicalHeight;

    lctx.save();
    lctx.globalCompositeOperation = 'source-over';
    lctx.clearRect(0, 0, this.width, this.height);
    lctx.globalAlpha = Math.max(0, Math.min(0.75, ambientDarknessAlpha));
    lctx.fillStyle = ambientTintHex;
    lctx.fillRect(0, 0, this.width, this.height);

    const segments = extractOccluderSegments(occluders, logicalWidth, logicalHeight);

    for (let i = 0; i < lights.length; i++) {
      const light = lights[i];
      const poly = computeVisibilityPolygon(light, segments);
      if (poly.vertices.length < 3) continue;

      const lx = light.position.x * scaleX;
      const ly = light.position.y * scaleY;
      const lr = Math.max(6, light.radius * scaleX);

      lctx.save();
      lctx.beginPath();
      lctx.moveTo(poly.vertices[0].x * scaleX, poly.vertices[0].y * scaleY);
      for (let v = 1; v < poly.vertices.length; v++) {
        lctx.lineTo(poly.vertices[v].x * scaleX, poly.vertices[v].y * scaleY);
      }
      lctx.closePath();
      lctx.clip();

      // Carve shadow darkness inside visibility polygon
      lctx.globalCompositeOperation = 'destination-out';
      const cutGrad = lctx.createRadialGradient(lx, ly, 1, lx, ly, lr);
      cutGrad.addColorStop(0, `rgba(0,0,0,${Math.min(1, light.intensity)})`);
      cutGrad.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.fillStyle = cutGrad;
      lctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
      lctx.restore();
    }

    lctx.restore();

    targetCtx.save();
    targetCtx.imageSmoothingEnabled = false;
    targetCtx.drawImage(this.canvas, 0, 0, logicalWidth, logicalHeight);
    targetCtx.restore();
  }
}
