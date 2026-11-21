import { audio } from './audio';
import { AlliedCatSoldier, BiomeFeature, BiomeFeatureKind, BiomeId, Enemy, PlayerState } from './types';
import { PixelVfxEngine } from './vfx';

export interface BiomeMechanicsCallbacks {
  vfx: PixelVfxEngine;
  damagePlayer: (rawDmg: number, sx: number, sy: number) => void;
  damageEnemy: (
    enemy: Enemy,
    rawDmg: number,
    critChance: number,
    dirX: number,
    dirY: number,
    forceCrit?: boolean,
    staggerBonus?: number
  ) => void;
  spawnParticles: (x: number, y: number, color: string, count: number, speed: number) => void;
  spawnFloatingText: (x: number, y: number, text: string, color: string, scale?: number) => void;
  pushToast: (text: string, accent: 'gold' | 'cyan' | 'emerald' | 'amber') => void;
  shake: (duration: number, intensity: number) => void;
  giveGold: (amount: number) => void;
  boostMorale: (amount: number) => void;
  moveWithCollision: (ent: { x: number; y: number; width: number; height: number }, dx: number, dy: number) => void;
}

export function generateBiomeFeaturesForAct(
  actNum: number,
  biomeId: BiomeId,
  role: string,
  findDry: (px: number, py: number) => { x: number; y: number },
  nightmareMode: boolean
): BiomeFeature[] {
  if (role === 'sanctuary' || role === 'final_boss') return [];
  const dmg = Math.round((10 + actNum * 0.75) * (nightmareMode ? 1.35 : 1));
  const features: BiomeFeature[] = [];

  const mk = (
    idx: number,
    kind: BiomeFeatureKind,
    px: number,
    py: number,
    overrides: Partial<BiomeFeature> = {}
  ): BiomeFeature => {
    const pos = kind === 'ferry_barge' ? { x: px, y: py } : findDry(px, py);
    return {
      id: `bf_${actNum}_${idx}_${kind}`,
      kind,
      x: pos.x,
      y: pos.y,
      homeX: pos.x,
      homeY: pos.y,
      radius: 14,
      timer: (idx * 0.85) % 4,
      cooldown: 0,
      active: false,
      triggered: false,
      dirX: idx % 2 === 0 ? 1 : -1,
      dirY: 0,
      angle: idx * 1.4,
      damage: dmg,
      ...overrides,
    };
  };

  switch (biomeId) {
    case 1: // Acts 1-5 Whispering Woods: Tripwire Log-Swingers & Leaf Pitfalls
      features.push(
        mk(0, 'tripwire_log', 236, 160, { radius: 18, damage: Math.round(dmg * 3.4) }),
        mk(1, 'leaf_pitfall', 332, 224, { radius: 15 }),
        mk(2, 'tripwire_log', 408, 168, { radius: 18, damage: Math.round(dmg * 3.4) })
      );
      break;
    case 2: // Acts 6-10 Bramble Ravine: Bear Traps & Rolling Boulders
      features.push(
        mk(0, 'bear_trap', 224, 152, { radius: 13 }),
        mk(1, 'bear_trap', 344, 232, { radius: 13 }),
        mk(2, 'rolling_boulder', 288, 120, { dirX: 0, dirY: 1, radius: 14 })
      );
      break;
    case 3: // Acts 11-15 Glow-Shroom Grotto: Bouncy Mushrooms & Puffball Spores
      features.push(
        mk(0, 'bouncy_mushroom', 216, 192, { radius: 15 }),
        mk(1, 'puffball_spore', 320, 152, { radius: 16 }),
        mk(2, 'bouncy_mushroom', 416, 192, { radius: 15 })
      );
      break;
    case 4: // Acts 16-20 Crimson Autumn Canopy: High-Wind Gusts & Sawmill Buzzsaws
      features.push(
        mk(0, 'wind_gust', 304, 184, { radius: 140, dirX: 0, dirY: 1 }),
        mk(1, 'buzzsaw', 248, 144, { radius: 13, dirX: 1, dirY: 0 }),
        mk(2, 'buzzsaw', 376, 232, { radius: 13, dirX: -1, dirY: 0 })
      );
      break;
    case 5: // Acts 21-25 Frostpeak Caverns: Cracking Thin-Ice Tiles
      features.push(
        mk(0, 'cracking_ice', 232, 160, { radius: 15 }),
        mk(1, 'cracking_ice', 296, 192, { radius: 15 }),
        mk(2, 'cracking_ice', 376, 216, { radius: 15 })
      );
      break;
    case 6: // Acts 26-30 Embercrag Mines: Redirectable Explosive Minecarts
      features.push(
        mk(0, 'minecart', 208, 144, { radius: 14, dirX: 1, dirY: 0, damage: Math.round(dmg * 4.5) }),
        mk(1, 'minecart', 400, 236, { radius: 14, dirX: -1, dirY: 0, damage: Math.round(dmg * 4.5) })
      );
      break;
    case 7: // Acts 31-35 Cursed Blight Marsh: Quicksand Whirlpools
      features.push(
        mk(0, 'whirlpool', 240, 188, { radius: 38 }),
        mk(1, 'whirlpool', 392, 188, { radius: 38 })
      );
      break;
    case 8: {
      // Acts 36-39 Astral Bamboo Grove: Paired Teleportation Warp-Mirrors
      const a = findDry(176, 128);
      const b = findDry(424, 240);
      features.push(
        mk(0, 'warp_mirror', a.x, a.y, { radius: 14, pairX: b.x, pairY: b.y }),
        mk(1, 'warp_mirror', b.x, b.y, { radius: 14, pairX: a.x, pairY: a.y })
      );
      break;
    }
    case 9: // Acts 42-46 Border Trenches: Blinking Proximity Landmines
      features.push(
        mk(0, 'landmine', 224, 160, { radius: 14, damage: Math.round(dmg * 2.2) }),
        mk(1, 'landmine', 312, 224, { radius: 14, damage: Math.round(dmg * 2.2) }),
        mk(2, 'landmine', 408, 168, { radius: 14, damage: Math.round(dmg * 2.2) })
      );
      break;
    case 10: // Acts 47-51 Naval Bridgehead: Moving Ferry Barges
      features.push(
        mk(0, 'ferry_barge', 200, 144, { radius: 18, dirX: 0, dirY: 1 }),
        mk(1, 'ferry_barge', 404, 224, { radius: 18, dirX: 0, dirY: -1 })
      );
      break;
    case 11: // Acts 52-56 Howling Canyon: Cliffside Rockslide Levers
      features.push(
        mk(0, 'rockslide_lever', 220, 136, { radius: 16, damage: Math.round(dmg * 4.0) }),
        mk(1, 'rockslide_lever', 384, 240, { radius: 16, damage: Math.round(dmg * 4.0) })
      );
      break;
    case 12: // Acts 57-61 Sky-Galleon Ridge: Propeller Wind-Turbines & Updrafts
      features.push(
        mk(0, 'wind_turbine', 184, 184, { radius: 44, dirX: 1, dirY: 0 }),
        mk(1, 'updraft_pad', 328, 188, { radius: 16 })
      );
      break;
    case 13: // Acts 62-66 Frostbite Tundra: Warm Campfire Braziers (Blizzard Cold-Meter!)
      features.push(
        mk(0, 'campfire_brazier', 184, 184, { radius: 48 }),
        mk(1, 'campfire_brazier', 368, 184, { radius: 48 })
      );
      break;
    case 14: // Acts 67-71 Iron-Collar Foundry: Conveyor Belts & Hydraulic Crushers
      features.push(
        mk(0, 'conveyor_belt', 256, 144, { radius: 28, dirX: 1, dirY: 0 }),
        mk(1, 'crusher_piston', 344, 220, { radius: 18, damage: Math.round(dmg * 1.9) }),
        mk(2, 'conveyor_belt', 392, 144, { radius: 28, dirX: -1, dirY: 0 })
      );
      break;
    case 15: // Acts 72-76 Shadow-Fang Fortress: Golden Lion Battering Ram Payload Escort!
      features.push(
        mk(0, 'battering_ram', 132, 188, { radius: 22, progress: 0, dirX: 1, dirY: 0, damage: Math.round(dmg * 5.0) })
      );
      break;
    case 16: // Acts 77-80 Obsidian War-Palace: Chandelier Drop Traps & Electric Floor Tiles
      features.push(
        mk(0, 'chandelier_drop', 264, 168, { radius: 22, damage: Math.round(dmg * 4.2) }),
        mk(1, 'electric_tile', 360, 224, { radius: 18 }),
        mk(2, 'chandelier_drop', 424, 160, { radius: 22, damage: Math.round(dmg * 4.2) })
      );
      break;
    case 17: // Acts 83-87 Scorched Courtyard: Smashable Water Barrels
      features.push(
        mk(0, 'water_barrel', 216, 152, { radius: 15 }),
        mk(1, 'water_barrel', 368, 224, { radius: 15 })
      );
      break;
    case 18: // Acts 88-92 Ashen Gold-Vaults: Cursed Greed-Chests & Gold Laser Beams
      features.push(
        mk(0, 'greed_chest', 264, 136, { radius: 15 }),
        mk(1, 'gold_laser', 344, 188, { radius: 26, angle: 0 })
      );
      break;
    case 19: // Acts 93-97 Storm-Scale Sky-Bridges: Chain-Lightning Rods & Moving Tornadoes
      features.push(
        mk(0, 'lightning_rod', 224, 156, { radius: 16, damage: Math.round(dmg * 3.5) }),
        mk(1, 'lightning_rod', 356, 212, { radius: 16, damage: Math.round(dmg * 3.5) }),
        mk(2, 'tornado', 304, 188, { radius: 18, dirX: 1, dirY: 0.6 })
      );
      break;
    case 20: // Acts 98-102 Frozen Dragon-Graveyard: Dragonfire Braziers & Cracking Ice
      features.push(
        mk(0, 'campfire_brazier', 208, 184, { radius: 46 }),
        mk(1, 'cracking_ice', 328, 160, { radius: 15 }),
        mk(2, 'campfire_brazier', 424, 184, { radius: 46 })
      );
      break;
    case 21: // Acts 103-107 Venom-Scale Caldera: Rising/Falling Acid Tide Cycle
      features.push(
        mk(0, 'acid_tide_zone', 256, 204, { radius: 34 }),
        mk(1, 'acid_tide_zone', 384, 168, { radius: 34 })
      );
      break;
    case 22: // Acts 108-112 Astral Star-Forge: Time-Slow Chrono Domes
      features.push(
        mk(0, 'chrono_dome', 240, 188, { radius: 38 }),
        mk(1, 'chrono_dome', 392, 188, { radius: 38 })
      );
      break;
    case 23: // Acts 113-117 Abyssal Dragon Citadel: Rotating Fire-Wall Spinners (Firebars!)
      features.push(
        mk(0, 'firebar', 248, 188, { radius: 42 }),
        mk(1, 'firebar', 384, 188, { radius: 42, angle: Math.PI })
      );
      break;
    case 24: // Acts 118-120 Shattered Sky-Spire: Updraft Wind Geysers
      features.push(
        mk(0, 'updraft_pad', 224, 184, { radius: 18 }),
        mk(1, 'updraft_pad', 384, 184, { radius: 18 })
      );
      break;
    default:
      break;
  }

  // Pair biome flavor with distinct act % 6 layout-signature mechanics on standard/miniboss maps
  if (role !== 'boss') {
    const layoutType = actNum % 6;
    const hasKind = (k: BiomeFeatureKind) => features.some((f) => f.kind === k);
    if (layoutType === 1) {
      // Winding S-Canyon: Falling boulders & tripwire logs
      if (!hasKind('rolling_boulder')) {
        features.push(mk(10, 'rolling_boulder', 296, 136, { dirX: 0, dirY: 1, radius: 14 }));
      }
      if (!hasKind('tripwire_log')) {
        features.push(mk(11, 'tripwire_log', 196, 184, { radius: 17, damage: Math.round(dmg * 3.2) }));
      }
    } else if (layoutType === 2) {
      // Twin-Bridge River Crossing: Tactical water barrels / warp mirror shortcuts
      if (!hasKind('water_barrel')) {
        features.push(mk(10, 'water_barrel', 296, 188, { radius: 15 }));
      }
    } else if (layoutType === 3) {
      // 3-Room Dungeon Chamber Labyrinth: Spinning firebar, bear trap & bouncy mushroom
      if (!hasKind('firebar')) {
        features.push(mk(10, 'firebar', 304, 188, { radius: 36 }));
      }
      if (!hasKind('bear_trap')) {
        features.push(mk(11, 'bear_trap', 164, 148, { radius: 13 }));
      }
    } else if (layoutType === 4) {
      // Central Island Ring w/ 4 Bridges: Whirlpools & crusher piston
      if (!hasKind('crusher_piston')) {
        features.push(mk(10, 'crusher_piston', 304, 188, { radius: 17, damage: Math.round(dmg * 1.8) }));
      }
      if (!hasKind('cracking_ice') && (biomeId === 5 || biomeId === 13 || biomeId === 20)) {
        features.push(mk(11, 'cracking_ice', 304, 140, { radius: 15 }));
      }
    } else if (layoutType === 5) {
      // Split-Lane Minecart / Conveyor Trench: Minecarts, conveyor belts & proximity landmines
      if (!hasKind('minecart')) {
        features.push(mk(10, 'minecart', 248, 108, { radius: 14, dirX: 1, dirY: 0, damage: Math.round(dmg * 4.2) }));
      }
      if (!hasKind('conveyor_belt')) {
        features.push(mk(11, 'conveyor_belt', 344, 268, { radius: 26, dirX: -1, dirY: 0 }));
      }
      if (!hasKind('landmine')) {
        features.push(mk(12, 'landmine', 224, 268, { radius: 13, damage: Math.round(dmg * 2.0) }));
      }
    } else if (layoutType === 0) {
      // Octagon Arena w/ 4 Pillars: Chandelier drops & electric floor tiles
      if (!hasKind('chandelier_drop')) {
        features.push(mk(10, 'chandelier_drop', 304, 144, { radius: 20, damage: Math.round(dmg * 4.0) }));
      }
      if (!hasKind('electric_tile')) {
        features.push(mk(11, 'electric_tile', 304, 232, { radius: 17 }));
      }
    }
  }

  return features;
}

