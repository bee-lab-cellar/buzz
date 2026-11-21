/**
 * File 83 / 100 — Authentic 3D Hollow BlockCraft Alchemy Cauldron Tab.
 *
 * Mounts `VoxelCauldronAndBossStage` in an isolated `useRef` container with NO `backdrop-blur`
 * and pairs it with the 50-Recipe BlockCraft Alchemy brewer.
 * Strictly typed (ZERO `any`).
 */

import { useEffect, useRef, useState } from 'react';
import { Flame, FlaskConical, Sparkles } from 'lucide-react';
import { VoxelCauldronAndBossStage } from '../three/voxelCauldronAndBossStage';
import { ALCHEMY_50_RECIPES } from '../data/alchemy50RecipesAndSkills60';
import {
  brewAlchemyRecipe,
  createInitialCapitalAlchemyState,
} from '../engine/capitalAndAlchemyEngine';

export interface Hub3DAlchemyCauldronTabProps {
  readonly gold: number;
}

export function Hub3DAlchemyCauldronTab({ gold }: Hub3DAlchemyCauldronTabProps) {
  const stageMountRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<VoxelCauldronAndBossStage | null>(null);
  const [alchemyState, setAlchemyState] = useState(() => createInitialCapitalAlchemyState(gold));
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(ALCHEMY_50_RECIPES[0]?.id ?? 'recipe_01');
  const [brewBanner, setBrewBanner] = useState<string>('Authentic Hollow Cast-Iron Voxel Cauldron over Oak-Log & Magma Campfire.');

  useEffect(() => {
    const mount = stageMountRef.current;
    if (!mount) return;

    let stage: VoxelCauldronAndBossStage | null = null;
    try {
      stage = new VoxelCauldronAndBossStage(mount);
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

  const handleBrew = (recipeId: string): void => {
    setSelectedRecipeId(recipeId);
    const next = {
      ...alchemyState,
      ingredients: { ...alchemyState.ingredients },
      brewedFlasks: { ...alchemyState.brewedFlasks },
    };
    const res = brewAlchemyRecipe(next, recipeId);
    if (res.ok && res.recipe) {
      setAlchemyState(next);
      stageRef.current?.triggerBrewExplosion(res.liquidHex);
      setBrewBanner(`Brewed ${res.recipe.name} (${res.potencyMultiplier}x potency)!`);
    } else {
      setBrewBanner(res.reason ?? 'Missing alchemy ingredients');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Isolated 3D WebGL Mount Container (NO backdrop-blur!) */}
      <div className="space-y-2 lg:col-span-6">
        <div
          ref={stageMountRef}
          className="h-72 w-full overflow-hidden rounded-xl border border-amber-500/40 bg-slate-950"
        />
        <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-amber-200">
          <Flame className="h-4 w-4 shrink-0 text-orange-400" />
          <span>{brewBanner}</span>
        </div>
      </div>

      {/* 50 BlockCraft Alchemy Recipes List */}
      <div className="space-y-2 lg:col-span-6">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-black text-purple-300">
            <FlaskConical className="h-4 w-4" />
            50 BLOCKCRAFT ALCHEMY RECIPES
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Flasks Brewed: {Object.values(alchemyState.brewedFlasks).reduce((a, b) => a + b, 0)}
          </span>
        </div>

        <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {ALCHEMY_50_RECIPES.map((recipe) => {
            const count = alchemyState.brewedFlasks[recipe.id] ?? 0;
            const active = selectedRecipeId === recipe.id;
            return (
              <button
                key={recipe.id}
                type="button"
                onClick={() => handleBrew(recipe.id)}
                className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition cursor-pointer ${
                  active
                    ? 'border-amber-400 bg-slate-800'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="text-[11px] font-black text-slate-100">{recipe.name}</span>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: recipe.colorHex }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">{recipe.effectSummary}</p>
                <div className="mt-2 flex w-full items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 font-bold text-purple-300">
                    <Sparkles className="h-3 w-3" />
                    Brew
                  </span>
                  <span className="font-mono text-emerald-300">Owned: {count}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
