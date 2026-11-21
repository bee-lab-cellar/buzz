/**
 * Pillar 2 — Zero-Lag Pre-Allocated Ring-Buffer VFX Pool (MAX_PARTICLES = 200),
 * Crisp 2-Frame Hit-Stop, and Anti-Spam Camera Shake Controller.
 *
 * STRICT SHAKE RULES:
 * - Normal sword slashes & normal enemy/tentacle hits: `camShake = 0`!
 * - Micro-shake (max 2–3px, 80ms, 0.6s cooldown) ONLY on Boss Kill, Tentacle Sever,
 *   Great Duck Elixir, or Sky-Crash Harpoon Slam, gated by `screenShakeEnabled`.
 */

import type { Vec2 } from '../types/math';
import {
  MAX_PARTICLES,
  ZeroLagVfxPool,
  type MajorShakeTrigger,
  type VfxStampKind,
} from './zeroLagVfxPool';

export const HIT_STOP_FRAMES = 2;
export const HIT_STOP_SEC = HIT_STOP_FRAMES / 60;

export interface HitStopState {
  remainingFrames: number;
  remainingSec: number;
}

export class ZeroLagVfxRingBuffer {
  private readonly pool = new ZeroLagVfxPool();
  public readonly hitStop: HitStopState = {
    remainingFrames: 0,
    remainingSec: 0,
  };

  public get screenShakeEnabled(): boolean {
    return this.pool.shake.enabled;
  }

  public setScreenShakeEnabled(enabled: boolean): void {
    this.pool.setScreenShakeEnabled(enabled);
  }

  public toggleScreenShake(): boolean {
    const next = !this.pool.shake.enabled;
    this.pool.setScreenShakeEnabled(next);
    return next;
  }

  /**
   * Triggers crisp 2-frame hit-stop WITHOUT shaking the camera on normal hits.
   */
  public triggerNormalHitImpact(pos: Vec2, color = '#fde047'): void {
    this.hitStop.remainingFrames = HIT_STOP_FRAMES;
    this.hitStop.remainingSec = HIT_STOP_SEC;
    this.pool.emitBurst(pos, 6, 48, color, 'spark');
    // Strictly ZERO camera shake on normal attacks!
  }

  public triggerMajorImpactShake(trigger: MajorShakeTrigger, pos: Vec2, color = '#22d3ee'): void {
    this.pool.triggerMajorShake(trigger);
    this.pool.emitBurst(pos, 16, 76, color, 'shockwave_ring');
  }

  public emit(
    pos: Vec2,
    vel: Vec2,
    lifeSec: number,
    size: number,
    color: string,
    stamp: VfxStampKind = 'spark',
  ): void {
    this.pool.emit(pos, vel, lifeSec, size, color, stamp, true);
  }

  public isHitStopped(): boolean {
    return this.hitStop.remainingFrames > 0 || this.hitStop.remainingSec > 0;
  }

  public update(dt: number): void {
    if (this.hitStop.remainingFrames > 0) {
      this.hitStop.remainingFrames -= 1;
    }
    if (this.hitStop.remainingSec > 0) {
      this.hitStop.remainingSec = Math.max(0, this.hitStop.remainingSec - dt);
    }
    this.pool.update(dt);
  }

  public getShakeOffset(): Vec2 {
    return { x: this.pool.shake.offsetX, y: this.pool.shake.offsetY };
  }

  public getActiveParticleCount(): number {
    return this.pool.getActiveCount();
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    this.pool.render(ctx, camX, camY);
  }
}

export { MAX_PARTICLES };
