export type ConstellationPathId = 'blade_cat' | 'alchemist' | 'war_commander' | 'great_duck';

export interface SkillNodeDef {
  id: string;
  path: ConstellationPathId;
  tier: number; // 1..15
  name: string;
  description: string;
  cost: number; // Star Points
  icon: string;
  x: number; // 0..100% layout coordinate in constellation canvas
  y: number;
  prereqId?: string;
}

export const CONSTELLATION_PATHS: Array<{
  id: ConstellationPathId;
  name: string;
  subtitle: string;
  color: string;
  badge: string;
}> = [
  {
    id: 'blade_cat',
    name: 'Path of the Blade-Cat',
    subtitle: '4th-Hit Tornado Finisher, Triple Sword-Beams & Lethal Backstabs',
    color: '#38bdf8',
    badge: '⚔️ BLADE',
  },
  {
    id: 'alchemist',
    name: 'Path of the Alchemist (BlockCraft)',
    subtitle: 'Elemental Chain-Reaction Puddles, Double Potion Toss & Cauldron Novas',
    color: '#10b981',
    badge: '🧪 ALCHEMY',
  },
  {
    id: 'war_commander',
    name: 'Path of the War-Commander',
    subtitle: '+4 Max Squad Size, Banner Auto-Heal, Ballista Auto-Reload & Party Buffs',
    color: '#f59e0b',
    badge: '🚩 COMMAND',
  },
  {
    id: 'great_duck',
    name: 'Path of the Great Duck',
    subtitle: '+15s Elixir Duration, Feather Magnet & 100% HP Golden Feather Auto-Revive',
    color: '#fde047',
    badge: '🦆 ASTRAL DUCK',
  },
];

