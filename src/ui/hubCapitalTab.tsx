/**
 * File 82 / 100 — 12 Felis-Fang United Capital Buildings Upgrade Tab.
 * Strictly typed (ZERO `any`).
 */

import { useState } from 'react';
import { Building2, Coins, Hammer } from 'lucide-react';
import {
  CAPITAL_12_BUILDINGS,
  getCapitalBuildingUpgradeCost,
} from '../data/capital12BuildingsData';
import {
  computeCapitalPassiveBonuses,
  createInitialCapitalAlchemyState,
  upgradeCapitalBuilding,
} from '../engine/capitalAndAlchemyEngine';
import type { CapitalBuildingId } from '../types/saveAndProgression';

export interface HubCapitalTabProps {
  readonly gold: number;
}

export function HubCapitalTab({ gold }: HubCapitalTabProps) {
  const [simState, setSimState] = useState(() => createInitialCapitalAlchemyState(Math.max(gold, 2400)));
  const [statusMsg, setStatusMsg] = useState<string>('Upgrade all 12 Felis-Fang Capital structures for permanent Alliance bonuses.');

  const bonuses = computeCapitalPassiveBonuses(simState.buildingLevels);

  const handleUpgrade = (id: CapitalBuildingId): void => {
    const next = {
      ...simState,
      buildingLevels: { ...simState.buildingLevels },
    };
    const res = upgradeCapitalBuilding(next, id);
    if (res.ok) {
      setSimState(next);
      setStatusMsg(`Upgraded ${id.replace(/_/g, ' ')} to Lv.${res.newLevel} (-${res.goldSpent} Gold)`);
    } else {
      setStatusMsg(res.reason ?? 'Upgrade blocked');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-slate-900 p-3 text-xs">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-amber-400" />
          <span className="font-bold text-amber-100">{statusMsg}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-amber-300">
            <Coins className="h-3.5 w-3.5" />
            {simState.gold}g
          </span>
          <span className="text-emerald-300">HP +{bonuses.maxHpPct}%</span>
          <span className="text-rose-300">ATK +{bonuses.atkPct}%</span>
          <span className="text-purple-300">Flask +{bonuses.flaskPotencyPct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {CAPITAL_12_BUILDINGS.map((b) => {
          const lv = simState.buildingLevels[b.id] ?? 0;
          const cost = getCapitalBuildingUpgradeCost(b.id, lv);
          const maxed = lv >= b.maxLevel;
          return (
            <div
              key={b.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/95 p-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-black text-slate-100">{b.name}</h3>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                    Lv.{lv}/{b.maxLevel}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{b.description}</p>
                <p className="mt-1.5 text-[11px] font-bold text-emerald-300">{b.passiveBonusLabel}</p>
              </div>
              <button
                type="button"
                disabled={maxed || simState.gold < cost}
                onClick={() => handleUpgrade(b.id)}
                className={`mt-3 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-black transition ${
                  maxed
                    ? 'bg-emerald-950 text-emerald-300 cursor-default'
                    : simState.gold >= cost
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Hammer className="h-3.5 w-3.5" />
                {maxed ? 'MAX LEVEL' : `Upgrade (${cost}g)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
