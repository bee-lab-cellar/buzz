import React, { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, Circle, Swords, Shield, Sparkles, Castle } from 'lucide-react';
import { getSpriteBank } from '../game/sprites';

interface InteractiveGuideModalProps {
  onClose: () => void;
}

type GuideTabId = 'combat' | 'heroes' | 'bosses' | 'capital';

interface DojoCallout {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export const InteractiveGuideModal: React.FC<InteractiveGuideModalProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<GuideTabId>('combat');
  const [checklist, setChecklist] = useState({
    combo3: false,
    backstab: false,
    elixir: false,
    warHorn: false,
  });

  // Mutable ref state for the 60FPS interactive mini-dojo canvas
  const dojoStateRef = useRef({
    time: 0,
    nyxX: 118,
    nyxY: 88,
    nyxFacing: 'right' as 'left' | 'right',
    comboStep: 0,
    slashTimer: 0,
    slashColor: '#4ade80',
    dodgeTimer: 0,
    elixirTimer: 0,
    warHornTimer: 0,
    allyActiveTimer: 0,
    dummyX: 256,
    dummyY: 88,
    dummyHp: 1000,
    dummyMaxHp: 1000,
    dummyStagger: 0,
    dummyCounterStance: false,
    dummyShielded: false,
    dummyHitFlash: 0,
    callouts: [] as DojoCallout[],
  });

  const pushDojoCallout = (x: number, y: number, text: string, color: string) => {
    const st = dojoStateRef.current;
    st.callouts.push({ x, y, vy: -24, text, color, life: 0.95, maxLife: 0.95 });
    if (st.callouts.length > 6) st.callouts.shift();
  };

  const triggerDojoCombo = () => {
    const st = dojoStateRef.current;
    st.comboStep = (st.comboStep + 1) % 3;
    st.slashTimer = 0.24;
    const isFinisher = st.comboStep === 0;
    st.slashColor = isFinisher ? '#4ade80' : st.comboStep === 1 ? '#fde047' : '#38bdf8';
    st.nyxX = st.nyxFacing === 'right' ? 216 : 296;
    st.dummyHitFlash = 0.16;

    if (st.dummyShielded && st.elixirTimer <= 0) {
      pushDojoCallout(st.dummyX, st.dummyY - 24, '-12 (90% WARD! PRESS [Q])', '#c084fc');
      return;
    }

    const dmg = isFinisher ? 380 : st.comboStep === 1 ? 145 : 210;
    st.dummyHp = Math.max(100, st.dummyHp - dmg);
    st.dummyStagger = Math.min(100, st.dummyStagger + (isFinisher ? 40 : 20));
    pushDojoCallout(
      st.dummyX,
      st.dummyY - 22,
      isFinisher ? `${dmg}! 3-HIT ARCANE FINISHER!` : `${dmg}! COMBO HIT ${st.comboStep}/3`,
      st.slashColor
    );

    if (isFinisher) {
      setChecklist((prev) => ({ ...prev, combo3: true }));
    }
  };

  const triggerDojoBackstab = () => {
    const st = dojoStateRef.current;
    st.dummyCounterStance = true;
    st.dodgeTimer = 0.28;
    // Roll behind the Scarecrow-Wolf Dummy and unleash a 2.5x Backstab Break!
    st.nyxX = 304;
    st.nyxFacing = 'left';
    st.slashTimer = 0.28;
    st.slashColor = '#38bdf8';
    st.dummyHitFlash = 0.22;
    st.dummyCounterStance = false;
    st.dummyStagger = 100;
    st.dummyHp = Math.max(100, st.dummyHp - 625);
    pushDojoCallout(st.dummyX, st.dummyY - 26, '💥 625! 2.5x BACKSTAB BREAK!', '#38bdf8');
    setChecklist((prev) => ({ ...prev, backstab: true }));
  };

  const triggerDojoElixir = () => {
    const st = dojoStateRef.current;
    st.dummyShielded = false;
    st.elixirTimer = 20.0;
    st.slashTimer = 0.26;
    st.slashColor = '#fde047';
    st.dummyHitFlash = 0.22;
    pushDojoCallout(st.nyxX, st.nyxY - 24, '🦆 20s GREAT DUCK ELIXIR ACTIVE!', '#fde047');
    pushDojoCallout(st.dummyX, st.dummyY - 26, '💥 100% ARMOR PIERCE! WARD SHATTERED!', '#fde047');
    setChecklist((prev) => ({ ...prev, elixir: true }));
  };

