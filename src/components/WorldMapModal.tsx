import React, { useState } from 'react';
import { Check, Crown, Lock, Map, Skull, Sparkles, Swords, X } from 'lucide-react';
import { ActSummary, BiomeId, HUDState } from '../game/types';

interface WorldMapModalProps {
  hud: HUDState;
  onClose: () => void;
  onTravel: (actNum: number) => void;
}

const BIOME_ORDER: BiomeId[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 'sanctuary', 'throne',
  9, 10, 11, 12, 13, 14, 15, 16, 'war_sanctuary', 'imperial_throne',
  17, 18, 19, 20, 21, 22, 23, 24, 'dragon_sanctuary', 'sky_throne',
  25, 26, 27, 28, 29, 30, 31, 32, 'abyss_sanctuary', 'kraken_trench',
  33, 34, 35, 36, 37, 38, 39, 40, 'clockwork_sanctuary', 'chrono_citadel',
  41, 42, 43, 44, 45, 46, 47, 48, 'multiverse_sanctuary', 'eclipse_singularity',
];

function getBiomeCardStyle(biomeId: BiomeId): string {
  if (typeof biomeId === 'string') {
    if (biomeId.includes('sanctuary')) return 'border-amber-400/75 bg-amber-950/35 text-amber-200';
    return 'border-fuchsia-500/75 bg-rose-950/45 text-amber-200';
  }
  if (biomeId >= 41) return 'border-fuchsia-500/55 bg-purple-950/35 text-fuchsia-200';
  if (biomeId >= 33) return 'border-amber-500/55 bg-amber-950/30 text-amber-200';
  if (biomeId >= 25) return 'border-cyan-400/55 bg-cyan-950/35 text-cyan-200';
  if (biomeId >= 17) return 'border-orange-500/55 bg-orange-950/35 text-orange-200';
  if (biomeId >= 9) return 'border-rose-500/50 bg-rose-950/30 text-rose-200';
  return 'border-emerald-500/45 bg-emerald-950/25 text-emerald-200';
}

type ArcFilter = 'all' | 'arc1' | 'arc2' | 'arc3' | 'arc4' | 'arc5' | 'arc6';

