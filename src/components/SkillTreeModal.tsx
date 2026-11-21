import React, { useState } from 'react';
import { Check, Lock, Sparkles, Star, X, ZoomIn, ZoomOut } from 'lucide-react';
import {
  CONSTELLATION_PATHS,
  ConstellationPathId,
  SKILL_TREE_NODES,
  SkillNodeDef,
  computeSkillTreeBonuses,
} from '../game/skillTreeData';
import { HUDState } from '../game/types';

interface SkillTreeModalProps {
  hud: HUDState;
  onClose: () => void;
  onUnlockNode: (nodeId: string) => void;
  onBuyStarPoint: () => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({
  hud,
  onClose,
  onUnlockNode,
  onBuyStarPoint,
}) => {
  const [selectedPath, setSelectedPath] = useState<ConstellationPathId | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<SkillNodeDef>(SKILL_TREE_NODES[0]);
  const [zoom, setZoom] = useState<number>(1);

  const unlockedSet = new Set(hud.unlockedSkills);
  const bonuses = computeSkillTreeBonuses(hud.unlockedSkills);

  const filteredNodes =
    selectedPath === 'all'
      ? SKILL_TREE_NODES
      : SKILL_TREE_NODES.filter((n) => n.path === selectedPath);

  const canUnlock = (node: SkillNodeDef) => {
    if (unlockedSet.has(node.id)) return false;
    if (hud.starPoints < node.cost) return false;
    if (node.prereqId && !unlockedSet.has(node.prereqId)) return false;
    return true;
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-indigo-500/50 bg-[#070914] shadow-2xl">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/60 bg-slate-950/90 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-amber-300">
                60-NODE ASTRAL CONSTELLATION SKILL TREE
              </h2>
              <p className="text-[11px] font-mono-tabular text-slate-400">
                Unlocked: {hud.unlockedSkills.length}/60 Nodes · Star Points:{' '}
                <span className="font-bold text-amber-300">★ {hud.starPoints}</span> · Gold:{' '}
                <span className="text-yellow-300">{hud.gold.toLocaleString()}G</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onBuyStarPoint}
              disabled={hud.gold < 250}
              className={`rounded border px-2.5 py-1 text-xs font-mono-tabular font-semibold transition-colors ${
                hud.gold >= 250
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 cursor-pointer'
                  : 'border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
              }`}
            >
              +1 ★ Star Point (250G)
            </button>

            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.85, +(z - 0.15).toFixed(2)))}
              className="rounded border border-slate-700 bg-slate-900 p-1.5 text-slate-300 hover:bg-slate-800 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.45, +(z + 0.15).toFixed(2)))}
              className="rounded border border-slate-700 bg-slate-900 p-1.5 text-slate-300 hover:bg-slate-800 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Constellation Path Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800/80 bg-slate-900/75 px-4 py-2">
          <button
            type="button"
            onClick={() => setSelectedPath('all')}
            className={`rounded px-2.5 py-1 text-xs font-medium border cursor-pointer ${
              selectedPath === 'all'
                ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌌 All 4 Constellations (60)
          </button>
          {CONSTELLATION_PATHS.map((p) => {
            const count = hud.unlockedSkills.filter((id) =>
              SKILL_TREE_NODES.find((n) => n.id === id && n.path === p.id)
            ).length;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPath(p.id)}
                className={`rounded px-2.5 py-1 text-xs font-medium border cursor-pointer ${
                  selectedPath === p.id
                    ? 'border-sky-400 bg-sky-500/25 text-white'
                    : 'border-slate-700 bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.badge} ({count}/15)
              </button>
            );
          })}
        </div>

        {/* Main Body: Interactive Star Map + Inspector Sidebar */}
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Interactive Pan & Zoom Starry Sky Canvas */}
          <div className="relative col-span-2 overflow-auto bg-[radial-gradient(ellipse_at_center,_#161b3a_0%,_#060814_75%)] p-4">
            <div
              className="relative mx-auto h-[460px] w-[720px] origin-top-left transition-transform duration-150"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* SVG Constellation Lines */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                {filteredNodes.map((node) => {
                  if (!node.prereqId) return null;
                  const parent = SKILL_TREE_NODES.find((n) => n.id === node.prereqId);
                  if (!parent) return null;
                  const bothUnlocked = unlockedSet.has(node.id) && unlockedSet.has(parent.id);
                  const pathMeta = CONSTELLATION_PATHS.find((p) => p.id === node.path)!;
                  return (
                    <line
                      key={`${parent.id}->${node.id}`}
                      x1={`${parent.x}%`}
                      y1={`${parent.y}%`}
                      x2={`${node.x}%`}
                      y2={`${node.y}%`}
                      stroke={bothUnlocked ? pathMeta.color : 'rgba(148, 163, 184, 0.28)'}
                      strokeWidth={bothUnlocked ? 2.5 : 1.2}
                      strokeDasharray={bothUnlocked ? undefined : '4 3'}
                    />
                  );
                })}
              </svg>

              {/* 60 Star Nodes */}
              {filteredNodes.map((node) => {
                const isUnlocked = unlockedSet.has(node.id);
                const unlockable = canUnlock(node);
                const isSelected = selectedNode.id === node.id;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    onDoubleClick={() => {
                      if (unlockable) onUnlockNode(node.id);
                    }}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-white scale-115 z-20 ' : 'z-10 '
                    }${
                      isUnlocked
                        ? 'border-amber-300 bg-amber-500/30 text-white shadow-[0_0_12px_rgba(251,191,36,0.65)]'
                        : unlockable
                        ? 'border-sky-400 bg-sky-950/90 text-sky-200 animate-pulse'
                        : 'border-slate-700 bg-slate-900/90 text-slate-500 opacity-75'
                    }`}
                    title={`${node.name} (${node.cost}★)`}
                  >
                    <span>{node.icon}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Node Details + Path List + Active Bonuses */}
          <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/95 p-4 overflow-y-auto space-y-4">
            {/* Selected Node Card */}
            <div className="rounded-lg border border-indigo-500/40 bg-slate-900/90 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-indigo-500/20 border border-indigo-400/50 px-2 py-0.5 text-[10px] font-mono-tabular font-semibold text-indigo-200">
                  Tier {selectedNode.tier}/15 ·{' '}
                  {CONSTELLATION_PATHS.find((p) => p.id === selectedNode.path)?.name}
                </span>
                <span className="font-mono-tabular text-xs font-bold text-amber-300">
                  ★ {selectedNode.cost} Cost
                </span>
              </div>

              <h3 className="mt-2 font-pixel text-xs sm:text-sm text-white flex items-center gap-2">
                <span className="text-base">{selectedNode.icon}</span>
                <span>{selectedNode.name}</span>
              </h3>

              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                {selectedNode.description}
              </p>

              <div className="mt-3">
                {unlockedSet.has(selectedNode.id) ? (
                  <div className="flex items-center justify-center gap-1.5 rounded border border-emerald-500/60 bg-emerald-950/40 py-2 text-xs font-semibold text-emerald-300">
                    <Check className="h-4 w-4" />
                    <span>CONSTELLATION NODE AWAKENED</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!canUnlock(selectedNode)}
                    onClick={() => onUnlockNode(selectedNode.id)}
                    className={`w-full flex items-center justify-center gap-1.5 rounded border py-2 text-xs font-semibold transition-colors ${
                      canUnlock(selectedNode)
                        ? 'border-amber-400 bg-amber-500/25 text-amber-100 hover:bg-amber-500/35 cursor-pointer'
                        : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canUnlock(selectedNode) ? (
                      <>
                        <Star className="h-3.5 w-3.5 text-amber-300" />
                        <span>AWAKEN NODE (★ {selectedNode.cost})</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>
                          {selectedNode.prereqId && !unlockedSet.has(selectedNode.prereqId)
                            ? 'Requires Previous Node in Path'
                            : `Need ★ ${selectedNode.cost} Star Points`}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Quick Scrollable List of Nodes in Current Filter */}
            <div className="flex-1 overflow-y-auto max-h-[210px] space-y-1.5 pr-1">
              {filteredNodes.map((n) => {
                const done = unlockedSet.has(n.id);
                const ready = canUnlock(n);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setSelectedNode(n)}
                    className={`w-full flex items-center justify-between rounded border px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      selectedNode.id === n.id
                        ? 'border-amber-400 bg-amber-500/15 text-white'
                        : done
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                        : ready
                        ? 'border-sky-500/50 bg-sky-950/25 text-sky-100'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <span className="truncate font-medium">
                      {n.icon} T{n.tier}. {n.name}
                    </span>
                    <span className="font-mono-tabular text-[11px] shrink-0 ml-2">
                      {done ? '✓' : `★${n.cost}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Summary of Active Constellation Bonuses */}
            <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-[11px] font-mono-tabular space-y-1 text-slate-300">
              <div className="font-pixel text-[10px] text-amber-300 mb-1">
                ACTIVE ASTRAL BONUSES
              </div>
              <div className="flex justify-between">
                <span>ATK / DEF / HP Mult:</span>
                <span className="text-emerald-300">
                  +{Math.round((bonuses.atkMult - 1) * 100)}% / +
                  {Math.round((bonuses.defMult - 1) * 100)}% / +
                  {Math.round((bonuses.hpMult - 1) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Crit & Backstab Bonus:</span>
                <span className="text-sky-300">
                  +{bonuses.critBonus}% Crit · +{Math.round(bonuses.backstabBonus * 100)}% Backstab
                </span>
              </div>
              <div className="flex justify-between">
                <span>Elixir Duration & Squad:</span>
                <span className="text-amber-300">
                  +{bonuses.elixirBonusSeconds}s [Q] · +{bonuses.extraAllies} Allies
                </span>
              </div>
              <div className="flex justify-between">
                <span>Special Awakenings:</span>
                <span className="text-fuchsia-300">
                  {[
                    bonuses.tornadoFinisher && '4th-Hit Tornado',
                    bonuses.tripleSwordBeam && 'Triple Beam',
                    bonuses.doublePotionThrow && '2x Flask [F]',
                    bonuses.autoRevive && 'Phoenix Revive',
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'None yet'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
