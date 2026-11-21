import { AlliedCatUnitKind, CatCoatId, Enemy, UnitVisualVariant } from './types';

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function outlinedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  outline = '#09090b'
) {
  px(ctx, x - 1, y - 1, w + 2, h + 2, outline);
  px(ctx, x, y, w, h, fill);
}

// ============================================================================
// 1. ALLIED CAT SOLDIER PROCEDURAL VARIANT SPRITES (6 Coats x 5 Helms x 4 Classes)
// ============================================================================
const COAT_SPECS: Record<
  CatCoatId,
  {
    fur: string;
    shade: string;
    earInner: string;
    muzzle: string;
    paws: string;
    tail: string;
    patchA?: string;
    patchB?: string;
    hasMane?: boolean;
    hasMask?: boolean;
  }
> = {
  ginger_tabby: {
    fur: '#f28c28',
    shade: '#b85200',
    earInner: '#fda4af',
    muzzle: '#ffedd5',
    paws: '#ffffff',
    tail: '#b85200',
  },
  tuxedo: {
    fur: '#1e1e2c',
    shade: '#0f172a',
    earInner: '#f472b6',
    muzzle: '#ffffff',
    paws: '#ffffff',
    tail: '#1e1e2c',
    patchA: '#ffffff',
  },
  calico_tri: {
    fur: '#fff5e4',
    shade: '#fde68a',
    earInner: '#fda4af',
    muzzle: '#ffffff',
    paws: '#ffffff',
    tail: '#ea580c',
    patchA: '#ea580c',
    patchB: '#334155',
  },
  siamese_royal: {
    fur: '#f4e2c6',
    shade: '#d6bfa0',
    earInner: '#4a3228',
    muzzle: '#4a3228',
    paws: '#4a3228',
    tail: '#4a3228',
    hasMask: true,
  },
  russian_blue: {
    fur: '#6e7f94',
    shade: '#475569',
    earInner: '#fda4af',
    muzzle: '#cbd5e1',
    paws: '#e2e8f0',
    tail: '#475569',
  },
  golden_lion: {
    fur: '#e8b84b',
    shade: '#b45309',
    earInner: '#fde047',
    muzzle: '#fef3c7',
    paws: '#fde68a',
    tail: '#92400e',
    hasMane: true,
  },
};

const allyVariantCache: Record<string, HTMLCanvasElement> = {};

export function getAlliedCatVariantSprite(
  kind: AlliedCatUnitKind,
  variant: UnitVisualVariant | undefined,
  frame: number
): HTMLCanvasElement {
  const v: UnitVisualVariant = variant ?? {
    coatId: 'ginger_tabby',
    helmetId: 0,
    weaponId: 0,
    shieldEmblemColor: '#dc2626',
    eyeColor: '#38bdf8',
    scarOrStripe: 0,
    animPhaseOffset: 0,
  };
  const f = frame % 2;
  const key = `ally_${kind}_${v.coatId}_${v.helmetId}_${v.weaponId}_${v.shieldEmblemColor}_${v.eyeColor}_${v.scarOrStripe}_${f}`;
  if (allyVariantCache[key]) return allyVariantCache[key];

  const c = makeCanvas(24, 24);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const coat = COAT_SPECS[v.coatId] ?? COAT_SPECS.ginger_tabby;
  const legShift = f === 1 ? 1 : 0;

  // Tail (animated wag)
  px(ctx, 3, 14 - legShift, 3, 4, '#09090b');
  px(ctx, 4, 15 - legShift, 2, 3, coat.tail);

  // Legs & Paws
  outlinedRect(ctx, 8, 17 + legShift, 3, 4, coat.paws);
  outlinedRect(ctx, 13, 17 - legShift, 3, 4, coat.paws);

  // Reformed Dog Kingdom Allies (Acts 83–122) — Friendly Emerald & Gold Alliance Armor!
  if (
    kind === 'bulldog_paladin' ||
    kind === 'doberman_blade' ||
    kind === 'husky_berserker' ||
    kind === 'wolf_captain'
  ) {
    outlinedRect(ctx, 7, 17 + legShift, 3, 4, '#f8fafc');
    outlinedRect(ctx, 14, 17 - legShift, 3, 4, '#f8fafc');
    const dogArm =
      kind === 'bulldog_paladin'
        ? { body: '#10b981', trim: '#fde047', fur: '#9a3412', eye: '#38bdf8' }
        : kind === 'doberman_blade'
        ? { body: '#059669', trim: '#fef08a', fur: '#18181b', eye: '#facc15' }
        : kind === 'husky_berserker'
        ? { body: '#0284c7', trim: '#fde047', fur: '#64748b', eye: '#67e8f9' }
        : { body: '#ca8a04', trim: '#ffffff', fur: '#475569', eye: '#38bdf8' };

    outlinedRect(ctx, 6, 11, 12, 6, dogArm.body);
    px(ctx, 9, 12, 6, 2, dogArm.trim);
    // Dog ears & head
    outlinedRect(ctx, 6, 2, 3, 3, dogArm.fur);
    outlinedRect(ctx, 15, 2, 3, 3, dogArm.fur);
    outlinedRect(ctx, 6, 4, 12, 6, dogArm.fur);
    if (kind === 'husky_berserker') px(ctx, 8, 6, 8, 4, '#f8fafc');
    if (kind === 'doberman_blade') px(ctx, 8, 7, 8, 3, '#d97706');
    px(ctx, 8, 6, 2, 2, dogArm.eye);
    px(ctx, 14, 6, 2, 2, dogArm.eye);
    // Friendly Golden Alliance Helmet Crest + Emerald Shield + Blade
    px(ctx, 9, 1, 6, 2, '#fde047');
    outlinedRect(ctx, 2, 10, 5, 6, '#10b981');
    px(ctx, 3, 11, 3, 4, '#fde047');
    outlinedRect(ctx, 19, 5 - legShift, 2, 10, '#e2e8f0');
    px(ctx, 18, 12 - legShift, 4, 2, '#facc15');
    if (kind === 'wolf_captain') {
      // Friendly Gold Standard Pennant
      px(ctx, 11, 0, 2, 4, '#fde047');
      outlinedRect(ctx, 13, 0, 5, 3, '#10b981');
    }
    allyVariantCache[key] = c;
    return c;
  }

  // Class Armor / Cloak Torso
  const armorColors: Record<'cat_knight' | 'lion_halberdier' | 'calico_archer' | 'arcane_cat_mage', { body: string; trim: string; cape: string }> = {
    cat_knight: { body: '#cbd5e1', trim: '#facc15', cape: v.shieldEmblemColor },
    lion_halberdier: { body: '#f59e0b', trim: '#fef08a', cape: '#b91c1c' },
    calico_archer: { body: '#15803d', trim: '#fde047', cape: '#166534' },
    arcane_cat_mage: { body: '#4338ca', trim: '#38bdf8', cape: '#312e81' },
  };
  const arm = armorColors[kind];
  outlinedRect(ctx, 6, 12, 12, 5, arm.cape);
  outlinedRect(ctx, 7, 11, 10, 6, arm.body);
  px(ctx, 9, 12, 6, 2, arm.trim);
  if (v.coatId === 'tuxedo') {
    px(ctx, 10, 11, 4, 3, '#ffffff'); // Tuxedo white bib
  }

  // Golden Lion Mane if golden_lion or lion_halberdier
  if (coat.hasMane || kind === 'lion_halberdier') {
    outlinedRect(ctx, 5, 3, 14, 9, '#92400e');
    px(ctx, 6, 4, 12, 7, '#b45309');
  }

  // Cat Ears
  outlinedRect(ctx, 6, 2, 3, 3, coat.patchA ?? coat.fur);
  px(ctx, 7, 3, 1, 2, coat.earInner);
  outlinedRect(ctx, 15, 2, 3, 3, coat.patchB ?? coat.fur);
  px(ctx, 16, 3, 1, 2, coat.earInner);

  // Cat Head (10x7)
  outlinedRect(ctx, 7, 4, 10, 7, coat.fur);

  // Coat Pattern Markings (No two coats look alike!)
  if (v.coatId === 'ginger_tabby') {
    px(ctx, 8, 5, 2, 1, coat.shade);
    px(ctx, 14, 5, 2, 1, coat.shade);
    px(ctx, 11, 4, 2, 2, coat.shade);
  } else if (v.coatId === 'calico_tri') {
    px(ctx, 7, 4, 4, 3, '#ea580c');
    px(ctx, 13, 4, 4, 3, '#334155');
  } else if (v.coatId === 'siamese_royal') {
    px(ctx, 9, 6, 6, 4, '#4a3228');
  } else if (v.coatId === 'tuxedo') {
    px(ctx, 9, 8, 6, 3, '#ffffff');
  } else if (v.coatId === 'russian_blue') {
    px(ctx, 6, 8, 2, 2, '#cbd5e1');
    px(ctx, 16, 8, 2, 2, '#cbd5e1');
  }

  // Mystic / Expressive Eyes & Pink/Brown Nose
  px(ctx, 8, 7, 2, 2, v.eyeColor);
  px(ctx, 8, 7, 1, 1, '#ffffff');
  px(ctx, 14, 7, 2, 2, v.eyeColor);
  px(ctx, 14, 7, 1, 1, '#ffffff');
  px(ctx, 11, 9, 2, 1, '#f43f5e');

  // 5 Distinct Headgear Variations — Strictly seated on the forehead between the ears (y = 0..4)!
  if (kind === 'arcane_cat_mage' || v.helmetId === 4) {
    // Pointed Starry Apprentice Mini-Hat between ears
    outlinedRect(ctx, 9, 1, 6, 3, '#4f46e5');
    outlinedRect(ctx, 10, 0, 4, 2, '#6366f1');
    px(ctx, 11, 1, 2, 1, '#fde047');
  } else if (kind === 'calico_archer' || v.helmetId === 3) {
    // Ranger Green Forehead Bandana + Jaunty Feather between ears
    px(ctx, 9, 3, 6, 2, '#15803d');
    px(ctx, 13, 0, 2, 3, '#ef4444');
  } else if (kind === 'lion_halberdier' || v.helmetId === 2) {
    // Royal 3-Point Golden Mini-Crown between ears
    px(ctx, 9, 2, 6, 2, '#facc15');
    px(ctx, 9, 1, 1, 1, '#fde047');
    px(ctx, 11, 1, 2, 1, '#fde047');
    px(ctx, 14, 1, 1, 1, '#fde047');
    px(ctx, 11, 2, 2, 1, '#dc2626');
  } else if (v.helmetId === 1) {
    // Winged Valkyrie Forehead Circlet
    px(ctx, 9, 3, 6, 2, '#38bdf8');
    px(ctx, 8, 2, 1, 2, '#ffffff');
    px(ctx, 15, 2, 1, 2, '#ffffff');
  } else {
    // Knight Forehead Diadem (2px shiny steel band + gold gem + tiny crimson plume, full open cat face!)
    px(ctx, 9, 3, 6, 2, '#94a3b8');
    px(ctx, 11, 3, 2, 1, '#fde047');
    px(ctx, 11, 1, 2, 2, '#ef4444');
  }

  // Class Weapons & Kite Shields (Right & Left sides)
  if (kind === 'cat_knight') {
    // Broadsword on right + Kite Shield with custom emblem color on left
    outlinedRect(ctx, 19, 6 - legShift, 2, 9, '#e2e8f0');
    px(ctx, 18, 12 - legShift, 4, 2, '#facc15');
    outlinedRect(ctx, 3, 10, 5, 6, v.shieldEmblemColor);
    px(ctx, 5, 11, 1, 4, '#fde047');
  } else if (kind === 'lion_halberdier') {
    // Long Diagonal Polearm Halberd
    outlinedRect(ctx, 19, 2 - legShift, 2, 18, '#78350f');
    outlinedRect(ctx, 17, 2 - legShift, 5, 5, '#fde047');
    px(ctx, 18, 3 - legShift, 3, 3, '#ffffff');
  } else if (kind === 'calico_archer') {
    // Wooden Recurve Bow + Quiver
    outlinedRect(ctx, 18, 6, 3, 9, '#92400e');
    px(ctx, 17, 7, 1, 7, '#e2e8f0');
    px(ctx, 16, 10, 5, 1, '#fde047');
  } else {
    // Arcane Cat Mage: Glowing Crystal Staff + Floating Rune Orb
    outlinedRect(ctx, 19, 5, 2, 13, '#6d28d9');
    outlinedRect(ctx, 18, 3 - legShift, 4, 4, '#38bdf8');
    px(ctx, 19, 4 - legShift, 2, 2, '#fef08a');
    outlinedRect(ctx, 3, 7 + legShift, 3, 3, '#c084fc');
  }

  allyVariantCache[key] = c;
  return c;
}

