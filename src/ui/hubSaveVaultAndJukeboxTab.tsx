/**
 * File 88 / 100 — iPad V8 Save Vault Export/Import + 40-Track Chiptune Jukebox Tab.
 * Strictly typed (ZERO `any`).
 */

import { useState } from 'react';
import { Copy, Download, Music, Play, Save, Square } from 'lucide-react';
import {
  ALL_40_OST_TRACKS,
  toDspComposition,
} from '../audio/ostTracksArc7to10';
import { GLOBAL_DSP_SYNTH } from '../audio/dspChiptuneSynthesizer';

export interface HubSaveVaultAndJukeboxTabProps {
  readonly currentAct: number;
  readonly onRestoreAct: (targetAct: number) => void;
  readonly onExportSaveCode: () => string;
  readonly onImportSaveCode: (code: string) => boolean;
}

export function HubSaveVaultAndJukeboxTab({
  currentAct,
  onRestoreAct,
  onExportSaveCode,
  onImportSaveCode,
}: HubSaveVaultAndJukeboxTabProps) {
  const [jumpAct, setJumpAct] = useState<number>(currentAct);
  const [saveCode, setSaveCode] = useState<string>('');
  const [vaultStatus, setVaultStatus] = useState<string>('4-Layer iPad V8 Save Vault active (localStorage + IndexedDB + window.name + Base64).');
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  const handleExport = (): void => {
    const code = onExportSaveCode();
    setSaveCode(code);
    setVaultStatus('Exported portable Base64 Save Code.');
  };

  const handleImport = (): void => {
    const ok = onImportSaveCode(saveCode);
    setVaultStatus(ok ? 'Imported Save Vault payload successfully!' : 'Invalid Save Code format.');
  };

  const handlePlayTrack = (trackId: number): void => {
    const spec = ALL_40_OST_TRACKS.find((t) => t.trackId === trackId);
    if (!spec) return;
    GLOBAL_DSP_SYNTH.crossfadeToTrack(toDspComposition(spec));
    setPlayingTrackId(trackId);
  };

  const handleStopTrack = (): void => {
    GLOBAL_DSP_SYNTH.stopTrack();
    setPlayingTrackId(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left: 4-Layer iPad Save Vault & 1,000-Act Jump Slider */}
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 lg:col-span-5">
        <div className="flex items-center gap-2 text-xs font-black text-amber-300">
          <Save className="h-4 w-4" />
          IPAD V8 SAVE VAULT & ACT RESTORE
        </div>
        <p className="text-[11px] text-slate-300">{vaultStatus}</p>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span>Jump / Restore Scaled Act</span>
            <span className="font-mono text-amber-300">Act {jumpAct}</span>
          </div>
          <input
            type="range"
            min={1}
            max={1000}
            value={jumpAct}
            onChange={(e) => setJumpAct(Number(e.target.value))}
            className="w-full accent-amber-400"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onRestoreAct(jumpAct)}
              className="flex-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-300 cursor-pointer"
            >
              Restore Act {jumpAct}
            </button>
            <button
              type="button"
              onClick={() => {
                setJumpAct(134);
                onRestoreAct(134);
              }}
              className="rounded-lg border border-sky-500/50 bg-sky-950/70 px-3 py-1.5 text-xs font-bold text-sky-200 hover:bg-sky-900 cursor-pointer"
            >
              ⚡ Act 134
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={saveCode}
            onChange={(e) => setSaveCode(e.target.value)}
            rows={3}
            placeholder="Paste COTC1:... Base64 Save Code here..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-[11px] text-slate-200"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-100 hover:bg-slate-700 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              Export Code
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              Import Code
            </button>
          </div>
        </div>
      </div>

      {/* Right: 40-Track 16-Bit Chiptune DSP Jukebox */}
      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4 lg:col-span-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-sky-300">
            <Music className="h-4 w-4" />
            40-TRACK 16-BIT DSP CHIPTUNE JUKEBOX
          </div>
          {playingTrackId !== null && (
            <button
              type="button"
              onClick={handleStopTrack}
              className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/30 cursor-pointer"
            >
              <Square className="h-3 w-3" />
              Stop
            </button>
          )}
        </div>

        <div className="grid max-h-72 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {ALL_40_OST_TRACKS.map((track) => {
            const active = playingTrackId === track.trackId;
            return (
              <button
                key={track.trackId}
                type="button"
                onClick={() => handlePlayTrack(track.trackId)}
                className={`flex items-center justify-between rounded-lg border px-2.5 py-2 text-left transition cursor-pointer ${
                  active
                    ? 'border-sky-400 bg-sky-950/60'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="truncate text-[11px] font-bold text-slate-100">
                    #{String(track.trackId).padStart(2, '0')} {track.title}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Arc {track.arcId} • {track.bpm} BPM {track.isBossTheme ? '• BOSS' : ''}
                  </div>
                </div>
                <Play className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-sky-300' : 'text-slate-500'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
