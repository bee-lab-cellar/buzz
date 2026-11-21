import React from 'react';
import { Volume2, VolumeX, Smartphone } from 'lucide-react';
import { getArcConfig } from '../game/acts';
import { HUDState, PlayableHeroId } from '../game/types';

interface GameHudProps {
  hud: HUDState;
  touchEnabled: boolean;
  onToggleTouch: () => void;
  onToggleMute: () => void;
  onToggleScreenShake: () => void;
  onToggleInventory: () => void;
  onOpenWorldMap: () => void;
  onOpenCapitalHub: () => void;
  onOpenSkillTree: () => void;
  onSwapHero: (heroId: PlayableHeroId) => void;
  onTossBrewPotion: () => void;
  onToggleSteamMecha: () => void;
  onHeal: () => void;
  onUseElixir: () => void;
  onSummon: () => void;
  onToggleLoaf: () => void;
  onCycleEmote: () => void;
}

const HERO_ROSTER: {
  id: PlayableHeroId;
  keyNum: string;
  name: string;
  icon: string;
  accent: string;
}[] = [
  {
    id: 'nyx',
    keyNum: '1',
    name: 'Nyx (Arcane Trickster)',
    icon: '🐱',
    accent: 'border-cyan-400 bg-cyan-500/30 text-cyan-100',
  },
  {
    id: 'king_leo',
    keyNum: '2',
    name: 'King Leo (Majestic Lion Sovereign)',
    icon: '🦁',
    accent: 'border-amber-400 bg-amber-500/30 text-amber-100',
  },
  {
    id: 'fenrir',
    keyNum: '3',
    name: 'Wolf-King Fenrir (Dire Wolf Berserker)',
    icon: '🐺',
    accent: 'border-fuchsia-400 bg-fuchsia-500/30 text-fuchsia-100',
  },
  {
    id: 'great_duck',
    keyNum: '4',
    name: 'The Great Duck (Celestial Avatar)',
    icon: '🦆',
    accent: 'border-emerald-400 bg-emerald-500/30 text-emerald-100',
  },
];

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  touchEnabled,
  onToggleTouch,
  onToggleMute,
  onToggleScreenShake,
  onOpenCapitalHub,
  onSwapHero,
  onTossBrewPotion,
  onToggleSteamMecha,
  onHeal,
  onUseElixir,
  onSummon,
}) => {
  const hpPct = Math.max(0, Math.min(100, (hud.hp / Math.max(1, hud.maxHp)) * 100));
  const bossPct = hud.activeBoss
    ? Math.max(0, Math.min(100, (hud.activeBoss.hp / Math.max(1, hud.activeBoss.maxHp)) * 100))
    : 0;
  const summonUnlocked = hud.hasDuckElixir;
  const summonReady = summonUnlocked && hud.duckSummonCooldown <= 0;
  const activeHeroMeta = HERO_ROSTER.find((h) => h.id === hud.activeHeroId) ?? HERO_ROSTER[0];
  const equippedBrew = hud.brewedPotions.find((p) => p.id === hud.equippedBrewId);
  const brewCount = equippedBrew?.count ?? 0;
  // STRICT 1-TOAST LIMIT (toasts.slice(-1))
  const newestToasts = hud.toasts.slice(-1);
  const activeToast = newestToasts.length > 0 ? newestToasts[0] : null;
  const totalActsCount = hud.actsSummary.length || 300;
  const arcConfig = getArcConfig(hud.currentAct);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between select-none">
      {/* ===================================================================== */}
      {/* SINGLE-LINE 32PX TOP HUD STRIP (<10% SCREEN COVERAGE)                 */}
      {/* ===================================================================== */}
      <div className="flex flex-col items-center w-full">
        <div
          className="pointer-events-auto flex min-h-[32px] w-full flex-wrap items-center justify-between gap-1.5 border-b border-slate-700/70 px-2 py-0.5 backdrop-blur-xs"
          style={{ backgroundColor: 'rgba(10, 12, 22, 0.72)' }}
        >
          {/* LEFT: Active Hero + Compact HP Bar (90x8px) + Stamina Dots + Lv + Gold + [1][2][3][4] + [👑 HUB] */}
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            {/* Active Hero Badge */}
            <span
              className="flex h-5 w-5 items-center justify-center rounded border border-amber-400/60 bg-slate-900 text-xs"
              title={activeHeroMeta.name}
            >
              {activeHeroMeta.icon}
            </span>

            {/* Compact HP Bar (90x8px) */}
            <div
              className="relative h-2 w-[90px] overflow-hidden rounded-xs border border-slate-700 bg-slate-950"
              title={`HP: ${Math.ceil(hud.hp)} / ${hud.maxHp}`}
            >
              <div
                className={`h-full transition-all duration-150 ${
                  hud.duckElixirActive
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300'
                    : hpPct > 35
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${hpPct}%` }}
              />
            </div>

            {/* Stamina Dots */}
            <div className="hidden sm:flex items-center gap-0.5" title="Dash Stamina [SPACE]">
              {Array.from({ length: hud.maxStamina }).map((_, idx) => {
                const filled = idx < Math.floor(hud.stamina);
                return (
                  <span
                    key={idx}
                    className={`h-1.5 w-1.5 rounded-full ${
                      filled ? 'bg-sky-400 shadow-[0_0_4px_#38bdf8]' : 'bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Level & Gold */}
            <span className="font-mono-tabular text-[11px] font-bold text-amber-300">
              Lv.{hud.level}
            </span>
            <span className="font-mono-tabular text-[11px] font-semibold text-yellow-200">
              💰{hud.gold.toLocaleString()}
            </span>

            {/* 4 Tiny 20x20px Hero Hot-Swap Face Icons ([1][2][3][4]) */}
            <div className="flex items-center gap-0.5 pl-0.5">
              {HERO_ROSTER.map((hero) => {
                const isActive = hud.activeHeroId === hero.id;
                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => onSwapHero(hero.id)}
                    title={`[${hero.keyNum}] Swap to ${hero.name}`}
                    className={`relative flex h-5 w-5 items-center justify-center rounded border text-[11px] transition-transform cursor-pointer ${
                      isActive
                        ? `${hero.accent} scale-105 shadow-[0_0_6px_rgba(251,191,36,0.5)]`
                        : 'border-slate-700 bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{hero.icon}</span>
                    <span className="absolute -bottom-0.5 right-0 text-[7px] font-mono-tabular font-bold leading-none text-amber-200">
                      {hero.keyNum}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Single Unified [👑 HUB] Button (Collapses Bag, Map, Capital, Skills, Loaf, Emotes) */}
            <button
              type="button"
              onClick={onOpenCapitalHub}
              title="Open Kingdom Command Hub [TAB / C / I / M / K]"
              className="flex h-6 items-center gap-1 rounded border border-amber-400/90 bg-gradient-to-r from-amber-500/35 to-yellow-500/25 px-2 text-[10px] font-pixel text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.35)] hover:from-amber-500/50 hover:to-yellow-500/40 cursor-pointer"
            >
              <span>👑</span>
              <span>HUB</span>
              {(hud.starPoints > 0 || hud.inventory.length > 0) && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          </div>

          {/* CENTER: 1-Line Compact Act Bar (max-height: 28px, max-width: 320px): [Arc Badge] ACT X/300 • [Act Title] + Thin 4px Tug-of-War Bar */}
          <div
            className="hidden md:flex flex-col items-center justify-center min-w-0"
            style={{ maxHeight: '28px', maxWidth: '320px', padding: '4px 8px' }}
          >
            <div className="flex items-center gap-1.5 truncate text-[10px] font-mono-tabular font-bold tracking-tight text-amber-200 max-w-[304px]">
              <span className="rounded border border-amber-400/50 bg-slate-900/90 px-1 py-0.2 text-[9px] text-cyan-300 shrink-0">
                {arcConfig.arcBadge}
              </span>
              <span className="truncate">
                ACT {hud.currentAct}/{totalActsCount} • {hud.actTitle}
              </span>
              {hud.oxygenPct < 100 && (
                <span className="rounded bg-cyan-500/30 px-1 py-0.2 text-[9px] font-mono-tabular text-cyan-200 shrink-0">
                  🫧{Math.ceil(hud.oxygenPct)}%
                </span>
              )}
            </div>

            {/* Thin 4px Tug-of-War Progress Bar Directly Underneath */}
            <div
              className="mt-0.5 flex h-1 w-full max-w-[260px] overflow-hidden rounded-full border border-slate-700/80 bg-rose-950"
              title={`🐾 ALLIANCE (${Math.round(hud.warMorale)}%) vs ${arcConfig.enemyFaction} (${100 - Math.round(hud.warMorale)}%)`}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-cyan-300 transition-all duration-300"
                style={{ width: `${Math.max(5, Math.min(95, hud.warMorale))}%` }}
              />
            </div>
          </div>

          {/* RIGHT: Compact 24px Action Pills with flex-wrap: wrap; justify-content: flex-end; gap: 4px */}
          <div
            className="flex items-center shrink-0"
            style={{ flexWrap: 'wrap', justifyContent: 'flex-end', gap: '4px' }}
          >
            {/* [🧪 H] Heal Potion */}
            <button
              type="button"
              onClick={onHeal}
              disabled={hud.healthPotions <= 0 || hud.hp >= hud.maxHp || hud.potionCooldown > 0}
              title="Drink Health Potion [H]"
              className={`flex h-6 items-center gap-0.5 rounded border px-1.5 text-[10px] font-mono-tabular font-bold transition-colors ${
                hud.healthPotions > 0 && hud.hp < hud.maxHp && hud.potionCooldown <= 0
                  ? 'border-rose-400/80 bg-rose-500/25 text-rose-100 hover:bg-rose-500/35 cursor-pointer'
                  : 'border-slate-800 bg-slate-900/70 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>🧪</span>
              <span>H:{hud.healthPotions}</span>
            </button>

            {/* [⚗️ F] Toss Voxel Cauldron Brew */}
            <button
              type="button"
              onClick={onTossBrewPotion}
              disabled={brewCount <= 0 || hud.brewTossCooldown > 0}
              title={`Toss ${equippedBrew?.name ?? 'Cauldron Flask'} [F]`}
              className={`flex h-6 items-center gap-0.5 rounded border px-1.5 text-[10px] font-mono-tabular font-bold transition-colors ${
                brewCount > 0 && hud.brewTossCooldown <= 0
                  ? 'border-emerald-400/80 bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/35 cursor-pointer'
                  : 'border-slate-800 bg-slate-900/70 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>⚗️</span>
              <span>F:{brewCount}</span>
            </button>

            {/* [🦆 Q] Golden Duck Elixir */}
            <button
              type="button"
              onClick={onUseElixir}
              disabled={!hud.hasDuckElixir || (hud.duckElixirCooldown > 0 && !hud.duckElixirActive)}
              title="Drink Golden Duck Elixir [Q]"
              className={`flex h-6 items-center gap-0.5 rounded border px-1.5 text-[10px] font-mono-tabular font-bold transition-colors ${
                hud.duckElixirActive
                  ? 'border-yellow-300 bg-yellow-400/35 text-yellow-100 animate-pulse cursor-pointer'
                  : hud.hasDuckElixir && hud.duckElixirCooldown <= 0
                  ? 'border-amber-400/80 bg-amber-500/25 text-amber-100 hover:bg-amber-500/35 cursor-pointer'
                  : 'border-slate-800 bg-slate-900/70 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>🦆</span>
              <span>
                {hud.duckElixirActive
                  ? `${hud.duckElixirTimer.toFixed(0)}s`
                  : hud.duckElixirCooldown > 0
                  ? `${Math.ceil(hud.duckElixirCooldown)}s`
                  : 'Q:RDY'}
              </span>
            </button>

            {/* [📯 R] Great Duck Summon */}
            {summonUnlocked && (
              <button
                type="button"
                onClick={onSummon}
                disabled={!summonReady}
                title="Summon The Great Duck [R]"
                className={`flex h-6 items-center gap-0.5 rounded border px-1.5 text-[10px] font-mono-tabular font-bold transition-colors ${
                  summonReady
                    ? 'border-cyan-300 bg-cyan-500/30 text-cyan-100 hover:bg-cyan-500/45 cursor-pointer'
                    : 'border-slate-800 bg-slate-900/70 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>📯</span>
                <span>{summonReady ? 'R:RDY' : `${Math.ceil(hud.duckSummonCooldown)}s`}</span>
              </button>
            )}

            {/* [🤖 G] Steam-Mecha Titan */}
            <button
              type="button"
              onClick={onToggleSteamMecha}
              disabled={!hud.steamMechaActive && hud.steamMechaCooldown > 0}
              title="Deploy Steam-Mecha Titan [G]"
              className={`flex h-6 items-center gap-0.5 rounded border px-1.5 text-[10px] font-mono-tabular font-bold transition-colors ${
                hud.steamMechaActive
                  ? 'border-amber-300 bg-amber-500/35 text-amber-100 animate-pulse cursor-pointer'
                  : hud.steamMechaCooldown <= 0
                  ? 'border-orange-400/80 bg-orange-500/25 text-orange-100 hover:bg-orange-500/35 cursor-pointer'
                  : 'border-slate-800 bg-slate-900/70 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>🤖</span>
              <span>
                {hud.steamMechaActive
                  ? `${hud.steamMechaTimer.toFixed(0)}s`
                  : hud.steamMechaCooldown > 0
                  ? `${Math.ceil(hud.steamMechaCooldown)}s`
                  : 'G:RDY'}
              </span>
            </button>

            {/* [📱] Toggle Mobile Touch Controls */}
            <button
              type="button"
              onClick={onToggleTouch}
              title={touchEnabled ? 'Hide Touch Controls' : 'Show Touch Controls'}
              className={`flex h-6 w-6 items-center justify-center rounded border transition-colors cursor-pointer ${
                touchEnabled
                  ? 'border-sky-400 bg-sky-500/30 text-sky-200'
                  : 'border-slate-700 bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>

            {/* [📳] Toggle Screen Shake ON/OFF */}
            <button
              type="button"
              onClick={onToggleScreenShake}
              title={`Screen Shake: ${hud.screenShakeEnabled ? 'ON' : 'OFF'}`}
              className={`flex h-6 items-center gap-0.5 rounded border px-1.5 text-[10px] font-mono-tabular font-bold transition-colors cursor-pointer ${
                hud.screenShakeEnabled
                  ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-200'
                  : 'border-slate-700 bg-slate-900/80 text-slate-400 hover:text-white'
              }`}
            >
              <span>📳</span>
              <span>{hud.screenShakeEnabled ? 'ON' : 'OFF'}</span>
            </button>

            {/* [🔊] Mute / Unmute Audio */}
            <button
              type="button"
              onClick={onToggleMute}
              title={hud.muted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
              className="flex h-6 w-6 items-center justify-center rounded border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white cursor-pointer"
            >
              {hud.muted ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* STRICT 1-TOAST LIMIT (max-width: 280px, font-size: 11px, padding: 2px 8px, fades after 1.2s) */}
        {activeToast && (
          <div
            className="mt-1 truncate rounded-full border border-amber-400/50 bg-slate-950/85 font-medium text-amber-200 shadow-md backdrop-blur-xs"
            style={{ maxWidth: '280px', fontSize: '11px', padding: '2px 8px' }}
          >
            {activeToast.text}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* BOTTOM AREA: COMPACT BOSS BAR & INTERACTION PROMPT ONLY               */}
      {/* ===================================================================== */}
      <div className="flex flex-col items-center gap-1.5 px-3 pb-2">
        {hud.activeBoss && (
          <div className="w-full max-w-md rounded-md border border-rose-500/60 bg-slate-950/85 px-3 py-1.5 shadow-lg backdrop-blur-xs">
            <div className="flex items-center justify-between text-[10px] font-mono-tabular">
              <span className="font-pixel text-[10px] text-rose-300 truncate">
                {hud.activeBoss.name} · {hud.activeBoss.phaseText}
              </span>
              <span className="text-rose-200 font-bold">
                {Math.ceil(hud.activeBoss.hp).toLocaleString()} / {hud.activeBoss.maxHp.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-xs border border-rose-900 bg-slate-900">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 transition-all duration-150"
                style={{ width: `${bossPct}%` }}
              />
            </div>
            {hud.activeBoss.dragonRaid && (
              <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px] font-mono-tabular">
                <span
                  className={`rounded px-1.5 py-0.2 border ${
                    hud.activeBoss.dragonRaid.wingsBroken
                      ? 'border-slate-700 bg-slate-900 text-slate-500 line-through'
                      : 'border-amber-400/60 bg-amber-950/50 text-amber-200'
                  }`}
                >
                  Wings: {hud.activeBoss.dragonRaid.wingsBroken ? 'BROKEN' : `${Math.ceil((hud.activeBoss.dragonRaid.wingsHp / Math.max(1, hud.activeBoss.dragonRaid.wingsMaxHp)) * 100)}%`}
                </span>
                <span
                  className={`rounded px-1.5 py-0.2 border ${
                    hud.activeBoss.dragonRaid.tailSevered
                      ? 'border-slate-700 bg-slate-900 text-slate-500 line-through'
                      : 'border-amber-400/60 bg-amber-950/50 text-amber-200'
                  }`}
                >
                  Tail: {hud.activeBoss.dragonRaid.tailSevered ? 'SEVERED' : `${Math.ceil((hud.activeBoss.dragonRaid.tailHp / Math.max(1, hud.activeBoss.dragonRaid.tailMaxHp)) * 100)}%`}
                </span>
                {hud.activeBoss.krakenTentaclesAlive !== undefined && (
                  <span className="rounded px-1.5 py-0.2 border border-cyan-400/60 bg-cyan-950/50 text-cyan-200">
                    Tentacles: {hud.activeBoss.krakenTentaclesAlive}/8
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {hud.interactPrompt && (
          <div className="rounded-full border border-amber-400/70 bg-slate-950/85 px-3 py-0.5 text-[11px] font-mono-tabular font-semibold text-amber-200 shadow-md">
            {hud.interactPrompt}
          </div>
        )}
      </div>
    </div>
  );
};
