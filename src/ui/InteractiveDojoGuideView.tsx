/**
 * Layer 4 — React Interactive Playable Practice Dojo Guide Component
 */

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Shield, Sparkles, Swords, Users } from 'lucide-react';
import type { HeroId } from '../types/entities';
import {
  createInitialDojoState,
  getDojoCompletionRatio,
  performDojoAction,
  stepDojoTimers,
  type DojoPracticeState,
} from './interactiveDojoGuide';

const HERO_OPTIONS: ReadonlyArray<{ readonly id: HeroId; readonly label: string; readonly color: string }> = [
  { id: 'nyx', label: '1. Nyx', color: '#c084fc' },
  { id: 'king_leo', label: '2. King Leo', color: '#fbbf24' },
  { id: 'fenrir', label: '3. Fenrir', color: '#94a3b8' },
  { id: 'great_duck', label: '4. Great Duck', color: '#38bdf8' },
];

export function InteractiveDojoGuideView() {
  const dojoRef = useRef<DojoPracticeState>(createInitialDojoState());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snapshot, setSnapshot] = useState<DojoPracticeState>(() => ({
    ...dojoRef.current,
    badges: dojoRef.current.badges.map((b) => ({ ...b })),
  }));

  const syncSnapshot = (): void => {
    const cur = dojoRef.current;
    setSnapshot({
      ...cur,
      heroPos: { ...cur.heroPos },
      dummyPos: { ...cur.dummyPos },
      badges: cur.badges.map((b) => ({ ...b })),
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let last = performance.now();

    const draw = (now: number): void => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const st = dojoRef.current;
      stepDojoTimers(st, dt);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 360, 200);
      ctx.fillStyle = '#334155';
      ctx.fillRect(12, 132, 336, 56);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 16, 336, 172);

      // Training Dummy
      ctx.fillStyle = st.dummyHitFlash > 0 ? '#ffffff' : '#b45309';
      ctx.fillRect(Math.round(st.dummyPos.x - 10), Math.round(st.dummyPos.y - 18), 20, 36);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(Math.round(st.dummyPos.x - 16), Math.round(st.dummyPos.y - 6), 32, 6);

      // Active Hero
      const heroColor =
        HERO_OPTIONS.find((h) => h.id === st.heroId)?.color ?? '#c084fc';
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(Math.round(st.heroPos.x - 11), Math.round(st.heroPos.y - 15), 22, 30);
      ctx.fillStyle = heroColor;
      ctx.fillRect(Math.round(st.heroPos.x - 9), Math.round(st.heroPos.y - 13), 18, 26);

      // Callout Banner
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(st.lastCallout, 180, 34);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const trigger = (
    action: 'move' | 'slash' | 'dodge' | 'skill' | 'swap',
    payload?: { dx?: number; dy?: number; heroId?: HeroId },
  ): void => {
    performDojoAction(dojoRef.current, action, payload);
    syncSnapshot();
  };

  const pct = Math.round(getDojoCompletionRatio(snapshot) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-900/90 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Live Royal Practice Dojo
          </span>
          <span className="text-xs font-bold text-emerald-300">
            Combo x{snapshot.comboCount} • {pct}% Mastery
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={360}
          height={200}
          className="w-full rounded-lg border border-slate-700 bg-slate-950"
          style={{ imageRendering: 'pixelated' }}
        />

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => trigger('move', { dx: 32, dy: 0 })}
            className="rounded-lg border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700 cursor-pointer"
          >
            Step Closer →
          </button>
          <button
            type="button"
            onClick={() => trigger('slash')}
            className="flex items-center gap-1 rounded-lg border border-amber-400/60 bg-amber-500/20 px-2.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 cursor-pointer"
          >
            <Swords className="h-3.5 w-3.5" />
            Slash Combo
          </button>
          <button
            type="button"
            onClick={() => trigger('dodge')}
            className="flex items-center gap-1 rounded-lg border border-cyan-400/60 bg-cyan-500/20 px-2.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 cursor-pointer"
          >
            <Shield className="h-3.5 w-3.5" />
            Dodge Roll
          </button>
          <button
            type="button"
            onClick={() => trigger('skill')}
            className="flex items-center gap-1 rounded-lg border border-fuchsia-400/60 bg-fuchsia-500/20 px-2.5 py-1.5 text-xs font-bold text-fuchsia-200 hover:bg-fuchsia-500/30 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Arcane Burst
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {HERO_OPTIONS.map((hero) => (
            <button
              key={hero.id}
              type="button"
              onClick={() => trigger('swap', { heroId: hero.id })}
              className={`rounded-md px-2 py-1 text-[11px] font-bold cursor-pointer border ${
                snapshot.heroId === hero.id
                  ? 'border-amber-400 bg-amber-400/25 text-amber-100'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {hero.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/90 p-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Combat Mastery Checklist
        </h3>
        <div className="flex flex-col gap-2">
          {snapshot.badges.map((badge) => (
            <div
              key={badge.key}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
                badge.completed
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200'
                  : 'border-slate-700 bg-slate-950/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {badge.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-500" />
                )}
                <span className="text-xs font-bold">{badge.label}</span>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-amber-200">
                {badge.keybindHint}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
