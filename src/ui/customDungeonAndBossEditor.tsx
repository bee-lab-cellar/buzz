/**
 * File 89 / 100 — 24x14 Custom Dungeon & Boss Arena Editor UI.
 * Backed by `customMapCompiler.ts` (enforces perimeter walls, BFS path reachability, max 4 traps).
 * Strictly typed (ZERO `any`).
 */

import { useState } from 'react';
import { CheckCircle2, Copy, Grid3X3, RotateCcw, ShieldAlert } from 'lucide-react';
import {
  compileAndSanitizeCustomMap,
  createBlankCustomDungeonMap,
  serializeCustomDungeonMap,
  validateCustomDungeonMap,
} from '../engine/customMapCompiler';
import type { CustomDungeonMapV1, TileKindCode } from '../types/world';

const BRUSHES: ReadonlyArray<{
  readonly code: TileKindCode;
  readonly label: string;
  readonly colorClass: string;
}> = [
  { code: 0, label: 'Ground', colorClass: 'bg-emerald-800' },
  { code: 1, label: 'Wall', colorClass: 'bg-slate-600' },
  { code: 2, label: 'River/Lava', colorClass: 'bg-sky-600' },
  { code: 3, label: 'Bridge', colorClass: 'bg-amber-700' },
  { code: 4, label: 'Patio', colorClass: 'bg-stone-500' },
];

export function CustomDungeonAndBossEditor() {
  const [map, setMap] = useState<CustomDungeonMapV1>(() => createBlankCustomDungeonMap());
  const [brush, setBrush] = useState<TileKindCode>(3);
  const [exportJson, setExportJson] = useState<string>('');

  const report = validateCustomDungeonMap(map);

  const paintCell = (r: number, c: number): void => {
    const nextTiles = map.tiles.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? brush : cell)) : row,
    );
    setMap(compileAndSanitizeCustomMap({ ...map, tiles: nextTiles }));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-amber-400" />
          <input
            type="text"
            value={map.name}
            onChange={(e) => setMap({ ...map, name: e.target.value })}
            className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-bold text-slate-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {BRUSHES.map((b) => (
            <button
              key={b.code}
              type="button"
              onClick={() => setBrush(b.code)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                brush === b.code ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-sm ${b.colorClass}`} />
              {b.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMap(createBlankCustomDungeonMap())}
            className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => setExportJson(serializeCustomDungeonMap(map))}
            className="flex items-center gap-1 rounded-lg bg-sky-500 px-2.5 py-1 text-[11px] font-black text-slate-950 hover:bg-sky-400 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            Compile JSON
          </button>
        </div>
      </div>

      {/* 24x14 Interactive Tile Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3">
        <div
          className="mx-auto grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${map.cols}, minmax(16px, 22px))`, width: 'fit-content' }}
        >
          {map.tiles.map((row, r) =>
            row.map((cell, c) => {
              const isSpawn = map.spawnTile.row === r && map.spawnTile.col === c;
              const isBoss = map.bossTile.row === r && map.bossTile.col === c;
              const tileColor =
                cell === 1
                  ? 'bg-slate-600'
                  : cell === 2
                    ? 'bg-sky-600'
                    : cell === 3
                      ? 'bg-amber-700'
                      : cell === 4
                        ? 'bg-stone-500'
                        : 'bg-emerald-900';
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => paintCell(r, c)}
                  title={`(${c}, ${r})`}
                  className={`flex h-5 w-5 items-center justify-center rounded-[2px] text-[9px] font-black transition hover:brightness-125 cursor-pointer ${tileColor}`}
                >
                  {isSpawn ? 'P' : isBoss ? 'B' : ''}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* Validation Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs">
        {report.valid ? (
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Valid 24x14 Arena • Walkable: {report.walkableTileCount} • Bridges: {report.bridgeTileCount} • Traps: {map.trapCount}/4
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-bold text-rose-300">
            <ShieldAlert className="h-4 w-4" />
            {report.errors[0]}
          </div>
        )}
      </div>

      {exportJson && (
        <textarea
          readOnly
          rows={2}
          value={exportJson}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 font-mono text-[10px] text-sky-300"
        />
      )}
    </div>
  );
}
