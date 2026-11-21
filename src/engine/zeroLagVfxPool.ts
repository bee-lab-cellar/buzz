/**
 * Layer 4 — Zero-Lag VFX Pool & Screen-Shake Controller
 *
 * STRICT PERFORMANCE & GAMEPLAY RULES:
 * - ZERO `ctx.shadowBlur` calls anywhere.
 * - Pre-baked offscreen additive glow/slash/shockwave stamps composited via `lighter`.
 * - Fixed `MAX_PARTICLES = 200` zero-GC ring buffer (no `.filter()` / `.splice()` per frame).
 * - ZERO screen shake on normal sword/enemy hits (`camShake = 0` on normal attacks!).
 * - Subtle 2–3px micro-shake (80ms, 0.6s cooldown) ONLY for Boss Kill, Tentacle Sever,
 *   Great Duck Elixir, or Sky-Crash Harpoon Slam, gated by `screenShakeEnabled`.
 */

import type { Vec2 } from '../types/math';

export const MAX_PARTICLES = 200;

export type VfxStampKind = 'spark' | 'glow_gold' | 'glow_cyan' | 'glow_violet' | 'slash_arc' | 'shockwave_ring';

export type MajorShakeTrigger =
  | 'boss_kill'
  | 'tentacle_sever'
  | 'duck_elixir'
  | 'harpoon_slam';

export interface RingParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  stamp: VfxStampKind;
  additive: boolean;
}

export interface CameraShakeState {
  enabled: boolean;
  remainingSec: number;
  cooldownSec: number;
  magnitudePx: number;
  offsetX: number;
  offsetY: number;
}

const STAMP_CACHE = new Map<VfxStampKind, HTMLCanvasElement>();

function createPrebakedStamp(kind: VfxStampKind): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = kind === 'shockwave_ring' || kind === 'slash_arc' ? 32 : 16;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const half = size / 2;

  if (kind === 'glow_gold' || kind === 'glow_cyan' || kind === 'glow_violet') {
    const inner =
      kind === 'glow_gold'
        ? 'rgba(254, 240, 138, 0.95)'
        : kind === 'glow_cyan'
          ? 'rgba(103, 232, 249, 0.95)'
          : 'rgba(216, 180, 254, 0.95)';
    const outer =
      kind === 'glow_gold'
        ? 'rgba(245, 158, 11, 0)'
        : kind === 'glow_cyan'
          ? 'rgba(6, 182, 212, 0)'
          : 'rgba(147, 51, 234, 0)';
    const grad = ctx.createRadialGradient(half, half, 1, half, half, half);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.55, inner.replace('0.95', '0.35'));
    grad.addColorStop(1, outer);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  } else if (kind === 'shockwave_ring') {
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(half, half, half - 3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'slash_arc') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(half, half, half - 4, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(half - 2, half - 2, 4, 4);
  }

  return canvas;
}

export function getPrebakedVfxStamp(kind: VfxStampKind): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const cached = STAMP_CACHE.get(kind);
  if (cached) return cached;
  const created = createPrebakedStamp(kind);
  STAMP_CACHE.set(kind, created);
  return created;
}

export class ZeroLagVfxPool {
  private readonly particles: RingParticle[] = [];
  private cursor = 0;
  public readonly shake: CameraShakeState = {
    enabled: true,
    remainingSec: 0,
    cooldownSec: 0,
    magnitudePx: 0,
    offsetX: 0,
    offsetY: 0,
  };

  constructor() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0.3,
        size: 4,
        color: '#fde047',
        stamp: 'spark',
        additive: true,
      });
    }
  }

  public setScreenShakeEnabled(enabled: boolean): void {
    this.shake.enabled = enabled;
    if (!enabled) {
      this.shake.remainingSec = 0;
      this.shake.offsetX = 0;
      this.shake.offsetY = 0;
    }
  }

  /**
   * Triggers a strictly capped 2–3px micro-shake (80ms) with a 0.6s anti-spam cooldown.
   * NEVER call this on normal sword hits or normal enemy strikes.
   */
  public triggerMajorShake(trigger: MajorShakeTrigger): void {
    if (!this.shake.enabled || this.shake.cooldownSec > 0) return;
    this.shake.remainingSec = 0.08; // 80ms crisp impact
    this.shake.cooldownSec = 0.6; // 0.6s cooldown prevents vibration spam
    this.shake.magnitudePx =
      trigger === 'boss_kill' || trigger === 'harpoon_slam' ? 3 : 2.2;
  }

  public emit(
    pos: Vec2,
    vel: Vec2,
    lifeSec: number,
    size: number,
    color: string,
    stamp: VfxStampKind = 'spark',
    additive = true,
  ): void {
    const slot = this.particles[this.cursor];
    this.cursor = (this.cursor + 1) % MAX_PARTICLES;
    slot.active = true;
    slot.x = pos.x;
    slot.y = pos.y;
    slot.vx = vel.x;
    slot.vy = vel.y;
    slot.life = lifeSec;
    slot.maxLife = Math.max(0.05, lifeSec);
    slot.size = size;
    slot.color = color;
    slot.stamp = stamp;
    slot.additive = additive;
  }

  public emitBurst(
    origin: Vec2,
    count: number,
    speed: number,
    color: string,
    stamp: VfxStampKind = 'glow_gold',
  ): void {
    const safeCount = Math.min(count, 24);
    for (let i = 0; i < safeCount; i++) {
      const angle = (Math.PI * 2 * i) / safeCount + (i % 3) * 0.17;
      const spd = speed * (0.65 + (i % 4) * 0.14);
      this.emit(
        origin,
        { x: Math.cos(angle) * spd, y: Math.sin(angle) * spd },
        0.28 + (i % 3) * 0.08,
        stamp === 'shockwave_ring' ? 22 : 7,
        color,
        stamp,
        true,
      );
    }
  }

  public update(dt: number): void {
    if (this.shake.cooldownSec > 0) {
      this.shake.cooldownSec = Math.max(0, this.shake.cooldownSec - dt);
    }
    if (this.shake.remainingSec > 0 && this.shake.enabled) {
      this.shake.remainingSec = Math.max(0, this.shake.remainingSec - dt);
      const decay = this.shake.remainingSec / 0.08;
      const amp = this.shake.magnitudePx * decay;
      this.shake.offsetX = Math.round((Math.random() * 2 - 1) * amp);
      this.shake.offsetY = Math.round((Math.random() * 2 - 1) * amp);
    } else {
      this.shake.offsetX = 0;
      this.shake.offsetY = 0;
    }

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
    }
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    ctx.save();
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      const sx = Math.round(p.x - camX);
      const sy = Math.round(p.y - camY);

      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = p.additive ? 'lighter' : 'source-over';
      const stamp = getPrebakedVfxStamp(p.stamp);
      if (stamp && p.stamp !== 'spark') {
        const drawSize = Math.max(4, Math.round(p.size * (p.stamp === 'shockwave_ring' ? 1.8 - alpha * 0.8 : 1)));
        ctx.drawImage(stamp, sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(sx - p.size / 2, sy - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();
  }

  public getActiveCount(): number {
    let count = 0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (this.particles[i].active) count++;
    }
    return count;
  }
}
