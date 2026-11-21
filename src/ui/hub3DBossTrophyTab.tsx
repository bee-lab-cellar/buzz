/**
 * File 84 / 100 — 3D Rotating Voxel Boss Trophy Pedestal Showcase Tab (10 Arc Boss Relics).
 * Isolated `useRef` WebGL container with NO `backdrop-blur`. Zero `any` types.
 */

import { useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import {
  TEN_ARC_BOSS_TROPHIES,
  VoxelBossTrophyStage,
} from '../three/voxelBossTrophyStage';
import type { ArcId } from '../types/world';

export function Hub3DBossTrophyTab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<VoxelBossTrophyStage | null>(null);
  const [selectedArc, setSelectedArc] = useState<ArcId>(3);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let stage: VoxelBossTrophyStage | null = null;
    try {
      stage = new VoxelBossTrophyStage(mount, selectedArc);
      stageRef.current = stage;
    } catch {
      stageRef.current = null;
    }

    const onResize = (): void => {
      if (stage && mount.clientWidth > 10 && mount.clientHeight > 10) {
        stage.resize(mount.clientWidth, mount.clientHeight);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      stage?.dispose();
      stageRef.current = null;
    };
  }, []);

  const handleSelect = (arcId: ArcId): void => {
    setSelectedArc(arcId);
    stageRef.current?.selectArcTrophy(arcId);
  };

  const activeMeta =
    TEN_ARC_BOSS_TROPHIES.find((t) => t.arcId === selectedArc) ?? TEN_ARC_BOSS_TROPHIES[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="space-y-2 lg:col-span-6">
        <div
          ref={mountRef}
          className="h-72 w-full overflow-hidden rounded-xl border border-amber-500/40 bg-slate-950"
        />
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
          <div className="flex items-center gap-2 font-black text-amber-300">
            <Trophy className="h-4 w-4" />
            ARC {activeMeta.arcId} RELIC • {activeMeta.trophyTitle}
          </div>
          <p className="mt-1 text-slate-300">
            Claimed from <strong className="text-rose-300">{activeMeta.bossName}</strong> (Act {activeMeta.bossAct}).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:col-span-6">
        {TEN_ARC_BOSS_TROPHIES.map((t) => (
          <button
            key={t.arcId}
            type="button"
            onClick={() => handleSelect(t.arcId)}
            className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
              selectedArc === t.arcId
                ? 'border-amber-400 bg-slate-800'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-amber-300">ARC {t.arcId} • ACT {t.bossAct}</span>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.accentHex }} />
            </div>
            <div className="mt-1 text-xs font-black text-slate-100">{t.trophyTitle}</div>
            <div className="text-[10px] text-slate-400">{t.bossName}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
