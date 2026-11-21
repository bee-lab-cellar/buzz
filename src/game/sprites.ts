import {
  FENRIR_SOVEREIGN_IDLE,
  FENRIR_SOVEREIGN_PALETTE,
  KING_LEO_MAJESTIC_IDLE,
  KING_LEO_PALETTE,
} from './spritesEngine';
import { CatFurId, GearTier, PortraitId } from './types';

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function renderMatrix(
  matrix: string[],
  palette: Record<string, string>,
  scale = 1
): HTMLCanvasElement {
  const h = matrix.length;
  const w = matrix[0]?.length ?? 16;
  const c = makeCanvas(w * scale, h * scale);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < h; y++) {
    const row = matrix[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return c;
}

// ============================================================================
// NYX THE WIZARD CAT (24x24 Chibi Matrix — Crooked Starry Wizard Hat w/ Ear Holes!)
// Symbols:
// O = outline, f = fur base, t = fur shade/stripe, p = pink inner ear & nose (#ff8fab)
// w = soft white paw tips / cheek tuft, E = luminous mystic eye, L = eye catchlight
// H = wizard hat base, h = wizard hat shade, * = glowing hat star, B = golden hat buckle band
// S = belt/scarf, A = armor body, a = armor shade, C = cape, c = cape shade, T = tail
// ============================================================================
const NYX_IDLE = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffffffffffffffffO...',
  '...OffEE*ffffff*EEffO...',
  '...OffELLffppffLLEffO...',
  '...OffEEEffffffEEEffO...',
  '....OwwffffmmffffwwO....',
  '.....OOSSSSSSSSSSOO.....',
  '....OCCAAAAAAAAAAACO....',
  '...OCcCAaBBBBBBaAACcO...',
  '...O..OAAOOOOOOAAO..OT..',
  '......OaaO....OaaO.OTT..',
  '......OaaO....OaaOTT....',
  '......OwwO....OwwO......',
  '......OOOO....OOOO......',
  '........................',
  '........................',
  '........................',
];

const NYX_BLINK = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffffffffffffffffO...',
  '...OffffffffffffffffO...',
  '...OffEEEffppffEEEffO...',
  '...OffffffffffffffffO...',
  '....OwwffffmmffffwwO....',
  '.....OOSSSSSSSSSSOO.....',
  '....OCCAAAAAAAAAAACO....',
  '...OCcCAaBBBBBBaAACcO...',
  '...O..OAAOOOOOOAAO..OT..',
  '......OaaO....OaaO.OTT..',
  '......OaaO....OaaOTT....',
  '......OwwO....OwwO......',
  '......OOOO....OOOO......',
  '........................',
  '........................',
  '........................',
];

const NYX_TWITCH = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '.....OOfOOBBBBOOfOO.....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffffffffffffffffO...',
  '...OffEE*ffffff*EEffO...',
  '...OffELLffppffLLEffO...',
  '...OffEEEffffffEEEffO...',
  '....OwwffffmmffffwwO....',
  '.....OOSSSSSSSSSSOO.....',
  '....OCCAAAAAAAAAAACO....',
  '...OCcCAaBBBBBBaAACcO...',
  '...O..OAAOOOOOOAAO..OT..',
  '......OaaO....OaaO..OT..',
  '......OaaO....OaaO.OTT..',
  '......OwwO....OwwO......',
  '......OOOO....OOOO......',
  '........................',
  '........................',
  '........................',
];

const NYX_WALK = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffffffffffffffffO...',
  '...OffEE*ffffff*EEffO...',
  '...OffELLffppffLLEffO...',
  '...OffEEEffffffEEEffO...',
  '....OwwffffmmffffwwO....',
  '.....OOSSSSSSSSSSOO.....',
  '...OCCAAAAAAAAAAACCO....',
  '..OCc.OAAaBBBBaAAO.CcO..',
  '......OAAOOOOOOAAO.OTT..',
  '.....OaaO......OaaOTT...',
  '....OwwO........OwwO....',
  '....OOOO........OOOO....',
  '........................',
  '........................',
  '........................',
  '........................',
];

const NYX_HAPPY = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffffffffffffffffO...',
  '...OffEfffffffffffEffO..',
  '...OfEfEffppppffEfEfO...',
  '...OffffffffffffffffO...',
  '....OwwffffmmffffwwO....',
  '...OwOOSSSSSSSSSSOOwO...',
  '...OwwCAAAAAAAAAAACwwO..',
  '....OO.OAAaBBaAAO.OO....',
  '.......OAAOOOOAAO.OTT...',
  '.......OaaO..OaaOOTT....',
  '.......OwwO..OwwO.......',
  '.......OOOO..OOOO.......',
  '........................',
  '........................',
  '........................',
  '........................',
];

const NYX_BALL = [
  '........................',
  '........................',
  '........OOOOOOOO........',
  '......OOffffffffOO......',
  '.....OffHHHHHHHHffO.....',
  '....OfffHH*HHBHHfffO....',
  '....OfttffffffffttfO....',
  '....OfffCCCCCCCCfffO....',
  '.....OffCCCCCCCCffO.....',
  '......OOffffffffOO......',
  '........OOOOOOOO........',
  '........................',
];

// NYX IN BREAD LOAF FORM (24x24 — Chubby Toasted Cat-Bread Loaf with Wizard Hat & Tucked Paws!)
// u = golden bread crust (#d97706), U = deep toasted crust (#92400e), d = soft warm bread crumb (#fef3c7)
const NYX_BREAD_LOAF = [
  '........................',
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '..OOuuuuuuuuuuuuuuuuOO..',
  '.OuuUUUUuuuuuuuuUUUUuuO.',
  '.OuuffffffffffffffuuuuO.',
  'OuuOffEffffffffffEffOuuO',
  'OuuOfEfEffppppffEfEfOuuO',
  'OuuOffffffmmmmffffffduuO',
  'OuuuwwffffffffffffwwduuO',
  'OUuuuuuuuuuuuuuuuuuudddO',
  'OUUuuuuuuuuuuuuuuuuudddO',
  '.OUUUUUUUUUUUUUUUUUUUUO.',
  '..OOOOOOOOOOOOOOOOOOOO..',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

// NYX MAKING BISCUITS / KNEADING DOUGH (24x24 — Squinted >ω< eyes + paws pressing warm bread dough)
const NYX_BISCUITS = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffffffffffffffffO...',
  '...OffEffffffffffEffO...',
  '...OfEfEffppppffEfEfO...',
  '....OwwffffmmffffwwO....',
  '.....OOSSSSSSSSSSOO.....',
  '....OCCAAAAAAAAAAACO....',
  '...OCcCAaBBBBBBaAACcO...',
  '.....OOwwO....OwwOO.....',
  '...OOddddOOOOOOddddOO...',
  '..OddduuuuuuuuuuuudddO..',
  '..OduuuuuuuuuuuuuuuudO..',
  '...OOOOOOOOOOOOOOOOOO...',
  '........................',
  '........................',
  '........................',
  '........................',
];

