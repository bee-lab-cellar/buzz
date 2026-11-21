import { findNearestDryTile, isWalkableTile, snapEntityToDryLand, TILE_SIZE } from './acts';
import { Enemy, HazardPool, PartyCompanion, PlayableHeroId, PlayerState, Projectile } from './types';

export const HERO_METADATA: Record<
  PlayableHeroId,
  {
    id: PlayableHeroId;
    keyNum: '1' | '2' | '3' | '4';
    name: string;
    shortName: string;
    title: string;
    unlockAct: number;
    speedMult: number;
    atkMult: number;
    defMult: number;
    floatsOverHazards: boolean;
    color: string;
    specialDesc: string;
  }
> = {
  nyx: {
    id: 'nyx',
    keyNum: '1',
    name: 'Nyx the Wizard Cat',
    shortName: 'Nyx',
    title: 'Arcane Blade-Cat & Alchemist',
    unlockAct: 1,
    speedMult: 1.05,
    atkMult: 1.0,
    defMult: 1.0,
    floatsOverHazards: false,
    color: '#38bdf8',
    specialDesc: 'Fast 4-Hit Arcane Combos + BlockCraft Alchemy Flask Toss [F]',
  },
  king_leo: {
    id: 'king_leo',
    keyNum: '2',
    name: 'King Leo the Lion King',
    shortName: 'King Leo',
    title: 'Sovereign of the Golden Crown',
    unlockAct: 41,
    speedMult: 0.95,
    atkMult: 1.28,
    defMult: 1.3,
    floatsOverHazards: false,
    color: '#fbbf24',
    specialDesc: 'Wide Golden Greatsword Cleaves + Starlight Gem Wand Solar Beam [Q]',
  },
  fenrir: {
    id: 'fenrir',
    keyNum: '3',
    name: 'Reformed Wolf-King Fenrir',
    shortName: 'Fenrir',
    title: 'Twin-Axe Berserker Monarch',
    unlockAct: 82,
    speedMult: 1.22,
    atkMult: 1.2,
    defMult: 1.05,
    floatsOverHazards: false,
    color: '#22d3ee',
    specialDesc: 'Ultra-Fast Dual-Axe Dashes + Blood-Moon Counter & Wolf Stampede [R]',
  },
  great_duck: {
    id: 'great_duck',
    keyNum: '4',
    name: 'The Great Duck Archmage',
    shortName: 'Great Duck',
    title: 'Supreme Sovereign of the Lotus',
    unlockAct: 121,
    speedMult: 1.12,
    atkMult: 1.18,
    defMult: 1.2,
    floatsOverHazards: true,
    color: '#fde047',
    specialDesc: 'Floats Over Lava/Water + Homing Feather Missiles & Golden Egg Dodge-Bombs!',
  },
};

export interface BossRaidRuntimeState {
  chronosHpHistory: Array<{ time: number; hp: number }>;
  chronosRewindTimer: number;
  aetherPhase: 1 | 2 | 3 | 4 | 5;
  aetherBeamAngle: number;
  aetherBeamActiveTimer: number;
  aetherBeamCooldown: number;
  oxygenBubbleSpots: Array<{ x: number; y: number }>;
}

export function createInitialBossRaidState(): BossRaidRuntimeState {
  return {
    chronosHpHistory: [],
    chronosRewindTimer: 16.0,
    aetherPhase: 1,
    aetherBeamAngle: 0,
    aetherBeamActiveTimer: 0,
    aetherBeamCooldown: 8.5,
    oxygenBubbleSpots: [
      { x: 168, y: 140 },
      { x: 304, y: 192 },
      { x: 448, y: 140 },
      { x: 304, y: 268 },
    ],
  };
}

