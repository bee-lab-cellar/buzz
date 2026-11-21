import React, { useState } from 'react';
import { FlaskConical, Hammer, Shield, Sparkles, Sword, X } from 'lucide-react';
import {
  ARMOR_TIERS,
  GEAR_CATALOG,
  getBlacksmithForgeCost,
  getEffectiveGearStats,
  getTier30CraftRequirements,
  getTierColor,
  getTierLabel,
  getUpgradeCost,
  WEAPON_TIERS,
} from '../game/gear';
import { CatEmoteId, CatFurId, HUDState } from '../game/types';
import { PixelIcon } from './PixelIcon';

const FUR_OPTIONS: { id: CatFurId; label: string; swatch: string }[] = [
  { id: 'nyx_void', label: 'Nyx Void', swatch: '#312e81' },
  { id: 'ginger', label: 'Ginger', swatch: '#f59e0b' },
  { id: 'tuxedo', label: 'Tuxedo', swatch: '#334155' },
  { id: 'calico', label: 'Calico', swatch: '#fb923c' },
  { id: 'persian', label: 'Persian', swatch: '#f1f5f9' },
  { id: 'cyber_noir', label: 'Neko Noir', swatch: '#06b6d4' },
  { id: 'starlight', label: 'Starlight', swatch: '#6366f1' },
];

const EMOTE_OPTIONS: { id: Exclude<CatEmoteId, 'none'>; icon: string; label: string; perk: string }[] = [
  { id: 'bread_loaf', icon: '🍞', label: 'Bread Loaf', perk: '+5 HP/s & 40% Crust Guard' },
  { id: 'making_biscuits', icon: '🐾', label: 'Make Biscuits', perk: 'Knead Dough (+5 HP/s)' },
  { id: 'eepy_croissant', icon: '🥐', label: 'Croissant Nap', perk: '+5 HP/s & 40% Crust Guard' },
  { id: 'zoomie_blep', icon: '👅', label: 'Silly Blep :P', perk: 'Wizard Blep & Sparkles' },
  { id: 'purr_love', icon: '💖', label: 'Cozy Purr', perk: 'Heart Bubbles (+5 HP/s)' },
];

type AlchemyRecipeId = 'voxel_potion' | 'primal_guardian' | 'neko_thrusters' | 'sea_compass';

