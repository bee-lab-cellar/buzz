import React, { useRef, useState } from 'react';
import { HUDState } from '../game/types';
import { PixelIcon } from './PixelIcon';

interface TouchControlsProps {
  hud: HUDState;
  onAnalogMove: (x: number, y: number) => void;
  onAction: (action: 'attack' | 'dodge' | 'interact' | 'heal' | 'elixir' | 'summon' | 'loaf' | 'emote') => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  hud,
  onAnalogMove,
  onAction,
}) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const activeTouchId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false });
  const maxRadius = 36;

  const updateStickFromClient = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setKnob({ x: dx, y: dy, active: true });
    onAnalogMove(dx / maxRadius, dy / maxRadius);
  };

  const resetStick = () => {
    activeTouchId.current = null;
    setKnob({ x: 0, y: 0, active: false });
    onAnalogMove(0, 0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchId.current !== null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    activeTouchId.current = t.identifier;
    updateStickFromClient(t.clientX, t.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === activeTouchId.current) {
        updateStickFromClient(t.clientX, t.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        resetStick();
        break;
      }
    }
  };

  // Mouse fallback so PC users toggling "Touch UI" can also test the thumbstick
  const mouseDownRef = useRef(false);
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownRef.current = true;
    updateStickFromClient(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDownRef.current) return;
    updateStickFromClient(e.clientX, e.clientY);
  };
  const handleMouseUp = () => {
    if (!mouseDownRef.current) return;
    mouseDownRef.current = false;
    resetStick();
  };

  const hasInteract = Boolean(hud.interactPrompt);
  const elixirReady = hud.hasDuckElixir && !hud.duckElixirActive;
  const elixirUrgent = elixirReady && hud.currentAct === 41 && !hud.story.fenrirShieldBroken;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-between px-4 pb-4 sm:px-6 sm:pb-5">
      {/* LEFT THUMB: Virtual Analog Joystick */}
      <div
        ref={padRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ opacity: knob.active ? 0.85 : 0.45 }}
        className="pointer-events-auto relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-slate-300/60 bg-slate-950/60 shadow-lg transition-opacity"
      >
        <div className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-slate-400/40" />
        <div
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
          className="pointer-events-none h-11 w-11 rounded-full border-2 border-amber-300 bg-amber-400/75 shadow-md"
        />
      </div>

      {/* RIGHT THUMB: Ergonomic Action Cluster */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {/* Quick-Use Row: Bread Loaf, Heal & Duck Potion */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              onAction('emote');
            }}
            onClick={() => onAction('emote')}
            className={`flex min-h-[44px] min-w-[66px] items-center justify-center gap-1 rounded-full border px-3 text-[11px] font-pixel active:scale-95 ${
              hud.activeEmote !== 'none'
                ? 'border-amber-300 bg-amber-500/30 text-amber-100'
                : 'border-amber-400/70 bg-slate-950/75 text-amber-200'
            }`}
          >
            <span>🍞</span>
            <span>LOAF</span>
          </button>

          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              onAction('heal');
            }}
            onClick={() => onAction('heal')}
            className="flex min-h-[44px] min-w-[66px] items-center justify-center gap-1 rounded-full border border-emerald-400/70 bg-slate-950/75 px-3 text-[11px] font-pixel text-emerald-200 active:scale-95"
          >
            <PixelIcon kind="healPotion" size={16} />
            <span>{hud.healthPotions}</span>
          </button>

          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              onAction('summon');
            }}
            onClick={() => onAction('summon')}
            className={`flex min-h-[44px] min-w-[78px] items-center justify-center rounded-full border px-3 text-[11px] font-pixel active:scale-95 ${
              hud.duckSummonCooldown <= 0
                ? 'border-yellow-300/80 bg-yellow-500/30 text-yellow-100'
                : 'border-slate-600/80 bg-slate-950/75 text-slate-400'
            }`}
          >
            <span>{hud.duckSummonCooldown <= 0 ? '📯 HORN' : `📯 ${Math.ceil(hud.duckSummonCooldown)}s`}</span>
          </button>

          {hud.hasDuckElixir && (
            <button
              type="button"
              onTouchStart={(e) => {
                e.preventDefault();
                onAction('elixir');
              }}
              onClick={() => onAction('elixir')}
              className={`flex min-h-[44px] min-w-[82px] items-center justify-center gap-1 rounded-full border px-3 text-[11px] font-pixel active:scale-95 ${
                hud.duckElixirActive
                  ? 'border-amber-300 bg-amber-500/35 text-amber-100'
                  : hud.duckElixirCooldown > 0
                  ? 'border-orange-400/75 bg-slate-950/80 text-orange-200'
                  : elixirUrgent
                  ? 'border-amber-200 bg-amber-400/45 text-white animate-pulse shadow-lg'
                  : 'border-amber-400/80 bg-slate-950/80 text-amber-200'
              }`}
            >
              <PixelIcon kind="duckElixir" size={16} />
              <span>
                {hud.duckElixirActive
                  ? `${hud.duckElixirTimer.toFixed(0)}s`
                  : hud.duckElixirCooldown > 0
                  ? `🪶${hud.elixirFeathers}/3`
                  : 'ELIXIR'}
              </span>
            </button>
          )}
        </div>

        {/* Main Combat Cluster: ACT / ROLL / SLASH */}
        <div className="flex items-end gap-2.5">
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              onAction('interact');
            }}
            onClick={() => onAction('interact')}
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-pixel text-[10px] shadow-md active:scale-95 ${
              hasInteract
                ? 'border-amber-300 bg-amber-500/80 text-slate-950 animate-pulse'
                : 'border-slate-500/70 bg-slate-950/65 text-slate-300 opacity-65'
            }`}
          >
            ACT
          </button>

          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              onAction('dodge');
            }}
            onClick={() => onAction('dodge')}
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-sky-300/80 bg-sky-900/70 font-pixel text-[11px] text-sky-100 shadow-lg active:scale-95"
          >
            ROLL
          </button>

          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              onAction('attack');
            }}
            onClick={() => onAction('attack')}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-300/90 bg-rose-600/80 font-pixel text-xs text-white shadow-xl active:scale-95"
          >
            SLASH
          </button>
        </div>
      </div>
    </div>
  );
};
