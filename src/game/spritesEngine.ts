import { Direction, PlayableHeroId } from './types';

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function renderMatrix(matrix: string[], palette: Record<string, string>, scale = 1): HTMLCanvasElement {
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
// PLAYABLE HERO #2: KING LEO — THE MAJESTIC GOLDEN LION KING (30x30 Sprite)
// Taller & broader than 20x20 cats!
// - M = Deep Amber-Mahogany outer mane (#9e3b0e)
// - b = Golden-Orange inner mane (#d97706)
// - f = Rounded golden lion ears & fur (#f59e0b), t = dark ear tuft (#78350f)
// - Y = 5-Point Jeweled Golden Crown (#ffd700), R = Ruby (#ef4444), S = Sapphire (#38bdf8)
// - w = Broad cream-gold lion snout/jowls (#fef3c7), n = 3x2 dark lion nose (#451a03)
// - E = Fierce golden-amber king eyes (#fbbf24), L = white catchlight (#ffffff), K = pupil (#0f172a)
// - r = Royal Crimson Velvet Cape (#dc2626), e = White ermine spots (#ffffff)
// - A = Golden Lion Plate Armor (#f59e0b), G = Solar Greatsword blade (#fde047)
// - T = Long golden tail (#f59e0b) ending in M mahogany lion tail-tuft brush!
// ============================================================================
export const KING_LEO_MAJESTIC_IDLE = [
  '......OO..OO..OO..OO..OO....',
  '.....OYYOOYYOOYYOOYYOOYYO...',
  '....OOYRYYYYYSYYYYYYRYYYOO..',
  '..OOffOYYYYYYYYYYYYYYYYOffOO',
  '.OfftfOMMMMMMMMMMMMMMMMOftffO',
  '.OfffMMbbbbbbbbbbbbbbbbMMfffO',
  'OMMMMbbffffffffffffffffbbMMMMO',
  'OMMMbbffOOffffffffffOOffbbMMMO',
  'OMMbbffLKKffffffffffKKLffbbMMO',
  'OMMbbffEKKffffffffffKKEffbbMMO',
  'OMMbbffEEEfffnnnnfffEEEffbbMMO',
  'OMMMbbffwwwwwwnnwwwwwwffbbMMMO',
  '.OMMMbbbwwwwwwmmwwwwwwbbbMMMO.',
  '.OMMMMbbbbwwwwwwwwwwbbbbMMMMO.',
  '..OMMMMMbbbbbbbbbbbbbbMMMMMO..',
  '...OOMMMMMMMMMMMMMMMMMMMMOO...',
  '..OrrOAAAAYYYYYYYYYYAAAAOrrO..',
  '.OrrerOAAAYYYYRRYYYYAAAOrrerO.',
  '.OrrrrOAAAAAAAAAAAAAAAAOrrrrO.',
  '.OrrerOAAAAOOOOOOOOAAAAOrrerO.',
  '..OOOO.OAAAO......OAAAO.OOOOO.',
  '.......OYYYO......OYYYOOOTTO..',
  '.......OwwwO......OwwwOTTMMMO.',
  '.......OOOOO......OOOOO.OMMMO.',
  '.........................OOO..',
];

export const KING_LEO_MAJESTIC_WALK_A = [
  '......OO..OO..OO..OO..OO....',
  '.....OYYOOYYOOYYOOYYOOYYO...',
  '....OOYRYYYYYSYYYYYYRYYYOO..',
  '..OOffOYYYYYYYYYYYYYYYYOffOO',
  '.OfftfOMMMMMMMMMMMMMMMMOftffO',
  '.OfffMMbbbbbbbbbbbbbbbbMMfffO',
  'OMMMMbbffffffffffffffffbbMMMMO',
  'OMMMbbffOOffffffffffOOffbbMMMO',
  'OMMbbffLKKffffffffffKKLffbbMMO',
  'OMMbbffEKKffffffffffKKEffbbMMO',
  'OMMbbffEEEfffnnnnfffEEEffbbMMO',
  'OMMMbbffwwwwwwnnwwwwwwffbbMMMO',
  '.OMMMbbbwwwwwwmmwwwwwwbbbMMMO.',
  '.OMMMMbbbbwwwwwwwwwwbbbbMMMMO.',
  '..OMMMMMbbbbbbbbbbbbbbMMMMMO..',
  '...OOMMMMMMMMMMMMMMMMMMMMOO...',
  '..OrrOAAAAYYYYYYYYYYAAAAOrrO..',
  '.OrrerOAAAYYYYRRYYYYAAAOrrerO.',
  '.OrrrrOAAAAAAAAAAAAAAAAOrrrrO.',
  '..OOOOOAAAAOOOOOOOOAAAAOOOOO..',
  '.....OAAAO..........OAAAOOTTO.',
  '.....OYYYO..........OYYYOTMMMO',
  '.....OwwwO..........OwwwOOMMMO',
  '.....OOOOO..........OOOOO.OOO.',
  '..............................',
];

export const KING_LEO_MAJESTIC_WALK_B = [
  '......OO..OO..OO..OO..OO....',
  '.....OYYOOYYOOYYOOYYOOYYO...',
  '....OOYRYYYYYSYYYYYYRYYYOO..',
  '..OOffOYYYYYYYYYYYYYYYYOffOO',
  '.OfftfOMMMMMMMMMMMMMMMMOftffO',
  '.OfffMMbbbbbbbbbbbbbbbbMMfffO',
  'OMMMMbbffffffffffffffffbbMMMMO',
  'OMMMbbffOOffffffffffOOffbbMMMO',
  'OMMbbffLKKffffffffffKKLffbbMMO',
  'OMMbbffEKKffffffffffKKEffbbMMO',
  'OMMbbffEEEfffnnnnfffEEEffbbMMO',
  'OMMMbbffwwwwwwnnwwwwwwffbbMMMO',
  '.OMMMbbbwwwwwwmmwwwwwwbbbMMMO.',
  '.OMMMMbbbbwwwwwwwwwwbbbbMMMMO.',
  '..OMMMMMbbbbbbbbbbbbbbMMMMMO..',
  '...OOMMMMMMMMMMMMMMMMMMMMOO...',
  '..OrrOAAAAYYYYYYYYYYAAAAOrrO..',
  '.OrrerOAAAYYYYRRYYYYAAAOrrerO.',
  '.OrrrrOAAAAAAAAAAAAAAAAOrrrrO.',
  '..OOOO.OAAAAOOOOOOAAAAO.OOOO..',
  '........OAAAO....OAAAO..OTTO..',
  '........OYYYO....OYYYOOOTMMMO.',
  '........OwwwO....OwwwO..OMMMO.',
  '........OOOOO....OOOOO...OOO..',
  '..............................',
];

export const KING_LEO_PALETTE: Record<string, string> = {
  O: '#1c1917',
  M: '#9e3b0e', // Deep Amber-Mahogany outer mane & tail tuft
  b: '#d97706', // Golden-Orange inner mane
  f: '#f59e0b', // Golden lion fur & rounded ears
  t: '#78350f', // Dark brown inner ear tuft
  Y: '#ffd700', // 5-Point Jeweled Golden Lion Crown & gold trim
  R: '#ef4444', // Crown Ruby
  S: '#38bdf8', // Crown Sapphire
  w: '#fef3c7', // Broad cream-gold lion snout/jowls
  n: '#451a03', // Wide dark-brown lion nose
  m: '#b45309', // Regal mouth line
  E: '#fbbf24', // Fierce golden-amber king eyes
  K: '#0f172a', // Eye pupil
  L: '#ffffff', // White catchlight
  r: '#dc2626', // Royal Crimson Velvet Cape
  e: '#ffffff', // White ermine cape spots
  A: '#f59e0b', // Golden Plate Armor
  T: '#fbbf24', // Long golden lion tail shaft
};

// ============================================================================
// PLAYABLE HERO #3: WOLF-KING FENRIR — TOWERING DIRE WOLF SOVEREIGN (28x25 Sprite)
// ============================================================================
export const FENRIR_SOVEREIGN_IDLE = [
  '...OOO................OOO...',
  '..OaaaO...OO....OO...OaaaO..',
  '..OaddaO.OYYOOOOYYO.OaddaO..',
  '.OadddaaOOYYYYYYYYOOadddaaO.',
  '.OadddaaaaaaaaaaaaaaaadddaO.',
  '..OaaaaadddddddddddddaaaaO..',
  '.OadddaWCCaaaaaaaaCCWadddaO.',
  '.OadddaRCCaaaaaaaaCCRadddaO.',
  '.OaaaaaawwwwnnnnwwwwaaaaaaO.',
  '..OaaaawwwwwwnnwwwwwwaaaaO..',
  '..OaaaaWW..WWWWWW..WWaaaaO..',
  '...OOaaaWWWWWWWWWWWWaaaOO...',
  '..OOppppddddddddddddppppOO..',
  '.OppKKKKAAAYYYYYYAAAKKKKppO.',
  'OppKKKKKAAAYYYYYYAAAKKKKKppO',
  'Opp.OO.OAAAAAAAAAAAAO.OO.ppO',
  'OOO....OAAAAOOOOAAAAO....OOO',
  '.......OddddO..OddddO...OTwO',
  '.......OaaaaO..OaaaaO..OTwwO',
  '.......OYYYYO..OYYYYO.OTTTwO',
  '.......OOOOOO..OOOOOO..OOOO.',
  '............................',
];

export const FENRIR_SOVEREIGN_WALK_A = [
  '...OOO................OOO...',
  '..OaaaO...OO....OO...OaaaO..',
  '..OaddaO.OYYOOOOYYO.OaddaO..',
  '.OadddaaOOYYYYYYYYOOadddaaO.',
  '.OadddaaaaaaaaaaaaaaaadddaO.',
  '..OaaaaadddddddddddddaaaaO..',
  '.OadddaWCCaaaaaaaaCCWadddaO.',
  '.OadddaRCCaaaaaaaaCCRadddaO.',
  '.OaaaaaawwwwnnnnwwwwaaaaaaO.',
  '..OaaaawwwwwwnnwwwwwwaaaaO..',
  '..OaaaaWW..WWWWWW..WWaaaaO..',
  '...OOaaaWWWWWWWWWWWWaaaOO...',
  '.OOppppddddddddddddddppppOO.',
  'OppKKKK.OAAAYYYYAAAO.KKKKppO',
  'Opp.OO..OAAAAAAAAAAO..OO.ppO',
  'OOO.....OAAAOOOOAAAO.....OOO',
  '......OddddO....OddddO..OTwO',
  '.....OaaaaO......OaaaaOOTwwO',
  '.....OYYYYO......OYYYYOTTTwO',
  '.....OOOOOO......OOOOOOOOOO.',
  '............................',
  '............................',
];

export const FENRIR_SOVEREIGN_WALK_B = [
  '...OOO................OOO...',
  '..OaaaO...OO....OO...OaaaO..',
  '..OaddaO.OYYOOOOYYO.OaddaO..',
  '.OadddaaOOYYYYYYYYOOadddaaO.',
  '.OadddaaaaaaaaaaaaaaaadddaO.',
  '..OaaaaadddddddddddddaaaaO..',
  '.OadddaWCCaaaaaaaaCCWadddaO.',
  '.OadddaRCCaaaaaaaaCCRadddaO.',
  '.OaaaaaawwwwnnnnwwwwaaaaaaO.',
  '..OaaaawwwwwwnnwwwwwwaaaaO..',
  '..OaaaaWW..WWWWWW..WWaaaaO..',
  '...OOaaaWWWWWWWWWWWWaaaOO...',
  '..OOppppddddddddddddppppOO..',
  '.OppKKKKAAAYYYYYYAAAKKKKppO.',
  '.Opp.OO.OAAAAAAAAAAO.OO.ppO.',
  '..OO....OAAAOOOOAAAO....OO..',
  '........OddddOOddddO...OTwO.',
  '........OaaaaOOaaaaO..OTwwO.',
  '........OYYYYOOYYYYO.OTTTwO.',
  '........OOOOOOOOOOOO..OOOO..',
  '............................',
  '............................',
];

export const FENRIR_SOVEREIGN_PALETTE: Record<string, string> = {
  O: '#09090b',
  a: '#64748b', // Silver-grey dire wolf fur
  d: '#334155', // Charcoal dorsal wolf coat
  w: '#cbd5e1', // Lupine snout & white tail-tip
  W: '#ffffff', // Fangs & eye catchlight
  C: '#38bdf8', // Glowing astral cyan wolf eye
  R: '#ef4444', // Crimson alpha iris accent
  n: '#0f172a', // Lupine wolf nose
  p: '#475569', // Ragged wolf shoulder pelts
  K: '#1e293b', // Dark spiked shoulder pauldrons
  A: '#334155', // Wolf-King battle plate
  Y: '#fde047', // Royal gold belt & greaves
  T: '#64748b', // Bushy wolf tail
};

// ============================================================================
// PILOTABLE STEAM-MECHA SUIT (28x28 — Nyx Visible in Open Cockpit!)
// ============================================================================
const STEAM_MECHA_MATRIX = [
  '....OOOO............OOOO....',
  '...OBBBBO..OOOOOO..OBBBBO...',
  '...OBYYBO.OHHHH*HO.OBYYBO...',
  '...OOOOOOOHHHHHHHHOOOOOOO...',
  '..ObbbbbbOffffffffObbbbbbO..',
  '.ObbYYYYbOffEEffEEObYYYYbbO.',
  '.ObbYCCYbOffffppffObYCCYbbO.',
  '.ObbbbbbbOwwffffwwObbbbbbbO.',
  '..ObbbbbbbOOOOOOOObbbbbbbO..',
  '.OOBBBBBBBBBYYYYBBBBBBBBBOO.',
  'OBBYYYYBBBBBYCCYBBBBBYYYYBBO',
  'OBBYYYYBBBBBBBBBBBBBBYYYYBBO',
  'OBBBBBBBBBBBBBBBBBBBBBBBBBBO',
  '.OOO..OBBBBBBBBBBBBBBO..OOO.',
  '......OBBBBBOOOOBBBBBO......',
  '.....OBBBBBO....OBBBBBO.....',
  '.....OYYYYYO....OYYYYYO.....',
  '....ObbbbbbO....ObbbbbbO....',
  '....OOOOOOOO....OOOOOOOO....',
];

// ============================================================================
// ARC IV–VI ENEMY & BOSS MATRICES
// ============================================================================
const CRAB_CORSAIR_MATRIX = [
  '..OOO..........OOO..',
  '.OrrrO........OrrrO.',
  'OrrrrrO.OOOO.OrrrrrO',
  'Orr.rrOOYYYYOOrr.rrO',
  '.OO.OrrrrrrrrrrO.OO.',
  '...OrrKWrrrrWKrrO...',
  '...OrrrrrrrrrrrrO...',
  '..OObbbbbbbbbbbbOO..',
  '.OrrbbbbYYYYbbbbbrO.',
  '..OO.OrrOOOOrrO.OO..',
  '....OrrO....OrrO....',
  '...OOO........OOO...',
];

const SHARK_KNIGHT_MATRIX = [
  '........OOOO........',
  '.......OssssO.......',
  '....OOOssssssOOO....',
  '..OOssssssssssssOO..',
  '.OssRRssssssssRRssO.',
  '.OssssWWWWWWWWssssO.',
  '..OOssssssssssssOO..',
  '.OAAssssssssssssAAO.',
  'OAAYYAAAAAAAAAAYYAAO',
  '.OO.OAAAAAAAAAAO.OO.',
  '....OsssOOOOsssO....',
  '....OOOO....OOOO....',
];

const SIREN_MAGE_MATRIX = [
  '....OOOOOOOOOOOO....',
  '..OOttttYYYYttttOO..',
  '.OtttffffffffttttO..',
  '.OtfCCffffffffCCftO.',
  '..OffffffppffffffO..',
  '...OOmmmmmmmmmmOO...',
  '..OmmCCCCCCCCCCmmO..',
  '.Omm.OCCCCCCCCO.mmO.',
  '.....OCCCCCCCCO.....',
  '....OCCCCCCCCCCO....',
  '...OCCCCO..OCCCCO...',
  '...OOOOO....OOOOO...',
];

const KRAKEN_TENTACLE_MATRIX = [
  '.......OOOOOO.......',
  '.....OOppppppOO.....',
  '....OppppCCppppO....',
  '...OpppCCpppppppO...',
  '...OppppppppCCppO...',
  '..OpppCCpppppppppO..',
  '..OppppppppCCppppO..',
  '.OpppCCpppppppppppO.',
  '.OppppppppCCppppppO.',
  'OpppCCppppppppCCpppO',
  'OppppppppppppppppppO',
  '.OOOOOOOOOOOOOOOOOO.',
];

const CHARYBDIS_KRAKEN_MATRIX = [
  '......OOOOOOOOOOOO......',
  '....OOppppppppppppOO....',
  '...OppppCCCCCCCCppppO...',
  '..OpppCCppppppppCCpppO..',
  '.OppppppppppppppppppppO.',
  '.OppRRWWppppppppWWRRppO.',
  'OpppRRRRppppppppRRRRpppO',
  'OppppppWWWWWWWWWWppppppO',
  'OpppppWWkkkkkkkkWWpppppO',
  '.OpppppWWWWWWWWWWpppppO.',
  '..OOppppppppppppppppOO..',
  '.OppOOppppppppppppOOppO.',
  'OppO..OppOOppOOppO..OppO',
  'OOO...OppO.OO.OppO...OOO',
  '......OOO......OOO......',
];

const CLOCKWORK_OWL_MATRIX = [
  '...OOO........OOO...',
  '..OYYYOOOOOOOOYYYO..',
  '.OYYYYbbbbbbbbYYYYO.',
  '.OYYbbCCbbbbCCbbYYO.',
  '.OYYbbCWbbbbWCbbYYO.',
  '..ObbbbbbYYbbbbbbO..',
  '...OObbbbbbbbbbOO...',
  '..OYYbbbbYYYYbbbbYYO',
  '.OYY.ObbbbbbbbO.YYO.',
  '.....ObbbOObbbO.....',
  '.....OYYO..OYYO.....',
  '.....OOOO..OOOO.....',
];

const CYBER_RAT_MATRIX = [
  '..OOOO........OOOO..',
  '.OggggO......OggggO.',
  '.OgppgOOOOOOOOgppgO.',
  '..OggggggggggggggO..',
  '.OggCCggggggggCCggO.',
  '..OgggggnnnngggggO..',
  '...OOmmmmmmmmmmOO...',
  '..OmmCCCCCCCCCCmmO..',
  '.....OggggOOggggO...',
  '....OgggO....OgggO..',
  '....OOOO......OOOO..',
];

const CHRONOS_OMEGA_MATRIX = [
  '.....OOOOOOOOOOOOOO.....',
  '...OOYYYYYYYYYYYYYYOO...',
  '..OYYbbbbYYYYYYbbbbYYO..',
  '.OYYbCCCCbYYYYbCCCCbYYO.',
  '.OYbbCWWCbYYYYbCWWCbbYO.',
  '.OYYbbbbbbYYYYbbbbbbYYO.',
  '..OObbbbbbbbbbbbbbbbOO..',
  '.OYYYYBBBBYYYYBBBBYYYYO.',
  'OYYYBBBBBBYYYYBBBBBBYYYO',
  'OYY.OBBBBBYYYYBBBBBO.YYO',
  'OOO.OBBBBBBBBBBBBBBO.OOO',
  '....OBBBBBOOOOBBBBBO....',
  '...OYYYYYO....OYYYYYO...',
  '...OOOOOO......OOOOOO...',
];

const AETHER_NULL_MATRIX = [
  '......OOOOOOOOOOOO......',
  '....OOppppRRRRppppOO....',
  '...OppRRRRYYYYRRRRppO...',
  '..OpRRYYYYWWWWYYYYRRpO..',
  '.OpRYYWWWWkkkkWWWWYYRpO.',
  '.OpRYWWkkkkkkkkkkWWYRpO.',
  'OpRRYWWkkkCCCCkkkWWYRRpO',
  'OpRRYWWkkkCCCCkkkWWYRRpO',
  '.OpRYWWkkkkkkkkkkWWYRpO.',
  '.OpRYYWWWWkkkkWWWWYYRpO.',
  '..OpRRYYYYWWWWYYYYRRpO..',
  '...OppRRRRYYYYRRRRppO...',
  '....OOppppRRRRppppOO....',
  '......OOOOOOOOOOOO......',
];

export interface HeroSpriteFrames {
  idle: HTMLCanvasElement;
  walk: HTMLCanvasElement;
  walkB?: HTMLCanvasElement;
}

export interface OmniverseSpritePack {
  heroes: Record<PlayableHeroId, HeroSpriteFrames>;
  steamMecha: HTMLCanvasElement;
  enemies: Record<string, HTMLCanvasElement>;
}

let cachedOmniverseSprites: OmniverseSpritePack | null = null;

export function getOmniverseSprites(
  nyxIdle: HTMLCanvasElement,
  nyxWalk: HTMLCanvasElement,
  duckSpr: HTMLCanvasElement
): OmniverseSpritePack {
  if (cachedOmniverseSprites) return cachedOmniverseSprites;

  const mechaSpr = renderMatrix(STEAM_MECHA_MATRIX, {
    O: '#09090b',
    B: '#b45309',
    b: '#78350f',
    Y: '#fde047',
    C: '#38bdf8',
    H: '#4c1d95',
    '*': '#fef08a',
    f: '#14121f',
    E: '#fbbf24',
    p: '#ff8fab',
    w: '#f8fafc',
  });

  const enemies: Record<string, HTMLCanvasElement> = {
    crab_corsair: renderMatrix(CRAB_CORSAIR_MATRIX, {
      O: '#1c1917',
      r: '#ef4444',
      Y: '#fde047',
      K: '#09090b',
      W: '#ffffff',
      b: '#1e3a8a',
    }),
    shark_knight: renderMatrix(SHARK_KNIGHT_MATRIX, {
      O: '#0f172a',
      s: '#0284c7',
      R: '#ef4444',
      W: '#f8fafc',
      A: '#cbd5e1',
      Y: '#fde047',
    }),
    siren_mage: renderMatrix(SIREN_MAGE_MATRIX, {
      O: '#134e4a',
      t: '#2dd4bf',
      Y: '#fde047',
      f: '#ccfbf1',
      C: '#ec4899',
      p: '#ff8fab',
      m: '#0d9488',
    }),
    abyssal_eel: renderMatrix(SIREN_MAGE_MATRIX, {
      O: '#090d16',
      t: '#38bdf8',
      Y: '#fef08a',
      f: '#1e3a8a',
      C: '#fde047',
      p: '#22d3ee',
      m: '#1d4ed8',
    }),
    kraken_tentacle: renderMatrix(KRAKEN_TENTACLE_MATRIX, {
      O: '#090d16',
      p: '#0e7490',
      C: '#22d3ee',
    }),
    charybdis_kraken: renderMatrix(
      CHARYBDIS_KRAKEN_MATRIX,
      {
        O: '#090d16',
        p: '#0891b2',
        C: '#67e8f9',
        R: '#f43f5e',
        W: '#f8fafc',
        k: '#020617',
      },
      2
    ),
    clockwork_owl: renderMatrix(CLOCKWORK_OWL_MATRIX, {
      O: '#1c1917',
      Y: '#facc15',
      b: '#92400e',
      C: '#38bdf8',
      W: '#ffffff',
    }),
    cyber_rat: renderMatrix(CYBER_RAT_MATRIX, {
      O: '#09090b',
      g: '#475569',
      p: '#ec4899',
      C: '#22d3ee',
      n: '#f43f5e',
      m: '#312e81',
    }),
    steam_golem: renderMatrix(CLOCKWORK_OWL_MATRIX, {
      O: '#18181b',
      Y: '#f97316',
      b: '#52525b',
      C: '#fde047',
      W: '#fef9c3',
    }),
    tesla_drone: renderMatrix(CLOCKWORK_OWL_MATRIX, {
      O: '#0f172a',
      Y: '#38bdf8',
      b: '#1e3a8a',
      C: '#fde047',
      W: '#ffffff',
    }),
    chronos_omega: renderMatrix(
      CHRONOS_OMEGA_MATRIX,
      {
        O: '#09090b',
        Y: '#fde047',
        b: '#78350f',
        B: '#b45309',
        C: '#38bdf8',
        W: '#ffffff',
      },
      2
    ),
    void_stalker: renderMatrix(CYBER_RAT_MATRIX, {
      O: '#090514',
      g: '#4c1d95',
      p: '#c084fc',
      C: '#38bdf8',
      n: '#f43f5e',
      m: '#1e1b4b',
    }),
    nebula_seraph: renderMatrix(SIREN_MAGE_MATRIX, {
      O: '#1e1b4b',
      t: '#fde047',
      Y: '#ffffff',
      f: '#c084fc',
      C: '#38bdf8',
      p: '#f472b6',
      m: '#6366f1',
    }),
    entropy_knight: renderMatrix(SHARK_KNIGHT_MATRIX, {
      O: '#090514',
      s: '#3b0764',
      R: '#f43f5e',
      W: '#fde047',
      A: '#581c87',
      Y: '#38bdf8',
    }),
    void_clone_nyx: nyxIdle,
    aether_null: renderMatrix(
      AETHER_NULL_MATRIX,
      {
        O: '#090514',
        p: '#7e22ce',
        R: '#f43f5e',
        Y: '#fde047',
        W: '#ffffff',
        k: '#020105',
        C: '#38bdf8',
      },
      2
    ),
  };

  cachedOmniverseSprites = {
    heroes: {
      nyx: { idle: nyxIdle, walk: nyxWalk, walkB: nyxWalk },
      king_leo: {
        idle: renderMatrix(KING_LEO_MAJESTIC_IDLE, KING_LEO_PALETTE, 1),
        walk: renderMatrix(KING_LEO_MAJESTIC_WALK_A, KING_LEO_PALETTE, 1),
        walkB: renderMatrix(KING_LEO_MAJESTIC_WALK_B, KING_LEO_PALETTE, 1),
      },
      fenrir: {
        idle: renderMatrix(FENRIR_SOVEREIGN_IDLE, FENRIR_SOVEREIGN_PALETTE, 1),
        walk: renderMatrix(FENRIR_SOVEREIGN_WALK_A, FENRIR_SOVEREIGN_PALETTE, 1),
        walkB: renderMatrix(FENRIR_SOVEREIGN_WALK_B, FENRIR_SOVEREIGN_PALETTE, 1),
      },
      great_duck: {
        idle: duckSpr,
        walk: duckSpr,
        walkB: duckSpr,
      },
    },
    steamMecha: mechaSpr,
    enemies,
  };

  return cachedOmniverseSprites;
}

export type OmniverseSpriteBank = OmniverseSpritePack;

// ============================================================================
// UNIVERSAL MULTI-FRAME LIVING ANIMATION ENGINE OVERLAYS
// Drives continuous procedural 4-frame walk cycles, breathing, blinking,
// ear twitches, tail wagging, billowing capes/manes, and weapon swings!
// ============================================================================
export function drawLivingHeroDetails(
  ctx: CanvasRenderingContext2D,
  heroId: PlayableHeroId,
  x: number,
  y: number,
  facing: Direction,
  isMoving: boolean,
  attackTimer: number,
  globalTime: number,
  offsetSeed = 0
): void {
  const t = globalTime * 6.0 + offsetSeed;
  const dirSign = facing === 'left' ? -1 : 1;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  if (heroId === 'king_leo') {
    // Crisp Pixel-Outlined Sun-Lion Broadsword held outside the right/left hand (never covering the face!)
    const swingAng =
      attackTimer > 0
        ? dirSign * (1.1 - (attackTimer / 0.22) * 2.2)
        : Math.sin(t * (isMoving ? 2.2 : 0.9)) * 0.14;
    ctx.save();
    ctx.translate(dirSign * 14, 3);
    ctx.rotate(swingAng);
    // Black pixel outline
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-2, -10, 4, 12);
    ctx.fillRect(-3, -2, 6, 3);
    // Golden hilt & crossguard
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-2, -1, 4, 1);
    // Sun-Lion blade & white gleam
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-1, -9, 2, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -8, 1, 6);
    ctx.restore();
  } else if (heroId === 'fenrir') {
    // Crisp Pixel-Outlined Eclipse War-Axe held outside the hand
    const axeSwing =
      attackTimer > 0
        ? dirSign * (1.25 - (attackTimer / 0.22) * 2.4)
        : Math.sin(t * (isMoving ? 2.4 : 1.0)) * 0.16;
    ctx.save();
    ctx.translate(dirSign * 14, 3);
    ctx.rotate(axeSwing);
    // Black pixel outline
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-1, -9, 3, 11);
    ctx.fillRect(dirSign > 0 ? 0 : -4, -8, 5, 6);
    // Handle & glowing cyan blade
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, -8, 1, 9);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(dirSign > 0 ? 1 : -3, -7, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dirSign > 0 ? 3 : -3, -6, 1, 2);
    ctx.restore();
  } else if (heroId === 'great_duck') {
    // Concentric Sacred Lotus Water Ripples underneath The Great Duck
    const rippleR = 11 + ((globalTime * 10) % 5);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, rippleR, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (attackTimer > 0) {
    // Nyx Arcane Slash Spark during active swing
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(dirSign * 11, -3, 2, 2);
  }

  ctx.restore();
}

