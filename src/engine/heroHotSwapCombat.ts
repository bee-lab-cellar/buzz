/**
 * Pillar 2 — Real-Time [1][2][3][4] Hero Hot-Swap, 3-Hit Arcane Combo Engine,
 * Dodge-Roll i-Frames, and 2.5x Backstab Crit vs Counter Stance.
 */

import type { CounterStanceState, HeroArchetypeUnion, PlayableHeroId } from '../types/combat';
import type { Vec2 } from '../types/math';

export const HERO_ARCHETYPES: Readonly<Record<PlayableHeroId, HeroArchetypeUnion>> = {
  nyx: {
    heroId: 'nyx',
    title: 'Void-Black Wizard Cat',
    spriteDimensions: { w: 24, h: 24 },
    primaryWeapon: 'Starlight Wand-Blade',
    signatureAbility: 'Arcane Starlight Slash',
  },
  king_leo: {
    heroId: 'king_leo',
    title: 'Majestic Golden Lion',
    spriteDimensions: { w: 32, h: 32 },
    primaryWeapon: 'Sun-Crown Greatsword',
    signatureAbility: 'Sovereign Solar Roar',
  },
  fenrir: {
    heroId: 'fenrir',
    title: 'Reformed Wolf-King',
    spriteDimensions: { w: 32, h: 32 },
    primaryWeapon: 'Twin Eclipse Battleaxes',
    signatureAbility: 'Lunar Fang Whirlwind',
  },
  great_duck: {
    heroId: 'great_duck',
    title: 'Archmage of the Golden Pond',
    spriteDimensions: { w: 32, h: 32 },
    primaryWeapon: 'Golden Lotus Scepter',
    signatureAbility: 'Elixir Tempest Barrage',
  },
};

export interface ActiveHeroCombatState {
  activeHero: PlayableHeroId;
  unlockedHeroes: PlayableHeroId[];
  position: Vec2;
  facingDir: Vec2;
  comboStep: 0 | 1 | 2;
  comboResetTimerSec: number;
  dodgeIFrameSec: number;
  dodgeCooldownSec: number;
  baseAttackPower: number;
}

export interface ComboStrikeResult {
  readonly comboHitNumber: 1 | 2 | 3;
  readonly isArcaneFinisher: boolean;
  readonly rawDamage: number;
  readonly callout: string;
}

export interface BackstabEvaluation {
  readonly outcome: 'normal' | 'blocked_front' | 'backstab_crit_2_5x';
  readonly finalDamage: number;
  readonly updatedStance: CounterStanceState;
}

export function createInitialHeroCombatState(
  unlockedHeroes: ReadonlyArray<PlayableHeroId> = ['nyx', 'king_leo', 'fenrir', 'great_duck'],
): ActiveHeroCombatState {
  return {
    activeHero: 'nyx',
    unlockedHeroes: [...unlockedHeroes],
    position: { x: 80, y: 140 },
    facingDir: { x: 1, y: 0 },
    comboStep: 0,
    comboResetTimerSec: 0,
    dodgeIFrameSec: 0,
    dodgeCooldownSec: 0,
    baseAttackPower: 42,
  };
}

export function hotSwapHeroSlot(state: ActiveHeroCombatState, slot1To4: 1 | 2 | 3 | 4): PlayableHeroId {
  const order: ReadonlyArray<PlayableHeroId> = ['nyx', 'king_leo', 'fenrir', 'great_duck'];
  const target = order[slot1To4 - 1];
  if (state.unlockedHeroes.includes(target)) {
    state.activeHero = target;
  }
  return state.activeHero;
}

export function perform3HitArcaneCombo(state: ActiveHeroCombatState): ComboStrikeResult {
  const step = state.comboStep;
  const hitNum = (step + 1) as 1 | 2 | 3;
  const isFinisher = hitNum === 3;
  const multipliers: ReadonlyArray<number> = [1.0, 1.25, 1.85];
  const heroBonus =
    state.activeHero === 'king_leo'
      ? 1.15
      : state.activeHero === 'fenrir'
        ? 1.2
        : state.activeHero === 'great_duck'
          ? 1.12
          : 1.05;

  const rawDamage = Math.round(state.baseAttackPower * multipliers[step] * heroBonus);
  state.comboStep = ((step + 1) % 3) as 0 | 1 | 2;
  state.comboResetTimerSec = 1.1;

  return {
    comboHitNumber: hitNum,
    isArcaneFinisher: isFinisher,
    rawDamage,
    callout: isFinisher ? 'STARLIGHT CLEAVE!' : hitNum === 2 ? 'ARCANE CRIT!' : 'SLASH!',
  };
}

export function triggerDodgeRollIFrames(state: ActiveHeroCombatState, dir: Vec2): boolean {
  if (state.dodgeCooldownSec > 0) return false;
  const len = Math.hypot(dir.x, dir.y) || 1;
  const nx = dir.x / len;
  const ny = dir.y / len;
  state.position.x += nx * 38;
  state.position.y += ny * 38;
  state.facingDir = { x: nx, y: ny };
  state.dodgeIFrameSec = 0.34;
  state.dodgeCooldownSec = 0.65;
  return true;
}

export function resolveStrikeAgainstCounterStance(
  attackerPos: Vec2,
  defenderPos: Vec2,
  stance: CounterStanceState,
  rawDamage: number,
): BackstabEvaluation {
  if (stance.phase !== 'active_guard') {
    return {
      outcome: 'normal',
      finalDamage: rawDamage,
      updatedStance: stance,
    };
  }

  const dx = attackerPos.x - defenderPos.x;
  const dy = attackerPos.y - defenderPos.y;
  const facingDot = dx * stance.facingDir.x + dy * stance.facingDir.y;

  // Player dodged behind the guarding enemy -> 2.5x BACKSTAB CRIT & Guard Break!
  if (facingDot < -2) {
    return {
      outcome: 'backstab_crit_2_5x',
      finalDamage: Math.round(rawDamage * stance.backstabMultiplier),
      updatedStance: {
        phase: 'guard_broken',
        staggerRemainingSec: 1.6,
      },
    };
  }

  return {
    outcome: 'blocked_front',
    finalDamage: Math.max(1, Math.round(rawDamage * 0.15)),
    updatedStance: stance,
  };
}

export function stepHeroCombatTimers(state: ActiveHeroCombatState, dt: number): void {
  if (state.comboResetTimerSec > 0) {
    state.comboResetTimerSec = Math.max(0, state.comboResetTimerSec - dt);
    if (state.comboResetTimerSec === 0) state.comboStep = 0;
  }
  if (state.dodgeIFrameSec > 0) {
    state.dodgeIFrameSec = Math.max(0, state.dodgeIFrameSec - dt);
  }
  if (state.dodgeCooldownSec > 0) {
    state.dodgeCooldownSec = Math.max(0, state.dodgeCooldownSec - dt);
  }
}
