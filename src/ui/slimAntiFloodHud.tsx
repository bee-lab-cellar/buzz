/**
 * Layer 4 — Strict `<10%` Viewport Anti-Flood Top HUD Strip (32px height)
 *
 * Displays:
 * - Compact HP / MP bars + `Act X/1000` badge
 * - 4 tiny `20x20` Hero Hot-Swap Icons (Nyx / King Leo / Fenrir / Great Duck)
 * - Single `[👑 HUB]` Command Hub button
 * - Ultra-slim 4px Tug-of-War frontline bar
 * - Strictly MAX 1 centered floating toast at any moment
 */

import { Crown, Volume2, VolumeX } from 'lucide-react';
import type { HeroId } from '../types/entities';

export interface SlimAntiFloodHudProps {
  readonly currentAct: number;
  readonly hp: number;
  readonly maxHp: number;
  readonly mana: number;
  readonly maxMana: number;
  readonly activeHeroId: HeroId;
  readonly unlockedHeroes: ReadonlyArray<HeroId>;
  readonly tugOfWarPct: number;
  readonly activeToast: string | null;
  readonly muted: boolean;
  readonly screenShakeEnabled?: boolean;
  readonly onSwapHero: (heroId: HeroId) => void;
  readonly onOpenHub: () => void;
  readonly onToggleMute: () => void;
  readonly onToggleScreenShake?: () => void;
}

const HERO_BADGES: ReadonlyArray<{
  readonly id: HeroId;
  readonly short: string;
  readonly bg: string;
}> = [
  { id: 'nyx', short: 'N', bg: 'bg-purple-500' },
  { id: 'king_leo', short: 'L', bg: 'bg-amber-500' },
  { id: 'fenrir', short: 'F', bg: 'bg-slate-400' },
  { id: 'great_duck', short: 'D', bg: 'bg-cyan-400' },
];

export function SlimAntiFloodHud({
  currentAct,
  hp,
  maxHp,
  mana,
  maxMana,
  activeHeroId,
  unlockedHeroes,
  tugOfWarPct,
  activeToast,
  muted,
  screenShakeEnabled = true,
  onSwapHero,
  onOpenHub,
  onToggleMute,
  onToggleScreenShake,
}: SlimAntiFloodHudProps) {
  const hpPct = Math.max(0, Math.min(100, (hp / Math.max(1, maxHp)) * 100));
  const mpPct = Math.max(0, Math.min(100, (mana / Math.max(1, maxMana)) * 100));
  const clampedTug = Math.max(0, Math.min(100, tugOfWarPct));

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col">
      {/* Strict 32px Single-Line Top Bar (<10% viewport footprint) */}
      <div className="pointer-events-auto flex h-8 items-center justify-between gap-2 border-b border-slate-700/80 bg-slate-950/90 px-2.5 text-[11px] text-slate-100">
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
            Act {currentAct}/1000
          </span>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-20 overflow-hidden rounded-sm bg-slate-800">
              <div className="h-full bg-rose-500" style={{ width: `${hpPct}%` }} />
            </div>
            <div className="h-2.5 w-14 overflow-hidden rounded-sm bg-slate-800">
              <div className="h-full bg-sky-400" style={{ width: `${mpPct}%` }} />
            </div>
          </div>
        </div>

        {/* 4 Tiny 20x20 Hot-Swap Hero Icons */}
        <div className="flex items-center gap-1">
          {HERO_BADGES.map((h) => {
            const unlocked = unlockedHeroes.includes(h.id);
            const active = activeHeroId === h.id;
            return (
              <button
                key={h.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSwapHero(h.id)}
                title={h.id}
                className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-slate-950 ${
                  h.bg
                } ${
                  active
                    ? 'ring-2 ring-white'
                    : unlocked
                      ? 'opacity-80 hover:opacity-100 cursor-pointer'
                      : 'opacity-25 cursor-not-allowed'
                }`}
              >
                {h.short}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          {onToggleScreenShake && (
            <button
              type="button"
              onClick={onToggleScreenShake}
              className={`rounded border px-1.5 py-0.5 text-[9px] font-bold cursor-pointer ${
                screenShakeEnabled
                  ? 'border-sky-500/50 bg-sky-950/80 text-sky-200'
                  : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}
            >
              📳 Shake: {screenShakeEnabled ? 'ON' : 'OFF'}
            </button>
          )}
          <button
            type="button"
            onClick={onOpenHub}
            className="flex items-center gap-1 rounded bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950 hover:bg-amber-300 cursor-pointer"
          >
            <Crown className="h-3 w-3" />
            HUB
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label="Toggle Mute"
            className="rounded border border-slate-700 bg-slate-900 p-1 text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            {muted ? <VolumeX className="h-3 w-3 text-rose-400" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 4px Tug-of-War Frontline Strip */}
      <div className="h-1 w-full bg-rose-900/90">
        <div
          className="h-full bg-amber-400 transition-all duration-300"
          style={{ width: `${clampedTug}%` }}
        />
      </div>

      {/* Strict MAX 1 Centered Toast */}
      {activeToast && (
        <div className="mt-1.5 flex justify-center">
          <div className="rounded-md border border-amber-400/60 bg-slate-950/95 px-3 py-1 text-[11px] font-bold text-amber-200 shadow-lg">
            {activeToast}
          </div>
        </div>
      )}
    </div>
  );
}
