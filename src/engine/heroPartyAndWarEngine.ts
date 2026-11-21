/**
 * Layer 4 — Hero Party Hot-Swap ([1][2][3][4]), Allied Cat & Dog Squad A* War AI,
 * Counter-Stance 2.5x Backstab Crit, & Strict Arc-Specific Counter-Attack Routing (`getArcConfig`).
 */

import type {
  AlliedCatRole,
  CatCoatBreed,
  CounterStanceState,
  DogLegionBreed,
  HeroCombatStats,
  HeroId,
  PartyHeroRuntime,
} from '../types/entities';
import type { ArcFactionConfig, ArcNumber } from '../types/world';
import type { GridCoord, Vec2 } from '../types/math';
import { findAStarNumericBridgePath } from '../math/aStarBridgePathfinder';
import { createCatCoatShuffleBag, createDogBreedShuffleBag } from '../sprites/alliedCatAndDogArmies';

export const HERO_ROSTER_STATS: Readonly<Record<HeroId, HeroCombatStats>> = {
  nyx: {
    heroId: 'nyx',
    displayName: 'Nyx',
    roleLabel: 'Void-Black Wizard Cat',
    spriteWidth: 24,
    spriteHeight: 24,
    baseMaxHp: 120,
    baseAttack: 24,
    baseDefense: 10,
    baseMoveSpeed: 112,
    critChance: 0.22,
    signatureSkillName: 'Arcane Starlight Slash',
  },
  king_leo: {
    heroId: 'king_leo',
    displayName: 'King Leo',
    roleLabel: 'Sovereign Golden Lion',
    spriteWidth: 32,
    spriteHeight: 32,
    baseMaxHp: 175,
    baseAttack: 30,
    baseDefense: 16,
    baseMoveSpeed: 104,
    critChance: 0.18,
    signatureSkillName: 'Royal Solar Roar',
  },
  fenrir: {
    heroId: 'fenrir',
    displayName: 'Wolf-King Fenrir',
    roleLabel: 'Reformed Eclipse Sovereign',
    spriteWidth: 32,
    spriteHeight: 32,
    baseMaxHp: 160,
    baseAttack: 34,
    baseDefense: 13,
    baseMoveSpeed: 118,
    critChance: 0.26,
    signatureSkillName: 'Twin Eclipse Cleave',
  },
  great_duck: {
    heroId: 'great_duck',
    displayName: 'The Great Duck',
    roleLabel: 'Archmage of the Golden Pond',
    spriteWidth: 32,
    spriteHeight: 32,
    baseMaxHp: 140,
    baseAttack: 32,
    baseDefense: 12,
    baseMoveSpeed: 108,
    critChance: 0.24,
    signatureSkillName: 'Golden Lotus Tempest',
  },
};

