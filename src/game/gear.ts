import { GearItem, GearTier } from './types';

export const GEAR_CATALOG: Record<string, Omit<GearItem, 'upgradeLevel'>> = {
  // TIER 1: Iron (Act 1 Starter)
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    slot: 'weapon',
    tier: 1,
    atkBonus: 6,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 5,
    description: 'Nyx’s trusty squire blade issued at the Shattered Citadel Gates.',
  },
  iron_armor: {
    id: 'iron_armor',
    name: 'Iron Armor',
    slot: 'armor',
    tier: 1,
    atkBonus: 0,
    defBonus: 2,
    hpBonus: 15,
    critBonus: 0,
    description: 'Starter iron plate worn under Nyx’s crooked starry wizard mantle.',
  },

  // TIER 2: Bronze-Claw (Biome 1)
  bronze_claw: {
    id: 'bronze_claw',
    name: 'Bronze-Claw Sabre',
    slot: 'weapon',
    tier: 2,
    atkBonus: 12,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 8,
    description: 'Warm bronze-forged paw blade tempered in the Whispering Woods.',
  },
  bronze_armor: {
    id: 'bronze_armor',
    name: 'Bronze Scout Vest',
    slot: 'armor',
    tier: 2,
    atkBonus: 0,
    defBonus: 4,
    hpBonus: 35,
    critBonus: 0,
    description: 'Light bronze links reinforced with goblin-camp leather.',
  },

  // TIER 3: Steel Battlemage (Biome 2)
  steel_claws: {
    id: 'steel_claws',
    name: 'Steel Battlemage Blade',
    slot: 'weapon',
    tier: 3,
    atkBonus: 19,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 11,
    description: 'Balanced high-carbon steel edged with glowing arcane runes.',
  },
  steel_plate: {
    id: 'steel_plate',
    name: 'Steel Battlemage Mail',
    slot: 'armor',
    tier: 3,
    atkBonus: 0,
    defBonus: 7,
    hpBonus: 65,
    critBonus: 0,
    description: 'Polished steel plate paired with a sapphire wizard sash.',
  },

  // TIER 4: Silver-Moon (Biome 3)
  silver_moon_blade: {
    id: 'silver_moon_blade',
    name: 'Silver-Moon Crescent',
    slot: 'weapon',
    tier: 4,
    atkBonus: 27,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 14,
    description: 'Luminous silver blade forged to slice fungal toxins and shadow hounds.',
  },
  silver_moon_armor: {
    id: 'silver_moon_armor',
    name: 'Silver-Moon Robes',
    slot: 'armor',
    tier: 4,
    atkBonus: 0,
    defBonus: 10,
    hpBonus: 100,
    critBonus: 0,
    description: 'Bioluminescent silverweave cloak shimmering with spore wards.',
  },

  // TIER 5: Mithril Spell-Knight (Biome 4)
  mithril_fang: {
    id: 'mithril_fang',
    name: 'Mithril Spell-Knight Fang',
    slot: 'weapon',
    tier: 5,
    atkBonus: 36,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 18,
    description: 'Featherweight mithril edge singing with autumn wind magic.',
  },
  mithril_armor: {
    id: 'mithril_armor',
    name: 'Mithril Spell-Knight Plate',
    slot: 'armor',
    tier: 5,
    atkBonus: 0,
    defBonus: 14,
    hpBonus: 145,
    critBonus: 0,
    description: 'Gleaming mithril mail worn by elite Felis Spell-Knights.',
  },

  // TIER 6: Frost-Rune Platinum (Biome 5)
  frost_platinum_blade: {
    id: 'frost_platinum_blade',
    name: 'Frost-Rune Platinum Edge',
    slot: 'weapon',
    tier: 6,
    atkBonus: 46,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 21,
    description: 'Glacial platinum blade etched with eternal blizzard sigils.',
  },
  frost_platinum_armor: {
    id: 'frost_platinum_armor',
    name: 'Frost-Rune Platinum Guard',
    slot: 'armor',
    tier: 6,
    atkBonus: 0,
    defBonus: 18,
    hpBonus: 195,
    critBonus: 0,
    description: 'Cryo-infused platinum mail that blunts mammoth-scale impacts.',
  },

  // TIER 7: Obsidian Dragon-Claw (Biome 6)
  obsidian_dragon_blade: {
    id: 'obsidian_dragon_blade',
    name: 'Obsidian Dragon-Claw',
    slot: 'weapon',
    tier: 7,
    atkBonus: 58,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 24,
    description: 'Volcanic glass saber quenched in Caldera embers.',
  },
  obsidian_dragon_armor: {
    id: 'obsidian_dragon_armor',
    name: 'Obsidian Dragon-Scale Mail',
    slot: 'armor',
    tier: 7,
    atkBonus: 0,
    defBonus: 23,
    hpBonus: 255,
    critBonus: 0,
    description: 'Heat-forged obsidian scales immune to scorching brimstone sparks.',
  },

  // TIER 8: Void-Forged Arcane (Biome 7)
  void_arcane_blade: {
    id: 'void_arcane_blade',
    name: 'Void-Forged Arcane Sabre',
    slot: 'weapon',
    tier: 8,
    atkBonus: 72,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 28,
    swordBeam: true,
    description: 'Abyssal arcane blade projecting void-star sword beams on every 3rd hit!',
  },
  void_arcane_armor: {
    id: 'void_arcane_armor',
    name: 'Void-Forged Archon Coat',
    slot: 'armor',
    tier: 8,
    atkBonus: 0,
    defBonus: 29,
    hpBonus: 325,
    critBonus: 0,
    description: 'Dark violet mantle woven in the Sunken Temple depths.',
  },

  // TIER 9: Celestial (Biome 8)
  celestial_blade: {
    id: 'celestial_blade',
    name: 'Celestial Star-Claw',
    slot: 'weapon',
    tier: 9,
    atkBonus: 88,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 32,
    swordBeam: true,
    description: 'Starlit bamboo-temple relic firing radiant crescent beams.',
  },
  celestial_armor: {
    id: 'celestial_armor',
    name: 'Celestial Astral Mantle',
    slot: 'armor',
    tier: 9,
    atkBonus: 0,
    defBonus: 35,
    hpBonus: 400,
    critBonus: 0,
    description: 'Featherlight celestial robe blessed by Lotus Guardians.',
  },

  // TIER 10: Sun-Forged Lionheart & Royal Archmage (Act 40 Sanctuary Chest / Boss Rush)
  lionheart_blade: {
    id: 'lionheart_blade',
    name: 'Sun-Forged Lionheart Blade',
    slot: 'weapon',
    tier: 10,
    atkBonus: 112,
    defBonus: 0,
    hpBonus: 0,
    critBonus: 38,
    swordBeam: true,
    description: 'Peak Tier 10 Royal Relic. Unleashes blazing Starlight Paw-Beams on every 3rd slash!',
  },
  royal_felis_armor: {
    id: 'royal_felis_armor',
    name: 'Royal Archmage Armor',
    slot: 'armor',
    tier: 10,
    atkBonus: 6,
    defBonus: 44,
    hpBonus: 500,
    critBonus: 5,
    description: 'Legendary gold-and-emerald regalia of the Cat Kingdom’s Grand Archmage-Paladin.',
  },

  // TIER 11: MYTHIC QUACK-GOD & SOVEREIGN (Act 41 Boss Clear & Nightmare NG+ Gear)
  quack_god_excalibur: {
    id: 'quack_god_excalibur',
    name: 'Excaliquack: Astral Duck-God Greatsword',
    slot: 'weapon',
    tier: 11,
    atkBonus: 195,
    defBonus: 15,
    hpBonus: 150,
    critBonus: 42,
    swordBeam: true,
    description:
      'Mythic Sword forged from The Great Duck’s Golden Feather & King Leo’s Starlight Gem. Fires Astral Quack-Beams!',
  },
  sovereign_duck_aegis: {
    id: 'sovereign_duck_aegis',
    name: 'Sovereign Quack-Lion Aegis Regalia',
    slot: 'armor',
    tier: 11,
    atkBonus: 25,
    defBonus: 70,
    hpBonus: 950,
    critBonus: 15,
    description:
      'Divine golden-wing & lion-crown plate blessed for Nightmare NG+ and the War of Two Kingdoms.',
  },

  // TIER 20: PRIMORDIAL LIONHEART-ARCHMAGE (Act 81 Supreme War Council Exclusive!)
  primordial_starlight_excalibur: {
    id: 'primordial_starlight_excalibur',
    name: 'Primordial Starlight-Quack Excalibur',
    slot: 'weapon',
    tier: 20,
    atkBonus: 250,
    defBonus: 20,
    hpBonus: 250,
    critBonus: 45,
    swordBeam: true,
    description:
      'Tier 20 Supreme War Council Relic! Fused by King Leo & The Great Duck. Unleashes Triple Rainbow Sword-Beams on 3rd combo hit!',
  },
  primordial_crown_mantle: {
    id: 'primordial_crown_mantle',
    name: 'Primordial Crown-General Mantle',
    slot: 'armor',
    tier: 20,
    atkBonus: 40,
    defBonus: 80,
    hpBonus: 1500,
    critBonus: 20,
    description:
      'Tier 20 Grand Archmage-General Regalia! Grants +1,500 Max HP & +80 DEF for the Act 82 Obsidian Colosseum Finale.',
  },

  // TIER 21: Drake-Scale (Acts 83–87)
  drake_scale_blade: {
    id: 'drake_scale_blade',
    name: 'Drake-Scale Cleaver',
    slot: 'weapon',
    tier: 21,
    atkBonus: 295,
    defBonus: 20,
    hpBonus: 250,
    critBonus: 46,
    swordBeam: true,
    description: 'Tempered in the Scorched Peace Courtyard to pierce wyvern scales.',
  },
  drake_scale_armor: {
    id: 'drake_scale_armor',
    name: 'Drake-Scale Brigandine',
    slot: 'armor',
    tier: 21,
    atkBonus: 45,
    defBonus: 92,
    hpBonus: 1700,
    critBonus: 20,
    description: 'Heat-shielded drake hide worn by frontline Cat & Dog vanguard.',
  },

  // TIER 22: Ember-Wyvern (Acts 86–87 Boss Drop)
  ember_wyvern_blade: {
    id: 'ember_wyvern_blade',
    name: 'Ember-Wyvern Siege-Sabre',
    slot: 'weapon',
    tier: 22,
    atkBonus: 340,
    defBonus: 24,
    hpBonus: 300,
    critBonus: 48,
    swordBeam: true,
    description: 'Siege-breaker sabre forged from Vermithrax’s molten armor plates.',
  },
  ember_wyvern_armor: {
    id: 'ember_wyvern_armor',
    name: 'Ember-Wyvern Siege-Plate',
    slot: 'armor',
    tier: 22,
    atkBonus: 55,
    defBonus: 102,
    hpBonus: 1850,
    critBonus: 22,
    description: 'Heavy cinder-plated armor built to survive wyvern breath.',
  },

  // TIER 23: Wyrm-Fang Gold (Acts 88–92)
  wyrm_fang_blade: {
    id: 'wyrm_fang_blade',
    name: 'Wyrm-Fang Aurum Claymore',
    slot: 'weapon',
    tier: 23,
    atkBonus: 390,
    defBonus: 28,
    hpBonus: 350,
    critBonus: 50,
    swordBeam: true,
    description: 'Gilded dragon-fang blade humming with molten hoard energy.',
  },
  wyrm_fang_armor: {
    id: 'wyrm_fang_armor',
    name: 'Wyrm-Fang Molten Mail',
    slot: 'armor',
    tier: 23,
    atkBonus: 65,
    defBonus: 112,
    hpBonus: 2000,
    critBonus: 24,
    description: 'Liquid-gold dragonmail forged in the Ashen Gold-Vault Caverns.',
  },

  // TIER 24: Tempest-Claw Storm (Acts 93–97)
  tempest_claw_blade: {
    id: 'tempest_claw_blade',
    name: 'Tempest-Claw Thunderbrand',
    slot: 'weapon',
    tier: 24,
    atkBonus: 445,
    defBonus: 32,
    hpBonus: 400,
    critBonus: 51,
    swordBeam: true,
    description: 'Crackling sky-steel blade that arcs storm lightning on every swing.',
  },
  tempest_claw_armor: {
    id: 'tempest_claw_armor',
    name: 'Tempest-Claw Gale Aegis',
    slot: 'armor',
    tier: 24,
    atkBonus: 75,
    defBonus: 120,
    hpBonus: 2150,
    critBonus: 25,
    description: 'Storm-warded sky-bridge cloak blessed by thunder drakes.',
  },

  // TIER 25: Frost-Wyrm Permafrost (Acts 98–102)
  frost_wyrm_blade: {
    id: 'frost_wyrm_blade',
    name: 'Frost-Wyrm Absolute Edge',
    slot: 'weapon',
    tier: 25,
    atkBonus: 500,
    defBonus: 36,
    hpBonus: 450,
    critBonus: 52,
    swordBeam: true,
    description: 'Zero-kelvin dragonbone greatsword frozen with necro-glacial runes.',
  },
  frost_wyrm_armor: {
    id: 'frost_wyrm_armor',
    name: 'Frost-Wyrm Permafrost Guard',
    slot: 'armor',
    tier: 25,
    atkBonus: 85,
    defBonus: 128,
    hpBonus: 2300,
    critBonus: 26,
    description: 'Crystalized frost-wyrm carapace impervious to glacial breath.',
  },

  // TIER 26: Emerald-Viper Hydra (Acts 103–107)
  emerald_viper_blade: {
    id: 'emerald_viper_blade',
    name: 'Emerald-Viper Hydra Fang',
    slot: 'weapon',
    tier: 26,
    atkBonus: 560,
    defBonus: 40,
    hpBonus: 500,
    critBonus: 54,
    swordBeam: true,
    description: 'Venom-etched five-headed hydra blade glowing with emerald fire.',
  },
  emerald_viper_armor: {
    id: 'emerald_viper_armor',
    name: 'Emerald-Viper Hydra Vest',
    slot: 'armor',
    tier: 26,
    atkBonus: 95,
    defBonus: 136,
    hpBonus: 2450,
    critBonus: 27,
    description: 'Acid-proof hydra scale mantle woven in the Caldera depths.',
  },

  // TIER 27: Star-Draconic Astral (Acts 108–112)
  star_draconic_blade: {
    id: 'star_draconic_blade',
    name: 'Star-Draconic Nebula Sabre',
    slot: 'weapon',
    tier: 27,
    atkBonus: 625,
    defBonus: 45,
    hpBonus: 550,
    critBonus: 56,
    swordBeam: true,
    description: 'Forged from fallen stars in the Astral Dragon Forge.',
  },
  star_draconic_armor: {
    id: 'star_draconic_armor',
    name: 'Star-Draconic Cosmic Coat',
    slot: 'armor',
    tier: 27,
    atkBonus: 105,
    defBonus: 144,
    hpBonus: 2600,
    critBonus: 28,
    description: 'Nebula-weave armor shimmering with constellation barriers.',
  },

  // TIER 28: Abyssal Dragon-Slayer (Acts 113–115)
  abyssal_slayer_blade: {
    id: 'abyssal_slayer_blade',
    name: 'Abyssal Dragon-Slayer Pike',
    slot: 'weapon',
    tier: 28,
    atkBonus: 690,
    defBonus: 50,
    hpBonus: 600,
    critBonus: 57,
    swordBeam: true,
    description: 'Dread-forged anti-dragon blade claimed in the Magma Sanctum.',
  },
  abyssal_slayer_armor: {
    id: 'abyssal_slayer_armor',
    name: 'Abyssal Citadel Plate',
    slot: 'armor',
    tier: 28,
    atkBonus: 115,
    defBonus: 150,
    hpBonus: 2750,
    critBonus: 29,
    description: 'Volcanic abyssal armor worn inside the Dragon Citadel.',
  },

  // TIER 29: Dragon-God Slayer (Acts 116–120)
  dragon_god_slayer_blade: {
    id: 'dragon_god_slayer_blade',
    name: 'Dragon-God Eclipse Greatsword',
    slot: 'weapon',
    tier: 29,
    atkBonus: 745,
    defBonus: 55,
    hpBonus: 650,
    critBonus: 58,
    swordBeam: true,
    description: 'Twin-eclipse dragonbane sword forged from Sol & Luna scales.',
  },
  dragon_god_slayer_armor: {
    id: 'dragon_god_slayer_armor',
    name: 'Dragon-God Eclipse Regalia',
    slot: 'armor',
    tier: 29,
    atkBonus: 125,
    defBonus: 155,
    hpBonus: 2880,
    critBonus: 30,
    description: 'Solar-and-lunar dragonplate built for the Sky-Throne ascent.',
  },

  // TIER 30: ETERNAL DRAGON-SLAYER OMNI (Act 121 United Sanctum Ultimate!)
  eternal_omni_blade: {
    id: 'eternal_omni_blade',
    name: 'Eternal Dragon-Slayer Omni-Blade',
    slot: 'weapon',
    tier: 30,
    atkBonus: 800,
    defBonus: 65,
    hpBonus: 750,
    critBonus: 60,
    swordBeam: true,
    description:
      'Tier 30 Pinnacle Relic! Forged by King Leo, Wolf-King Fenrir & The Great Duck. Fires Quadruple Dragon-Slayer Beams!',
  },
  eternal_omni_mantle: {
    id: 'eternal_omni_mantle',
    name: 'Eternal Omni-Crown Mantle',
    slot: 'armor',
    tier: 30,
    atkBonus: 140,
    defBonus: 160,
    hpBonus: 3000,
    critBonus: 35,
    description:
      'Tier 30 United Kingdom Crown Regalia! Grants +3,000 Max HP & +160 DEF for the Act 122 World-Breaker Bahamut Finale.',
  },
};

