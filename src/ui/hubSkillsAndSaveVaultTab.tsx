/**
 * Layer 4 — Modular Command Hub Tab 4: 60-Node Constellation Skill Tree,
 * 4-Layer iPad Save Vault (Act 1..1,000 + Restore Act 134 + COTC1 Codes), & 36-Track OST Jukebox
 */

import { useState } from 'react';
import { Copy, Download, Music, RotateCcw, Save, Sparkles, Upload } from 'lucide-react';
import { OMNIVERSE_60_CONSTELLATION_NODES } from '../data/gear50TiersAndAlchemy';
import { ALL_36_OMNIVERSE_OST_TRACKS } from '../audio/ostTracksArc6to10';
import { GLOBAL_DSP_SYNTH } from '../audio/dspChiptuneSynthesizer';

export interface HubSkillsAndSaveVaultTabProps {
  readonly currentAct: number;
  readonly starPoints: number;
  readonly unlockedSkillNodeIds: ReadonlyArray<string>;
  readonly onUnlockSkill?: (nodeId: string) => void;
  readonly onRestoreAct: (targetAct: number) => void;
  readonly onExportSaveCode: () => string;
  readonly onImportSaveCode: (code: string) => boolean;
}

export function HubSkillsAndSaveVaultTab({
  currentAct,
  starPoints,
  unlockedSkillNodeIds,
  onUnlockSkill,
  onRestoreAct,
  onExportSaveCode,
  onImportSaveCode,
}: HubSkillsAndSaveVaultTabProps) {
  const [sliderAct, setSliderAct] = useState<number>(Math.max(1, Math.min(1000, currentAct)));
  const [saveCodeBox, setSaveCodeBox] = useState<string>('');
  const [vaultStatus, setVaultStatus] = useState<string>('4-Layer iPad Vault Armed (Anti-Overwrite Guard Active)');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(
    () => GLOBAL_DSP_SYNTH.getCurrentTrackId(),
  );

  const handleExport = (): void => {
    const code = onExportSaveCode();
    setSaveCodeBox(code);
    setVaultStatus('Exported COTC1 Portable Save Code! Copy & store anywhere.');
  };

  const handleImport = (): void => {
    if (!saveCodeBox.trim()) {
      setVaultStatus('Paste a valid COTC1:... Save Code first.');
      return;
    }
    const ok = onImportSaveCode(saveCodeBox.trim());
    setVaultStatus(ok ? 'Save Code restored cleanly across all 4 Vault layers!' : 'Invalid COTC1 Save Code.');
  };

  const handlePlayOst = (trackIndex: number): void => {
    const track = ALL_36_OMNIVERSE_OST_TRACKS[trackIndex];
    if (!track) return;
    GLOBAL_DSP_SYNTH.crossfadeToTrack(track);
    setPlayingTrackId(track.id);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left: 60-Node Constellation Skill Tree */}
      <div className="flex flex-col gap-2 lg:col-span-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            60-Node Constellation Tree
          </span>
          <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-200">
            Star Points: {starPoints}
          </span>
        </div>

        <div className="grid max-h-[290px] grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
          {OMNIVERSE_60_CONSTELLATION_NODES.map((node) => {
            const unlocked = unlockedSkillNodeIds.includes(node.id);
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => onUnlockSkill?.(node.id)}
                className={`flex flex-col items-start rounded-lg border p-2 text-left cursor-pointer ${
                  unlocked
                    ? 'border-cyan-400 bg-cyan-950/50 text-cyan-100'
                    : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-amber-400/60'
                }`}
              >
                <div className="flex w-full items-center justify-between text-[11px] font-bold">
                  <span>{node.name}</span>
                  <span className="font-mono text-[10px] text-amber-300">{node.starPointCost}★</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {node.branch} • {node.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: 4-Layer iPad Save Vault + 36-Track OST Jukebox */}
      <div className="flex flex-col gap-3 lg:col-span-6">
        {/* Save Vault Card */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-amber-400/50 bg-slate-900/90 p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
              <Save className="h-3.5 w-3.5" />
              4-Layer iPad Save Vault (Act 1–1,000)
            </span>
            <button
              type="button"
              onClick={() => {
                onRestoreAct(134);
                setSliderAct(134);
                setVaultStatus('Restored Act 134 with balanced 50-tier scaled gear!');
              }}
              className="flex items-center gap-1 rounded-md bg-amber-400 px-2.5 py-1 text-[11px] font-black text-slate-950 hover:bg-amber-300 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              Restore Act 134
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1}
              max={1000}
              value={sliderAct}
              onChange={(e) => setSliderAct(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <button
              type="button"
              onClick={() => {
                onRestoreAct(sliderAct);
                setVaultStatus(`Jumped to Act ${sliderAct}/1000 with scaled loadout!`);
              }}
              className="shrink-0 rounded-md bg-cyan-500/25 px-2.5 py-1 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/40 cursor-pointer"
            >
              Jump Act {sliderAct}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={saveCodeBox}
              onChange={(e) => setSaveCodeBox(e.target.value)}
              placeholder="COTC1:... Save Code"
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[10px] text-slate-200"
            />
            <button
              type="button"
              onClick={handleExport}
              className="flex shrink-0 items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[10px] font-bold text-amber-200 hover:bg-slate-700 cursor-pointer"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/25 px-2 py-1 text-[10px] font-bold text-emerald-200 hover:bg-emerald-500/40 cursor-pointer"
            >
              <Upload className="h-3 w-3" />
              Import
            </button>
            {saveCodeBox && (
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(saveCodeBox);
                  setVaultStatus('Copied COTC1 Save Code to clipboard!');
                }}
                className="rounded-md bg-slate-800 p-1 text-slate-300 hover:bg-slate-700 cursor-pointer"
                title="Copy Code"
              >
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-emerald-300">{vaultStatus}</p>
        </div>

        {/* 36-Track Omniverse DSP OST Jukebox */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 p-3">
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-fuchsia-300">
            <Music className="h-3.5 w-3.5" />
            36-Track 10-Arc DSP Synth OST Jukebox
          </span>
          <div className="grid max-h-[120px] grid-cols-1 gap-1 overflow-y-auto pr-1 sm:grid-cols-2">
            {ALL_36_OMNIVERSE_OST_TRACKS.map((track, idx) => (
              <button
                key={track.id}
                type="button"
                onClick={() => handlePlayOst(idx)}
                className={`truncate rounded border px-2 py-1 text-left text-[10px] font-semibold cursor-pointer ${
                  playingTrackId === track.id
                    ? 'border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-600'
                }`}
              >
                #{track.index} {track.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
