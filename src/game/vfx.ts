export type HaloColor = 'gold' | 'cyan' | 'crimson' | 'purple' | 'emerald' | 'white';
export type HaloSize = 16 | 32 | 64;
export type SlashStage = 'iron' | 'mithril' | 'astral' | 'dragon';
export type DecalKind = 'ember' | 'frost' | 'lightning' | 'void' | 'poison';

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  additive: boolean;
}

interface PooledSlash {
  active: boolean;
  x: number;
  y: number;
  angle: number;
  stage: SlashStage;
  combo: number;
  life: number;
  maxLife: number;
}

interface PooledShockwave {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
}

interface PooledDecal {
  active: boolean;
  x: number;
  y: number;
  kind: DecalKind;
  life: number;
  maxLife: number;
  seed: number;
}

const HALO_RGB: Record<HaloColor, [number, number, number]> = {
  gold: [253, 224, 71],
  cyan: [56, 189, 248],
  crimson: [244, 63, 94],
  purple: [192, 132, 252],
  emerald: [52, 211, 153],
  white: [255, 255, 255],
};

function createOffscreen(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

function bakeHaloStamp(color: HaloColor, size: HaloSize): HTMLCanvasElement {
  const [c, ctx] = createOffscreen(size, size);
  const [r, g, b] = HALO_RGB[color];
  const half = size / 2;
  // Concentric stepped pixel rings for crisp retro 16-bit glow without runtime gradients or shadowBlur
  const rings = 5;
  for (let i = rings; i >= 1; i--) {
    const rad = Math.max(1, Math.floor((half * i) / rings));
    const alpha = (0.08 + 0.14 * (rings - i + 1) / rings).toFixed(3);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.beginPath();
    ctx.arc(half, half, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

function bakeSlashStamp(stage: SlashStage, frameIdx: number): HTMLCanvasElement {
  const size = 56;
  const [c, ctx] = createOffscreen(size, size);
  const cx = size / 2;
  const cy = size / 2;

  const palettes: Record<SlashStage, { outer: string; mid: string; core: string }> = {
    iron: { outer: '#94a3b8', mid: '#e2e8f0', core: '#ffffff' },
    mithril: { outer: '#0284c7', mid: '#38bdf8', core: '#e0f2fe' },
    astral: { outer: '#c084fc', mid: '#fde047', core: '#ffffff' },
    dragon: { outer: '#dc2626', mid: '#f59e0b', core: '#fef08a' },
  };
  const pal = palettes[stage];

  // Progress-based crescent sweep across 3 discrete animation stages (0, 1, 2)
  const startAng = frameIdx === 0 ? -1.05 : frameIdx === 1 ? -0.65 : -0.15;
  const endAng = frameIdx === 0 ? 0.45 : frameIdx === 1 ? 0.95 : 1.15;
  const radius = frameIdx === 2 ? 22 : 20;

  for (let step = 0; step < 36; step++) {
    const t = step / 35;
    const a = startAng + (endAng - startAng) * t;
    const thickness = Math.sin(t * Math.PI) * (frameIdx === 2 ? 5.5 : 4.2);
    if (thickness < 0.8) continue;

    const ox = (cx + Math.cos(a) * radius) | 0;
    const oy = (cy + Math.sin(a) * radius) | 0;
    const w = Math.max(2, Math.round(thickness));

    ctx.fillStyle = pal.outer;
    ctx.fillRect(ox - ((w / 2) | 0) - 1, oy - ((w / 2) | 0) - 1, w + 2, w + 2);
    ctx.fillStyle = pal.mid;
    ctx.fillRect(ox - ((w / 2) | 0), oy - ((w / 2) | 0), w, w);
    if (t > 0.25 && t < 0.85) {
      ctx.fillStyle = pal.core;
      ctx.fillRect(ox, oy, Math.max(1, (w / 2) | 0), Math.max(1, (w / 2) | 0));
    }
  }

  // Pixel trailing sparks near the blade tip
  if (stage === 'astral' || stage === 'dragon') {
    const tipA = endAng - 0.12;
    for (let s = 0; s < 4; s++) {
      const sr = radius - 3 + s * 2;
      const sx = (cx + Math.cos(tipA - s * 0.16) * sr) | 0;
      const sy = (cy + Math.sin(tipA - s * 0.16) * sr) | 0;
      ctx.fillStyle = stage === 'dragon' ? '#fde047' : '#38bdf8';
      ctx.fillRect(sx, sy, 2, 2);
    }
  }

  return c;
}

export class PixelVfxEngine {
  public static readonly MAX_PARTICLES = 250;
  public static readonly MAX_SLASHES = 32;
  public static readonly MAX_SHOCKWAVES = 24;
  public static readonly MAX_DECALS = 12;

  private particles: PooledParticle[];
  private slashes: PooledSlash[];
  private shockwaves: PooledShockwave[];
  private decals: PooledDecal[];

  private particleCursor = 0;
  private slashCursor = 0;
  private shockwaveCursor = 0;
  private decalCursor = 0;

  private haloCache: Record<string, HTMLCanvasElement> = {};
  private slashCache: Record<SlashStage, HTMLCanvasElement[]>;
  private whiteFlashCache: WeakMap<HTMLCanvasElement, HTMLCanvasElement> = new WeakMap();

  constructor() {
    this.particles = Array.from({ length: PixelVfxEngine.MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      gravity: 0,
      size: 2,
      color: '#ffffff',
      life: 0,
      maxLife: 0.4,
      additive: true,
    }));

    this.slashes = Array.from({ length: PixelVfxEngine.MAX_SLASHES }, () => ({
      active: false,
      x: 0,
      y: 0,
      angle: 0,
      stage: 'iron',
      combo: 0,
      life: 0,
      maxLife: 0.16,
    }));

    this.shockwaves = Array.from({ length: PixelVfxEngine.MAX_SHOCKWAVES }, () => ({
      active: false,
      x: 0,
      y: 0,
      radius: 4,
      maxRadius: 32,
      color: '#fde047',
      life: 0,
      maxLife: 0.35,
    }));

    this.decals = Array.from({ length: PixelVfxEngine.MAX_DECALS }, () => ({
      active: false,
      x: 0,
      y: 0,
      kind: 'ember',
      life: 0,
      maxLife: 4.0,
      seed: 0,
    }));

    // Pre-bake all halo stamps once at startup
    const colors: HaloColor[] = ['gold', 'cyan', 'crimson', 'purple', 'emerald', 'white'];
    const sizes: HaloSize[] = [16, 32, 64];
    for (const col of colors) {
      for (const sz of sizes) {
        this.haloCache[`${col}_${sz}`] = bakeHaloStamp(col, sz);
      }
    }

    // Pre-bake 3-frame pixel crescent slash stamps for all 4 tier stages
    this.slashCache = {
      iron: [bakeSlashStamp('iron', 0), bakeSlashStamp('iron', 1), bakeSlashStamp('iron', 2)],
      mithril: [bakeSlashStamp('mithril', 0), bakeSlashStamp('mithril', 1), bakeSlashStamp('mithril', 2)],
      astral: [bakeSlashStamp('astral', 0), bakeSlashStamp('astral', 1), bakeSlashStamp('astral', 2)],
      dragon: [bakeSlashStamp('dragon', 0), bakeSlashStamp('dragon', 1), bakeSlashStamp('dragon', 2)],
    };
  }

  public clearAll() {
    for (let i = 0; i < this.particles.length; i++) this.particles[i].active = false;
    for (let i = 0; i < this.slashes.length; i++) this.slashes[i].active = false;
    for (let i = 0; i < this.shockwaves.length; i++) this.shockwaves[i].active = false;
    for (let i = 0; i < this.decals.length; i++) this.decals[i].active = false;
  }

  public getHaloStamp(color: HaloColor, size: HaloSize): HTMLCanvasElement {
    return this.haloCache[`${color}_${size}`];
  }

  public drawHalo(ctx: CanvasRenderingContext2D, x: number, y: number, color: HaloColor, size: HaloSize, alpha = 1) {
    const stamp = this.haloCache[`${color}_${size}`];
    if (!stamp) return;
    const prevAlpha = ctx.globalAlpha;
    const prevComp = ctx.globalCompositeOperation;
    ctx.globalAlpha = prevAlpha * alpha;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(stamp, ((x - size / 2) | 0), ((y - size / 2) | 0));
    ctx.globalCompositeOperation = prevComp;
    ctx.globalAlpha = prevAlpha;
  }

  /**
   * Returns a cached pure-white hit-flash silhouette canvas created via `source-in` once per sprite.
   * Eliminates runtime `ctx.filter = 'brightness(...)'` which causes severe canvas frame drops.
   */
  public getWhiteFlashCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
    const cached = this.whiteFlashCache.get(source);
    if (cached) return cached;

    const [flashCanvas, fctx] = createOffscreen(source.width || 16, source.height || 16);
    fctx.drawImage(source, 0, 0);
    fctx.globalCompositeOperation = 'source-in';
    fctx.fillStyle = '#ffffff';
    fctx.fillRect(0, 0, flashCanvas.width, flashCanvas.height);
    fctx.globalCompositeOperation = 'source-over';
    this.whiteFlashCache.set(source, flashCanvas);
    return flashCanvas;
  }

  public spawnBurst(
    x: number,
    y: number,
    color: string,
    count: number,
    speed: number,
    gravity = 0,
    additive = true
  ) {
    const n = Math.min(count, 48);
    for (let i = 0; i < n; i++) {
      const pt = this.particles[this.particleCursor];
      this.particleCursor = (this.particleCursor + 1) % PixelVfxEngine.MAX_PARTICLES;

      const ang = Math.random() * Math.PI * 2;
      const sp = (0.3 + Math.random() * 0.7) * speed;
      const maxLife = 0.25 + Math.random() * 0.28;
      pt.active = true;
      pt.x = x;
      pt.y = y;
      pt.vx = Math.cos(ang) * sp;
      pt.vy = Math.sin(ang) * sp;
      pt.gravity = gravity;
      pt.size = Math.random() < 0.35 ? 3 : 2;
      pt.color = color;
      pt.life = maxLife;
      pt.maxLife = maxLife;
      pt.additive = additive;
    }
  }

  public spawnSingleParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    life: number,
    additive = true
  ) {
    const pt = this.particles[this.particleCursor];
    this.particleCursor = (this.particleCursor + 1) % PixelVfxEngine.MAX_PARTICLES;
    pt.active = true;
    pt.x = x;
    pt.y = y;
    pt.vx = vx;
    pt.vy = vy;
    pt.gravity = 0;
    pt.size = size;
    pt.color = color;
    pt.life = life;
    pt.maxLife = life;
    pt.additive = additive;
  }

  public spawnSlash(x: number, y: number, angle: number, weaponTier: number, combo: number, isElixir: boolean) {
    const sl = this.slashes[this.slashCursor];
    this.slashCursor = (this.slashCursor + 1) % PixelVfxEngine.MAX_SLASHES;

    let stage: SlashStage = 'iron';
    if (weaponTier >= 21) stage = 'dragon';
    else if (isElixir || weaponTier >= 11) stage = 'astral';
    else if (weaponTier >= 5) stage = 'mithril';

    sl.active = true;
    sl.x = x;
    sl.y = y;
    sl.angle = angle;
    sl.stage = stage;
    sl.combo = combo;
    sl.life = 0.16;
    sl.maxLife = 0.16;
  }

  public spawnShockwave(x: number, y: number, maxRadius: number, color: string, duration = 0.34) {
    const sw = this.shockwaves[this.shockwaveCursor];
    this.shockwaveCursor = (this.shockwaveCursor + 1) % PixelVfxEngine.MAX_SHOCKWAVES;
    sw.active = true;
    sw.x = x;
    sw.y = y;
    sw.radius = 4;
    sw.maxRadius = maxRadius;
    sw.color = color;
    sw.life = duration;
    sw.maxLife = duration;
  }

  public spawnDecal(x: number, y: number, kind: DecalKind, duration = 4.2) {
    const dc = this.decals[this.decalCursor];
    this.decalCursor = (this.decalCursor + 1) % PixelVfxEngine.MAX_DECALS;
    dc.active = true;
    dc.x = x;
    dc.y = y;
    dc.kind = kind;
    dc.life = duration;
    dc.maxLife = duration;
    dc.seed = ((x * 73 + y * 37) | 0) & 255;
  }

  public update(dt: number) {
    for (let i = 0; i < PixelVfxEngine.MAX_PARTICLES; i++) {
      const pt = this.particles[i];
      if (!pt.active) continue;
      pt.life -= dt;
      if (pt.life <= 0) {
        pt.active = false;
        continue;
      }
      pt.vy += pt.gravity * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
    }

    for (let i = 0; i < PixelVfxEngine.MAX_SLASHES; i++) {
      const sl = this.slashes[i];
      if (!sl.active) continue;
      sl.life -= dt;
      if (sl.life <= 0) sl.active = false;
    }

    for (let i = 0; i < PixelVfxEngine.MAX_SHOCKWAVES; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      sw.life -= dt;
      if (sw.life <= 0) {
        sw.active = false;
        continue;
      }
      const prog = 1 - sw.life / sw.maxLife;
      sw.radius = 4 + (sw.maxRadius - 4) * prog;
    }

    for (let i = 0; i < PixelVfxEngine.MAX_DECALS; i++) {
      const dc = this.decals[i];
      if (!dc.active) continue;
      dc.life -= dt;
      if (dc.life <= 0) dc.active = false;
    }
  }

  public renderDecals(ctx: CanvasRenderingContext2D, globalTime: number) {
    const prevAlpha = ctx.globalAlpha;
    for (let i = 0; i < PixelVfxEngine.MAX_DECALS; i++) {
      const dc = this.decals[i];
      if (!dc.active) continue;

      const fade = Math.min(1, dc.life / Math.min(1.0, dc.maxLife * 0.4));
      const dx = dc.x | 0;
      const dy = dc.y | 0;
      const pulse = ((globalTime * 8 + dc.seed) | 0) % 2;

      ctx.globalAlpha = 0.72 * fade;
      if (dc.kind === 'ember') {
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(dx - 8, dy - 4, 16, 8);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(dx - 6 + pulse, dy - 2, 5, 3);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(dx + 1 - pulse, dy - 1, 3, 2);
      } else if (dc.kind === 'frost') {
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(dx - 8, dy - 5, 16, 10);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(dx - 7, dy - 1, 14, 2);
        ctx.fillRect(dx - 1, dy - 6, 2, 12);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(dx - 3 + pulse, dy - 3, 2, 2);
      } else if (dc.kind === 'lightning') {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(dx - 9, dy - 4, 18, 8);
        ctx.fillStyle = pulse === 0 ? '#38bdf8' : '#fef08a';
        ctx.fillRect(dx - 8, dy - 1, 6, 2);
        ctx.fillRect(dx - 2, dy + 1, 5, 2);
        ctx.fillRect(dx + 3, dy - 2, 5, 2);
      } else if (dc.kind === 'void') {
        ctx.fillStyle = '#2e1065';
        ctx.fillRect(dx - 9, dy - 5, 18, 10);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(dx - 5, dy - 2 + pulse, 10, 4);
      } else {
        ctx.fillStyle = '#365314';
        ctx.fillRect(dx - 8, dy - 4, 16, 8);
        ctx.fillStyle = '#a3e635';
        ctx.fillRect(dx - 4 + pulse, dy - 2, 3, 2);
        ctx.fillRect(dx + 2, dy, 3, 2);
      }
    }
    ctx.globalAlpha = prevAlpha;
  }

  public renderSlashes(ctx: CanvasRenderingContext2D) {
    const prevComp = ctx.globalCompositeOperation;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < PixelVfxEngine.MAX_SLASHES; i++) {
      const sl = this.slashes[i];
      if (!sl.active) continue;
      const prog = 1 - sl.life / sl.maxLife;
      const frameIdx = prog < 0.34 ? 0 : prog < 0.68 ? 1 : 2;
      const stamp = this.slashCache[sl.stage][frameIdx];

      ctx.save();
      ctx.globalAlpha = Math.max(0.15, 1 - prog * 0.75);
      ctx.translate(sl.x | 0, sl.y | 0);
      ctx.rotate(sl.angle);
      if (sl.combo === 1) ctx.scale(1, -1);
      ctx.drawImage(stamp, -28, -28);
      ctx.restore();
    }

    ctx.globalAlpha = prevAlpha;
    ctx.globalCompositeOperation = prevComp;
  }

  public renderParticlesAndWaves(ctx: CanvasRenderingContext2D) {
    const prevAlpha = ctx.globalAlpha;
    const prevComp = ctx.globalCompositeOperation;

    // 1. Expanding Pixel Shockwave Rings
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < PixelVfxEngine.MAX_SHOCKWAVES; i++) {
      const sw = this.shockwaves[i];
      if (!sw.active) continue;
      const alpha = Math.max(0, sw.life / sw.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = sw.color;

      const cx = sw.x | 0;
      const cy = sw.y | 0;
      const r = sw.radius | 0;
      // Draw crisp 16-segment pixel ring without costly stroke arcs or shadowBlur
      const segments = 16;
      for (let s = 0; s < segments; s++) {
        const a = (Math.PI * 2 * s) / segments;
        const px = (cx + Math.cos(a) * r) | 0;
        const py = (cy + Math.sin(a) * r) | 0;
        ctx.fillRect(px - 1, py - 1, 2, 2);
      }
    }

    // 2. Pooled Particles (batched by integer coords)
    for (let i = 0; i < PixelVfxEngine.MAX_PARTICLES; i++) {
      const pt = this.particles[i];
      if (!pt.active) continue;
      ctx.globalCompositeOperation = pt.additive ? 'lighter' : 'source-over';
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(((pt.x - pt.size / 2) | 0), ((pt.y - pt.size / 2) | 0), pt.size, pt.size);
    }

    ctx.globalCompositeOperation = prevComp;
    ctx.globalAlpha = prevAlpha;
  }
}
