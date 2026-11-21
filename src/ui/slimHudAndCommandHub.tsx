/**
 * Pillar 3 — `<10%` Screen-Coverage Slim HUD Strip + 6-Tab Command Hub Modal
 *
 * Strictly enforces Anti-GUI-Flooding rules:
 * - Single 32px translucent top strip:
 *   Left: Hero HP bar + 4 tiny 20x20 Hero Hot-Swap icons + `[👑 HUB]`
 *   Center: 1-line Arc Badge + `Act X/300` + 4px Kingdom Tug-of-War bar
 *   Right: `[🧪 H]`, `[🦆 Q]`, `[📯 R]`, `[📱]`, `[🔊]`
 * - Zero stacked banner towers: maximum 1 slim toast message at a time
 * - Crisp `lucide-react` icons throughout the HUD and 6-Tab Command Hub
 */

import React, { useState } from 'react';
import {
  Crown,
  FlaskConical,
  Hammer,
  Map,
  Shield,
  Sparkles,
  Swords,
  Volume2,
  VolumeX,
  Smartphone,
  BookOpen,
  X,
} from 'lucide-react';
import type { PlayableHeroId } from '../types/combat';
import { HERO_ARCHETYPES } from '../engine/heroHotSwapCombat';

export type CommandHubTab =
  | 'atlas'
  | 'armory'
  | 'alchemy'
  | 'capital'
  | 'constellation'
  | 'vault';

export interface SlimHudProps {
  readonly activeHeroId: PlayableHeroId;
  readonly unlockedHeroes: ReadonlyArray<PlayableHeroId>;
  readonly hp: number;
  readonly maxHp: number;
  readonly actId: number;
  readonly arcBadge: string;
  readonly tugOfWarRatio: number;
  readonly potionCount: number;
  readonly elixirReady: boolean;
  readonly elixirRemainingSec: number;
  readonly warHornReady: boolean;
  readonly muted: boolean;
  readonly activeToast: string | null;
  readonly onSelectHero: (heroId: PlayableHeroId) => void;
  readonly onDrinkPotion: () => void;
  readonly onDrinkElixir: () => void;
  readonly onSoundWarHorn: () => void;
  readonly onToggleMute: () => void;
  readonly onOpenVault: () => void;
  readonly onOpenGuide: () => void;
  readonly onJumpAct?: (actId: number) => void;
}

const HERO_ORDER: ReadonlyArray<PlayableHeroId> = ['nyx', 'king_leo', 'fenrir', 'great_duck'];

const HERO_SWATCH: Record<PlayableHeroId, string> = {
  nyx: 'bg-indigo-500 border-pink-300',
  king_leo: 'bg-amber-500 border-yellow-200',
  fenrir: 'bg-slate-400 border-sky-200',
  great_duck: 'bg-yellow-400 border-orange-300',
};

const HUB_TABS: ReadonlyArray<{
  readonly id: CommandHubTab;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'atlas', label: '300-Act Atlas', icon: Map },
  { id: 'armory', label: '+25★ Armory', icon: Hammer },
  { id: 'alchemy', label: 'BlockCraft Lab', icon: FlaskConical },
  { id: 'capital', label: 'Royal Capital', icon: Crown },
  { id: 'constellation', label: '60-Node Stars', icon: Sparkles },
  { id: 'vault', label: 'iPad Vault', icon: Shield },
];

