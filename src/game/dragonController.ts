import { audio } from './audio';
import {
  AegisDomeState,
  AlliedCatSoldier,
  DragonBallista,
  DragonBossState,
  DragonMountState,
  DragonPartKey,
  Enemy,
  GoldenFeatherPickup,
  HazardPool,
  HoardTreasurePile,
  PlayerState,
  Projectile,
  UpdraftGeyser,
} from './types';
import { PixelVfxEngine } from './vfx';

export interface CarpetFireLane {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  warnTimer: number;
  activeTimer: number;
  damage: number;
  hitTick: number;
}

export interface HarpoonTetherVfx {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
}

export interface DragonTornado {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  damage: number;
  hitTick: number;
}

export interface DragonCombatCallbacks {
  vfx: PixelVfxEngine;
  damagePlayer: (
    rawDmg: number,
    sx: number,
    sy: number,
    options?: { trueDamage?: boolean; applyMortalWound?: boolean; ignoreInvuln?: boolean }
  ) => void;
  spawnParticles: (x: number, y: number, color: string, count: number, speed: number) => void;
  spawnFloatingText: (x: number, y: number, text: string, color: string, scale?: number) => void;
  pushToast: (text: string, accent: 'gold' | 'cyan' | 'emerald' | 'amber') => void;
  shake: (duration: number, intensity: number) => void;
  setHitStop: (duration: number) => void;
  addBossStagger: (enemy: Enemy, amount: number) => void;
  spawnDragonkinSquad?: (x: number, y: number) => void;
  damageEnemyDirect: (
    enemy: Enemy,
    rawDmg: number,
    critChance: number,
    dirX: number,
    dirY: number,
    forceCrit?: boolean,
    staggerBonus?: number,
    isDirectMelee?: boolean,
    bypassPartArmor?: boolean
  ) => void;
  moveWithCollision: (ent: { x: number; y: number; width: number; height: number }, dx: number, dy: number) => void;
}

export function isDragonBossEnemy(e: Enemy): boolean {
  return e.archetype === 'dragon' || e.archetype === 'bahamut';
}

export function createInitialDragonState(e: Enemy): DragonBossState {
  const isP2Sky = e.kind === 'bahamut_p2';
  return {
    wingsHp: 15000,
    wingsMaxHp: 15000,
    wingsBroken: false,
    tailHp: 15000,
    tailMaxHp: 15000,
    tailSevered: false,
    coreCracked: false,
    headExposedTimer: 0,
    altitude: isP2Sky ? 'sky' : 'ground',
    skyHeight: isP2Sky ? 1 : 0,
    flightTimer: isP2Sky ? 10.0 : 0,
    flightCooldown: isP2Sky ? 10 : 12.0,
    harpoonChainsHit: 0,
    windGaleTimer: 4.5,
    windGaleWindup: 0,
    tailWhipTimer: 3.2,
    tailWhipWindup: 0,
    breathWindup: 0,
    breathAngle: 0,
    carpetBombTimer: 0.9,
    hoardTheftTimer: 9.0,
    hoardTheftWindup: 0,
    supernovaWindup: 0,
  };
}

export function ensureDragonState(e: Enemy): DragonBossState {
  if (!e.dragonState) {
    e.dragonState = createInitialDragonState(e);
  }
  return e.dragonState;
}

export function createEmptyMountState(): DragonMountState {
  return {
    active: false,
    dragonEnemyId: '',
    dragonName: '',
    timer: 0,
    maxTimer: 8.0,
    playerLaneX: 0,
    playerSpineY: 0.25,
    scrollOffset: 0,
    neckGemHits: 0,
    slashCooldown: 0,
    slashAnimTimer: 0,
    dodgeTimer: 0,
    dodgeCooldown: 0,
    lightningSpikes: [],
    spikeSpawnTimer: 0.7,
  };
}

export function createEmptyAegisDome(): AegisDomeState {
  return {
    active: false,
    x: 304,
    y: 236,
    radius: 58,
    timer: 0,
    maxTimer: 0,
  };
}

/**
 * Resolves which anatomical hitbox of the Dragon Boss was struck.
 * - Head: only reachable when headExposedTimer > 0 (Sky-Crash or Breath Exhaustion) -> 3.0x CRIT!
 * - Tail: rear ~130 deg arc if !tailSevered -> 15,000 DMG severs tail (+5,000G + Dragon Gem!)
 * - Wings: left/right flanks if !wingsBroken -> 15,000 DMG shatters wings (halves sky-flight, stops gales!)
 * - Core: chest/scales -> 80% DR until cracked by [Q] Elixir or Harpoon Ballista!
 */
export function resolveDragonHitPart(
  e: Enemy,
  attackerX: number,
  attackerY: number
): DragonPartKey {
  const ds = ensureDragonState(e);
  let fx = 0;
  let fy = 1;
  if (e.facing === 'left') {
    fx = -1;
    fy = 0;
  } else if (e.facing === 'right') {
    fx = 1;
    fy = 0;
  } else if (e.facing === 'up') {
    fx = 0;
    fy = -1;
  }

  const dx = attackerX - e.x;
  const dy = attackerY - e.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = dx / len;
  const ny = dy / len;

  const forwardDot = nx * fx + ny * fy;
  const sideDot = Math.abs(nx * -fy + ny * fx);

  if (ds.headExposedTimer > 0 && forwardDot > 0.2) {
    return 'head';
  }
  if (!ds.tailSevered && forwardDot < -0.3) {
    return 'tail';
  }
  if (!ds.wingsBroken && sideDot > 0.54) {
    return 'wings';
  }
  if (ds.headExposedTimer > 0 && forwardDot > -0.1) {
    return 'head';
  }
  return 'core';
}

export class DragonBossController {
  public ballistas: DragonBallista[] = [];
  public hoardPiles: HoardTreasurePile[] = [];
  public updrafts: UpdraftGeyser[] = [];
  public aegisDome: AegisDomeState = createEmptyAegisDome();
  public carpetLanes: CarpetFireLane[] = [];
  public harpoonTethers: HarpoonTetherVfx[] = [];
  public tornadoes: DragonTornado[] = [];
  public mount: DragonMountState = createEmptyMountState();

  public resetForAct(ballistas: DragonBallista[] = []) {
    this.ballistas = ballistas.map((b) => ({ ...b }));
    this.hoardPiles = [];
    this.updrafts = [];
    this.aegisDome = createEmptyAegisDome();
    this.carpetLanes = [];
    this.harpoonTethers = [];
    this.tornadoes = [];
    this.mount = createEmptyMountState();
  }

  public hasActiveDragon(enemies: Enemy[]): boolean {
    return enemies.some((e) => isDragonBossEnemy(e) && e.hp > 0);
  }

  public isInSkyFlight(enemies: Enemy[]): boolean {
    return enemies.some((e) => isDragonBossEnemy(e) && ensureDragonState(e).altitude === 'sky');
  }

  public getGearDebuffAtkPenalty(): number {
    return this.hoardPiles.reduce((acc, p) => acc + p.stolenGearAtkDebuff, 0);
  }

  public getNearestReadyBallista(px: number, py: number): DragonBallista | null {
    let best: DragonBallista | null = null;
    let bestD = 36;
    for (const b of this.ballistas) {
      const d = Math.hypot(b.x - px, b.y - py);
      if (d <= bestD && b.cooldown <= 0) {
        bestD = d;
        best = b;
      }
    }
    return best;
  }