export const WorldMapModal: React.FC<WorldMapModalProps> = ({ hud, onClose, onTravel }) => {
  const [arcFilter, setArcFilter] = useState<ArcFilter>(() => {
    if (hud.currentAct >= 241) return 'arc6';
    if (hud.currentAct >= 181) return 'arc5';
    if (hud.currentAct >= 123) return 'arc4';
    if (hud.currentAct >= 83) return 'arc3';
    if (hud.currentAct >= 42) return 'arc2';
    return 'arc1';
  });

  const clearedSet = new Set(hud.clearedActs);
  const totalActs = hud.actsSummary.length || 300;

  const grouped = BIOME_ORDER.map((bId) => {
    const acts = hud.actsSummary.filter((a) => {
      if (a.biomeId !== bId) return false;
      if (arcFilter === 'arc1') return a.act <= 41;
      if (arcFilter === 'arc2') return a.act >= 42 && a.act <= 82;
      if (arcFilter === 'arc3') return a.act >= 83 && a.act <= 122;
      if (arcFilter === 'arc4') return a.act >= 123 && a.act <= 180;
      if (arcFilter === 'arc5') return a.act >= 181 && a.act <= 240;
      if (arcFilter === 'arc6') return a.act >= 241 && a.act <= 300;
      return true;
    });
    return {
      biomeId: bId,
      biomeName: acts[0]?.biomeName ?? '',
      acts,
    };
  }).filter((g) => g.acts.length > 0);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-5xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Map className="w-5 h-5 text-amber-300" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-amber-300">
                300-ACT OMNIVERSE WORLD MAP (6 STORY ARCS)
              </h2>
              <p className="text-[11px] font-mono-tabular text-slate-400">
                Unlocked: Act {hud.maxUnlockedAct}/{totalActs} · Cleared: {hud.clearedActs.length}/{totalActs}
                {hud.nightmareMode ? ' · NIGHTMARE NG+' : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[34px] min-w-[34px] items-center justify-center rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            aria-label="Close World Map"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Story Arc Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 bg-slate-950/70 px-4 py-2">
          {[
            { id: 'all' as ArcFilter, label: `All ${totalActs} Acts`, color: 'border-amber-400 bg-amber-500/20 text-amber-200' },
            { id: 'arc1' as ArcFilter, label: '🌲 Arc I: Quest (1–41)', color: 'border-emerald-400 bg-emerald-500/20 text-emerald-200' },
            { id: 'arc2' as ArcFilter, label: '⚔️ Arc II: War (42–82)', color: 'border-rose-400 bg-rose-500/20 text-rose-200' },
            { id: 'arc3' as ArcFilter, label: '🐉 Arc III: Dragon (83–122)', color: 'border-orange-400 bg-orange-500/20 text-orange-200' },
            { id: 'arc4' as ArcFilter, label: '🦑 Arc IV: Kraken (123–180)', color: 'border-cyan-400 bg-cyan-500/20 text-cyan-200' },
            { id: 'arc5' as ArcFilter, label: '⚙️ Arc V: Clockwork (181–240)', color: 'border-yellow-400 bg-yellow-500/20 text-yellow-200' },
            { id: 'arc6' as ArcFilter, label: '🌌 Arc VI: Multiverse (241–300)', color: 'border-fuchsia-400 bg-fuchsia-500/20 text-fuchsia-200' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setArcFilter(tab.id)}
              className={`rounded px-2.5 py-1 text-xs font-medium border cursor-pointer ${
                arcFilter === tab.id
                  ? tab.color
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Biomes & Acts Grid */}
        <div className="max-h-[68vh] overflow-y-auto p-4 space-y-4">
          {grouped.map((group) => {
            const firstAct = group.acts[0].act;
            const badgePrefix =
              firstAct >= 241
                ? '🌌 '
                : firstAct >= 181
                ? '⚙️ '
                : firstAct >= 123
                ? '🦑 '
                : firstAct >= 83
                ? '🐉 '
                : firstAct >= 42
                ? '⚔️ '
                : '🌲 ';
            return (
              <div
                key={String(group.biomeId)}
                className={`rounded-lg border p-3 ${getBiomeCardStyle(group.biomeId)}`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-pixel text-xs tracking-wide">
                    {badgePrefix}
                    {group.biomeName}
                  </span>
                  <span className="text-[11px] font-mono-tabular opacity-80">
                    {group.acts.length === 1
                      ? `Act ${group.acts[0].act}`
                      : `Acts ${group.acts[0].act}–${group.acts[group.acts.length - 1].act}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {group.acts.map((act: ActSummary) => {
                    const unlocked = act.act <= hud.maxUnlockedAct;
                    const cleared = clearedSet.has(act.act);
                    const isCurrent = act.act === hud.currentAct;

                    return (
                      <button
                        key={act.act}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => onTravel(act.act)}
                        className={`flex min-h-[54px] flex-col justify-between rounded-md border px-2.5 py-2 text-left transition-colors ${
                          isCurrent
                            ? 'border-amber-300 bg-amber-500/25 text-white ring-1 ring-amber-300 cursor-pointer'
                            : unlocked
                            ? 'border-slate-700/80 bg-slate-950/75 hover:bg-slate-800/90 text-slate-100 cursor-pointer'
                            : 'border-slate-800/60 bg-slate-950/35 text-slate-500 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 w-full">
                          <span className="font-mono-tabular text-[11px] font-bold text-amber-300">
                            ACT {act.act}
                          </span>
                          {!unlocked ? (
                            <Lock className="w-3 h-3 text-slate-500" />
                          ) : act.role === 'final_boss' ? (
                            <Crown className="w-3.5 h-3.5 text-fuchsia-300" />
                          ) : act.role === 'sanctuary' ? (
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          ) : act.role === 'boss' || act.role === 'miniboss' ? (
                            <Skull className="w-3.5 h-3.5 text-rose-400" />
                          ) : cleared ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Swords className="w-3 h-3 text-slate-500" />
                          )}
                        </div>
                        <span className="text-[11px] leading-tight font-medium line-clamp-1 mt-1">
                          {act.title}
                        </span>
                        <span className="text-[10px] font-mono-tabular text-slate-400 line-clamp-1 mt-0.5">
                          {act.terrainTag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
