import { BrewedPotionItem, ElementalGemId, GearItem, WeaponMutationId } from './types';

export interface AlchemyIngredientDef {
  id: string;
  name: string;
  biomeSource: string;
  element: 'fire' | 'lightning' | 'frost' | 'nature' | 'void' | 'chrono';
  color: string;
  icon: string;
}

export const ALCHEMY_INGREDIENTS: AlchemyIngredientDef[] = [
  { id: 'ember_ash', name: 'Embercrag Ash', biomeSource: 'Volcanic Biomes', element: 'fire', color: '#f97316', icon: '🔥' },
  { id: 'glow_spore', name: 'Bioluminescent Spore', biomeSource: 'Fungal Grotto', element: 'nature', color: '#2dd4bf', icon: '🍄' },
  { id: 'rime_shard', name: 'Permafrost Shard', biomeSource: 'Frostpeak Caverns', element: 'frost', color: '#38bdf8', icon: '❄️' },
  { id: 'storm_quill', name: 'Tempest Wyvern Quill', biomeSource: 'Sky-Bridges', element: 'lightning', color: '#fde047', icon: '⚡' },
  { id: 'lotus_petal', name: 'Sacred Lotus Petal', biomeSource: 'Duck Sanctuary', element: 'nature', color: '#f472b6', icon: '🪷' },
  { id: 'abyss_ink', name: 'Hadal Kraken Ink', biomeSource: 'Abyssal Trench', element: 'void', color: '#a855f7', icon: '🦑' },
  { id: 'aether_oil', name: 'Clockwork Steam-Oil', biomeSource: 'Sky-Citadels', element: 'fire', color: '#fbbf24', icon: '⚙️' },
  { id: 'chrono_sand', name: 'Horologium Sand', biomeSource: 'Temporal Core', element: 'chrono', color: '#e879f9', icon: '⏳' },
  { id: 'singularity_dust', name: 'Eclipse Star-Dust', biomeSource: 'Void Multiverse', element: 'void', color: '#ec4899', icon: '🌌' },
];

export const BREWABLE_POTION_CATALOG: Record<string, Omit<BrewedPotionItem, 'count'>> = {
  napalm_flask: {
    id: 'napalm_flask',
    name: 'BlockCraft Napalm Oil Flask',
    effectKind: 'napalm_fire',
    power: 180,
    color: '#f97316',
    description: 'Oil + Fire Reaction: Ignites a blazing Napalm pool that burns all enemies & melts armor!',
  },
  electro_stun_vial: {
    id: 'electro_stun_vial',
    name: 'BlockCraft Electro-Shock Vial',
    effectKind: 'electro_stun',
    power: 165,
    color: '#38bdf8',
    description: 'Wet + Lightning Reaction: Chains high-voltage arcs that stun enemies & bosses for 2.5s!',
  },
  cryo_shatter_bomb: {
    id: 'cryo_shatter_bomb',
    name: 'BlockCraft Absolute-Zero Bomb',
    effectKind: 'cryo_shatter',
    power: 210,
    color: '#67e8f9',
    description: 'Frost + Slam Reaction: Freezes enemies solid and shatters them for 3.0x burst damage!',
  },
  lotus_nectar_draught: {
    id: 'lotus_nectar_draught',
    name: 'Sacred Lotus Nectar Draught',
    effectKind: 'healing_lotus',
    power: 250,
    color: '#f472b6',
    description: 'Restores 45% Max HP to you and all Party Companions + cleanses Mortal Wound!',
  },
  void_singularity_orb: {
    id: 'void_singularity_orb',
    name: 'Mini Black-Hole Vortex Flask',
    effectKind: 'void_singularity',
    power: 290,
    color: '#a855f7',
    description: 'Creates a gravitational implosion that pulls enemies together and deals massive Void damage!',
  },
  prism_nova_elixir: {
    id: 'prism_nova_elixir',
    name: 'Omniverse Prismatic Nova Flask',
    effectKind: 'prism_nova',
    power: 420,
    color: '#fde047',
    description: 'Triggers Fire + Frost + Lightning + Void simultaneously in a massive rainbow detonation!',
  },
};

export function createStarterBrewedPotions(): BrewedPotionItem[] {
  return [
    { ...BREWABLE_POTION_CATALOG.napalm_flask, count: 5 },
    { ...BREWABLE_POTION_CATALOG.electro_stun_vial, count: 4 },
    { ...BREWABLE_POTION_CATALOG.cryo_shatter_bomb, count: 4 },
    { ...BREWABLE_POTION_CATALOG.prism_nova_elixir, count: 2 },
  ];
}

