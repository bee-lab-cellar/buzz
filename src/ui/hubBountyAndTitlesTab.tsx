/**
 * File 87 / 100 — 20 Bounty Quests & 20 Achievement Titles Hub Tab.
 * Strictly typed (ZERO `any`).
 */

import { useState } from 'react';
import { Award, CheckCircle2, ScrollText } from 'lucide-react';
import {
  ACHIEVEMENT_TITLES_20,
  BOUNTY_QUESTS_20,
} from '../data/bountyQuestsAndAchievements';
import {
  advanceBountyProgress,
  claimBountyReward,
  computeTotalTitleBonuses,
  createInitialBountyAndAchievementState,
} from '../engine/bountyAndAchievementEngine';

export interface HubBountyAndTitlesTabProps {
  readonly currentAct: number;
}

export function HubBountyAndTitlesTab({ currentAct }: HubBountyAndTitlesTabProps) {
  const [state, setState] = useState(() => {
    const init = createInitialBountyAndAchievementState();
    // Pre-mark bounties for arcs the player has already surpassed so they can claim immediately
    for (let i = 0; i < BOUNTY_QUESTS_20.length; i++) {
      const q = BOUNTY_QUESTS_20[i];
      if (currentAct >= q.targetArc * 100) {
        advanceBountyProgress(init, q.id, q.targetCount);
      }
    }
    return init;
  });
  const [banner, setBanner] = useState<string>('Complete 20 Omniverse Bounties to unlock permanent ATK/DEF Achievement Titles.');

  const totals = computeTotalTitleBonuses(state.unlockedTitleIds);

  const handleClaim = (questId: string): void => {
    const next = {
      ...state,
      entries: { ...state.entries },
      unlockedTitleIds: [...state.unlockedTitleIds],
    };
    const res = claimBountyReward(next, questId);
    if (res.ok) {
      setState(next);
      setBanner(
        `Claimed +${res.goldAwarded}g, +${res.starPointsAwarded} SP${res.unlockedTitle ? ` & Title "${res.unlockedTitle.title}"` : ''}!`,
      );
    } else {
      setBanner(res.reason ?? 'Not ready to claim yet');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-slate-900 p-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-100">
          <ScrollText className="h-4 w-4 text-amber-400" />
          <span>{banner}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-purple-300">
            <Award className="h-3.5 w-3.5" />
            Titles: {totals.unlockedCount}/{ACHIEVEMENT_TITLES_20.length}
          </span>
          <span className="text-rose-300">ATK +{totals.totalAtkPct}%</span>
          <span className="text-sky-300">DEF +{totals.totalDefPct}%</span>
        </div>
      </div>

      <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {BOUNTY_QUESTS_20.map((q) => {
          const entry = state.entries[q.id];
          const progress = entry?.currentCount ?? 0;
          const claimed = entry?.claimed ?? false;
          const ready = !claimed && progress >= q.targetCount;
          return (
            <div
              key={q.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3"
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-100">
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                    ARC {q.targetArc}
                  </span>
                  <span>{q.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{q.description}</p>
                <div className="mt-1.5 text-[10px] font-bold text-emerald-300">
                  Reward: {q.rewardGold}g • {q.rewardStarPoints} SP ({progress}/{q.targetCount})
                </div>
              </div>
              <button
                type="button"
                disabled={!ready}
                onClick={() => handleClaim(q.id)}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-black transition ${
                  claimed
                    ? 'bg-emerald-950 text-emerald-300 cursor-default'
                    : ready
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {claimed ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Claimed
                  </span>
                ) : ready ? (
                  'Claim'
                ) : (
                  'In Progress'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
