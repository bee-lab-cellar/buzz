/**
 * Layer 4 — React View for Live 60FPS Title Screen Arena + Deterministic Replay Theater
 */

import { useEffect, useRef, useState } from 'react';
import { Film, Play, Square } from 'lucide-react';
import { TitleScreenLiveArena, createShowcaseBossReplay } from './titleScreenLiveArena';
import type { RecordedBattleReplay } from '../math/deterministicReplayEngine';

export interface TitleScreenLiveArenaViewProps {
  readonly width?: number;
  readonly height?: number;
  readonly showReplayControls?: boolean;
  readonly replayToPlay?: RecordedBattleReplay | null;
}

export function TitleScreenLiveArenaView({
  width = 480,
  height = 270,
  showReplayControls = true,
  replayToPlay = null,
}: TitleScreenLiveArenaViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arenaRef = useRef<TitleScreenLiveArena | null>(null);
  const [replayPlaying, setReplayPlaying] = useState(Boolean(replayToPlay));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const arena = new TitleScreenLiveArena();
    if (replayToPlay) {
      arena.startSavedReplay(replayToPlay);
    }
    arenaRef.current = arena;
    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number): void => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      arena.update(dt);
      ctx.imageSmoothingEnabled = false;
      arena.render(ctx, width, height);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      arenaRef.current = null;
    };
  }, [width, height, replayToPlay]);

  const handleToggleReplay = (): void => {
    const arena = arenaRef.current;
    if (!arena) return;
    if (replayPlaying) {
      arena.stopSavedReplay();
      setReplayPlaying(false);
    } else {
      arena.startSavedReplay(createShowcaseBossReplay(300));
      setReplayPlaying(true);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-400/40 bg-slate-950 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block h-full w-full"
        style={{ imageRendering: 'pixelated' }}
      />
      {showReplayControls && (
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleReplay}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-400/60 bg-slate-900/90 px-2.5 py-1 text-[11px] font-bold text-cyan-200 hover:bg-slate-800 cursor-pointer"
          >
            {replayPlaying ? (
              <>
                <Square className="h-3.5 w-3.5 text-rose-400" />
                Stop Replay
              </>
            ) : (
              <>
                <Film className="h-3.5 w-3.5 text-cyan-300" />
                Watch 60Hz Replay
              </>
            )}
          </button>
          <span className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-slate-900/90 px-2 py-1 text-[10px] font-semibold text-amber-200">
            <Play className="h-3 w-3 text-emerald-400" />
            Live AI Battle
          </span>
        </div>
      )}
    </div>
  );
}
