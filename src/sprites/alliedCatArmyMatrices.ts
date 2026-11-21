/**
 * File 46 / 100 — Allied Cat Army Matrices (6 Distinct Cat Coats + Blacksmith Forgepaw).
 *
 * RENEWAL PILLAR 2 RULE #2 — STRICT OPEN-FACE CAT HEADGEAR:
 * - Every cat crown / headband / diadem sits STRICTLY at `y = 1..4` between the pointy ears!
 * - ZERO grey/brown rectangular box visors covering cat eyes (`y = 7..8`) or pink nose (`#ff8fab` at `y = 9`)!
 * - Includes programmatic `auditOpenFaceCatHeadgear()` validator verified by automated Vitest tests!
 * Zero `any` types.
 */

import type { AlliedCatRole, CatCoatBreed } from '../types/entities';

export interface AlliedCatSpriteSpec {
  readonly coat: CatCoatBreed;
  readonly role: AlliedCatRole;
  readonly matrix: ReadonlyArray<string>;
  readonly palette: Readonly<Record<string, string>>;
  readonly headgearMinRow: number;
  readonly headgearMaxRow: number;
}

const COAT_COLORS: Readonly<Record<CatCoatBreed, { readonly fur: string; readonly stripe: string; readonly eye: string }>> = {
  void_black: { fur: '#181626', stripe: '#312c4d', eye: '#fbbf24' },
  ginger_tabby: { fur: '#f97316', stripe: '#c2410c', eye: '#10b981' },
  tuxedo: { fur: '#1e293b', stripe: '#f8fafc', eye: '#38bdf8' },
  calico_tri: { fur: '#f8fafc', stripe: '#ea580c', eye: '#22c55e' },
  royal_siamese: { fur: '#fef3c7', stripe: '#573d2e', eye: '#38bdf8' },
  russian_blue: { fur: '#64748b', stripe: '#94a3b8', eye: '#4ade80' },
};

const ROLE_COLORS: Readonly<Record<AlliedCatRole, { readonly headBand: string; readonly gem: string; readonly armor: string }>> = {
  cat_knight: { headBand: '#94a3b8', gem: '#ef4444', armor: '#3b82f6' },
  lion_halberdier: { headBand: '#facc15', gem: '#dc2626', armor: '#d97706' },
  calico_archer: { headBand: '#15803d', gem: '#fde047', armor: '#166534' },
  arcane_cat_mage: { headBand: '#6366f1', gem: '#38bdf8', armor: '#4c1d95' },
  blacksmith_cat: { headBand: '#f59e0b', gem: '#fb923c', armor: '#78350f' },
};

/**
 * 20x20 Open-Face Cat Matrix:
 * - Headgear tokens (`H` = headband/crown, `G` = gem/crest) appear EXCLUSIVELY in rows `y = 1..4` between pointy ears!
 * - Eyes (`E`, `L`) sit unobstructed at `y = 7..8`!
 * - Pink nose (`p` = `#ff8fab`) sits unobstructed at `y = 9`!
 */
export const OPEN_FACE_CAT_BASE_MATRIX_20X20: ReadonlyArray<string> = [
  '....................',
  '....OO...GG...OO....',
  '...OfpO.HHHH.OfpO...',
  '..OfffOOHGGHOOfffO..',
  '..OfffO.HHHH.OfffO..',
  '..OffffffffffffffO..',
  '..OftfffffffffftfO..',
  '..OffLEffffffELffO..',
  '..OffEEffffffEEffO..',
  '..OffffffppffffffO..',
  '...OffffffffffftO...',
  '....OOAAAAAAAAOO....',
  '...OAAAAAAAAAAAAO...',
  '...OAAAYYYYYYAAAO...',
  '...OAAAAAAAAAAAAO...',
  '....OAAAOOOOAAAO....',
  '....OffO....OffO....',
  '....OffO....OffO....',
  '....OOOO....OOOO....',
  '....................',
];

export function buildAlliedCatSprite(coat: CatCoatBreed, role: AlliedCatRole): AlliedCatSpriteSpec {
  const c = COAT_COLORS[coat];
  const r = ROLE_COLORS[role];
  return {
    coat,
    role,
    matrix: OPEN_FACE_CAT_BASE_MATRIX_20X20,
    palette: {
      O: '#0f172a',
      f: c.fur,
      t: c.stripe,
      E: c.eye,
      L: '#ffffff',
      p: '#ff8fab', // guaranteed pink nose & inner ears!
      H: r.headBand,
      G: r.gem,
      A: r.armor,
      Y: '#fde047',
    },
    headgearMinRow: 1,
    headgearMaxRow: 4,
  };
}

export function auditOpenFaceCatHeadgear(spec: AlliedCatSpriteSpec): {
  readonly passed: boolean;
  readonly violationReason: string | null;
} {
  let hasPinkNose = spec.palette.p?.toLowerCase() === '#ff8fab';
  let hasEyes = false;
  let hasNosePixels = false;

  for (let y = 0; y < spec.matrix.length; y++) {
    const row = spec.matrix[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if ((ch === 'H' || ch === 'G') && (y < 1 || y > 4)) {
        return {
          passed: false,
          violationReason: `Headgear token '${ch}' found outside y=1..4 at row ${y}`,
        };
      }
      if (y >= 7 && y <= 8 && ch === 'E') hasEyes = true;
      if (y === 9 && ch === 'p') hasNosePixels = true;
    }
  }

  if (!hasEyes) return { passed: false, violationReason: 'Missing open cat eyes at rows 7..8' };
  if (!hasPinkNose || !hasNosePixels) {
    return { passed: false, violationReason: 'Missing unobstructed pink #ff8fab cat nose at row 9' };
  }
  return { passed: true, violationReason: null };
}

export const ALL_6_CAT_COATS: ReadonlyArray<CatCoatBreed> = [
  'void_black',
  'ginger_tabby',
  'tuxedo',
  'calico_tri',
  'royal_siamese',
  'russian_blue',
];

export const ALL_5_CAT_ROLES: ReadonlyArray<AlliedCatRole> = [
  'cat_knight',
  'lion_halberdier',
  'calico_archer',
  'arcane_cat_mage',
  'blacksmith_cat',
];
