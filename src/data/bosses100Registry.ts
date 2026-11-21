/**
 * Layer 2 — Complete 100-Boss Regional & Arc Final Boss Registry (Acts 10, 20, ..., 1000)
 *
 * Every boss has a unique ID (`boss_001` .. `boss_100`), Act number (`10..1000`),
 * Arc ID (`1..10`), bespoke title, color palette, attack state machine sequence,
 * phase HP thresholds, and final-boss flag (`isArcFinalBoss`).
 */

import type { ArcId } from '../types/world';

export type BossAttackState =
  | 'sweep_cleave'
  | 'dash_lunge'
  | 'radial_barrage'
  | 'pillar_ward_phase'
  | 'sky_dive_siege'
  | 'tentacle_slam_wave'
  | 'time_rewind_pulse'
  | 'magma_fissure'
  | 'glacial_shatter'
  | 'hurricane_vortex'
  | 'mirror_clone_split'
  | 'quasar_singularity';

export interface BossRegistryEntry {
  readonly id: string;
  readonly ordinal: number;
  readonly actId: number;
  readonly arcId: ArcId;
  readonly name: string;
  readonly title: string;
  readonly isArcFinalBoss: boolean;
  readonly maxHp: number;
  readonly phaseThresholds: ReadonlyArray<number>;
  readonly attackStateMachine: ReadonlyArray<BossAttackState>;
  readonly palette: {
    readonly primary: string;
    readonly secondary: string;
    readonly glow: string;
  };
}

interface ArcBossTemplate {
  readonly arcId: ArcId;
  readonly regionalNames: ReadonlyArray<string>;
  readonly regionalTitles: ReadonlyArray<string>;
  readonly finalName: string;
  readonly finalTitle: string;
  readonly finalHp: number;
  readonly finalPhases: ReadonlyArray<number>;
  readonly states: ReadonlyArray<BossAttackState>;
  readonly palette: { readonly primary: string; readonly secondary: string; readonly glow: string };
}

