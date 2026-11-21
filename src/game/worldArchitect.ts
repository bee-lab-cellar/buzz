import { GRID_COLS, GRID_ROWS, findNearestDryTile, spawnAlliedSoldier, spawnEnemy } from './acts';
import type { ActConfig, GeneratedActWorld } from './acts';
import { generateBiomeFeaturesForAct } from './biomeMechanics';
import { Chest, DragonBallista, Enemy, NPC, Portal, Trap } from './types';

function fillRect(rows: string[][], x0: number, y0: number, x1: number, y1: number, ch: string) {
  for (let y = Math.max(1, y0); y <= Math.min(GRID_ROWS - 2, y1); y++) {
    for (let x = Math.max(1, x0); x <= Math.min(GRID_COLS - 2, x1); x++) {
      rows[y][x] = ch;
    }
  }
}

export function applyOmniverseLayoutGeometry(rows: string[][], cfg: ActConfig) {
  // Specialized layouts for Arc IV (Naval/Abyss), Arc V (Clockwork/Rail), and Arc VI (Asteroid/Void)
  const actMod = cfg.act % 10;

  if (cfg.biomeId === 26 || actMod === 8) {
    // Naval Galleon Broadside Deck Topology (Two parallel warship decks over ocean 'W' joined by boarding planks 'B')
    fillRect(rows, 1, 1, 36, 22, 'W');
    // Upper Cat-Galleon Deck
    fillRect(rows, 3, 3, 34, 9, 'P');
    fillRect(rows, 6, 4, 31, 8, 'C');
    // Lower Corsair Dreadnought Deck
    fillRect(rows, 3, 14, 34, 20, 'P');
    fillRect(rows, 6, 15, 31, 19, 'C');
    // 3 Boarding Plank Bridges across the ships
    fillRect(rows, 8, 9, 11, 14, 'B');
    fillRect(rows, 17, 9, 20, 14, 'B');
    fillRect(rows, 26, 9, 29, 14, 'B');
    // West & East Gangways
    fillRect(rows, 1, 10, 6, 13, 'B');
    fillRect(rows, 31, 10, 36, 13, 'B');
    // Mast Pillars
    rows[6][12] = '#';
    rows[6][25] = '#';
    rows[17][12] = '#';
    rows[17][25] = '#';
    return true;
  }

  if (cfg.biomeId === 42 || cfg.biomeId === 44 || actMod === 9) {
    // Zero-G Asteroid & Black Hole Accretion Bridges Topology
    fillRect(rows, 1, 1, 36, 22, 'W');
    // West & East Star-Docks
    fillRect(rows, 1, 8, 7, 15, 'P');
    fillRect(rows, 30, 8, 36, 15, 'P');
    // 4 Floating Asteroid Shrines
    fillRect(rows, 10, 3, 16, 8, '.');
    fillRect(rows, 21, 3, 27, 8, '.');
    fillRect(rows, 10, 15, 16, 20, '.');
    fillRect(rows, 21, 15, 27, 20, '.');
    // Central Singularity Accretion Core Island
    fillRect(rows, 14, 9, 23, 14, 'C');
    // Starlight Bridges connecting all asteroids
    fillRect(rows, 7, 10, 14, 13, 'B');
    fillRect(rows, 23, 10, 30, 13, 'B');
    fillRect(rows, 12, 8, 15, 15, 'B');
    fillRect(rows, 22, 8, 25, 15, 'B');
    fillRect(rows, 16, 5, 21, 6, 'B');
    fillRect(rows, 16, 17, 21, 18, 'B');
    return true;
  }

  return false;
}