export const ARC_FACTION_CONFIGS: Readonly<Record<ArcNumber, ArcFactionConfig>> = {
  1: {
    arcNumber: 1,
    actMin: 1,
    actMax: 41,
    arcBadge: 'ARC I • WOLF REBELLION',
    arcTitle: 'The Whispering Kingdoms',
    factionId: 'wild_wolf_horde',
    enemyFactionLabel: 'Wild Wolf Horde',
    counterBanner: 'WILD WOLF PACK COUNTER-ATTACK!',
    counterSquadSummary: 'Timber Wolves, Thorn Stalkers & Frost Alphas',
    captainPrefix: 'Pack-Alpha',
    enemyKinds: ['wolf_scout', 'thorn_wolf', 'frost_wolf', 'alpha_raider'],
    sanctuaryAct: 40,
    finaleAct: 41,
  },
  2: {
    arcNumber: 2,
    actMin: 42,
    actMax: 82,
    arcBadge: 'ARC II • IRON DOG EMPIRE',
    arcTitle: 'The Shattered Dog Empire',
    factionId: 'dog_legion',
    enemyFactionLabel: 'Iron Dog Legion',
    counterBanner: 'DOG LEGION COUNTER-ATTACK!',
    counterSquadSummary: 'Bulldog Phalanx, Doberman Assassins & Siege Gunners',
    captainPrefix: 'Iron-Legate',
    enemyKinds: ['bulldog_phalanx', 'doberman_assassin', 'husky_berserker', 'bloodhound_gunner'],
    sanctuaryAct: 81,
    finaleAct: 82,
  },
  3: {
    arcNumber: 3,
    actMin: 83,
    actMax: 122,
    arcBadge: 'ARC III • DRAGON DOMINION',
    arcTitle: 'The Scorched Dragon Peaks',
    factionId: 'dragon_legion',
    enemyFactionLabel: 'Dragon Legion',
    counterBanner: 'DRAGON LEGION COUNTER-ATTACK!',
    counterSquadSummary: 'Drake-Knights, Wyvern Lancers & Ash Wyrms',
    captainPrefix: 'Scale-Marshal',
    enemyKinds: ['drake_knight', 'wyvern_lancer', 'ember_wyrm', 'obsidian_drake'],
    sanctuaryAct: 121,
    finaleAct: 122,
  },
  4: {
    arcNumber: 4,
    actMin: 123,
    actMax: 180,
    arcBadge: 'ARC IV • ABYSSAL ARMADA',
    arcTitle: 'The Sunken Kraken Depths',
    factionId: 'abyssal_armada',
    enemyFactionLabel: 'Abyssal Armada',
    counterBanner: 'ABYSSAL ARMADA COUNTER-ATTACK!',
    counterSquadSummary: 'Shark-Knights, Crab-Corsairs & Siren-Mages',
    captainPrefix: 'Tide-Admiral',
    enemyKinds: ['shark_knight', 'crab_corsair', 'siren_mage', 'kraken_spawn'],
    sanctuaryAct: 179,
    finaleAct: 180,
  },
  5: {
    arcNumber: 5,
    actMin: 181,
    actMax: 240,
    arcBadge: 'ARC V • CLOCKWORK EMPIRE',
    arcTitle: 'The Brass & Steam Dominion',
    factionId: 'clockwork_empire',
    enemyFactionLabel: 'Clockwork Empire',
    counterBanner: 'CLOCKWORK EMPIRE COUNTER-ATTACK!',
    counterSquadSummary: 'Steam-Golems, Clockwork Owls & Cyber-Rats',
    captainPrefix: 'Gear-Commander',
    enemyKinds: ['steam_golem', 'clockwork_owl', 'cyber_rat', 'chrono_sentinel'],
    sanctuaryAct: 239,
    finaleAct: 240,
  },
  6: {
    arcNumber: 6,
    actMin: 241,
    actMax: 300,
    arcBadge: 'ARC VI • ECLIPSE VOID',
    arcTitle: 'The Astral Cataclysm',
    factionId: 'eclipse_legion',
    enemyFactionLabel: 'Eclipse Void Legion',
    counterBanner: 'ECLIPSE VOID COUNTER-ATTACK!',
    counterSquadSummary: 'Void-Stalkers, Astral Reapers & Shadow Clones',
    captainPrefix: 'Void-Archon',
    enemyKinds: ['void_stalker', 'astral_reaper', 'shadow_clone', 'eclipse_knight'],
    sanctuaryAct: 299,
    finaleAct: 300,
  },
};

export function getArcNumberForAct(actId: number): ArcNumber {
  if (actId <= 41) return 1;
  if (actId <= 82) return 2;
  if (actId <= 122) return 3;
  if (actId <= 180) return 4;
  if (actId <= 240) return 5;
  return 6;
}

export function getArcConfig(actId: number): ArcFactionConfig {
  return ARC_FACTION_CONFIGS[getArcNumberForAct(actId)];
}

export interface AlliedSquadUnit {
  readonly id: string;
  readonly species: 'cat' | 'dog';
  readonly catCoat?: CatCoatBreed;
  readonly catRole?: AlliedCatRole;
  readonly dogBreed?: DogLegionBreed;
  position: Vec2;
  hp: number;
  maxHp: number;
  path: GridCoord[];
  pathRepathTimer: number;
}

export interface BattlefieldMoraleState {
  /** -100 (Enemy dominance) to +100 (Alliance dominance) */
  tugOfWarMeter: number;
  capturedBanners: number;
  totalBanners: number;
  warHornCooldownSec: number;
  warHornBuffRemainingSec: number;
}

export function evaluateCounterStanceStrike(
  attackerPos: Vec2,
  defenderPos: Vec2,
  stance: CounterStanceState,
  baseDamage: number,
): { readonly finalDamage: number; readonly outcome: 'blocked' | 'backstab_crit' | 'normal' } {
  if (stance.phase !== 'guarding' || !stance.blocksFrontalAttacks) {
    return { finalDamage: baseDamage, outcome: 'normal' };
  }
  const toAttackerX = attackerPos.x - defenderPos.x;
  const toAttackerY = attackerPos.y - defenderPos.y;
  const dotProduct = toAttackerX * stance.facingDir.x + toAttackerY * stance.facingDir.y;

  // Attacker dodged behind the enemy's guard -> 2.5x BACKSTAB CRIT!
  if (dotProduct < -4) {
    stance.phase = 'broken_backstab_window';
    stance.timer = 1.4;
    return {
      finalDamage: Math.round(baseDamage * stance.backstabCritMultiplier),
      outcome: 'backstab_crit',
    };
  }

  return {
    finalDamage: Math.max(1, Math.round(baseDamage * 0.15)),
    outcome: 'blocked',
  };
}

