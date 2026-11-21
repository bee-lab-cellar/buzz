import { OmniverseSpritePack, drawLivingHeroDetails } from './spritesEngine';
import { getBossSprite } from './bossSprites';
import { SpriteBank } from './sprites';

interface ArenaFighter {
  id: string;
  name: string;
  team: 'left' | 'right';
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  facing: 'left' | 'right';
  hp: number;
  maxHp: number;
  attackTimer: number;
  attackCooldown: number;
  dodgeTimer: number;
  dodgeCooldown: number;
  hitFlash: number;
  size: number;
  role: 'nyx' | 'king_leo' | 'fenrir' | 'bahamut' | 'dog_knight';
}

interface ArenaSlashArc {
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  coreColor: string;
  life: number;
  maxLife: number;
}

interface ArenaAfterimage {
  x: number;
  y: number;
  facing: 'left' | 'right';
  role: ArenaFighter['role'];
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ArenaFloatingCallout {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  scale: number;
  life: number;
  maxLife: number;
}

interface ArenaParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface ArenaBolt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: 'left' | 'right';
  color: string;
  coreColor: string;
  life: number;
}

export class TitleArenaSimulator {
  private fighters: ArenaFighter[] = [];
  private slashes: ArenaSlashArc[] = [];
  private afterimages: ArenaAfterimage[] = [];
  private callouts: ArenaFloatingCallout[] = [];
  private particles: ArenaParticle[] = [];
  private bolts: ArenaBolt[] = [];
  private simTime = 0;
  private calloutCycle = 0;

  constructor() {
    this.resetFighters();
  }

  public resetFighters() {
    this.fighters = [
      {
        id: 'nyx',
        name: 'Archmage Nyx',
        team: 'left',
        x: 245,
        y: 128,
        vx: 0,
        vy: 0,
        baseX: 255,
        baseY: 124,
        facing: 'right',
        hp: 2400,
        maxHp: 2400,
        attackTimer: 0,
        attackCooldown: 0.25,
        dodgeTimer: 0,
        dodgeCooldown: 1.1,
        hitFlash: 0,
        size: 26,
        role: 'nyx',
      },
      {
        id: 'king_leo',
        name: 'Lion King Leo',
        team: 'left',
        x: 228,
        y: 178,
        vx: 0,
        vy: 0,
        baseX: 242,
        baseY: 178,
        facing: 'right',
        hp: 3200,
        maxHp: 3200,
        attackTimer: 0,
        attackCooldown: 0.45,
        dodgeTimer: 0,
        dodgeCooldown: 1.5,
        hitFlash: 0,
        size: 32,
        role: 'king_leo',
      },
      {
        id: 'fenrir',
        name: 'Wolf-King Fenrir',
        team: 'right',
        x: 356,
        y: 132,
        vx: 0,
        vy: 0,
        baseX: 352,
        baseY: 130,
        facing: 'left',
        hp: 3200,
        maxHp: 3200,
        attackTimer: 0,
        attackCooldown: 0.35,
        dodgeTimer: 0,
        dodgeCooldown: 1.3,
        hitFlash: 0,
        size: 32,
        role: 'fenrir',
      },
      {
        id: 'bahamut',
        name: 'Ignis-Bahamut',
        team: 'right',
        x: 408,
        y: 108,
        vx: 0,
        vy: 0,
        baseX: 404,
        baseY: 106,
        facing: 'left',
        hp: 5000,
        maxHp: 5000,
        attackTimer: 0,
        attackCooldown: 0.7,
        dodgeTimer: 0,
        dodgeCooldown: 2.2,
        hitFlash: 0,
        size: 50,
        role: 'bahamut',
      },
      {
        id: 'dog_knight_1',
        name: 'Direfang Vanguard',
        team: 'right',
        x: 376,
        y: 186,
        vx: 0,
        vy: 0,
        baseX: 374,
        baseY: 186,
        facing: 'left',
        hp: 1800,
        maxHp: 1800,
        attackTimer: 0,
        attackCooldown: 0.55,
        dodgeTimer: 0,
        dodgeCooldown: 1.7,
        hitFlash: 0,
        size: 24,
        role: 'dog_knight',
      },
    ];
  }

