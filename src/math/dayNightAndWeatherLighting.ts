/**
 * File 12 / 100 — Dynamic Day-Night Circadian Lighting & Biome Weather Particle System.
 * Zero `any` types, zero `ctx.shadowBlur`.
 */

import type { ArcId, DayNightPhase, WeatherKind } from '../types/world';

export interface CircadianLightingState {
  readonly phase: DayNightPhase;
  readonly ambientTintHex: string;
  readonly ambientDarknessAlpha: number;
  readonly sunAngleRad: number;
  readonly weather: WeatherKind;
}

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export function getBiomeWeatherForArc(arcId: ArcId): WeatherKind {
  switch (arcId) {
    case 1:
      return 'starlight_motes';
    case 2:
      return 'rain';
    case 3:
      return 'ash_embers';
    case 4:
      return 'underwater_bubbles';
    case 5:
      return 'clear';
    case 6:
      return 'ash_embers';
    case 7:
      return 'snow';
    case 8:
      return 'rain';
    case 9:
      return 'starlight_motes';
    case 10:
      return 'void_sparks';
  }
}

export function evaluateDayNightLighting(
  cycleProgress01: number,
  arcId: ArcId,
  isBossFinale = false,
): CircadianLightingState {
  const weather = getBiomeWeatherForArc(arcId);
  if (isBossFinale || arcId === 10) {
    return {
      phase: 'blood_eclipse',
      ambientTintHex: '#18092b',
      ambientDarknessAlpha: 0.42,
      sunAngleRad: Math.PI * 1.5,
      weather,
    };
  }

  const p = ((cycleProgress01 % 1) + 1) % 1;
  const sunAngleRad = p * Math.PI * 2;

  if (p < 0.22) {
    return {
      phase: 'dawn',
      ambientTintHex: '#312e81',
      ambientDarknessAlpha: 0.16,
      sunAngleRad,
      weather,
    };
  }
  if (p < 0.58) {
    return {
      phase: 'noon',
      ambientTintHex: '#0f172a',
      ambientDarknessAlpha: 0.04,
      sunAngleRad,
      weather,
    };
  }
  if (p < 0.78) {
    return {
      phase: 'dusk',
      ambientTintHex: '#431407',
      ambientDarknessAlpha: 0.22,
      sunAngleRad,
      weather,
    };
  }
  return {
    phase: 'midnight',
    ambientTintHex: '#090d1f',
    ambientDarknessAlpha: 0.36,
    sunAngleRad,
    weather,
  };
}

export class BiomeWeatherParticleSystem {
  private readonly particles: WeatherParticle[] = [];
  private readonly width: number;
  private readonly height: number;
  private weather: WeatherKind = 'clear';

  constructor(width = 480, height = 270, maxParticles = 48) {
    this.width = width;
    this.height = height;
    for (let i = 0; i < maxParticles; i++) {
      this.particles.push({
        x: (i * 53) % width,
        y: (i * 37) % height,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#e2e8f0',
        alpha: 0.5,
      });
    }
    this.configure('clear');
  }

  public configure(weather: WeatherKind): void {
    this.weather = weather;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      switch (weather) {
        case 'rain':
          p.vx = -48;
          p.vy = 210 + (i % 5) * 18;
          p.size = 2;
          p.color = '#7dd3fc';
          p.alpha = 0.55;
          break;
        case 'snow':
          p.vx = -14 + (i % 3) * 8;
          p.vy = 28 + (i % 4) * 9;
          p.size = 2;
          p.color = '#f8fafc';
          p.alpha = 0.72;
          break;
        case 'ash_embers':
          p.vx = 18 - (i % 5) * 6;
          p.vy = -26 - (i % 4) * 10;
          p.size = 2;
          p.color = i % 2 === 0 ? '#fb923c' : '#fde047';
          p.alpha = 0.78;
          break;
        case 'underwater_bubbles':
          p.vx = Math.sin(i) * 8;
          p.vy = -32 - (i % 4) * 8;
          p.size = 2;
          p.color = '#67e8f9';
          p.alpha = 0.65;
          break;
        case 'void_sparks':
          p.vx = -22 + (i % 7) * 7;
          p.vy = -18 + (i % 5) * 8;
          p.size = 2;
          p.color = i % 2 === 0 ? '#c084fc' : '#f43f5e';
          p.alpha = 0.75;
          break;
        case 'starlight_motes':
          p.vx = 6 - (i % 3) * 4;
          p.vy = -10 - (i % 3) * 4;
          p.size = 2;
          p.color = '#fef08a';
          p.alpha = 0.6;
          break;
        default:
          p.vx = 0;
          p.vy = 0;
          p.alpha = 0;
          break;
      }
    }
  }

  public update(dt: number): void {
    if (this.weather === 'clear') return;
    const safeDt = Math.min(0.05, Math.max(0, dt));
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;
      if (p.x < 0) p.x += this.width;
      if (p.x >= this.width) p.x -= this.width;
      if (p.y < 0) p.y += this.height;
      if (p.y >= this.height) p.y -= this.height;
    }
  }

  public getParticles(): ReadonlyArray<WeatherParticle> {
    return this.particles;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.weather === 'clear') return;
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.alpha <= 0.01) continue;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (this.weather === 'rain') {
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 5);
      } else {
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
    }
    ctx.restore();
  }
}