// NYX EEPY CROISSANT CURL (24x24 — Curled flaky crescent roll nap)
const NYX_CROISSANT = [
  '........................',
  '........................',
  '........................',
  '........OOOOOOO.........',
  '......OOHHHHH*HO........',
  '.....OHHHBBBBHHHO.......',
  '....OOffffffffffOO......',
  '...OffuuuuuuuuuuffO.....',
  '..OffuUUUUffUUUUuffO....',
  '..OfuUffEEffEEffUufO....',
  '..OfuUffffppffffUufO....',
  '..OfuuUffffffffUuuTT....',
  '...OffuuuuuuuuuuffTT....',
  '....OOUUUUUUUUUUOO......',
  '......OOOOOOOOOO........',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

// NYX SILLY BLEP EMOTE (24x24 — Big sparkly eyes + pink tongue sticking out!)
const NYX_BLEP = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffffffffffffffffO...',
  '...OffEE*ffffff*EEffO...',
  '...OffELLffppffLLEffO...',
  '...OffEEEffppffEEEffO...',
  '....OwwffffppffffwwO....',
  '.....OOSSSSppSSSSOO.....',
  '....OCCAAAAAAAAAAACO....',
  '...OCcCAaBBBBBBaAACcO...',
  '...O..OAAOOOOOOAAO..OT..',
  '......OaaO....OaaO.OTT..',
  '......OaaO....OaaOTT....',
  '......OwwO....OwwO......',
  '......OOOO....OOOO......',
  '........................',
  '........................',
  '........................',
];

const NYX_PORTRAIT_DETERMINED = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffOOffffffOOffffO...',
  '...OffEE*ffppff*EEffO...',
  '...OffELLffffffLLEffO...',
  '....OwwffffmmffffwwO....',
  '.....OOSSSSSSSSSSOO.....',
  '....OCCAAAAAAAAAAACO....',
  '........................',
];

const NYX_PORTRAIT_SHOCKED = [
  '.........OOOOO..........',
  '........OHHHH*O.........',
  '.......OHHHhHHHO........',
  '......OH*HHHHhHHO.......',
  '....OOOfOOBBBBOOfOOO....',
  '...OHHOfpOHH*HOpfOHHO...',
  '...OOOOffOOOOOOffOOOO...',
  '....OfftfffffffftffO....',
  '...OffEEffffffffEEffO...',
  '...OffLL*ffppff*LLffO...',
  '...OffEEfffOOfffEEffO...',
  '....OwwfffmOOmmffwwO....',
  '.....OOSSSSSSSSSSOO.....',
  '....OCCAAAAAAAAAAACO....',
  '........................',
];

const FUR_PALETTES: Record<CatFurId, { O: string; f: string; t: string; w: string; m: string; T: string; E: string }> = {
  nyx_void: { O: '#090812', f: '#14121f', t: '#292442', w: '#f8fafc', m: '#292442', T: '#14121f', E: '#fbbf24' },
  ginger: { O: '#0f172a', f: '#fb923c', t: '#c2410c', w: '#fff7ed', m: '#fdba74', T: '#fb923c', E: '#0f172a' },
  tuxedo: { O: '#09090b', f: '#1e293b', t: '#0f172a', w: '#f8fafc', m: '#cbd5e1', T: '#1e293b', E: '#38bdf8' },
  calico: { O: '#0f172a', f: '#f8fafc', t: '#ea580c', w: '#fff7ed', m: '#475569', T: '#ea580c', E: '#0f172a' },
  persian: { O: '#1e293b', f: '#f8fafc', t: '#e2e8f0', w: '#ffffff', m: '#f1f5f9', T: '#f8fafc', E: '#38bdf8' },
  cyber_noir: { O: '#090d16', f: '#0f172a', t: '#06b6d4', w: '#22d3ee', m: '#ec4899', T: '#06b6d4', E: '#22d3ee' },
  starlight: { O: '#0b0f19', f: '#1e1b4b', t: '#312e81', w: '#fde047', m: '#6366f1', T: '#4338ca', E: '#38bdf8' },
};

function getPipPalette(tier: GearTier, golden: boolean, furId: CatFurId = 'nyx_void'): Record<string, string> {
  if (golden) {
    return {
      O: '#451a03',
      f: '#fef08a',
      t: '#f59e0b',
      p: '#ff8fab',
      w: '#ffffff',
      m: '#fde047',
      E: '#f59e0b',
      L: '#ffffff',
      H: '#a855f7',
      h: '#7e22ce',
      '*': '#fef08a',
      B: '#fde047',
      S: '#f59e0b',
      A: '#fde047',
      a: '#f59e0b',
      C: '#facc15',
      c: '#d97706',
      T: '#fbbf24',
      u: '#f59e0b',
      U: '#b45309',
      d: '#fef9c3',
    };
  }

  const tierLook: Record<GearTier, { H: string; h: string; '*': string; B: string; S: string; A: string; a: string; C: string; c: string }> = {
    1: { H: '#4c1d95', h: '#3b0764', '*': '#fde047', B: '#f59e0b', S: '#64748b', A: '#94a3b8', a: '#64748b', C: '#475569', c: '#334155' },
    2: { H: '#5b21b6', h: '#3b0764', '*': '#fef08a', B: '#d97706', S: '#b45309', A: '#d97706', a: '#92400e', C: '#78350f', c: '#451a03' },
    3: { H: '#3730a3', h: '#1e1b4b', '*': '#38bdf8', B: '#fbbf24', S: '#38bdf8', A: '#cbd5e1', a: '#64748b', C: '#2563eb', c: '#1d4ed8' },
    4: { H: '#4338ca', h: '#312e81', '*': '#e0f2fe', B: '#e2e8f0', S: '#94a3b8', A: '#e2e8f0', a: '#94a3b8', C: '#4f46e5', c: '#3730a3' },
    5: { H: '#6d28d9', h: '#4c1d95', '*': '#67e8f9', B: '#c084fc', S: '#a855f7', A: '#a5f3fc', a: '#0891b2', C: '#7c3aed', c: '#5b21b6' },
    6: { H: '#1d4ed8', h: '#1e3a8a', '*': '#ecfeff', B: '#67e8f9', S: '#0ea5e9', A: '#cffafe', a: '#0284c7', C: '#06b6d4', c: '#0e7490' },
    7: { H: '#7c2d12', h: '#451a03', '*': '#fb923c', B: '#f59e0b', S: '#ef4444', A: '#44403c', a: '#292524', C: '#dc2626', c: '#991b1b' },
    8: { H: '#581c87', h: '#2e1065', '*': '#f0abfc', B: '#c084fc', S: '#9333ea', A: '#c084fc', a: '#6b21a8', C: '#4c1d95', c: '#2e1065' },
    9: { H: '#6366f1', h: '#312e81', '*': '#fef08a', B: '#fde047', S: '#facc15', A: '#fef9c3', a: '#ca8a04', C: '#818cf8', c: '#4f46e5' },
    10: { H: '#047857', h: '#064e3b', '*': '#fde047', B: '#facc15', S: '#ef4444', A: '#fde047', a: '#d97706', C: '#10b981', c: '#047857' },
    11: { H: '#be123c', h: '#881337', '*': '#fef08a', B: '#38bdf8', S: '#fde047', A: '#fef08a', a: '#f59e0b', C: '#e11d48', c: '#9f1239' },
    20: { H: '#38bdf8', h: '#1d4ed8', '*': '#ffffff', B: '#fde047', S: '#f472b6', A: '#fef08a', a: '#38bdf8', C: '#c084fc', c: '#7e22ce' },
    21: { H: '#c2410c', h: '#7c2d12', '*': '#fde047', B: '#fb923c', S: '#f59e0b', A: '#fed7aa', a: '#c2410c', C: '#ea580c', c: '#9a3412' },
    22: { H: '#dc2626', h: '#7f1d1d', '*': '#fef08a', B: '#f97316', S: '#fde047', A: '#fb923c', a: '#991b1b', C: '#b91c1c', c: '#7f1d1d' },
    23: { H: '#ca8a04', h: '#713f12', '*': '#ffffff', B: '#fde047', S: '#f59e0b', A: '#fef08a', a: '#a16207', C: '#eab308', c: '#854d0e' },
    24: { H: '#0284c7', h: '#0c4a6e', '*': '#fef08a', B: '#38bdf8', S: '#67e8f9', A: '#bae6fd', a: '#0369a1', C: '#0ea5e9', c: '#075985' },
    25: { H: '#0891b2', h: '#164e63', '*': '#ecfeff', B: '#67e8f9', S: '#e0f2fe', A: '#cffafe', a: '#0e7490', C: '#22d3ee', c: '#155e75' },
    26: { H: '#15803d', h: '#052e16', '*': '#bef264', B: '#4ade80', S: '#a3e635', A: '#bbf7d0', a: '#166534', C: '#22c55e', c: '#14532d' },
    27: { H: '#7e22ce', h: '#3b0764', '*': '#fef08a', B: '#e879f9', S: '#38bdf8', A: '#f3e8ff', a: '#6b21a8', C: '#a855f7', c: '#581c87' },
    28: { H: '#be123c', h: '#4c0519', '*': '#fde047', B: '#fb7185', S: '#f43f5e', A: '#fecdd3', a: '#881337', C: '#e11d48', c: '#881337' },
    29: { H: '#b45309', h: '#451a03', '*': '#ffffff', B: '#fde047', S: '#38bdf8', A: '#fef08a', a: '#d97706', C: '#f59e0b', c: '#92400e' },
    30: { H: '#f59e0b', h: '#991b1b', '*': '#ffffff', B: '#fde047', S: '#38bdf8', A: '#fef9c3', a: '#ef4444', C: '#facc15', c: '#be123c' },
  };

  const fur = FUR_PALETTES[furId];
  return {
    O: fur.O,
    f: fur.f,
    t: fur.t,
    p: '#ff8fab',
    w: fur.w,
    m: fur.m,
    E: fur.E,
    L: '#ffffff',
    T: fur.T,
    u: '#d97706',
    U: '#92400e',
    d: '#fef3c7',
    ...tierLook[tier],
  };
}