  public fireBallista(
    ballista: DragonBallista,
    enemies: Enemy[],
    player: PlayerState,
    cb: DragonCombatCallbacks
  ): boolean {
    const dragon = enemies.find((e) => isDragonBossEnemy(e) && e.hp > 0);
    if (!dragon || ballista.cooldown > 0) return false;

    const ds = ensureDragonState(dragon);
    if (ds.altitude === 'sky' && !ballista.lockedOn) {
      ballista.cooldown = 0.5;
      audio.shieldImmune();
      cb.spawnFloatingText(ballista.x, ballista.y - 16, '⚠️ WAIT FOR RETICLE ALIGNMENT!', '#fb923c', 1.0);
      return false;
    }

    ballista.cooldown = ballista.maxCooldown;
    ballista.aimAngle = Math.atan2(dragon.y - ballista.y, dragon.x - ballista.x);
    audio.harpoonFire();
    cb.shake(0.24, 3.6);
    cb.spawnParticles(ballista.x, ballista.y, '#fde047', 16, 95);

    this.harpoonTethers.push({
      x1: ballista.x,
      y1: ballista.y,
      x2: dragon.x,
      y2: dragon.y - ds.skyHeight * 24,
      life: 0.48,
      maxLife: 0.48,
    });

    if (dragon.shielded && player.duckElixirActive) {
      dragon.shielded = false;
    }

    if (!ds.coreCracked) {
      ds.coreCracked = true;
      cb.spawnFloatingText(dragon.x, dragon.y - 24, '💥 CORE SCALES CRACKED!', '#38bdf8', 1.2);
    }

    if (ds.altitude === 'sky') {
      ds.harpoonChainsHit += 1;
      const chainDmg = dragon.archetype === 'bahamut' ? 18000 : 12500;
      cb.damageEnemyDirect(dragon, chainDmg, 100, 0, -1, true, 40, false, true);
      cb.spawnParticles(dragon.x, dragon.y - 18, '#fde047', 22, 115);

      if (ds.harpoonChainsHit >= 2) {
        // SKY-CRASH GROUND SLAM!
        ds.harpoonChainsHit = 0;
        ds.altitude = 'exhausted';
        ds.skyHeight = 0;
        ds.flightTimer = 0;
        ds.flightCooldown = ds.wingsBroken ? 14.0 : 12.0;
        ds.headExposedTimer = 6.0;
        ds.coreCracked = true;
        dragon.stunTimer = Math.max(dragon.stunTimer ?? 0, 6.0);

        const crashDmg = 25000;
        audio.skyCrash();
        cb.setHitStop(0.048);
        cb.shake(0.55, 6.2);
        cb.vfx.spawnShockwave(dragon.x, dragon.y, 88, '#fde047', 0.48);
        cb.vfx.spawnDecal(dragon.x, dragon.y, 'ember', 5.0);
        cb.spawnParticles(dragon.x, dragon.y, '#f97316', 38, 145);
        cb.spawnParticles(dragon.x, dragon.y, '#fde047', 28, 125);
        cb.damageEnemyDirect(dragon, crashDmg, 100, 0, 1, true, 65, false, true);
        cb.spawnFloatingText(
          dragon.x,
          dragon.y - 30,
          '💥 SKY-CRASH GROUND SLAM! (-25,000 HP)',
          '#fde047',
          1.35
        );
        cb.pushToast(
          '💥 SKY-CRASH GROUND SLAM! 2 Harpoons reeled the Dragon down (-25,000 HP + 6s 3.0x HEAD WEAK-POINT)!',
          'gold'
        );
      } else {
        cb.spawnFloatingText(
          dragon.x,
          dragon.y - 26,
          `⛓️ HARPOON CHAIN 1/2! (${chainDmg.toLocaleString()} DMG)`,
          '#fde047',
          1.22
        );
        cb.pushToast('⛓️ Harpoon Tether 1/2 locked! Fire a 2nd Corner Ballista [E] for SKY-CRASH!', 'gold');
      }
    } else {
      const groundDmg = dragon.archetype === 'bahamut' ? 14000 : 9500;
      cb.damageEnemyDirect(dragon, groundDmg, 100, 0, 1, true, 35, false, true);
      cb.spawnFloatingText(
        dragon.x,
        dragon.y - 22,
        `🏹 BALLISTA PIERCE! -${groundDmg.toLocaleString()}`,
        '#fde047',
        1.2
      );
      cb.pushToast(`🏹 Harpoon Ballista pierced ${dragon.name} & cracked Core Armor!`, 'gold');
    }
    return true;
  }

  public rallyAllLockedBallistas(enemies: Enemy[], player: PlayerState, cb: DragonCombatCallbacks) {
    let fired = 0;
    for (const b of this.ballistas) {
      if (b.cooldown <= 0 && b.lockedOn) {
        if (this.fireBallista(b, enemies, player, cb)) fired++;
      }
    }
    if (fired > 0) {
      cb.pushToast(`📯 War-Horn Ballista Volley! ${fired} Corner Ballista(s) fired!`, 'gold');
    }
  }

  public breakHoardPile(
    pile: HoardTreasurePile,
    player: PlayerState,
    feathers: GoldenFeatherPickup[],
    cb: DragonCombatCallbacks
  ) {
    this.hoardPiles = this.hoardPiles.filter((p) => p.id !== pile.id);
    audio.partBreak();
    cb.shake(0.32, 4.5);
    cb.vfx.spawnShockwave(pile.x, pile.y, 58, '#fde047', 0.36);
    cb.spawnParticles(pile.x, pile.y, '#fde047', 34, 120);
    cb.spawnParticles(pile.x, pile.y, '#38bdf8', 18, 95);

    player.gold += pile.stolenGold + 250;
    player.healthPotions += pile.stolenPotions;
    if (pile.stoleElixir) {
      player.duckElixirActive = true;
      player.duckElixirTimer = Math.max(player.duckElixirTimer, 10.0);
      player.duckElixirMaxTimer = Math.max(player.duckElixirMaxTimer, 10.0);
      player.duckElixirCooldown = 0;
    }
    const fishHeal = Math.round(player.maxHp * 0.32);
    player.hp = Math.min(player.maxHp, player.hp + fishHeal);
    player.dragonSlayerFuryTimer = 10.0;

    // Shower 3 Golden Feathers for instant [Q] refill
    for (let i = 0; i < 3; i++) {
      const ang = (Math.PI * 2 * i) / 3;
      feathers.push({
        id: `hoard_f_${Date.now()}_${i}`,
        x: Math.max(48, Math.min(556, pile.x + Math.cos(ang) * 24)),
        y: Math.max(48, Math.min(312, pile.y + Math.sin(ang) * 24)),
        vy: 0,
        life: 16.0,
      });
    }

    cb.spawnFloatingText(pile.x, pile.y - 22, '💎 HOARD RECLAIMED! +100% FURY (10s)!', '#fde047', 1.3);
    cb.pushToast(
      `💎 Treasure Pile Shattered! Recovered Loot + Healing Fish (+${fishHeal} HP) + 3 Feathers + 10s +100% Dragon-Slayer Fury!`,
      'gold'
    );
  }

