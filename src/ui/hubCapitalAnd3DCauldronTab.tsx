/**
 * Layer 4 — Modular Command Hub Tab 3: Felis-Fang Capital & LIVE Three.js 3D Voxel Cauldron
 *
 * Mounts the real Three.js `VoxelCauldronAndBossStage` inside a dedicated empty
 * container div with ZERO CSS `backdrop-blur` over WebGL, interactive BlockCraft
 * Alchemy brew explosions, and live toggling between the bubbling 3D Voxel Cauldron
 * and the Rotating 3D Boss Relic Pedestal!
 */

import { useEffect, useRef, useState } from 'react';
import { Box, Flame, FlaskConical, Trophy } from 'lucide-react';
import {
  VoxelCauldronAndBossStage,
  type VoxelStageMode,
} from '../three/voxelCauldronAndBossStage';
import { OMNIVERSE_50_ALCHEMY_RECIPES } from '../data/gear50TiersAndAlchemy';
import type { AlchemyRecipe } from '../types/saveAndProgression';

export interface HubCapitalAnd3DCauldronTabProps {
  readonly gold: number;
  readonly onBrewRecipe?: (recipe: AlchemyRecipe) => void;
}

export function HubCapitalAnd3DCauldronTab({
  gold,
  onBrewRecipe,
}: HubCapitalAnd3DCauldronTabProps) {
  const stageHostRef = useRef<HTMLDivElement | null>(null);
  const stageInstanceRef = useRef<VoxelCauldronAndBossStage | null>(null);
  const [stageMode, setStageMode] = useState<VoxelStageMode>('alchemy_cauldron');
  const [lastBrewBanner, setLastBrewBanner] = useState<string>(
    'Select any BlockCraft Recipe below to stir the 3D Voxel Cauldron!',
  );
  const [brewCount, setBrewCount] = useState<number>(0);

  useEffect(() => {
    const host = stageHostRef.current;
    if (!host) return;

    const stage = new VoxelCauldronAndBossStage(host, 'alchemy_cauldron');
    stageInstanceRef.current = stage;

    return () => {
      stage.dispose();
      stageInstanceRef.current = null;
    };
  }, []);

  const handleSwitchMode = (nextMode: VoxelStageMode): void => {
    setStageMode(nextMode);
    stageInstanceRef.current?.setMode(nextMode);
  };

  const handleBrew = (recipe: AlchemyRecipe): void => {
    if (stageMode !== 'alchemy_cauldron') {
      handleSwitchMode('alchemy_cauldron');
    }
    stageInstanceRef.current?.triggerBrewExplosion(recipe.colorHex);
    setBrewCount((prev) => prev + 1);
    const ingList = recipe.ingredients.map((i) => `${i.qty}x ${i.id}`).join(' + ');
    setLastBrewBanner(
      `Brewed ${recipe.name} (${ingList}) -> ${recipe.effectSummary}`,
    );
    onBrewRecipe?.(recipe);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left: Real Three.js 3D Blocky Voxel Viewport (NO backdrop-blur over WebGL!) */}
      <div className="flex flex-col gap-2.5 lg:col-span-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Box className="h-4 w-4 text-amber-300" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-200">
              Live Three.js 3D Voxel Stage
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSwitchMode('alchemy_cauldron')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                stageMode === 'alchemy_cauldron'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              3D Cauldron
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('boss_relic_pedestal')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer ${
                stageMode === 'boss_relic_pedestal'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              3D Boss Relic
            </button>
          </div>
        </div>

        {/* Dedicated isolated mount div for WebGLRenderer */}
        <div
          ref={stageHostRef}
          className="h-[260px] w-full overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-950 shadow-inner"
        />

        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[11px]">
          <span className="text-cyan-200">{lastBrewBanner}</span>
          <span className="shrink-0 font-mono font-bold text-amber-300">
            Brews: {brewCount} • {gold.toLocaleString()}g
          </span>
        </div>
      </div>

      {/* Right: 50 BlockCraft Alchemy Recipes */}
      <div className="flex flex-col gap-2 lg:col-span-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
            50 BlockCraft Alchemy Formulas
          </span>
          <span className="text-[11px] text-slate-400">
            Click Brew to trigger 3D Voxel Burst
          </span>
        </div>

        <div className="grid max-h-[305px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {OMNIVERSE_50_ALCHEMY_RECIPES.map((recipe) => (
            <div
              key={recipe.id}
              className="flex flex-col justify-between gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 p-2.5"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: recipe.colorHex }}
                    />
                    {recipe.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {recipe.category}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-amber-200/90">
                  {recipe.ingredients.map((i) => `${i.qty}x ${i.id}`).join(' + ')}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-300">
                  {recipe.effectSummary}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleBrew(recipe)}
                className="mt-1 flex items-center justify-center gap-1 rounded-md bg-emerald-500/25 px-2 py-1 text-[10px] font-bold text-emerald-200 hover:bg-emerald-500/40 cursor-pointer"
              >
                <Flame className="h-3 w-3" />
                Brew ({recipe.goldCost}g)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