const ARC_BOSS_TEMPLATES: ReadonlyArray<ArcBossTemplate> = [
  {
    arcId: 1,
    regionalNames: ['Fangclaw Alpha', 'Briarstalker Vex', 'Sawblade Bruiser', 'Jade-Claw Ronin', 'Quarry Crusher', 'Ruin-Hound Captain', 'Marsh Hexer', 'Lotus Poacher', 'Eclipse Gatekeeper'],
    regionalTitles: ['Outskirts Raider', 'Canopy Stalker', 'Mill Enforcer', 'Bamboo Duelist', 'Ridge Warden', 'Keep Usurper', 'Bog Warlock', 'Pond Marauder', 'Throne Sentinel'],
    finalName: 'Usurper King Fenrir',
    finalTitle: 'The Wand-Thief of Eclipse',
    finalHp: 250000,
    finalPhases: [0.5],
    states: ['sweep_cleave', 'dash_lunge', 'radial_barrage', 'pillar_ward_phase'],
    palette: { primary: '#475569', secondary: '#7e22ce', glow: '#fde047' },
  },
  {
    arcId: 2,
    regionalNames: ['Ironpaw Vanguard', 'Trench-Lord Brutus', 'Rail-Baron Rex', 'Barge-Master Kodiak', 'Windmill Gunner', 'Ram-Commander Axel', 'Oil-Keep Warden', 'Frost-Hound General', 'Citadel Champion'],
    regionalTitles: ['Bridgehead Crusher', 'Trench Bombardier', 'Armored Conductor', 'River Admiral', 'Battery Commander', 'Siege Architect', 'Rampart Keeper', 'Winter Strategist', 'Imperial Guard'],
    finalName: 'Emperor Fenrir & Ragnarok',
    finalTitle: 'Twin Sovereigns of the Iron Legion',
    finalHp: 600000,
    finalPhases: [0.66, 0.33],
    states: ['sweep_cleave', 'dash_lunge', 'radial_barrage', 'pillar_ward_phase'],
    palette: { primary: '#991b1b', secondary: '#475569', glow: '#f97316' },
  },
  {
    arcId: 3,
    regionalNames: ['Cinderwing Scourge', 'Pyro-Drake Vorax', 'Hoard-Maw Aurelius', 'Ballista-Bane Skarr', 'Volt-Wyvern Zeph', 'Obsidian Claw', 'Foundry Wyrm', 'Cloud-Ripper Talon', 'Aerie Matriarch'],
    regionalTitles: ['Ash-Plain Burner', 'Ridge Wyvern', 'Gold-Vault Tyrant', 'Cliff Hunter', 'Storm-Peak Drake', 'Gorge Terror', 'Ember Forgemaster', 'Sky-Sail Breaker', 'Elder Consort'],
    finalName: 'Ignis-Bahamut',
    finalTitle: 'Calamity King of the Ember Sky',
    finalHp: 1500000,
    finalPhases: [0.75, 0.5, 0.25],
    states: ['sky_dive_siege', 'sweep_cleave', 'radial_barrage', 'pillar_ward_phase'],
    palette: { primary: '#b91c1c', secondary: '#f97316', glow: '#fde047' },
  },
  {
    arcId: 4,
    regionalNames: ['Reef-Ripper Jaws', 'Galleon-Bane Krag', 'Trident-Lord Mako', 'Kelp-Strangler Vex', 'Iron-Claw Barnaby', 'Siren-Queen Lorelei', 'Maelstrom Terror', 'Ink-Shroud Nyctos', 'Spine-Reef Behemoth'],
    regionalTitles: ['Coral Raider', 'Shipwreck Scourge', 'Atoll Warlord', 'Trench Ambush', 'Corsair Captain', 'Grotto Enchantress', 'Vortex Warden', 'Abyssal Phantom', 'Trench Titan'],
    finalName: 'Charybdis',
    finalTitle: 'The 8-Tentacle World-Kraken',
    finalHp: 2200000,
    finalPhases: [0.75, 0.5, 0.25],
    states: ['tentacle_slam_wave', 'radial_barrage', 'sweep_cleave', 'pillar_ward_phase'],
    palette: { primary: '#0e7490', secondary: '#312e81', glow: '#22d3ee' },
  },
  {
    arcId: 5,
    regionalNames: ['Cog-Crusher Mk.IV', 'Assembly Titan', 'Phantom Express', 'Voltaic Archon', 'Smelter-Rat King', 'Belfry Owl-Prime', 'Boiler Leviathan', 'Hourglass Sentinel', 'Turbine Sovereign'],
    regionalTitles: ['Viaduct Automaton', 'Factory Overseer', 'Rail Juggernaut', 'Dynamo Lord', 'Copper Tyrant', 'Clocktower Warden', 'Steam Colossus', 'Pendulum Guard', 'Sky-Deck Admiral'],
    finalName: 'Chronos-Omega',
    finalTitle: 'The Time-Rewinding Titan',
    finalHp: 3100000,
    finalPhases: [0.75, 0.5, 0.25],
    states: ['time_rewind_pulse', 'radial_barrage', 'dash_lunge', 'pillar_ward_phase'],
    palette: { primary: '#a16207', secondary: '#3f3f46', glow: '#facc15' },
  },
  {
    arcId: 6,
    regionalNames: ['Magma-Wyrm Ignar', 'Basalt Juggernaut', 'Hellfire Knight', 'Slag-Cart Warden', 'Caldera Hydra', 'Obsidian Executioner', 'Sulfur Archmage', 'Core-Drill Golem', 'Mantle Emperor'],
    regionalTitles: ['Underworld Serpent', 'Lava-Wall Titan', 'Cinder Duelist', 'Track Ravager', 'Three-Headed Flame', 'Obsidian Blade', 'Brimstone Seer', 'Forge Colossus', 'Inner-Core Lord'],
    finalName: 'Vulcan-Rex',
    finalTitle: 'Lord of the Molten Core',
    finalHp: 4200000,
    finalPhases: [0.75, 0.5, 0.25],
    states: ['magma_fissure', 'sweep_cleave', 'radial_barrage', 'pillar_ward_phase'],
    palette: { primary: '#dc2626', secondary: '#1c1917', glow: '#fb923c' },
  },
  {
    arcId: 7,
    regionalNames: ['Rime-Claw Yeti', 'Glacier Colossus', 'Frost-Bane Valkyrie', 'Thin-Ice Stalker', 'Aurora Stag-King', 'Blizzard Mammoth', 'Cryo-Knight Zero', 'Permafrost Hydra', 'Star-Ice Sovereign'],
    regionalTitles: ['Tundra Bruiser', 'Crevasse Warden', 'Snowstorm Lancer', 'Frozen Ambush', 'Prism Guardian', 'Whiteout Titan', 'Absolute Knight', 'Glacial Beast', 'Zero-Kelvin Herald'],
    finalName: 'Borealis',
    finalTitle: 'The Absolute-Zero Leviathan',
    finalHp: 5600000,
    finalPhases: [0.75, 0.5, 0.25],
    states: ['glacial_shatter', 'radial_barrage', 'dash_lunge', 'pillar_ward_phase'],
    palette: { primary: '#0284c7', secondary: '#e0f2fe', glow: '#7dd3fc' },
  },
  {
    arcId: 8,
    regionalNames: ['Gale-Talon Griffin', 'Cloud-Rider Knight', 'Tempest Roc', 'Updraft Duelist', 'Emerald Harpy-Queen', 'Sky-Archipelago Lord', 'Thunder-Beak Alpha', 'Cyclone Chimera', 'Stratosphere Warden'],
    regionalTitles: ['Wind-Ridge Scout', 'Floating Bastion Guard', 'Sky-Island Terror', 'Geyser Striker', 'Canopy Tempest', 'Island Conqueror', 'Storm Striker', 'Vortex Beast', 'Upper-Sky Sentinel'],
    finalName: 'Zephyrus',
    finalTitle: 'Sovereign of the Emerald Hurricane',
    finalHp: 7200000,
    finalPhases: [0.75, 0.5, 0.25],
    states: ['hurricane_vortex', 'sky_dive_siege', 'radial_barrage', 'pillar_ward_phase'],
    palette: { primary: '#059669', secondary: '#a7f3d0', glow: '#34d399' },
  },
  {
    arcId: 9,
    regionalNames: ['Prism-Shard Stalker', 'Shadow-Paw Assassin', 'Dark-Leo Phantom', 'Eclipse-Fenrir Echo', 'Void-Duck Mirage', 'Glass-Labyrinth Knight', 'Refraction Weaver', 'Twin-Blade Doppelganger', 'Mirror-Throne Guard'],
    regionalTitles: ['Glass-Realm Hunter', 'Nyx Reflection', 'Inverted Lion', 'Mirrored Wolf', 'Umbral Archmage', 'Hallway Duelist', 'Prism Illusionist', 'Shadow Twin', 'Reflective Warden'],
    finalName: 'Umbra-Nyx',
    finalTitle: 'The Mirror Monarch',
    finalHp: 9000000,
    finalPhases: [0.75, 0.5, 0.25],
    states: ['mirror_clone_split', 'dash_lunge', 'radial_barrage', 'pillar_ward_phase'],
    palette: { primary: '#6d28d9', secondary: '#0f172a', glow: '#e879f9' },
  },
  {
    arcId: 10,
    regionalNames: ['Event-Horizon Knight', 'Quasar Seraph', 'Gravity-Well Titan', 'Nebula-Fang Wyrm', 'Pulsar Automaton', 'Dark-Matter Kraken', 'Star-Collapse Archon', 'Entropy Sovereign', 'Singularity Herald'],
    regionalTitles: ['Horizon Guardian', 'Relativistic Striker', 'Lensing Colossus', 'Astral Devourer', 'Cosmic Forge-Lord', 'Void Leviathan', 'Supernova Warden', 'End-of-Time Tyrant', 'Precursor of Null'],
    finalName: 'AETHER-NULL',
    finalTitle: 'The Omniverse Singularity (5 Phases)',
    finalHp: 12500000,
    finalPhases: [0.8, 0.6, 0.4, 0.2],
    states: ['quasar_singularity', 'mirror_clone_split', 'sky_dive_siege', 'pillar_ward_phase'],
    palette: { primary: '#3b0764', secondary: '#020617', glow: '#c084fc' },
  },
];

