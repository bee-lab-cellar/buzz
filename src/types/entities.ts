/**
 * Strict Discriminated Unions for Heroes, Armies, Boss Parts, Combat Stances & Animations
 */

import type { ElevationLayer, Vec2 } from './math';

export type HeroId = 'nyx' | 'king_leo' | 'fenrir' | 'great_duck';

export type CatCoatBreed =
  | 'void_black'
  | 'ginger_tabby'
  | 'tuxedo'
  | 'calico_tri'
  | 'royal_siamese'
  | 'russian_blue';

export type AlliedCatRole =
  | 'cat_knight'
  | 'lion_halberdier'
  | 'calico_archer'
  | 'arcane_cat_mage'
  | 'blacksmith_cat';

export type DogLegionBreed =
  | 'bulldog_phalanx'
  | 'doberman_assassin'
  | 'husky_berserker'
  | 'bloodhound_gunner';

export type EnemyFactionId =
  | 'wild_wolf_horde'
  | 'dog_legion'
  | 'dragon_legion'
  | 'abyssal_armada'
  | 'clockwork_empire'
  | 'eclipse_legion';

export type BossPartKind =
  | 'dragon_wings'
  | 'dragon_tail'
  | 'dragon_chest_core'
  | 'dragon_head'
  | 'kraken_tentacle'
  | 'chrono_gear'
  | 'singularity_orb';

export interface BossPartHitbox {
  readonly partId: string;
  readonly kind: BossPartKind;
  readonly label: string;
  offset: Vec2;
  radius: number;
  hp: number;
  maxHp: number;
  broken: boolean;
  /** Multiplier applied when player strikes the weak spot directly */
  weakSpotMultiplier: number;
  /** Whether this part ignores the 1.2% final boss per-hit damage cap */
  bypassesBossDamageCap: boolean;
  hitFlashTimer: number;
}

export type CounterStancePhase = 'idle' | 'telegraph' | 'guarding' | 'riposte' | 'broken_backstab_window';

export interface CounterStanceState {
  phase: CounterStancePhase;
  timer: number;
  facingDir: Vec2;
  /** 2.5x backstab crit multiplier when player dodges behind a guarding enemy */
  backstabCritMultiplier: number;
  blocksFrontalAttacks: boolean;
}

export interface ElixirBuffState {
  unlocked: boolean;
  active: boolean;
  /** Timed 20.0s duration for balanced endgame gameplay */
  remainingSeconds: number;
  maxDurationSeconds: number;
  cooldownSeconds: number;
  /** Number of Golden Feathers collected toward instant refill (3 = instant refill!) */
  feathersCollected: number;
  feathersRequiredForRefill: number;
  damageMultiplier: number;
  breaksBossInvulnerabilityShield: boolean;
}

export type AnimationClipName =
  | 'idle'
  | 'walk'
  | 'attack'
  | 'dodge'
  | 'cast'
  | 'hurt'
  | 'victory';

export interface AnimationStateMachine {
  currentClip: AnimationClipName;
  frameIndex: number;
  frameTimer: number;
  frameDurationSec: number;
  totalFrames: number;
  looping: boolean;
  lockedUntilComplete: boolean;
  facingX: 1 | -1;
}

export interface HeroCombatStats {
  readonly heroId: HeroId;
  readonly displayName: string;
  readonly roleLabel: string;
  readonly spriteWidth: 24 | 32;
  readonly spriteHeight: 24 | 32;
  baseMaxHp: number;
  baseAttack: number;
  baseDefense: number;
  baseMoveSpeed: number;
  critChance: number;
  signatureSkillName: string;
}

export interface PartyHeroRuntime {
  readonly heroId: HeroId;
  position: Vec2;
  velocity: Vec2;
  elevation: ElevationLayer;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  invulnTimer: number;
  comboStep: 0 | 1 | 2;
  comboWindowTimer: number;
  stealthAmbushReady: boolean;
  anim: AnimationStateMachine;
}

export type CombatEntityUnion =
  | {
      readonly kind: 'hero';
      readonly id: string;
      readonly heroId: HeroId;
      position: Vec2;
      elevation: ElevationLayer;
      hp: number;
      maxHp: number;
    }
  | {
      readonly kind: 'ally_cat';
      readonly id: string;
      readonly coat: CatCoatBreed;
      readonly role: AlliedCatRole;
      position: Vec2;
      elevation: ElevationLayer;
      hp: number;
      maxHp: number;
    }
  | {
      readonly kind: 'ally_dog';
      readonly id: string;
      readonly breed: DogLegionBreed;
      position: Vec2;
      elevation: ElevationLayer;
      hp: number;
      maxHp: number;
    }
  | {
      readonly kind: 'enemy';
      readonly id: string;
      readonly faction: EnemyFactionId;
      readonly isBoss: boolean;
      readonly isKrakenTentacle: boolean;
      position: Vec2;
      elevation: ElevationLayer;
      hp: number;
      maxHp: number;
      counterStance: CounterStanceState;
      parts: BossPartHitbox[];
    };