  public updateAll(
    dt: number,
    enemies: Enemy[],
    player: PlayerState,
    allies: AlliedCatSoldier[],
    projectiles: Projectile[],
    hazards: HazardPool[],
    feathers: GoldenFeatherPickup[],
    cb: DragonCombatCallbacks
  ) {
    // 1. Update Harpoon Tethers & Updraft Geysers & Aegis Dome
    this.harpoonTethers = this.harpoonTethers
      .map((t) => ({ ...t, life: t.life - dt }))
      .filter((t) => t.life > 0);

    if (this.aegisDome.active) {
      this.aegisDome.timer -= dt;
      if (this.aegisDome.timer <= 0) {
        this.aegisDome.active = false;
      }
    }

    const dragon = enemies.find((e) => isDragonBossEnemy(e) && e.hp > 0);

    // 2. Update Updraft Wind-Geysers & Mount Trigger (Act 122 Bahamut)
    const nextUpdrafts: UpdraftGeyser[] = [];
    for (const g of this.updrafts) {
      g.life -= dt;
      if (g.life <= 0) continue;
      if (
        !this.mount.active &&
        dragon &&
        dragon.archetype === 'bahamut' &&
        ensureDragonState(dragon).altitude === 'sky' &&
        Math.hypot(player.x - g.x, player.y - g.y) <= g.radius + 6
      ) {
        this.startDragonMount(dragon, player, cb);
      } else {
        nextUpdrafts.push(g);
      }
    }
    this.updrafts = nextUpdrafts;

    // 3. Update Diagonal Carpet-Bomb Fire Lanes
    const nextLanes: CarpetFireLane[] = [];
    for (const lane of this.carpetLanes) {
      if (lane.warnTimer > 0) {
        lane.warnTimer -= dt;
        if (lane.warnTimer <= 0) {
          audio.hitImpact(false);
          cb.vfx.spawnDecal((lane.x1 + lane.x2) / 2, (lane.y1 + lane.y2) / 2, 'ember', 3.8);
          cb.spawnParticles((lane.x1 + lane.x2) / 2, (lane.y1 + lane.y2) / 2, '#f97316', 12, 85);
        }
        nextLanes.push(lane);
      } else {
        lane.activeTimer -= dt;
        lane.hitTick -= dt;
        if (lane.hitTick <= 0 && !this.mount.active) {
          lane.hitTick = 0.32;
          const d = this.pointToSegmentDist(player.x, player.y, lane.x1, lane.y1, lane.x2, lane.y2);
          if (d <= 15) {
            cb.damagePlayer(lane.damage, (lane.x1 + lane.x2) / 2, (lane.y1 + lane.y2) / 2, {
              applyMortalWound: true,
            });
          }
        }
        if (lane.activeTimer > 0) nextLanes.push(lane);
      }
    }
    this.carpetLanes = nextLanes;

    // 3B. Update Swirling Dragon Tornado Vortices
    const nextTornadoes: DragonTornado[] = [];
    for (const torn of this.tornadoes) {
      torn.life -= dt;
      if (torn.life <= 0) continue;
      torn.x += torn.vx * dt;
      torn.y += torn.vy * dt;
      if (torn.x < 68 || torn.x > 540) torn.vx *= -1;
      if (torn.y < 68 || torn.y > 316) torn.vy *= -1;
      torn.hitTick -= dt;
      const distP = Math.hypot(player.x - torn.x, player.y - torn.y);
      if (distP < torn.radius * 2.2 && distP > 6 && player.dodgeTimer <= 0 && !this.mount.active) {
        player.vx += ((torn.x - player.x) / distP) * 95 * dt;
        player.vy += ((torn.y - player.y) / distP) * 95 * dt;
      }
      if (distP <= torn.radius && torn.hitTick <= 0 && !this.mount.active) {
        torn.hitTick = 0.5;
        cb.damagePlayer(torn.damage, torn.x, torn.y, { applyMortalWound: true });
      }
      nextTornadoes.push(torn);
    }
    this.tornadoes = nextTornadoes;

    // 4. Update Hoard Treasure Piles
    const nextPiles: HoardTreasurePile[] = [];
    for (const pile of this.hoardPiles) {
      pile.life -= dt;
      if (pile.life <= 0) {
        this.breakHoardPile(pile, player, feathers, cb);
        continue;
      }
      if (Math.random() < dt * 4) {
        cb.vfx.spawnSingleParticle(
          pile.x + (Math.random() - 0.5) * 14,
          pile.y - 4,
          (Math.random() - 0.5) * 14,
          -18,
          '#fde047',
          2,
          0.4
        );
      }
      nextPiles.push(pile);
    }
    this.hoardPiles = nextPiles;

    // 5. Update 4 Corner Dragon-Binder Harpoon Ballistas (with Skill-Shot Alignment Tracking!)
    for (const b of this.ballistas) {
      if (b.cooldown > 0) b.cooldown = Math.max(0, b.cooldown - dt);
      if (dragon) {
        const ds = ensureDragonState(dragon);
        const targetAng = Math.atan2(dragon.y - b.y, dragon.x - b.x);
        const diff = Math.atan2(Math.sin(targetAng - b.aimAngle), Math.cos(targetAng - b.aimAngle));
        const turnRate = ds.altitude === 'sky' ? 1.65 : 2.8;
        b.aimAngle += Math.sign(diff) * Math.min(Math.abs(diff), turnRate * dt);

        const distToDragon = Math.hypot(dragon.x - b.x, dragon.y - b.y);
        const angErr = Math.abs(Math.atan2(Math.sin(targetAng - b.aimAngle), Math.cos(targetAng - b.aimAngle)));
        b.lockedOn =
          ds.altitude === 'sky'
            ? distToDragon <= 315 && angErr <= 0.28
            : distToDragon <= 260 && angErr <= 0.35;

        // Non-Bahamut Elder Dragons get slow ally crew support; Bahamut requires player Skill-Shot [E]!
        if (dragon.archetype !== 'bahamut' && ds.altitude === 'sky' && b.lockedOn && b.cooldown <= 0) {
          b.autoCrewTimer -= dt;
          if (b.autoCrewTimer <= 0) {
            b.autoCrewTimer = 7.5;
            this.fireBallista(b, enemies, player, cb);
          }
        }
      } else {
        b.lockedOn = false;
      }
    }

    // 6. If Mounted on Ignis-Bahamut, run Airborne Spine-Run Sequence
    if (this.mount.active && dragon) {
      this.updateDragonMount(dt, dragon, player, cb);
    } else if (this.mount.active && !dragon) {
      this.mount.active = false;
    }

    // 7. Update each active Dragon Boss AI
    for (const e of enemies) {
      if (!isDragonBossEnemy(e) || e.hp <= 0) continue;
      if (e.isInvulnerablePhaseGate) continue;
      if ((e.stunTimer ?? 0) > 0) continue;
      this.updateSingleDragon(e, dt, player, allies, projectiles, hazards, feathers, cb);
    }
  }

  private startDragonMount(dragon: Enemy, player: PlayerState, cb: DragonCombatCallbacks) {
    this.mount = {
      active: true,
      dragonEnemyId: dragon.id,
      dragonName: dragon.name,
      timer: 8.0,
      maxTimer: 8.0,
      playerLaneX: 0,
      playerSpineY: 0.22,
      scrollOffset: 0,
      neckGemHits: 0,
      slashCooldown: 0,
      slashAnimTimer: 0,
      dodgeTimer: 0,
      dodgeCooldown: 0,
      lightningSpikes: [],
      spikeSpawnTimer: 0.55,
    };
    player.invulnTimer = 0.6;
    audio.elixirAwaken();
    cb.shake(0.35, 4.5);
    cb.spawnParticles(player.x, player.y, '#38bdf8', 24, 115);
    cb.pushToast(
      '⚔️ MOUNTED ON BAHAMUT! Dash along its Spine [WASD], Dodge Lightning [SHIFT], Slash Neck Gem [SPACE/CLICK] for 5,000 DMG!',
      'gold'
    );
  }

  public updateMountMovement(ix: number, iy: number, dt: number) {
    if (!this.mount.active) return;
    const spd = this.mount.dodgeTimer > 0 ? 2.2 : 1.35;
    this.mount.playerLaneX = Math.max(-0.92, Math.min(0.92, this.mount.playerLaneX + ix * spd * dt));
    this.mount.playerSpineY = Math.max(0.08, Math.min(0.92, this.mount.playerSpineY - iy * spd * 0.72 * dt));
  }