export function syncPartyCompanions(
  player: PlayerState,
  existing: PartyCompanion[],
  grid: string[],
  excludeHeroIds: ReadonlyArray<PlayableHeroId> = []
): PartyCompanion[] {
  const excluded = new Set<PlayableHeroId>(excludeHeroIds);
  const companionIds = player.unlockedHeroes.filter(
    (h) => h !== player.activeHeroId && !excluded.has(h)
  );
  return companionIds.map((heroId, idx) => {
    const found = existing.find((c) => c.heroId === heroId);
    const meta = HERO_METADATA[heroId];
    const maxHp = Math.round(player.maxHp * 0.9);
    const atk = Math.round(player.baseAtk * meta.atkMult);
    if (found && found.hp > 0) {
      found.maxHp = maxHp;
      found.atk = atk;
      snapEntityToDryLand(found, grid, TILE_SIZE, false);
      return found;
    }
    const angle = (idx * Math.PI * 2) / Math.max(1, companionIds.length);
    const pt = findNearestDryTile(
      grid,
      player.x + Math.cos(angle) * 28,
      player.y + Math.sin(angle) * 28,
      false
    );
    return {
      heroId,
      name: meta.shortName,
      x: pt.x,
      y: pt.y,
      vx: 0,
      vy: 0,
      hp: maxHp,
      maxHp,
      atk,
      facing: player.facing,
      attackCooldown: 0.4 + idx * 0.2,
      skillCooldown: 4.5 + idx * 1.5,
      hitFlash: 0,
      animFrame: 0,
    };
  });
}

export function updatePartyCompanionsAI(
  dt: number,
  player: PlayerState,
  companions: PartyCompanion[],
  enemies: Enemy[],
  grid: string[],
  totalPlayerAtk: number,
  onCompanionHitEnemy: (comp: PartyCompanion, target: Enemy, dmg: number) => void,
  onSpawnProjectile: (proj: Projectile) => void
): void {
  for (let i = 0; i < companions.length; i++) {
    const c = companions[i];
    if (c.hitFlash > 0) c.hitFlash = Math.max(0, c.hitFlash - dt);
    if (c.attackCooldown > 0) c.attackCooldown = Math.max(0, c.attackCooldown - dt);
    if (c.skillCooldown > 0) c.skillCooldown = Math.max(0, c.skillCooldown - dt);

    // Passive companion regen
    c.hp = Math.min(c.maxHp, c.hp + c.maxHp * 0.025 * dt);

    // Find nearest living enemy within 190px or follow player formation
    let nearest: Enemy | null = null;
    let bestDist = 190;
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      const d = Math.hypot(e.x - c.x, e.y - c.y);
      if (d < bestDist) {
        bestDist = d;
        nearest = e;
      }
    }

    const formationAngle = i * 2.1 + 2.4;
    const formX = player.x + Math.cos(formationAngle) * 30;
    const formY = player.y + Math.sin(formationAngle) * 26;

    const targetX = nearest ? nearest.x : formX;
    const targetY = nearest ? nearest.y : formY;
    const dx = targetX - c.x;
    const dy = targetY - c.y;
    const dist = Math.hypot(dx, dy);

    const stopDist = c.heroId === 'great_duck' && nearest ? 85 : nearest ? 22 : 14;
    if (dist > stopDist) {
      const spd = 88;
      const nx = c.x + (dx / dist) * spd * dt;
      const ny = c.y + (dy / dist) * spd * dt;
      const tx = Math.floor(nx / TILE_SIZE);
      const ty = Math.floor(ny / TILE_SIZE);
      if (c.heroId === 'great_duck' || isWalkableTile(grid, tx, ty)) {
        c.x = nx;
        c.y = ny;
      }
      c.facing = dx >= 0 ? 'right' : 'left';
      c.animFrame = Math.floor(Date.now() / 160) % 2;
    } else {
      c.animFrame = 0;
    }

    if (nearest && c.attackCooldown <= 0) {
      const dmg = Math.max(12, Math.round(totalPlayerAtk * 0.42));
      if (c.heroId === 'great_duck') {
        c.attackCooldown = 0.85;
        const ang = Math.atan2(nearest.y - c.y, nearest.x - c.x);
        onSpawnProjectile({
          id: `comp_duck_${Date.now()}_${Math.random()}`,
          fromPlayer: true,
          x: c.x,
          y: c.y - 4,
          vx: Math.cos(ang) * 195,
          vy: Math.sin(ang) * 195,
          radius: 4,
          damage: dmg,
          life: 1.4,
          maxLife: 1.4,
          color: '#fde047',
          coreColor: '#ffffff',
          kind: 'sword_beam',
          homing: true,
        });
      } else if (dist <= 34) {
        c.attackCooldown = c.heroId === 'fenrir' ? 0.52 : 0.72;
        onCompanionHitEnemy(c, nearest, dmg);
      }
    }
  }
}

