/**
 * File 47 / 100 — Dog Legion Breeds (4 Distinct Breeds) & Arc 1–10 Enemy Faction Matrices.
 * Zero `any` types, zero emoji placeholders.
 */

import type { DogLegionBreed } from '../types/entities';
import type { OmniverseFactionId } from '../types/world';

export interface EnemySpriteMatrixSpec {
  readonly id: string;
  readonly faction: OmniverseFactionId;
  readonly width: number;
  readonly height: number;
  readonly matrix: ReadonlyArray<string>;
  readonly palette: Readonly<Record<string, string>>;
}

const DOG_BREED_BASE_MATRIX_20X20: ReadonlyArray<string> = [
  '....................',
  '...OOO........OOO...',
  '..OdddO......OdddO..',
  '..OddddOOOOOOddddO..',
  '..OddddddddddddddO..',
  '..OddEEddddddEEddO..',
  '..OddddddnnndddddO..',
  '...OddwwwwwwwwddO...',
  '...OddW..ww..WddO...',
  '....OOSSSSSSSSOO....',
  '...OSSAAAAAAAAASO...',
  '..OOSAAAAAAAAAAASOO.',
  '..OAAAAAAAAAAAAAAAO.',
  '...OAAAAOOOOAAAAO...',
  '....OddO....OddO....',
  '....OddO....OddO....',
  '....OOOO....OOOO....',
  '....................',
  '....................',
  '....................',
];

const DOG_BREED_COLORS: Readonly<Record<DogLegionBreed, { readonly fur: string; readonly armor: string; readonly eye: string }>> = {
  bulldog_phalanx: { fur: '#9a3412', armor: '#334155', eye: '#ef4444' },
  doberman_assassin: { fur: '#18181b', armor: '#7f1d1d', eye: '#f97316' },
  husky_berserker: { fur: '#64748b', armor: '#1e3a8a', eye: '#38bdf8' },
  bloodhound_gunner: { fur: '#78350f', armor: '#44403c', eye: '#facc15' },
};

export function getDogLegionBreedSprite(breed: DogLegionBreed): EnemySpriteMatrixSpec {
  const c = DOG_BREED_COLORS[breed];
  return {
    id: `dog_${breed}`,
    faction: 'iron_hound_legion',
    width: 20,
    height: 20,
    matrix: DOG_BREED_BASE_MATRIX_20X20,
    palette: {
      O: '#09090b',
      d: c.fur,
      w: '#e2e8f0',
      W: '#ffffff',
      n: '#0f172a',
      E: c.eye,
      S: '#94a3b8',
      A: c.armor,
    },
  };
}

export const ALL_4_DOG_BREEDS: ReadonlyArray<DogLegionBreed> = [
  'bulldog_phalanx',
  'doberman_assassin',
  'husky_berserker',
  'bloodhound_gunner',
];

export const FACTION_PALETTE_TABLE: Readonly<Record<OmniverseFactionId, { readonly primary: string; readonly accent: string; readonly glow: string }>> = {
  usurper_wolves: { primary: '#475569', accent: '#7e22ce', glow: '#fde047' },
  iron_hound_legion: { primary: '#7f1d1d', accent: '#334155', glow: '#f97316' },
  draconic_cataclysm: { primary: '#b91c1c', accent: '#ea580c', glow: '#fde047' },
  abyssal_kraken_armada: { primary: '#0e7490', accent: '#1e1b4b', glow: '#22d3ee' },
  clockwork_mecha_empire: { primary: '#a16207', accent: '#3f3f46', glow: '#facc15' },
  volcanic_obsidian_horde: { primary: '#991b1b', accent: '#1c1917', glow: '#fb923c' },
  astral_glacier_giants: { primary: '#0284c7', accent: '#e0f2fe', glow: '#7dd3fc' },
  tempest_sky_griffins: { primary: '#047857', accent: '#a7f3d0', glow: '#34d399' },
  mirror_shadow_doppelgangers: { primary: '#6d28d9', accent: '#0f172a', glow: '#e879f9' },
  void_eclipse_singularity: { primary: '#3b0764', accent: '#020617', glow: '#f43f5e' },
};

export function getEnemyFactionSprite(faction: OmniverseFactionId): EnemySpriteMatrixSpec {
  const p = FACTION_PALETTE_TABLE[faction];
  return {
    id: `enemy_${faction}`,
    faction,
    width: 20,
    height: 20,
    matrix: DOG_BREED_BASE_MATRIX_20X20,
    palette: {
      O: '#09090b',
      d: p.primary,
      w: '#e2e8f0',
      W: '#ffffff',
      n: '#0f172a',
      E: p.glow,
      S: '#cbd5e1',
      A: p.accent,
    },
  };
}