export const BOSSES_100_REGISTRY: ReadonlyArray<BossRegistryEntry> = (() => {
  const list: BossRegistryEntry[] = [];
  for (let a = 0; a < ARC_BOSS_TEMPLATES.length; a++) {
    const tpl = ARC_BOSS_TEMPLATES[a];
    for (let slot = 1; slot <= 10; slot++) {
      const ordinal = a * 10 + slot;
      const actId = ordinal * 10;
      const isFinal = slot === 10;
      const maxHp = isFinal
        ? tpl.finalHp
        : Math.round(tpl.finalHp * (0.14 + slot * 0.055));

      list.push({
        id: `boss_${String(ordinal).padStart(3, '0')}`,
        ordinal,
        actId,
        arcId: tpl.arcId,
        name: isFinal ? tpl.finalName : tpl.regionalNames[slot - 1],
        title: isFinal ? tpl.finalTitle : tpl.regionalTitles[slot - 1],
        isArcFinalBoss: isFinal,
        maxHp,
        phaseThresholds: isFinal ? tpl.finalPhases : [0.5],
        attackStateMachine: tpl.states,
        palette: tpl.palette,
      });
    }
  }
  return list;
})();

const BOSS_BY_ID = new Map<string, BossRegistryEntry>(
  BOSSES_100_REGISTRY.map((b) => [b.id, b]),
);

const BOSS_BY_ACT = new Map<number, BossRegistryEntry>(
  BOSSES_100_REGISTRY.map((b) => [b.actId, b]),
);

export function getBossById(id: string): BossRegistryEntry | null {
  return BOSS_BY_ID.get(id) ?? null;
}

export function getBossForAct(actId: number): BossRegistryEntry | null {
  return BOSS_BY_ACT.get(actId) ?? null;
}