export function updateOmniverseBossMechanics(
  dt: number,
  actNum: number,
  player: PlayerState,
  enemies: Enemy[],
  raidState: BossRaidRuntimeState,
  globalTime: number,
  onToast: (msg: string, accent: 'gold' | 'cyan' | 'emerald' | 'amber') => void,
  onFloatingText: (x: number, y: number, text: string, color: string) => void,
  onSpawnHazard: (h: HazardPool) => void,
  onDamagePlayer: (dmg: number, sx: number, sy: number) => void
): {
  krakenTentaclesAlive: number;
  chronoGearsAlive: number;
  singularityPullActive: boolean;
} {
  // 1. Underwater Oxygen Bubble Mechanic (Acts 123–180 except Galleon Deck 130–136 & Sanctuary 179)
  const isUnderwaterAct =
    actNum >= 123 && actNum <= 180 && (actNum < 130 || actNum > 136) && actNum !== 179;
  if (isUnderwaterAct) {
    const nearBubble = raidState.oxygenBubbleSpots.some(
      (b) => Math.hypot(player.x - b.x, player.y - b.y) <= 28
    );
    const hasLungSkill = player.unlockedSkills.includes('duck_11');
    const harborLv = player.capitalBuildings?.abyssal_pearl_harbor ?? 1;
    const drainRate =
      player.activeHeroId === 'great_duck'
        ? 0
        : (hasLungSkill ? 1.4 : 3.2) * Math.max(0.4, 1 - (harborLv - 1) * 0.06);

    if (nearBubble || player.activeHeroId === 'great_duck' || player.duckElixirActive) {
      player.oxygenPct = Math.min(100, player.oxygenPct + 38 * dt);
    } else {
      player.oxygenPct = Math.max(0, player.oxygenPct - drainRate * dt);
      if (player.oxygenPct <= 0 && Math.floor(globalTime * 2) !== Math.floor((globalTime - dt) * 2)) {
        onDamagePlayer(Math.max(5, Math.round(player.maxHp * 0.04)), player.x, player.y);
        onFloatingText(player.x, player.y - 16, '🫧 LOW OXYGEN! STAND IN BUBBLES!', '#38bdf8');
      }
    }
  } else {
    player.oxygenPct = 100;
  }

  // 2. Act 180: Charybdis the 8-Tentacle World-Kraken
  const krakenTentaclesAlive = enemies.filter((e) => e.kind === 'kraken_tentacle' && e.hp > 0).length;

  // 3. Act 240: Chronos-Omega, The Time-Rewinding Titan
  const chronoGearsAlive = enemies.filter(
    (e) => actNum === 240 && e.kind === 'tesla_drone' && e.hp > 0
  ).length;
  const chronosBoss = enemies.find((e) => e.kind === 'chronos_omega' && e.hp > 0);
  if (chronosBoss) {
    raidState.chronosHpHistory.push({ time: globalTime, hp: chronosBoss.hp });
    raidState.chronosHpHistory = raidState.chronosHpHistory.filter((h) => globalTime - h.time <= 5.5);

    if (chronoGearsAlive > 0) {
      raidState.chronosRewindTimer -= dt;
      if (raidState.chronosRewindTimer <= 0) {
        raidState.chronosRewindTimer = 16.0;
        const snapshot = raidState.chronosHpHistory[0];
        if (snapshot && snapshot.hp > chronosBoss.hp) {
          const healAmt = Math.min(
            chronosBoss.maxHp - chronosBoss.hp,
            Math.round((snapshot.hp - chronosBoss.hp) * 0.65 + chronosBoss.maxHp * 0.05)
          );
          if (healAmt > 0) {
            chronosBoss.hp += healAmt;
            onFloatingText(
              chronosBoss.x,
              chronosBoss.y - 26,
              `⏪ 5s TIME REWIND! +${healAmt.toLocaleString()} HP!`,
              '#fde047'
            );
            onToast(
              `⏳ Chronos-Omega rewound time by 5s! Shatter the ${chronoGearsAlive} remaining Chrono-Gears to stop his Time-Rewind!`,
              'amber'
            );
          }
        }
      }
    }
  }

  // 4. Act 300: AETHER-NULL, The Eclipse Singularity (Gravitational Pull + Relativistic Beam Sweeps + 5 Phases)
  const aetherBoss = enemies.find((e) => e.kind === 'aether_null' && e.hp > 0);
  let singularityPullActive = false;
  if (aetherBoss) {
    singularityPullActive = true;
    const hpRatio = aetherBoss.hp / aetherBoss.maxHp;
    const targetPhase: 1 | 2 | 3 | 4 | 5 =
      hpRatio <= 0.2 ? 5 : hpRatio <= 0.4 ? 4 : hpRatio <= 0.6 ? 3 : hpRatio <= 0.8 ? 2 : 1;

    if (targetPhase > raidState.aetherPhase) {
      raidState.aetherPhase = targetPhase;
      aetherBoss.name = `AETHER-NULL, THE ECLIPSE SINGULARITY (Phase ${targetPhase}/5)`;
      onToast(
        `🌌 SINGULARITY PHASE ${targetPhase}/5! Gravitational Lensing & Relativistic Pulsar Beams intensify!`,
        'gold'
      );
      onFloatingText(aetherBoss.x, aetherBoss.y - 28, `🌌 SINGULARITY PHASE ${targetPhase}/5!`, '#f43f5e');
    }

    // Gravitational Lensing Pull toward Aether-Null
    const dx = aetherBoss.x - player.x;
    const dy = aetherBoss.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 36 && dist < 290 && player.dodgeTimer <= 0) {
      const resist = player.unlockedSkills.includes('duck_11') ? 0.6 : 1.0;
      const pullStrength = (16 + raidState.aetherPhase * 4.5) * resist;
      const nx = player.x + (dx / dist) * pullStrength * dt;
      const ny = player.y + (dy / dist) * pullStrength * dt;
      player.x = nx;
      player.y = ny;
    }

    // Blandford-Znajek Relativistic Beam Sweep
    raidState.aetherBeamCooldown -= dt;
    if (raidState.aetherBeamCooldown <= 0) {
      raidState.aetherBeamCooldown = Math.max(5.5, 9.5 - raidState.aetherPhase * 0.7);
      raidState.aetherBeamActiveTimer = 3.2;
      raidState.aetherBeamAngle = Math.atan2(player.y - aetherBoss.y, player.x - aetherBoss.x);
      onFloatingText(aetherBoss.x, aetherBoss.y - 24, '☄️ BLANDFORD-ZNAJEK PULSAR SWEEP!', '#38bdf8');
    }

    if (raidState.aetherBeamActiveTimer > 0) {
      raidState.aetherBeamActiveTimer = Math.max(0, raidState.aetherBeamActiveTimer - dt);
      raidState.aetherBeamAngle += dt * 0.85;
      const bx2 = aetherBoss.x + Math.cos(raidState.aetherBeamAngle) * 280;
      const by2 = aetherBoss.y + Math.sin(raidState.aetherBeamAngle) * 280;
      if (Math.random() < dt * 10) {
        onSpawnHazard({
          id: `pulsar_${Date.now()}_${Math.random()}`,
          x: aetherBoss.x,
          y: aetherBoss.y,
          x2: bx2,
          y2: by2,
          radius: 14,
          life: 0.25,
          kind: 'lightning_line',
          damagePerSec: 65,
          applyMortalWound: true,
        });
      }
    }
  }

  return {
    krakenTentaclesAlive,
    chronoGearsAlive,
    singularityPullActive,
  };
}