export function spawnCounterAttackAmbushWave(
  actId: number,
  count = 10,
): ReadonlyArray<{ readonly enemyKind: string; readonly isCaptain: boolean; readonly title: string }> {
  const cfg = getArcConfig(actId);
  const wave: Array<{ readonly enemyKind: string; readonly isCaptain: boolean; readonly title: string }> = [];
  for (let i = 0; i < count; i++) {
    const isCaptain = i === 0;
    const enemyKind = cfg.enemyKinds[i % cfg.enemyKinds.length];
    wave.push({
      enemyKind,
      isCaptain,
      title: isCaptain ? `${cfg.captainPrefix} (${cfg.enemyFactionLabel})` : enemyKind,
    });
  }
  return wave;
}

export function createDiverseAlliedSquad(actId: number, count: number, spawnOrigin: Vec2): AlliedSquadUnit[] {
  const catBag = createCatCoatShuffleBag(actId * 17 + 13);
  const dogBag = createDogBreedShuffleBag(actId * 31 + 7);
  const catRoles: ReadonlyArray<AlliedCatRole> = [
    'cat_knight',
    'lion_halberdier',
    'calico_archer',
    'arcane_cat_mage',
  ];

  const squad: AlliedSquadUnit[] = [];
  for (let i = 0; i < count; i++) {
    const isDogAlly = actId >= 42 && i % 3 === 2;
    const angle = (Math.PI * 2 * i) / Math.max(1, count);
    const maxHp = 90 + actId * 3;
    squad.push({
      id: `ally_${actId}_${i}`,
      species: isDogAlly ? 'dog' : 'cat',
      catCoat: isDogAlly ? undefined : catBag.next(),
      catRole: isDogAlly ? undefined : catRoles[i % catRoles.length],
      dogBreed: isDogAlly ? dogBag.next() : undefined,
      position: {
        x: spawnOrigin.x + Math.cos(angle) * 24,
        y: spawnOrigin.y + Math.sin(angle) * 18,
      },
      hp: maxHp,
      maxHp,
      path: [],
      pathRepathTimer: 0,
    });
  }
  return squad;
}

export function stepAlliedSquadBridgeAI(
  squad: AlliedSquadUnit[],
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  targetWorldPos: Vec2,
  tileSizePx: number,
  dt: number,
  moveSpeed: number,
): void {
  const goalGrid: GridCoord = {
    col: Math.floor(targetWorldPos.x / tileSizePx),
    row: Math.floor(targetWorldPos.y / tileSizePx),
  };

  for (let i = 0; i < squad.length; i++) {
    const unit = squad[i];
    if (unit.hp <= 0) continue;
    unit.pathRepathTimer -= dt;
    if (unit.pathRepathTimer <= 0 || unit.path.length === 0) {
      unit.pathRepathTimer = 0.55 + (i % 4) * 0.08;
      const startGrid: GridCoord = {
        col: Math.floor(unit.position.x / tileSizePx),
        row: Math.floor(unit.position.y / tileSizePx),
      };
      unit.path = findAStarNumericBridgePath(tileGrid, startGrid, goalGrid);
      if (unit.path.length > 0) {
        unit.path.shift();
      }
    }

    if (unit.path.length > 0) {
      const nextTile = unit.path[0];
      const wx = (nextTile.col + 0.5) * tileSizePx;
      const wy = (nextTile.row + 0.5) * tileSizePx;
      const dx = wx - unit.position.x;
      const dy = wy - unit.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 3) {
        unit.path.shift();
      } else {
        unit.position.x += (dx / dist) * moveSpeed * dt;
        unit.position.y += (dy / dist) * moveSpeed * dt;
      }
    }
  }
}

export function hotSwapPartyHero(
  unlockedHeroes: ReadonlyArray<HeroId>,
  requestedSlot1To4: 1 | 2 | 3 | 4,
  runtime: PartyHeroRuntime,
): HeroId {
  const order: ReadonlyArray<HeroId> = ['nyx', 'king_leo', 'fenrir', 'great_duck'];
  const candidate = order[requestedSlot1To4 - 1];
  if (!unlockedHeroes.includes(candidate)) {
    return runtime.heroId;
  }
  return candidate;
}
