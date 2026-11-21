/**
 * Layer 3 — Bespoke 16-Bit Boss Sprite Matrices & Multi-Part Render Specs (Arcs 1 to 5)
 *
 * Covers the 5 flagship Arc Final Bosses of the First Half of the Omniverse:
 * - Arc I (Act 100): Usurper King Fenrir (`48x48`, Eclipse Wolf Armor + Stolen Crown)
 * - Arc II (Act 200): Emperor Fenrir & Warlord Ragnarok (`64x64`, Twin Siege Throne)
 * - Arc III (Act 300): Ignis-Bahamut Cataclysm Dragon (`88x88`, 4-Part Wing/Head/Tail)
 * - Arc IV (Act 400): Charybdis the World-Kraken (`72x72`, 8-Tentacle + Glowing Heart)
 * - Arc V (Act 500): Chronos-Omega Clockwork Dreadnought (`76x76`, Gear Halo + Piston Claws)
 */

import type { ArcId } from '../types/world';

export interface OmniverseBossPartOffset {
  readonly partId: string;
  readonly label: string;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly weakSpotMultiplier: number;
}

export interface OmniverseBossSpriteSpec {
  readonly id: string;
  readonly arcId: ArcId;
  readonly actId: number;
  readonly name: string;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly palette: Readonly<Record<string, string>>;
  /** Compact 16x16 core icon matrix scaled crisply onto the boss frame canvas */
  readonly coreMatrix16x16: ReadonlyArray<string>;
  readonly parts: ReadonlyArray<OmniverseBossPartOffset>;
  readonly auraHex: string;
  readonly outlineHex: string;
}

export const BOSS_SPRITE_ARC_1_FENRIR: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc1_fenrir',
  arcId: 1,
  actId: 100,
  name: 'Usurper King Fenrir',
  widthPx: 48,
  heightPx: 48,
  auraHex: '#f59e0b',
  outlineHex: '#0f172a',
  palette: {
    O: '#0f172a',
    W: '#334155',
    F: '#64748b',
    G: '#fbbf24',
    R: '#ef4444',
    C: '#7c3aed',
    S: '#e2e8f0',
  },
  coreMatrix16x16: [
    '....OO....OO....',
    '...OGGO..OGGO...',
    '..OOGGGOOGGGOO..',
    '..OWWWWWWWWWWO..',
    '.OWFFWWWWWFFWWO.',
    '.OWFRWWWWWFRWWO.',
    '..OWWSSSSSSWWO..',
    '..OCCCCGGCCCCO..',
    '.OCCWWWWWWWWCCO.',
    '.OCWWGGWWGGWWCO.',
    '.OCWWWWWWWWWWCO.',
    '..OWWCCWWCCWWO..',
    '..OWWWOOOOOWWO..',
    '..OWWO....OWWO..',
    '..OSSO....OSSO..',
    '..OOOO....OOOO..',
  ],
  parts: [
    { partId: 'crown_helm', label: 'Stolen Sovereign Crown', offsetX: 0, offsetY: -18, widthPx: 22, heightPx: 12, weakSpotMultiplier: 1.5 },
    { partId: 'eclipse_blade', label: 'Eclipse Greatsword', offsetX: 20, offsetY: 2, widthPx: 14, heightPx: 30, weakSpotMultiplier: 1.0 },
  ],
};

export const BOSS_SPRITE_ARC_2_RAGNAROK: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc2_ragnarok',
  arcId: 2,
  actId: 200,
  name: 'Emperor Fenrir & Warlord Ragnarok',
  widthPx: 64,
  heightPx: 64,
  auraHex: '#ef4444',
  outlineHex: '#18181b',
  palette: {
    O: '#18181b',
    I: '#52525b',
    A: '#94a3b8',
    R: '#dc2626',
    G: '#f59e0b',
    C: '#991b1b',
    S: '#f8fafc',
  },
  coreMatrix16x16: [
    '..OO..GGGG..OO..',
    '.OIIOOGGGGOOIIO.',
    '.OIIAAIIIIAAIIO.',
    'OIIARRAIIARRAIIO',
    'OIIAAIIIIIIAAIIO',
    '.OIIISSSSSSIIIO.',
    'OCCCCGGGGGGCCCCO',
    'OCIIIIIAAIIIIICO',
    'OCIIIGGAAAGGIIOC',
    'OCIIIIIIIIIIIICO',
    '.OCCIIIIIIIIICO.',
    '.OIIIIOOOOIIIIO.',
    '.OIIIO....OIIIO.',
    '.OAAAO....OAAAO.',
    '.OSSSO....OSSSO.',
    '.OOOOO....OOOOO.',
  ],
  parts: [
    { partId: 'fenrir_throne', label: 'Fenrir Eclipse Spear', offsetX: -18, offsetY: -4, widthPx: 22, heightPx: 32, weakSpotMultiplier: 1.35 },
    { partId: 'ragnarok_shield', label: 'Ragnarok Siege Bulwark', offsetX: 18, offsetY: 2, widthPx: 26, heightPx: 36, weakSpotMultiplier: 1.0 },
  ],
};