// ============================================================================
// THE GREAT DUCK (32x32 Chubby Mallard Wizard with Starry Hat)
// ============================================================================
const GREAT_DUCK_MATRIX = [
  '.............OOOOOO.............',
  '............OBBBBBBO............',
  '...........OBBsBBBBBO...........',
  '..........OBBBBBBsBBBO..........',
  '.........OBBsBBBBBBBBBO.........',
  '........OBBBBBBBBsBBBBBO........',
  '......OOYYYYYYYYYYYYYYYYOO......',
  '.....OYYYYBBBBBBBBBBBBYYYYO.....',
  '......OOOOOOGGGGGGGGOOOOOO......',
  '..........OGGGGGGGGGGO..........',
  '.........OGGGKKGGGGGGGO.........',
  '.........OGGGKWGGGGGGGO.........',
  '.........OGGGGGGGYYYYYYO........',
  '..........OGGGGGYYYYYYYYO.......',
  '..........OOGGGGYYYYYYOO........',
  '...........OWWWWWWWWWOO.........',
  '..........OWWWWWWWWWWWWO........',
  '........OOWWGGGGGGGGGWWOO.......',
  '.......OWWWGGGGGGGGGGGWWWO......',
  '......OWWWGGYYYYYYYYYGGWWWO.....',
  '.....OWWWWGGYYWWWWWYYGGWWWWO....',
  '.....OWWWWGGYYYYYYYYYGGWWWWO....',
  '......OWWWGGGGGGGGGGGGGWWWO.....',
  '.......OOWWWWWWWWWWWWWWWOO......',
  '........OOWWWWWWWWWWWWWOO.......',
  '.........OOOWWWWWWWWWOOO........',
  '...........OYYO...OYYO..........',
  '...........OYYO...OYYO..........',
  '..........OYYYYO.OYYYYO.........',
  '.........OOOOOOO.OOOOOOO........',
  '................................',
  '................................',
];

const GREAT_DUCK_PALETTE: Record<string, string> = {
  O: '#1e1b4b',
  B: '#1d4ed8',
  s: '#fef08a',
  Y: '#facc15',
  G: '#10b981',
  K: '#0f172a',
  W: '#f8fafc',
};

// ============================================================================
// ENEMY & BOSS MATRICES
// ============================================================================
const GOBLIN_GRUNT_MATRIX = [
  '................',
  '....OOOOOOOO....',
  '..OOggggggggOO..',
  '.OgGggggggggGgO.',
  '.OGGggggggggGGO.',
  '..OOgRRggRRgOO..',
  '...OggggggggO...',
  '...OggWWWWggO...',
  '....OOllllOO....',
  '..ObbOllllObbO..',
  '.Obb.OllllO.bbO.',
  '.....OllllO.....',
  '....OllOOllO....',
  '....Ogg..ggO....',
  '....OOO..OOO....',
  '................',
];

const GOBLIN_ARCHER_MATRIX = [
  '....OOOOOOOO....',
  '...OmmmmmmmmO...',
  '..OmmggggggmmO..',
  '.OmmgRRggRRgmmO.',
  '..OmmggggggmmO..',
  '...OOmmmmmmOO...',
  '..ObbOmmmmObbO..',
  '.Ob..OmmmmO.bOO.',
  '.Ob..OmmmmO.b.wO',
  '.....OllllO.b.wO',
  '....OllOOllOb.wO',
  '....Ogg..ggOOO..',
  '....OOO..OOO....',
  '................',
  '................',
  '................',
];

const BOAR_MATRIX = [
  '................',
  '................',
  '....OOOOOOOO....',
  '..OObbbbbbbbOO..',
  '.ObbbBBBBBBBBbO.',
  'ObbbBBRgBBBBBbbO',
  'ObbWWBppppBBBbbO',
  '.OOOWWppppBBBBbO',
  '...ObbbbbbbbbbO.',
  '..ObbObbbbOObbO.',
  '..ObbO....ObbO..',
  '..OkkO....OkkO..',
  '..OOO......OOO..',
  '................',
  '................',
  '................',
];

const BADGER_MATRIX = [
  '................',
  '...OO......OO...',
  '..OwwOOOOOOwwO..',
  '.OkkwwkkkkwwkkO.',
  '.OkkwwRkkRwwkkO.',
  '..OkkwwwwwwkkO..',
  '..OkkkkkkkkkkO..',
  '.OggkkkkkkkkggO.',
  '.OggkkwwwwkkggO.',
  '..OkkkkkkkkkkO..',
  '...OkkOOOOkkO...',
  '..OwwO....OwwO..',
  '..OOO......OOO..',
  '................',
  '................',
  '................',
];

const HOUND_SCOUT_MATRIX = [
  '...OO......OO...',
  '..OaaO....OaaO..',
  '..OaaOOOOOOaaO..',
  '..OaaaaaaaaaaO..',
  '.OaaRRaaaaRRaaO.',
  '..OaaannnnaaaO..',
  '...OOmmmmmmOO...',
  '..OmmAAAAAAmmO..',
  '.Omm.AArrAA.mmO.',
  '.....AAAAAA.....',
  '....OAAOOAAO....',
  '....Oaa..aaO....',
  '....OOO..OOO....',
  '................',
  '................',
  '................',
];

const SHADOW_WOLF_MATRIX = [
  '..OO........OO..',
  '.OppO......OppO.',
  '.OppOOOOOOOOppO.',
  '.OppppppppppppO.',
  'OppCCppppppCCppO',
  '.OppppppppppppO.',
  '..OpppWWWWpppO..',
  '..OOppppppppOO..',
  '.OppppppppppppO.',
  'OpppOppppppOpppO',
  '....OmpOOpmO....',
  '...OppO..OppO...',
  '...OOO....OOO...',
  '................',
  '................',
  '................',
];

