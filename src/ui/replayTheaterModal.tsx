/**
 * File 74 / 100 — 60Hz Deterministic Replay Theater Modal.
 * Enforces Renewal Pillar 2:
 * - Arc I–II: Nyx & King Leo (LEFT) vs Usurper/Emperor Fenrir (RIGHT)
 * - Arc III–X: Nyx, King Leo, Reformed Fenrir, & Great Duck (LEFT) vs Pixel-Art Act Boss (RIGHT)
 * - Displays CRC32 integrity checksum & live 60FPS playback canvas.
 * Zero `any` types, zero `backdrop-blur`.
 */

import { useMemo, useState } from 'react';
import { Film, Play, RotateCcw, ShieldCheck, X } from 'lucide-react';
import { TitleScreenLiveArenaView } from './TitleScreenLiveArenaView';
import {
  createShowcaseBossReplay,
  getReplayTeamFormation,
} from './titleScreenLiveArena';
import { verifyReplayChecksum } from '../math/deterministicReplayEngine';

export interface ReplayTheaterModalProps {
  readonly initialActId?: number;
  readonly onClose: () => void;
}

const SHOWCASE_ACTS: ReadonlyArray<{ readonly actId: number; readonly label: string }> = [
  { actId: 40, label: 'Act 40 • Usurper Fenrir (Arc I)' },
  { actId: 80, label: 'Act 80 • Ragnarok Chariot (Arc II)' },
  { actId: 300, label: 'Act 300 • Ignis-Bahamut (Arc III)' },
  { actId: 400, label: 'Act 400 • Charybdis (Arc IV)' },
  { actId: 500, label: 'Act 500 • Chronos-Omega (Arc V)' },
  { actId: 1000, label: 'Act 1000 • AETHER-NULL (Arc X)' },
];

export function ReplayTheaterModal({
  initialActId = 300,
  onClose,
}: ReplayTheaterModalProps) {
  const [selectedAct, setSelectedAct] = useState<number>(initialActId);
  const [playbackNonce, setPlaybackNonce] = useState<number>(0);

  const replay = useMemo(
    () => createShowcaseBossReplay(selectedAct),
    [selectedAct],
  );
  const team = useMemo(() => getReplayTeamFormation(selectedAct), [selectedAct]);
  const checksumValid = useMemo(() => verifyReplayChecksum(replay), [replay]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-amber-400/50 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-black tracking-wide text-amber-100">
                60Hz DETERMINISTIC REPLAY THEATER
              </h2>
              <p className="text-[11px] text-slate-400">
                Act {selectedAct} • {team.rightBossName} • {replay.totalTicks} Ticks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex flex-wrap gap-1.5">
            {SHOWCASE_ACTS.map((item) => (
              <button
                key={item.actId}
                type="button"
                onClick={() => {
                  setSelectedAct(item.actId);
                  setPlaybackNonce((n) => n + 1);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                  selectedAct === item.actId
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <TitleScreenLiveArenaView
            key={`${selectedAct}-${playbackNonce}`}
            width={640}
            height={280}
            replayToPlay={replay}
          />

          <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs sm:grid-cols-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">LEFT Hero Squad</div>
              <div className="mt-0.5 font-bold text-emerald-300">
                {team.leftHeroTeam.map((h) => h.replace('_', ' ').toUpperCase()).join(' • ')}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">RIGHT Pixel Boss</div>
              <div className="mt-0.5 font-bold text-rose-300">{team.rightBossName}</div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">CRC32 Verified</div>
                <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-sky-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {checksumValid ? replay.checksumHex : 'INVALID'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlaybackNonce((n) => n + 1)}
                className="flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1.5 text-[11px] font-black text-slate-950 hover:bg-sky-400 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <Play className="h-3 w-3" />
                Replay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
