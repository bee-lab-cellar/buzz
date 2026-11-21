/**
 * File 2 / 100 — Strict Discriminated Unions for Combat, 4 Playable Heroes,
 * 50 Equipment Tiers, 4-Part Articulated Dragon Anatomy, 8-Tentacle Kraken Weak-Spots,
 * 3-Condition Exit Portal Lock, CounterStanceState, ElixirTimerState & DeterministicInputFrame.
 * Zero `any` types.
 */

import type { ElevationTier, Vec2 } from './math';

export type PlayableHeroId = 'nyx' | 'king_leo' | 'fenrir' | 'great_duck';

export type EquipmentTier =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
  | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50;

export type EquipmentRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'primordial';

export interface EquipmentTierSpec {
  readonly tier: EquipmentTier;
  readonly id: string;
  readonly name: string;
  readonly slot: 'weapon' | 'armor';
  readonly rarity: EquipmentRarity;
  readonly atkBonus: number;
  readonly defBonus: number;
  readonly hpBonus: number;
  readonly starLevel: number;
  readonly primordialMutated: boolean;
}

export type DragonAnatomyPartId = 'wings' | 'severable_tail' | 'chest_core' | 'head';

export interface ArticulatedDragonPart {
  readonly partId: DragonAnatomyPartId;
  readonly label: string;
  readonly localOffset: Vec2;
  readonly hitRadius: number;
  hp: number;
  maxHp: number;
  broken: boolean;
  readonly critMultiplier: number;
  readonly bypassesBossCap: boolean;
}

export interface ArticulatedDragonAnatomy {
  readonly wings: ArticulatedDragonPart;
  readonly severableTail: ArticulatedDragonPart;
  readonly chestCore: ArticulatedDragonPart;
  readonly head: ArticulatedDragonPart;
}

export interface KrakenWeakSpotTentacle {
  readonly tentacleIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  readonly id: string;
  readonly isBossTentacle: boolean;
  basePosition: Vec2;
  weakSpotCenter: Vec2;
  weakSpotRadius: number;
  hp: number;
  maxHp: number;
  severed: boolean;
  swayPhaseRad: number;
}

export interface KrakenHealDrop {
  readonly id: string;
  readonly kind: 'golden_fish';
  readonly healFraction: 0.3;
  position: Vec2;
  collected: boolean;
}

export type CounterStanceState =
  | { readonly phase: 'inactive' }
  | {
      readonly phase: 'telegraph';
      readonly remainingSec: number;
      readonly facingDir: Vec2;
    }
  | {
      readonly phase: 'active_guard';
      readonly remainingSec: number;
      readonly facingDir: Vec2;
      readonly backstabMultiplier: 2.5;
    }
  | {
      readonly phase: 'guard_broken';
      readonly staggerRemainingSec: number;
    };

export interface ElixirTimerState {
  unlocked: boolean;
  active: boolean;
  remainingSec: number;
  readonly maxDurationSec: 20.0;
  cooldownSec: number;
  readonly maxCooldownSec: number;
  feathersCollected: number;
  readonly feathersRequiredForRefill: 3;
  readonly damageMultiplier: number;
  readonly shattersInvulnShield: boolean;
}

export type HeroArchetypeUnion =
  | {
      readonly heroId: 'nyx';
      readonly title: 'Void-Black Wizard Cat';
      readonly spriteDimensions: { readonly w: 24; readonly h: 24 };
      readonly primaryWeapon: 'Starlight Wand-Blade';
      readonly signatureAbility: 'Arcane Starlight Slash';
    }
  | {
      readonly heroId: 'king_leo';
      readonly title: 'Majestic Golden Lion';
      readonly spriteDimensions: { readonly w: 32; readonly h: 32 };
      readonly primaryWeapon: 'Sun-Crown Greatsword';
      readonly signatureAbility: 'Sovereign Solar Roar';
    }
  | {
      readonly heroId: 'fenrir';
      readonly title: 'Reformed Wolf-King';
      readonly spriteDimensions: { readonly w: 32; readonly h: 32 };
      readonly primaryWeapon: 'Twin Eclipse Battleaxes';
      readonly signatureAbility: 'Lunar Fang Whirlwind';
    }
  | {
      readonly heroId: 'great_duck';
      readonly title: 'Archmage of the Golden Pond';
      readonly spriteDimensions: { readonly w: 32; readonly h: 32 };
      readonly primaryWeapon: 'Golden Lotus Scepter';
      readonly signatureAbility: 'Elixir Tempest Barrage';
    };

export interface DeterministicInputFrame {
  readonly tick: number;
  /** Quantized directional input: -1, 0, or 1 */
  readonly moveX: -1 | 0 | 1;
  readonly moveY: -1 | 0 | 1;
  /** Bitmask: bit0=attack, bit1=dodge, bit2=elixir, bit3=warHorn, bit4=ballista/interact, bit5=potion */
  readonly actionMask: number;
  /** Optional hero hot-swap slot (1..4) or 0 for no swap */
  readonly swapSlot: 0 | 1 | 2 | 3 | 4;
  /** Quantized aim angle in tenths of a degree (0..3599) */
  readonly aimDeciDeg: number;
}

export const INPUT_BIT_ATTACK = 1 << 0;
export const INPUT_BIT_DODGE = 1 << 1;
export const INPUT_BIT_ELIXIR = 1 << 2;
export const INPUT_BIT_WAR_HORN = 1 << 3;
export const INPUT_BIT_INTERACT = 1 << 4;
export const INPUT_BIT_POTION = 1 << 5;

export interface CombatantSnapshot {
  readonly id: string;
  readonly position: Vec2;
  readonly elevation: ElevationTier;
  readonly hp: number;
  readonly maxHp: number;
}

export interface PortalUnlockInput {
  readonly normalEnemiesAlive: number;
  readonly hasBoss: boolean;
  readonly bossDefeated: boolean;
  readonly uncapturedBanners: number;
  readonly totalBanners: number;
}

export interface PortalUnlockResult {
  readonly unlocked: boolean;
  readonly lockReason: string | null;
}

export interface BossPartBreakEvent {
  readonly partId: DragonAnatomyPartId;
  readonly bossId: string;
  readonly staggerDurationSec: number;
  readonly shockwaveRadiusPx: number;
}