  public update(dt: number) {
    this.simTime += dt;

    for (const f of this.fighters) {
      if (f.attackTimer > 0) f.attackTimer = Math.max(0, f.attackTimer - dt);
      if (f.attackCooldown > 0) f.attackCooldown = Math.max(0, f.attackCooldown - dt);
      if (f.dodgeTimer > 0) f.dodgeTimer = Math.max(0, f.dodgeTimer - dt);
      if (f.dodgeCooldown > 0) f.dodgeCooldown = Math.max(0, f.dodgeCooldown - dt);
      if (f.hitFlash > 0) f.hitFlash = Math.max(0, f.hitFlash - dt);

      // Find nearest opponent
      const opponents = this.fighters.filter((o) => o.team !== f.team);
      const target = opponents.reduce((best, curr) =>
        Math.hypot(curr.x - f.x, curr.y - f.y) < Math.hypot(best.x - f.x, best.y - f.y) ? curr : best
      );

      const dx = target.x - f.x;
      const dy = target.y - f.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      f.facing = dx >= 0 ? 'right' : 'left';

      // Periodic autonomous dodge-roll with afterimage trails
      if (f.dodgeCooldown <= 0 && dist < 85) {
        f.dodgeCooldown = 1.6 + Math.random() * 1.1;
        f.dodgeTimer = 0.24;
        const dashSign = f.team === 'left' ? 1 : -1;
        f.vx = dashSign * 145;
        f.vy = (Math.random() - 0.5) * 90;
        if (f.team === 'left' && Math.random() < 0.55) {
          this.spawnCallout(f.x, f.y - 18, '⚡ PERFECT DODGE!', '#38bdf8', 1.12);
        }
      }

      if (f.dodgeTimer > 0 && Math.floor(this.simTime * 45) !== Math.floor((this.simTime - dt) * 45)) {
        this.afterimages.push({
          x: f.x,
          y: f.y,
          facing: f.facing,
          role: f.role,
          size: f.size,
          color: f.team === 'left' ? '#38bdf8' : '#f43f5e',
          life: 0.22,
          maxLife: 0.22,
        });
      }

      // Orbit / skirmish around the right-center battle zone (x: 215..435, y: 78..215)
      const idealDist = f.role === 'bahamut' ? 54 : 30;
      if (f.dodgeTimer <= 0) {
        const pullToTargetX = dist > idealDist ? (dx / dist) * 58 : -((dx / dist) * 32);
        const pullToTargetY = dist > idealDist ? (dy / dist) * 46 : Math.sin(this.simTime * 3.5 + f.baseY) * 28;
        const anchorX = (f.baseX - f.x) * 0.45;
        const anchorY = (f.baseY - f.y) * 0.45;
        f.vx += (pullToTargetX + anchorX - f.vx) * Math.min(1, dt * 6);
        f.vy += (pullToTargetY + anchorY - f.vy) * Math.min(1, dt * 6);
      }

      f.x = Math.max(195, Math.min(448, f.x + f.vx * dt));
      f.y = Math.max(68, Math.min(220, f.y + f.vy * dt));

      // Execute melee / arcane slash combos
      if (f.attackCooldown <= 0 && dist <= 72) {
        f.attackCooldown = f.role === 'nyx' ? 0.42 : f.role === 'king_leo' ? 0.52 : 0.62;
        f.attackTimer = 0.22;
        const ang = Math.atan2(dy, dx);
        const isLeft = f.team === 'left';
        const slashColor =
          f.role === 'nyx'
            ? this.calloutCycle % 2 === 0
              ? '#4ade80'
              : '#38bdf8'
            : f.role === 'king_leo'
            ? '#fde047'
            : f.role === 'bahamut'
            ? '#f97316'
            : '#f43f5e';

        this.slashes.push({
          x: f.x + Math.cos(ang) * 14,
          y: f.y + Math.sin(ang) * 10,
          angle: ang,
          radius: f.role === 'king_leo' || f.role === 'bahamut' ? 28 : 24,
          color: slashColor,
          coreColor: '#ffffff',
          life: 0.18,
          maxLife: 0.18,
        });

        // Also fire crescent / arcane projectile bolt
        if (f.role === 'nyx' || f.role === 'bahamut') {
          this.bolts.push({
            x: f.x + Math.cos(ang) * 12,
            y: f.y + Math.sin(ang) * 8,
            vx: Math.cos(ang) * 165,
            vy: Math.sin(ang) * 165,
            team: f.team,
            color: slashColor,
            coreColor: '#ffffff',
            life: 0.75,
          });
        }

        // Apply hit reaction & damage callouts
        target.hitFlash = 0.14;
        target.vx += Math.cos(ang) * 52;
        target.vy += Math.sin(ang) * 36;
        const dmg = isLeft
          ? [124, 248, 380, 512][this.calloutCycle % 4]
          : [96, 142, 210][this.calloutCycle % 3];
        target.hp -= dmg;
        if (target.hp <= target.maxHp * 0.2) {
          target.hp = target.maxHp;
        }

        this.spawnBurst(target.x, target.y, slashColor, 9, 85);

        if (isLeft) {
          this.calloutCycle++;
          if (this.calloutCycle % 4 === 0) {
            this.spawnCallout(target.x, target.y - 18, `${dmg}! ARCANE CRIT!`, '#4ade80', 1.18);
          } else if (this.calloutCycle % 4 === 2) {
            this.spawnCallout(target.x, target.y - 18, `${dmg}! STARLIGHT CLEAVE!`, '#fde047', 1.18);
          } else {
            this.spawnCallout(target.x, target.y - 14, `${dmg}!`, '#fef08a', 1.05);
          }
        } else {
          this.spawnCallout(target.x, target.y - 14, `${dmg}!`, '#fda4af', 0.95);
        }
      }
    }

    // Update bolts
    for (const b of this.bolts) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      for (const f of this.fighters) {
        if (f.team !== b.team && Math.hypot(f.x - b.x, f.y - b.y) <= f.size * 0.5) {
          b.life = 0;
          f.hitFlash = 0.12;
          this.spawnBurst(b.x, b.y, b.color, 7, 70);
          break;
        }
      }
    }
    this.bolts = this.bolts.filter((b) => b.life > 0);