  public triggerMountSlash(enemies: Enemy[], cb: DragonCombatCallbacks): boolean {
    if (!this.mount.active) return false;
    if (this.mount.slashCooldown > 0) return true;
    this.mount.slashCooldown = 0.24;
    this.mount.slashAnimTimer = 0.16;
    audio.swordSlash(2);

    const dragon = enemies.find((e) => e.id === this.mount.dragonEnemyId);
    if (!dragon) return true;

    // Neck Starlight Gem sits near spineY >= 0.58 and center lane |laneX| <= 0.65
    if (this.mount.playerSpineY >= 0.45 && Math.abs(this.mount.playerLaneX) <= 0.72) {
      this.mount.neckGemHits += 1;
      const dmg = 5000;
      audio.hitImpact(true);
      cb.shake(0.18, 3.2);
      const ds = ensureDragonState(dragon);
      if (ds.supernovaWindup > 0) {
        ds.supernovaWindup = 0;
        this.aegisDome.active = false;
        cb.spawnFloatingText(dragon.x, dragon.y - 34, '💥 SUPERNOVA INTERRUPTED!', '#38bdf8', 1.35);
        cb.pushToast('💥 Neck Starlight Core Smashed! World-Breaker Supernova INTERRUPTED!', 'gold');
      }
      cb.damageEnemyDirect(dragon, dmg, 100, 0, -1, true, 16, false, true);
      cb.spawnFloatingText(dragon.x, dragon.y - 26, '💎 NECK GEM: 5,000 DMG!', '#fde047', 1.2);
    } else {
      const minor = 1800;
      audio.hitImpact(false);
      cb.damageEnemyDirect(dragon, minor, 25, 0, -1, false, 8, false, true);
    }
    return true;
  }

  public triggerMountDodge(): boolean {
    if (!this.mount.active) return false;
    if (this.mount.dodgeCooldown > 0 || this.mount.dodgeTimer > 0) return true;
    this.mount.dodgeTimer = 0.3;
    this.mount.dodgeCooldown = 0.55;
    audio.dodgeRoll();
    return true;
  }

  private updateDragonMount(
    dt: number,
    dragon: Enemy,
    player: PlayerState,
    cb: DragonCombatCallbacks
  ) {
    const m = this.mount;
    m.timer -= dt;
    m.scrollOffset = (m.scrollOffset + dt * 260) % 270;
    if (m.slashCooldown > 0) m.slashCooldown = Math.max(0, m.slashCooldown - dt);
    if (m.slashAnimTimer > 0) m.slashAnimTimer = Math.max(0, m.slashAnimTimer - dt);
    if (m.dodgeTimer > 0) m.dodgeTimer = Math.max(0, m.dodgeTimer - dt);
    if (m.dodgeCooldown > 0) m.dodgeCooldown = Math.max(0, m.dodgeCooldown - dt);

    // Spawn arc-lightning spikes along dorsal plates
    m.spikeSpawnTimer -= dt;
    if (m.spikeSpawnTimer <= 0) {
      m.spikeSpawnTimer = 0.55;
      m.lightningSpikes.push({
        laneX: (Math.random() * 1.6) - 0.8,
        spineY: 0.35 + Math.random() * 0.55,
        warn: 0.65,
        active: 0.35,
      });
    }

    const nextSpikes: typeof m.lightningSpikes = [];
    for (const sp of m.lightningSpikes) {
      if (sp.warn > 0) {
        sp.warn -= dt;
        nextSpikes.push(sp);
      } else {
        sp.active -= dt;
        if (
          m.dodgeTimer <= 0 &&
          player.invulnTimer <= 0 &&
          Math.abs(sp.laneX - m.playerLaneX) < 0.28 &&
          Math.abs(sp.spineY - m.playerSpineY) < 0.16
        ) {
          cb.damagePlayer(Math.round(dragon.atk * 0.85), player.x, player.y);
        }
        if (sp.active > 0) nextSpikes.push(sp);
      }
    }
    m.lightningSpikes = nextSpikes;

    if (m.timer <= 0 || dragon.hp <= 0) {
      // Backflip Dismount Slam!
      m.active = false;
      player.x = Math.max(96, Math.min(512, dragon.x));
      player.y = Math.max(88, Math.min(312, dragon.y + 44));
      player.invulnTimer = 0.9;
      player.happyJumpTimer = 0.6;

      const ds = ensureDragonState(dragon);
      ds.altitude = 'exhausted';
      ds.skyHeight = 0;
      ds.flightTimer = 0;
      ds.flightCooldown = ds.wingsBroken ? 14.0 : 12.0;
      ds.headExposedTimer = 6.0;
      ds.coreCracked = true;

      if (dragon.hp > 0) {
        const dismountCrash = 15000 + m.neckGemHits * 1500;
        audio.skyCrash();
        cb.shake(0.45, 5.5);
        cb.vfx.spawnShockwave(dragon.x, dragon.y, 76, '#38bdf8', 0.42);
        cb.damageEnemyDirect(dragon, dismountCrash, 100, 0, 1, true, 55, false, true);
        cb.spawnFloatingText(
          dragon.x,
          dragon.y - 28,
          `⚔️ SPINE-BREAKER DISMOUNT: -${dismountCrash.toLocaleString()} HP!`,
          '#38bdf8',
          1.3
        );
        cb.pushToast(
          `⚔️ Backflipped off Ignis-Bahamut! ${m.neckGemHits} Neck Gem Strikes slammed Bahamut down (-${dismountCrash.toLocaleString()} HP + 5s Head Exposed)!`,
          'gold'
        );
      }
    }
  }