// ============================================================================
// 2. DOG KINGDOM BREEDS & ENEMY VARIANT SPRITES (Zero Identical Clones!)
// ============================================================================
const enemyVariantCache: Record<string, HTMLCanvasElement> = {};

export function getEnemyVariantSprite(enemy: Enemy, frame: number): HTMLCanvasElement {
  const v = enemy.variant;
  const f = frame % 2;
  const breed = v?.breedId ?? 'bulldog_phalanx';
  const helm = v?.helmetId ?? 0;
  const weap = v?.weaponId ?? 0;
  const stripe = v?.scarOrStripe ?? 0;
  const eye = v?.eyeColor ?? '#ef4444';
  const emblem = v?.shieldEmblemColor ?? '#991b1b';

  const key = `en_${enemy.kind}_${breed}_${helm}_${weap}_${stripe}_${eye}_${emblem}_${enemy.isWolfCaptain ? 1 : 0}_${f}`;
  if (enemyVariantCache[key]) return enemyVariantCache[key];

  // For Dog Legion units (hound_scout / shadow_wolf) or War Act dog squads, draw the 4 distinct Dog Breeds!
  if (enemy.kind === 'hound_scout' || enemy.kind === 'shadow_wolf') {
    const c = makeCanvas(24, 24);
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const step = f === 1 ? 1 : 0;

    if (breed === 'bulldog_phalanx') {
      // Wide, stocky 20x18 Bulldog Heavy Phalanx with spiked iron collar, underbite fangs, and tower shield!
      outlinedRect(ctx, 6, 17 + step, 4, 4, '#78350f');
      outlinedRect(ctx, 14, 17 - step, 4, 4, '#78350f');
      outlinedRect(ctx, 5, 10, 14, 8, '#334155'); // Wide stocky plate armor
      px(ctx, 6, 9, 12, 2, '#94a3b8'); // Spiked iron collar
      px(ctx, 7, 8, 2, 1, '#ffffff');
      px(ctx, 11, 8, 2, 1, '#ffffff');
      px(ctx, 15, 8, 2, 1, '#ffffff');
      outlinedRect(ctx, 5, 3, 14, 7, stripe % 2 === 0 ? '#9a3412' : '#78350f'); // Wide bulldog head
      px(ctx, 7, 5, 2, 2, eye);
      px(ctx, 15, 5, 2, 2, eye);
      px(ctx, 8, 8, 8, 2, '#d6d3d1'); // Heavy jaw
      px(ctx, 8, 7, 2, 2, '#ffffff'); // Underbite left fang
      px(ctx, 14, 7, 2, 2, '#ffffff'); // Underbite right fang
      // Tower Shield & Cleaver
      outlinedRect(ctx, 2, 8, 5, 10, emblem);
      px(ctx, 3, 10, 3, 6, '#64748b');
      outlinedRect(ctx, 19, 7 - step, 3, 8, '#cbd5e1');
    } else if (breed === 'doberman_shock') {
      // Tall, sleek Black-and-Tan Doberman Shock-Trooper with cropped pointy ears & dual crimson daggers!
      outlinedRect(ctx, 8, 17 + step, 3, 5, '#b45309');
      outlinedRect(ctx, 13, 17 - step, 3, 5, '#b45309');
      outlinedRect(ctx, 7, 10, 10, 7, '#18181b');
      px(ctx, 9, 11, 6, 4, '#dc2626'); // Crimson chest harness
      // Tall cropped pointy ears
      outlinedRect(ctx, 7, 1, 2, 4, '#18181b');
      outlinedRect(ctx, 15, 1, 2, 4, '#18181b');
      outlinedRect(ctx, 7, 4, 10, 6, '#18181b');
      px(ctx, 8, 7, 8, 3, '#d97706'); // Tan muzzle
      px(ctx, 8, 5, 2, 2, '#f43f5e');
      px(ctx, 14, 5, 2, 2, '#f43f5e');
      // Dual Crimson Daggers
      outlinedRect(ctx, 3, 9 + step, 3, 6, '#ef4444');
      outlinedRect(ctx, 18, 9 - step, 3, 6, '#ef4444');
    } else if (breed === 'husky_raider') {
      // Siberian Husky Frost-Raider: Grey-and-white wolfish coat, icy blue eyes, fur-lined Viking pauldrons, battleaxe!
      outlinedRect(ctx, 7, 17 + step, 3, 4, '#e2e8f0');
      outlinedRect(ctx, 14, 17 - step, 3, 4, '#e2e8f0');
      outlinedRect(ctx, 5, 10, 14, 7, '#475569');
      px(ctx, 5, 9, 14, 3, '#cbd5e1'); // Fluffy fur pauldrons
      outlinedRect(ctx, 6, 2, 3, 3, '#64748b');
      outlinedRect(ctx, 15, 2, 3, 3, '#64748b');
      outlinedRect(ctx, 6, 4, 12, 6, '#64748b');
      px(ctx, 8, 6, 8, 4, '#f8fafc'); // White husky facial mask
      px(ctx, 8, 5, 2, 2, '#38bdf8'); // Icy blue eyes
      px(ctx, 14, 5, 2, 2, '#38bdf8');
      if (helm % 2 === 0) {
        // Viking Horned Helm
        px(ctx, 4, 2, 3, 2, '#fef3c7');
        px(ctx, 17, 2, 3, 2, '#fef3c7');
      }
      // Heavy Viking Battleaxe
      outlinedRect(ctx, 19, 4 - step, 2, 13, '#78350f');
      outlinedRect(ctx, 16, 4 - step, 6, 5, '#bae6fd');
    } else {
      // Bloodhound Siege Gunner: Long floppy ears, red goggles, bronze hand-mortar / crossbow!
      outlinedRect(ctx, 7, 17 + step, 3, 4, '#7c2d12');
      outlinedRect(ctx, 14, 17 - step, 3, 4, '#7c2d12');
      outlinedRect(ctx, 7, 10, 10, 7, '#451a03');
      outlinedRect(ctx, 7, 3, 10, 7, '#9a3412');
      // Long floppy ears hanging down sides
      outlinedRect(ctx, 4, 5, 3, 7, '#451a03');
      outlinedRect(ctx, 17, 5, 3, 7, '#451a03');
      // Red Siege Goggles
      outlinedRect(ctx, 7, 4, 4, 3, '#ef4444');
      outlinedRect(ctx, 13, 4, 4, 3, '#ef4444');
      px(ctx, 8, 5, 2, 1, '#fef08a');
      px(ctx, 14, 5, 2, 1, '#fef08a');
      // Bronze Hand-Mortar Cannon
      outlinedRect(ctx, 16, 9 - step, 6, 5, '#d97706');
      px(ctx, 20, 10 - step, 2, 3, '#09090b');
    }

    if (enemy.isWolfCaptain) {
      // Wolf Banner Captain Pennant on back
      px(ctx, 11, 0, 2, 5, '#facc15');
      outlinedRect(ctx, 13, 0, 6, 4, '#e11d48');
    }

    enemyVariantCache[key] = c;
    return c;
  }

  // Multi-Variant Non-Dog Enemies (Goblins, Boars, Badgers, Sporelings, Ice Golems, Salamanders, Crocs, Sentinels)
  const c = makeCanvas(22, 22);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const step = f === 1 ? 1 : 0;

  const skinTones = ['#22c55e', '#16a34a', '#4ade80', '#84cc16'];
  const skin = skinTones[stripe % skinTones.length];

  if (enemy.kind === 'goblin_grunt' || enemy.kind === 'goblin_archer') {
    outlinedRect(ctx, 7, 15 + step, 3, 4, skin);
    outlinedRect(ctx, 12, 15 - step, 3, 4, skin);
    outlinedRect(ctx, 6, 9, 10, 6, helm % 2 === 0 ? '#78350f' : '#334155');
    // Pointed goblin ears
    outlinedRect(ctx, 3, 5, 3, 2, skin);
    outlinedRect(ctx, 16, 5, 3, 2, skin);
    outlinedRect(ctx, 6, 3, 10, 6, skin);
    px(ctx, 8, 5, 2, 2, eye);
    px(ctx, 12, 5, 2, 2, eye);
    if (helm === 1) outlinedRect(ctx, 6, 1, 10, 2, '#94a3b8'); // Iron cap
    if (helm === 2) outlinedRect(ctx, 7, 1, 8, 2, '#b91c1c'); // Red bandana
    if (helm === 3) outlinedRect(ctx, 9, 0, 4, 3, '#f97316'); // Mohawk
    if (enemy.kind === 'goblin_archer') {
      outlinedRect(ctx, 16, 5, 3, 9, '#a16207');
      px(ctx, 15, 9, 5, 1, '#fef08a');
    } else {
      outlinedRect(ctx, 17, 5 - step, 3, 8, weap % 2 === 0 ? '#94a3b8' : '#78350f');
    }
  } else if (enemy.kind === 'rabid_boar' || enemy.kind === 'razor_badger') {
    const bodyCol =
      enemy.kind === 'rabid_boar'
        ? ['#78350f', '#9a3412', '#57280f', '#44403c'][stripe % 4]
        : ['#27272a', '#1e293b', '#334155', '#0f172a'][stripe % 4];
    outlinedRect(ctx, 5, 15 + step, 3, 4, bodyCol);
    outlinedRect(ctx, 14, 15 - step, 3, 4, bodyCol);
    outlinedRect(ctx, 4, 7, 14, 8, bodyCol);
    if (enemy.kind === 'razor_badger') {
      px(ctx, 5, 7, 12, 3, '#f8fafc'); // White badger dorsal stripe
    } else {
      // Boar ivory tusks
      outlinedRect(ctx, 3, 10, 3, 3, '#fef9c3');
      outlinedRect(ctx, 16, 10, 3, 3, '#fef9c3');
    }
    px(ctx, 7, 9, 2, 2, eye);
    px(ctx, 13, 9, 2, 2, eye);
  } else if (enemy.kind === 'sporeling') {
    const capCol = ['#c026d3', '#9333ea', '#0d9488', '#e11d48'][helm % 4];
    outlinedRect(ctx, 6, 9, 10, 9, '#fef3c7');
    outlinedRect(ctx, 3, 3 - step, 16, 6, capCol);
    px(ctx, 6, 4 - step, 3, 2, '#f0abfc');
    px(ctx, 13, 4 - step, 3, 2, '#f0abfc');
    px(ctx, 8, 12, 2, 2, eye);
    px(ctx, 12, 12, 2, 2, eye);
  } else if (enemy.kind === 'ice_golem' || enemy.kind === 'celestial_sentinel') {
    const crystalCol =
      enemy.kind === 'ice_golem'
        ? ['#38bdf8', '#0ea5e9', '#67e8f9', '#818cf8'][helm % 4]
        : ['#818cf8', '#a855f7', '#fbbf24', '#38bdf8'][helm % 4];
    outlinedRect(ctx, 5, 4, 12, 13, crystalCol);
    px(ctx, 7, 6, 8, 3, '#ffffff');
    px(ctx, 7, 8, 2, 2, eye);
    px(ctx, 13, 8, 2, 2, eye);
    outlinedRect(ctx, 2, 7 + step, 3, 7, crystalCol);
    outlinedRect(ctx, 17, 7 - step, 3, 7, crystalCol);
  } else if (
    enemy.kind === 'wyvern_kin' ||
    enemy.kind === 'drakonid_lancer' ||
    enemy.kind === 'kobold_thief' ||
    enemy.kind === 'magma_drake' ||
    enemy.kind === 'void_sorcerer'
  ) {
    // Arc III Dragon Legion Units (Distinct winged wyverns, lancers, treasure kobolds, magma drakes & void dragon-mages)
    if (enemy.kind === 'wyvern_kin' || enemy.kind === 'magma_drake') {
      const sc = enemy.kind === 'magma_drake' ? '#dc2626' : ['#b91c1c', '#9333ea', '#0369a1', '#15803d'][stripe % 4];
      const wing = enemy.kind === 'magma_drake' ? '#f97316' : '#f59e0b';
      // Bat-like dragon wings
      outlinedRect(ctx, 1, 5 - step * 2, 5, 8, wing);
      outlinedRect(ctx, 16, 5 - step * 2, 5, 8, wing);
      outlinedRect(ctx, 6, 8, 10, 9, sc);
      outlinedRect(ctx, 7, 3, 8, 6, sc);
      px(ctx, 7, 1, 2, 2, '#fef08a'); // Horns
      px(ctx, 13, 1, 2, 2, '#fef08a');
      px(ctx, 8, 5, 2, 2, '#fde047');
      px(ctx, 12, 5, 2, 2, '#fde047');
    } else if (enemy.kind === 'drakonid_lancer') {
      const armCol = ['#991b1b', '#7c2d12', '#475569', '#312e81'][helm % 4];
      outlinedRect(ctx, 6, 15 + step, 3, 4, armCol);
      outlinedRect(ctx, 13, 15 - step, 3, 4, armCol);
      outlinedRect(ctx, 5, 8, 12, 8, armCol);
      outlinedRect(ctx, 6, 3, 10, 6, '#b91c1c');
      px(ctx, 8, 5, 2, 2, '#fef08a');
      px(ctx, 12, 5, 2, 2, '#fef08a');
      // Long Dragon-Halberd Lance
      outlinedRect(ctx, 18, 1 - step, 2, 18, '#fde047');
      px(ctx, 17, 1 - step, 4, 4, '#ffffff');
    } else if (enemy.kind === 'kobold_thief') {
      // Treasure Kobold carrying a glittering gold coin sack!
      outlinedRect(ctx, 7, 15 + step, 3, 4, '#92400e');
      outlinedRect(ctx, 12, 15 - step, 3, 4, '#92400e');
      outlinedRect(ctx, 6, 9, 10, 7, '#78350f');
      outlinedRect(ctx, 2, 7, 5, 8, '#eab308'); // Giant Gold Sack on back
      px(ctx, 3, 9, 3, 4, '#fef08a');
      outlinedRect(ctx, 7, 4, 8, 5, '#b45309');
      px(ctx, 8, 6, 2, 2, '#fef08a');
      px(ctx, 12, 6, 2, 2, '#fef08a');
    } else {
      // void_sorcerer
      outlinedRect(ctx, 6, 8, 10, 11, '#3b0764');
      outlinedRect(ctx, 7, 2 - step, 8, 6, '#581c87');
      px(ctx, 8, 5 - step, 2, 2, '#e879f9');
      px(ctx, 12, 5 - step, 2, 2, '#e879f9');
      outlinedRect(ctx, 17, 4, 2, 14, '#c084fc');
      px(ctx, 16, 2 - step, 4, 4, '#38bdf8');
    }
  } else {
    // lava_salamander or swamp_croc
    const crocCol =
      enemy.kind === 'swamp_croc'
        ? ['#15803d', '#166534', '#4d7c0f', '#0f766e'][stripe % 4]
        : ['#ea580c', '#dc2626', '#d97706', '#991b1b'][stripe % 4];
    outlinedRect(ctx, 4, 8, 14, 9, crocCol);
    outlinedRect(ctx, 6, 4, 10, 5, crocCol);
    px(ctx, 7, 5, 2, 2, '#fde047');
    px(ctx, 13, 5, 2, 2, '#fde047');
    px(ctx, 7, 9, 8, 2, '#fef08a');
  }

  enemyVariantCache[key] = c;
  return c;
}

