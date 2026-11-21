import React, { useEffect, useRef, useState } from 'react';
import { Crown, RotateCcw, Play, Skull, Swords, Sparkles, Map, Flame, Volume2, VolumeX, BookOpen, Settings, Eye, X, Award, Film } from 'lucide-react';
import { getSpriteBank } from '../game/sprites';
import { HUDState } from '../game/types';
import { InteractiveGuideModal } from './InteractiveGuideModal';
import { createShowcaseBossReplay, TitleScreenLiveArena } from '../ui/titleScreenLiveArena';

interface TitleOverlayProps {
  hud: HUDState | null;
  touchEnabled: boolean;
  onStart: () => void;
  onContinue: () => void;
  onStartNightmare: () => void;
  onBossRush: () => void;
  onStartWarCampaign: () => void;
  onStartDragonCampaign: () => void;
  onOpenCapitalHub: () => void;
  onToggleMute: () => void;
  onToggleScreenShake: () => void;
  onToggleTouch: () => void;
  onRestoreAct: (targetAct: number) => void;
  onExportSaveCode: () => string;
  onImportSaveCode: (code: string) => boolean;
}

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  hud,
  touchEnabled,
  onStart,
  onContinue,
  onStartNightmare,
  onBossRush,
  onStartWarCampaign,
  onStartDragonCampaign,
  onOpenCapitalHub,
  onToggleMute,
  onToggleScreenShake,
  onToggleTouch,
  onRestoreAct,
  onExportSaveCode,
  onImportSaveCode,
}) => {
  const sprites = getSpriteBank();
  const [spectateMode, setSpectateMode] = useState(false);
  const [replayTheaterOpen, setReplayTheaterOpen] = useState(false);
  const [replayActPreview, setReplayActPreview] = useState<number>(122);
  const replayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTitlesModal, setShowTitlesModal] = useState(false);
  const [jumpActValue, setJumpActValue] = useState<number>(134);
  const [saveCodeInput, setSaveCodeInput] = useState<string>('');
  const [vaultFeedback, setVaultFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!replayTheaterOpen) return;
    const canvas = replayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const arena = new TitleScreenLiveArena();
    arena.startSavedReplay(
      replayActPreview === 0 ? undefined : createShowcaseBossReplay(replayActPreview),
    );

    let rafId = 0;
    let lastTs = performance.now();
    const renderFrame = (ts: number): void => {
      const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
      lastTs = ts;
      arena.update(dt);
      ctx.save();
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.imageSmoothingEnabled = false;
      arena.render(ctx, 480, 270);
      ctx.restore();
      rafId = requestAnimationFrame(renderFrame);
    };
    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [replayTheaterOpen, replayActPreview]);

  const heroLevel = hud?.level ?? 1;
  const bestAct = hud?.maxUnlockedAct ?? hud?.currentAct ?? 1;
  const currentAct = hud?.currentAct ?? 1;
  const hasSaved = Boolean(hud?.hasSavedGame);
  const shakeOn = hud?.screenShakeEnabled ?? true;
  const isMuted = hud?.muted ?? false;

  if (replayTheaterOpen) {
    return (
      <div className="pointer-events-auto absolute inset-0 z-50 flex flex-col justify-between bg-slate-950/95 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/70 bg-slate-900/95 px-3 py-1 text-[11px] font-pixel text-sky-300 shadow-lg">
            <Film className="h-3.5 w-3.5 text-sky-400" />
            <span>🎬 60Hz DETERMINISTIC REPLAY THEATER</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono-tabular text-[10px]">
            {[
              { act: 0, label: 'Last Saved' },
              { act: 122, label: 'Act 122 Bahamut' },
              { act: 180, label: 'Act 180 Charybdis' },
              { act: 300, label: 'Act 300 Finale' },
            ].map((opt) => (
              <button
                key={opt.act}
                type="button"
                onClick={() => setReplayActPreview(opt.act)}
                className={`rounded-lg border px-2.5 py-1 font-bold cursor-pointer ${
                  replayActPreview === opt.act
                    ? 'border-sky-300 bg-sky-500 text-slate-950'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setReplayTheaterOpen(false)}
              className="rounded-xl border border-amber-400/80 bg-slate-900 hover:bg-slate-800 px-3 py-1 font-pixel text-[10px] text-amber-300 cursor-pointer"
            >
              ⬅ Back
            </button>
          </div>
        </div>

        <div className="my-auto flex items-center justify-center p-2">
          <canvas
            ref={replayCanvasRef}
            width={960}
            height={540}
            className="max-h-[72vh] w-full max-w-[820px] rounded-xl border-2 border-sky-400/60 shadow-2xl"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono-tabular text-slate-400">
          <span>Fixed-Timestep 60Hz Mulberry32 Seeded Replay Engine</span>
          <span className="text-sky-300 font-bold">ZERO DRIFT • 2x HiDPI CRISP RENDER</span>
        </div>
      </div>
    );
  }

  if (spectateMode) {
    return (
      <div className="pointer-events-none absolute inset-0 z-50 flex flex-col justify-between p-3">
        <div className="pointer-events-auto flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-slate-950/85 px-3 py-1 text-[11px] font-pixel text-emerald-300 shadow-lg">
            <span>🤖 LIVE AI-VS-AI BATTLE ARENA</span>
            <span className="text-slate-400">•</span>
            <span className="text-amber-300">NYX &amp; KING LEO vs FENRIR &amp; BAHAMUT</span>
          </div>
          <button
            type="button"
            onClick={() => setSpectateMode(false)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/80 bg-slate-950/90 hover:bg-slate-900 px-3.5 py-1.5 font-pixel text-[11px] text-amber-300 shadow-lg cursor-pointer"
          >
            <span>⬅ Back to Arcade Title</span>
          </button>
        </div>

        <div className="pointer-events-auto self-end rounded-md border border-slate-700/80 bg-slate-950/85 px-2.5 py-1 font-mono-tabular text-[10px] font-semibold text-emerald-300">
          60 FPS • {touchEnabled ? 'MOBILE' : 'DESKTOP'}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between bg-gradient-to-r from-[#050711]/95 via-[#070b18]/78 to-transparent p-2.5 sm:p-4 overflow-y-auto">
      {/* TOP HEADER BADGE BAR */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 font-mono-tabular text-[10px] sm:text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/60 bg-slate-950/90 px-2.5 py-1 font-bold text-cyan-200 shadow">
            🐱 Nyx Lv.{heroLevel}
          </span>
          <button
            type="button"
            onClick={onOpenCapitalHub}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-400/70 bg-amber-950/60 hover:bg-amber-900/70 px-2.5 py-1 font-bold text-amber-200 shadow cursor-pointer transition-colors"
          >
            🏰 Capital &amp; Forge
          </button>
          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/60 bg-slate-950/90 px-2.5 py-1 font-bold text-emerald-200 shadow">
            🏆 Best: Act {bestAct}/300
          </span>
          <button
            type="button"
            onClick={() => setShowTitlesModal(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-fuchsia-400/60 bg-fuchsia-950/50 hover:bg-fuchsia-900/60 px-2.5 py-1 font-bold text-fuchsia-200 shadow cursor-pointer transition-colors"
          >
            🎖️ Titles
          </button>
        </div>

        {/* Right-Side Live Arena Indicator Pill */}
        <button
          type="button"
          onClick={() => setSpectateMode(true)}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-slate-950/80 hover:bg-slate-900 px-3 py-1 text-[10px] font-mono-tabular font-semibold text-emerald-300 cursor-pointer"
        >
          <Eye className="h-3 w-3 text-emerald-400" />
          <span>LIVE AI ARENA: NYX &amp; LEO vs FENRIR &amp; BAHAMUT</span>
        </button>
      </div>

      {/* SLEEK LEFT-WEIGHTED ARCADE TITLE PANEL (Leaves Right Side Open for Live AI Battle!) */}
      <div className="pointer-events-auto my-auto w-full max-w-[430px] rounded-2xl border border-amber-400/75 bg-[#080c18]/92 p-3.5 sm:p-4 shadow-[0_0_40px_rgba(245,158,11,0.18)] backdrop-blur-md">
        {/* HERO EMBLEM IN CORNER BRACKETS + SEGMENTED TITLE */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-400/50 bg-slate-900/95 p-1.5 shadow-inner">
            {/* Arcade Corner Brackets */}
            <span className="
              absolute top-0.5 left-0.5 h-2 w-2 border-t-2 border-l-2 border-amber-400
            " />
            <span className="
              absolute top-0.5 right-0.5 h-2 w-2 border-t-2 border-r-2 border-amber-400
            " />
            <span className="
              absolute bottom-0.5 left-0.5 h-2 w-2 border-b-2 border-l-2 border-amber-400
            " />
            <span className="
              absolute bottom-0.5 right-0.5 h-2 w-2 border-b-2 border-r-2 border-amber-400
            " />
            <img
              src={sprites.portraits.pip_happy}
              alt="Nyx the Wizard Cat"
              className="pixelated-canvas h-12 w-12"
            />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <div className="inline-flex items-center gap-1 text-[9px] font-pixel text-amber-300">
              <Crown className="h-3 w-3 text-amber-400" />
              <span>300-ACT • 6-ARC OMNIVERSE ARENA</span>
            </div>
            <h1 className="font-pixel text-base sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-cyan-300 tracking-wide truncate">
              CLAWS OF THE CROWN
            </h1>
            {/* 5-Color Segmented Underline Bar */}
            <div className="mt-1.5 grid grid-cols-5 gap-1 h-1.5 w-full">
              <span className="rounded-full bg-emerald-400" />
              <span className="rounded-full bg-amber-400" />
              <span className="rounded-full bg-orange-500" />
              <span className="rounded-full bg-cyan-400" />
              <span className="rounded-full bg-fuchsia-400" />
            </div>
          </div>
        </div>

        {/* PRIMARY ORANGE/GOLD CTA BUTTON */}
        <button
          type="button"
          onClick={hasSaved ? onContinue : onStart}
          className="mt-3.5 flex w-full items-center justify-between rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 px-4 py-2.5 text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 font-pixel text-xs sm:text-sm font-bold">
            <Play className="h-4 w-4 fill-current" />
            <span>⚔️ {hasSaved ? 'CONTINUE ODYSSEY' : 'ENTER ODYSSEY'}</span>
          </span>
          <span className="rounded-md bg-slate-950/90 px-2 py-0.5 font-mono-tabular text-[10px] font-bold text-amber-300">
            ACT {currentAct} • PLAY
          </span>
        </button>

        {/* 2-COLUMN MODE SELECTOR GRID */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 font-mono-tabular text-[11px]">
          <button
            type="button"
            onClick={onStart}
            className="flex items-center justify-between rounded-lg border border-emerald-400/50 bg-emerald-950/40 hover:bg-emerald-900/60 px-2.5 py-2 font-bold text-emerald-200 transition-colors cursor-pointer"
          >
            <span>✨ New Odyssey</span>
            <span className="text-[9px] text-emerald-300/80">ACT 1</span>
          </button>

          <button
            type="button"
            onClick={onBossRush}
            className="flex items-center justify-between rounded-lg border border-rose-400/60 bg-rose-950/45 hover:bg-rose-900/65 px-2.5 py-2 font-bold text-rose-200 transition-colors cursor-pointer"
          >
            <span>🔥 Boss Rush</span>
            <span className="text-[9px] text-rose-300/80">5 WAVES</span>
          </button>

          <button
            type="button"
            onClick={onStartWarCampaign}
            className="flex items-center justify-between rounded-lg border border-amber-400/50 bg-amber-950/40 hover:bg-amber-900/60 px-2.5 py-2 font-bold text-amber-200 transition-colors cursor-pointer"
          >
            <span>🛡️ Two-Kingdom War</span>
            <span className="text-[9px] text-amber-300/80">ACT 42</span>
          </button>

          <button
            type="button"
            onClick={onStartNightmare}
            className="flex items-center justify-between rounded-lg border border-fuchsia-400/60 bg-fuchsia-950/45 hover:bg-fuchsia-900/65 px-2.5 py-2 font-bold text-fuchsia-200 transition-colors cursor-pointer"
          >
            <span>💀 Nightmare NG+</span>
            <span className="text-[9px] text-fuchsia-300/80">+55% HP</span>
          </button>

          <button
            type="button"
            onClick={onStartDragonCampaign}
            className="flex items-center justify-between rounded-lg border border-orange-400/60 bg-orange-950/45 hover:bg-orange-900/65 px-2.5 py-2 font-bold text-orange-200 transition-colors cursor-pointer"
          >
            <span>🐉 Dragon Sky-Raid</span>
            <span className="text-[9px] text-orange-300/80">ACT 83</span>
          </button>

          <button
            type="button"
            onClick={() => setSpectateMode(true)}
            className="flex items-center justify-between rounded-lg border border-cyan-400/60 bg-cyan-950/45 hover:bg-cyan-900/65 px-2.5 py-2 font-bold text-cyan-200 transition-colors cursor-pointer"
          >
            <span>🤖 AI vs AI Spectate</span>
            <Eye className="h-3.5 w-3.5 text-cyan-300" />
          </button>
        </div>

        {/* BOTTOM ROW: [📖 Interactive Guide], [🎬 Watch Saved Replay], & [🎵 Sound & Keys] */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-slate-800/90 pt-2.5">
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="flex items-center justify-between rounded-lg border border-sky-400/70 bg-sky-950/60 hover:bg-sky-900/75 px-2.5 py-2 text-left transition-colors cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-sky-200">
                <BookOpen className="h-3 w-3 text-sky-300" />
                <span>📖 Guide</span>
              </div>
              <div className="text-[9px] text-sky-300/80">Live Dojo</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setReplayTheaterOpen(true)}
            className="flex items-center justify-between rounded-lg border border-indigo-400/70 bg-indigo-950/60 hover:bg-indigo-900/75 px-2.5 py-2 text-left transition-colors cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-200">
                <Film className="h-3 w-3 text-indigo-300" />
                <span>🎬 Replay</span>
              </div>
              <div className="text-[9px] text-indigo-300/80">60Hz Theater</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-between rounded-lg border border-slate-600/80 bg-slate-900/90 hover:bg-slate-800 px-2.5 py-2 text-left transition-colors cursor-pointer"
          >
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-200">
                <Settings className="h-3 w-3 text-amber-300" />
                <span>🎵 Sound</span>
              </div>
              <div className="text-[9px] text-slate-400">
                {shakeOn ? 'Shake ON' : 'Shake OFF'} • {isMuted ? 'Mute' : 'ON'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* BOTTOM BAR: 4 HERO BADGES + TINY 60 FPS • [DESKTOP / MOBILE] BADGE */}
      <div className="pointer-events-auto flex items-center justify-between gap-2">
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800/90 bg-slate-950/85 px-2.5 py-1 text-[10px] font-mono-tabular text-slate-300">
          <span className="text-cyan-300 font-bold">[1] Nyx</span>
          <span>•</span>
          <span className="text-amber-300 font-bold">[2] Lion King Leo</span>
          <span>•</span>
          <span className="text-fuchsia-300 font-bold">[3] Wolf-King Fenrir</span>
          <span>•</span>
          <span className="text-yellow-300 font-bold">[4] Great Duck</span>
        </div>

        <div className="ml-auto rounded-md border border-slate-700/80 bg-slate-950/90 px-2.5 py-1 font-mono-tabular text-[10px] font-semibold text-emerald-300 shadow">
          60 FPS • [{touchEnabled ? 'MOBILE' : 'DESKTOP'}]
        </div>
      </div>

      {/* INTERACTIVE PLAYABLE GUIDE & MINI-DOJO MODAL */}
      {showGuideModal && <InteractiveGuideModal onClose={() => setShowGuideModal(false)} />}

      {/* SOUND, SCREEN-SHAKE & KEYS SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border-2 border-amber-400/80 bg-[#080d1a] p-4 sm:p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-pixel text-xs sm:text-sm text-amber-300">
                🎵 SOUND, CAMERA &amp; KEYBINDS
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 p-1 text-slate-300 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={onToggleScreenShake}
                className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                  shakeOn
                    ? 'border-emerald-400/70 bg-emerald-950/50 text-emerald-200'
                    : 'border-slate-700 bg-slate-900 text-slate-300'
                }`}
              >
                <span>📳 Screen Shake (Boss &amp; Elixir Only)</span>
                <span className="rounded bg-slate-950 px-2 py-0.5 font-mono-tabular text-[11px]">
                  {shakeOn ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                  !isMuted
                    ? 'border-cyan-400/70 bg-cyan-950/50 text-cyan-200'
                    : 'border-rose-400/60 bg-rose-950/40 text-rose-200'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span>30-Track Chiptune OST &amp; SFX</span>
                </span>
                <span className="rounded bg-slate-950 px-2 py-0.5 font-mono-tabular text-[11px]">
                  {isMuted ? 'MUTED' : 'ON'}
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleTouch}
                className="flex w-full items-center justify-between rounded-xl border border-amber-400/60 bg-slate-900 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-amber-200 cursor-pointer"
              >
                <span>📱 On-Screen Touch Gamepad</span>
                <span className="rounded bg-slate-950 px-2 py-0.5 font-mono-tabular text-[11px]">
                  {touchEnabled ? 'ENABLED' : 'HIDDEN'}
                </span>
              </button>
            </div>

            <div className="mt-3 rounded-xl border border-amber-400/50 bg-amber-950/25 p-3 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-pixel text-amber-300">💾 IPAD SAVE VAULT &amp; ACT RESTORE</span>
                <button
                  type="button"
                  onClick={() => {
                    onRestoreAct(134);
                    setShowSettingsModal(false);
                  }}
                  className="rounded-lg border border-amber-300 bg-amber-400 hover:bg-amber-300 px-2.5 py-1 text-[10px] font-bold text-slate-950 cursor-pointer"
                >
                  ⚡ RESTORE ACT 134
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono-tabular text-slate-200">
                  <span>Act 1–300 Jump Slider (Scaled Gear)</span>
                  <span className="font-bold text-cyan-300">ACT {jumpActValue}/300</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={300}
                    value={jumpActValue}
                    onChange={(e) => setJumpActValue(Number(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreAct(jumpActValue);
                      setShowSettingsModal(false);
                    }}
                    className="rounded-lg border border-cyan-400/70 bg-cyan-950/70 hover:bg-cyan-900 px-2.5 py-1 text-[10px] font-bold text-cyan-200 cursor-pointer whitespace-nowrap"
                  >
                    Jump Act {jumpActValue}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={saveCodeInput}
                  onChange={(e) => setSaveCodeInput(e.target.value)}
                  placeholder="Paste COTC1:... save code"
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 font-mono-tabular text-[10px] text-slate-100 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const code = onExportSaveCode();
                    setSaveCodeInput(code);
                    if (navigator.clipboard) {
                      void navigator.clipboard.writeText(code);
                    }
                    setVaultFeedback('Copied COTC1 save code!');
                  }}
                  className="rounded-lg border border-emerald-400/70 bg-emerald-950/60 hover:bg-emerald-900 px-2 py-1 text-[10px] font-bold text-emerald-200 cursor-pointer"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ok = onImportSaveCode(saveCodeInput);
                    setVaultFeedback(ok ? 'Vault restored!' : 'Invalid COTC1 code');
                    if (ok) setShowSettingsModal(false);
                  }}
                  className="rounded-lg border border-fuchsia-400/70 bg-fuchsia-950/60 hover:bg-fuchsia-900 px-2 py-1 text-[10px] font-bold text-fuchsia-200 cursor-pointer"
                >
                  Load
                </button>
              </div>
              {vaultFeedback && (
                <div className="text-[10px] font-semibold text-emerald-300">{vaultFeedback}</div>
              )}
            </div>

            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/85 p-3 font-mono-tabular text-[11px] space-y-1 text-left">
              <div className="text-[10px] font-pixel text-cyan-300 mb-1">KEYBOARD &amp; MOUSE CONTROLS</div>
              <div className="flex justify-between"><span className="text-amber-300">WASD / Arrows</span><span>Move Hero</span></div>
              <div className="flex justify-between"><span className="text-amber-300">SPACE / Left-Click</span><span>3-Hit Arcane Slash &amp; Beam</span></div>
              <div className="flex justify-between"><span className="text-amber-300">SHIFT / Right-Click</span><span>Perfect Dodge-Roll &amp; Backstab</span></div>
              <div className="flex justify-between"><span className="text-cyan-300">[1] [2] [3] [4]</span><span>Hot-Swap Nyx / Leo / Fenrir / Duck</span></div>
              <div className="flex justify-between"><span className="text-emerald-300">[H] / [F] / [Q] / [R]</span><span>Potion / Brew Flask / Elixir / Horn</span></div>
              <div className="flex justify-between"><span className="text-orange-300">[G] / [TAB] / [M]</span><span>Steam-Mecha / Kingdom Hub / Map</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ROYAL TITLES MODAL */}
      {showTitlesModal && (
        <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border-2 border-fuchsia-400/80 bg-[#080d1a] p-4 sm:p-5 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="inline-flex items-center gap-1.5 font-pixel text-xs sm:text-sm text-fuchsia-300">
                <Award className="h-4 w-4 text-amber-300" />
                <span>🎖️ OMNIVERSE ROYAL TITLES</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTitlesModal(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 p-1 text-slate-300 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2 text-left text-xs">
              {[
                { act: 1, title: '⭐ Squire of the Starlight Wand', desc: 'Begin the 300-Act Odyssey in Felis Citadel.' },
                { act: 41, title: '🦁 Liberator of Lion King Leo', desc: 'Vanquish Usurper Fenrir in Act 41.' },
                { act: 82, title: '🐺 Sovereign of Two Kingdoms', desc: 'Unite Cat & Dog Realms in Act 82.' },
                { act: 122, title: '🐉 Dragon-God World-Breaker', desc: 'Defeat Ignis-Bahamut in Act 122.' },
                { act: 180, title: '🐙 Kraken-Bane of the Coral Abyss', desc: 'Sever all 8 Tentacles & defeat Charybdis in Act 180.' },
                { act: 240, title: '⚙️ Chrono-Titan Breaker', desc: 'Shatter the 4 Chrono-Gears & defeat Chronos-Omega in Act 240.' },
                { act: 300, title: '🌌 Supreme Omniverse Savior', desc: 'Conquer Aether-Null in Act 300.' },
              ].map((t) => {
                const unlocked = bestAct >= t.act;
                return (
                  <div
                    key={t.title}
                    className={`rounded-lg border px-3 py-2 ${
                      unlocked
                        ? 'border-amber-400/60 bg-amber-950/35 text-amber-100'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{t.title}</span>
                      <span className="font-mono-tabular text-[10px]">
                        {unlocked ? '✅ UNLOCKED' : `🔒 ACT ${t.act}`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{t.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface GameOverOverlayProps {
  currentAct: number;
  onRetryAct: () => void;
  onRestart: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  currentAct,
  onRetryAct,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-rose-500/70 bg-slate-900 p-6 text-center shadow-2xl">
        <Skull className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="font-pixel text-xl text-rose-300">FALLEN IN ACT {currentAct}/300</h2>
        <p className="mt-2 text-sm text-slate-300">
          Your party was overwhelmed, but the Starlight Crown endures. Retry Act {currentAct} with all
          your gear, Capital buildings, and Constellation skills intact.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRetryAct}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Act {currentAct}</span>
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <span>New Odyssey</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryOverlayProps {
  hud: HUDState;
  onPlayAgain: () => void;
  onStartNightmare: () => void;
  onOpenWorldMap: () => void;
  onBossRush: () => void;
  onVisitSanctuary: () => void;
  onStartWarCampaign: () => void;
  onStartDragonCampaign: () => void;
}

export const VictoryOverlay: React.FC<VictoryOverlayProps> = ({
  hud,
  onPlayAgain,
  onStartNightmare,
  onOpenWorldMap,
  onBossRush,
  onVisitSanctuary,
  onStartWarCampaign,
  onStartDragonCampaign,
}) => {
  const sprites = getSpriteBank();
  const mins = Math.floor(hud.stats.elapsedSeconds / 60);
  const secs = Math.floor(hud.stats.elapsedSeconds % 60);
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isAct300Victory = hud.currentAct >= 300 || hud.clearedActs.includes(300) || hud.story.aetherNullDefeated;
  const isAct122Victory = !isAct300Victory && (hud.currentAct >= 122 || hud.clearedActs.includes(122) || hud.story.bahamutDefeated);
  const isAct82Victory = !isAct300Victory && !isAct122Victory && (hud.currentAct >= 82 || hud.clearedActs.includes(82));

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border-2 border-amber-400 bg-slate-900 p-6 sm:p-7 text-center shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-center gap-4 mb-3">
          <img src={sprites.portraits.pip_happy} alt="Grand Archmage Nyx" className="pixelated-canvas w-14 h-14" />
          <Crown className="w-9 h-9 text-amber-300" />
          <img
            src={sprites.portraits.king_leo}
            alt="Lion King Leo"
            className="pixelated-canvas w-14 h-14"
          />
          <img
            src={sprites.portraits.fenrir}
            alt="Wolf-King Fenrir"
            className="pixelated-canvas w-14 h-14"
          />
        </div>

        <h2 className="font-pixel text-lg sm:text-xl text-amber-300">
          {isAct300Victory
            ? 'SUPREME OMNIVERSE SAVIOR (300/300 ACTS)!'
            : isAct122Victory
            ? 'ARC IV UNLOCKED: KRAKEN ABYSS (ACTS 123–300)!'
            : isAct82Victory
            ? 'TWO KINGDOMS UNITED!'
            : 'LION KING LEO RESTORED!'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {isAct300Victory
            ? 'Aether-Null, The Eclipse Singularity has been vanquished! Nyx, Lion King Leo, Wolf-King Fenrir, and The Great Duck have saved all 300 Acts across the 6 Story Arcs!'
            : isAct122Victory
            ? 'World-Breaker Ignis-Bahamut has fallen into the Hadal Trench, awakening Charybdis the 8-Tentacle World-Kraken! Open the 300-Act World Map to sail into Arcs IV, V & VI (Acts 123–300)!'
            : isAct82Victory
            ? 'God-Beast Ragnarok has fallen in Act 82! A colossal Dragon just shattered the Peace Treaty—unite with Wolf-King Fenrir to conquer Arc III: The Dragon Cataclysm (Acts 83–122)!'
            : 'Usurper Fenrir is vanquished and Lion King Leo is back on the throne! Now the Dog Kingdom Legions march on the border—lead the War of the Two Kingdoms (Acts 42–82)!'}
        </p>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 rounded-lg border border-slate-800 bg-slate-950/75 p-3.5 text-left font-mono-tabular">
          <div>
            <div className="text-[11px] text-slate-400">Clear Time</div>
            <div className="text-sm font-bold text-white">{timeStr}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Hero Level</div>
            <div className="text-sm font-bold text-sky-300">Lv.{hud.level}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Foes Slain</div>
            <div className="text-sm font-bold text-emerald-300">{hud.stats.enemiesSlain}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Perfect Dodges</div>
            <div className="text-sm font-bold text-cyan-300">{hud.stats.perfectDodges}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Fish Feast</div>
            <div className="text-sm font-bold text-sky-200">{hud.stats.fishTreatsCollected} Treats</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400">Damage Dealt</div>
            <div className="text-sm font-bold text-rose-300">{hud.stats.damageDealt.toLocaleString()}</div>
          </div>
        </div>

        {/* Highlight CTA for Next Arc */}
        {!isAct300Victory && !isAct122Victory && (
          <div className="mt-3">
            {isAct82Victory ? (
              <button
                type="button"
                onClick={onStartDragonCampaign}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-lg border-2 border-orange-300 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 px-5 py-2.5 font-pixel text-xs sm:text-sm text-slate-950 shadow-lg transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>🐉 Enter Act 83: The Dragon Cataclysm (Acts 83–122)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartWarCampaign}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-lg border-2 border-amber-300 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 hover:from-rose-500 hover:to-amber-400 px-5 py-2.5 font-pixel text-xs sm:text-sm text-slate-950 shadow-lg transition-all cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>⚔️ March to Act 42: War of Two Kingdoms (Acts 42–82)</span>
              </button>
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpenWorldMap}
            className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-400/80 bg-sky-500/20 hover:bg-sky-500/30 px-3.5 py-2 font-pixel text-[11px] text-sky-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Map className="w-3.5 h-3.5" />
            <span>300-Act Map</span>
          </button>

          <button
            type="button"
            onClick={onBossRush}
            className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-400/80 bg-rose-500/20 hover:bg-rose-500/30 px-3.5 py-2 font-pixel text-[11px] text-rose-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Boss Rush</span>
          </button>

          <button
            type="button"
            onClick={onStartNightmare}
            className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-fuchsia-400/80 bg-fuchsia-500/25 hover:bg-fuchsia-500/35 px-3.5 py-2 font-pixel text-[11px] text-fuchsia-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Nightmare NG+</span>
          </button>

          <button
            type="button"
            onClick={onVisitSanctuary}
            className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/80 bg-emerald-500/20 hover:bg-emerald-500/30 px-3.5 py-2 font-pixel text-[11px] text-emerald-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Act 40 Sanctum</span>
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 px-4 py-2 font-pixel text-[11px] text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