export const SKILL_TREE_NODES: SkillNodeDef[] = [
  // ==========================================================================
  // PATH 1: PATH OF THE BLADE-CAT (15 Nodes: blade_1 .. blade_15)
  // ==========================================================================
  { id: 'blade_1', path: 'blade_cat', tier: 1, name: 'Razor Claw Discipline', description: '+12% Base Melee Attack Damage.', cost: 1, icon: '⚔️', x: 14, y: 18 },
  { id: 'blade_2', path: 'blade_cat', tier: 2, name: 'Predator Eye', description: '+8% Critical Hit Chance on all slashes.', cost: 1, icon: '👁️', x: 24, y: 14, prereqId: 'blade_1' },
  { id: 'blade_3', path: 'blade_cat', tier: 3, name: '4th-Hit Tornado Finisher', description: 'Unlocks a 4th combo spin-slash that launches a 360° Razor Whirlwind!', cost: 2, icon: '🌪️', x: 34, y: 20, prereqId: 'blade_2' },
  { id: 'blade_4', path: 'blade_cat', tier: 4, name: 'Serrated Bleed Claws', description: 'Critical hits rend enemies for +25% bonus bleed damage.', cost: 1, icon: '🩸', x: 44, y: 15, prereqId: 'blade_3' },
  { id: 'blade_5', path: 'blade_cat', tier: 5, name: 'Shadow-Step Reflex', description: '-20% Dodge Roll cooldown and +0.08s invulnerability frame window.', cost: 2, icon: '💨', x: 54, y: 22, prereqId: 'blade_4' },
  { id: 'blade_6', path: 'blade_cat', tier: 6, name: 'Lethal Backstab Mastery', description: '+50% Backstab Critical Multiplier when striking bosses from behind.', cost: 2, icon: '🗡️', x: 64, y: 16, prereqId: 'blade_5' },
  { id: 'blade_7', path: 'blade_cat', tier: 7, name: 'Twin Crescent Beams', description: 'Sword-Beam weapons fire 2 parallel crescent waves.', cost: 2, icon: '🌙', x: 74, y: 22, prereqId: 'blade_6' },
  { id: 'blade_8', path: 'blade_cat', tier: 8, name: 'Armor-Piercing Fang', description: 'Attacks ignore 30% of enemy armor and boss damage resistance.', cost: 2, icon: '🔨', x: 84, y: 16, prereqId: 'blade_7' },
  { id: 'blade_9', path: 'blade_cat', tier: 9, name: 'Stamina Pounce', description: 'Gain +1 Maximum Stamina Paw-Pip.', cost: 2, icon: '🐾', x: 78, y: 32, prereqId: 'blade_8' },
  { id: 'blade_10', path: 'blade_cat', tier: 10, name: 'Triple Sword-Beams', description: 'Upgrades Sword-Beam attacks to unleash a 3-way Astral Fan!', cost: 3, icon: '🔱', x: 66, y: 36, prereqId: 'blade_9' },
  { id: 'blade_11', path: 'blade_cat', tier: 11, name: 'Vampiric Whiskers', description: 'Restore 3% of melee damage dealt as HP.', cost: 2, icon: '❤️', x: 54, y: 34, prereqId: 'blade_10' },
  { id: 'blade_12', path: 'blade_cat', tier: 12, name: 'Giant-Slayer Momentum', description: '+30% Stagger damage against Regional and Final Bosses.', cost: 2, icon: '⚡', x: 42, y: 38, prereqId: 'blade_11' },
  { id: 'blade_13', path: 'blade_cat', tier: 13, name: 'Lightspeed Flurry', description: '+22% Attack Speed across all 4 Playable Heroes.', cost: 3, icon: '✨', x: 30, y: 34, prereqId: 'blade_12' },
  { id: 'blade_14', path: 'blade_cat', tier: 14, name: 'Executioner’s Crown', description: 'Deal +40% damage to bosses below 35% HP.', cost: 3, icon: '👑', x: 18, y: 38, prereqId: 'blade_13' },
  { id: 'blade_15', path: 'blade_cat', tier: 15, name: 'Celestial Sword-God Avatar', description: 'ULTIMATE NODE: +35% Total ATK, +15% Crit, and Sword-Beams pierce all targets!', cost: 4, icon: '🌟', x: 10, y: 28, prereqId: 'blade_14' },

  // ==========================================================================
  // PATH 2: PATH OF THE ALCHEMIST (BLOCKCRAFT) (15 Nodes: alch_1 .. alch_15)
  // ==========================================================================
  { id: 'alch_1', path: 'alchemist', tier: 1, name: 'Herbalist Distiller', description: 'Health Potions [H] restore +25% more HP.', cost: 1, icon: '🧪', x: 14, y: 54 },
  { id: 'alch_2', path: 'alchemist', tier: 2, name: 'Volatile Flask Toss', description: '+25% explosion radius and damage on BlockCraft Potions [F].', cost: 1, icon: '💣', x: 24, y: 50, prereqId: 'alch_1' },
  { id: 'alch_3', path: 'alchemist', tier: 3, name: 'Electro-Stun Reaction', description: 'Wet + Lightning puddles chain-react to stun enemies for 2.5s!', cost: 2, icon: '⚡', x: 34, y: 56, prereqId: 'alch_2' },
  { id: 'alch_4', path: 'alchemist', tier: 4, name: 'Napalm Oil Ignition', description: 'Oil + Fire puddles ignite into lingering Napalm pools (+60% burn DPS).', cost: 2, icon: '🔥', x: 44, y: 50, prereqId: 'alch_3' },
  { id: 'alch_5', path: 'alchemist', tier: 5, name: 'Cryo-Shatter Detonation', description: 'Frost + Heavy Slam shatters frozen foes for 3.0x burst damage!', cost: 2, icon: '❄️', x: 54, y: 56, prereqId: 'alch_4' },
  { id: 'alch_6', path: 'alchemist', tier: 6, name: 'Bottomless Satchel', description: '25% chance not to consume a BlockCraft Potion when thrown [F].', cost: 2, icon: '🎒', x: 64, y: 50, prereqId: 'alch_5' },
  { id: 'alch_7', path: 'alchemist', tier: 7, name: 'Double Potion Throw', description: 'Pressing [F] hurls TWO alchemical flasks simultaneously!', cost: 3, icon: '⚗️', x: 74, y: 56, prereqId: 'alch_6' },
  { id: 'alch_8', path: 'alchemist', tier: 8, name: 'Mortal Wound Purge', description: 'Drinking a Health Potion cleanses 50% of remaining Mortal Wound duration.', cost: 2, icon: '💖', x: 84, y: 50, prereqId: 'alch_7' },
  { id: 'alch_9', path: 'alchemist', tier: 9, name: 'Transmutation Greed', description: 'Enemies killed inside alchemical explosions drop +35% Gold & Materials.', cost: 2, icon: '🪙', x: 78, y: 66, prereqId: 'alch_8' },
  { id: 'alch_10', path: 'alchemist', tier: 10, name: 'Cauldron Explosion Nova', description: 'Dodging drops a mini volatile alchemy vial that blasts pursuers.', cost: 3, icon: '💥', x: 66, y: 70, prereqId: 'alch_9' },
  { id: 'alch_11', path: 'alchemist', tier: 11, name: 'Acidic Armor Melt', description: 'Alchemy potions permanently shred target defense by 25%.', cost: 2, icon: '☠️', x: 54, y: 68, prereqId: 'alch_10' },
  { id: 'alch_12', path: 'alchemist', tier: 12, name: 'Brewmaster’s Catalyst', description: 'Brewing in the Capital Cauldron produces +2 bonus flasks per batch.', cost: 2, icon: '🔮', x: 42, y: 72, prereqId: 'alch_11' },
  { id: 'alch_13', path: 'alchemist', tier: 13, name: 'Quick-Draw Bandolier', description: '-40% cooldown on BlockCraft Potion Toss [F].', cost: 2, icon: '⏱️', x: 30, y: 68, prereqId: 'alch_12' },
  { id: 'alch_14', path: 'alchemist', tier: 14, name: 'Philosopher’s Carapace', description: '+25% Max HP and +20% Elemental Trap Resistance.', cost: 3, icon: '🛡️', x: 18, y: 72, prereqId: 'alch_13' },
  { id: 'alch_15', path: 'alchemist', tier: 15, name: 'Grand BlockCraft Savant', description: 'ULTIMATE NODE: All [F] Potions trigger Triple-Elemental Prismatic Novas!', cost: 4, icon: '🌈', x: 10, y: 62, prereqId: 'alch_14' },

  // ==========================================================================
  // PATH 3: PATH OF THE WAR-COMMANDER (15 Nodes: cmd_1 .. cmd_15)
  // ==========================================================================
  { id: 'cmd_1', path: 'war_commander', tier: 1, name: 'Vanguard Recruitment', description: '+1 Allied Cat/Dog Soldier spawned in every Act.', cost: 1, icon: '🐱', x: 14, y: 82 },
  { id: 'cmd_2', path: 'war_commander', tier: 2, name: 'Tempered Legion Plate', description: 'Allied Soldiers & Party Companions gain +35% Max HP.', cost: 1, icon: '🛡️', x: 24, y: 78, prereqId: 'cmd_1' },
  { id: 'cmd_3', path: 'war_commander', tier: 3, name: 'Banner Auto-Heal Aura', description: 'Captured War Banners regenerate +12 HP/s to nearby heroes and allies.', cost: 2, icon: '🚩', x: 34, y: 84, prereqId: 'cmd_2' },
  { id: 'cmd_4', path: 'war_commander', tier: 4, name: 'Rapid Banner Capture', description: 'Capture War Banners and Outposts +60% faster.', cost: 1, icon: '⚡', x: 44, y: 78, prereqId: 'cmd_3' },
  { id: 'cmd_5', path: 'war_commander', tier: 5, name: 'Siege Ballista Auto-Reload', description: 'Harpoon Ballistas & Naval Cannons reload 40% faster.', cost: 2, icon: '🏹', x: 54, y: 84, prereqId: 'cmd_4' },
  { id: 'cmd_6', path: 'war_commander', tier: 6, name: 'Wolf & Lion Battalion', description: '+2 additional Allied Soldiers (+3 total bonus squad size!).', cost: 2, icon: '🐶', x: 64, y: 78, prereqId: 'cmd_5' },
  { id: 'cmd_7', path: 'war_commander', tier: 7, name: 'War-Horn Echo [R]', description: '-25% Cooldown on [R] War-Horn Rally & Hero Ultimate skills.', cost: 2, icon: '📯', x: 74, y: 84, prereqId: 'cmd_6' },
  { id: 'cmd_8', path: 'war_commander', tier: 8, name: '4-Hero Party Synergy', description: 'AI Party Companions deal +45% damage and attack 30% faster.', cost: 2, icon: '🤝', x: 84, y: 78, prereqId: 'cmd_7' },
  { id: 'cmd_9', path: 'war_commander', tier: 9, name: 'Steam-Mecha Overdrive', description: '+8s Pilotable Steam-Mecha duration and +35% Mecha cannon damage.', cost: 2, icon: '🤖', x: 90, y: 66, prereqId: 'cmd_8' },
  { id: 'cmd_10', path: 'war_commander', tier: 10, name: '10-Unit Counter-Parry Shield', description: 'Blowing the War-Horn [R] grants 4s of 50% Damage Reduction.', cost: 3, icon: '🔰', x: 90, y: 52, prereqId: 'cmd_9' },
  { id: 'cmd_11', path: 'war_commander', tier: 11, name: 'Royal Tax Logistics', description: 'Capital Quarry & Lumber Mill generate +50% passive materials.', cost: 2, icon: '⛏️', x: 90, y: 38, prereqId: 'cmd_10' },
  { id: 'cmd_12', path: 'war_commander', tier: 12, name: 'Sovereign Morale Surge', description: 'Start every Act with +20% Allied War Morale.', cost: 2, icon: '🔥', x: 90, y: 24, prereqId: 'cmd_11' },
  { id: 'cmd_13', path: 'war_commander', tier: 13, name: 'Hot-Swap Shockwave', description: 'Swapping Heroes ([1][2][3][4]) unleashes a stun shockwave around you!', cost: 3, icon: '💫', x: 82, y: 10, prereqId: 'cmd_12' },
  { id: 'cmd_14', path: 'war_commander', tier: 14, name: 'Fortress Titan Armor', description: '+30% Total Defense across all 4 Playable Heroes.', cost: 3, icon: '🏰', x: 68, y: 8, prereqId: 'cmd_13' },
  { id: 'cmd_15', path: 'war_commander', tier: 15, name: 'Supreme Commander of Felis-Fang', description: 'ULTIMATE NODE: +4 Max Allied Squad Size & +40% All-Hero Damage!', cost: 4, icon: '👑', x: 52, y: 8, prereqId: 'cmd_14' },

  // ==========================================================================
  // PATH 4: PATH OF THE GREAT DUCK (15 Nodes: duck_1 .. duck_15)
  // ==========================================================================
  { id: 'duck_1', path: 'great_duck', tier: 1, name: 'Sacred Lotus Blessing', description: '+3.0s Great Duck’s Elixir [Q] active duration.', cost: 1, icon: '🪷', x: 38, y: 8 },
  { id: 'duck_2', path: 'great_duck', tier: 2, name: 'Golden Feather Magnet', description: 'Doubles the vacuum pickup radius for Golden Duck Feathers 🪶.', cost: 1, icon: '🧲', x: 26, y: 8, prereqId: 'duck_1' },
  { id: 'duck_3', path: 'great_duck', tier: 3, name: 'Astral Quack Shockwave', description: 'Activating [Q] Elixir blasts all enemies on screen for 300% ATK!', cost: 2, icon: '🦆', x: 14, y: 8, prereqId: 'duck_2' },
  { id: 'duck_4', path: 'great_duck', tier: 4, name: 'Feather Heal Surge', description: 'Picking up a Golden Feather restores 20% Max HP (up from 12%).', cost: 2, icon: '🪶', x: 6, y: 18, prereqId: 'duck_3' },
  { id: 'duck_5', path: 'great_duck', tier: 5, name: 'Extended Golden Awakening', description: '+5.0s additional Great Duck’s Elixir [Q] duration.', cost: 2, icon: '⏳', x: 6, y: 36, prereqId: 'duck_4' },
  { id: 'duck_6', path: 'great_duck', tier: 6, name: 'Cozy Loaf Regeneration', description: 'Bread Loaf [B] & Emotes regenerate +15 HP/s and reduce damage by 55%.', cost: 2, icon: '🍞', x: 6, y: 52, prereqId: 'duck_5' },
  { id: 'duck_7', path: 'great_duck', tier: 7, name: 'Golden Egg Dodge-Bombs', description: 'Dodging while Elixir is active drops an exploding Golden Egg!', cost: 2, icon: '🥚', x: 6, y: 68, prereqId: 'duck_6' },
  { id: 'duck_8', path: 'great_duck', tier: 8, name: 'Rapid Elixir Distillation', description: '-12s Cooldown on Great Duck’s Elixir [Q] recharge.', cost: 2, icon: '⚗️', x: 6, y: 84, prereqId: 'duck_7' },
  { id: 'duck_9', path: 'great_duck', tier: 9, name: 'Barrier-Shatter Resonance', description: '+35% bonus damage against Shielded Bosses, Siphon Obelisks & Phase Pillars.', cost: 2, icon: '💎', x: 20, y: 92, prereqId: 'duck_8' },
  { id: 'duck_10', path: 'great_duck', tier: 10, name: 'Meteor Quack Storm', description: 'While [Q] Elixir is active, golden star-meteors rain on nearby enemies!', cost: 3, icon: '☄️', x: 36, y: 92, prereqId: 'duck_9' },
  { id: 'duck_11', path: 'great_duck', tier: 11, name: 'Abyssal Lung & Star-Breath', description: 'Underwater Oxygen drains 60% slower and Singularity pull is reduced by 40%.', cost: 2, icon: '🫧', x: 52, y: 92, prereqId: 'duck_10' },
  { id: 'duck_12', path: 'great_duck', tier: 12, name: 'Treats of Fortune', description: '+50% Gold, XP, and Fish Treats from all sources.', cost: 2, icon: '🐟', x: 68, y: 92, prereqId: 'duck_11' },
  { id: 'duck_13', path: 'great_duck', tier: 13, name: 'Supreme Lotus Duration', description: '+7.0s additional Great Duck’s Elixir [Q] duration (+15s total!).', cost: 3, icon: '🌞', x: 82, y: 92, prereqId: 'duck_12' },
  { id: 'duck_14', path: 'great_duck', tier: 14, name: 'Omniverse Quack Harmony', description: '+25% All Stats while playing as or accompanied by The Great Duck.', cost: 3, icon: '✨', x: 92, y: 86, prereqId: 'duck_13' },
  { id: 'duck_15', path: 'great_duck', tier: 15, name: 'Phoenix-Duck Golden Auto-Revive', description: 'ULTIMATE NODE: Once per Act, fatal damage revives you at 100% HP in a burst of Golden Feathers!', cost: 4, icon: '🔥', x: 94, y: 76, prereqId: 'duck_14' },
];