export const BOSS_SPRITE_ARC_3_BAHAMUT: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc3_bahamut',
  arcId: 3,
  actId: 300,
  name: 'Ignis-Bahamut, the Cataclysm Dragon',
  widthPx: 88,
  heightPx: 88,
  auraHex: '#f97316',
  outlineHex: '#1c1917',
  palette: {
    O: '#1c1917',
    D: '#7f1d1d',
    M: '#dc2626',
    F: '#f97316',
    Y: '#fde047',
    H: '#44403c',
    W: '#fef08a',
  },
  coreMatrix16x16: [
    'O..............O',
    'OO...OH..HO...OO',
    'OMO..OHMMHO..OMO',
    'OMMO.OMFFMO.OMMO',
    'OMFMOOMYYMOOMFMO',
    'OMFFMOMWWMOOMFFO',
    '.OMFFMMMMMMFFMO.',
    '..OMMMFFFFMMMO..',
    '..ODMMYYYYMMOD..',
    '...ODMMMMMMDO...',
    '...ODDMFFMDDO...',
    '....ODMMMMDO....',
    '....OODMMDOO....',
    '.....OOMMOO.....',
    '......OFFO......',
    '......OOOO......',
  ],
  parts: [
    { partId: 'left_wing', label: 'Left Solar-Ash Wing', offsetX: -34, offsetY: -8, widthPx: 28, heightPx: 38, weakSpotMultiplier: 1.5 },
    { partId: 'right_wing', label: 'Right Solar-Ash Wing', offsetX: 34, offsetY: -8, widthPx: 28, heightPx: 38, weakSpotMultiplier: 1.5 },
    { partId: 'horned_head', label: 'Bahamut Horned Maw (3.0x)', offsetX: 0, offsetY: -24, widthPx: 24, heightPx: 22, weakSpotMultiplier: 3.0 },
    { partId: 'magma_tail', label: 'Magma Whip Tail', offsetX: 0, offsetY: 32, widthPx: 20, heightPx: 24, weakSpotMultiplier: 1.25 },
  ],
};

export const BOSS_SPRITE_ARC_4_CHARYBDIS: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc4_charybdis',
  arcId: 4,
  actId: 400,
  name: 'Charybdis the World-Kraken',
  widthPx: 72,
  heightPx: 72,
  auraHex: '#22d3ee',
  outlineHex: '#042f2e',
  palette: {
    O: '#042f2e',
    T: '#0f766e',
    A: '#14b8a6',
    C: '#22d3ee',
    B: '#06b6d4',
    H: '#f43f5e',
    W: '#ecfeff',
  },
  coreMatrix16x16: [
    '....OOOOOOOO....',
    '...OTTTTTTTTO...',
    '..OTTAAAAAATTO..',
    '.OTTAAACCAAATTO.',
    '.OTTAACWWCAATTO.',
    '.OTTAAHHHHAAATTO',
    '.OTTAAHHHHAAATTO',
    '..OTTAAAAAATTO..',
    '..OTTTTTTTTTTO..',
    '.OT.OT.OT.OT.TO.',
    'OA..OA.OA.OA..AO',
    'OC..OB.OB.OB..CO',
    '.O..OA.OA.OA..O.',
    '....OC....CO....',
    '....O......O....',
    '................',
  ],
  parts: [
    { partId: 'abyssal_heart', label: 'Glowing Abyssal Heart (2.5x)', offsetX: 0, offsetY: -6, widthPx: 20, heightPx: 20, weakSpotMultiplier: 2.5 },
    { partId: 'tentacle_ring', label: '8 Severable Tentacles', offsetX: 0, offsetY: 22, widthPx: 64, heightPx: 24, weakSpotMultiplier: 1.2 },
  ],
};

export const BOSS_SPRITE_ARC_5_CHRONOS: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc5_chronos',
  arcId: 5,
  actId: 500,
  name: 'Chronos-Omega, Clockwork Dreadnought',
  widthPx: 76,
  heightPx: 76,
  auraHex: '#fbbf24',
  outlineHex: '#1e1b4b',
  palette: {
    O: '#1e1b4b',
    B: '#92400e',
    G: '#d97706',
    Y: '#fbbf24',
    S: '#38bdf8',
    W: '#f8fafc',
    C: '#475569',
  },
  coreMatrix16x16: [
    '...OO..OO..OO...',
    '..OYYOOYYOOYYO..',
    '.OOGGGGGGGGGGOO.',
    '.OGBBBBBBBBBBGO.',
    'OOGBBSSSSSSBBGOO',
    'OYGBBSWWWWSSBGYO',
    'OOGBBSSSSSSBBGOO',
    '.OGBBBBYYBBBBGO.',
    '.OGCCYYYYYYCCGO.',
    '..OGCCCCCCCCGO..',
    '.OOGGBBGGGBBGOO.',
    '.OYGBBGGGGGBGYO.',
    '..OGBBGOOGBBGO..',
    '..OBBBO..OBBBO..',
    '..OYYYO..OYYYO..',
    '..OOOOO..OOOOO..',
  ],
  parts: [
    { partId: 'chrono_core', label: 'Chrono-Prism Core (2.2x)', offsetX: 0, offsetY: -8, widthPx: 22, heightPx: 22, weakSpotMultiplier: 2.2 },
    { partId: 'left_piston', label: 'Steam Piston Arm L', offsetX: -28, offsetY: 6, widthPx: 18, heightPx: 30, weakSpotMultiplier: 1.1 },
    { partId: 'right_piston', label: 'Steam Piston Arm R', offsetX: 28, offsetY: 6, widthPx: 18, heightPx: 30, weakSpotMultiplier: 1.1 },
  ],
};

export const BOSS_SPRITES_ARC_1_TO_5: ReadonlyArray<OmniverseBossSpriteSpec> = [
  BOSS_SPRITE_ARC_1_FENRIR,
  BOSS_SPRITE_ARC_2_RAGNAROK,
  BOSS_SPRITE_ARC_3_BAHAMUT,
  BOSS_SPRITE_ARC_4_CHARYBDIS,
  BOSS_SPRITE_ARC_5_CHRONOS,
];