export class BiomeMechanicsController {
  public features: BiomeFeature[] = [];
  public tundraCold = 0; // 0..100 for Frostbite Tundra (Biome 13)
  public acidTideLevel = 0; // 0..1 cycle every 12s for Venom Caldera (Biome 21)
  private acidTideTimer = 0;
  private coldTickTimer = 0;
  private warpCooldown = 0;

  public resetForAct(features: BiomeFeature[] = []) {
    this.features = features.map((f) => ({ ...f }));
    this.tundraCold = 0;
    this.acidTideLevel = 0;
    this.acidTideTimer = 0;
    this.coldTickTimer = 0;
    this.warpCooldown = 0;
  }

  public getEnemyTimeScale(ex: number, ey: number): number {
    for (const f of this.features) {
      if (f.kind === 'chrono_dome' && Math.hypot(ex - f.x, ey - f.y) <= f.radius) {
        return 0.42;
      }
    }
    return 1.0;
  }

  public getPlayerSpeedMultiplier(px: number, py: number): number {
    for (const f of this.features) {
      if (f.kind === 'chrono_dome' && Math.hypot(px - f.x, py - f.y) <= f.radius) {
        return 1.28;
      }
    }
    return 1.0;
  }

  public handlePlayerSlash(
    px: number,
    py: number,
    reach: number,
    enemies: Enemy[],
    cb: BiomeMechanicsCallbacks
  ) {
    for (const f of this.features) {
      if (f.triggered) continue;
      const dist = Math.hypot(f.x - px, f.y - py);
      if (dist > reach + f.radius + 10) continue;

      if (f.kind === 'tripwire_log') {
        f.triggered = true;
        audio.hitImpact(true);
        cb.shake(0.28, 3.8);
        cb.vfx.spawnShockwave(f.x, f.y, 62, '#d97706', 0.36);
        cb.spawnParticles(f.x, f.y, '#92400e', 24, 110);
        cb.spawnFloatingText(f.x, f.y - 16, '🪵 LOG-SWINGER CRUSH!', '#fbbf24', 1.2);
        for (const e of [...enemies]) {
          if (Math.hypot(e.x - f.x, e.y - f.y) <= 78) {
            cb.damageEnemy(e, f.damage, 60, 1, 0, true, 30);
          }
        }
      } else if (f.kind === 'minecart') {
        if (f.active) {
          this.detonateMinecart(f, enemies, cb);
        } else {
          f.active = true;
          f.cooldown = 1.4;
          let bestEnemy: Enemy | null = null;
          let bestDist = 280;
          for (const e of enemies) {
            const d = Math.hypot(e.x - f.x, e.y - f.y);
            if (d < bestDist) {
              bestDist = d;
              bestEnemy = e;
            }
          }
          if (bestEnemy) {
            const d = Math.max(1, bestDist);
            f.dirX = (bestEnemy.x - f.x) / d;
            f.dirY = (bestEnemy.y - f.y) / d;
          } else {
            const outD = Math.hypot(f.x - px, f.y - py);
            if (outD > 1) {
              f.dirX = (f.x - px) / outD;
              f.dirY = (f.y - py) / outD;
            }
          }
          audio.chestFanfare();
          cb.spawnParticles(f.x, f.y - 6, '#f97316', 10, 55);
          cb.spawnFloatingText(f.x, f.y - 14, '🔥 MINECART FUSE LIT!', '#f97316', 1.15);
        }
      } else if (f.kind === 'rockslide_lever') {
        f.triggered = true;
        audio.skyCrash();
        cb.shake(0.35, 4.5);
        cb.vfx.spawnShockwave(f.x + 36, f.y, 70, '#94a3b8', 0.4);
        cb.spawnParticles(f.x + 36, f.y, '#78716c', 30, 120);
        cb.spawnFloatingText(f.x, f.y - 18, '🪨 CLIFFSIDE ROCKSLIDE!', '#cbd5e1', 1.25);
        for (const e of [...enemies]) {
          if (Math.hypot(e.x - f.x, e.y - f.y) <= 135) {
            e.stunTimer = Math.max(e.stunTimer ?? 0, 2.5);
            cb.damageEnemy(e, f.damage, 50, 0, 1, true, 35);
          }
        }
      } else if (f.kind === 'chandelier_drop') {
        f.triggered = true;
        audio.skyCrash();
        cb.shake(0.32, 4.2);
        cb.vfx.spawnShockwave(f.x, f.y, 68, '#fde047', 0.38);
        cb.spawnParticles(f.x, f.y, '#e0f2fe', 28, 125);
        cb.spawnFloatingText(f.x, f.y - 18, '💎 CHANDELIER CRASH!', '#fde047', 1.25);
        for (const e of [...enemies]) {
          if (Math.hypot(e.x - f.x, e.y - f.y) <= 84) {
            e.stunTimer = Math.max(e.stunTimer ?? 0, 2.2);
            cb.damageEnemy(e, f.damage, 65, 0, 1, true, 32);
          }
        }
      } else if (f.kind === 'water_barrel') {
        f.triggered = true;
        audio.potionDrink();
        cb.vfx.spawnShockwave(f.x, f.y, 58, '#38bdf8', 0.35);
        cb.spawnParticles(f.x, f.y, '#7dd3fc', 26, 105);
        cb.spawnFloatingText(f.x, f.y - 16, '💧 WATER SPLASH · FIRES DOUSED!', '#38bdf8', 1.15);
        cb.boostMorale(10);
      } else if (f.kind === 'lightning_rod' && f.cooldown <= 0) {
        f.cooldown = 3.5;
        audio.laserBeam();
        cb.vfx.spawnShockwave(f.x, f.y, 54, '#38bdf8', 0.3);
        cb.spawnFloatingText(f.x, f.y - 16, '⚡ CHAIN LIGHTNING!', '#7dd3fc', 1.18);
        for (const other of this.features) {
          if (other.kind === 'lightning_rod' && other.id !== f.id) {
            cb.vfx.spawnShockwave(other.x, other.y, 48, '#38bdf8', 0.3);
            cb.spawnParticles(other.x, other.y, '#fde047', 16, 95);
          }
        }
        for (const e of [...enemies]) {
          if (Math.hypot(e.x - f.x, e.y - f.y) <= 135) {
            cb.damageEnemy(e, f.damage, 50, 0, 0, true, 24);
          }
        }
      } else if (f.kind === 'greed_chest') {
        f.triggered = true;
        audio.chestFanfare();
        cb.giveGold(75);
        cb.spawnParticles(f.x, f.y, '#fde047', 22, 95);
        cb.spawnFloatingText(f.x, f.y - 16, '🪙 +75G HOARD CHEST!', '#fde047', 1.18);
      } else if (f.kind === 'puffball_spore') {
        f.triggered = true;
        audio.hitImpact(false);
        cb.vfx.spawnShockwave(f.x, f.y, 44, '#a3e635', 0.3);
        cb.spawnParticles(f.x, f.y, '#a3e635', 18, 95);
        for (const e of [...enemies]) {
          if (Math.hypot(e.x - f.x, e.y - f.y) <= 56) {
            cb.damageEnemy(e, Math.round(f.damage * 1.8), 20, 0, 0, false, 15);
          }
        }
      }
    }
  }