export interface ComputedSkillBonuses {
  atkMult: number;
  defMult: number;
  hpMult: number;
  critBonus: number;
  backstabBonus: number;
  tornadoFinisher: boolean;
  tripleSwordBeam: boolean;
  lifestealPct: number;
  doublePotionThrow: boolean;
  potionDmgMult: number;
  extraAllies: number;
  bannerAutoHeal: boolean;
  ballistaReloadMult: number;
  elixirBonusSeconds: number;
  featherMagnetMult: number;
  autoRevive: boolean;
  hotSwapShockwave: boolean;
}

export function computeSkillTreeBonuses(unlocked: string[]): ComputedSkillBonuses {
  const set = new Set(unlocked);
  let atkMult = 1;
  let defMult = 1;
  let hpMult = 1;
  let critBonus = 0;
  let backstabBonus = 0;
  let elixirBonusSeconds = 0;
  let extraAllies = 0;

  if (set.has('blade_1')) atkMult += 0.12;
  if (set.has('blade_2')) critBonus += 8;
  if (set.has('blade_4')) atkMult += 0.1;
  if (set.has('blade_6')) backstabBonus += 0.5;
  if (set.has('blade_8')) atkMult += 0.15;
  if (set.has('blade_14')) atkMult += 0.18;
  if (set.has('blade_15')) {
    atkMult += 0.35;
    critBonus += 15;
  }

  if (set.has('alch_14')) hpMult += 0.25;
  if (set.has('cmd_1')) extraAllies += 1;
  if (set.has('cmd_6')) extraAllies += 2;
  if (set.has('cmd_14')) defMult += 0.3;
  if (set.has('cmd_15')) {
    extraAllies += 1;
    atkMult += 0.4;
  }

  if (set.has('duck_1')) elixirBonusSeconds += 3;
  if (set.has('duck_5')) elixirBonusSeconds += 5;
  if (set.has('duck_13')) elixirBonusSeconds += 7;
  if (set.has('duck_14')) {
    atkMult += 0.25;
    defMult += 0.25;
    hpMult += 0.25;
  }

  return {
    atkMult,
    defMult,
    hpMult,
    critBonus,
    backstabBonus,
    tornadoFinisher: set.has('blade_3'),
    tripleSwordBeam: set.has('blade_10') || set.has('blade_15'),
    lifestealPct: set.has('blade_11') ? 0.03 : 0,
    doublePotionThrow: set.has('alch_7') || set.has('alch_15'),
    potionDmgMult: (set.has('alch_2') ? 1.25 : 1) * (set.has('alch_15') ? 1.6 : 1),
    extraAllies,
    bannerAutoHeal: set.has('cmd_3'),
    ballistaReloadMult: set.has('cmd_5') ? 1.4 : 1,
    elixirBonusSeconds,
    featherMagnetMult: set.has('duck_2') ? 2.0 : 1.0,
    autoRevive: set.has('duck_15'),
    hotSwapShockwave: set.has('cmd_13'),
  };
}