// ============================================================================
// 3. BESPOKE PIXEL-ART SPRITE GENERATOR FOR EVERY BOSS & MINI-BOSS!
// ============================================================================
const bossSpriteCache: Record<string, HTMLCanvasElement> = {};

export function getBossSprite(bossVisualId: string, frame: number): HTMLCanvasElement {
  const f = frame % 2;
  const key = `${bossVisualId}_${f}`;
  if (bossSpriteCache[key]) return bossSpriteCache[key];

  // Determine canvas size: Mini-Bosses = 32x32, Regional Bosses = 44x44, Huge Bosses = 52x56, Colossal Ragnarok = 64x64, Bahamut = 72x72
  const isMini = bossVisualId.startsWith('mini_');
  const isBahamut = bossVisualId.startsWith('boss_bahamut_');
  const isColossal = bossVisualId === 'boss_ragnarok';
  const isChariotOrDual =
    bossVisualId === 'boss_emperor_chariot_p1' || bossVisualId === 'boss_dual_sovereign_p2';
  const isHuge =
    bossVisualId === 'boss_fenrir_p2' ||
    bossVisualId === 'boss_viperfang' ||
    bossVisualId === 'boss_cerberus_barge' ||
    bossVisualId === 'boss_iron_jaws' ||
    bossVisualId === 'boss_cryo_fang' ||
    bossVisualId === 'boss_vermithrax' ||
    bossVisualId === 'boss_aurum_rex' ||
    bossVisualId === 'boss_tempestria' ||
    bossVisualId === 'boss_glacius_zero' ||
    bossVisualId === 'boss_miasma_gorgon' ||
    bossVisualId === 'boss_nebula_wyrm' ||
    bossVisualId === 'boss_balrog_drake';
  const size = isMini ? 32 : isBahamut ? 72 : isColossal ? 64 : isChariotOrDual ? 56 : isHuge ? 52 : 44;
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const bob = f === 1 ? 1 : 0;

  switch (bossVisualId) {
    // ========================================================================
    // ARC 1 REGIONAL BOSSES (Acts 5, 10, 15, 20, 25, 30, 35, 39, 41)
    // ========================================================================
    case 'boss_grommash': {
      // Act 5: Hulking mossy-green orc-goblin with horned boar-skull helmet, crimson war-paint, gold eyepatch & giant spiked iron kanabo club
      outlinedRect(ctx, 12, 31 + bob, 6, 9, '#14532d');
      outlinedRect(ctx, 24, 31 - bob, 6, 9, '#14532d');
      outlinedRect(ctx, 10, 17, 22, 15, '#16a34a'); // Hulking torso
      outlinedRect(ctx, 11, 20, 20, 9, '#78350f'); // Spiked war-harness
      px(ctx, 13, 18, 4, 2, '#dc2626'); // Crimson war-paint
      px(ctx, 25, 18, 4, 2, '#dc2626');
      // Head + Boar-Skull Helmet with Ivory Horns
      outlinedRect(ctx, 12, 7, 18, 11, '#16a34a');
      outlinedRect(ctx, 11, 4, 20, 5, '#fef3c7'); // Boar skull helm
      outlinedRect(ctx, 6, 2, 5, 4, '#fef9c3'); // Left horn
      outlinedRect(ctx, 31, 2, 5, 4, '#fef9c3'); // Right horn
      px(ctx, 14, 11, 4, 3, '#facc15'); // Gold Eyepatch
      px(ctx, 24, 11, 3, 3, '#ef4444'); // Glowing red eye
      px(ctx, 15, 15, 3, 3, '#ffffff'); // Orc tusks
      px(ctx, 24, 15, 3, 3, '#ffffff');
      // Colossal Two-Handed Spiked Iron Kanabo Club
      outlinedRect(ctx, 34, 8 - bob, 7, 28, '#334155');
      px(ctx, 33, 10 - bob, 9, 2, '#e2e8f0');
      px(ctx, 33, 16 - bob, 9, 2, '#e2e8f0');
      px(ctx, 33, 22 - bob, 9, 2, '#e2e8f0');
      break;
    }

    case 'boss_brambleback': {
      // Act 10: Massive grizzly bear with living thorny rose-vines and glowing green forest crystals growing from cracked iron shoulder-plates
      outlinedRect(ctx, 10, 32 + bob, 8, 8, '#451a03');
      outlinedRect(ctx, 26, 32 - bob, 8, 8, '#451a03');
      outlinedRect(ctx, 7, 14, 30, 19, '#57280f'); // Massive grizzly body
      // Cracked Iron Shoulder-Plates + Glowing Green Forest Crystals
      outlinedRect(ctx, 5, 12, 10, 8, '#64748b');
      outlinedRect(ctx, 29, 12, 10, 8, '#64748b');
      outlinedRect(ctx, 6, 6 - bob, 4, 7, '#4ade80'); // Crystal spire L
      outlinedRect(ctx, 34, 6 - bob, 4, 7, '#4ade80'); // Crystal spire R
      // Living Thorny Rose-Vines across chest
      px(ctx, 10, 18, 24, 3, '#15803d');
      px(ctx, 14, 17, 3, 3, '#f43f5e'); // Rose bloom
      px(ctx, 26, 19, 3, 3, '#f43f5e');
      // Bear Head & Roaring Maw
      outlinedRect(ctx, 13, 5, 18, 11, '#78350f');
      px(ctx, 16, 8, 3, 2, '#f97316');
      px(ctx, 25, 8, 3, 2, '#f97316');
      outlinedRect(ctx, 16, 11, 12, 5, '#d6d3d1');
      px(ctx, 18, 13, 8, 2, '#ef4444');
      break;
    }

    case 'boss_mycora': {
      // Act 15: Giant bloated purple-and-cyan bioluminescent Toad-King with crooked golden crown, neon mushroom back & whip tongue
      outlinedRect(ctx, 6, 16 + bob, 32, 20, '#701a75'); // Bloated amphibian body
      px(ctx, 10, 22 + bob, 24, 12, '#2dd4bf'); // Bioluminescent cyan belly
      // Giant Neon Mushroom Cap growing on his back
      outlinedRect(ctx, 8, 7 - bob, 28, 9, '#c026d3');
      px(ctx, 12, 9 - bob, 5, 3, '#67e8f9');
      px(ctx, 26, 9 - bob, 5, 3, '#67e8f9');
      // Crooked Golden Crown
      outlinedRect(ctx, 16, 2 - bob, 12, 5, '#facc15');
      // Bulging Toad Eyes + Whip-like Pink Tongue
      outlinedRect(ctx, 11, 13, 6, 5, '#fef08a');
      outlinedRect(ctx, 27, 13, 6, 5, '#fef08a');
      px(ctx, 13, 15, 2, 2, '#09090b');
      px(ctx, 29, 15, 2, 2, '#09090b');
      outlinedRect(ctx, 4, 24 + bob, 16, 4, '#f472b6'); // Whip tongue
      break;
    }

    case 'boss_general_vane': {
      // Act 20: Towering scar-faced brindle Mastiff in crimson-and-gold plate armor with serrated tower shield & spiked chain-flail
      outlinedRect(ctx, 12, 31 + bob, 6, 9, '#7f1d1d');
      outlinedRect(ctx, 25, 31 - bob, 6, 9, '#7f1d1d');
      outlinedRect(ctx, 10, 15, 23, 16, '#991b1b'); // Crimson plate
      px(ctx, 13, 17, 17, 10, '#facc15'); // Gold breastplate trim
      outlinedRect(ctx, 13, 5, 17, 11, '#78350f'); // Brindle Mastiff head
      px(ctx, 15, 7, 2, 6, '#fca5a5'); // Battle scar over left eye
      px(ctx, 15, 8, 3, 2, '#ef4444');
      px(ctx, 24, 8, 3, 2, '#ef4444');
      // Serrated Tower Shield (Left)
      outlinedRect(ctx, 2, 13, 9, 20, '#dc2626');
      px(ctx, 4, 15, 5, 16, '#facc15');
      // Swinging Spiked Chain-Flail (Right)
      px(ctx, 34, 14, 2, 8, '#cbd5e1');
      outlinedRect(ctx, 32, 22 - bob * 2, 8, 8, '#475569');
      px(ctx, 35, 20 - bob * 2, 2, 12, '#ffffff');
      break;
    }

    case 'boss_cryo_fang': {
      // Act 25: Shaggy frost-blue woolly mammoth-wolf hybrid (52x52) with two giant curved ice tusks & frozen rune-monolith on back
      outlinedRect(ctx, 12, 36 + bob, 8, 10, '#0369a1');
      outlinedRect(ctx, 32, 36 - bob, 8, 10, '#0369a1');
      // Frozen Rune-Monolith chained to back
      outlinedRect(ctx, 18, 3, 16, 15, '#0284c7');
      px(ctx, 23, 6, 6, 9, '#67e8f9');
      // Shaggy Frost-Blue Mammoth-Wolf Body
      outlinedRect(ctx, 10, 15, 32, 22, '#0284c7');
      px(ctx, 13, 18, 26, 15, '#38bdf8');
      // Two Giant Curved Translucent Ice Tusks!
      outlinedRect(ctx, 2, 20 - bob, 10, 12, '#e0f2fe');
      outlinedRect(ctx, 40, 20 - bob, 10, 12, '#e0f2fe');
      px(ctx, 18, 20, 4, 3, '#fef08a');
      px(ctx, 30, 20, 4, 3, '#fef08a');
      // Icicle Beard
      px(ctx, 20, 32, 12, 5, '#bae6fd');
      break;
    }

    case 'boss_volcanis': {
      // Act 30: Obsidian-scaled Salamander Drake with glowing orange magma belly cracks, frilled fire-crown & THREE flame tails!
      // Three independently whipping Flame Tails
      outlinedRect(ctx, 3, 6 + bob, 6, 14, '#f97316');
      outlinedRect(ctx, 19, 2 - bob, 6, 12, '#fde047');
      outlinedRect(ctx, 35, 6 + bob, 6, 14, '#ef4444');
      // Obsidian Scaled Body + Magma Cracks
      outlinedRect(ctx, 9, 15, 26, 20, '#1c1917');
      px(ctx, 13, 18, 18, 2, '#f97316');
      px(ctx, 15, 23, 14, 2, '#fde047');
      px(ctx, 13, 28, 18, 2, '#ef4444');
      // Frilled Fire-Crown Head
      outlinedRect(ctx, 11, 8, 22, 9, '#dc2626');
      px(ctx, 9, 6, 26, 3, '#fde047');
      px(ctx, 15, 11, 3, 3, '#fef08a');
      px(ctx, 26, 11, 3, 3, '#fef08a');
      break;
    }

    case 'boss_viperfang': {
      // Act 35: Coiled Swamp Hydra (52x52) with THREE distinct heads: Left=Venom Green, Center=Frost Cyan, Right=Hellfire Crimson!
      outlinedRect(ctx, 10, 26, 32, 20, '#14532d');
      px(ctx, 14, 30, 24, 12, '#4d7c0f');
      // Left Neck & Head (Venom Green + Dripping Acid)
      outlinedRect(ctx, 4, 10 + bob, 11, 18, '#65a30d');
      px(ctx, 6, 13 + bob, 3, 3, '#fef08a');
      px(ctx, 5, 24 + bob, 4, 4, '#a3e635');
      // Center Neck & Head (Frost Cyan + Horned Crown)
      outlinedRect(ctx, 20, 4 - bob, 12, 24, '#0891b2');
      px(ctx, 22, 1 - bob, 8, 3, '#facc15');
      px(ctx, 22, 8 - bob, 3, 3, '#ffffff');
      px(ctx, 27, 8 - bob, 3, 3, '#ffffff');
      // Right Neck & Head (Hellfire Crimson)
      outlinedRect(ctx, 37, 10 + bob, 11, 18, '#dc2626');
      px(ctx, 42, 13 + bob, 3, 3, '#fde047');
      px(ctx, 40, 24 + bob, 5, 3, '#f97316');
      break;
    }

    case 'boss_aether_wing': {
      // Act 39: Half-golden eagle, half-shadow lion with wide animated feathered wings, purple void beak/talons & storm-halo
      // Wide Feathered Wings
      outlinedRect(ctx, 1, 8 - bob * 2, 12, 20, '#facc15');
      px(ctx, 3, 12 - bob * 2, 8, 12, '#fef08a');
      outlinedRect(ctx, 31, 8 - bob * 2, 12, 20, '#facc15');
      px(ctx, 33, 12 - bob * 2, 8, 12, '#fef08a');
      // Shadow-Lion Body
      outlinedRect(ctx, 13, 16, 18, 18, '#312e81');
      // Floating Storm Halo
      outlinedRect(ctx, 15, 1, 14, 3, '#38bdf8');
      // Corrupted Eagle Head & Purple Void Beak
      outlinedRect(ctx, 14, 6, 16, 11, '#fde047');
      outlinedRect(ctx, 18, 12, 8, 5, '#9333ea'); // Purple void beak
      px(ctx, 16, 9, 3, 2, '#38bdf8');
      px(ctx, 25, 9, 3, 2, '#38bdf8');
      break;
    }

    case 'boss_fenrir_p1': {
      // Act 41 Phase 1: Regal silver-and-black Wolf King in stolen royal crimson lion-fur cape, golden crown & Starlight Gem Wand
      outlinedRect(ctx, 9, 15, 26, 22, '#991b1b'); // Royal crimson cape
      px(ctx, 9, 13, 26, 4, '#fde68a'); // Lion-fur collar trim
      outlinedRect(ctx, 13, 16, 18, 18, '#334155'); // Silver-black armor
      outlinedRect(ctx, 13, 6, 18, 11, '#475569'); // Wolf King head
      outlinedRect(ctx, 15, 2, 14, 4, '#facc15'); // Stolen Golden Crown
      px(ctx, 16, 10, 3, 3, '#c084fc');
      px(ctx, 25, 10, 3, 3, '#c084fc');
      // Stolen Starlight Gem Wand in right paw!
      outlinedRect(ctx, 36, 8 - bob, 3, 24, '#facc15');
      outlinedRect(ctx, 34, 4 - bob, 7, 7, '#38bdf8');
      px(ctx, 36, 6 - bob, 3, 3, '#ffffff');
      break;
    }

    case 'boss_fenrir_p2': {
      // Act 41 Phase 2: 6-Eyed Shadow-Starlight Calamity Dire Beast (52x52) with cosmic crystal wings & purple rib-runes
      // Cosmic Crystal Wings
      outlinedRect(ctx, 2, 6 - bob * 2, 12, 26, '#7e22ce');
      px(ctx, 4, 10 - bob * 2, 8, 18, '#38bdf8');
      outlinedRect(ctx, 38, 6 - bob * 2, 12, 26, '#7e22ce');
      px(ctx, 40, 10 - bob * 2, 8, 18, '#38bdf8');
      // Monstrous Dire Beast Body + Purple Rib-Runes
      outlinedRect(ctx, 13, 16, 26, 28, '#1e1b4b');
      px(ctx, 17, 22, 18, 2, '#c084fc');
      px(ctx, 17, 27, 18, 2, '#38bdf8');
      px(ctx, 17, 32, 18, 2, '#c084fc');
      // 6 Glowing Eyes on Calamity Wolf Head
      outlinedRect(ctx, 14, 5, 24, 14, '#3b0764');
      for (let row = 0; row < 3; row++) {
        px(ctx, 17, 7 + row * 3, 3, 2, '#38bdf8');
        px(ctx, 32, 7 + row * 3, 3, 2, '#38bdf8');
      }
      // Crackling Lightning Claws
      outlinedRect(ctx, 8, 36 + bob, 6, 10, '#67e8f9');
      outlinedRect(ctx, 38, 36 - bob, 6, 10, '#67e8f9');
      break;
    }

    // ========================================================================
    // ARC 2 WAR FRONT BOSSES (Acts 46, 51, 56, 61, 66, 71, 76, 80, 82)
    // ========================================================================
    case 'boss_iron_jaws': {
      // Act 46: General Iron-Jaws & The War Mammoth (Armored Pitbull riding a tusked siege-elephant with twin turret crossbows)
      outlinedRect(ctx, 8, 18, 36, 24, '#475569'); // War Mammoth body
      outlinedRect(ctx, 3, 24, 9, 12, '#fef9c3'); // Left siege tusk
      outlinedRect(ctx, 40, 24, 9, 12, '#fef9c3'); // Right siege tusk
      outlinedRect(ctx, 20, 22, 12, 18, '#64748b'); // Armored trunk
      // Twin Turret Crossbows
      outlinedRect(ctx, 6, 12, 8, 6, '#d97706');
      outlinedRect(ctx, 38, 12, 8, 6, '#d97706');
      // General Iron-Jaws (Pitbull Commander) riding on top!
      outlinedRect(ctx, 18, 4 - bob, 16, 14, '#991b1b');
      px(ctx, 21, 8 - bob, 3, 2, '#ef4444');
      px(ctx, 28, 8 - bob, 3, 2, '#ef4444');
      break;
    }

    case 'boss_cerberus_barge': {
      // Act 51: Dreadnought War-Barge Cerberus (Ironclad river warship with three mechanical flame-throwing dog-head prows!)
      outlinedRect(ctx, 4, 24, 44, 18, '#334155'); // Ironclad hull
      px(ctx, 6, 36, 40, 4, '#0284c7'); // River wake
      outlinedRect(ctx, 12, 14, 28, 12, '#475569'); // Armored deckhouse
      // Three Mechanical Flame-Throwing Dog-Head Prows!
      [6, 21, 36].forEach((hx) => {
        outlinedRect(ctx, hx, 10 - bob, 10, 12, '#64748b');
        px(ctx, hx + 2, 13 - bob, 6, 2, '#ef4444');
        outlinedRect(ctx, hx + 2, 20 - bob, 6, 5, '#f97316'); // Flame nozzle
      });
      break;
    }

    case 'boss_goliath': {
      // Act 56: Goliath the Twin-Axe Rottweiler (Muscular black-and-mahogany Rottweiler dual-wielding glowing red executioner axes)
      outlinedRect(ctx, 11, 14, 22, 20, '#18181b');
      px(ctx, 14, 16, 16, 12, '#9a3412'); // Mahogany chest markings
      outlinedRect(ctx, 13, 4, 18, 11, '#18181b');
      px(ctx, 15, 7, 3, 2, '#ef4444');
      px(ctx, 26, 7, 3, 2, '#ef4444');
      // Dual Glowing Red Executioner Axes
      outlinedRect(ctx, 1, 8 - bob, 9, 16, '#dc2626');
      px(ctx, 2, 10 - bob, 4, 12, '#fca5a5');
      outlinedRect(ctx, 34, 8 + bob, 9, 16, '#dc2626');
      px(ctx, 38, 10 + bob, 4, 12, '#fca5a5');
      break;
    }

    case 'boss_storm_howler': {
      // Act 61: Storm-Howler the Wyvern-Hound (Winged dragon-wolf hybrid crackling with blue thunderbolts)
      outlinedRect(ctx, 1, 6 - bob * 2, 12, 22, '#0284c7');
      outlinedRect(ctx, 31, 6 - bob * 2, 12, 22, '#0284c7');
      outlinedRect(ctx, 13, 14, 18, 18, '#1e3a8a');
      outlinedRect(ctx, 14, 4, 16, 11, '#38bdf8');
      px(ctx, 16, 8, 3, 2, '#fef08a');
      px(ctx, 25, 8, 3, 2, '#fef08a');
      // Crackling thunderbolts
      px(ctx, 6, 28, 32, 2, '#67e8f9');
      break;
    }

    case 'boss_avalanche_titan': {
      // Act 66: Avalanche Titan Fenris-Mk.II (Ancient frost-giant wolf encased in runes and glacier armor)
      outlinedRect(ctx, 8, 10, 28, 26, '#0369a1');
      outlinedRect(ctx, 11, 13, 22, 20, '#bae6fd');
      outlinedRect(ctx, 12, 3, 20, 11, '#38bdf8');
      px(ctx, 15, 7, 4, 2, '#fef08a');
      px(ctx, 25, 7, 4, 2, '#fef08a');
      // Glowing Cyan Runes
      px(ctx, 18, 17, 8, 2, '#0284c7');
      px(ctx, 21, 15, 2, 12, '#0284c7');
      break;
    }

    case 'boss_steam_colossus': {
      // Act 71: Colossal Steam-Hound Mecha (Brass-and-iron steampunk robot dog with spinning gear joints, smokestacks & chest laser)
      // Twin Smokestacks
      outlinedRect(ctx, 10, 1, 5, 9, '#44403c');
      outlinedRect(ctx, 29, 1, 5, 9, '#44403c');
      // Brass & Iron Mecha Body
      outlinedRect(ctx, 8, 12, 28, 24, '#b45309');
      outlinedRect(ctx, 14, 17, 16, 12, '#ef4444'); // Chest laser core
      px(ctx, 18, 20, 8, 6, '#fef08a');
      outlinedRect(ctx, 12, 4, 20, 10, '#78716c');
      px(ctx, 15, 7, 14, 3, '#38bdf8'); // Mecha visor
      break;
    }

    case 'boss_hound_dukes': {
      // Act 76: The Four Royal Hound Dukes (Pyre-Hound, Frost-Hound, Gale-Hound, Terra-Hound in quad-formation)
      const dukes = [
        { x: 4, y: 4, col: '#ef4444' }, // Pyre-Hound
        { x: 24, y: 4, col: '#38bdf8' }, // Frost-Hound
        { x: 4, y: 22, col: '#4ade80' }, // Gale-Hound
        { x: 24, y: 22, col: '#f59e0b' }, // Terra-Hound
      ];
      dukes.forEach((d, idx) => {
        const shift = (f + idx) % 2;
        outlinedRect(ctx, d.x, d.y + shift, 14, 14, d.col);
        px(ctx, d.x + 3, d.y + 4 + shift, 2, 2, '#ffffff');
        px(ctx, d.x + 9, d.y + 4 + shift, 2, 2, '#ffffff');
        px(ctx, d.x + 4, d.y + 1 + shift, 6, 2, '#facc15');
      });
      break;
    }

    case 'boss_marshal_lupus': {
      // Act 80: Grand Marshal Lupus the Undefeated (White-furred elder wolf samurai-general in golden shogun armor with dual starlight katanas)
      outlinedRect(ctx, 11, 14, 22, 22, '#ca8a04'); // Golden Shogun Armor
      px(ctx, 14, 17, 16, 14, '#dc2626'); // Crimson samurai lacing
      outlinedRect(ctx, 13, 4, 18, 11, '#f8fafc'); // White elder wolf head
      outlinedRect(ctx, 11, 1, 22, 4, '#facc15'); // Kabuto crescent helm
      px(ctx, 16, 8, 3, 2, '#38bdf8');
      px(ctx, 25, 8, 3, 2, '#38bdf8');
      // Dual Starlight Katanas
      outlinedRect(ctx, 2, 6 - bob, 3, 24, '#67e8f9');
      outlinedRect(ctx, 39, 6 + bob, 3, 24, '#67e8f9');
      break;
    }

    case 'boss_emperor_chariot_p1': {
      // Act 82 Phase 1 (56x56): War-Emperor Fenrir in golden-black Emperor War-Plate riding The Dread-Chariot Cerberus pulled by 3 cyber-hounds!
      // Spiked Iron Chariot Wheels (Left & Right)
      outlinedRect(ctx, 2, 24 + bob, 7, 18, '#334155');
      px(ctx, 4, 27 + bob, 3, 12, '#facc15');
      outlinedRect(ctx, 47, 24 - bob, 7, 18, '#334155');
      px(ctx, 49, 27 - bob, 3, 12, '#facc15');
      // Armored Obsidian-and-Gold War-Chariot Hull + Twin Siege Ballistas
      outlinedRect(ctx, 8, 18, 40, 22, '#1e1b4b');
      px(ctx, 11, 21, 34, 15, '#991b1b');
      outlinedRect(ctx, 4, 14, 9, 7, '#d97706'); // Left siege ballista
      outlinedRect(ctx, 43, 14, 9, 7, '#d97706'); // Right siege ballista
      // Emperor Fenrir in Golden-Black Emperor War-Plate commanding from the Chariot!
      outlinedRect(ctx, 18, 4 - bob, 20, 18, '#0f172a');
      px(ctx, 20, 7 - bob, 16, 12, '#eab308'); // Golden Emperor Breastplate
      outlinedRect(ctx, 20, 1 - bob, 16, 5, '#fde047'); // Imperial Horned Crown
      px(ctx, 22, 9 - bob, 3, 2, '#ef4444');
      px(ctx, 31, 9 - bob, 3, 2, '#ef4444');
      // Three Armored Cyber-Hounds pulling the front of the Dread-Chariot!
      [7, 23, 39].forEach((hx, idx) => {
        const hBob = (f + idx) % 2;
        outlinedRect(ctx, hx, 38 + hBob, 10, 14, '#334155');
        px(ctx, hx + 2, 41 + hBob, 6, 3, idx === 1 ? '#38bdf8' : '#ef4444'); // Cyber-visor eyes
        px(ctx, hx + 3, 48 + hBob, 4, 3, '#f97316'); // Hellfire exhaust maw
      });
      break;
    }

    case 'boss_dual_sovereign_p2': {
      // Act 82 Phase 2 (56x56): Dual-Sovereign Clash — Emperor Fenrir (Dual Eclipse Great-Axes) & Phantom Shadow-Shogun Lupus!
      // Left Sovereign: Emperor Fenrir in Obsidian-Gold War-Plate with Dual Eclipse Great-Axes
      outlinedRect(ctx, 6, 18 + bob, 20, 26, '#1e1b4b');
      px(ctx, 9, 22 + bob, 14, 16, '#ca8a04');
      outlinedRect(ctx, 8, 7 + bob, 16, 12, '#0f172a');
      outlinedRect(ctx, 10, 3 + bob, 12, 4, '#facc15');
      px(ctx, 11, 11 + bob, 3, 2, '#ef4444');
      px(ctx, 18, 11 + bob, 3, 2, '#ef4444');
      // Dual Eclipse Great-Axe Blade
      outlinedRect(ctx, 1, 12 - bob, 8, 22, '#9333ea');
      px(ctx, 2, 15 - bob, 4, 16, '#f0abfc');

      // Right Sovereign: Phantom Shadow-Shogun Lupus in Spectral Cyan-Violet Samurai Armor
      outlinedRect(ctx, 30, 18 - bob, 20, 26, '#312e81');
      px(ctx, 33, 22 - bob, 14, 16, '#38bdf8');
      outlinedRect(ctx, 32, 7 - bob, 16, 12, '#e2e8f0');
      outlinedRect(ctx, 30, 3 - bob, 20, 4, '#67e8f9'); // Spectral Kabuto crest
      px(ctx, 35, 11 - bob, 3, 2, '#c084fc');
      px(ctx, 42, 11 - bob, 3, 2, '#c084fc');
      // Twin Void-Katana Arc
      outlinedRect(ctx, 47, 10 + bob, 7, 24, '#38bdf8');
      px(ctx, 49, 13 + bob, 3, 18, '#ffffff');
      // Chained Eclipse Lightning Arc between the two Sovereigns
      px(ctx, 24, 26, 8, 3, '#fde047');
      break;
    }

    case 'boss_ragnarok': {
      // Act 82 Phase 3 Grand Finale (64x64): RAGNAROK, THE PRIMORDIAL WORLD-HOUND!
      // Colossal Three-Headed Cosmic Wolf-Dragon (Sun-Eater Gold Head, Void-Storm Center Head, Moon-Frost Cyan Head)
      // Cosmic Dragon Wings (Left Solar-Void & Right Glacial-Void)
      outlinedRect(ctx, 1, 12 - bob * 2, 13, 32, '#581c87');
      px(ctx, 3, 16 - bob * 2, 8, 22, '#f59e0b');
      outlinedRect(ctx, 50, 12 - bob * 2, 13, 32, '#581c87');
      px(ctx, 53, 16 - bob * 2, 8, 22, '#38bdf8');

      // Colossal World-Hound Torso & Star-Core Ribcage
      outlinedRect(ctx, 14, 22, 36, 32, '#1e1b4b');
      px(ctx, 18, 26, 28, 22, '#3b0764');
      outlinedRect(ctx, 25, 30, 14, 14, '#be123c'); // Pulsing Ragnarok Star-Core
      px(ctx, 28, 33, 8, 8, '#fde047');

      // LEFT HEAD: Sun-Eater Solar Wolf-Dragon Head (Blazing Gold/Orange)
      outlinedRect(ctx, 6, 8 + bob, 15, 16, '#b45309');
      px(ctx, 8, 10 + bob, 11, 10, '#facc15');
      px(ctx, 9, 13 + bob, 3, 3, '#ffffff');
      px(ctx, 15, 13 + bob, 3, 3, '#ffffff');
      px(ctx, 8, 20 + bob, 10, 3, '#ef4444'); // Solar fire maw

      // CENTER HEAD: Void-Storm Sovereign Wolf-Dragon Head (Crowned Violet/Crimson)
      outlinedRect(ctx, 23, 3 - bob, 18, 20, '#3b0764');
      outlinedRect(ctx, 25, 0, 14, 4, '#fde047'); // Primordial World-Crown
      px(ctx, 26, 9 - bob, 4, 3, '#f43f5e');
      px(ctx, 34, 9 - bob, 4, 3, '#f43f5e');
      px(ctx, 29, 6 - bob, 6, 2, '#38bdf8'); // Third cosmic eye
      px(ctx, 26, 17 - bob, 12, 4, '#c084fc');

      // RIGHT HEAD: Moon-Frost Glacial Wolf-Dragon Head (Icy Cyan/White)
      outlinedRect(ctx, 43, 8 + bob, 15, 16, '#0369a1');
      px(ctx, 45, 10 + bob, 11, 10, '#38bdf8');
      px(ctx, 46, 13 + bob, 3, 3, '#fef08a');
      px(ctx, 52, 13 + bob, 3, 3, '#fef08a');
      px(ctx, 46, 20 + bob, 10, 3, '#e0f2fe'); // Glacial frost maw

      // Orbiting Tri-Elemental Apocalypse Runes
      outlinedRect(ctx, 6, 48 - bob, 7, 7, '#f59e0b');
      outlinedRect(ctx, 29, 55, 6, 6, '#c084fc');
      outlinedRect(ctx, 51, 48 + bob, 7, 7, '#38bdf8');
      break;
    }

    // ========================================================================
    // BESPOKE MINI-BOSSES (32x32)
    // ========================================================================
    case 'mini_knucklebite': {
      // Act 3: Mohawk goblin with twin brass-knuckle claws
      outlinedRect(ctx, 9, 12, 14, 14, '#16a34a');
      outlinedRect(ctx, 13, 1, 6, 9, '#ef4444'); // Tall crimson mohawk
      outlinedRect(ctx, 2, 14 - bob, 6, 8, '#facc15'); // Left brass knuckle claw
      outlinedRect(ctx, 24, 14 + bob, 6, 8, '#facc15'); // Right brass knuckle claw
      px(ctx, 11, 15, 2, 2, '#fef08a');
      px(ctx, 19, 15, 2, 2, '#fef08a');
      break;
    }

    case 'mini_gore_tusk': {
      // Act 8: Giant razorback boar with iron-plated tusks
      outlinedRect(ctx, 5, 10, 22, 16, '#7c2d12');
      px(ctx, 8, 7, 16, 4, '#dc2626'); // Razorback ridge
      outlinedRect(ctx, 1, 16 - bob, 6, 6, '#e2e8f0'); // Iron-plated tusk L
      outlinedRect(ctx, 25, 16 - bob, 6, 6, '#e2e8f0'); // Iron-plated tusk R
      px(ctx, 10, 14, 3, 2, '#fde047');
      px(ctx, 19, 14, 3, 2, '#fde047');
      break;
    }

    case 'mini_snaggletooth': {
      // Act 13: Goblin riding a giant bubbling cauldron-backpack tossing colorful vials
      outlinedRect(ctx, 6, 12, 20, 16, '#334155'); // Giant iron cauldron
      px(ctx, 8, 10, 16, 4, '#a3e635'); // Bubbling neon acid
      outlinedRect(ctx, 10, 3 - bob, 12, 9, '#22c55e'); // Goblin head peeking over
      outlinedRect(ctx, 24, 5 + bob, 5, 6, '#e879f9'); // Potion vial
      break;
    }

    case 'mini_talon_eye': {
      // Act 18: Winged hawk-bandit sniper with giant crimson cape
      outlinedRect(ctx, 3, 8, 26, 18, '#dc2626'); // Crimson cape & wings
      outlinedRect(ctx, 10, 5, 12, 14, '#78350f');
      px(ctx, 14, 9, 4, 4, '#facc15'); // Hawk beak
      outlinedRect(ctx, 22, 12 - bob, 8, 4, '#cbd5e1'); // Sniper crossbow
      break;
    }

    case 'mini_shivermaw': {
      // Act 23: Antlered skull-faced Wendigo-hound with blue ghost flames
      outlinedRect(ctx, 8, 12, 16, 16, '#1e293b');
      outlinedRect(ctx, 9, 4, 14, 9, '#f8fafc'); // White bone skull face
      outlinedRect(ctx, 4, 1, 5, 7, '#cbd5e1'); // Left antler
      outlinedRect(ctx, 23, 1, 5, 7, '#cbd5e1'); // Right antler
      px(ctx, 11, 7, 3, 3, '#38bdf8'); // Blue ghost-flame eyes
      px(ctx, 18, 7, 3, 3, '#38bdf8');
      break;
    }

    case 'mini_ignis_crag': {
      // Act 28: Floating torso of jagged black volcanic rock and molten lava core
      outlinedRect(ctx, 5, 6 - bob, 22, 20, '#1c1917');
      outlinedRect(ctx, 10, 11 - bob, 12, 10, '#f97316');
      px(ctx, 12, 13 - bob, 8, 6, '#fef08a');
      px(ctx, 10, 8 - bob, 3, 2, '#fde047');
      px(ctx, 19, 8 - bob, 3, 2, '#fde047');
      break;
    }

    case 'mini_dread_scale': {
      // Act 33: Bipedal emerald alligator knight swinging a rusty anchor on a chain
      outlinedRect(ctx, 8, 8, 16, 20, '#15803d');
      px(ctx, 10, 12, 12, 10, '#94a3b8'); // Knight breastplate
      outlinedRect(ctx, 24, 10 - bob, 6, 14, '#78350f'); // Rusty iron anchor
      px(ctx, 22, 20 - bob, 9, 4, '#64748b');
      break;
    }

    // ========================================================================
    // ARC III DRAGON MINI-BOSSES (32x32)
    // ========================================================================
    case 'mini_pyre_claw': {
      outlinedRect(ctx, 6, 10, 20, 16, '#9a3412');
      outlinedRect(ctx, 2, 6, 8, 12, '#eab308'); // Gold hoard pack
      outlinedRect(ctx, 10, 4 - bob, 12, 8, '#ea580c');
      px(ctx, 12, 7 - bob, 3, 2, '#fef08a');
      px(ctx, 18, 7 - bob, 3, 2, '#fef08a');
      outlinedRect(ctx, 23, 12 + bob, 6, 6, '#f97316'); // Flame claw
      break;
    }
    case 'mini_greed_maw': {
      outlinedRect(ctx, 5, 11 - bob, 22, 15, '#b45309'); // Treasure-chest mimic jaw
      px(ctx, 7, 14 - bob, 18, 4, '#fef08a'); // Gold teeth
      outlinedRect(ctx, 9, 5 - bob, 14, 7, '#facc15');
      px(ctx, 11, 7 - bob, 3, 2, '#dc2626');
      px(ctx, 18, 7 - bob, 3, 2, '#dc2626');
      break;
    }
    case 'mini_volt_talon': {
      outlinedRect(ctx, 3, 7 - bob * 2, 6, 14, '#38bdf8');
      outlinedRect(ctx, 23, 7 - bob * 2, 6, 14, '#38bdf8');
      outlinedRect(ctx, 9, 8, 14, 18, '#0369a1');
      outlinedRect(ctx, 10, 3, 12, 7, '#0ea5e9');
      px(ctx, 12, 5, 3, 2, '#fef08a');
      px(ctx, 17, 5, 3, 2, '#fef08a');
      break;
    }
    case 'mini_bone_chill': {
      outlinedRect(ctx, 8, 10, 16, 17, '#38bdf8');
      outlinedRect(ctx, 9, 3, 14, 9, '#f8fafc'); // Dragon skull
      px(ctx, 11, 6, 3, 2, '#22d3ee');
      px(ctx, 18, 6, 3, 2, '#22d3ee');
      outlinedRect(ctx, 2, 9 - bob, 6, 12, '#bae6fd');
      break;
    }
    case 'mini_blight_wing': {
      outlinedRect(ctx, 2, 6 - bob * 2, 7, 14, '#84cc16');
      outlinedRect(ctx, 23, 6 - bob * 2, 7, 14, '#84cc16');
      outlinedRect(ctx, 9, 9, 14, 17, '#15803d');
      px(ctx, 12, 6, 8, 6, '#a3e635');
      px(ctx, 13, 8, 2, 2, '#f43f5e');
      px(ctx, 17, 8, 2, 2, '#f43f5e');
      break;
    }
    case 'mini_chronos_drake': {
      outlinedRect(ctx, 7, 7 - bob, 18, 18, '#4c1d95');
      px(ctx, 11, 11 - bob, 10, 10, '#fde047'); // Astral clockwork core
      outlinedRect(ctx, 2, 10, 5, 10, '#38bdf8');
      outlinedRect(ctx, 25, 10, 5, 10, '#c084fc');
      break;
    }
    case 'mini_malakor': {
      outlinedRect(ctx, 7, 8, 18, 19, '#18181b');
      outlinedRect(ctx, 9, 2, 14, 8, '#991b1b'); // Crimson horned helm
      px(ctx, 11, 5, 3, 2, '#fde047');
      px(ctx, 18, 5, 3, 2, '#fde047');
      outlinedRect(ctx, 25, 4 - bob, 4, 20, '#f43f5e'); // Dragonlance
      break;
    }
    case 'mini_sol_luna': {
      outlinedRect(ctx, 2, 8 - bob, 12, 16, '#f59e0b'); // Solar drake
      px(ctx, 5, 11 - bob, 3, 2, '#ffffff');
      outlinedRect(ctx, 18, 8 + bob, 12, 16, '#38bdf8'); // Lunar drake
      px(ctx, 22, 11 + bob, 3, 2, '#fef08a');
      break;
    }

    // ========================================================================
    // ARC III ELDER DRAGON BOSSES (52x52) & 3-PHASE IGNIS-BAHAMUT (72x72)
    // ========================================================================
    case 'boss_vermithrax':
    case 'boss_aurum_rex':
    case 'boss_tempestria':
    case 'boss_glacius_zero':
    case 'boss_miasma_gorgon':
    case 'boss_nebula_wyrm':
    case 'boss_balrog_drake': {
      const palMap: Record<string, { body: string; wing: string; trim: string; eye: string }> = {
        boss_vermithrax: { body: '#7c2d12', wing: '#f97316', trim: '#94a3b8', eye: '#fef08a' },
        boss_aurum_rex: { body: '#b45309', wing: '#fde047', trim: '#fff7ed', eye: '#ef4444' },
        boss_tempestria: { body: '#0369a1', wing: '#38bdf8', trim: '#fde047', eye: '#fef9c3' },
        boss_glacius_zero: { body: '#0891b2', wing: '#bae6fd', trim: '#ffffff', eye: '#67e8f9' },
        boss_miasma_gorgon: { body: '#15803d', wing: '#84cc16', trim: '#f0abfc', eye: '#f43f5e' },
        boss_nebula_wyrm: { body: '#4c1d95', wing: '#c084fc', trim: '#38bdf8', eye: '#fde047' },
        boss_balrog_drake: { body: '#7f1d1d', wing: '#dc2626', trim: '#f59e0b', eye: '#fef08a' },
      };
      const dp = palMap[bossVisualId] ?? palMap.boss_vermithrax;
      // Spread Dragon Wings
      outlinedRect(ctx, 2, 10 - bob * 2, 12, 24, dp.wing);
      outlinedRect(ctx, 38, 10 - bob * 2, 12, 24, dp.wing);
      // Dragon Body & Plated Chest
      outlinedRect(ctx, 14, 18, 24, 24, dp.body);
      px(ctx, 18, 22, 16, 14, dp.trim);
      // Dragon Head & Horns
      outlinedRect(ctx, 16, 6 + bob, 20, 14, dp.body);
      outlinedRect(ctx, 13, 2 + bob, 4, 6, dp.trim);
      outlinedRect(ctx, 35, 2 + bob, 4, 6, dp.trim);
      px(ctx, 19, 11 + bob, 4, 3, dp.eye);
      px(ctx, 29, 11 + bob, 4, 3, dp.eye);
      // Heavy Tail & Claws
      outlinedRect(ctx, 12, 42, 8, 7, dp.trim);
      outlinedRect(ctx, 32, 42, 8, 7, dp.trim);
      break;
    }

    case 'boss_bahamut_p1':
    case 'boss_bahamut_p2':
    case 'boss_bahamut_p3': {
      // 72x72 COLOSSAL WORLD-BREAKER DRAGON IGNIS-BAHAMUT!
      const isP3 = bossVisualId === 'boss_bahamut_p3';
      const isP2 = bossVisualId === 'boss_bahamut_p2';
      const primary = isP3 ? '#581c87' : isP2 ? '#9a3412' : '#991b1b';
      const wingMain = isP3 ? '#c084fc' : isP2 ? '#f97316' : '#dc2626';
      const goldTrim = isP3 ? '#38bdf8' : '#fde047';

      // Outer colossal dragon wings (4 or 6 wings in P3 Supernova!)
      outlinedRect(ctx, 2, 12 - bob * 2, 16, 36, wingMain);
      outlinedRect(ctx, 54, 12 - bob * 2, 16, 36, wingMain);
      if (isP3) {
        outlinedRect(ctx, 6, 4 + bob * 2, 12, 18, '#38bdf8');
        outlinedRect(ctx, 54, 4 + bob * 2, 12, 18, '#38bdf8');
      }
      // Armored World-Breaker Torso
      outlinedRect(ctx, 18, 22, 36, 34, primary);
      px(ctx, 23, 27, 26, 20, '#1c1917');
      // Stolen Golden Cauldron / Starlight Core pulsing in chest
      outlinedRect(ctx, 28, 30, 16, 14, goldTrim);
      px(ctx, 32, 34, 8, 6, '#ffffff');
      // Crowned Dragon Head & Sweeping Horns
      outlinedRect(ctx, 22, 6 + bob, 28, 18, primary);
      outlinedRect(ctx, 15, 2 + bob, 7, 9, goldTrim);
      outlinedRect(ctx, 50, 2 + bob, 7, 9, goldTrim);
      px(ctx, 27, 13 + bob, 5, 3, '#fef08a');
      px(ctx, 40, 13 + bob, 5, 3, '#fef08a');
      px(ctx, 28, 19 + bob, 16, 3, '#f97316'); // Blazing Dragon Maw
      // Massive Dragon Claws & Tail
      outlinedRect(ctx, 16, 56, 12, 10, goldTrim);
      outlinedRect(ctx, 44, 56, 12, 10, goldTrim);
      break;
    }

    default: {
      // mini_kiba & War Mini-Bosses: Sleek ninja-wolf / War Commander with glowing cyan katana sheath & scarf
      outlinedRect(ctx, 9, 10, 14, 17, '#1e1b4b');
      outlinedRect(ctx, 7, 9, 18, 4, '#9333ea'); // Flowing purple scarf
      outlinedRect(ctx, 4, 4 - bob, 24, 3, '#38bdf8'); // Glowing cyan katana blade
      px(ctx, 11, 6, 3, 2, '#fde047');
      px(ctx, 18, 6, 3, 2, '#fde047');
      break;
    }
  }

  bossSpriteCache[key] = c;
  return c;
}
