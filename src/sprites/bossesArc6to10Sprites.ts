/**
 * Layer 3 — Bespoke 16-Bit Boss Sprite Matrices & Multi-Part Render Specs (Arcs 6 to 10)
 * + Unified 10-Arc Boss Sprite Registry
 *
 * Covers the 5 flagship Arc Final Bosses of the Second Half of the Omniverse:
 * - Arc VI (Act 600): Vulcan-Rex, Obsidian Core Colossus (`72x72`)
 * - Arc VII (Act 700): Borealis, Astral Glacier Mammoth-Wyrm (`76x76`)
 * - Arc VIII (Act 800): Zephyrus, Sovereign of the Ten-Mile Tempest (`72x72`)
 * - Arc IX (Act 900): Umbra-Nyx, Evil Shadow-Mirror Clone (`52x52`)
 * - Arc X (Act 1000): AETHER-NULL, The Omniverse Singularity (`88x88`, 5 Phases)
 */

import type { ArcId } from '../types/world';
import {
  BOSS_SPRITE_ARC_1_FENRIR,
  BOSS_SPRITES_ARC_1_TO_5,
  type OmniverseBossSpriteSpec,
} from './bossesArc1to5Sprites';

export const BOSS_SPRITE_ARC_6_VULCAN_REX: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc6_vulcan_rex',
  arcId: 6,
  actId: 600,
  name: 'Vulcan-Rex, Obsidian Core Colossus',
  widthPx: 72,
  heightPx: 72,
  auraHex: '#f97316',
  outlineHex: '#0c0a09',
  palette: {
    O: '#0c0a09',
    K: '#292524',
    S: '#57534e',
    L: '#ea580c',
    F: '#fb923c',
    Y: '#fde047',
  },
  coreMatrix16x16: [
    '....OO....OO....',
    '...OLLO..OLLO...',
    '..OKKKKOOKKKKO..',
    '.OKKSSKKKKSSKKO.',
    '.OKSFFKKKKFFSKO.',
    '.OKSYYKKKKYYSKO.',
    '..OKKKLLLLKKKO..',
    '.OOKKLLYYLLKKOO.',
    'OKKKLLYYYYLLKKKO',
    'OKSSKKLLLLKKSSKO',
    'OKKKKKKLLKKKKKKO',
    '.OKKKKKOOOKKKKO.',
    '.OKKKKO..OKKKKO.',
    '.OLLKKO..OKKLLO.',
    '.OKKKKO..OKKKKO.',
    '.OOOOOO..OOOOOO.',
  ],
  parts: [
    { partId: 'magma_core', label: 'Exposed Magma Core (2.4x)', offsetX: 0, offsetY: 0, widthPx: 22, heightPx: 22, weakSpotMultiplier: 2.4 },
    { partId: 'obsidian_fists', label: 'Twin Obsidian Fists', offsetX: 0, offsetY: 16, widthPx: 56, heightPx: 20, weakSpotMultiplier: 1.0 },
  ],
};

export const BOSS_SPRITE_ARC_7_BOREALIS: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc7_borealis',
  arcId: 7,
  actId: 700,
  name: 'Borealis, Astral Glacier Mammoth-Wyrm',
  widthPx: 76,
  heightPx: 76,
  auraHex: '#38bdf8',
  outlineHex: '#0c4a6e',
  palette: {
    O: '#0c4a6e',
    I: '#0284c7',
    C: '#38bdf8',
    F: '#bae6fd',
    W: '#f0f9ff',
    A: '#c084fc',
  },
  coreMatrix16x16: [
    '..OO........OO..',
    '.OAWO..OO..OWAO.',
    '.OACWOOCCOOOWAO.',
    '..OICCCCCCCICO..',
    '.OICFFCCCCFFCIO.',
    '.OICFWCCCCWFCIO.',
    'OICCCCAAAAACCCIO',
    'OICCCAAAAAAACCIO',
    'OIIICCCCCCCIIICO',
    '.OIIICFFFFCIIIO.',
    '.OOWWCCCCCCWWOO.',
    '.OWWO.OIIO.OWWO.',
    '.OWO..OIIO..OWO.',
    '..O...OCCO...O..',
    '......OFFO......',
    '......OOOO......',
  ],
  parts: [
    { partId: 'aurora_tusks', label: 'Crystal Aurora Tusks', offsetX: 0, offsetY: 14, widthPx: 52, heightPx: 18, weakSpotMultiplier: 1.4 },
    { partId: 'frost_crown', label: 'Astral Permafrost Crown (2.3x)', offsetX: 0, offsetY: -20, widthPx: 26, heightPx: 18, weakSpotMultiplier: 2.3 },
  ],
};

export const BOSS_SPRITE_ARC_8_ZEPHYRUS: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc8_zephyrus',
  arcId: 8,
  actId: 800,
  name: 'Zephyrus, Sovereign of the Ten-Mile Tempest',
  widthPx: 72,
  heightPx: 72,
  auraHex: '#2dd4bf',
  outlineHex: '#134e4a',
  palette: {
    O: '#134e4a',
    T: '#0d9488',
    M: '#2dd4bf',
    W: '#f0fdfa',
    G: '#facc15',
    S: '#99f6e4',
  },
  coreMatrix16x16: [
    'O..............O',
    'OWO....OO....OWO',
    'OWMO..OGGO..OMWO',
    'OWMMOOGWWGOOMMWO',
    '.OWMMOTTTTOMMWO.',
    '..OWMTTGGTTMWO..',
    '..OOTTTWWTTTOO..',
    '...OTTTTTTTTO...',
    '...OTMMGGMMTO...',
    '....OTMMMMTO....',
    '....OOTTTTOO....',
    '.....OG..GO.....',
    '.....OG..GO.....',
    '....OOG..GOO....',
    '................',
    '................',
  ],
  parts: [
    { partId: 'gale_pinions', label: 'Cyclone Pinions', offsetX: 0, offsetY: -6, widthPx: 64, heightPx: 28, weakSpotMultiplier: 1.5 },
    { partId: 'storm_beak', label: 'Tempest Crest (2.5x)', offsetX: 0, offsetY: -22, widthPx: 20, heightPx: 18, weakSpotMultiplier: 2.5 },
  ],
};