  public handleProjectileHit(
    px: number,
    py: number,
    radius: number,
    enemies: Enemy[],
    cb: BiomeMechanicsCallbacks
  ): boolean {
    for (const f of this.features) {
      if (f.triggered || f.kind !== 'minecart') continue;
      if (Math.hypot(f.x - px, f.y - py) <= f.radius + radius + 6) {
        this.detonateMinecart(f, enemies, cb);
        return true;
      }
    }
    return false;
  }

  private detonateMinecart(f: BiomeFeature, enemies: Enemy[], cb: BiomeMechanicsCallbacks) {
    if (f.triggered) return;
    f.active = false;
    f.triggered = true;
    audio.skyCrash();
    cb.shake(0.36, 4.6);
    cb.vfx.spawnShockwave(f.x, f.y, 78, '#f97316', 0.42);
    cb.vfx.spawnShockwave(f.x, f.y, 44, '#fde047', 0.28);
    cb.spawnParticles(f.x, f.y, '#f97316', 22, 125);
    cb.spawnParticles(f.x, f.y, '#fde047', 14, 95);
    cb.spawnFloatingText(f.x, f.y - 16, '💥 MINECART BOOM!', '#fde047', 1.3);
    for (const e of [...enemies]) {
      const dist = Math.hypot(e.x - f.x, e.y - f.y);
      if (dist <= 86 + e.width * 0.35) {
        const kx = dist > 1 ? (e.x - f.x) / dist : f.dirX;
        const ky = dist > 1 ? (e.y - f.y) / dist : f.dirY;
        const dmgScale = dist <= 54 ? 1 : 0.75;
        cb.damageEnemy(e, Math.round(f.damage * dmgScale), 80, kx, ky, true, 36);
      }
    }
  }