export const WEAPON_TIERS: string[] = [
  'iron_sword',
  'bronze_claw',
  'steel_claws',
  'silver_moon_blade',
  'mithril_fang',
  'frost_platinum_blade',
  'obsidian_dragon_blade',
  'void_arcane_blade',
  'celestial_blade',
  'lionheart_blade',
  'quack_god_excalibur',
  'primordial_starlight_excalibur',
  'drake_scale_blade',
  'ember_wyvern_blade',
  'wyrm_fang_blade',
  'tempest_claw_blade',
  'frost_wyrm_blade',
  'emerald_viper_blade',
  'star_draconic_blade',
  'abyssal_slayer_blade',
  'dragon_god_slayer_blade',
  'eternal_omni_blade',
];

export const ARMOR_TIERS: string[] = [
  'iron_armor',
  'bronze_armor',
  'steel_plate',
  'silver_moon_armor',
  'mithril_armor',
  'frost_platinum_armor',
  'obsidian_dragon_armor',
  'void_arcane_armor',
  'celestial_armor',
  'royal_felis_armor',
  'sovereign_duck_aegis',
  'primordial_crown_mantle',
  'drake_scale_armor',
  'ember_wyvern_armor',
  'wyrm_fang_armor',
  'tempest_claw_armor',
  'frost_wyrm_armor',
  'emerald_viper_armor',
  'star_draconic_armor',
  'abyssal_slayer_armor',
  'dragon_god_slayer_armor',
  'eternal_omni_mantle',
];

