/**
 * Layer 5 — Playable Interactive Dojo Guide Controller
 *
 * Powers the live practice dojo inside the Interactive Guide modal with
 * an invincible Training Dummy, real-time hit combos, Dodge-Roll i-frames,
 * Hero Hot-Swap checks, and live checklist completion badges.
 */

import type { HeroId } from '../types/entities';
import type { Vec2 } from '../types/math';

export type DojoChecklistKey =
  | 'move_wasd'
  | 'slash_combo'
  | 'dodge_roll'
  | 'arcane_skill'
  | 'hero_swap';

export interface DojoChecklistBadge {
  readonly key: DojoChecklistKey;
  readonly label: string;
  readonly keybindHint: string;
  completed: boolean;
}

export interface DojoPracticeState {
  heroId: HeroId;
  heroPos: Vec2;
  heroFacing: 1 | -1;
  dummyPos: Vec2;
  dummyHitFlash: number;
  comboCount: number;
  lastCallout: string;
  dodgeCooldownSec: number;
  skillCooldownSec: number;
  badges: DojoChecklistBadge[];
}

export function createInitialDojoState(): DojoPracticeState {
  return {
    heroId: 'nyx',
    heroPos: { x: 110, y: 120 },
    heroFacing: 1,
    dummyPos: { x: 250, y: 120 },
    dummyHitFlash: 0,
    comboCount: 0,
    lastCallout: 'Practice your moves on the Royal Straw Dummy!',
    dodgeCooldownSec: 0,
    skillCooldownSec: 0,
    badges: [
      { key: 'move_wasd', label: 'Move & Footwork', keybindHint: 'WASD / Arrows', completed: false },
      { key: 'slash_combo', label: '3-Hit Sword Combo', keybindHint: 'SPACE / J', completed: false },
      { key: 'dodge_roll', label: 'i-Frame Dodge Roll', keybindHint: 'SHIFT / K', completed: false },
      { key: 'arcane_skill', label: 'Arcane Burst / Elixir', keybindHint: 'E / Q', completed: false },
      { key: 'hero_swap', label: 'Party Hero Hot-Swap', keybindHint: '1 • 2 • 3 • 4', completed: false },
    ],
  };
}

function markBadgeDone(state: DojoPracticeState, key: DojoChecklistKey): void {
  const badge = state.badges.find((b) => b.key === key);
  if (badge) badge.completed = true;
}

export function performDojoAction(
  state: DojoPracticeState,
  action: 'move' | 'slash' | 'dodge' | 'skill' | 'swap',
  payload?: { dx?: number; dy?: number; heroId?: HeroId },
): void {
  if (action === 'move') {
    const dx = payload?.dx ?? 0;
    const dy = payload?.dy ?? 0;
    state.heroPos.x = Math.max(24, Math.min(336, state.heroPos.x + dx));
    state.heroPos.y = Math.max(36, Math.min(184, state.heroPos.y + dy));
    if (dx !== 0) state.heroFacing = dx > 0 ? 1 : -1;
    markBadgeDone(state, 'move_wasd');
    return;
  }

  if (action === 'slash') {
    const dist = Math.hypot(state.heroPos.x - state.dummyPos.x, state.heroPos.y - state.dummyPos.y);
    if (dist <= 68) {
      state.dummyHitFlash = 0.22;
      state.comboCount += 1;
      state.lastCallout =
        state.comboCount >= 3 ? 'STARLIGHT FINISHER CRIT!' : `COMBO HIT x${state.comboCount}!`;
      if (state.comboCount >= 3) {
        markBadgeDone(state, 'slash_combo');
      }
    } else {
      state.lastCallout = 'Step closer to the Training Dummy!';
    }
    return;
  }

  if (action === 'dodge') {
    if (state.dodgeCooldownSec <= 0) {
      state.heroPos.x = Math.max(24, Math.min(336, state.heroPos.x + state.heroFacing * 48));
      state.dodgeCooldownSec = 0.65;
      state.lastCallout = '⚡ PERFECT DODGE ROLL!';
      markBadgeDone(state, 'dodge_roll');
    }
    return;
  }

  if (action === 'skill') {
    if (state.skillCooldownSec <= 0) {
      state.skillCooldownSec = 1.4;
      state.dummyHitFlash = 0.35;
      state.lastCallout = 'ARCANE CRIT BURST!';
      markBadgeDone(state, 'arcane_skill');
    }
    return;
  }

  if (action === 'swap' && payload?.heroId) {
    state.heroId = payload.heroId;
    state.lastCallout = `SWAPPED HERO: ${payload.heroId.toUpperCase()}!`;
    markBadgeDone(state, 'hero_swap');
  }
}

export function stepDojoTimers(state: DojoPracticeState, dt: number): void {
  state.dummyHitFlash = Math.max(0, state.dummyHitFlash - dt);
  state.dodgeCooldownSec = Math.max(0, state.dodgeCooldownSec - dt);
  state.skillCooldownSec = Math.max(0, state.skillCooldownSec - dt);
}

export function getDojoCompletionRatio(state: DojoPracticeState): number {
  const done = state.badges.filter((b) => b.completed).length;
  return state.badges.length > 0 ? done / state.badges.length : 0;
}
