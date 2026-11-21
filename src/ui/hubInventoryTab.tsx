/**
 * Layer 4 — Modular Command Hub Tab 1: 50-Tier Armory & +25★ Star-Up Anvil
 */

import { useState } from 'react';
import { Hammer, Shield, Sparkles, Sword } from 'lucide-react';
import {
  ARMORS_50_TIERS,
  WEAPONS_50_TIERS,
  getRecommendedGearTierForAct,
} from '../data/gear50TiersAndAlchemy';
import type { EquipmentRarity, EquipmentTierSpec } from '../types/combat';

export interface HubInventoryTabProps {
  readonly currentAct: number;
  readonly gold: number;
  readonly equippedWeaponId: string;
  readonly equippedArmorId: string;
  readonly gearStarLevels: Readonly<Record<string, number>>;
  readonly onEquipGear?: (gearId: string) => void;
  readonly onStarUpGear?: (gearId: string) => void;
}

const RARITY_COLOR_HEX: Readonly<Record<EquipmentRarity, string>> = {
  common: '#cbd5e1',
  uncommon: '#4ade80',
  rare: '#38bdf8',
  epic: '#c084fc',
  legendary: '#fbbf24',
  mythic: '#fb7185',
  primordial: '#fde047',
};

export function HubInventoryTab({
  currentAct,
  gold,
  equippedWeaponId,
  equippedArmorId,
  gearStarLevels,
  onEquipGear,
  onStarUpGear,
}: HubInventoryTabProps) {
  const [slotFilter, setSlotFilter] = useState<'weapon' | 'armor'>('weapon');
  const [selectedArc, setSelectedArc] = useState<number>(Math.min(10, Math.max(1, Math.ceil(currentAct / 100))));

  const recommendedTier = getRecommendedGearTierForAct(currentAct);
  const pool: ReadonlyArray<EquipmentTierSpec> =
    slotFilter === 'weapon' ? WEAPONS_50_TIERS : ARMORS_50_TIERS;
  const tierMin = (selectedArc - 1) * 5 + 1;
  const tierMax = selectedArc * 5;
  const visibleItems = pool.filter((item) => item.tier >= tierMin && item.tier <= tierMax);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSlotFilter('weapon')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold cursor-pointer ${
              slotFilter === 'weapon'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sword className="h-3.5 w-3.5" />
            50 Weapon Tiers
          </button>
          <button
            type="button"
            onClick={() => setSlotFilter('armor')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold cursor-pointer ${
              slotFilter === 'armor'
                ? 'bg-cyan-400 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            50 Armor Tiers
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="font-mono text-amber-300">Gold: {gold.toLocaleString()}</span>
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-semibold text-emerald-300">
            Act {currentAct} Recommended: Tier {recommendedTier}
          </span>
        </div>
      </div>

      {/* 10-Arc Tier Filter */}
      <div className="flex flex-wrap gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((arc) => (
          <button
            key={arc}
            type="button"
            onClick={() => setSelectedArc(arc)}
            className={`rounded px-2 py-1 text-[11px] font-bold cursor-pointer ${
              selectedArc === arc
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Arc {arc} (T{(arc - 1) * 5 + 1}–T{arc * 5})
          </button>
        ))}
      </div>

      {/* 5 Tiers for Selected Arc */}
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => {
          const isEquipped =
            item.id === equippedWeaponId || item.id === equippedArmorId;
          const stars = gearStarLevels[item.id] ?? item.starLevel;
          const forgeCost = Math.round(120 + item.tier * item.tier * 28);
          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between gap-2 rounded-xl border p-3 ${
                isEquipped
                  ? 'border-amber-400 bg-amber-950/30'
                  : 'border-slate-700 bg-slate-900/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-xs font-black"
                    style={{ color: RARITY_COLOR_HEX[item.rarity] }}
                  >
                    T{item.tier} • {item.name}
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-amber-300">
                    +{stars}★/25
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {item.rarity.toUpperCase()} • ATK +{item.atkBonus} • DEF +{item.defBonus} • HP +{item.hpBonus}
                </p>
                {item.primordialMutated && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-fuchsia-300">
                    <Sparkles className="h-3 w-3 shrink-0" />
                    Primordial Omniverse Mutation (+50% Star-Forge Aura)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="font-mono text-[10px] text-slate-400">
                  Forge: {forgeCost.toLocaleString()}g
                </span>
                <div className="flex items-center gap-1.5">
                  {onEquipGear && (
                    <button
                      type="button"
                      onClick={() => onEquipGear(item.id)}
                      className="rounded bg-emerald-500/25 px-2 py-1 text-[10px] font-bold text-emerald-200 hover:bg-emerald-500/40 cursor-pointer"
                    >
                      {isEquipped ? 'Equipped' : 'Equip'}
                    </button>
                  )}
                  {onStarUpGear && (
                    <button
                      type="button"
                      onClick={() => onStarUpGear(item.id)}
                      className="flex items-center gap-1 rounded bg-amber-500/25 px-2 py-1 text-[10px] font-bold text-amber-200 hover:bg-amber-500/40 cursor-pointer"
                    >
                      <Hammer className="h-3 w-3" />
                      Star-Up
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