  private updateSingleDragon(
    e: Enemy,
    dt: number,
    player: PlayerState,
    allies: AlliedCatSoldier[],
    projectiles: Projectile[],
    hazards: HazardPool[],
    feathers: GoldenFeatherPickup[],
    cb: DragonCombatCallbacks
  ) {
    const ds = ensureDragonState(e);
    const isBahamut = e.archetype === 'bahamut';
    const hasHoardBoost = this.hoardPiles.length > 0;
    const speedMult = hasHoardBoost ? 1.22 : 1.0;

    if (ds.headExposedTimer > 0) {
      ds.headExposedTimer = Math.max(0, ds.headExposedTimer - dt);
      if (ds.headExposedTimer === 0 && ds.altitude === 'exhausted') {
        ds.altitude = 'ground';
      }
    }

    // ------------------------------------------------------------------
    // ACT 122 BAHAMUT SUPERNOVA (6.0s 99,999 DMG WIPE AT <=25% PHASE 3!) + AEGIS DOME + UPDRAFTS
    // ------------------------------------------------------------------
    if (isBahamut && (e.kind === 'bahamut_p2' || e.kind === 'bahamut_p3' || e.hp < e.maxHp * 0.65)) {
      if (ds.supernovaWindup > 0) {
        ds.supernovaWindup -= dt;
        e.x += (304 - e.x) * Math.min(1, dt * 3);
        e.y += (124 - e.y) * Math.min(1, dt * 3);
        if (ds.supernovaWindup <= 0) {
          // Detonate World-Breaker Supernova!
          audio.skyCrash();
          cb.shake(0.75, 7.5);
          cb.vfx.spawnShockwave(304, 180, 265, '#ef4444', 0.6);
          cb.spawnParticles(304, 180, '#f97316', 44, 150);
          if (!this.mount.active) {
            const insideDome =
              this.aegisDome.active &&
              Math.hypot(player.x - this.aegisDome.x, player.y - this.aegisDome.y) <= this.aegisDome.radius + 4;
            if (insideDome) {
              cb.spawnFloatingText(player.x, player.y - 20, '🛡️ AEGIS DOME PROTECTED!', '#fde047', 1.25);
              cb.pushToast('🛡️ King Leo & Wolf-King Fenrir’s Aegis Dome shielded you from 99,999 DMG Supernova!', 'gold');
            } else {
              const wipeDmg = ds.supernovaPhase3Triggered ? 99999 : Math.round(e.atk * 2.2);
              cb.damagePlayer(wipeDmg, e.x, e.y, {
                trueDamage: ds.supernovaPhase3Triggered,
                ignoreInvuln: ds.supernovaPhase3Triggered,
                applyMortalWound: true,
              });
            }
          }
          ds.headExposedTimer = 4.0;
          ds.altitude = 'exhausted';
          cb.spawnFloatingText(e.x, e.y - 28, '💫 SUPERNOVA EXHAUSTED · HEAD EXPOSED!', '#fde047', 1.22);
        }
        return;
      }

      // Mandatory Phase 3 <= 25% HP World-Breaker Supernova Wipe Check (6.0s)!
      if (e.kind === 'bahamut_p3' && e.hp <= e.maxHp * 0.25 && !ds.supernovaPhase3Triggered) {
        ds.supernovaPhase3Triggered = true;
        ds.supernovaWindup = 6.0;
        ds.altitude = 'ground';
        ds.skyHeight = 0;
        this.aegisDome = {
          active: true,
          x: 304,
          y: 232,
          radius: 44,
          timer: 6.3,
          maxTimer: 6.3,
        };
        this.updrafts.push(
          { id: `p3_upd_w_${Date.now()}`, x: 190, y: 196, radius: 22, life: 6.4, maxLife: 6.4 },
          { id: `p3_upd_e_${Date.now()}`, x: 418, y: 196, radius: 22, life: 6.4, maxLife: 6.4 }
        );
        audio.bossRoar();
        cb.shake(0.5, 5.5);
        cb.spawnFloatingText(e.x, e.y - 32, '☢️ WORLD-BREAKER SUPERNOVA (6.0s · 99,999 DMG)!', '#ef4444', 1.35);
        cb.pushToast(
          '☢️ WORLD-BREAKER SUPERNOVA (6.0s -> 99,999 DMG)! Shelter inside Leo & Fenrir’s AEGIS DOME or ride an UPDRAFT to smash the Neck Core!',
          'amber'
        );
        return;
      }

      e.specialSkillCooldown = (e.specialSkillCooldown ?? 8.5) - dt;
      if (e.specialSkillCooldown <= 0 && ds.altitude !== 'exhausted') {
        e.specialSkillCooldown = e.kind === 'bahamut_p3' ? 12.5 : 15.0;
        ds.supernovaWindup = 3.2;
        this.aegisDome = {
          active: true,
          x: 304,
          y: 232,
          radius: 50,
          timer: 3.5,
          maxTimer: 3.5,
        };
        this.updrafts.push(
          { id: `upd_w_${Date.now()}`, x: 186, y: 196, radius: 22, life: 7.5, maxLife: 7.5 },
          { id: `upd_e_${Date.now()}`, x: 422, y: 196, radius: 22, life: 7.5, maxLife: 7.5 }
        );
        audio.bossRoar();
        cb.shake(0.35, 4);
        cb.pushToast(
          '🔥 WORLD-BREAKER SUPERNOVA! Enter Leo & Fenrir’s AEGIS DOME or ride Great Duck’s UPDRAFT GEYSER!',
          'amber'
        );
        return;
      }
    }

    // ------------------------------------------------------------------
    // SKY-FLIGHT ALTITUDE MODE
    // ------------------------------------------------------------------
    if (ds.altitude === 'sky') {
      ds.skyHeight = Math.min(1, ds.skyHeight + dt * 2.5);
      ds.flightTimer -= dt;

      // Rapidly glide in a sweeping figure-8 across the arena
      const t = performance.now() * 0.0015;
      const targetX = 304 + Math.sin(t) * 165;
      const targetY = 180 + Math.sin(t * 2) * 72;
      const dx = targetX - e.x;
      const dy = targetY - e.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const flySpeed = (e.speed * 1.95) * speedMult;
      e.x = Math.max(78, Math.min(530, e.x + (dx / d) * flySpeed * dt));
      e.y = Math.max(76, Math.min(292, e.y + (dy / d) * flySpeed * dt));
      e.facing = dx >= 0 ? 'right' : 'left';

      // Spawn 10-Dragonkin Sky-Ambush Squad once per Sky-Flight (Act 122 Bahamut)
      if (isBahamut && !ds.skyAmbushTriggered && cb.spawnDragonkinSquad) {
        ds.skyAmbushTriggered = true;
        cb.spawnDragonkinSquad(e.x, e.y);
      }

      // Spawn Updraft Geysers in Act 122 during Sky-Flight so player can mount Bahamut!
      if (isBahamut && this.updrafts.length < 2 && Math.random() < dt * 0.75) {
        const ux = 186 + Math.random() * 236;
        const uy = 148 + Math.random() * 108;
        this.updrafts.push({
          id: `sky_upd_${Date.now()}_${Math.random()}`,
          x: ux,
          y: uy,
          radius: 22,
          life: 6.5,
          maxLife: 6.5,
        });
        cb.spawnParticles(ux, uy, '#38bdf8', 10, 65);
      }

      // Strafing Carpet-Bomb Fire Lanes + Overlapping Meteor Hellfire Grids + Tornado Vortices!
      ds.carpetBombTimer -= dt;
      if (ds.carpetBombTimer <= 0) {
        ds.carpetBombTimer = isBahamut ? 1.15 : 1.55;
        const angle = Math.atan2(player.y - e.y, player.x - e.x) + (Math.random() - 0.5) * 0.4;
        const halfLen = 84;
        this.carpetLanes.push({
          id: `lane_${Date.now()}_${Math.random()}`,
          x1: Math.max(56, Math.min(552, player.x - Math.cos(angle) * halfLen)),
          y1: Math.max(56, Math.min(316, player.y - Math.sin(angle) * halfLen)),
          x2: Math.max(56, Math.min(552, player.x + Math.cos(angle) * halfLen)),
          y2: Math.max(56, Math.min(316, player.y + Math.sin(angle) * halfLen)),
          warnTimer: 0.75,
          activeTimer: 1.5,
          damage: Math.round(e.atk * 0.9),
          hitTick: 0.1,
        });

        if (isBahamut) {
          // Overlapping Meteor Hellfire Grid (cross/diamond pattern)
          const gridOffsets = [
            { ox: 0, oy: 0 },
            { ox: -36, oy: -28 },
            { ox: 36, oy: -28 },
            { ox: 0, oy: 36 },
          ];
          for (let gi = 0; gi < gridOffsets.length; gi++) {
            const go = gridOffsets[gi];
            hazards.push({
              id: `bah_grid_${Date.now()}_${gi}_${Math.random()}`,
              x: Math.max(110, Math.min(498, player.x + go.ox)),
              y: Math.max(84, Math.min(296, player.y + go.oy)),
              radius: 26,
              life: 0.95,
              kind: 'meteor_warn',
              damagePerSec: Math.round(e.atk * 1.15),
              triggered: false,
              applyMortalWound: true,
            });
          }
          if (this.tornadoes.length < 2) {
            const ta = Math.random() * Math.PI * 2;
            this.tornadoes.push({
              id: `torn_${Date.now()}_${Math.random()}`,
              x: e.x,
              y: e.y,
              vx: Math.cos(ta) * 58,
              vy: Math.sin(ta) * 58,
              radius: 20,
              life: 6.5,
              damage: Math.round(e.atk * 0.75),
              hitTick: 0.2,
            });
          }
        }
        audio.laserBeam();
      }

      if (ds.flightTimer <= 0) {
        ds.altitude = 'ground';
        ds.skyHeight = 0;
        ds.harpoonChainsHit = 0;
        ds.skyAmbushTriggered = false;
        ds.flightCooldown = ds.wingsBroken ? 14.0 : 12.0;
        cb.vfx.spawnShockwave(e.x, e.y, 46, '#f97316', 0.35);
        cb.spawnFloatingText(e.x, e.y - 20, '🐉 DRAGON LANDED!', '#fb923c', 1.15);
      }
      return;
    }

    ds.skyHeight = Math.max(0, ds.skyHeight - dt * 3);

    // ------------------------------------------------------------------
    // EXHAUSTED STATE (Head Weak-Point 3.0x CRIT on Ground)
    // ------------------------------------------------------------------
    if (ds.altitude === 'exhausted') {
      if (Math.random() < dt * 4) {
        cb.vfx.spawnSingleParticle(
          e.x + (Math.random() - 0.5) * 18,
          e.y - 8,
          (Math.random() - 0.5) * 12,
          -14,
          '#fde047',
          2,
          0.4
        );
      }
      return;
    }

    // ------------------------------------------------------------------
    // GROUND STANCE: HOARD VORTEX, TAIL-WHIP, WIND-GALE, BREATH -> EXHAUST
    // ------------------------------------------------------------------
    const dist = Math.hypot(player.x - e.x, player.y - e.y);
    const nx = dist > 0.1 ? (player.x - e.x) / dist : 0;
    const ny = dist > 0.1 ? (player.y - e.y) / dist : 1;

    // 1. Hoard Theft Vortex
    if (ds.hoardTheftWindup > 0) {
      ds.hoardTheftWindup -= dt;
      // Pull player & loose Golden Feathers gently toward the dragon
      if (dist > 28 && dist < 190 && player.dodgeTimer <= 0) {
        player.vx -= nx * 135 * dt;
        player.vy -= ny * 135 * dt;
      }
      for (const f of feathers) {
        const fd = Math.hypot(e.x - f.x, e.y - f.y);
        if (fd > 4) {
          f.x += ((e.x - f.x) / fd) * 120 * dt;
          f.y += ((e.y - f.y) / fd) * 120 * dt;
        }
      }
      if (ds.hoardTheftWindup <= 0) {
        // Execute theft!
        const stolenGold = Math.min(player.gold, 120);
        player.gold -= stolenGold;
        const stolenPotions = player.healthPotions > 1 ? 1 : 0;
        player.healthPotions -= stolenPotions;
        const stoleElixir = player.duckElixirActive;
        if (stoleElixir) {
          player.duckElixirActive = false;
          player.duckElixirTimer = 0;
          player.duckElixirCooldown = 18;
        }
        const stolenGearAtkDebuff = stoleElixir ? 0 : 12;
        const px = Math.max(72, Math.min(536, e.x + (Math.random() > 0.5 ? 36 : -36)));
        const py = Math.max(76, Math.min(304, e.y + 24));
        this.hoardPiles.push({
          id: `hoard_${Date.now()}`,
          x: px,
          y: py,
          hp: 3,
          maxHp: 3,
          stolenGold,
          stolenPotions,
          stoleElixir,
          stolenGearAtkDebuff,
          stolenGearLabel: stoleElixir ? 'Astral Elixir Buff' : 'Starlight Weapon Blessing',
          life: 18.0,
        });
        cb.vfx.spawnShockwave(e.x, e.y, 56, '#fde047', 0.35);
        cb.spawnFloatingText(
          px,
          py - 18,
          stoleElixir ? '💰 STOLE ELIXIR! SLASH PILE (3 HITS)!' : '💰 HOARD STOLEN! SLASH PILE (3 HITS)!',
          '#fde047',
          1.22
        );
        cb.pushToast(
          '💰 Dragon Hoard Theft! Slash the glowing Stolen Treasure Pile (3 hits) to reclaim loot + gain +100% Fury!',
          'amber'
        );
      }
      return;
    }

    // 2. Wind-Gale Pushback (Disabled when Wings Shattered!)
    if (ds.windGaleWindup > 0) {
      ds.windGaleWindup -= dt;
      if (ds.windGaleWindup <= 0) {
        audio.windGale();
        cb.shake(0.28, 3.8);
        cb.vfx.spawnShockwave(e.x, e.y, 92, '#bae6fd', 0.42);
        cb.spawnParticles(e.x, e.y, '#e0f2fe', 26, 150);
        cb.spawnFloatingText(e.x, e.y - 24, '💨 HURRICANE WIND-GALE!', '#7dd3fc', 1.2);
        if (dist < 145 && player.dodgeTimer <= 0) {
          player.vx += nx * 280;
          player.vy += ny * 280;
        }
        for (const ally of allies) {
          const adx = ally.x - e.x;
          const ady = ally.y - e.y;
          const ad = Math.max(1, Math.hypot(adx, ady));
          if (ad < 145) {
            ally.x = Math.max(36, Math.min(570, ally.x + (adx / ad) * 44));
            ally.y = Math.max(44, Math.min(330, ally.y + (ady / ad) * 44));
          }
        }
      }
      return;
    }

    // 3. 270° Tail-Whip Sweep (Disabled when Tail Severed!)
    if (ds.tailWhipWindup > 0) {
      ds.tailWhipWindup -= dt;
      if (ds.tailWhipWindup <= 0) {
        audio.hitImpact(true);
        cb.shake(0.26, 4.0);
        cb.vfx.spawnShockwave(e.x, e.y, 68, '#f43f5e', 0.34);
        cb.spawnParticles(e.x, e.y, '#f43f5e', 20, 120);
        if (dist <= 76) {
          cb.damagePlayer(Math.round(e.atk * 1.15), e.x, e.y, { applyMortalWound: true });
        }
      }
      return;
    }

    // 4. Mega Breath Beam -> Exhausted State (Exposes 3.0x CRIT Head!)
    if (ds.breathWindup > 0) {
      ds.breathWindup -= dt;
      if (ds.breathWindup <= 0) {
        audio.laserBeam();
        cb.shake(0.35, 4.5);
        const endX = e.x + Math.cos(ds.breathAngle) * 185;
        const endY = e.y + Math.sin(ds.breathAngle) * 185;
        hazards.push({
          id: `drg_breath_${Date.now()}`,
          x: e.x,
          y: e.y,
          x2: endX,
          y2: endY,
          radius: 15,
          life: 0.72,
          kind: 'lightning_line',
          damagePerSec: e.atk * 1.25,
          triggered: false,
          applyMortalWound: true,
        });
        for (let i = -1; i <= 1; i++) {
          const a = ds.breathAngle + i * 0.24;
          projectiles.push({
            id: `drg_fb_${Date.now()}_${i}`,
            fromPlayer: false,
            x: e.x,
            y: e.y,
            vx: Math.cos(a) * 160,
            vy: Math.sin(a) * 160,
            radius: 5.5,
            damage: e.atk,
            life: 1.75,
            maxLife: 1.75,
            color: i === 0 ? '#4ade80' : '#f97316',
            coreColor: '#fef08a',
            kind: 'fireball',
            reflectable: i === 0,
            applyMortalWound: true,
          });
        }
        if (isBahamut && this.tornadoes.length < 3) {
          const ta = ds.breathAngle + (Math.random() > 0.5 ? 0.5 : -0.5);
          this.tornadoes.push({
            id: `torn_g_${Date.now()}`,
            x: e.x,
            y: e.y,
            vx: Math.cos(ta) * 65,
            vy: Math.sin(ta) * 65,
            radius: 19,
            life: 5.5,
            damage: Math.round(e.atk * 0.75),
            hitTick: 0.2,
          });
        }
        // Dragon drops head in exhaustion for 4.5s!
        ds.altitude = 'exhausted';
        ds.headExposedTimer = 4.5;
        cb.spawnFloatingText(e.x, e.y - 26, '💫 BREATH EXHAUSTED · HEAD 3.0x CRIT!', '#fde047', 1.24);
      }
      return;
    }

    // Standard Ground Pursuit & Timers
    cb.moveWithCollision(e, (nx * e.speed * speedMult + e.vx) * dt, (ny * e.speed * speedMult + e.vy) * dt);

    // Timers
    ds.flightCooldown -= dt;
    ds.windGaleTimer -= dt;
    ds.tailWhipTimer -= dt;
    ds.hoardTheftTimer -= dt;

    // Trigger Sky-Flight if cooldown ready
    if (ds.flightCooldown <= 0 && !e.shielded) {
      ds.altitude = 'sky';
      ds.harpoonChainsHit = 0;
      ds.skyAmbushTriggered = false;
      ds.flightTimer = ds.wingsBroken ? 6.0 : 12.0;
      ds.carpetBombTimer = 0.75;
      audio.bossRoar();
      cb.vfx.spawnShockwave(e.x, e.y, 58, '#f97316', 0.36);
      cb.spawnFloatingText(
        e.x,
        e.y - 26,
        ds.wingsBroken ? '🦅 SKY-FLIGHT (6s · WINGS SHATTERED!)' : '🦅 SKY-FLIGHT! ALIGN BALLISTAS [E]!',
        '#fde047',
        1.25
      );
      cb.pushToast(
        '🦅 Dragon ascended to SKY-FLIGHT! Align 2 Corner Ballistas [E] with the reticle (or ride Updrafts) to SKY-CRASH it!',
        'gold'
      );
      return;
    }

    // Trigger Hoard Theft Vortex
    if (ds.hoardTheftTimer <= 0 && this.hoardPiles.length < 1 && !e.shielded) {
      ds.hoardTheftTimer = 15.0;
      ds.hoardTheftWindup = 1.05;
      audio.hoardVortex();
      cb.spawnFloatingText(e.x, e.y - 24, '🌀 HOARD THEFT VORTEX!', '#fbbf24', 1.2);
      return;
    }

    // Trigger Tail-Whip if Nyx is behind Dragon and tail not severed
    if (!ds.tailSevered && ds.tailWhipTimer <= 0 && dist < 82) {
      const partBehind = resolveDragonHitPart(e, player.x, player.y) === 'tail';
      if (partBehind) {
        ds.tailWhipTimer = 3.2;
        ds.tailWhipWindup = 0.55;
        cb.spawnFloatingText(e.x, e.y - 22, '⚠️ TAIL WHIP SWEEP!', '#f43f5e', 1.15);
        return;
      }
    }

    // Trigger Wind-Gale Pushback if Wings not broken
    if (!ds.wingsBroken && ds.windGaleTimer <= 0 && dist < 135) {
      ds.windGaleTimer = 6.0;
      ds.windGaleWindup = 0.6;
      cb.spawnFloatingText(e.x, e.y - 22, '💨 WING GALE INCOMING!', '#7dd3fc', 1.15);
      return;
    }

    // Regular Breath Beam Windup (Relentless 1.2s cadence on Bahamut!)
    if (e.attackCooldown <= 0 && dist < 210) {
      e.attackCooldown = isBahamut ? 1.2 : 2.6;
      ds.breathWindup = 0.78;
      ds.breathAngle = Math.atan2(player.y - e.y, player.x - e.x);
      cb.spawnFloatingText(e.x, e.y - 22, '🔥 MEGA BREATH CHARGING!', '#f97316', 1.15);
      return;
    }

    if (dist < (e.width + player.width) * 0.46) {
      cb.damagePlayer(e.atk, e.x, e.y);
    }
  }