interface InventoryModalProps {
  hud: HUDState;
  isBlacksmithMode: boolean;
  onClose: () => void;
  onEquip: (id: string) => void;
  onUpgrade: (id: string) => void;
  onBuyPotion: () => void;
  onSelectFur: (furId: CatFurId) => void;
  onSelectEmote: (emoteId: CatEmoteId) => void;
  onCraftAlchemy: (recipeId: AlchemyRecipeId) => void;
  onClaimUltimateLoadout: () => void;
  onClaimTier30Loadout: () => void;
  onForgeGear: (id: string) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  hud,
  isBlacksmithMode,
  onClose,
  onEquip,
  onUpgrade,
  onBuyPotion,
  onSelectFur,
  onSelectEmote,
  onCraftAlchemy,
  onClaimUltimateLoadout,
  onClaimTier30Loadout,
  onForgeGear,
}) => {
  const [tab, setTab] = useState<'gear' | 'anvil' | 'alchemy'>(isBlacksmithMode ? 'anvil' : 'gear');
  const weapons = hud.inventory.filter((i) => i.slot === 'weapon').sort((a, b) => a.tier - b.tier);
  const armors = hud.inventory.filter((i) => i.slot === 'armor').sort((a, b) => a.tier - b.tier);
  const ownedIds = new Set(hud.inventory.map((i) => i.id));
  const tier30FreeUnlocked =
    hud.maxUnlockedAct >= 121 ||
    hud.currentAct >= 121 ||
    hud.clearedActs.includes(121) ||
    hud.clearedActs.includes(122) ||
    Boolean(hud.story.bahamutDefeated);
  const ownsTier30Blade = ownedIds.has('eternal_omni_blade');
  const ownsTier30Mantle = ownedIds.has('eternal_omni_mantle');
  const ownsBothTier30 = ownsTier30Blade && ownsTier30Mantle;
  const equippedBothTier30 =
    hud.equippedWeapon.id === 'eternal_omni_blade' && hud.equippedArmor.id === 'eternal_omni_mantle';

  const nextWeaponId = WEAPON_TIERS.find((id) => id !== 'eternal_omni_blade' && !ownedIds.has(id));
  const nextArmorId = ARMOR_TIERS.find((id) => id !== 'eternal_omni_mantle' && !ownedIds.has(id));
  const forgeChoices: string[] = [
    'eternal_omni_blade',
    'eternal_omni_mantle',
    ...(nextWeaponId ? [nextWeaponId] : []),
    ...(nextArmorId ? [nextArmorId] : []),
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-lg border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5">
          <div className="flex items-center gap-4">
            <h2 className="font-pixel text-base text-amber-300">
              {isBlacksmithMode ? 'Forgepaw’s Anvil & Gear' : 'Knight’s Equipment'}
            </h2>
            <div className="flex items-center gap-1 rounded-md bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setTab('gear')}
                className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                  tab === 'gear' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Equipment
              </button>
              <button
                type="button"
                onClick={() => setTab('anvil')}
                className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  tab === 'anvil' ? 'bg-amber-500/20 text-amber-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Anvil & Supplies
              </button>
              <button
                type="button"
                onClick={() => setTab('alchemy')}
                className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  tab === 'alchemy' ? 'bg-emerald-500/20 text-emerald-200' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Alchemy
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono-tabular">
              <span className="text-amber-300 font-semibold">{hud.gold} Gold</span>
              <span className="text-slate-600">·</span>
              <span className="text-sky-300 font-semibold">{hud.materials} Shards</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stat Summary Strip */}
        <div className="grid grid-cols-4 gap-3 border-b border-slate-800 bg-slate-950/60 px-5 py-2.5 text-xs font-mono-tabular">
          <div>
            <span className="text-slate-400">ATK </span>
            <span className="text-rose-300 font-bold">{hud.totalAtk}</span>
          </div>
          <div>
            <span className="text-slate-400">DEF </span>
            <span className="text-sky-300 font-bold">{hud.totalDef}</span>
          </div>
          <div>
            <span className="text-slate-400">MAX HP </span>
            <span className="text-emerald-300 font-bold">{hud.maxHp}</span>
          </div>
          <div>
            <span className="text-slate-400">CRIT </span>
            <span className="text-amber-300 font-bold">{hud.totalCrit}%</span>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[62vh] overflow-y-auto p-5">
          {tab === 'gear' ? (
            <div className="space-y-4">
              {/* Ultimate Duck & Tier 11 Mythic Loadout Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-yellow-400/60 bg-gradient-to-r from-amber-500/20 via-fuchsia-500/15 to-amber-500/20 px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-yellow-200">
                    🦆⚔️ Nightmare &amp; Act 41 Clear Reward: The Great Duck &amp; Tier 11 Mythic Gear (+3)
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {hud.nightmareUnlocked || hud.nightmareMode || hud.clearedActs.includes(41)
                      ? 'Unlocked! Excaliquack: Astral Duck-God Greatsword (+3) & Sovereign Quack-Lion Aegis (+3) + Great Duck Companion'
                      : 'Complete Act 41 (Defeat Usurper Fenrir) to unlock Nightmare Mode, The Great Duck & Tier 11 Excaliquack / Sovereign Aegis (+3)!'}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!hud.nightmareUnlocked && !hud.nightmareMode && !hud.clearedActs.includes(41)}
                  onClick={onClaimUltimateLoadout}
                  className={`min-h-[38px] rounded border px-3 py-1.5 font-pixel text-[10px] shadow transition-colors whitespace-nowrap shrink-0 ${
                    hud.nightmareUnlocked || hud.nightmareMode || hud.clearedActs.includes(41)
                      ? 'border-yellow-300 bg-yellow-400 hover:bg-yellow-300 text-slate-950 cursor-pointer'
                      : 'border-slate-700 bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {!hud.nightmareUnlocked && !hud.nightmareMode && !hud.clearedActs.includes(41)
                    ? '🔒 Clear Act 41 to Unlock'
                    : hud.equippedWeapon.id === 'quack_god_excalibur' &&
                      hud.equippedArmor.id === 'sovereign_duck_aegis' &&
                      hud.hasDuckElixir
                    ? '🦆⚔️ Equipped (+3)'
                    : '🦆⚔️ Equip Mythic + Duck'}
                </button>
              </div>

              {/* Tier 30 Eternal Dragon-Slayer Omni Loadout Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-400/70 bg-gradient-to-r from-amber-500/20 via-rose-500/15 to-yellow-500/20 px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-amber-200">
                    🐉⚔️ Tier 30 Pinnacle Gear: Eternal Dragon-Slayer Omni-Blade &amp; Crown Mantle
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {tier30FreeUnlocked
                      ? 'Act 121 United Sanctum Unlocked! Claim Tier 30 Eternal Omni-Blade (+800 ATK) & Omni-Crown Mantle (+3,000 HP) for free.'
                      : ownsBothTier30
                      ? 'Forged! Equip both Tier 30 Eternal Omni relics immediately.'
                      : 'Reach Act 121 (United Sanctum) OR master the Prestige Forge (T29 +3 MAX + Act 82 Clear + Lv.20/250 Kills + 25,000G · 120 Shards · 40 🐟 each)!'}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={equippedBothTier30}
                  onClick={() => {
                    if (tier30FreeUnlocked || ownsBothTier30) {
                      onClaimTier30Loadout();
                    } else {
                      setTab('anvil');
                    }
                  }}
                  className={`min-h-[38px] rounded border px-3 py-1.5 font-pixel text-[10px] shadow transition-colors whitespace-nowrap shrink-0 ${
                    equippedBothTier30
                      ? 'border-amber-400/50 bg-amber-500/20 text-amber-200 cursor-default'
                      : tier30FreeUnlocked || ownsBothTier30
                      ? 'border-yellow-300 bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                      : 'border-rose-400/70 bg-rose-500/25 hover:bg-rose-500/35 text-amber-100 cursor-pointer'
                  }`}
                >
                  {equippedBothTier30
                    ? '🐉⚔️ Tier 30 Equipped'
                    : tier30FreeUnlocked
                    ? '🐉⚔️ Claim Tier 30 Omni'
                    : ownsBothTier30
                    ? '🐉⚔️ Equip Tier 30 Omni'
                    : '🔨 Forge in Anvil'}
                </button>
              </div>

              {/* Cat Fur Wardrobe */}
              <div className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Nyx’s Fur & Hat Wardrobe
                  </span>
                  <span className="text-[11px] font-mono-tabular text-slate-400">
                    Hotkey [C]
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {FUR_OPTIONS.map((fur) => {
                    const active = hud.furId === fur.id;
                    return (
                      <button
                        key={fur.id}
                        type="button"
                        onClick={() => onSelectFur(fur.id)}
                        className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded border px-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                            : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-white/40 shrink-0"
                          style={{ backgroundColor: fur.swatch }}
                        />
                        <span className="hidden sm:inline">{fur.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cat Emotes & Bread Loaf Form */}
              <div className="rounded-md border border-amber-500/30 bg-slate-950/60 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-amber-200">
                    Cat Emotes & Bread Loaf Bakery
                  </span>
                  <span className="text-[11px] font-mono-tabular text-slate-400">
                    Bread Loaf [B] · Cycle Emote [V]
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {EMOTE_OPTIONS.map((em) => {
                    const active = hud.activeEmote === em.id;
                    return (
                      <button
                        key={em.id}
                        type="button"
                        title={em.perk}
                        onClick={() => onSelectEmote(active ? 'none' : em.id)}
                        className={`flex min-h-[44px] flex-col items-center justify-center rounded border px-2 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          active
                            ? 'border-amber-400 bg-amber-500/25 text-amber-100'
                            : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span>
                          {em.icon} {em.label}
                        </span>
                        <span className="text-[10px] font-mono-tabular text-slate-400 truncate max-w-full">
                          {em.perk}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Weapons */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2.5">
                  <Sword className="w-3.5 h-3.5 text-amber-400" />
                  <span>Weapons</span>
                </div>
                <div className="space-y-2">
                  {weapons.map((w) => {
                    const equipped = hud.equippedWeapon.id === w.id;
                    const eff = getEffectiveGearStats(w);
                    return (
                      <div
                        key={w.id}
                        className={`flex items-center justify-between gap-3 rounded-md border p-2.5 ${
                          equipped
                            ? 'border-amber-400/70 bg-amber-500/10'
                            : 'border-slate-800 bg-slate-950/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <PixelIcon kind="weapon" tier={w.tier} size={24} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 truncate">
                              <span>{w.name}</span>
                              {w.upgradeLevel > 0 && (
                                <span className="text-amber-300 font-mono-tabular">+{w.upgradeLevel}</span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono-tabular text-slate-400">
                              <span style={{ color: getTierColor(w.tier) }}>{getTierLabel(w.tier)}</span>
                              {' · '}+{eff.atk} ATK{' · '}+{eff.crit}% Crit
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={equipped}
                          onClick={() => onEquip(w.id)}
                          className={`min-h-[44px] px-3.5 py-2 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                            equipped
                              ? 'bg-amber-400/20 text-amber-200 cursor-default'
                              : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                          }`}
                        >
                          {equipped ? 'Equipped' : 'Equip'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Armor */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2.5">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>Armor</span>
                </div>
                <div className="space-y-2">
                  {armors.map((a) => {
                    const equipped = hud.equippedArmor.id === a.id;
                    const eff = getEffectiveGearStats(a);
                    return (
                      <div
                        key={a.id}
                        className={`flex items-center justify-between gap-3 rounded-md border p-2.5 ${
                          equipped
                            ? 'border-sky-400/70 bg-sky-500/10'
                            : 'border-slate-800 bg-slate-950/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <PixelIcon kind="armor" tier={a.tier} size={24} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 truncate">
                              <span>{a.name}</span>
                              {a.upgradeLevel > 0 && (
                                <span className="text-sky-300 font-mono-tabular">+{a.upgradeLevel}</span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono-tabular text-slate-400">
                              <span style={{ color: getTierColor(a.tier) }}>{getTierLabel(a.tier)}</span>
                              {' · '}+{eff.hp} HP{' · '}+{eff.def} DEF
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={equipped}
                          onClick={() => onEquip(a.id)}
                          className={`min-h-[44px] px-3.5 py-2 rounded text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                            equipped
                              ? 'bg-sky-400/20 text-sky-200 cursor-default'
                              : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                          }`}
                        >
                          {equipped ? 'Equipped' : 'Equip'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              </div>
            </div>
          ) : tab === 'anvil' ? (
            <div className="space-y-4">
              {/* Upgrade Equipped Gear */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[hud.equippedWeapon, hud.equippedArmor].map((item) => {
                  const cost = getUpgradeCost(item);
                  const canAfford =
                    !cost.maxed && hud.gold >= cost.gold && hud.materials >= cost.materials;
                  return (
                    <div
                      key={item.id}
                      className="rounded-md border border-slate-800 bg-slate-950/70 p-3 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <PixelIcon
                          kind={item.slot === 'weapon' ? 'weapon' : 'armor'}
                          tier={item.tier}
                          size={28}
                        />
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {item.name}{' '}
                            {item.upgradeLevel > 0 && (
                              <span className="text-amber-300 font-mono-tabular">
                                +{item.upgradeLevel}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.slot === 'weapon'
                              ? `Improves ATK +${3 + item.tier * 2} & Crit +2%`
                              : `Improves HP +${10 + item.tier * 6} & DEF +${1 + Math.floor(item.tier / 2)}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        {cost.maxed ? (
                          <span className="text-xs font-mono-tabular text-amber-300">
                            Max Temper (+3)
                          </span>
                        ) : (
                          <span className="text-xs font-mono-tabular text-slate-300">
                            {cost.gold}G · {cost.materials} Shards
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={!canAfford}
                          onClick={() => onUpgrade(item.id)}
                          className={`flex min-h-[44px] items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold transition-colors ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Hammer className="w-3.5 h-3.5" />
                          <span>{cost.maxed ? 'Maxed' : 'Temper'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Potion Supply */}
              <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PixelIcon kind="healPotion" size={28} />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Crimson Health Potion (Owned: {hud.healthPotions})
                    </div>
                    <div className="text-xs text-slate-400">
                      Restores 45% Max HP immediately when pressing [H].
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={hud.gold < 20}
                  onClick={onBuyPotion}
                  className={`min-h-[44px] px-4 py-2 rounded text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    hud.gold >= 20
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Buy · 20 Gold
                </button>
              </div>

              {/* Great Duck Relic Display */}
              <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PixelIcon kind="duckElixir" size={28} />
                  <div>
                    <div className="text-sm font-semibold text-amber-200">
                      The Great Duck’s Potion [Q]
                    </div>
                    <div className="text-xs text-slate-400">
                      {hud.hasDuckElixir
                        ? 'Breaks Fenrir/Vargos 99% Dark Ward, grants +50% All Stats, Golden Aura & HP Regen in ANY Act!'
                        : 'Locked — Seek The Great Duck in Act 40 Lotus Sanctuary.'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono-tabular text-amber-300 whitespace-nowrap">
                  {hud.duckElixirActive ? 'Awakened' : hud.hasDuckElixir ? 'Ready' : 'Locked'}
                </span>
              </div>

              {/* Blacksmith Tier Forge — Craft Weapons, Armor & Tier 30 Omni Relics */}
              <div className="rounded-md border border-amber-500/40 bg-slate-950/80 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Blacksmith Tier Forge — Tier 30 Eternal Omni &amp; Next-Tier Upgrades</span>
                  </div>
                  <span className="text-[11px] font-mono-tabular text-slate-400">
                    {hud.gold.toLocaleString()}G · {hud.materials} Shards · {hud.fishTreats} 🐟
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {forgeChoices.map((gId) => {
                    const base = GEAR_CATALOG[gId];
                    if (!base) return null;
                    const owned = hud.inventory.find((i) => i.id === gId);
                    const equipped = hud.equippedWeapon.id === gId || hud.equippedArmor.id === gId;
                    const isTier30 = base.tier >= 30;
                    const cost = getBlacksmithForgeCost(gId);
                    const t30Req = isTier30
                      ? getTier30CraftRequirements(gId, {
                          inventory: hud.inventory,
                          maxUnlockedAct: hud.maxUnlockedAct,
                          fenrirDefeated: hud.story.fenrirDefeated,
                          level: hud.level,
                          enemiesSlain: hud.stats.enemiesSlain,
                        })
                      : null;
                    const gatesMet = t30Req ? t30Req.canCraft : true;
                    const canAfford =
                      hud.gold >= cost.gold &&
                      hud.materials >= cost.materials &&
                      hud.fishTreats >= cost.fishTreats;

                    return (
                      <div
                        key={gId}
                        className={`rounded-md border p-2.5 flex flex-col gap-2 ${
                          isTier30
                            ? 'border-amber-400/60 bg-gradient-to-r from-amber-500/15 to-rose-500/10 md:col-span-2'
                            : 'border-slate-800 bg-slate-900/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <PixelIcon
                              kind={base.slot === 'weapon' ? 'weapon' : 'armor'}
                              tier={base.tier}
                              size={26}
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">
                                {base.name}
                                {owned && owned.upgradeLevel > 0 ? ` +${owned.upgradeLevel}` : ''}
                              </div>
                              <div className="text-[11px] font-mono-tabular text-slate-400 truncate">
                                <span style={{ color: getTierColor(base.tier) }}>{getTierLabel(base.tier)}</span>
                                {' · '}
                                {base.slot === 'weapon'
                                  ? `+${base.atkBonus} ATK · +${base.critBonus}% Crit`
                                  : `+${base.hpBonus} HP · +${base.defBonus} DEF`}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={equipped || (!owned && (!gatesMet || !canAfford))}
                            onClick={() => onForgeGear(gId)}
                            className={`min-h-[40px] px-3 py-1.5 rounded text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                              equipped
                                ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 cursor-default'
                                : owned
                                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer'
                                : gatesMet && canAfford
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {equipped
                              ? 'Equipped'
                              : owned
                              ? 'Equip'
                              : !gatesMet
                              ? `🔒 Locked (${cost.gold.toLocaleString()}G)`
                              : cost.fishTreats > 0
                              ? `${cost.gold.toLocaleString()}G · ${cost.materials} Shards · ${cost.fishTreats} 🐟`
                              : `${cost.gold.toLocaleString()}G · ${cost.materials} Shards`}
                          </button>
                        </div>

                        {isTier30 && !owned && t30Req && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1.5 border-t border-amber-500/25 text-[10px] font-mono-tabular">
                            {t30Req.gates.map((g, idx) => (
                              <span key={idx} className={g.met ? 'text-emerald-300' : 'text-rose-300'}>
                                {g.met ? '✅' : '🔒'} {g.label}
                              </span>
                            ))}
                            <span className={canAfford ? 'text-emerald-300' : 'text-amber-300'}>
                              {canAfford ? '✅' : '💰'} {cost.gold.toLocaleString()}G · {cost.materials} Shards ·{' '}
                              {cost.fishTreats} 🐟
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                {
                  id: 'voxel_potion' as const,
                  title: 'BlockCraft Voxel Potion Pack (+2)',
                  desc: 'Transmutes 1 Shard + 15 Gold into 2 Crimson Health Potions.',
                  gold: 15,
                  shards: 1,
                  owned: false,
                },
                {
                  id: 'neko_thrusters' as const,
                  title: 'Neko Noir Rooftop Thrusters',
                  desc: 'Permanent +18% Movement Speed across all zones.',
                  gold: 40,
                  shards: 2,
                  owned: hud.alchemyRelics.nekoThrusters,
                },
                {
                  id: 'sea_compass' as const,
                  title: 'Sea Captain’s Starlight Compass',
                  desc: 'Permanent +15% Crit Chance & +25% Gold dropped by enemies.',
                  gold: 50,
                  shards: 2,
                  owned: hud.alchemyRelics.seaCompass,
                },
                {
                  id: 'primal_guardian' as const,
                  title: 'Spinning Primal Sanctuary Guardian',
                  desc: 'Summons an orbiting emerald Guardian totem that zaps nearby foes.',
                  gold: 60,
                  shards: 3,
                  owned: hud.alchemyRelics.primalGuardian,
                },
              ].map((rec) => {
                const canCraft = !rec.owned && hud.gold >= rec.gold && hud.materials >= rec.shards;
                return (
                  <div
                    key={rec.id}
                    className="rounded-md border border-slate-800 bg-slate-950/70 p-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{rec.title}</div>
                        <div className="text-xs text-slate-400">{rec.desc}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!canCraft}
                      onClick={() => onCraftAlchemy(rec.id)}
                      className={`min-h-[44px] px-4 py-2 rounded text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        rec.owned
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : canCraft
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {rec.owned ? 'Active' : `${rec.gold}G · ${rec.shards} Shards`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