export function createGearInstance(id: string, upgradeLevel = 0): GearItem {
  const base = GEAR_CATALOG[id] ?? GEAR_CATALOG.iron_sword;
  return {
    ...base,
    upgradeLevel,
  };
}

export function getEffectiveGearStats(item: GearItem) {
  const lvl = item.upgradeLevel;
  if (item.slot === 'weapon') {
    return {
      atk: item.atkBonus + lvl * (3 + item.tier * 2),
      def: item.defBonus,
      hp: item.hpBonus,
      crit: item.critBonus + lvl * 2,
    };
  }
  return {
    atk: item.atkBonus,
    def: item.defBonus + lvl * (1 + Math.floor(item.tier / 2)),
    hp: item.hpBonus + lvl * (10 + item.tier * 6),
    crit: item.critBonus,
  };
}

export function getUpgradeCost(item: GearItem): { gold: number; materials: number; maxed: boolean } {
  if (item.upgradeLevel >= 3) {
    return { gold: 0, materials: 0, maxed: true };
  }
  const next = item.upgradeLevel + 1;
  return {
    gold: 20 * item.tier * next,
    materials: Math.max(1, Math.ceil(item.tier / 2) + next - 1),
    maxed: false,
  };
}

export interface ForgeCost {
  gold: number;
  materials: number;
  fishTreats: number;
}

