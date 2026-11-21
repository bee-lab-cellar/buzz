/**
 * File 77 / 100 — Responsive Mobile / iPad Virtual Twin-Stick & Ability Controller.
 * Strictly typed (ZERO `any`).
 */

import { useCallback, useState } from 'react';
import { Flame, Heart, Shield, Swords, Volume2 } from 'lucide-react';
import type { MobileTouchState } from '../types/audioAndUi';

export interface MobileTouchControllerProps {
  readonly onInputChange: (state: MobileTouchState) => void;
  readonly visible?: boolean;
}

type ActionButtonId = 'attack' | 'dodge' | 'elixir' | 'war_horn' | 'potion';

export function MobileTouchController({
  onInputChange,
  visible = true,
}: MobileTouchControllerProps) {
  const [stick, setStick] = useState<{ active: boolean; dx: number; dy: number }>({
    active: false,
    dx: 0,
    dy: 0,
  });
  const [pressed, setPressed] = useState<ActionButtonId[]>([]);

  const emit = useCallback(
    (nextStick: { active: boolean; dx: number; dy: number }, nextButtons: ActionButtonId[]) => {
      onInputChange({
        stickActive: nextStick.active,
        stickDx: nextStick.dx,
        stickDy: nextStick.dy,
        activeButtons: nextButtons,
      });
    },
    [onInputChange],
  );

  const setDirection = (dx: number, dy: number, active: boolean): void => {
    const nextStick = { active, dx, dy };
    setStick(nextStick);
    emit(nextStick, pressed);
  };

  const toggleButton = (btn: ActionButtonId, down: boolean): void => {
    const next = down
      ? pressed.includes(btn)
        ? pressed
        : [...pressed, btn]
      : pressed.filter((b) => b !== btn);
    setPressed(next);
    emit(stick, next);
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex items-end justify-between px-4 sm:hidden">
      {/* Left Directional Pad */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1 rounded-2xl border border-slate-700/70 bg-slate-950/75 p-2">
        <div />
        <button
          type="button"
          onPointerDown={() => setDirection(0, -1, true)}
          onPointerUp={() => setDirection(0, 0, false)}
          onPointerLeave={() => setDirection(0, 0, false)}
          className="h-10 w-10 rounded-lg bg-slate-800 text-xs font-black text-slate-200 active:bg-amber-400 active:text-slate-950"
        >
          ▲
        </button>
        <div />
        <button
          type="button"
          onPointerDown={() => setDirection(-1, 0, true)}
          onPointerUp={() => setDirection(0, 0, false)}
          onPointerLeave={() => setDirection(0, 0, false)}
          className="h-10 w-10 rounded-lg bg-slate-800 text-xs font-black text-slate-200 active:bg-amber-400 active:text-slate-950"
        >
          ◀
        </button>
        <div className="h-10 w-10 rounded-full border border-slate-700 bg-slate-900" />
        <button
          type="button"
          onPointerDown={() => setDirection(1, 0, true)}
          onPointerUp={() => setDirection(0, 0, false)}
          onPointerLeave={() => setDirection(0, 0, false)}
          className="h-10 w-10 rounded-lg bg-slate-800 text-xs font-black text-slate-200 active:bg-amber-400 active:text-slate-950"
        >
          ▶
        </button>
        <div />
        <button
          type="button"
          onPointerDown={() => setDirection(0, 1, true)}
          onPointerUp={() => setDirection(0, 0, false)}
          onPointerLeave={() => setDirection(0, 0, false)}
          className="h-10 w-10 rounded-lg bg-slate-800 text-xs font-black text-slate-200 active:bg-amber-400 active:text-slate-950"
        >
          ▼
        </button>
        <div />
      </div>

      {/* Right Ability Cluster */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onPointerDown={() => toggleButton('potion', true)}
            onPointerUp={() => toggleButton('potion', false)}
            aria-label="Potion"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-950/90 text-emerald-300 active:scale-95"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            type="button"
            onPointerDown={() => toggleButton('war_horn', true)}
            onPointerUp={() => toggleButton('war_horn', false)}
            aria-label="War Horn"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/60 bg-purple-950/90 text-purple-300 active:scale-95"
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onPointerDown={() => toggleButton('elixir', true)}
            onPointerUp={() => toggleButton('elixir', false)}
            aria-label="Elixir"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/60 bg-amber-950/90 text-amber-300 active:scale-95"
          >
            <Flame className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onPointerDown={() => toggleButton('dodge', true)}
            onPointerUp={() => toggleButton('dodge', false)}
            aria-label="Dodge"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-950/90 text-sky-200 active:scale-95"
          >
            <Shield className="h-5 w-5" />
          </button>
          <button
            type="button"
            onPointerDown={() => toggleButton('attack', true)}
            onPointerUp={() => toggleButton('attack', false)}
            aria-label="Attack"
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-500 text-slate-950 active:scale-95"
          >
            <Swords className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