  private pointToSegmentDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // =========================================================================
  // ZERO-LAG WORLD RENDERING HELPERS (No shadowBlur / per-frame radialGrad)
  // =========================================================================
  public renderArenaFeatures(
    ctx: CanvasRenderingContext2D,
    enemies: Enemy[],
    globalTime: number
  ) {
    const dragon = enemies.find((e) => isDragonBossEnemy(e) && e.hp > 0);
    const ds = dragon ? ensureDragonState(dragon) : null;

    // 1. Act 122 World-Breaker Supernova Arena Red Floor Pulse + Countdown Banner
    if (ds && ds.supernovaWindup > 0) {
      const pulse = 0.16 + 0.14 * Math.sin(globalTime * 18);
      ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
      ctx.fillRect(0, 0, 608, 384);
      ctx.save();
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#09090b';
      ctx.fillText(
        `☢️ SUPERNOVA: ${ds.supernovaWindup.toFixed(1)}s · ENTER AEGIS DOME OR MOUNT!`,
        305,
        35
      );
      ctx.fillStyle = '#fef08a';
      ctx.fillText(
        `☢️ SUPERNOVA: ${ds.supernovaWindup.toFixed(1)}s · ENTER AEGIS DOME OR MOUNT!`,
        304,
        34
      );
      ctx.restore();
    }

    // 1B. Swirling Dragon Tornado Vortices
    for (const torn of this.tornadoes) {
      const tx = Math.round(torn.x);
      const ty = Math.round(torn.y);
      ctx.save();
      ctx.fillStyle = 'rgba(125, 211, 252, 0.22)';
      ctx.beginPath();
      ctx.arc(tx, ty, torn.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      for (let ring = 0; ring < 3; ring++) {
        const rr = 6 + ring * 5 + Math.sin(globalTime * 12 + ring) * 2;
        const startA = globalTime * (8 + ring * 2) + ring;
        ctx.beginPath();
        ctx.arc(tx, ty, rr, startA, startA + Math.PI * 1.35);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Diagonal Carpet-Bomb Fire Lanes
    for (const lane of this.carpetLanes) {
      ctx.save();
      if (lane.warnTimer > 0) {
        ctx.strokeStyle = Math.sin(globalTime * 22) > 0 ? '#fde047' : '#ef4444';
        ctx.lineWidth = 10;
        ctx.globalAlpha = 0.35;
      } else {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 14;
        ctx.globalAlpha = 0.55;
      }
      ctx.beginPath();
      ctx.moveTo(lane.x1, lane.y1);
      ctx.lineTo(lane.x2, lane.y2);
      ctx.stroke();

      ctx.strokeStyle = lane.warnTimer > 0 ? '#ef4444' : '#fef08a';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(lane.x1, lane.y1);
      ctx.lineTo(lane.x2, lane.y2);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Updraft Wind-Geysers (Act 122)
    for (const g of this.updrafts) {
      const gx = Math.round(g.x);
      const gy = Math.round(g.y);
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.24)';
      ctx.beginPath();
      ctx.ellipse(gx, gy, g.radius, g.radius * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Rising spiral wind ticks
      for (let i = 0; i < 4; i++) {
        const phase = (globalTime * 2.8 + i * 0.25) % 1;
        const wy = gy + 4 - phase * 24;
        const wx = gx + Math.sin(phase * Math.PI * 4 + i) * 9;
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(Math.round(wx - 2), Math.round(wy), 4, 2);
      }
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#bae6fd';
      ctx.fillText('🌀 UPDRAFT MOUNT', gx, gy - 22);
      ctx.restore();
    }

    // 4. Golden-Violet Dual-Kingdom Aegis Dome (Act 122 Supernova Safe Zone)
    if (this.aegisDome.active) {
      const d = this.aegisDome;
      ctx.save();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius - 5 + Math.sin(globalTime * 10) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('🛡️ AEGIS DOME (SAFE ZONE)', Math.round(d.x), Math.round(d.y - d.radius - 5));
      ctx.restore();
    }

    // 5. 4 Corner Dragon-Binder Harpoon Ballistas
    for (const b of this.ballistas) {
      const bx = Math.round(b.x);
      const by = Math.round(b.y);
      ctx.save();
      // Timber & Steel Base
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bx - 9, by - 9, 18, 18);
      ctx.strokeStyle = b.lockedOn && b.cooldown <= 0 ? '#fde047' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx - 9.5, by - 9.5, 19, 19);

      // Rotating Ballista Bow & Starlight Harpoon Bolt
      ctx.translate(bx, by);
      ctx.rotate(b.aimAngle);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-5, -2, 12, 4);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(2, -7, 3, 14);
      if (b.cooldown <= 0) {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(3, -1, 10, 2);
      }
      ctx.restore();

      // Ballista Aim Sight-Line & Alignment Reticle when Dragon is in Sky-Flight!
      if (b.cooldown <= 0 && ds && ds.altitude === 'sky') {
        ctx.save();
        ctx.strokeStyle = b.lockedOn ? 'rgba(250, 204, 21, 0.78)' : 'rgba(148, 163, 184, 0.35)';
        ctx.lineWidth = b.lockedOn ? 1.8 : 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(b.aimAngle) * 260, by + Math.sin(b.aimAngle) * 260);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        const pulse = 13 + Math.sin(globalTime * 12) * 2;
        ctx.strokeStyle = b.lockedOn ? '#fde047' : '#94a3b8';
        ctx.beginPath();
        ctx.arc(bx, by, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = b.lockedOn ? '#fde047' : '#cbd5e1';
        ctx.fillText(b.lockedOn ? '🎯 ALIGNED! [E]' : '⏳ AIMING...', bx, by - 14);
      } else if (b.cooldown > 0) {
        ctx.font = 'bold 5px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${Math.ceil(b.cooldown)}s`, bx, by - 12);
      }
    }

    // 6. Blazing Harpoon Chain Tethers
    for (const t of this.harpoonTethers) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    // 7. Stolen Treasure Hoard Piles
    for (const pile of this.hoardPiles) {
      const px = Math.round(pile.x);
      const py = Math.round(pile.y);
      ctx.save();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
      ctx.beginPath();
      ctx.arc(px, py, 16 + Math.sin(globalTime * 8) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px - 9, py - 4, 18, 9);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px - 7, py - 7, 14, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px - 2, py - 9, 4, 4);
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`💎 SLASH (${pile.hp}/3)`, px, py - 13);
      ctx.restore();
    }
  }

  public renderDragonPreEffects(ctx: CanvasRenderingContext2D, e: Enemy, globalTime: number) {
    if (!isDragonBossEnemy(e)) return;
    const ds = ensureDragonState(e);

    // 72x72 Gliding Dark Pixel Shadow in Sky-Flight!
    if (ds.altitude === 'sky' || ds.skyHeight > 0.05) {
      ctx.save();
      ctx.fillStyle = 'rgba(3, 6, 16, 0.56)';
      ctx.beginPath();
      ctx.ellipse(Math.round(e.x), Math.round(e.y + 8), 36, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (ds.altitude === 'sky') {
        // Golden Lock-On Target Reticle around Sky Shadow
        const r = 38 + Math.sin(globalTime * 10) * 3;
        ctx.strokeStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(e.x, e.y + 8, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Wind-Gale / Tail-Whip / Hoard Vortex / Breath Telegraphs
    if (ds.tailWhipWindup > 0) {
      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 74, 0, Math.PI * 1.5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (ds.windGaleWindup > 0) {
      ctx.save();
      ctx.strokeStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 44 + (1 - ds.windGaleWindup / 0.62) * 86, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (ds.hoardTheftWindup > 0) {
      ctx.save();
      ctx.strokeStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(e.x, e.y, 88 * (ds.hoardTheftWindup / 1.05), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (ds.breathWindup > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.72)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + Math.cos(ds.breathAngle) * 185, e.y + Math.sin(ds.breathAngle) * 185);
      ctx.stroke();
      ctx.restore();
    }
  }

  public renderDragonPostOverlays(
    ctx: CanvasRenderingContext2D,
    e: Enemy,
    _drawW: number,
    drawH: number,
    globalTime: number
  ) {
    if (!isDragonBossEnemy(e)) return;
    const ds = ensureDragonState(e);
    const drawY = e.y - ds.skyHeight * 28;

    ctx.save();
    // Cracked Molten Core glow vs Hardened Scales shield indicator
    if (!ds.coreCracked && ds.altitude !== 'sky') {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.strokeRect(Math.round(e.x - 10), Math.round(drawY - 4), 20, 14);
    } else if (ds.coreCracked) {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.35)';
      ctx.fillRect(Math.round(e.x - 8), Math.round(drawY - 2), 16, 10);
    }

    // Exposed Head Weak-Point 3.0x CRIT Target!
    if (ds.headExposedTimer > 0) {
      const hx = Math.round(e.x + (e.facing === 'left' ? -14 : e.facing === 'right' ? 14 : 0));
      const hy = Math.round(drawY + (e.facing === 'up' ? -16 : e.facing === 'down' ? 14 : -10));
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hx, hy, 10 + Math.sin(globalTime * 14) * 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.fillText('🎯 HEAD 3.0x!', hx, hy - 12);
    }

    // Sky-Flight Harpoon counter tag
    if (ds.altitude === 'sky') {
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`⛓️ HARPOONS ${ds.harpoonChainsHit}/2`, Math.round(e.x), Math.round(drawY - drawH * 0.55));
    }
    ctx.restore();
  }

  public renderDragonMountOverlay(
    ctx: CanvasRenderingContext2D,
    nyxSprite: HTMLCanvasElement,
    logicalW: number,
    logicalH: number,
    globalTime: number
  ) {
    if (!this.mount.active) return;
    const m = this.mount;
    ctx.save();

    // 1. High-altitude Sky & Racing Storm Clouds Parallax
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, logicalW, logicalH);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(0, 0, logicalW, 88);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(0, logicalH - 64, logicalW, 64);

    for (let i = 0; i < 14; i++) {
      const cy = ((i * 38 + m.scrollOffset) % (logicalH + 40)) - 20;
      const cx = (i * 97) % logicalW;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(226, 232, 240, 0.25)' : 'rgba(251, 146, 60, 0.22)';
      ctx.fillRect(Math.round(cx), Math.round(cy), 56 + (i % 3) * 18, 12);
    }

    // 2. Giant Armored Dragon Spine Deck (88px wide corridor down screen center)
    const deckX = logicalW / 2 - 58;
    const deckW = 116;
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(deckX, 16, deckW, logicalH - 32);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(deckX + 10, 16, deckW - 20, logicalH - 32);
    // Dorsal Spine Ridge Plates
    for (let s = 0; s < 10; s++) {
      const sy = 34 + s * 22;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(logicalW / 2 - 6, sy, 12, 8);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(logicalW / 2 - 4, sy + 2, 8, 4);
    }

    // 3. Stolen Starlight Gem embedded in Bahamut's Neck (Top Center!)
    const gemX = logicalW / 2;
    const gemY = 42;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.beginPath();
    ctx.arc(gemX, gemY, 24 + Math.sin(globalTime * 12) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(gemX - 11, gemY - 11, 22, 22);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(gemX - 7, gemY - 7, 14, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gemX - 3, gemY - 3, 6, 6);
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('💎 SLASH NECK GEM! (5,000 DMG)', gemX, gemY - 17);

    // 4. Arc-Lightning Spikes along Spine
    for (const sp of m.lightningSpikes) {
      const sx = logicalW / 2 + sp.laneX * 42;
      const sy = 216 - sp.spineY * 165;
      if (sp.warn > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.beginPath();
        ctx.arc(sx, sy, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(sx, sy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(sx - 2), Math.round(sy - 12), 4, 24);
      }
    }

    // 5. Nyx Running & Slashing on Bahamut's Back!
    const nx = Math.round(logicalW / 2 + m.playerLaneX * 42);
    const ny = Math.round(216 - m.playerSpineY * 165);
    ctx.drawImage(nyxSprite, nx - 12, ny - 12, 24, 24);
    if (m.slashAnimTimer > 0) {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(nx, ny - 8, 18, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }

    // 6. Airborne Mount Header Banner
    ctx.fillStyle = 'rgba(9, 13, 28, 0.88)';
    ctx.fillRect(108, 4, 264, 16);
    ctx.strokeStyle = '#fde047';
    ctx.strokeRect(108, 4, 264, 16);
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText(
      `⚔️ MOUNTED ON BAHAMUT! ${m.timer.toFixed(1)}s · GEM HITS: ${m.neckGemHits}`,
      logicalW / 2,
      15
    );
    ctx.restore();
  }
}