    // Update slashes
    for (const s of this.slashes) s.life -= dt;
    this.slashes = this.slashes.filter((s) => s.life > 0);

    // Update afterimages
    for (const a of this.afterimages) a.life -= dt;
    this.afterimages = this.afterimages.filter((a) => a.life > 0);

    // Update particles
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    // Update floating callouts
    for (const c of this.callouts) {
      c.y += c.vy * dt;
      c.life -= dt;
    }
    this.callouts = this.callouts.filter((c) => c.life > 0);
  }

  private spawnBurst(x: number, y: number, color: string, count: number, speed: number) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (0.35 + Math.random() * 0.65) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: Math.random() < 0.4 ? 3 : 2,
        life: 0.28 + Math.random() * 0.18,
        maxLife: 0.42,
      });
    }
  }

  private spawnCallout(x: number, y: number, text: string, color: string, scale = 1) {
    if (this.callouts.length > 10) {
      this.callouts.shift();
    }
    this.callouts.push({
      x: x + (Math.random() - 0.5) * 14,
      y,
      vy: -26,
      text,
      color,
      scale,
      life: 0.85,
      maxLife: 0.85,
    });
  }

  public render(
    ctx: CanvasRenderingContext2D,
    sprites: SpriteBank,
    omniverseSprites: OmniverseSpritePack,
    _logicalW: number,
    _logicalH: number
  ) {
    ctx.save();

    // Subtle Starlight Battle Ring on the right-center arena floor
    const ringX = 324;
    const ringY = 148;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(ringX, ringY, 118, 64, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Render Dodge-Roll Afterimages
    for (const a of this.afterimages) {
      ctx.save();
      ctx.globalAlpha = (a.life / a.maxLife) * 0.45;
      const spr = this.resolveFighterSprite(a.role, sprites, omniverseSprites, 0);
      this.drawFlipped(ctx, spr, a.x, a.y, a.facing === 'left', a.size, a.size);
      ctx.restore();
    }

    // Sort fighters by Y for clean depth
    const sorted = [...this.fighters].sort((a, b) => a.y - b.y);
    const frameStep = Math.floor(this.simTime * 7) % 2;

    for (const f of sorted) {
      const bob = Math.sin(this.simTime * 6.5 + f.baseX) * 1.6;
      const spr = this.resolveFighterSprite(f.role, sprites, omniverseSprites, frameStep);

      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.fillRect(Math.round(f.x - f.size * 0.34), Math.round(f.y + f.size * 0.36), Math.round(f.size * 0.68), 3);

      // Team aura ring
      ctx.strokeStyle = f.team === 'left' ? 'rgba(74, 222, 128, 0.45)' : 'rgba(244, 63, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(f.x, f.y + 4, f.size * 0.48, 0, Math.PI * 2);
      ctx.stroke();

      const flipX = f.role === 'bahamut' || f.role === 'dog_knight' ? f.facing === 'right' : f.facing === 'left';
      this.drawFlipped(ctx, spr, f.x, f.y + bob, flipX, f.size, f.size);

      if (f.role === 'nyx' || f.role === 'king_leo' || f.role === 'fenrir') {
        drawLivingHeroDetails(
          ctx,
          f.role,
          f.x,
          f.y + bob,
          f.facing,
          true,
          f.attackTimer,
          this.simTime,
          f.baseX * 0.03
        );
      }

      // Orbiting Starlight Gems around Nyx
      if (f.role === 'nyx') {
        for (let i = 0; i < 5; i++) {
          const ang = this.simTime * 3.8 + (i * Math.PI * 2) / 5;
          const gx = Math.round(f.x + Math.cos(ang) * 13);
          const gy = Math.round(f.y - 4 + bob + Math.sin(ang) * 10);
          ctx.fillStyle = ['#4ade80', '#38bdf8', '#fde047', '#f472b6', '#a855f7'][i];
          ctx.fillRect(gx, gy, 2, 2);
        }
      }

      // Fighter mini HP bar
      const bw = 20;
      const bx = Math.round(f.x - bw / 2);
      const by = Math.round(f.y - f.size * 0.56 - 5);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(bx - 1, by - 1, bw + 2, 3);
      ctx.fillStyle = f.team === 'left' ? '#4ade80' : '#f43f5e';
      ctx.fillRect(bx, by, Math.max(2, Math.round((f.hp / f.maxHp) * bw)), 1.5);
    }

    // Render Neon Green / Gold / Cyan Crescent Slash Arcs
    for (const s of this.slashes) {
      const prog = 1 - s.life / s.maxLife;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.globalAlpha = Math.min(1, (s.life / s.maxLife) * 1.4);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 4.5 - prog * 2;
      ctx.beginPath();
      ctx.arc(0, 0, s.radius, -1.05, 1.05);
      ctx.stroke();

      ctx.strokeStyle = s.coreColor;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(1.5, 0, s.radius * 0.88, -0.85, 0.85);
      ctx.stroke();
      ctx.restore();
    }

    // Render Bolts
    for (const b of this.bolts) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = b.coreColor;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Sparks & Particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Render Floating Damage Numbers & Combat Callouts
    for (const c of this.callouts) {
      ctx.globalAlpha = Math.min(1, (c.life / c.maxLife) * 1.35);
      ctx.font = `bold ${Math.round(8 * c.scale)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#05070f';
      ctx.fillText(c.text, Math.round(c.x) + 1, Math.round(c.y) + 1);
      ctx.fillStyle = c.color;
      ctx.fillText(c.text, Math.round(c.x), Math.round(c.y));
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  private resolveFighterSprite(
    role: ArenaFighter['role'],
    sprites: SpriteBank,
    omniverseSprites: OmniverseSpritePack,
    frameStep: number
  ): HTMLCanvasElement {
    if (role === 'nyx') {
      const nyx = sprites.pipByFur.starlight?.[1] ?? sprites.pip[1];
      return frameStep === 0 ? nyx.walk : nyx.twitch;
    }
    if (role === 'king_leo') {
      const leo = omniverseSprites.heroes.king_leo;
      return frameStep === 0 ? leo.walk : leo.walkB ?? leo.idle;
    }
    if (role === 'fenrir') {
      const fen = omniverseSprites.heroes.fenrir;
      return frameStep === 0 ? fen.walk : fen.walkB ?? fen.idle;
    }
    if (role === 'bahamut') {
      return getBossSprite('boss_bahamut_p3', frameStep);
    }
    return sprites.enemies.shadow_wolf;
  }

  private drawFlipped(
    ctx: CanvasRenderingContext2D,
    img: HTMLCanvasElement,
    x: number,
    y: number,
    flipX: boolean,
    w: number,
    h: number
  ) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(img, -Math.round(w / 2), -Math.round(h / 2), w, h);
    ctx.restore();
  }
}