export const SlimHudAndCommandHub: React.FC<SlimHudProps> = ({
  activeHeroId,
  unlockedHeroes,
  hp,
  maxHp,
  actId,
  arcBadge,
  tugOfWarRatio,
  potionCount,
  elixirReady,
  elixirRemainingSec,
  warHornReady,
  muted,
  activeToast,
  onSelectHero,
  onDrinkPotion,
  onDrinkElixir,
  onSoundWarHorn,
  onToggleMute,
  onOpenVault,
  onOpenGuide,
  onJumpAct,
}) => {
  const [hubOpen, setHubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CommandHubTab>('atlas');

  const hpPct = Math.max(0, Math.min(100, Math.round((hp / Math.max(1, maxHp)) * 100)));
  const tugPct = Math.max(0, Math.min(100, Math.round(tugOfWarRatio * 100)));

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 select-none">
      {/* Single 32px translucent top strip (<10% viewport coverage) */}
      <div className="pointer-events-auto flex h-8 w-full items-center justify-between gap-2 border-b border-slate-700/70 bg-slate-950/80 px-2 text-xs text-slate-100 backdrop-blur-sm">
        {/* Left: Hero HP + 4 tiny 20x20 Hot-Swap Icons + [👑 HUB] */}
        <div className="flex items-center gap-1.5">
          <div className="relative h-4 w-24 overflow-hidden rounded-sm border border-slate-600 bg-slate-900">
            <div
              className="h-full bg-emerald-500 transition-all duration-150"
              style={{ width: `${hpPct}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-tight text-white drop-shadow">
              {Math.ceil(hp)}/{Math.ceil(maxHp)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {HERO_ORDER.map((heroId, idx) => {
              const unlocked = unlockedHeroes.includes(heroId);
              const active = activeHeroId === heroId;
              return (
                <button
                  key={heroId}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onSelectHero(heroId)}
                  title={`[${idx + 1}] ${HERO_ARCHETYPES[heroId].title}`}
                  className={`flex h-5 w-5 items-center justify-center rounded-sm border text-[10px] font-black transition ${
                    unlocked ? HERO_SWATCH[heroId] : 'border-slate-700 bg-slate-800 text-slate-500 opacity-45'
                  } ${active ? 'ring-2 ring-white' : ''}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setHubOpen((prev) => !prev)}
            className="flex h-6 items-center gap-1 rounded bg-amber-500/90 px-2 text-[11px] font-bold text-slate-950 hover:bg-amber-400"
          >
            <Crown className="h-3.5 w-3.5" />
            HUB
          </button>
        </div>

        {/* Center: 1-line Arc Badge + Act X/300 + 4px Kingdom Tug-of-War */}
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-2">
          <div className="flex items-center gap-2 truncate text-[11px] font-bold tracking-wide text-amber-200">
            <span className="truncate">{arcBadge}</span>
            <span className="text-slate-300">Act {actId}/300</span>
          </div>
          <div className="mt-0.5 h-1 w-44 overflow-hidden rounded-full bg-rose-900/90">
            <div
              className="h-full bg-sky-400 transition-all duration-200"
              style={{ width: `${tugPct}%` }}
            />
          </div>
        </div>

        {/* Right: Quick Action Icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDrinkPotion}
            title="Heal Potion [H]"
            className="flex h-6 items-center gap-1 rounded border border-emerald-500/60 bg-slate-900 px-1.5 text-[10px] font-bold text-emerald-300 hover:bg-slate-800"
          >
            <FlaskConical className="h-3 w-3" />
            H:{potionCount}
          </button>

          <button
            type="button"
            onClick={onDrinkElixir}
            disabled={!elixirReady && elixirRemainingSec <= 0}
            title="Great Duck's Elixir [Q] (20s)"
            className={`flex h-6 items-center gap-1 rounded border px-1.5 text-[10px] font-bold ${
              elixirRemainingSec > 0
                ? 'border-yellow-300 bg-yellow-500/30 text-yellow-200'
                : elixirReady
                  ? 'border-amber-500/70 bg-slate-900 text-amber-300 hover:bg-slate-800'
                  : 'border-slate-700 bg-slate-900 text-slate-500'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            {elixirRemainingSec > 0 ? `${elixirRemainingSec.toFixed(0)}s` : 'Q'}
          </button>

          <button
            type="button"
            onClick={onSoundWarHorn}
            disabled={!warHornReady}
            title="War Horn Rally [R]"
            className={`flex h-6 items-center gap-1 rounded border px-1.5 text-[10px] font-bold ${
              warHornReady
                ? 'border-sky-400/70 bg-slate-900 text-sky-300 hover:bg-slate-800'
                : 'border-slate-700 bg-slate-900 text-slate-500'
            }`}
          >
            <Swords className="h-3 w-3" />
            R
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            title="Interactive Dojo Guide"
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenVault}
            title="iPad Save Vault & Settings"
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-700 bg-slate-900 text-sky-300 hover:bg-slate-800"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            title="Toggle Audio"
            className="flex h-6 w-6 items-center justify-center rounded border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Maximum 1 slim toast message at a time (zero stacked banners) */}
      {activeToast && (
        <div className="mt-1.5 flex justify-center">
          <div className="rounded border border-amber-400/50 bg-slate-950/90 px-3 py-0.5 text-[11px] font-semibold text-amber-200 shadow">
            {activeToast}
          </div>
        </div>
      )}

      {/* 6-Tab Command Hub Modal */}
      {hubOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
          <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-amber-400/50 bg-slate-900 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 bg-slate-950 px-4 py-2.5">
              <div className="flex items-center gap-2 text-sm font-black tracking-wide text-amber-300">
                <Crown className="h-4 w-4" />
                ROYAL COMMAND HUB — ACT {actId}/300
              </div>
              <button
                type="button"
                onClick={() => setHubOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-6 border-b border-slate-700 bg-slate-950/60">
              {HUB_TABS.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold transition ${
                      isSelected
                        ? 'border-b-2 border-amber-400 bg-slate-800 text-amber-300'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="min-h-[220px] p-4 text-xs text-slate-300">
              {activeTab === 'atlas' && (
                <div className="space-y-2">
                  <p className="font-bold text-amber-200">6 Story Arcs • 300 Bespoke Acts • Dynamic Sanctuary Portals</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Arc I • Verdant (1–41)', act: 1 },
                      { label: 'Arc II • Iron Wastes (42–82)', act: 42 },
                      { label: 'Arc III • Dragon Spire (83–122)', act: 83 },
                      { label: 'Arc IV • Kraken Abyss (123–180)', act: 123 },
                      { label: 'Arc V • Clockwork (181–240)', act: 181 },
                      { label: 'Arc VI • Star-Forge (241–300)', act: 241 },
                    ].map((arcItem) => (
                      <button
                        key={arcItem.act}
                        type="button"
                        onClick={() => {
                          onJumpAct?.(arcItem.act);
                          setHubOpen(false);
                        }}
                        className="rounded border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-left font-semibold text-slate-100 hover:border-amber-400"
                      >
                        {arcItem.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'armory' && (
                <p>
                  Star-Up Anvil (+25★) &amp; Primordial Animated Starlight Ascension active for 30 Equipment Tiers across all 4 Heroes.
                </p>
              )}
              {activeTab === 'alchemy' && (
                <p>
                  BlockCraft 3D Voxel Cauldron ready — brew 50+ battle flasks, Antidotes, High-Ground Draughts, and Great Duck Refills.
                </p>
              )}
              {activeTab === 'capital' && (
                <p>
                  12 Royal Capital Buildings (Lv 1–10): Palace, Star-Forge Smithy, Alchemy Lab, Cat Barracks, Dog Embassy, and Observatory.
                </p>
              )}
              {activeTab === 'constellation' && (
                <p>
                  60-Node Constellation Skill Tree across Blade, Arcane, Tactician, and Vanguard star branches.
                </p>
              )}
              {activeTab === 'vault' && (
                <div className="space-y-2">
                  <p>4-Layer iPad/Safari Bulletproof Save Vault with strict Anti-Overwrite Guard.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setHubOpen(false);
                      onOpenVault();
                    }}
                    className="rounded bg-sky-500 px-3 py-1.5 font-bold text-slate-950 hover:bg-sky-400"
                  >
                    Open Full iPad Vault &amp; Save Codes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
