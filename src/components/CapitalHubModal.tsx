import React, { useState } from 'react';
import { Castle, Copy, Download, Flame, Hammer, Music, Sparkles, Upload, X } from 'lucide-react';
import {
  ALCHEMY_INGREDIENTS,
  ELEMENTAL_GEMS,
  WEAPON_MUTATIONS,
  computeGearEffectiveStats,
  resolveCauldronRecipe,
} from '../game/alchemyForgeEngine';
import {
  CAPITAL_BUILDINGS,
  computeCapitalBonuses,
  getBuildingStageLabel,
  getBuildingUpgradeCost,
} from '../game/kingdomBuilderEngine';
import { OST_30_TRACKS } from '../game/soundtrackSequencer';
import { CapitalBuildingId, ElementalGemId, HUDState } from '../game/types';

interface CapitalHubModalProps {
  hud: HUDState;
  onClose: () => void;
  onUpgradeBuilding: (buildingId: CapitalBuildingId) => void;
  onExchangeResources: () => void;
  onBrewCauldronPotion: (ing1: string, ing2: string, ing3: string) => void;
  onEquipBrewedPotion: (potionId: string) => void;
  onStarUpGear: (itemId: string) => void;
  onSocketGem: (itemId: string, gemId: ElementalGemId) => void;
  onReforgeMutation: (itemId: string) => void;
  onExportSaveCode: () => string;
  onImportSaveCode: (code: string) => boolean;
  onOpenInventory?: () => void;
  onOpenSkillTree?: () => void;
  onOpenWorldMap?: () => void;
  onToggleLoaf?: () => void;
  onCycleEmote?: () => void;
}