export function resolveCauldronRecipe(ing1: string, ing2: string, ing3: string): Omit<BrewedPotionItem, 'count'> {
  const trio = [ing1, ing2, ing3];
  if (trio.includes('singularity_dust') && trio.includes('chrono_sand')) {
    return BREWABLE_POTION_CATALOG.prism_nova_elixir;
  }
  if (trio.includes('abyss_ink') || trio.includes('singularity_dust')) {
    return BREWABLE_POTION_CATALOG.void_singularity_orb;
  }
  if (trio.includes('rime_shard')) {
    return BREWABLE_POTION_CATALOG.cryo_shatter_bomb;
  }
  if (trio.includes('storm_quill')) {
    return BREWABLE_POTION_CATALOG.electro_stun_vial;
  }
  if (trio.includes('lotus_petal') && trio.includes('glow_spore')) {
    return BREWABLE_POTION_CATALOG.lotus_nectar_draught;
  }
  return BREWABLE_POTION_CATALOG.napalm_flask;
}

export const ELEMENTAL_GEMS: Array<{
  id: ElementalGemId;
  name: string;
  bonusText: string;
  atkPct: number;
  critBonus: number;
  color: string;
}> = [
  { id: 'ruby_flame', name: 'Crimson Dragon Ruby', bonusText: '+18% ATK & Solar Burn on hit', atkPct: 0.18, critBonus: 4, color: '#ef4444' },
  { id: 'sapphire_frost', name: 'Hadal Trench Sapphire', bonusText: '+15% ATK & +10% Crit Chance', atkPct: 0.15, critBonus: 10, color: '#38bdf8' },
  { id: 'emerald_venom', name: 'Viperfang Emerald', bonusText: '+16% ATK & Armor-Melting Poison', atkPct: 0.16, critBonus: 6, color: '#10b981' },
  { id: 'topaz_storm', name: 'Chrono-Tesla Topaz', bonusText: '+20% ATK & Chain-Lightning Arcs', atkPct: 0.2, critBonus: 8, color: '#fde047' },
  { id: 'void_onyx', name: 'Aether-Null Singularity Onyx', bonusText: '+30% ATK & +15% Crit Chance', atkPct: 0.3, critBonus: 15, color: '#c084fc' },
];

export const WEAPON_MUTATIONS: Record<
  WeaponMutationId,
  { label: string; mult: number; badgeClass: string; desc: string }
> = {
  none: {
    label: 'Standard',
    mult: 1.0,
    badgeClass: 'border-slate-700 text-slate-400',
    desc: 'Standard forged armaments.',
  },
  gargantuan: {
    label: 'GARGANTUAN (+35% STATS)',
    mult: 1.35,
    badgeClass: 'border-amber-400 bg-amber-500/20 text-amber-200',
    desc: 'Colossal blade size & +35% multiplied base stats!',
  },
  prism: {
    label: 'PRISM AWAKENED (+75% STATS)',
    mult: 1.75,
    badgeClass: 'border-cyan-300 bg-cyan-500/25 text-cyan-100',
    desc: 'Refracts rainbow sword-beams & +75% multiplied base stats!',
  },
  primordial: {
    label: '★ PRIMORDIAL OMNIVERSE (+150% STATS)',
    mult: 2.5,
    badgeClass: 'border-fuchsia-400 bg-gradient-to-r from-amber-500/30 via-fuchsia-500/30 to-cyan-500/30 text-yellow-200',
    desc: 'Mythic 0.02% Cosmological Mutation: +150% multiplied base stats!',
  },
};

export function rollWeaponMutation(guaranteedHigh = false): WeaponMutationId {
  const r = Math.random();
  if (guaranteedHigh || r < 0.15) return 'primordial';
  if (r < 0.48) return 'prism';
  return 'gargantuan';
}

export function computeGearEffectiveStats(item: GearItem): {
  atk: number;
  def: number;
  hp: number;
  crit: number;
} {
  const mutMult = WEAPON_MUTATIONS[item.mutation ?? 'none']?.mult ?? 1;
  const gem = ELEMENTAL_GEMS.find((g) => g.id === item.socketedGem);
  const gemAtkMult = 1 + (gem?.atkPct ?? 0);
  const gemCrit = gem?.critBonus ?? 0;
  // Supports Star-Up Anvil levels from +0 up to +25★
  const starScale = 1 + item.upgradeLevel * 0.14;

  return {
    atk: Math.round(item.atkBonus * starScale * mutMult * gemAtkMult),
    def: Math.round(item.defBonus * starScale * mutMult),
    hp: Math.round(item.hpBonus * starScale * mutMult),
    crit: Math.min(100, item.critBonus + gemCrit + Math.floor(item.upgradeLevel / 3)),
  };
}