  public update(
    dt: number,
    biomeId: BiomeId,
    player: PlayerState,
    enemies: Enemy[],
    allies: AlliedCatSoldier[],
    cb: BiomeMechanicsCallbacks
  ) {
    if (this.warpCooldown > 0) this.warpCooldown = Math.max(0, this.warpCooldown - dt);

    // Frostbite Tundra Cold-Meter (Acts 62-66)
    if (biomeId === 13) {
      const nearWarmBrazier = this.features.some(
        (f) => f.kind === 'campfire_brazier' && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius
      );
      if (nearWarmBrazier) {
        this.tundraCold = Math.max(0, this.tundraCold - 42 * dt);
        player.hp = Math.min(player.maxHp, player.hp + 2.5 * dt);
      } else {
        this.tundraCold = Math.min(100, this.tundraCold + 7.5 * dt);
        if (this.tundraCold >= 100) {
          this.coldTickTimer += dt;
          if (this.coldTickTimer >= 1.1) {
            this.coldTickTimer = 0;
            cb.damagePlayer(8, player.x, player.y);
            cb.spawnFloatingText(player.x, player.y - 16, '🥶 FROSTBITE! WARM AT BRAZIER!', '#7dd3fc', 1.0);
          }
        }
      }
    }

    // Venom-Scale Caldera Acid Tide Cycle (Acts 103-107): Rises every 12s
    if (biomeId === 21) {
      this.acidTideTimer = (this.acidTideTimer + dt) % 12.0;
      // Rising from 7.5..10.5, high tide 9.0..11.2
      this.acidTideLevel = this.acidTideTimer >= 7.5 ? Math.sin(((this.acidTideTimer - 7.5) / 4.5) * Math.PI) : 0;
    }

    for (const f of this.features) {
      f.timer += dt;
      if (f.cooldown > 0) f.cooldown = Math.max(0, f.cooldown - dt);

      switch (f.kind) {
        case 'bear_trap': {
          if (f.triggered) {
            if (f.cooldown <= 0) f.triggered = false;
            break;
          }
          // Check enemy step first (luring enemies!)
          const trappedEnemy = enemies.find((e) => Math.hypot(e.x - f.x, e.y - f.y) <= f.radius + e.width * 0.25);
          if (trappedEnemy) {
            f.triggered = true;
            f.cooldown = 4.5;
            audio.hitImpact(true);
            trappedEnemy.stunTimer = Math.max(trappedEnemy.stunTimer ?? 0, 1.8);
            cb.damageEnemy(trappedEnemy, Math.round(f.damage * 2.2), 50, 0, 0, true, 22);
            cb.spawnFloatingText(f.x, f.y - 14, '🪤 SNAPPED FOE!', '#fbbf24', 1.1);
          } else if (player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius) {
            f.triggered = true;
            f.cooldown = 4.5;
            player.stunTimer = Math.max(player.stunTimer, 0.45);
            cb.damagePlayer(f.damage, f.x, f.y);
            cb.spawnFloatingText(f.x, f.y - 14, '🪤 BEAR TRAP!', '#ef4444', 1.05);
          }
          break;
        }

        case 'leaf_pitfall': {
          if (!f.triggered && player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius) {
            f.triggered = true;
            f.cooldown = 5.0;
            player.vx *= 0.2;
            player.vy *= 0.2;
            cb.damagePlayer(Math.round(f.damage * 0.8), f.x, f.y);
            cb.spawnFloatingText(f.x, f.y - 12, '🍂 LEAF SNARE!', '#d97706', 1.0);
          } else if (f.triggered && f.cooldown <= 0) {
            f.triggered = false;
          }
          break;
        }

        case 'rolling_boulder': {
          f.y = f.homeY + Math.sin(f.timer * 1.9) * 64;
          if (player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius + 3) {
            cb.damagePlayer(f.damage, f.x, f.y);
          }
          break;
        }

        case 'bouncy_mushroom': {
          if (f.cooldown <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius + 2) {
            f.cooldown = 1.4;
            player.happyJumpTimer = 0.55;
            player.invulnTimer = Math.max(player.invulnTimer, 0.45);
            player.vx += (player.facing === 'left' ? -1 : player.facing === 'right' ? 1 : 0) * 190;
            player.vy += (player.facing === 'up' ? -1 : player.facing === 'down' ? 1 : -0.3) * 190;
            audio.dodgeRoll();
            cb.spawnParticles(f.x, f.y, '#2dd4bf', 14, 80);
            cb.spawnFloatingText(f.x, f.y - 16, '🍄 BOING LAUNCH!', '#5eead4', 1.1);
          }
          break;
        }

        case 'wind_gust': {
          const cycle = f.timer % 5.5;
          f.active = cycle >= 3.4;
          if (f.active && player.dodgeTimer <= 0) {
            player.vy += 68 * dt;
          }
          break;
        }

        case 'buzzsaw': {
          f.x = f.homeX + Math.sin(f.timer * 2.6) * 48;
          f.angle += dt * 14;
          if (player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius + 2) {
            cb.damagePlayer(f.damage, f.x, f.y);
          }
          break;
        }

        case 'cracking_ice': {
          if (!f.active && !f.triggered && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius) {
            f.active = true;
            f.cooldown = 0.95; // Cracks after 0.95s
            cb.spawnFloatingText(f.x, f.y - 12, '❄️ ICE CRACKING!', '#bae6fd', 0.95);
          } else if (f.active && !f.triggered && f.cooldown <= 0) {
            f.active = false;
            f.triggered = true;
            f.cooldown = 5.0;
            cb.spawnParticles(f.x, f.y, '#7dd3fc', 14, 70);
          } else if (f.triggered) {
            if (player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius - 2 && f.cooldown > 0.2) {
              if (Math.random() < dt * 2.5) cb.damagePlayer(Math.round(f.damage * 0.7), f.x, f.y);
            }
            if (f.cooldown <= 0) f.triggered = false;
          }
          break;
        }

        case 'minecart': {
          if (f.triggered) break;
          if (f.active) {
            f.x += f.dirX * 210 * dt;
            f.y += f.dirY * 210 * dt;
            if (Math.random() < dt * 18) {
              cb.spawnParticles(f.x, f.y - 6, '#fde047', 1, 35);
            }
            const hitEnemy = enemies.some(
              (e) => Math.hypot(e.x - f.x, e.y - f.y) <= f.radius + e.width * 0.45 + 6
            );
            if (hitEnemy || f.cooldown <= 0 || f.x < 40 || f.x > 568 || f.y < 40 || f.y > 336) {
              this.detonateMinecart(f, enemies, cb);
            }
          }
          break;
        }

        case 'whirlpool': {
          const d = Math.hypot(f.x - player.x, f.y - player.y);
          if (d < f.radius && d > 4 && player.dodgeTimer <= 0) {
            player.vx += ((f.x - player.x) / d) * 62 * dt;
            player.vy += ((f.y - player.y) / d) * 62 * dt;
          }
          break;
        }

        case 'warp_mirror': {
          if (this.warpCooldown <= 0 && f.pairX !== undefined && f.pairY !== undefined) {
            if (Math.hypot(player.x - f.x, player.y - f.y) <= f.radius + 2) {
              this.warpCooldown = 1.6;
              player.x = f.pairX;
              player.y = f.pairY;
              player.invulnTimer = Math.max(player.invulnTimer, 0.35);
              audio.dodgeRoll();
              cb.vfx.spawnShockwave(f.pairX, f.pairY, 34, '#c084fc', 0.3);
              cb.spawnParticles(f.pairX, f.pairY, '#e879f9', 16, 85);
              cb.spawnFloatingText(f.pairX, f.pairY - 14, '🪞 WARP MIRROR!', '#f5d0fe', 1.1);
            }
          }
          break;
        }

        case 'landmine': {
          if (f.triggered) break;
          const nearEnemy = enemies.some((e) => Math.hypot(e.x - f.x, e.y - f.y) <= f.radius + 10);
          const nearPlayer = Math.hypot(player.x - f.x, player.y - f.y) <= f.radius + 8;
          if (!f.active && (nearEnemy || nearPlayer)) {
            f.active = true;
            f.cooldown = 0.65;
            cb.spawnFloatingText(f.x, f.y - 12, '💣 BEEP!', '#ef4444', 0.95);
          } else if (f.active && f.cooldown <= 0) {
            f.triggered = true;
            audio.hitImpact(true);
            cb.shake(0.24, 3.2);
            cb.vfx.spawnShockwave(f.x, f.y, 46, '#ef4444', 0.3);
            cb.spawnParticles(f.x, f.y, '#f97316', 20, 100);
            if (player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= 44) {
              cb.damagePlayer(f.damage, f.x, f.y);
            }
            for (const e of [...enemies]) {
              if (Math.hypot(e.x - f.x, e.y - f.y) <= 50) {
                cb.damageEnemy(e, Math.round(f.damage * 2.2), 40, 0, 0, true, 20);
              }
            }
          }
          break;
        }

        case 'ferry_barge': {
          f.y = f.homeY + Math.sin(f.timer * 1.15) * 44;
          break;
        }

        case 'wind_turbine': {
          const d = Math.hypot(player.x - f.x, player.y - f.y);
          if (d <= f.radius && player.dodgeTimer <= 0) {
            player.vx += f.dirX * 85 * dt;
          }
          break;
        }

        case 'updraft_pad': {
          if (f.cooldown <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius) {
            f.cooldown = 1.6;
            player.happyJumpTimer = 0.65;
            player.invulnTimer = Math.max(player.invulnTimer, 0.6);
            player.vx += 170;
            audio.dodgeRoll();
            cb.spawnParticles(f.x, f.y, '#7dd3fc', 16, 85);
            cb.spawnFloatingText(f.x, f.y - 16, '🌀 SKY UPDRAFT!', '#bae6fd', 1.12);
          }
          break;
        }

        case 'conveyor_belt': {
          if (Math.hypot(player.x - f.x, player.y - f.y) <= f.radius) {
            cb.moveWithCollision(player, f.dirX * 52 * dt, 0);
          }
          break;
        }

        case 'crusher_piston': {
          const cyc = f.timer % 2.8;
          f.active = cyc >= 2.2;
          if (f.active && player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius) {
            cb.damagePlayer(f.damage, f.x, f.y);
          }
          break;
        }

        case 'battering_ram': {
          if (f.triggered) break;
          const playerNear = Math.hypot(player.x - f.x, player.y - f.y) <= 44;
          const alliesNear = allies.filter((a) => Math.hypot(a.x - f.x, a.y - f.y) <= 44).length;
          if (playerNear || alliesNear > 0) {
            const rollSpd = (playerNear ? 26 : 12) + alliesNear * 6;
            const stepX = rollSpd * dt;
            if (f.x < 508) {
              f.x += stepX;
              f.progress = Math.min(100, Math.round(((f.x - f.homeX) / (508 - f.homeX)) * 100));
              if (Math.random() < dt * 3) cb.spawnParticles(f.x - 10, f.y + 6, '#fbbf24', 2, 35);
            } else {
              f.triggered = true;
              audio.bannerCaptured();
              cb.shake(0.35, 4.5);
              cb.vfx.spawnShockwave(f.x, f.y, 76, '#fde047', 0.42);
              cb.boostMorale(25);
              cb.spawnFloatingText(f.x, f.y - 20, '🦁 RAM BREACHED GATE! (+25% MORALE)', '#fde047', 1.25);
              for (const e of [...enemies]) {
                if (Math.hypot(e.x - f.x, e.y - f.y) <= 130) {
                  cb.damageEnemy(e, f.damage, 80, 1, 0, true, 40);
                }
              }
            }
          }
          break;
        }

        case 'electric_tile': {
          const cyc = f.timer % 3.0;
          f.active = cyc >= 2.1;
          if (f.active && player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius) {
            cb.damagePlayer(f.damage, f.x, f.y);
          }
          break;
        }

        case 'gold_laser': {
          f.angle += dt * 1.45;
          const lx = f.x + Math.cos(f.angle) * 46;
          const ly = f.y + Math.sin(f.angle) * 46;
          if (player.dodgeTimer <= 0 && this.ptSegDist(player.x, player.y, f.x, f.y, lx, ly) <= 8) {
            cb.damagePlayer(f.damage, f.x, f.y);
          }
          break;
        }

        case 'tornado': {
          f.x = f.homeX + Math.sin(f.timer * 1.3) * 84;
          f.y = f.homeY + Math.cos(f.timer * 1.7) * 42;
          f.angle += dt * 10;
          const td = Math.hypot(player.x - f.x, player.y - f.y);
          if (td <= f.radius + 4 && player.dodgeTimer <= 0) {
            player.vx += (Math.random() - 0.5) * 260 * dt;
            cb.damagePlayer(Math.round(f.damage * 0.65), f.x, f.y);
          }
          break;
        }

        case 'acid_tide_zone': {
          f.active = this.acidTideLevel > 0.45;
          if (f.active && player.dodgeTimer <= 0 && Math.hypot(player.x - f.x, player.y - f.y) <= f.radius) {
            if (Math.random() < dt * 2.8) cb.damagePlayer(Math.round(f.damage * 0.7), f.x, f.y);
          }
          break;
        }

        case 'firebar': {
          f.angle += dt * 2.1;
          const endX = f.x + Math.cos(f.angle) * f.radius;
          const endY = f.y + Math.sin(f.angle) * f.radius;
          if (player.dodgeTimer <= 0 && this.ptSegDist(player.x, player.y, f.x, f.y, endX, endY) <= 8) {
            cb.damagePlayer(f.damage, f.x, f.y);
          }
          break;
        }

        default:
          break;
      }
    }
  }

