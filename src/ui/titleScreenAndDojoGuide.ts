import { ALL_300_ATLAS_ACTS, getAtlasAct, type AtlasActEntry } from '../atlas/index';
import { InteractiveGuideModal } from '../components/InteractiveGuideModal';
import { TitleArenaSimulator } from '../game/titleArenaSim';
import {
  HERO_FENRIR_MATRIX,
  HERO_GREAT_DUCK_MATRIX,
  HERO_KING_LEO_MATRIX,
  HERO_NYX_MATRIX,
  getCachedSpriteFrameCanvas,
  type SpriteSheet8Frame,
} from '../sprites/index';

export { InteractiveGuideModal, TitleArenaSimulator };

export interface TitleHeroShowcaseCard {
  id: 'nyx' | 'king_leo' | 'fenrir' | 'great_duck';
  name: string;
  roleTitle: string;
  spriteSheet: SpriteSheet8Frame;
}

export function getTitleScreenHeroShowcase(): TitleHeroShowcaseCard[] {
  return [
    {
      id: 'nyx',
      name: 'Nyx',
      roleTitle: 'Arcane Blade-Cat & Alchemist',
      spriteSheet: HERO_NYX_MATRIX,
    },
    {
      id: 'king_leo',
      name: 'King Leo',
      roleTitle: 'Majestic Golden Lion King',
      spriteSheet: HERO_KING_LEO_MATRIX,
    },
    {
      id: 'fenrir',
      name: 'Wolf-King Fenrir',
      roleTitle: 'Twin-Axe Berserker Monarch',
      spriteSheet: HERO_FENRIR_MATRIX,
    },
    {
      id: 'great_duck',
      name: 'The Great Duck',
      roleTitle: 'Grand Archmage of the Lotus',
      spriteSheet: HERO_GREAT_DUCK_MATRIX,
    },
  ];
}

export function getTitleHeroIdleCanvas(
  heroId: TitleHeroShowcaseCard['id'],
  timeSec: number
): HTMLCanvasElement | null {
  const spriteIdMap: Record<TitleHeroShowcaseCard['id'], string> = {
    nyx: HERO_NYX_MATRIX.id,
    king_leo: HERO_KING_LEO_MATRIX.id,
    fenrir: HERO_FENRIR_MATRIX.id,
    great_duck: HERO_GREAT_DUCK_MATRIX.id,
  };
  const frame = Math.floor(timeSec * 3) % 2 === 0 ? 'idle1' : 'idle2';
  return getCachedSpriteFrameCanvas(spriteIdMap[heroId], frame);
}

export function getAtlasCampaignSummary(actId: number): {
  totalActs: number;
  currentAct: AtlasActEntry;
  arcActCount: number;
} {
  const currentAct = getAtlasAct(actId);
  const arcActCount = ALL_300_ATLAS_ACTS.filter((a) => a.arc === currentAct.arc).length;
  return {
    totalActs: ALL_300_ATLAS_ACTS.length,
    currentAct,
    arcActCount,
  };
}
