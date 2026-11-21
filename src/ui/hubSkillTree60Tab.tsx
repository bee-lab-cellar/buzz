/**
 * File 86 / 100 — 60-Node Constellation Skill Tree Interactive Tab.
 * Strictly typed (ZERO `any`).
 */

import { useState } from 'react';
import { Sparkles, Star } from 'lucide-react';
import {
  aggregateSkillTreeBonuses,
  canUnlockConstellationNode,
  CONSTELLATION_60_SKILLS,
} from '../data/alchemy50RecipesAndSkills60';
import type { ConstellationBranch } from '../types/saveAndProgression';

export interface HubSkillTree60TabProps {
  readonly starPoints: number;
  readonly initialUnlockedIds: ReadonlyArray<string>;
}

const BRANCHES: ReadonlyArray<{ readonly id: ConstellationBranch; readonly label: string }> = [
  { id: 'blade_sovereign', label: 'Blade Sovereign' },
  { id: 'arcane_starlight', label: 'Arcane Starlight' },
  { id: 'iron_guardian', label: 'Iron Guardian' },
  { id: 'swift_shadow', label: 'Swift Shadow' },
  { id: 'alliance_commander', label: 'Alliance Commander' },
  { id: 'omniverse_alchemist', label: 'Omniverse Alchemist' },
];

export function HubSkillTree60Tab({
  starPoints,
  initialUnlockedIds,
}: HubSkillTree60TabProps) {
  const [branch, setBranch] = useState<ConstellationBranch>('blade_sovereign');
  const [unlockedIds, setUnlockedIds] = useState<string[]>([...initialUnlockedIds]);
  const [availablePoints, setAvailablePoints] = useState<number>(Math.max(starPoints, 3));
  const [notice, setNotice] = useState<string>('Unlock Constellation stars across 6 branches (60 total nodes).');

  const branchNodes = CONSTELLATION_60_SKILLS.filter((n) => n.branch === branch);
  const totals = aggregateSkillTreeBonuses(unlockedIds);

  const handleUnlock = (nodeId: string, cost: number): void => {
    const check = canUnlockConstellationNode(nodeId, unlockedIds, availablePoints);
    if (!check.allowed) {
      setNotice(check.reason ?? 'Cannot unlock node');
      return;
    }
    setUnlockedIds((prev) => [...prev, nodeId]);
    setAvailablePoints((prev) => Math.max(0, prev - cost));
    setNotice(`Unlocked Constellation node ${nodeId}!`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-500/30 bg-slate-900 p-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-indigo-200">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{notice}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1 font-bold text-amber-300">
            <Star className="h-3.5 w-3.5" />
            {availablePoints} SP
          </span>
          <span className="text-rose-300">ATK +{totals.atkPct}%</span>
          <span className="text-emerald-300">HP +{totals.hpPct}%</span>
          <span className="text-sky-300">CRIT +{totals.critPct}%</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {BRANCHES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBranch(b.id)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer ${
              branch === b.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        {branchNodes.map((node) => {
          const unlocked = unlockedIds.includes(node.id);
          const check = canUnlockConstellationNode(node.id, unlockedIds, availablePoints);
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => handleUnlock(node.id, node.starPointCost)}
              className={`flex flex-col justify-between rounded-xl border p-2.5 text-left transition ${
                unlocked
                  ? 'border-amber-400 bg-amber-950/40'
                  : check.allowed
                    ? 'border-indigo-400/70 bg-slate-900 hover:bg-slate-800 cursor-pointer'
                    : 'border-slate-800 bg-slate-950/70 opacity-70 cursor-not-allowed'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-indigo-300">TIER {node.tier}</span>
                  <span className="text-amber-300">{node.starPointCost} SP</span>
                </div>
                <div className="mt-1 text-xs font-black text-slate-100">{node.name}</div>
                <p className="mt-1 text-[10px] text-slate-400">{node.description}</p>
              </div>
              <div className="mt-2 text-[10px] font-black">
                {unlocked ? (
                  <span className="text-amber-300">★ UNLOCKED</span>
                ) : check.allowed ? (
                  <span className="text-emerald-300">Click to Unlock</span>
                ) : (
                  <span className="text-slate-500">{check.reason}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