export interface Tier30CraftGate {
  met: boolean;
  label: string;
}

export function getBlacksmithForgeCost(gearId: string): ForgeCost {
  const item = GEAR_CATALOG[gearId];
  if (!item) return { gold: 50, materials: 1, fishTreats: 0 };
  if (item.tier >= 30) {
    return { gold: 25000, materials: 120, fishTreats: 40 };
  }
  return {
    gold: Math.max(30, item.tier * 35),
    materials: Math.max(1, Math.ceil(item.tier / 3)),
    fishTreats: 0,
  };
}

export function getTier30CraftRequirements(
  gearId: string,
  params: {
    inventory: GearItem[];
    maxUnlockedAct: number;
    fenrirDefeated: boolean;
    level: number;
    enemiesSlain: number;
  }
): { canCraft: boolean; gates: Tier30CraftGate[] } {
  const reqBaseId =
    gearId === 'eternal_omni_blade' ? 'dragon_god_slayer_blade' : 'dragon_god_slayer_armor';
  const reqBaseName = GEAR_CATALOG[reqBaseId]?.name ?? 'Tier 29 Dragon-God Gear';
  const baseOwned = params.inventory.find((i) => i.id === reqBaseId);
  const hasMaxedT29 = Boolean(baseOwned && baseOwned.upgradeLevel >= 3);
  const warCleared = Boolean(params.fenrirDefeated && params.maxUnlockedAct >= 83);
  const veteranRank = params.level >= 20 && params.enemiesSlain >= 250;

  const gates: Tier30CraftGate[] = [
    {
      met: hasMaxedT29,
      label: `Own ${reqBaseName} +3 MAX`,
    },
    {
      met: warCleared,
      label: 'Defeat Act 82 War-Emperor (Unlock Dragon Arc III)',
    },
    {
      met: veteranRank,
      label: `Lv.20+ (${params.level}/20) & 250 Slain (${params.enemiesSlain}/250)`,
    },
  ];
  return {
    canCraft: gates.every((g) => g.met),
    gates,
  };
}

