/**
 * File 78 / 100 — 60FPS Letterbox Cutscene Cinema Overlay UI.
 * Displays speaker name, typewriter dialogue line, progress bar, & 2x / Skip controls.
 * Zero `any` types.
 */

import { FastForward, Sparkles } from 'lucide-react';
import type { CutsceneCinemaRigState } from '../engine/cutsceneDirector';

export interface CutsceneOverlayUiProps {
  readonly title: string;
  readonly state: CutsceneCinemaRigState;
  readonly onSkip: () => void;
  readonly onToggleFastForward?: () => void;
}

export function CutsceneOverlayUi({
  title,
  state,
  onSkip,
  onToggleFastForward,
}: CutsceneOverlayUiProps) {
  const totalBeats = state.track?.beats.length ?? 1;
  const activeBeat = state.track?.beats[state.beatIndex] ?? null;
  const progressPct = Math.round(
    Math.max(0, Math.min(1, (state.beatIndex + (state.active ? 0.5 : 1)) / Math.max(1, totalBeats))) * 100,
  );
  const barHeightPx = Math.max(44, Math.round(state.letterboxBarHeightPx));

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex flex-col justify-between">
      {/* Top Cinema Letterbox Bar */}
      <div
        className="flex items-center justify-between border-b border-amber-500/30 bg-slate-950 px-5 transition-all"
        style={{ height: `${barHeightPx}px` }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-200">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onToggleFastForward && (
            <button
              type="button"
              onClick={onToggleFastForward}
              className="rounded-lg border border-amber-500/40 bg-slate-900 px-2.5 py-1 text-xs font-bold text-amber-200 hover:bg-slate-800 cursor-pointer"
            >
              {state.playbackSpeed}x Speed
            </button>
          )}
          <button
            type="button"
            onClick={onSkip}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            <FastForward className="h-3.5 w-3.5" />
            Skip Cutscene
          </button>
        </div>
      </div>

      {/* Bottom Dialogue & Progress Bar */}
      <div className="border-t border-amber-500/30 bg-slate-950/96 px-6 py-4">
        <div className="mx-auto max-w-3xl space-y-2">
          {activeBeat ? (
            <>
              <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                {activeBeat.speakerName}
              </div>
              <p className="min-h-[2.5rem] text-sm font-medium leading-relaxed text-slate-100">
                {activeBeat.dialogueText.slice(0, state.revealedChars)}
              </p>
            </>
          ) : (
            <p className="min-h-[2.5rem] text-xs italic text-slate-400">
              Cinematic sequence in progress...
            </p>
          )}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-amber-400 transition-all duration-100"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
