/**
 * Pillar 2 — Clean Biome Trap & Puzzle Physics Engine
 *
 * Manages 2–4 well-spaced, high-clarity interactive biome mechanics per Act:
 * - Bounce-Mushrooms (launch across ledges)
 * - Cracking Ice (timed fracture under weight)
 * - Redirectable Minecarts (deflect into enemy lines)
 * - Blizzard Campfires (warmth radius prevents freeze)
 * - Battering-Ram Escort (pushes forward while allies stand nearby)
 * - Rising Acid Tides (oscillating vertical danger wave)
 * - Updraft Geysers (launches heroes into Plunge-Slash / Dragon-Mount state)
 */

import type { Vec2 } from '../types/math';

export type CleanBiomePuzzleKind =
  | 'bounce_mushroom'
  | 'cracking_ice'
  | 'redirectable_minecart'
  | 'blizzard_campfire'
  | 'battering_ram_escort'
  | 'rising_acid_tide'
  | 'updraft_geyser';

export interface BiomePuzzleEntity {
  readonly id: string;
  readonly kind: CleanBiomePuzzleKind;
  position: Vec2;
  velocity: Vec2;
  readonly radius: number;
  timerSec: number;
  stateValue: number; // e.g. crack progress 0..1, escort progress 0..100, tide height
  active: boolean;
  redirectedByPlayer: boolean;
}

export interface PuzzleStepOutcome {
  readonly launchedVelocity: Vec2 | null;
  readonly warmthShielded: boolean;
  readonly trapDamageTaken: number;
  readonly escortCompleted: boolean;
  readonly mountUpdraftReady: boolean;
}

export function createActBiomePuzzles(actId: number): BiomePuzzleEntity[] {
  const baseKindByArc: ReadonlyArray<CleanBiomePuzzleKind> =
    actId <= 41
      ? ['bounce_mushroom', 'cracking_ice', 'blizzard_campfire']
      : actId <= 82
        ? ['redirectable_minecart', 'battering_ram_escort', 'blizzard_campfire']
        : actId <= 122
          ? ['updraft_geyser', 'rising_acid_tide', 'bounce_mushroom']
          : actId <= 180
            ? ['rising_acid_tide', 'updraft_geyser', 'bounce_mushroom']
            : actId <= 240
              ? ['redirectable_minecart', 'updraft_geyser', 'cracking_ice']
              : ['updraft_geyser', 'rising_acid_tide', 'bounce_mushroom'];

  // Strictly 2–3 well-spaced puzzles so the arena stays wide open and uncluttered
  const count = 2 + (actId % 2);
  const result: BiomePuzzleEntity[] = [];
  for (let i = 0; i < count; i++) {
    const kind = baseKindByArc[i % baseKindByArc.length];
    result.push({
      id: `puzzle_${actId}_${i}_${kind}`,
      kind,
      position: { x: 145 + i * 110, y: 115 + (i % 2) * 52 },
      velocity: kind === 'redirectable_minecart' ? { x: 46, y: 0 } : { x: 0, y: 0 },
      radius: kind === 'blizzard_campfire' ? 42 : 16,
      timerSec: 0,
      stateValue: 0,
      active: true,
      redirectedByPlayer: false,
    });
  }
  return result;
}

export function redirectMinecartByStrike(puzzle: BiomePuzzleEntity, strikeDir: Vec2): boolean {
  if (puzzle.kind !== 'redirectable_minecart') return false;
  const len = Math.hypot(strikeDir.x, strikeDir.y) || 1;
  puzzle.velocity.x = (strikeDir.x / len) * 145;
  puzzle.velocity.y = (strikeDir.y / len) * 145;
  puzzle.redirectedByPlayer = true;
  return true;
}

export function stepBiomePuzzles(
  puzzles: BiomePuzzleEntity[],
  playerPos: Vec2,
  dt: number,
): PuzzleStepOutcome {
  let launchedVelocity: Vec2 | null = null;
  let warmthShielded = false;
  let trapDamageTaken = 0;
  let escortCompleted = false;
  let mountUpdraftReady = false;

  for (let i = 0; i < puzzles.length; i++) {
    const p = puzzles[i];
    p.timerSec += dt;

    if (p.kind === 'redirectable_minecart') {
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      if (p.position.x < 40 || p.position.x > 440) {
        p.velocity.x = -p.velocity.x;
      }
    } else if (p.kind === 'rising_acid_tide') {
      p.stateValue = 0.5 + 0.5 * Math.sin(p.timerSec * 1.4);
    }

    const dist = Math.hypot(playerPos.x - p.position.x, playerPos.y - p.position.y);
    if (dist > p.radius + 10) continue;

    switch (p.kind) {
      case 'bounce_mushroom':
        launchedVelocity = { x: 0, y: -185 };
        break;
      case 'updraft_geyser':
        launchedVelocity = { x: 0, y: -210 };
        mountUpdraftReady = true;
        break;
      case 'blizzard_campfire':
        warmthShielded = true;
        break;
      case 'cracking_ice':
        p.stateValue = Math.min(1, p.stateValue + dt * 1.2);
        if (p.stateValue >= 1) {
          trapDamageTaken += 8;
          p.stateValue = 0;
        }
        break;
      case 'battering_ram_escort':
        p.stateValue = Math.min(100, p.stateValue + dt * 24);
        p.position.x = Math.min(410, p.position.x + dt * 28);
        if (p.stateValue >= 100) {
          escortCompleted = true;
        }
        break;
      case 'rising_acid_tide':
        if (p.stateValue > 0.72) {
          trapDamageTaken += 6;
        }
        break;
      case 'redirectable_minecart':
        if (!p.redirectedByPlayer) {
          trapDamageTaken += 10;
        }
        break;
    }
  }

  return {
    launchedVelocity,
    warmthShielded,
    trapDamageTaken,
    escortCompleted,
    mountUpdraftReady,
  };
}