export function getTierColor(tier: GearTier | number): string {
  switch (tier) {
    case 1:
      return '#94a3b8';
    case 2:
      return '#d97706';
    case 3:
      return '#38bdf8';
    case 4:
      return '#e2e8f0';
    case 5:
      return '#818cf8';
    case 6:
      return '#67e8f9';
    case 7:
      return '#f97316';
    case 8:
      return '#c084fc';
    case 9:
      return '#fde047';
    case 10:
      return '#34d399';
    case 11:
      return '#fb7185';
    case 20:
      return '#facc15';
    case 21:
      return '#fb923c';
    case 22:
      return '#f97316';
    case 23:
      return '#eab308';
    case 24:
      return '#38bdf8';
    case 25:
      return '#67e8f9';
    case 26:
      return '#4ade80';
    case 27:
      return '#c084fc';
    case 28:
      return '#f43f5e';
    case 29:
      return '#fbbf24';
    case 30:
      return '#fde047';
    default:
      return '#94a3b8';
  }
}

export function getTierLabel(tier: GearTier | number): string {
  switch (tier) {
    case 1:
      return 'T1 Iron';
    case 2:
      return 'T2 Bronze';
    case 3:
      return 'T3 Steel';
    case 4:
      return 'T4 Silver';
    case 5:
      return 'T5 Mithril';
    case 6:
      return 'T6 Frost';
    case 7:
      return 'T7 Obsidian';
    case 8:
      return 'T8 Void';
    case 9:
      return 'T9 Celestial';
    case 10:
      return 'T10 Royal';
    case 11:
      return 'T11 MYTHIC';
    case 20:
      return 'T20 PRIMORDIAL';
    case 21:
      return 'T21 Drake-Scale';
    case 22:
      return 'T22 Ember-Wyvern';
    case 23:
      return 'T23 Wyrm-Fang';
    case 24:
      return 'T24 Tempest-Claw';
    case 25:
      return 'T25 Frost-Wyrm';
    case 26:
      return 'T26 Emerald-Viper';
    case 27:
      return 'T27 Star-Draconic';
    case 28:
      return 'T28 Abyssal-Slayer';
    case 29:
      return 'T29 Dragon-God';
    case 30:
      return 'T30 ETERNAL OMNI';
    default:
      return 'Common';
  }
}