const SPORELING_MATRIX = [
  '....OOOOOOOO....',
  '..OOMMMMMMMMOO..',
  '.OMMWWMMMMWWMMO.',
  'OMMMMMMMMMMMMMMO',
  '.OOOOOOOOOOOOOO.',
  '...OccccccccO...',
  '..OccRRccRRccO..',
  '..OccccccccccO..',
  '...OccccccccO...',
  '...OccOOOOccO...',
  '...OccO..OccO...',
  '...OOO....OOO...',
  '................',
  '................',
  '................',
  '................',
];

const ICE_GOLEM_MATRIX = [
  '...OOOOOOOOOO...',
  '..OiiiiiiiiiiO..',
  '.OiiCCiiiiCCiiO.',
  '.OiiiiiiiiiiiiO.',
  'OOiiWWWWWWWWiiOO',
  'OiiiiiiiiiibiiiO',
  'OiiOOiiiiiiOOiiO',
  'OiiO.OiiiiO.OiiO',
  '.OO..OiiiiO..OO.',
  '....OiiOOiiO....',
  '....Oii..iiO....',
  '....OOO..OOO....',
  '................',
  '................',
  '................',
  '................',
];

const GROMMASH_MATRIX = [
  '......OOOOOOOOOOOO......',
  '....OOggggggggggggOO....',
  '...OggGGGGggggGGGGggO...',
  '..OggWWggggggggggWWggO..',
  '..OgRRggggggggggggRRgO..',
  '...OgggggWWWWWWgggggO...',
  '....OggggWWWWWWggggO....',
  '..OObbbbbbbbbbbbbbbbOO..',
  '.ObbbYYYYbbbbbbYYYYbbbO.',
  'ObbbObbbbbbbbbbbbbbObbbO',
  'Obb.ObbYYYYbbYYYYbbO.bbO',
  'Obb.ObbbbbbbbbbbbbbO.bbO',
  '.OO.ObbbbbbbbbbbbbbO.OO.',
  '....ObbbbbbOObbbbbbO....',
  '....ObbbbOO..OObbbbO....',
  '...OggggO......OggggO...',
  '...OggggO......OggggO...',
  '..OYYYYOO......OOYYYYO..',
  '..OOOOOO........OOOOOO..',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

const BRAMBLEBACK_MATRIX = [
  '....OOO..........OOO....',
  '...ObbBO........ObbBO...',
  '..ObbbbbOOOOOOOObbbbbO..',
  '..ObbbbbbbbbbbbbbbbbbO..',
  '.ObbbttbbbbbbbbbbttbbbO.',
  '.ObbRRbbbbbbbbbbbbRRbbO.',
  '.ObbbbbbbmmmmmmbbbbbbbO.',
  '..ObbbbbmmWWWWmmbbbbbO..',
  '.OgggbbbbbbbbbbbbbbgggO.',
  'OggbggbbbbbbbbbbbbggbggO',
  'OggggbbbbbbbbbbbbbbggggO',
  'ObbbggbbbbbbbbbbbbggbbbO',
  '.ObbbbbbbbbbbbbbbbbbbbO.',
  '..ObbbbbbbbbbbbbbbbbbO..',
  '..ObbbOOOO....OOOObbbO..',
  '..ObbbO..........ObbbO..',
  '..OkkkO..........OkkkO..',
  '..OOOOO..........OOOOO..',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

const VIPERFANG_MATRIX = [
  '..OO........OOOOOO........OO....',
  '.OppO......OppppppO......OppO...',
  '.OpGGO....OppGGGGppO....OGGpO...',
  '.OpRRpO..OppRRppRRppO..OpRRpO...',
  '..OpppO..OppppppppppO..OpppO....',
  '...OpppOOppppWWWWppppOOpppO.....',
  '....OppppppppppppppppppppO......',
  '.....OOppppppppppppppppOO.......',
  '....OpppGGGGppppppGGGGpppO......',
  '...OppppGppGppppppGppGppppO.....',
  '..OppppppppppppppppppppppppO....',
  '..OpppOppppppppppppppppOpppO....',
  '.OpppO.OppppGGGGGGppppO.OpppO...',
  '.OpppO..OpppGppppGpppO..OpppO...',
  '..OOO...OppppppppppppO...OOO....',
  '........OppppppppppppO..........',
  '.......OppppOO..OOppppO.........',
  '......OppppO......OppppO........',
  '......OpppO........OpppO........',
  '.....OGGGGO........OGGGGO.......',
  '.....OOOOOO........OOOOOO.......',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

export const FENRIR_P1_MATRIX = [
  '.....OO..OOOOOO..OO.....',
  '....OaaO.OYYYYO.OaaO....',
  '....OaaOOYYYYYYOOaaO....',
  '....OaaaaaaaaaaaaaaO....',
  '...OaaCCaaaaaaaaCCaaO...',
  '...OaaaannnnnnnnaaaaO...',
  '....OOaaWWWWWWWWaaOO....',
  '..OOOORRRRRRRRRRRROOOO..',
  '.OrrrrRRRRYYYYRRRRrrrrO.',
  'OrrpprRRRRYYYYRRRRrppprO',
  'Orr.ORRRRRRRRRRRRRRO.rrO',
  'Orr.ORRRRYYYYYYRRRRO.rrO',
  '.OO.ORRRRRRRRRRRRRRO.OO.',
  '....ORRRRRROORRRRRRO....',
  '....OaaaaOO..OOaaaaO....',
  '...OaaaaO......OaaaaO...',
  '...OYYYYO......OYYYYO...',
  '...OOOOOO......OOOOOO...',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

const FENRIR_P2_MATRIX = [
  '..OO........OOOOOO........OO....',
  '.OppO......OpCCCCpO......OppO...',
  '.OpppOOOOOOppCCCCppOOOOOOpppO...',
  '.OppppppppppppppppppppppppppO...',
  'OpppCCCppppppppppppppppCCCpppO..',
  'OppppCCppppppppppppppppCCppppO..',
  '.OppppppppWWWWWWWWWWppppppppO...',
  '..OppppppWWVVVVVVVVWWppppppO....',
  '.OCCCppppppppppppppppppppCCCO...',
  'OCCppppppppppppppppppppppppCCO..',
  'OppppppppCCCCppppCCCCppppppppO..',
  'OpppOppppCCppppppppCCppppOpppO..',
  'OppO.OppppppppppppppppppO.OppO..',
  'OCCO.OppppCCppppppCCppppO.OCCO..',
  '.OO..OppppppppppppppppppO..OO...',
  '.....OppppppppppppppppppO.......',
  '....OpppppOO......OOpppppO......',
  '...OpppppO..........OpppppO.....',
  '...OCCCCO............OCCCCO.....',
  '..OCCCCCO............OCCCCCO....',
  '..OOOOOOO............OOOOOOO....',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

const ADVISOR_MATRIX = [
  '...OO......OO...',
  '..OwwO....OwwO..',
  '..OwwOOOOOOwwO..',
  '..OwwwwwwwwwwO..',
  '.OwwKwwwwwwKwwO.',
  '..OwwwnnnnwwwO..',
  '...OOmmmmmmOO...',
  '..ObbObbbbObbO..',
  '.Obb.ObrrbO.bbO.',
  '.....ObbbbO.....',
  '....ObbOObbO....',
  '....Oww..wwO....',
  '....OOO..OOO....',
  '................',
  '................',
  '................',
];

const BLACKSMITH_MATRIX = [
  '...OO......OO...',
  '..OgpO....OpgO..',
  '..OggOrrrrOggO..',
  '..OggggggggggO..',
  '.OggKwggggwKggO.',
  '..OgggnnnngggO..',
  '...OOmmmmmmOO...',
  '..ObbObbbbObbO..',
  '.Obb.ObYYbOaaO..',
  '.....ObbbbOYYO..',
  '....ObbOObbO....',
  '....Ogg..ggO....',
  '....OOO..OOO....',
  '................',
  '................',
  '................',
];

const KING_LEO_MATRIX = KING_LEO_MAJESTIC_IDLE;

const CHEST_CLOSED = [
  '................',
  '................',
  '..OOOOOOOOOOOO..',
  '.OYYYYYYYYYYYYO.',
  '.OYbbbbbbbbbbYO.',
  '.ObbbbbbbbbbbbO.',
  '.OYYYYYWWYYYYYO.',
  '.OYYYYYKKYYYYYO.',
  '.ObbbbbbbbbbbbO.',
  '.ObbbbbbbbbbbbO.',
  '.OYYYYYYYYYYYYO.',
  '..OOOOOOOOOOOO..',
  '................',
  '................',
  '................',
  '................',
];

const CHEST_OPEN = [
  '..OOOOOOOOOOOO..',
  '.OYYYYYYYYYYYYO.',
  '.ObbbbbbbbbbbbO.',
  '..OOOOOOOOOOOO..',
  '.OYYYYKKKKYYYYO.',
  '.OYYYYWWWWYYYYO.',
  '.ObbbbbbbbbbbbO.',
  '.ObbbbbbbbbbbbO.',
  '.OYYYYYYYYYYYYO.',
  '..OOOOOOOOOOOO..',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

const SWORD_ICON = [
  '.............OO.',
  '............OWwO',
  '...........OWwO.',
  '..........OWwO..',
  '.........OWwO...',
  '........OWwO....',
  '...OO..OWwO.....',
  '...OYOOWwO......',
  '....OYYwO.......',
  '...OYYYO........',
  '..OhO.OYO.......',
  '.OhO...OO.......',
  '.OO.............',
  '................',
  '................',
  '................',
];

const ARMOR_ICON = [
  '................',
  '..OOO......OOO..',
  '.OAAAO....OAAAO.',
  '.OAAAAOOOOAAAAO.',
  '.OAAaaaaaaaaAAO.',
  '..OAAaaYYaaAAO..',
  '..OAAaaaaaaAAO..',
  '..OAAaaaaaaAAO..',
  '..OAAaaaaaaAAO..',
  '...OAAaaaaAAO...',
  '...OAAAAAAAAO...',
  '....OOOOOOOO....',
  '................',
  '................',
  '................',
  '................',
];

const POTION_ICON = [
  '......OOOO......',
  '......ObbO......',
  '......ObbO......',
  '.....OOOOOO.....',
  '....OwwwwwwO....',
  '...OwYYYYYYwO...',
  '..OwYYYYYYYYwO..',
  '..OwYYWWWWYYwO..',
  '..OwYYYYYYYYwO..',
  '..OwYYYYYYYYwO..',
  '...OYYYYYYYYO...',
  '....OOOOOOOO....',
  '................',
  '................',
  '................',
  '................',
];

const FISH_ICON = [
  '................',
  '................',
  '......OOOOOO....',
  '....OOBBBBBBOO..',
  '..OOBBBBBBBBWBO.',
  '.OBBBBBBBBBBBKBO',
  'OBBBBBBBBBBBBBBO',
  '.OBBBBBBBBBBBBO.',
  '..OOBBBBBBBBOO..',
  '....OOBBBBOO....',
  '......OOOO......',
  '................',
  '................',
  '................',
  '................',
  '................',
];

const DUCKLING_MATRIX = [
  '............',
  '...OOOOO....',
  '..OYYYYYO...',
  '.OYYKYYYYOO.',
  '.OYYYYYYoooo',
  '..OYYYYYOO..',
  '..OYYYYYYO..',
  '.OYYWWYYYYO.',
  '.OYYYYYYYYO.',
  '..OOOOOOOO..',
  '...OYYOYYO..',
  '...OOO.OOO..',
];

const GOLDEN_EGG_MATRIX = [
  '...OOOO...',
  '..OYYYYO..',
  '.OYYWWYYO.',
  '.OYYWWYYO.',
  'OYYYYYYYYO',
  'OYYYYYYYYO',
  'OYYYYYYYYO',
  '.OYYYYYYO.',
  '..OOOOOO..',
];

const GUARDIAN_TOTEM_MATRIX = [
  '....OOOO....',
  '..OOGGGGOO..',
  '.OGGWWWWGGO.',
  'OGWCCCCCCWGO',
  'OGWCWWWWCWGO',
  'OGWCCCCCCWGO',
  '.OGGWWWWGGO.',
  '..OOGGGGOO..',
  '....OOOO....',
];

const CAT_KNIGHT_MATRIX = [
  '..OOO......OOO..',
  '.OofoO....OofoO.',
  '.OfffOOOOOOfffO.',
  '.OfffAAAAAAfffO.',
  'OffKEffffffEKffO',
  'OffffffnnffffffO',
  '.OwwffffffffwwO.',
  '..OOAAAAAAAAOO..',
  '.OCCAAYYYYAACCO.',
  '.OC.OAAAAAAO.CO.',
  '....OAAOOAAO.OT.',
  '....OwwO.OwwOTT.',
  '....OOOO.OOOO...',
  '................',
  '................',
  '................',
];

const LION_HALBERDIER_MATRIX = [
  '...OOOOOOOOOO...',
  '..OYYYYYYYYYYO..',
  '.OObbbbbbbbbbOO.',
  'ObbYYYYYYYYYYbbO',
  'ObbYYKYYYYKYYbbO',
  'ObbYYYYnnYYYYbbO',
  '.ObbYYYYYYYYbbO.',
  '..OObbbbbbbbOO..',
  '.ORRAAYYYYAARRO.',
  '.OR.OAAAAAAO.RO.',
  '....OAAOOAAO....',
  '....OYYO.OYYO...',
  '....OOOO.OOOO...',
  '................',
  '................',
  '................',
];

const CALICO_ARCHER_MATRIX = [
  '..OOO......OOO..',
  '.OofoO....OofoO.',
  '.OfffOOOOOOfffO.',
  '.OggggggggggggO.',
  'OffKEffffffEKffO',
  'OffffffnnffffffO',
  '.OwwffffffffwwO.',
  '..OOggggggggOO..',
  '.OggGYYYYYYGggO.',
  '....OggggggO.OT.',
  '....OggOOggO.OT.',
  '....OwwO.OwwOTT.',
  '....OOOO.OOOO...',
  '................',
  '................',
  '................',
];

const ARCANE_CAT_MAGE_MATRIX = [
  '.....OOOOOO.....',
  '....OHHHH*HO....',
  '...OHHHHHHHHO...',
  '..OOOBBBBBBOOO..',
  '.OffffffffffffO.',
  'OffEEffffffEEffO',
  'OffffffnnffffffO',
  '.OwwffffffffwwO.',
  '..OOHHHHHHHHOO..',
  '.OHHH*BBBB*HHHO.',
  '....OHHHHHHO.OT.',
  '....OHHOOHHO.OT.',
  '....OwwO.OwwOTT.',
  '....OOOO.OOOO...',
  '................',
  '................',
];

const WAR_BANNER_MATRIX = [
  '..OO............',
  '..OYYOOOOOOOOO..',
  '..OYFFFFFFFFFO..',
  '..OYFFssssFFFO..',
  '..OYFFssssFFFO..',
  '..OYFFFFFFFFFO..',
  '..OYFFFFFFFFO...',
  '..OYYOOOOOOO....',
  '..OYO...........',
  '..OYO...........',
  '..OYO...........',
  '..OYO...........',
  '..OYO...........',
  '.OYYYO..........',
  'OOOOOOO.........',
  '................',
];

const PRISON_CAGE_MATRIX = [
  '...OOOOOOOOOOOOOOOOOOOO...',
  '..ObbbbbbbbYYYYbbbbbbbbO..',
  '.ObbbbbbbbbOYYObbbbbbbbbO.',
  '.ObOOOOOOOOOOOOOOOOOOOObO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Obsbs..............sbsbO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.Ob..s..............s..bO.',
  '.ObOOOOOOOOOOOOOOOOOOOObO.',
  '.ObbbbbbbbbbbbbbbbbbbbbbO.',
  '..OOOOOOOOOOOOOOOOOOOOOO..',
  '..........................',
];

const SIEGE_CATAPULT_MATRIX = [
  '.......OOOO.....',
  '......OrrrrO....',
  '.....OrrrrO.....',
  '....ObbbbO......',
  '...ObbbbO.......',
  '..ObbbbO..OOOO..',
  '.ObbbbOOOOOOOOO.',
  'ObbbbbbbbbbbbbbO',
  'OAAbbbbbbbbbbAAO',
  '.OOAAOOOOOOAAOO.',
  '.OAAAO....OAAAO.',
  '.OAAAO....OAAAO.',
  '..OOO......OOO..',
  '................',
  '................',
  '................',
];

export interface PipSpriteSet {
  idle: HTMLCanvasElement;
  blink: HTMLCanvasElement;
  twitch: HTMLCanvasElement;
  walk: HTMLCanvasElement;
  happy: HTMLCanvasElement;
  ball: HTMLCanvasElement;
  breadLoaf: HTMLCanvasElement;
  biscuits: HTMLCanvasElement;
  croissant: HTMLCanvasElement;
  blep: HTMLCanvasElement;
}

export interface SpriteBank {
  pipByFur: Record<CatFurId, Record<GearTier, PipSpriteSet>>;
  pip: Record<GearTier, PipSpriteSet>;
  pipGolden: PipSpriteSet;
  greatDuck: HTMLCanvasElement;
  duckling: HTMLCanvasElement;
  goldenEgg: HTMLCanvasElement;
  guardianOrb: HTMLCanvasElement;
  allies: {
    cat_knight: HTMLCanvasElement;
    lion_halberdier: HTMLCanvasElement;
    calico_archer: HTMLCanvasElement;
    arcane_cat_mage: HTMLCanvasElement;
  };
  warBannerDog: HTMLCanvasElement;
  warBannerCat: HTMLCanvasElement;
  prisonCage: HTMLCanvasElement;
  siegeCatapult: HTMLCanvasElement;
  enemies: Record<string, HTMLCanvasElement>;
  npcs: Record<string, HTMLCanvasElement>;
  chestClosed: HTMLCanvasElement;
  chestOpen: HTMLCanvasElement;
  icons: {
    weapon: Record<GearTier, HTMLCanvasElement>;
    armor: Record<GearTier, HTMLCanvasElement>;
    healPotion: HTMLCanvasElement;
    duckElixir: HTMLCanvasElement;
    fishTreat: HTMLCanvasElement;
  };
  portraits: Record<PortraitId, string>;
}

let cachedBank: SpriteBank | null = null;

function buildPipSet(pal: Record<string, string>): PipSpriteSet {
  return {
    idle: renderMatrix(NYX_IDLE, pal, 1),
    blink: renderMatrix(NYX_BLINK, pal, 1),
    twitch: renderMatrix(NYX_TWITCH, pal, 1),
    walk: renderMatrix(NYX_WALK, pal, 1),
    happy: renderMatrix(NYX_HAPPY, pal, 1),
    ball: renderMatrix(NYX_BALL, pal, 1),
    breadLoaf: renderMatrix(NYX_BREAD_LOAF, pal, 1),
    biscuits: renderMatrix(NYX_BISCUITS, pal, 1),
    croissant: renderMatrix(NYX_CROISSANT, pal, 1),
    blep: renderMatrix(NYX_BLEP, pal, 1),
  };
}

export function getSpriteBank(): SpriteBank {
  if (cachedBank) return cachedBank;

  const pipByFur = {} as SpriteBank['pipByFur'];
  const allTiers: GearTier[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  (['nyx_void', 'ginger', 'tuxedo', 'calico', 'persian', 'cyber_noir', 'starlight'] as CatFurId[]).forEach((fur) => {
    pipByFur[fur] = {} as Record<GearTier, PipSpriteSet>;
    allTiers.forEach((tier) => {
      pipByFur[fur][tier] = buildPipSet(getPipPalette(tier, false, fur));
    });
  });
  const pip = pipByFur.nyx_void;
  const pipGolden = buildPipSet(getPipPalette(11, true));

  const greatDuck = renderMatrix(GREAT_DUCK_MATRIX, GREAT_DUCK_PALETTE, 1);
  const duckling = renderMatrix(DUCKLING_MATRIX, {
    O: '#451a03',
    Y: '#fde047',
    W: '#ffffff',
    K: '#0f172a',
    o: '#f97316',
  }, 1);
  const goldenEgg = renderMatrix(GOLDEN_EGG_MATRIX, {
    O: '#78350f',
    Y: '#facc15',
    W: '#fef9c3',
  }, 1);
  const guardianOrb = renderMatrix(GUARDIAN_TOTEM_MATRIX, {
    O: '#022c22',
    G: '#10b981',
    W: '#ecfdf5',
    C: '#22d3ee',
  }, 1);

  const allies: SpriteBank['allies'] = {
    cat_knight: renderMatrix(CAT_KNIGHT_MATRIX, {
      O: '#0f172a',
      f: '#fb923c',
      o: '#fda4af',
      w: '#ffffff',
      K: '#0f172a',
      E: '#38bdf8',
      n: '#f43f5e',
      A: '#cbd5e1',
      Y: '#facc15',
      C: '#2563eb',
      T: '#ea580c',
    }),
    lion_halberdier: renderMatrix(LION_HALBERDIER_MATRIX, {
      O: '#1c1917',
      Y: '#fde047',
      b: '#92400e',
      K: '#0f172a',
      n: '#78350f',
      A: '#f59e0b',
      R: '#dc2626',
    }),
    calico_archer: renderMatrix(CALICO_ARCHER_MATRIX, {
      O: '#0f172a',
      f: '#f8fafc',
      o: '#fb923c',
      w: '#ffffff',
      K: '#0f172a',
      E: '#10b981',
      n: '#f43f5e',
      g: '#15803d',
      G: '#166534',
      Y: '#fde047',
      T: '#ea580c',
    }),
    arcane_cat_mage: renderMatrix(ARCANE_CAT_MAGE_MATRIX, {
      O: '#090812',
      f: '#1e1b4b',
      w: '#e2e8f0',
      E: '#38bdf8',
      n: '#f472b6',
      H: '#4f46e5',
      '*': '#fde047',
      B: '#facc15',
      T: '#312e81',
    }),
  };

  const warBannerDog = renderMatrix(WAR_BANNER_MATRIX, {
    O: '#09090b',
    Y: '#64748b',
    F: '#991b1b',
    s: '#c084fc',
  });
  const warBannerCat = renderMatrix(WAR_BANNER_MATRIX, {
    O: '#1c1917',
    Y: '#facc15',
    F: '#0284c7',
    s: '#fde047',
  });
  const prisonCage = renderMatrix(PRISON_CAGE_MATRIX, {
    O: '#09090b',
    b: '#475569',
    s: '#94a3b8',
    Y: '#facc15',
  });
  const siegeCatapult = renderMatrix(SIEGE_CATAPULT_MATRIX, {
    O: '#09090b',
    b: '#78350f',
    A: '#475569',
    r: '#ef4444',
  });

  const enemies: Record<string, HTMLCanvasElement> = {
    goblin_grunt: renderMatrix(GOBLIN_GRUNT_MATRIX, { O: '#111827', g: '#22c55e', G: '#15803d', R: '#ef4444', W: '#f8fafc', l: '#78350f', b: '#92400e' }),
    goblin_archer: renderMatrix(GOBLIN_ARCHER_MATRIX, { O: '#111827', m: '#166534', g: '#4ade80', R: '#f97316', l: '#78350f', b: '#b45309', w: '#e2e8f0' }),
    rabid_boar: renderMatrix(BOAR_MATRIX, { O: '#1c1917', b: '#78350f', B: '#9a3412', R: '#ef4444', g: '#fef08a', W: '#f8fafc', p: '#fb7185', k: '#292524' }),
    razor_badger: renderMatrix(BADGER_MATRIX, { O: '#09090b', w: '#e2e8f0', k: '#27272a', R: '#f43f5e', g: '#64748b' }),
    hound_scout: renderMatrix(HOUND_SCOUT_MATRIX, { O: '#111827', a: '#64748b', R: '#ef4444', n: '#1e293b', m: '#94a3b8', A: '#334155', r: '#dc2626' }),
    shadow_wolf: renderMatrix(SHADOW_WOLF_MATRIX, { O: '#09090b', p: '#4c1d95', C: '#38bdf8', W: '#e2e8f0', m: '#6d28d9' }),
    sporeling: renderMatrix(SPORELING_MATRIX, { O: '#1e1b4b', M: '#c026d3', W: '#f0abfc', c: '#2dd4bf', R: '#ef4444' }),
    ice_golem: renderMatrix(ICE_GOLEM_MATRIX, { O: '#0f172a', i: '#38bdf8', C: '#fef08a', W: '#e0f2fe', b: '#0284c7' }),
    lava_salamander: renderMatrix(SPORELING_MATRIX, { O: '#270e02', M: '#ea580c', W: '#fde047', c: '#dc2626', R: '#fef08a' }),
    swamp_croc: renderMatrix(HOUND_SCOUT_MATRIX, { O: '#052e16', a: '#15803d', R: '#fde047', n: '#14532d', m: '#84cc16', A: '#166534', r: '#65a30d' }),
    celestial_sentinel: renderMatrix(ICE_GOLEM_MATRIX, { O: '#312e81', i: '#818cf8', C: '#fde047', W: '#fef9c3', b: '#4f46e5' }),
    grommash: renderMatrix(GROMMASH_MATRIX, { O: '#09090b', g: '#16a34a', G: '#14532d', W: '#fef9c3', R: '#ef4444', b: '#451a03', Y: '#eab308' }),
    brambleback: renderMatrix(BRAMBLEBACK_MATRIX, { O: '#09090b', b: '#57280f', B: '#7c2d12', t: '#166534', R: '#f97316', m: '#a16207', W: '#fef3c7', g: '#15803d', k: '#292524' }),
    mycora: renderMatrix(GROMMASH_MATRIX, { O: '#1e1b4b', g: '#a21caf', G: '#701a75', W: '#e0f2fe', R: '#2dd4bf', b: '#4c1d95', Y: '#f0abfc' }),
    general_vane: renderMatrix(GROMMASH_MATRIX, { O: '#09090b', g: '#94a3b8', G: '#475569', W: '#f8fafc', R: '#ef4444', b: '#7f1d1d', Y: '#facc15' }),
    cryo_fang: renderMatrix(BRAMBLEBACK_MATRIX, { O: '#0f172a', b: '#38bdf8', B: '#0284c7', t: '#e0f2fe', R: '#fef08a', m: '#bae6fd', W: '#ffffff', g: '#0369a1', k: '#1e3a8a' }),
    volcanis: renderMatrix(BRAMBLEBACK_MATRIX, { O: '#1c0a00', b: '#dc2626', B: '#991b1b', t: '#fde047', R: '#fef08a', m: '#f97316', W: '#fef9c3', g: '#ea580c', k: '#450a0a' }),
    viperfang: renderMatrix(VIPERFANG_MATRIX, { O: '#052e16', p: '#4d7c0f', G: '#84cc16', R: '#f43f5e', W: '#f8fafc' }),
    aether_wing: renderMatrix(VIPERFANG_MATRIX, { O: '#1e1b4b', p: '#6366f1', G: '#fde047', R: '#38bdf8', W: '#ffffff' }),
    fenrir_p1: renderMatrix(FENRIR_SOVEREIGN_IDLE, {
      ...FENRIR_SOVEREIGN_PALETTE,
      C: '#a855f7',
      R: '#dc2626',
    }),
    fenrir_p2: renderMatrix(FENRIR_P2_MATRIX, { O: '#09090b', p: '#3b0764', C: '#38bdf8', W: '#f8fafc', V: '#c084fc' }, 1),
  };

  const npcs: Record<string, HTMLCanvasElement> = {
    advisor: renderMatrix(ADVISOR_MATRIX, { O: '#1e293b', w: '#e2e8f0', K: '#0f172a', n: '#fda4af', m: '#f8fafc', b: '#2563eb', r: '#ef4444' }),
    blacksmith: renderMatrix(BLACKSMITH_MATRIX, {
      O: '#1c1917',
      g: '#64748b',
      p: '#ff8fab',
      r: '#ef4444',
      w: '#f8fafc',
      a: '#cbd5e1',
      K: '#0f172a',
      n: '#ff8fab',
      m: '#cbd5e1',
      b: '#78350f',
      Y: '#f59e0b',
    }),
    great_duck: greatDuck,
    king_leo: renderMatrix(KING_LEO_MATRIX, KING_LEO_PALETTE, 1),
    fenrir: renderMatrix(FENRIR_SOVEREIGN_IDLE, FENRIR_SOVEREIGN_PALETTE, 1),
  };

  const chestClosed = renderMatrix(CHEST_CLOSED, { O: '#1c1917', Y: '#f59e0b', b: '#78350f', W: '#fef3c7', K: '#0f172a' });
  const chestOpen = renderMatrix(CHEST_OPEN, { O: '#1c1917', Y: '#f59e0b', b: '#451a03', W: '#fde047', K: '#0f172a' });

  const weaponTierPalettes: Record<GearTier, Record<string, string>> = {
    1: { O: '#0f172a', W: '#cbd5e1', w: '#64748b', Y: '#78350f', h: '#451a03' },
    2: { O: '#1c1917', W: '#fed7aa', w: '#d97706', Y: '#92400e', h: '#451a03' },
    3: { O: '#0f172a', W: '#e0f2fe', w: '#38bdf8', Y: '#1d4ed8', h: '#1e3a8a' },
    4: { O: '#1e293b', W: '#ffffff', w: '#cbd5e1', Y: '#6366f1', h: '#312e81' },
    5: { O: '#0f172a', W: '#e9d5ff', w: '#c084fc', Y: '#7e22ce', h: '#3b0764' },
    6: { O: '#082f49', W: '#ecfeff', w: '#22d3ee', Y: '#0284c7', h: '#0c4a6e' },
    7: { O: '#270e02', W: '#fed7aa', w: '#f97316', Y: '#dc2626', h: '#7f1d1d' },
    8: { O: '#2e1065', W: '#f5d0fe', w: '#a855f7', Y: '#ec4899', h: '#581c87' },
    9: { O: '#1e1b4b', W: '#fef9c3', w: '#fde047', Y: '#6366f1', h: '#312e81' },
    10: { O: '#022c22', W: '#fef9c3', w: '#34d399', Y: '#fbbf24', h: '#991b1b' },
    11: { O: '#4c0519', W: '#ffffff', w: '#fde047', Y: '#38bdf8', h: '#e11d48' },
    20: { O: '#0f172a', W: '#ffffff', w: '#38bdf8', Y: '#fde047', h: '#c084fc' },
    21: { O: '#431407', W: '#ffedd5', w: '#fb923c', Y: '#facc15', h: '#9a3412' },
    22: { O: '#450a0a', W: '#fef08a', w: '#f97316', Y: '#ef4444', h: '#7f1d1d' },
    23: { O: '#422006', W: '#fef9c3', w: '#eab308', Y: '#fde047', h: '#854d0e' },
    24: { O: '#082f49', W: '#e0f2fe', w: '#38bdf8', Y: '#fde047', h: '#0369a1' },
    25: { O: '#083344', W: '#ffffff', w: '#67e8f9', Y: '#38bdf8', h: '#155e75' },
    26: { O: '#052e16', W: '#ecfccb', w: '#4ade80', Y: '#a3e635', h: '#166534' },
    27: { O: '#2e1065', W: '#fae8ff', w: '#c084fc', Y: '#38bdf8', h: '#6b21a8' },
    28: { O: '#4c0519', W: '#ffe4e6', w: '#f43f5e', Y: '#fde047', h: '#881337' },
    29: { O: '#451a03', W: '#ffffff', w: '#fbbf24', Y: '#38bdf8', h: '#991b1b' },
    30: { O: '#1e1b4b', W: '#ffffff', w: '#fde047', Y: '#ef4444', h: '#38bdf8' },
  };
  const armorTierPalettes: Record<GearTier, Record<string, string>> = {
    1: { O: '#0f172a', A: '#94a3b8', a: '#475569', Y: '#cbd5e1' },
    2: { O: '#1c1917', A: '#fbbf24', a: '#b45309', Y: '#fef3c7' },
    3: { O: '#0f172a', A: '#bae6fd', a: '#0284c7', Y: '#f8fafc' },
    4: { O: '#1e293b', A: '#e2e8f0', a: '#64748b', Y: '#818cf8' },
    5: { O: '#0f172a', A: '#ddd6fe', a: '#7c3aed', Y: '#38bdf8' },
    6: { O: '#082f49', A: '#a5f3fc', a: '#0891b2', Y: '#ffffff' },
    7: { O: '#270e02', A: '#fb923c', a: '#9a3412', Y: '#fde047' },
    8: { O: '#2e1065', A: '#c084fc', a: '#6b21a8', Y: '#f0abfc' },
    9: { O: '#1e1b4b', A: '#fef08a', a: '#4f46e5', Y: '#ffffff' },
    10: { O: '#022c22', A: '#6ee7b7', a: '#d97706', Y: '#fde047' },
    11: { O: '#4c0519', A: '#fde047', a: '#e11d48', Y: '#38bdf8' },
    20: { O: '#0f172a', A: '#38bdf8', a: '#c084fc', Y: '#fde047' },
    21: { O: '#431407', A: '#fb923c', a: '#9a3412', Y: '#fde047' },
    22: { O: '#450a0a', A: '#f97316', a: '#7f1d1d', Y: '#fef08a' },
    23: { O: '#422006', A: '#fde047', a: '#a16207', Y: '#ffffff' },
    24: { O: '#082f49', A: '#38bdf8', a: '#0369a1', Y: '#fde047' },
    25: { O: '#083344', A: '#67e8f9', a: '#155e75', Y: '#ffffff' },
    26: { O: '#052e16', A: '#4ade80', a: '#166534', Y: '#bef264' },
    27: { O: '#2e1065', A: '#c084fc', a: '#6b21a8', Y: '#38bdf8' },
    28: { O: '#4c0519', A: '#f43f5e', a: '#881337', Y: '#fde047' },
    29: { O: '#451a03', A: '#fbbf24', a: '#991b1b', Y: '#38bdf8' },
    30: { O: '#1e1b4b', A: '#fde047', a: '#ef4444', Y: '#38bdf8' },
  };

  const weaponIcons = {} as Record<GearTier, HTMLCanvasElement>;
  const armorIcons = {} as Record<GearTier, HTMLCanvasElement>;
  allTiers.forEach((t) => {
    weaponIcons[t] = renderMatrix(SWORD_ICON, weaponTierPalettes[t], 2);
    armorIcons[t] = renderMatrix(ARMOR_ICON, armorTierPalettes[t], 2);
  });

  const healPotion = renderMatrix(POTION_ICON, { O: '#1e1b4b', b: '#78350f', w: '#f8fafc', Y: '#ef4444', W: '#fca5a5' }, 2);
  const duckElixir = renderMatrix(POTION_ICON, { O: '#451a03', b: '#1d4ed8', w: '#fef9c3', Y: '#facc15', W: '#ffffff' }, 2);
  const fishTreat = renderMatrix(FISH_ICON, { O: '#1e293b', B: '#38bdf8', W: '#e0f2fe', K: '#0f172a' }, 2);

  const portraitPal = getPipPalette(3, false, 'nyx_void');
  const portraitSources: Record<PortraitId, HTMLCanvasElement> = {
    pip: renderMatrix(NYX_IDLE, portraitPal, 3),
    pip_happy: renderMatrix(NYX_HAPPY, portraitPal, 3),
    pip_determined: renderMatrix(NYX_PORTRAIT_DETERMINED, portraitPal, 3),
    pip_shocked: renderMatrix(NYX_PORTRAIT_SHOCKED, portraitPal, 3),
    king_leo: renderMatrix(KING_LEO_MATRIX, KING_LEO_PALETTE, 2),
    advisor: renderMatrix(ADVISOR_MATRIX, { O: '#1e293b', w: '#e2e8f0', K: '#0f172a', n: '#fda4af', m: '#f8fafc', b: '#2563eb', r: '#ef4444' }, 4),
    blacksmith: renderMatrix(
      BLACKSMITH_MATRIX,
      {
        O: '#1c1917',
        g: '#64748b',
        p: '#ff8fab',
        r: '#ef4444',
        w: '#f8fafc',
        a: '#cbd5e1',
        K: '#0f172a',
        n: '#ff8fab',
        m: '#cbd5e1',
        b: '#78350f',
        Y: '#f59e0b',
      },
      4
    ),
    great_duck: renderMatrix(GREAT_DUCK_MATRIX, GREAT_DUCK_PALETTE, 2),
    grommash: enemies.grommash,
    brambleback: enemies.brambleback,
    viperfang: enemies.viperfang,
    fenrir: enemies.fenrir_p1,
    fenrir_beast: enemies.fenrir_p2,
    bahamut: renderMatrix(
      [
        '..OO..........OO..',
        '.OYYO........OYYO.',
        '.OYrOO......OOrYO.',
        'OrrYYOOOOOOOOYYrrO',
        'OrrrrYYYYYYYYrrrrO',
        '.OrrRRRRrrRRRRrrO.',
        '..OrRYWrrrrWYrOrO.',
        '..OrrrrrrrrrrrrO..',
        '...OrrWWWWWWrrO...',
        '...OrOOOOOOOOrrO..',
        '....OrYYYYYYrO....',
        '.....OOOOOOOO.....',
      ],
      { O: '#1c0505', Y: '#fde047', r: '#b91c1c', R: '#f97316', W: '#fef9c3' },
      3
    ),
  };

  const portraits = {} as Record<PortraitId, string>;
  (Object.keys(portraitSources) as PortraitId[]).forEach((k) => {
    portraits[k] = portraitSources[k].toDataURL();
  });

  cachedBank = {
    pipByFur,
    pip,
    pipGolden,
    greatDuck,
    duckling,
    goldenEgg,
    guardianOrb,
    allies,
    warBannerDog,
    warBannerCat,
    prisonCage,
    siegeCatapult,
    enemies,
    npcs,
    chestClosed,
    chestOpen,
    icons: {
      weapon: weaponIcons,
      armor: armorIcons,
      healPotion,
      duckElixir,
      fishTreat,
    },
    portraits,
  };

  return cachedBank;
}