  const triggerDojoWarHorn = () => {
    const st = dojoStateRef.current;
    st.warHornTimer = 0.65;
    st.allyActiveTimer = 6.0;
    st.dummyHitFlash = 0.2;
    st.dummyHp = Math.max(100, st.dummyHp - 450);
    pushDojoCallout(st.nyxX, st.nyxY - 24, '📯 WAR-HORN RALLY! (+50% SPD & KNIGHTS)', '#fde047');
    pushDojoCallout(st.dummyX, st.dummyY - 26, '🥚 -450 GOLDEN EGG BOMBARDMENT!', '#4ade80');
    setChecklist((prev) => ({ ...prev, warHorn: true }));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        triggerDojoCombo();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        triggerDojoBackstab();
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        triggerDojoElixir();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        triggerDojoWarHorn();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sprites = getSpriteBank();
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = dojoStateRef.current;
      st.time += dt;
      if (st.slashTimer > 0) st.slashTimer = Math.max(0, st.slashTimer - dt);
      if (st.dodgeTimer > 0) st.dodgeTimer = Math.max(0, st.dodgeTimer - dt);
      if (st.elixirTimer > 0) st.elixirTimer = Math.max(0, st.elixirTimer - dt);
      if (st.warHornTimer > 0) st.warHornTimer = Math.max(0, st.warHornTimer - dt);
      if (st.allyActiveTimer > 0) st.allyActiveTimer = Math.max(0, st.allyActiveTimer - dt);
      if (st.dummyHitFlash > 0) st.dummyHitFlash = Math.max(0, st.dummyHitFlash - dt);

      if (st.dummyHp < st.dummyMaxHp) {
        st.dummyHp = Math.min(st.dummyMaxHp, st.dummyHp + 65 * dt);
      }
      for (const c of st.callouts) {
        c.y += c.vy * dt;
        c.life -= dt;
      }
      st.callouts = st.callouts.filter((c) => c.life > 0);

      // Render Mini-Dojo Canvas (logical 380x118 at 2x HiDPI = 760x236 for crisp text)
      const dojoW = 380;
      const dojoH = 118;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#090e1a';
      ctx.fillRect(0, 0, dojoW, dojoH);

      // Dojo Floor Grid & Training Mat
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      for (let gx = 0; gx < dojoW; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 28);
        ctx.lineTo(gx, dojoH);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
      ctx.fillRect(36, 56, 308, 46);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.strokeRect(36.5, 56.5, 307, 45);

      // Dodge Afterimages
      if (st.dodgeTimer > 0) {
        for (let g = 1; g <= 3; g++) {
          ctx.save();
          ctx.globalAlpha = 0.25 * (4 - g);
          ctx.drawImage(sprites.pip[1].ball, st.nyxX - g * 24 - 12, st.nyxY - 12, 24, 24);
          ctx.restore();
        }
      }

      // Elixir Golden Aura
      if (st.elixirTimer > 0) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.beginPath();
        ctx.arc(st.nyxX, st.nyxY, 18 + Math.sin(st.time * 10) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // War-Horn Expanding Ring & Allied Cat Knight + Great Duck Flyby
      if (st.warHornTimer > 0) {
        const prog = 1 - st.warHornTimer / 0.65;
        ctx.strokeStyle = `rgba(253, 224, 71, ${1 - prog})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(st.nyxX, st.nyxY, 10 + prog * 80, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (st.allyActiveTimer > 0) {
        ctx.drawImage(sprites.allies.cat_knight, 166, 74, 22, 22);
        ctx.drawImage(sprites.greatDuck, 184, 34 + Math.sin(st.time * 8) * 3, 26, 26);
      }

      // Draw Nyx
      const nyxSpr = st.elixirTimer > 0 ? sprites.pipGolden.happy : sprites.pipByFur.starlight?.[1]?.walk ?? sprites.pip[1].walk;
      ctx.save();
      ctx.translate(st.nyxX, st.nyxY + Math.sin(st.time * 6) * 1.5);
      if (st.nyxFacing === 'left') ctx.scale(-1, 1);
      ctx.drawImage(nyxSpr, -13, -13, 26, 26);
      ctx.restore();

      // Draw Crescent Slash Arc
      if (st.slashTimer > 0) {
        ctx.save();
        ctx.translate(st.dummyX, st.dummyY);
        ctx.strokeStyle = st.slashColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 24, -1.1, 1.1);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 21, -0.85, 0.85);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Training Scarecrow-Wolf Dummy
      const shakeX = st.dummyHitFlash > 0 ? (Math.random() - 0.5) * 4 : 0;
      const dx = Math.round(st.dummyX + shakeX);
      const dy = Math.round(st.dummyY);
      // Wooden post base
      ctx.fillStyle = '#78350f';
      ctx.fillRect(dx - 3, dy + 6, 6, 10);
      ctx.fillRect(dx - 11, dy - 2, 22, 4);
      // Wolf Dummy sprite
      ctx.drawImage(sprites.enemies.shadow_wolf, dx - 13, dy - 14, 26, 26);

      // Counter Stance Crosshair on Dummy
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.beginPath();
      ctx.arc(dx, dy, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '700 7px ui-sans-serif, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#05070f';
      ctx.strokeText('🛡️ SCARECROW-WOLF DUMMY', dx, dy - 22);
      ctx.fillStyle = '#fda4af';
      ctx.fillText('🛡️ SCARECROW-WOLF DUMMY', dx, dy - 22);

      // Dummy HP & Stagger Bars
      const bw = 44;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(dx - bw / 2 - 1, dy - 19, bw + 2, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(dx - bw / 2, dy - 18, Math.round((st.dummyHp / st.dummyMaxHp) * bw), 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(dx - bw / 2, dy - 16, Math.round((st.dummyStagger / 100) * bw), 1.5);

      // Floating Callouts
      for (const c of st.callouts) {
        ctx.font = '700 8.5px ui-sans-serif, system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#05070f';
        ctx.strokeText(c.text, Math.round(c.x), Math.round(c.y));
        ctx.fillStyle = c.color;
        ctx.fillText(c.text, Math.round(c.x), Math.round(c.y));
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-2xl border-2 border-cyan-400/80 bg-[#080d1a] p-3.5 sm:p-5 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-cyan-500/20 border border-cyan-400/60 px-2 py-0.5 font-mono-tabular text-[10px] font-bold text-cyan-300">
                LIVE MINI-DOJO
              </span>
              <h2 className="font-pixel text-xs sm:text-sm text-amber-300">
                📖 INTERACTIVE COMBAT GUIDE &amp; MOVE LIST
              </h2>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Test moves live against the Training Scarecrow-Wolf Dummy using your keyboard or the dojo buttons below! ({completedCount}/4 Complete)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close [ESC]</span>
          </button>
        </div>

        {/* Live Interactive Mini-Dojo Arena + Checklist */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-7 rounded-xl border border-cyan-500/40 bg-slate-950 p-1.5">
            <canvas
              ref={canvasRef}
              width={760}
              height={236}
              className="w-full h-[118px] rounded-lg block cursor-pointer"
              onClick={triggerDojoCombo}
            />
            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={triggerDojoCombo}
                className="rounded-lg border border-emerald-400/60 bg-emerald-950/60 hover:bg-emerald-900/70 px-2 py-1.5 text-[10px] font-bold text-emerald-200 cursor-pointer"
              >
                ⚔️ [SPACE] Combo
              </button>
              <button
                type="button"
                onClick={triggerDojoBackstab}
                className="rounded-lg border border-cyan-400/60 bg-cyan-950/60 hover:bg-cyan-900/70 px-2 py-1.5 text-[10px] font-bold text-cyan-200 cursor-pointer"
              >
                💨 [SHIFT] Backstab
              </button>
              <button
                type="button"
                onClick={triggerDojoElixir}
                className="rounded-lg border border-amber-400/60 bg-amber-950/60 hover:bg-amber-900/70 px-2 py-1.5 text-[10px] font-bold text-amber-200 cursor-pointer"
              >
                🦆 [Q] 20s Elixir
              </button>
              <button
                type="button"
                onClick={triggerDojoWarHorn}
                className="rounded-lg border border-yellow-400/60 bg-yellow-950/60 hover:bg-yellow-900/70 px-2 py-1.5 text-[10px] font-bold text-yellow-200 cursor-pointer"
              >
                📯 [R] War-Horn
              </button>
            </div>
          </div>

          {/* Live 4-Item Training Checklist */}
          <div className="sm:col-span-5 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 space-y-1.5">
            <div className="text-[10px] font-pixel text-amber-300 mb-1">
              🎯 DOJO TRAINING CHECKLIST ({completedCount}/4)
            </div>
            {[
              {
                done: checklist.combo3,
                title: '3-Hit Arcane Combo [SPACE]',
                desc: '3rd slash fires a Crescent Finisher & Sword-Beam.',
              },
              {
                done: checklist.backstab,
                title: 'Dodge-Roll Backstab [SHIFT]',
                desc: 'Roll behind 🛡️ COUNTER STANCE for 2.5x Crit Break!',
              },
              {
                done: checklist.elixir,
                title: '20s Great Duck Elixir [Q]',
                desc: '100% Armor Pierce shatters Boss Wards & +35% ATK.',
              },
              {
                done: checklist.warHorn,
                title: '[R] War-Horn Summon',
                desc: 'Summons Allied Knights, Duck Eggs & +50% Speed.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left ${
                  item.done
                    ? 'border-emerald-400/60 bg-emerald-950/35 text-emerald-100'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300'
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-[11px] font-bold">{item.title}</div>
                  <div className="text-[10px] text-slate-400 leading-snug">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Quick-Scan Reference Tabs */}
        <div className="mt-3 flex flex-wrap gap-1.5 border-b border-slate-800 pb-2">
          {[
            { id: 'combat' as const, label: '⚔️ Combat & Counter-Breaks', icon: Swords },
            { id: 'heroes' as const, label: '🦸 4 Heroes [1–4]', icon: Sparkles },
            { id: 'bosses' as const, label: '🐙 Kraken & Boss Weak-Spots', icon: Shield },
            { id: 'capital' as const, label: '🏰 Capital, Brew [F] & Mecha [G]', icon: Castle },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                activeTab === t.id
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-[11px]">
          {activeTab === 'combat' && (
            <>
              <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-2.5">
                <div className="font-bold text-emerald-300">⚔️ 3-Hit Arcane Combo &amp; Perfect Dodge</div>
                <p className="text-slate-300 mt-0.5">
                  Press <span className="text-amber-300 font-mono-tabular">[SPACE / Click]</span> for 3-step combos. Dodging <span className="text-amber-300 font-mono-tabular">[SHIFT]</span> right before an enemy strike triggers <span className="text-cyan-300 font-semibold">⚡ PERFECT DODGE</span> (+100% Crit &amp; +1 Golden Feather).
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-2.5">
                <div className="font-bold text-cyan-300">🛡️ Counter Stance &amp; 2.5x Backstab Break</div>
                <p className="text-slate-300 mt-0.5">
                  After 3 consecutive melee hits, enemies raise <span className="text-rose-300 font-semibold">🛡️ COUNTER STANCE</span>. Roll behind them with <span className="text-amber-300 font-mono-tabular">[SHIFT]</span> and strike their back for an instant <span className="text-cyan-300 font-semibold">💥 2.5x BACKSTAB BREAK!</span>
                </p>
              </div>
            </>
          )}
          {activeTab === 'heroes' && (
            <>
              <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-2.5">
                <div className="font-bold text-amber-300">⚡ Instant 4-Hero Hot-Swap ([1] [2] [3] [4])</div>
                <p className="text-slate-300 mt-0.5">
                  Hot-swap mid-combo between <span className="text-cyan-300">[1] Archmage Nyx</span>, <span className="text-amber-300">[2] Majestic Lion King Leo</span> (+25% Armor Cleave), <span className="text-fuchsia-300">[3] Wolf-King Fenrir</span> (+20% Lifesteal &amp; Speed), and <span className="text-yellow-300">[4] The Great Duck</span> (Infinite Underwater Oxygen &amp; Homing Beams).
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-2.5">
                <div className="font-bold text-emerald-300">🤝 Autonomous AI Party Companions</div>
                <p className="text-slate-300 mt-0.5">
                  All unlocked heroes fight alongside you in real time with their own living animations, capes, and signature attacks!
                </p>
              </div>
            </>
          )}
          {activeTab === 'bosses' && (
            <>
              <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-2.5">
                <div className="font-bold text-cyan-300">🐙 Kraken Tentacle 2.5x Cut-Point &amp; Shock-Stagger</div>
                <p className="text-slate-300 mt-0.5">
                  Strike the glowing <span className="text-cyan-300 font-semibold">🎯 2.5x SLICE</span> ring on Kraken Tentacles to sever them in 2–4 slashes! Every severed tentacle drops <span className="text-emerald-300">+2 🍣 Healing Fish</span> and deals a <span className="text-amber-300">10% Max HP Shock-Stagger</span> burst directly to the Kraken Boss!
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-2.5">
                <div className="font-bold text-amber-300">🐉 Dragon 4-Part Anatomy &amp; Chrono-Gears</div>
                <p className="text-slate-300 mt-0.5">
                  Shatter Dragon Wings &amp; Tails for bonus gems, destroy the 4 Corner Chrono-Gears in Act 240 to stop Chronos-Omega’s Time-Rewind, and resist Aether-Null’s Singularity pull in Act 300!
                </p>
              </div>
            </>
          )}
          {activeTab === 'capital' && (
            <>
              <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-2.5">
                <div className="font-bold text-amber-300">🏰 12 Capital Citadel Buildings &amp; +25★ Anvil</div>
                <p className="text-slate-300 mt-0.5">
                  Open <span className="text-amber-300 font-mono-tabular">[TAB / 👑 HUB]</span> to upgrade 12 Kingdom structures, socket Elemental Gems, and Star-Up weapons to <span className="text-yellow-300 font-semibold">+25★ Celestial</span>!
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/75 p-2.5">
                <div className="font-bold text-emerald-300">🧪 Cauldron Flasks [F] &amp; Steam-Mecha [G]</div>
                <p className="text-slate-300 mt-0.5">
                  Mix 3 ingredients in the BlockCraft Cauldron and press <span className="text-emerald-300 font-mono-tabular">[F]</span> to hurl alchemical splash flasks, or press <span className="text-amber-300 font-mono-tabular">[G]</span> to pilot the Clockwork Steam-Mecha Titan Suit!
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
