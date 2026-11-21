/**
 * File 73 / 100 — React 60FPS Title Screen Live Arena Canvas Wrapper.
 * Strictly typed (ZERO `any`).
 */

import { useEffect, useRef } from 'react';
import { TitleScreenLiveArena } from './titleScreenLiveArena';
import type { RecordedBattleReplay } from '../math/deterministicReplayEngine';

export interface TitleScreenLiveArenaProps {
  readonly width?: number;
  readonly height?: number;
  readonly replayToPlay?: RecordedBattleReplay | null;
  readonly className?: string;
}

export function TitleScreenLiveArenaCanvas({
  width = 480,
  height = 240,
  replayToPlay = null,
  className = '',
}: TitleScreenLiveArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const arenaRef = useRef<TitleScreenLiveArena | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const arena = new TitleScreenLiveArena();
    arenaRef.current = arena;
    if (replayToPlay) {
      arena.startSavedReplay(replayToPlay);
    }

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

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`block w-full rounded-xl border border-slate-700/80 bg-slate-950 ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