  private ptSegDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  public render(ctx: CanvasRenderingContext2D, globalTime: number, biomeId: BiomeId) {
    for (const f of this.features) {
      const fx = Math.round(f.x);
      const fy = Math.round(f.y);

      switch (f.kind) {
        case 'tripwire_log': {
          if (f.triggered) break;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(fx - 10, fy - 4, 20, 7);
          ctx.fillStyle = '#d97706';
          ctx.fillRect(fx - 8, fy - 3, 16, 3);
          ctx.strokeStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(fx - 12, fy + 8);
          ctx.lineTo(fx + 12, fy + 8);
          ctx.stroke();
          break;
        }
        case 'leaf_pitfall': {
          ctx.fillStyle = f.triggered ? '#451a03' : '#854d0e';
          ctx.fillRect(fx - 9, fy - 7, 18, 14);
          ctx.fillStyle = f.triggered ? '#1c1917' : '#a16207';
          ctx.fillRect(fx - 7, fy - 5, 14, 10);
          break;
        }
        case 'bear_trap': {
          ctx.fillStyle = '#475569';
          ctx.fillRect(fx - 6, fy - 4, 12, 8);
          ctx.fillStyle = f.triggered ? '#ef4444' : '#e2e8f0';
          ctx.fillRect(fx - 5, fy - 5, 3, 3);
          ctx.fillRect(fx + 2, fy - 5, 3, 3);
          break;
        }
        case 'rolling_boulder': {
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(fx - 8, fy + 6, 16, 3);
          ctx.fillStyle = '#57534e';
          ctx.beginPath();
          ctx.arc(fx, fy, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#a8a29e';
          ctx.fillRect(fx - 4, fy - 5, 5, 4);
          break;
        }
        case 'bouncy_mushroom': {
          const squish = f.cooldown > 1.0 ? 2 : 0;
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(fx - 3, fy, 6, 8);
          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(fx - 10, fy - 7 + squish, 20, 8);
          ctx.fillStyle = '#99f6e4';
          ctx.fillRect(fx - 6, fy - 6 + squish, 4, 3);
          ctx.fillRect(fx + 3, fy - 5 + squish, 3, 2);
          break;
        }
        case 'puffball_spore': {
          if (f.triggered) break;
          ctx.fillStyle = '#84cc16';
          ctx.beginPath();
          ctx.arc(fx, fy, 7 + Math.sin(globalTime * 4) * 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ecfccb';
          ctx.fillRect(fx - 2, fy - 3, 3, 2);
          break;
        }
        case 'wind_gust': {
          if (!f.active) break;
          ctx.fillStyle = 'rgba(253, 186, 116, 0.35)';
          for (let i = 0; i < 6; i++) {
            const wx = 120 + ((i * 75 + globalTime * 90) % 360);
            const wy = 90 + ((globalTime * 180 + i * 52) % 200);
            ctx.fillRect(Math.round(wx), Math.round(wy), 3, 12);
          }
          break;
        }
        case 'buzzsaw': {
          ctx.fillStyle = '#334155';
          ctx.fillRect(Math.round(f.homeX - 48), fy - 1, 96, 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(fx, fy, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(fx - 2, fy - 2, 4, 4);
          break;
        }
        case 'cracking_ice': {
          ctx.fillStyle = f.triggered ? '#0c4a6e' : f.active ? '#f0f9ff' : '#bae6fd';
          ctx.fillRect(fx - 10, fy - 8, 20, 16);
          ctx.strokeStyle = f.active ? '#fde047' : '#38bdf8';
          ctx.strokeRect(fx - 10.5, fy - 8.5, 21, 17);
          break;
        }
        case 'minecart': {
          ctx.fillStyle = '#44403c';
          ctx.fillRect(Math.round(f.homeX - 18), Math.round(f.homeY + 6), 36, 3);
          if (f.triggered) break;
          ctx.fillStyle = '#78716c';
          ctx.fillRect(fx - 8, fy - 6, 16, 11);
          const fuseBlink = f.active && Math.sin(globalTime * 28) > 0;
          ctx.fillStyle = fuseBlink ? '#fde047' : '#ef4444';
          ctx.fillRect(fx - 4, fy - 9, 8, 4);
          break;
        }
        case 'whirlpool': {
          ctx.strokeStyle = 'rgba(161, 98, 7, 0.75)';
          ctx.beginPath();
          ctx.arc(fx, fy, f.radius * 0.75, globalTime * 4, globalTime * 4 + Math.PI * 1.4);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(fx, fy, f.radius * 0.4, -globalTime * 5, -globalTime * 5 + Math.PI * 1.3);
          ctx.stroke();
          break;
        }
        case 'warp_mirror': {
          ctx.fillStyle = 'rgba(192, 132, 252, 0.3)';
          ctx.beginPath();
          ctx.arc(fx, fy, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e879f9';
          ctx.stroke();
          break;
        }
        case 'landmine': {
          if (f.triggered) break;
          ctx.fillStyle = '#334155';
          ctx.fillRect(fx - 5, fy - 4, 10, 8);
          const blink = f.active ? Math.sin(globalTime * 28) > 0 : Math.sin(globalTime * 5 + f.x) > 0.3;
          ctx.fillStyle = blink ? '#ef4444' : '#7f1d1d';
          ctx.fillRect(fx - 2, fy - 2, 4, 4);
          break;
        }
        case 'ferry_barge': {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(fx - 16, fy - 10, 32, 20);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(fx - 14, fy - 8, 28, 16);
          break;
        }
        case 'rockslide_lever': {
          ctx.fillStyle = '#475569';
          ctx.fillRect(fx - 6, fy + 2, 12, 6);
          ctx.fillStyle = f.triggered ? '#64748b' : '#fde047';
          ctx.fillRect(fx - 1, fy - 6, 3, 9);
          break;
        }
        case 'wind_turbine': {
          ctx.fillStyle = '#475569';
          ctx.fillRect(fx - 7, fy - 7, 14, 14);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(fx + 7, fy - 4, 12, 8);
          break;
        }
        case 'campfire_brazier': {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.14)';
          ctx.beginPath();
          ctx.arc(fx, fy, f.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#44403c';
          ctx.fillRect(fx - 6, fy - 4, 12, 8);
          ctx.fillStyle = Math.sin(globalTime * 14 + fx) > 0 ? '#fde047' : '#f97316';
          ctx.fillRect(fx - 4, fy - 9, 8, 7);
          break;
        }
        case 'conveyor_belt': {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(fx - 22, fy - 10, 44, 20);
          ctx.fillStyle = '#f59e0b';
          const offset = Math.floor((globalTime * 24 * f.dirX) % 8);
          for (let bx = -16; bx <= 16; bx += 8) {
            ctx.fillRect(fx + bx + offset, fy - 6, 2, 12);
          }
          break;
        }
        case 'crusher_piston': {
          ctx.fillStyle = f.active ? '#ef4444' : '#64748b';
          ctx.fillRect(fx - 12, fy - 12, 24, 24);
          ctx.strokeStyle = '#fbbf24';
          ctx.strokeRect(fx - 12.5, fy - 12.5, 25, 25);
          break;
        }
        case 'battering_ram': {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(fx - 14, fy - 8, 28, 16);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(fx + 8, fy - 6, 8, 12);
          ctx.font = 'bold 5px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fde047';
          ctx.fillText(f.triggered ? 'BREACHED!' : `🦁 ESCORT RAM (${f.progress ?? 0}%)`, fx, fy - 12);
          break;
        }
        case 'chandelier_drop': {
          if (f.triggered) break;
          ctx.fillStyle = 'rgba(0,0,0,0.32)';
          ctx.beginPath();
          ctx.arc(fx, fy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fde047';
          ctx.stroke();
          break;
        }
        case 'electric_tile': {
          ctx.fillStyle = f.active ? 'rgba(56, 189, 248, 0.55)' : 'rgba(30, 41, 59, 0.5)';
          ctx.fillRect(fx - 14, fy - 14, 28, 28);
          ctx.strokeStyle = f.active ? '#e0f2fe' : '#38bdf8';
          ctx.strokeRect(fx - 14.5, fy - 14.5, 29, 29);
          break;
        }
        case 'water_barrel': {
          if (f.triggered) break;
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(fx - 6, fy - 7, 12, 14);
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(fx - 5, fy - 4, 10, 3);
          break;
        }
        case 'greed_chest': {
          if (f.triggered) break;
          ctx.fillStyle = '#b45309';
          ctx.fillRect(fx - 7, fy - 5, 14, 10);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(fx - 2, fy - 2, 4, 4);
          break;
        }
        case 'gold_laser': {
          const lx = Math.round(fx + Math.cos(f.angle) * 46);
          const ly = Math.round(fy + Math.sin(f.angle) * 46);
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(lx, ly);
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(fx - 4, fy - 4, 8, 8);
          break;
        }
        case 'lightning_rod': {
          ctx.fillStyle = f.cooldown > 0 ? '#64748b' : '#38bdf8';
          ctx.fillRect(fx - 3, fy - 10, 6, 16);
          ctx.fillStyle = '#fde047';
          ctx.fillRect(fx - 2, fy - 13, 4, 4);
          break;
        }
        case 'tornado': {
          ctx.strokeStyle = '#bae6fd';
          ctx.beginPath();
          ctx.arc(fx, fy, 12, f.angle, f.angle + Math.PI * 1.6);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(fx, fy, 7, -f.angle, -f.angle + Math.PI * 1.4);
          ctx.stroke();
          break;
        }
        case 'acid_tide_zone': {
          const warn = this.acidTideTimer >= 6.0 && this.acidTideTimer < 7.5;
          if (f.active || warn) {
            ctx.fillStyle = f.active ? 'rgba(132, 204, 22, 0.48)' : 'rgba(250, 204, 21, 0.2)';
            ctx.beginPath();
            ctx.arc(fx, fy, f.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = f.active ? '#a3e635' : '#fde047';
            ctx.stroke();
          }
          break;
        }
        case 'chrono_dome': {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
          ctx.beginPath();
          ctx.arc(fx, fy, f.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.stroke();
          break;
        }
        case 'firebar': {
          ctx.fillStyle = '#7c2d12';
          ctx.fillRect(fx - 4, fy - 4, 8, 8);
          for (let seg = 1; seg <= 5; seg++) {
            const bx = Math.round(fx + Math.cos(f.angle) * (seg * 8));
            const by = Math.round(fy + Math.sin(f.angle) * (seg * 8));
            ctx.fillStyle = seg % 2 === 0 ? '#f97316' : '#fde047';
            ctx.fillRect(bx - 3, by - 3, 6, 6);
          }
          break;
        }
        case 'updraft_pad': {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.beginPath();
          ctx.arc(fx, fy, f.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#7dd3fc';
          ctx.stroke();
          break;
        }
        default:
          break;
      }
    }

    // Subtle Frostbite Tundra cold-meter indicator bar at top-left of canvas when > 5%
    if (biomeId === 13 && this.tundraCold > 5) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(8, 360, 112, 10);
      ctx.fillStyle = this.tundraCold > 75 ? '#ef4444' : '#38bdf8';
      ctx.fillRect(9, 361, Math.round((this.tundraCold / 100) * 110), 8);
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e0f2fe';
      ctx.fillText(`🥶 COLD ${Math.round(this.tundraCold)}% (BRAZIER)`, 12, 367);
    }
  }
}
