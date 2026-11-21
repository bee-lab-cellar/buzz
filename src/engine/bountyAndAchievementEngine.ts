/**
 * File 60 / 100 — Bounty Quest Tracker & 20-Title Achievement Bonus Engine.
 * Strictly typed (ZERO `any`).
 */

import {
  ACHIEVEMENT_TITLES_20,
  BOUNTY_QUESTS_20,
} from '../data/bountyQuestsAndAchievements';
import type { AchievementTitleSpec, BountyQuestSpec } from '../types/world';

export interface BountyProgressEntry {
  readonly questId: string;
  currentCount: number;
  claimed: boolean;
}

export interface BountyAndAchievementState {
  entries: Record<string, BountyProgressEntry>;
  unlockedTitleIds: string[];
  equippedTitleId: string | null;
}

export interface ClaimBountyRewardResult {
  readonly ok: boolean;
  readonly reason: string | null;
  readonly goldAwarded: number;
  readonly starPointsAwarded: number;
  readonly unlockedTitle: AchievementTitleSpec | null;
}

export function createInitialBountyAndAchievementState(): BountyAndAchievementState {
  const entries: Record<string, BountyProgressEntry> = {};
  for (let i = 0; i < BOUNTY_QUESTS_20.length; i++) {
    const q = BOUNTY_QUESTS_20[i];
    entries[q.id] = {
      questId: q.id,
      currentCount: 0,
      claimed: false,
    };
  }
  return {
    entries,
    unlockedTitleIds: [],
    equippedTitleId: null,
  };
}

export function advanceBountyProgress(
  state: BountyAndAchievementState,
  questId: string,
  delta: number,
): BountyProgressEntry | null {
  const spec = BOUNTY_QUESTS_20.find((q) => q.id === questId);
  if (!spec || delta <= 0) return null;

  const entry = state.entries[questId] ?? {
    questId,
    currentCount: 0,
    claimed: false,
  };
  entry.currentCount = Math.min(spec.targetCount, entry.currentCount + Math.floor(delta));
  state.entries[questId] = entry;
  return entry;
}

export function isBountyReadyToClaim(
  state: BountyAndAchievementState,
  quest: BountyQuestSpec,
): boolean {
  const entry = state.entries[quest.id];
  if (!entry || entry.claimed) return false;
  return entry.currentCount >= quest.targetCount;
}

export function claimBountyReward(
  state: BountyAndAchievementState,
  questId: string,
): ClaimBountyRewardResult {
  const spec = BOUNTY_QUESTS_20.find((q) => q.id === questId);
  if (!spec) {
    return {
      ok: false,
      reason: 'Unknown bounty quest',
      goldAwarded: 0,
      starPointsAwarded: 0,
      unlockedTitle: null,
    };
  }
  const entry = state.entries[questId];
  if (!entry || entry.currentCount < spec.targetCount) {
    return {
      ok: false,
      reason: 'Bounty objective not yet completed',
      goldAwarded: 0,
      starPointsAwarded: 0,
      unlockedTitle: null,
    };
  }
  if (entry.claimed) {
    return {
      ok: false,
      reason: 'Bounty reward already claimed',
      goldAwarded: 0,
      starPointsAwarded: 0,
      unlockedTitle: null,
    };
  }

  entry.claimed = true;
  const titleSpec = ACHIEVEMENT_TITLES_20.find((t) => t.id === spec.rewardTitleId) ?? null;
  if (titleSpec && !state.unlockedTitleIds.includes(titleSpec.id)) {
    state.unlockedTitleIds = [...state.unlockedTitleIds, titleSpec.id];
    if (!state.equippedTitleId) {
      state.equippedTitleId = titleSpec.id;
    }
  }

  return {
    ok: true,
    reason: null,
    goldAwarded: spec.rewardGold,
    starPointsAwarded: spec.rewardStarPoints,
    unlockedTitle: titleSpec,
  };
}

export function computeTotalTitleBonuses(
  unlockedTitleIds: ReadonlyArray<string>,
): { readonly totalAtkPct: number; readonly totalDefPct: number; readonly unlockedCount: number } {
  const set = new Set(unlockedTitleIds);
  let totalAtkPct = 0;
  let totalDefPct = 0;
  let unlockedCount = 0;

  for (let i = 0; i < ACHIEVEMENT_TITLES_20.length; i++) {
    const t = ACHIEVEMENT_TITLES_20[i];
    if (!set.has(t.id)) continue;
    totalAtkPct += t.bonusAtkPct;
    totalDefPct += t.bonusDefPct;
    unlockedCount += 1;
  }

  return { totalAtkPct, totalDefPct, unlockedCount };
}