export function generateOmniverseSpecialWorld(
  cfg: ActConfig,
  rows: string[][],
  spawnSide: 'west' | 'east' | 'center',
  nightmareMode: boolean,
  alreadyCleared: boolean
): GeneratedActWorld | null {
  // ==========================================================================
  // ACT 179, 239, 299: OMNIVERSE SANCTUARIES (Abyssal, Clockwork, Multiverse)
  // ==========================================================================
  if (cfg.act === 179 || cfg.act === 239 || cfg.act === 299) {
    fillRect(rows, 2, 2, 35, 21, 'P');
    fillRect(rows, 8, 4, 29, 19, 'C');
    [
      [7, 4],
      [30, 4],
      [7, 19],
      [30, 19],
      [15, 4],
      [22, 4],
    ].forEach(([px, py]) => {
      rows[py][px] = '#';
    });

    const leoSpot = findNearestDryTile(rows, 240, 108, true);
    const fenrirSpot = findNearestDryTile(rows, 296, 108, true);
    const duckSpot = findNearestDryTile(rows, 352, 108, true);
    const bsSpot = findNearestDryTile(rows, 184, 252, true);
    const advSpot = findNearestDryTile(rows, 412, 252, true);

    const npcs: NPC[] = [
      {
        id: 'king_leo_war_council',
        name: 'King Leo (Party Hero [2])',
        spriteId: 'king_leo',
        x: leoSpot.x,
        y: leoSpot.y,
        width: 24,
        height: 24,
        promptText: 'Speak with King Leo',
      },
      {
        id: 'fenrir_united_sanctum',
        name: 'Wolf-King Fenrir (Party Hero [3])',
        spriteId: 'fenrir',
        x: fenrirSpot.x,
        y: fenrirSpot.y,
        width: 26,
        height: 26,
        promptText: 'Speak with Wolf-King Fenrir',
      },
      {
        id: 'great_duck_war_council',
        name: 'The Great Duck (Party Hero [4])',
        spriteId: 'great_duck',
        x: duckSpot.x,
        y: duckSpot.y,
        width: 30,
        height: 30,
        promptText: 'Receive Omniverse Blessing from The Great Duck',
      },
      {
        id: 'blacksmith_forgepaw',
        name: 'Master Star-Smith Forgepaw',
        spriteId: 'blacksmith',
        x: bsSpot.x,
        y: bsSpot.y,
        width: 16,
        height: 16,
        promptText: 'Star-Up Anvil & Blacksmith Shop',
      },
      {
        id: 'advisor_whiskers',
        name: 'Omniverse Tactician Whiskers',
        spriteId: 'advisor',
        x: advSpot.x,
        y: advSpot.y,
        width: 16,
        height: 16,
        promptText: 'Speak with Advisor Whiskers',
      },
    ];

    const c1 = findNearestDryTile(rows, 268, 264, true);
    const c2 = findNearestDryTile(rows, 332, 264, true);
    const chests: Chest[] = [
      {
        id: `act${cfg.act}_vault_1`,
        x: c1.x,
        y: c1.y,
        opened: false,
        gold: 2500,
        potions: 6,
        gearId: 'eternal_omni_blade',
        label: `Act ${cfg.act} Sacred Reliquary`,
      },
      {
        id: `act${cfg.act}_vault_2`,
        x: c2.x,
        y: c2.y,
        opened: false,
        gold: 2500,
        potions: 6,
        gearId: 'eternal_omni_mantle',
        label: `Act ${cfg.act} Astral Mantle Vault`,
      },
    ];

    const nextAct = cfg.act + 1;
    const portalLabel =
      cfg.act === 179
        ? 'Abyssal Gate: Act 180 Charybdis the World-Kraken'
        : cfg.act === 239
        ? 'Temporal Gate: Act 240 Chronos-Omega Time-Titan'
        : 'Singularity Gate: Act 300 Aether-Null Finale';

    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 4,
        y: 168,
        width: 22,
        height: 44,
        direction: 'prev',
        targetAct: cfg.act - 1,
        label: `West: Act ${cfg.act - 1}`,
      },
      {
        id: 'sanctuary_to_throne',
        x: 572,
        y: 168,
        width: 30,
        height: 44,
        direction: 'sanctuary_warp',
        targetAct: nextAct,
        label: portalLabel,
        isGolden: true,
      },
    ];

    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: spawnSide === 'east' ? { x: 540, y: 192 } : { x: 56, y: 192 },
      npcs,
      chests,
      portals,
      enemies: [],
      alliedSoldiers: [
        spawnAlliedSoldier(`s${cfg.act}_a1`, 'cat_knight', 192, 140, cfg.act),
        spawnAlliedSoldier(`s${cfg.act}_a2`, 'bulldog_paladin', 404, 140, cfg.act),
        spawnAlliedSoldier(`s${cfg.act}_a3`, 'lion_halberdier', 192, 224, cfg.act),
        spawnAlliedSoldier(`s${cfg.act}_a4`, 'wolf_captain', 404, 224, cfg.act),
      ],
      warBanners: [],
      prisonCages: [],
      siegeEngines: [],
      traps: [],
      biomeFeatures: [],
      torches: [
        { x: 160, y: 92, color: '#38bdf8' },
        { x: 436, y: 92, color: '#fde047' },
        { x: 160, y: 268, color: '#a855f7' },
        { x: 436, y: 268, color: '#10b981' },
      ],
    };
  }

  // ==========================================================================
  // ACT 180: CHARYBDIS THE 8-TENTACLE WORLD-KRAKEN (3,000,000 HP + 8 TENTACLES)
  // ==========================================================================
  if (cfg.act === 180) {
    fillRect(rows, 1, 1, 36, 22, 'W');
    // Giant Hadal Flagship Deck & Coral Platform in the center
    fillRect(rows, 5, 4, 32, 19, 'P');
    fillRect(rows, 9, 6, 28, 17, 'C');
    fillRect(rows, 16, 18, 21, 22, 'B');
    fillRect(rows, 28, 10, 36, 13, 'B');

    const enemies: Enemy[] = [];
    if (!alreadyCleared) {
      const kraken = spawnEnemy(
        'boss_charybdis_180',
        'charybdis_kraken',
        304,
        132,
        180,
        nightmareMode,
        'Charybdis, The 8-Tentacle World-Kraken',
        'boss'
      );
      enemies.push(kraken);

      // Spawn 8 Independent Kraken Tentacle Hitboxes around the arena perimeter!
      const tentacleSpots = [
        { x: 136, y: 88, label: 'NW Tentacle #1' },
        { x: 224, y: 74, label: 'N-West Tentacle #2' },
        { x: 384, y: 74, label: 'N-East Tentacle #3' },
        { x: 472, y: 88, label: 'NE Tentacle #4' },
        { x: 136, y: 268, label: 'SW Tentacle #5' },
        { x: 224, y: 284, label: 'S-West Tentacle #6' },
        { x: 384, y: 284, label: 'S-East Tentacle #7' },
        { x: 472, y: 268, label: 'SE Tentacle #8' },
      ];
      tentacleSpots.forEach((spot, idx) => {
        const dry = findNearestDryTile(rows, spot.x, spot.y, true);
        const tent = spawnEnemy(
          `kraken_tentacle_${idx + 1}`,
          'kraken_tentacle',
          dry.x,
          dry.y,
          180,
          nightmareMode,
          `Abyssal Crusher Tentacle #${idx + 1}`,
          'miniboss'
        );
        tent.maxHp = Math.max(120, Math.round(kraken.maxHp * 0.05));
        tent.hp = tent.maxHp;
        enemies.push(tent);
      });
    }

    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 264,
        y: 356,
        width: 80,
        height: 24,
        direction: 'prev',
        targetAct: 179,
        label: 'South: Return to Act 179 Abyssal Sanctuary',
      },
      {
        id: 'next_act',
        x: 572,
        y: 168,
        width: 28,
        height: 44,
        direction: 'next',
        targetAct: 181,
        label: 'East: Act 181 Clockwork Mecha-Empire (Arc V)',
        isGolden: true,
      },
    ];

    const ballistas: DragonBallista[] = alreadyCleared
      ? []
      : [
          { id: 'bal_nw', x: 112, y: 96, cornerLabel: 'NW Naval Broadside Cannon', cooldown: 0, maxCooldown: 4.0, aimAngle: 0.5, lockedOn: false, autoCrewTimer: 4.0 },
          { id: 'bal_ne', x: 496, y: 96, cornerLabel: 'NE Naval Broadside Cannon', cooldown: 0, maxCooldown: 4.0, aimAngle: 2.6, lockedOn: false, autoCrewTimer: 4.5 },
          { id: 'bal_sw', x: 112, y: 272, cornerLabel: 'SW Naval Broadside Cannon', cooldown: 0, maxCooldown: 4.0, aimAngle: -0.5, lockedOn: false, autoCrewTimer: 5.0 },
          { id: 'bal_se', x: 496, y: 272, cornerLabel: 'SE Naval Broadside Cannon', cooldown: 0, maxCooldown: 4.0, aimAngle: -2.6, lockedOn: false, autoCrewTimer: 5.5 },
        ];

    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: { x: 304, y: 312 },
      npcs: [],
      chests: [],
      portals,
      enemies,
      alliedSoldiers: [
        spawnAlliedSoldier('kr_ally_1', 'cat_knight', 236, 260, 180),
        spawnAlliedSoldier('kr_ally_2', 'bulldog_paladin', 372, 260, 180),
        spawnAlliedSoldier('kr_ally_3', 'lion_halberdier', 268, 280, 180),
        spawnAlliedSoldier('kr_ally_4', 'wolf_captain', 340, 280, 180),
      ],
      warBanners: [],
      prisonCages: [],
      siegeEngines: [],
      dragonBallistas: ballistas,
      traps: [
        { id: 'kr_tr_1', kind: 'frost_crystal', x: 200, y: 180, radius: 22, cycleTime: 3.2, timer: 0.5, warnDuration: 0.7, activeDuration: 0.7, damage: 36 },
        { id: 'kr_tr_2', kind: 'frost_crystal', x: 408, y: 180, radius: 22, cycleTime: 3.2, timer: 2.0, warnDuration: 0.7, activeDuration: 0.7, damage: 36 },
      ],
      biomeFeatures: generateBiomeFeaturesForAct(180, cfg.biomeId, 'final_boss', (px, py) => findNearestDryTile(rows, px, py, true), nightmareMode),
      torches: [
        { x: 160, y: 68, color: '#22d3ee' },
        { x: 448, y: 68, color: '#22d3ee' },
      ],
    };
  }

  // ==========================================================================
  // ACT 240: CHRONOS-OMEGA, THE TIME-REWINDING TITAN (6,000,000 HP)
  // ==========================================================================
  if (cfg.act === 240) {
    fillRect(rows, 2, 2, 35, 21, 'P');
    fillRect(rows, 8, 5, 29, 18, 'C');
    // 4 Clockwork Pillar Anchors
    [
      [10, 6],
      [27, 6],
      [10, 17],
      [27, 17],
    ].forEach(([px, py]) => {
      rows[py][px] = '#';
    });

    const enemies: Enemy[] = [];
    if (!alreadyCleared) {
      const chronos = spawnEnemy(
        'boss_chronos_240',
        'chronos_omega',
        304,
        128,
        240,
        nightmareMode,
        'Chronos-Omega, The Time-Rewinding Titan',
        'boss'
      );
      enemies.push(chronos);

      // 4 Chrono-Gears that must be shattered to prevent 5-second Time Rewind!
      const gearSpots = [
        { x: 144, y: 92, name: 'XII-Hour Chrono-Gear' },
        { x: 464, y: 92, name: 'III-Hour Chrono-Gear' },
        { x: 144, y: 268, name: 'IX-Hour Chrono-Gear' },
        { x: 464, y: 268, name: 'VI-Hour Chrono-Gear' },
      ];
      gearSpots.forEach((g, idx) => {
        const gearUnit = spawnEnemy(
          `chrono_gear_${idx + 1}`,
          'tesla_drone',
          g.x,
          g.y,
          240,
          nightmareMode,
          g.name,
          'miniboss'
        );
        gearUnit.maxHp = nightmareMode ? 320000 : 220000;
        gearUnit.hp = gearUnit.maxHp;
        gearUnit.speed = 12;
        enemies.push(gearUnit);
      });
    }

    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 264,
        y: 356,
        width: 80,
        height: 24,
        direction: 'prev',
        targetAct: 239,
        label: 'South: Return to Act 239 Clockwork Sanctuary',
      },
      {
        id: 'next_act',
        x: 572,
        y: 168,
        width: 28,
        height: 44,
        direction: 'next',
        targetAct: 241,
        label: 'East: Act 241 Void-Eclipse Multiverse (Arc VI)',
        isGolden: true,
      },
    ];

    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: { x: 304, y: 312 },
      npcs: [],
      chests: [],
      portals,
      enemies,
      alliedSoldiers: [
        spawnAlliedSoldier('ch_ally_1', 'cat_knight', 236, 260, 240),
        spawnAlliedSoldier('ch_ally_2', 'bulldog_paladin', 372, 260, 240),
        spawnAlliedSoldier('ch_ally_3', 'arcane_cat_mage', 268, 280, 240),
        spawnAlliedSoldier('ch_ally_4', 'wolf_captain', 340, 280, 240),
      ],
      warBanners: [],
      prisonCages: [],
      siegeEngines: [],
      traps: [
        { id: 'ch_tr_1', kind: 'void_pillar', x: 204, y: 184, radius: 22, cycleTime: 3.0, timer: 0.4, warnDuration: 0.65, activeDuration: 0.7, damage: 42 },
        { id: 'ch_tr_2', kind: 'void_pillar', x: 404, y: 184, radius: 22, cycleTime: 3.0, timer: 1.9, warnDuration: 0.65, activeDuration: 0.7, damage: 42 },
      ],
      biomeFeatures: [],
      torches: [
        { x: 160, y: 68, color: '#fde047' },
        { x: 448, y: 68, color: '#fde047' },
      ],
    };
  }

  // ==========================================================================
  // ACT 300: TRUE FINAL BOSS — AETHER-NULL, THE ECLIPSE SINGULARITY (15,000,000 HP)
  // ==========================================================================
  if (cfg.act === 300) {
    fillRect(rows, 1, 1, 36, 22, 'W');
    fillRect(rows, 4, 3, 33, 20, 'P');
    fillRect(rows, 8, 5, 29, 18, 'C');
    fillRect(rows, 16, 18, 21, 22, 'B');

    const enemies: Enemy[] = [];
    if (!alreadyCleared) {
      const aetherNull = spawnEnemy(
        'boss_aether_null_300',
        'aether_null',
        304,
        132,
        300,
        nightmareMode,
        'AETHER-NULL, THE ECLIPSE SINGULARITY (Phase 1/5)',
        'boss'
      );
      enemies.push(aetherNull);
    }

    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 264,
        y: 356,
        width: 80,
        height: 24,
        direction: 'prev',
        targetAct: 299,
        label: 'South: Return to Act 299 Omniverse Sanctuary',
      },
    ];

    const ballistas: DragonBallista[] = alreadyCleared
      ? []
      : [
          { id: 'bal_nw', x: 112, y: 92, cornerLabel: 'NW Astral Singularity Lance', cooldown: 0, maxCooldown: 4.0, aimAngle: 0.5, lockedOn: false, autoCrewTimer: 4.0 },
          { id: 'bal_ne', x: 496, y: 92, cornerLabel: 'NE Astral Singularity Lance', cooldown: 0, maxCooldown: 4.0, aimAngle: 2.6, lockedOn: false, autoCrewTimer: 4.5 },
          { id: 'bal_sw', x: 112, y: 276, cornerLabel: 'SW Astral Singularity Lance', cooldown: 0, maxCooldown: 4.0, aimAngle: -0.5, lockedOn: false, autoCrewTimer: 5.0 },
          { id: 'bal_se', x: 496, y: 276, cornerLabel: 'SE Astral Singularity Lance', cooldown: 0, maxCooldown: 4.0, aimAngle: -2.6, lockedOn: false, autoCrewTimer: 5.5 },
        ];

    const traps: Trap[] = [
      { id: 'an_tr_1', kind: 'void_pillar', x: 192, y: 120, radius: 24, cycleTime: 2.8, timer: 0.4, warnDuration: 0.65, activeDuration: 0.75, damage: 48 },
      { id: 'an_tr_2', kind: 'void_pillar', x: 416, y: 120, radius: 24, cycleTime: 2.8, timer: 1.8, warnDuration: 0.65, activeDuration: 0.75, damage: 48 },
      { id: 'an_tr_3', kind: 'flame_geyser', x: 192, y: 244, radius: 22, cycleTime: 3.1, timer: 1.0, warnDuration: 0.65, activeDuration: 0.75, damage: 46 },
      { id: 'an_tr_4', kind: 'flame_geyser', x: 416, y: 244, radius: 22, cycleTime: 3.1, timer: 2.4, warnDuration: 0.65, activeDuration: 0.75, damage: 46 },
    ];

    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: { x: 304, y: 312 },
      npcs: [],
      chests: [],
      portals,
      enemies,
      alliedSoldiers: [
        spawnAlliedSoldier('an_ally_1', 'cat_knight', 220, 260, 300),
        spawnAlliedSoldier('an_ally_2', 'bulldog_paladin', 388, 260, 300),
        spawnAlliedSoldier('an_ally_3', 'lion_halberdier', 252, 280, 300),
        spawnAlliedSoldier('an_ally_4', 'doberman_blade', 356, 280, 300),
        spawnAlliedSoldier('an_ally_5', 'arcane_cat_mage', 284, 292, 300),
        spawnAlliedSoldier('an_ally_6', 'wolf_captain', 324, 292, 300),
      ],
      warBanners: [],
      prisonCages: [],
      siegeEngines: [],
      dragonBallistas: ballistas,
      traps,
      biomeFeatures: [],
      torches: [
        { x: 148, y: 68, color: '#f43f5e' },
        { x: 460, y: 68, color: '#38bdf8' },
        { x: 148, y: 296, color: '#fde047' },
        { x: 460, y: 296, color: '#c084fc' },
      ],
    };
  }

  return null;
}
