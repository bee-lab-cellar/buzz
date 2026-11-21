/**
 * Layer 4 — Modular Command Hub Tab 2: 1,000-Act, 10-Arc Omniverse World Map
 */

import { useState } from 'react';
import { Compass, Crown, MapPin, Skull, Sparkles } from 'lucide-react';
import {
  ALL_1000_OMNIVERSE_ACTS,
  OMNIVERSE_ARC_CONFIGS,
  getOmniverseArcIdForAct,
} from '../data/arc10_acts901to1000';
import { getBossForAct } from '../data/bosses100Registry';
import type { ArcId } from '../types/world';

export interface HubWorldMap1000TabProps {
  readonly currentAct: number;
  readonly maxUnlockedAct: number;
  readonly onTravelAct: (actId: number) => void;
}

export function HubWorldMap1000Tab({
  currentAct,
  maxUnlockedAct,
  onTravelAct,
}: HubWorldMap1000TabProps) {
  const [selectedArc, setSelectedArc] = useState<ArcId>(() => getOmniverseArcIdForAct(currentAct));

  const arcConfigList = Object.values(OMNIVERSE_ARC_CONFIGS);
  const arcConfig = OMNIVERSE_ARC_CONFIGS[selectedArc];
  const arcActs = ALL_1000_OMNIVERSE_ACTS.filter((a) => a.arcId === selectedArc);

  return (
    <div className="flex flex-col gap-3">
      {/* 10-Arc Selector Strip */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {arcConfigList.map((cfg) => (
          <button
            key={cfg.arcId}
            type="button"
            onClick={() => setSelectedArc(cfg.arcId)}
            className={`flex flex-col items-start rounded-lg border px-2.5 py-1.5 text-left cursor-pointer ${
              selectedArc === cfg.arcId
                ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wide">
              {cfg.arcBadge} • {cfg.actMin}–{cfg.actMax}
            </span>
            <span className="truncate w-full text-[10px] text-slate-400">
              {cfg.arcTitle}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Arc Overview Banner */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-700 p-3"
        style={{
          background: `linear-gradient(120deg, ${arcConfig.palette.groundSecondary}dd, #0f172aee)`,
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-amber-300" />
            <h3 className="text-sm font-black text-white">
              {arcConfig.arcBadge}: {arcConfig.arcTitle} (Acts {arcConfig.actMin}–{arcConfig.actMax})
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-200">
            Faction: <strong className="text-amber-300">{arcConfig.factionLabel}</strong> • Sanctuary: Act {arcConfig.sanctuaryAct} → Act {arcConfig.finalBossAct} • Final Boss: <strong className="text-rose-300">{arcConfig.finalBossName}</strong> ({arcConfig.finalBossMaxHp.toLocaleString()} HP)
          </p>
        </div>
        <button
          type="button"
          onClick={() => onTravelAct(arcConfig.sanctuaryAct)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Jump to Sanctuary {arcConfig.sanctuaryAct}
        </button>
      </div>

      {/* 100 Acts Grid for Selected Arc */}
      <div className="grid max-h-[280px] grid-cols-5 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-10">
        {arcActs.map((act) => {
          const boss = getBossForAct(act.actId);
          const isCurrent = act.actId === currentAct;
          const isUnlocked = act.actId <= maxUnlockedAct;
          return (
            <button
              key={act.actId}
              type="button"
              onClick={() => onTravelAct(act.actId)}
              title={`${act.title} • ${act.landmark.name}${boss ? ` • BOSS: ${boss.name}` : ''}`}
              className={`flex flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-[10px] font-bold transition cursor-pointer ${
                isCurrent
                  ? 'border-amber-300 bg-amber-400 text-slate-950'
                  : act.isArcFinalBoss
                    ? 'border-rose-500/80 bg-rose-950/70 text-rose-200 hover:bg-rose-900/70'
                    : act.isSanctuary
                      ? 'border-emerald-400/80 bg-emerald-950/70 text-emerald-200 hover:bg-emerald-900/70'
                      : act.isRegionalBoss
                        ? 'border-orange-400/70 bg-orange-950/60 text-orange-200 hover:bg-orange-900/60'
                        : isUnlocked
                          ? 'border-slate-700 bg-slate-800/90 text-slate-200 hover:border-cyan-400'
                          : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="flex items-center gap-0.5">
                {act.isArcFinalBoss ? (
                  <Crown className="h-3 w-3" />
                ) : act.isRegionalBoss ? (
                  <Skull className="h-3 w-3" />
                ) : act.isSanctuary ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  <MapPin className="h-2.5 w-2.5 opacity-70" />
                )}
                {act.actId}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