export const BOSS_SPRITE_ARC_9_UMBRA_NYX: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc9_umbra_nyx',
  arcId: 9,
  actId: 900,
  name: 'Umbra-Nyx, the Shadow-Mirror Clone',
  widthPx: 52,
  heightPx: 52,
  auraHex: '#e879f9',
  outlineHex: '#1e0629',
  palette: {
    O: '#1e0629',
    V: '#3b0764',
    P: '#7e22ce',
    M: '#d946ef',
    R: '#f43f5e',
    W: '#fae8ff',
  },
  coreMatrix16x16: [
    '...OO......OO...',
    '..OVMO....OMVO..',
    '..OVPMOOOOOPVO..',
    '..OVVVVVVVVVVO..',
    '.OVVVVVVVVVVVVO.',
    '.OVVRRVVVVRRVVO.',
    '.OVVVVVMMVVVVVO.',
    '..OVVVVVVVVVVO..',
    '..OPPPPMMPPPPO..',
    '.OPPVVVWWVVVPPO.',
    '.OPVVVVVVVVVVPO.',
    '..OVVPPVVPPVVO..',
    '..OVVVOOOOOVVO..',
    '..OVVO....OVVO..',
    '..OMMO....OMMO..',
    '..OOOO....OOOO..',
  ],
  parts: [
    { partId: 'mirror_wand', label: 'Shattered Eclipse Wand', offsetX: 18, offsetY: -2, widthPx: 14, heightPx: 28, weakSpotMultiplier: 1.6 },
    { partId: 'shadow_cloak', label: 'Verlet Mirror Cloak', offsetX: 0, offsetY: 12, widthPx: 32, heightPx: 24, weakSpotMultiplier: 1.0 },
  ],
};

export const BOSS_SPRITE_ARC_10_AETHER_NULL: OmniverseBossSpriteSpec = {
  id: 'sprite_boss_arc10_aether_null',
  arcId: 10,
  actId: 1000,
  name: 'AETHER-NULL, The Omniverse Singularity',
  widthPx: 88,
  heightPx: 88,
  auraHex: '#fbbf24',
  outlineHex: '#020617',
  palette: {
    O: '#020617',
    V: '#1e1b4b',
    I: '#4338ca',
    C: '#38bdf8',
    M: '#e879f9',
    G: '#fbbf24',
    W: '#ffffff',
  },
  coreMatrix16x16: [
    '......OGGO......',
    '....OOGWWGOO....',
    '..OOVVGGGGVVOO..',
    '.OVVIICCCCI.VVO.',
    '.OVICCMWWMMCCVO.',
    'OOVICMWWWWMCIVOO',
    'OGVICMWWWWMCIVGO',
    'OOVICCMWWMMCCVOO',
    '.OVVIICCCCI.VVO.',
    '..OOVVGGGGVVOO..',
    '...OVVIGGIVVO...',
    '..OVV.OIIO.VVO..',
    '.OGV..OIIO..VGO.',
    '.OO...OGGO...OO.',
    '......OGGO......',
    '......OOOO......',
  ],
  parts: [
    { partId: 'singularity_eye', label: 'Aether Singularity Core (3.0x)', offsetX: 0, offsetY: 0, widthPx: 26, heightPx: 26, weakSpotMultiplier: 3.0 },
    { partId: 'astral_halo_n', label: 'Crown Ring North', offsetX: 0, offsetY: -34, widthPx: 44, heightPx: 14, weakSpotMultiplier: 1.4 },
    { partId: 'astral_halo_s', label: 'Crown Ring South', offsetX: 0, offsetY: 34, widthPx: 44, heightPx: 14, weakSpotMultiplier: 1.4 },
    { partId: 'void_wings', label: 'Omniverse Prism Wings', offsetX: 0, offsetY: 0, widthPx: 84, heightPx: 32, weakSpotMultiplier: 1.25 },
  ],
};

export const BOSS_SPRITES_ARC_6_TO_10: ReadonlyArray<OmniverseBossSpriteSpec> = [
  BOSS_SPRITE_ARC_6_VULCAN_REX,
  BOSS_SPRITE_ARC_7_BOREALIS,
  BOSS_SPRITE_ARC_8_ZEPHYRUS,
  BOSS_SPRITE_ARC_9_UMBRA_NYX,
  BOSS_SPRITE_ARC_10_AETHER_NULL,
];

export const ALL_10_ARC_BOSS_SPRITES: ReadonlyArray<OmniverseBossSpriteSpec> = [
  ...BOSS_SPRITES_ARC_1_TO_5,
  ...BOSS_SPRITES_ARC_6_TO_10,
];

export function getArcBossSpriteSpec(arcId: ArcId): OmniverseBossSpriteSpec {
  return ALL_10_ARC_BOSS_SPRITES[arcId - 1] ?? BOSS_SPRITE_ARC_1_FENRIR;
}