export const CapitalHubModal: React.FC<CapitalHubModalProps> = ({
  hud,
  onClose,
  onUpgradeBuilding,
  onExchangeResources,
  onBrewCauldronPotion,
  onEquipBrewedPotion,
  onStarUpGear,
  onSocketGem,
  onReforgeMutation,
  onExportSaveCode,
  onImportSaveCode,
  onOpenInventory,
  onOpenSkillTree,
  onOpenWorldMap,
  onToggleLoaf,
  onCycleEmote,
}) => {
  const [tab, setTab] = useState<'buildings' | 'cauldron' | 'anvil' | 'jukebox_save'>('buildings');
  const [ing1, setIng1] = useState<string>(ALCHEMY_INGREDIENTS[0].id);
  const [ing2, setIng2] = useState<string>(ALCHEMY_INGREDIENTS[3].id);
  const [ing3, setIng3] = useState<string>(ALCHEMY_INGREDIENTS[4].id);
  const [saveCodeText, setSaveCodeText] = useState<string>('');
  const [saveFeedback, setSaveFeedback] = useState<string>('');

  const capBonuses = computeCapitalBonuses(hud.capitalBuildings);
  const previewRecipe = resolveCauldronRecipe(ing1, ing2, ing3);
  const res = hud.kingdomResources;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-amber-500/50 bg-[#0b0f1c] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/90 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <Castle className="h-5 w-5 text-amber-300" />
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-amber-300">
                👑 KINGDOM COMMAND HUB (6-IN-1 CITADEL, FORGE, BAG, SKILLS & 300-ACT MAP)
              </h2>
              <p className="text-[11px] font-mono-tabular text-slate-400">
                Gold: <span className="text-amber-300 font-bold">{hud.gold.toLocaleString()}G</span> · Wood:{' '}
                <span className="text-emerald-300 font-bold">🪵 {res.wood}</span> · Iron:{' '}
                <span className="text-sky-300 font-bold">⛏️ {res.iron}</span> · Scales:{' '}
                <span className="text-orange-300 font-bold">🐉 {res.dragonScales}</span> · Pearls:{' '}
                <span className="text-cyan-300 font-bold">🫧 {res.abyssalPearls}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleLoaf && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onToggleLoaf();
                }}
                className="rounded border border-amber-400/70 bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/35 cursor-pointer"
                title="Toggle Cat Bread Loaf Regen [L]"
              >
                🍞 Loaf [L]
              </button>
            )}
            {onCycleEmote && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCycleEmote();
                }}
                className="rounded border border-pink-400/70 bg-pink-500/20 px-2 py-1 text-xs font-semibold text-pink-200 hover:bg-pink-500/35 cursor-pointer"
                title="Trigger Cat Emote"
              >
                😺 Emote
              </button>
            )}
            <button
              type="button"
              onClick={onExchangeResources}
              disabled={hud.gold < 150}
              className={`rounded border px-2.5 py-1 text-xs font-mono-tabular font-semibold transition-colors ${
                hud.gold >= 150
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 cursor-pointer'
                  : 'border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
              }`}
              title="Convert 150 Gold into +25 Wood, +25 Iron & +5 Shards"
            >
              +25 🪵 / +25 ⛏️ (150G)
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

        {/* 6-Tab Kingdom Command Hub Navigation Bar */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 bg-slate-900/80 px-4 py-2">
          <button
            type="button"
            onClick={() => setTab('buildings')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold border cursor-pointer ${
              tab === 'buildings'
                ? 'border-amber-400 bg-amber-500/25 text-amber-100'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Castle className="h-3.5 w-3.5 text-amber-300" />
            <span>1. 🏰 Capital (12 Bldgs)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('cauldron')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold border cursor-pointer ${
              tab === 'cauldron'
                ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-emerald-300" />
            <span>2. ⚗️ Cauldron [F]</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('anvil')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold border cursor-pointer ${
              tab === 'anvil'
                ? 'border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Hammer className="h-3.5 w-3.5 text-fuchsia-300" />
            <span>3. 🔨 +25★ Anvil</span>
          </button>

          {onOpenSkillTree && (
            <button
              type="button"
              onClick={onOpenSkillTree}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold border border-cyan-500/60 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 cursor-pointer"
            >
              <span>🌟 4. 60-Node Skills {hud.starPoints > 0 ? `(${hud.starPoints} SP)` : ''}</span>
            </button>
          )}

          {onOpenInventory && (
            <button
              type="button"
              onClick={onOpenInventory}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold border border-amber-500/60 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 cursor-pointer"
            >
              <span>🎒 5. Bag, Fur & Wardrobe ({hud.inventory.length})</span>
            </button>
          )}

          {onOpenWorldMap && (
            <button
              type="button"
              onClick={onOpenWorldMap}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold border border-indigo-500/60 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 cursor-pointer"
            >
              <span>🗺️ 6. 300-Act World Map</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setTab('jukebox_save')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold border cursor-pointer ${
              tab === 'jukebox_save'
                ? 'border-sky-400 bg-sky-500/25 text-sky-100'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Music className="h-3.5 w-3.5 text-sky-300" />
            <span>🎵 OST & Save</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* TAB 1: 12 CAPITAL BUILDINGS */}
          {tab === 'buildings' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-950/20 px-3.5 py-2 text-xs text-amber-200">
                <span>
                  🏛️ <strong>Capital Empire Bonuses:</strong> +{Math.round((capBonuses.atkMult - 1) * 100)}% ATK · +
                  {Math.round((capBonuses.defMult - 1) * 100)}% DEF · +
                  {Math.round((capBonuses.hpMult - 1) * 100)}% HP · +{capBonuses.elixirBonusSec.toFixed(1)}s Elixir [Q] · +
                  {capBonuses.mechaBonusSec.toFixed(1)}s Steam-Mecha [G]
                </span>
                <span className="font-mono-tabular text-[11px] text-amber-300">
                  Quarry & Sawmill generate resources passively while you battle!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {CAPITAL_BUILDINGS.map((b) => {
                  const lv = hud.capitalBuildings[b.id] ?? 1;
                  const isMax = lv >= 10;
                  const cost = getBuildingUpgradeCost(b, lv);
                  const canAfford =
                    !isMax && hud.gold >= cost.gold && res.wood >= cost.wood && res.iron >= cost.iron;

                  return (
                    <div
                      key={b.id}
                      className={`flex flex-col justify-between rounded-lg border p-3 ${
                        isMax
                          ? 'border-amber-400 bg-gradient-to-br from-amber-950/40 to-slate-900'
                          : 'border-slate-700/80 bg-slate-900/90'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-lg">{b.icon}</span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-mono-tabular font-bold ${
                              isMax
                                ? 'bg-amber-400/25 text-amber-200 border border-amber-300'
                                : 'bg-slate-800 text-sky-300 border border-slate-700'
                            }`}
                          >
                            {getBuildingStageLabel(lv)}
                          </span>
                        </div>
                        <h3 className="mt-1.5 font-pixel text-xs text-white">{b.name}</h3>
                        <p className="mt-1 text-[11px] text-slate-300 leading-snug">{b.description}</p>
                        <p className="mt-1.5 text-[11px] font-medium text-emerald-300">
                          {b.bonusPerLevelText}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800">
                        {isMax ? (
                          <div className="text-center text-xs font-bold text-amber-300 py-1">
                            ★ GOLDEN CITADEL MAXED (Lv.10)
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => onUpgradeBuilding(b.id)}
                            className={`w-full rounded border py-1.5 text-xs font-mono-tabular font-semibold transition-colors ${
                              canAfford
                                ? 'border-amber-400 bg-amber-500/25 text-amber-100 hover:bg-amber-500/35 cursor-pointer'
                                : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            Upgrade Lv.{lv + 1} ({cost.gold}G · 🪵{cost.wood} · ⛏️{cost.iron})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BLOCKCRAFT ALCHEMY CAULDRON */}
          {tab === 'cauldron' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: 3D-Styled Voxel Cauldron Mixer */}
              <div className="rounded-xl border border-emerald-500/40 bg-slate-900/90 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-pixel text-xs sm:text-sm text-emerald-300">
                    ⚗️ NYX’S BLOCKCRAFT VOXEL CAULDRON
                  </h3>
                  <span className="text-xs font-mono-tabular text-slate-400">
                    Brewery Lv.{hud.capitalBuildings.alchemy_brewery ?? 1}
                  </span>
                </div>

                {/* Voxel Cauldron Visual */}
                <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-emerald-500/50 bg-[#071512] p-4 shadow-inner">
                  <div
                    className="h-16 w-28 rounded-b-2xl border-4 border-slate-600 bg-slate-900 flex items-center justify-center relative overflow-hidden"
                    style={{ boxShadow: `0 0 24px ${previewRecipe.color}` }}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-5 opacity-90 animate-pulse"
                      style={{ backgroundColor: previewRecipe.color }}
                    />
                    <span className="relative z-10 text-xl">🧪✨</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-white">{previewRecipe.name}</div>
                  <div className="text-[11px] text-slate-300 text-center mt-0.5">
                    {previewRecipe.description}
                  </div>
                </div>

                {/* 3 Ingredient Slots */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Catalyst 1', val: ing1, setVal: setIng1 },
                    { label: 'Catalyst 2', val: ing2, setVal: setIng2 },
                    { label: 'Catalyst 3', val: ing3, setVal: setIng3 },
                  ].map((slot, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="block text-[10px] font-mono-tabular text-slate-400">
                        {slot.label}
                      </label>
                      <select
                        value={slot.val}
                        onChange={(e) => slot.setVal(e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100"
                      >
                        {ALCHEMY_INGREDIENTS.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.icon} {ing.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={hud.gold < 60}
                  onClick={() => onBrewCauldronPotion(ing1, ing2, ing3)}
                  className={`w-full rounded-lg border py-2.5 text-xs font-bold transition-colors ${
                    hud.gold >= 60
                      ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100 hover:bg-emerald-500/35 cursor-pointer'
                      : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  🔥 STIR VOXEL CAULDRON & BREW BATCH (60G)
                </button>
              </div>

              {/* Right: Brewed Potion Satchel & Active [F] Quick-Toss Selector */}
              <div className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 space-y-3">
                <h3 className="font-pixel text-xs sm:text-sm text-amber-300">
                  🎒 BREWED COMBAT SATCHEL ([F] KEY TOSS)
                </h3>
                <p className="text-xs text-slate-300">
                  Select which BlockCraft Flask Nyx hurls in combat when you press <strong>[F]</strong>:
                </p>

                <div className="space-y-2">
                  {hud.brewedPotions.map((pot) => {
                    const isEquipped = hud.equippedBrewId === pot.id;
                    return (
                      <div
                        key={pot.id}
                        className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
                          isEquipped
                            ? 'border-emerald-400 bg-emerald-950/30'
                            : 'border-slate-800 bg-slate-950/70'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: pot.color }}
                            />
                            <span className="font-semibold text-xs text-white">{pot.name}</span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono-tabular text-amber-300">
                              x{pot.count}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{pot.description}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onEquipBrewedPotion(pot.id)}
                          className={`shrink-0 rounded border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                            isEquipped
                              ? 'border-emerald-400 bg-emerald-500/30 text-emerald-100'
                              : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {isEquipped ? '✓ Equipped [F]' : 'Equip [F]'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MASTER BLACKSMITH STAR-UP +25★ ANVIL & PRIMORDIAL MUTATIONS */}
          {tab === 'anvil' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-950/20 p-3 text-xs text-fuchsia-200">
                🔨 <strong>Master Star-Up Anvil:</strong> Reforge your equipped Weapon & Armor up to{' '}
                <strong>+25★</strong>, socket <strong>Elemental Gems</strong>, and roll{' '}
                <strong>Gargantuan / Prism / Primordial (+150% Stats!)</strong> mutations!
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[hud.equippedWeapon, hud.equippedArmor].map((gear) => {
                  const eff = computeGearEffectiveStats(gear);
                  const mutMeta = WEAPON_MUTATIONS[gear.mutation ?? 'none'];
                  const starCostGold = 180 + gear.upgradeLevel * 95;
                  const starCostMat = 3 + Math.floor(gear.upgradeLevel / 2);
                  const canStarUp =
                    gear.upgradeLevel < 25 &&
                    hud.gold >= starCostGold &&
                    hud.materials >= starCostMat;

                  return (
                    <div
                      key={gear.id}
                      className={`rounded-xl border-2 p-4 space-y-3 ${
                        gear.mutation === 'primordial'
                          ? 'border-fuchsia-400 bg-gradient-to-br from-fuchsia-950/40 via-slate-900 to-amber-950/30'
                          : gear.mutation === 'prism'
                          ? 'border-cyan-400 bg-slate-900/95'
                          : 'border-slate-700 bg-slate-900/95'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono-tabular uppercase text-slate-400">
                            Equipped {gear.slot} · Tier {gear.tier}
                          </span>
                          <h3 className="font-pixel text-xs sm:text-sm text-amber-300">
                            {gear.name} {gear.upgradeLevel > 0 ? `+${gear.upgradeLevel}★` : ''}
                          </h3>
                        </div>
                        <span
                          className={`rounded border px-2 py-0.5 text-[10px] font-mono-tabular font-bold ${mutMeta.badgeClass}`}
                        >
                          {mutMeta.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 rounded bg-slate-950/80 p-2.5 text-center font-mono-tabular text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">EFFECTIVE ATK</div>
                          <div className="font-bold text-rose-300">+{eff.atk}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">EFFECTIVE DEF</div>
                          <div className="font-bold text-sky-300">+{eff.def}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">EFFECTIVE HP / CRIT</div>
                          <div className="font-bold text-emerald-300">
                            +{eff.hp} HP · {eff.crit}%
                          </div>
                        </div>
                      </div>

                      {/* Star-Up Button (+1 to +25★) */}
                      <button
                        type="button"
                        disabled={!canStarUp}
                        onClick={() => onStarUpGear(gear.id)}
                        className={`w-full rounded border py-2 text-xs font-mono-tabular font-bold transition-colors ${
                          gear.upgradeLevel >= 25
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 cursor-default'
                            : canStarUp
                            ? 'border-amber-400 bg-amber-500/25 text-amber-100 hover:bg-amber-500/35 cursor-pointer'
                            : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {gear.upgradeLevel >= 25
                          ? '★ MAX STAR-UP (+25★) ACHIEVED!'
                          : `★ Star-Up to +${gear.upgradeLevel + 1}★ (${starCostGold}G + ${starCostMat} Shards)`}
                      </button>

                      {/* Mutation Reforge Button */}
                      <button
                        type="button"
                        disabled={hud.gold < 300}
                        onClick={() => onReforgeMutation(gear.id)}
                        className={`w-full flex items-center justify-center gap-1.5 rounded border py-2 text-xs font-mono-tabular font-bold transition-colors ${
                          hud.gold >= 300
                            ? 'border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100 hover:bg-fuchsia-500/35 cursor-pointer'
                            : 'border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
                        <span>Roll Gargantuan / Prism / Primordial Mutation (300G)</span>
                      </button>

                      {/* Elemental Gem Sockets */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-mono-tabular text-slate-400">
                          Socket Elemental Gem (120G):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ELEMENTAL_GEMS.map((gem) => {
                            const active = gear.socketedGem === gem.id;
                            return (
                              <button
                                key={gem.id}
                                type="button"
                                disabled={!active && hud.gold < 120}
                                onClick={() => onSocketGem(gear.id, gem.id)}
                                className={`rounded border px-2 py-1 text-[10px] font-mono-tabular transition-colors cursor-pointer ${
                                  active
                                    ? 'border-amber-300 bg-amber-500/25 text-white font-bold'
                                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                                }`}
                                title={gem.bonusText}
                              >
                                💎 {gem.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: 30-TRACK CHIPTUNE JUKEBOX & BASE64 SAVE VAULT */}
          {tab === 'jukebox_save' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: COTC1 Base64 Save Vault */}
              <div className="rounded-xl border border-sky-500/40 bg-slate-900/90 p-4 space-y-3">
                <h3 className="font-pixel text-xs sm:text-sm text-sky-300">
                  💾 BASE64 SAVE VAULT (COTC1:... EXPORT / IMPORT)
                </h3>
                <p className="text-xs text-slate-300">
                  Your progress auto-saves to both <strong>localStorage</strong> and{' '}
                  <strong>IndexedDB</strong>. You can also export or import a portable{' '}
                  <code>COTC1:...</code> save string below:
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const code = onExportSaveCode();
                      setSaveCodeText(code);
                      if (navigator.clipboard && code) {
                        navigator.clipboard.writeText(code).catch(() => {});
                      }
                      setSaveFeedback('✅ Exported COTC1 Save String & copied to clipboard!');
                    }}
                    className="flex items-center gap-1.5 rounded border border-sky-400 bg-sky-500/25 px-3 py-1.5 text-xs font-semibold text-sky-100 hover:bg-sky-500/35 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Generate & Copy COTC1 Save String</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!saveCodeText.trim()) {
                        setSaveFeedback('⚠️ Paste a COTC1:... save string into the box first.');
                        return;
                      }
                      const ok = onImportSaveCode(saveCodeText);
                      setSaveFeedback(
                        ok
                          ? '🎉 Successfully imported COTC1 Save String!'
                          : '❌ Invalid COTC1 Save String.'
                      );
                    }}
                    className="flex items-center gap-1.5 rounded border border-emerald-400 bg-emerald-500/25 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/35 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Import COTC1 Save String</span>
                  </button>

                  {saveCodeText && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(saveCodeText).catch(() => {});
                        setSaveFeedback('📋 Copied to clipboard!');
                      }}
                      className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </button>
                  )}
                </div>

                <textarea
                  value={saveCodeText}
                  onChange={(e) => setSaveCodeText(e.target.value)}
                  placeholder="COTC1:eyJ2ZXJzaW9uIj..."
                  rows={5}
                  className="w-full rounded border border-slate-700 bg-slate-950 p-2.5 font-mono text-[11px] text-amber-200"
                />

                {saveFeedback && (
                  <div className="text-xs font-medium text-emerald-300">{saveFeedback}</div>
                )}
              </div>

              {/* Right: 30-Track Chiptune OST Catalog */}
              <div className="rounded-xl border border-purple-500/40 bg-slate-900/90 p-4 space-y-2.5">
                <h3 className="font-pixel text-xs sm:text-sm text-purple-300">
                  🎵 30-TRACK PROCEDURAL CHIPTUNE SOUNDTRACK
                </h3>
                <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
                  {OST_30_TRACKS.map((tr) => (
                    <div
                      key={tr.id}
                      className="flex items-center justify-between rounded border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs"
                    >
                      <span className="font-medium text-slate-200 truncate">{tr.title}</span>
                      <span className="font-mono-tabular text-[10px] text-purple-300 shrink-0 ml-2">
                        {tr.arc} · {tr.bpm} BPM
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
