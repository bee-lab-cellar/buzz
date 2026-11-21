/**
 * Layer 3 — Hero Sprite Modules: Wolf-King Fenrir (32x32) & The Great Duck Archmage (32x32)
 * Strictly typed, pre-baked 8-frame offscreen canvases, zero `any`.
 */

import type { AnimationClipName, HeroId } from '../types/entities';
import { HERO_FENRIR_MATRIX, HERO_GREAT_DUCK_MATRIX } from './heroFenrirAndDuckMatrices';
import { mapClipToFrame8 } from './heroNyxAndKingLeo';
import {
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
  type SpriteSheet8Frame,
} from './spriteMatrixTypes';

export interface MythicHeroVisualSpec {
  readonly heroId: Extract<HeroId, 'fenrir' | 'great_duck'>;
  readonly displayName: string;
  readonly width: 32;
  readonly height: 32;
  readonly signatureFeatures: ReadonlyArray<string>;
  readonly sheet: SpriteSheet8Frame;
}

export const FENRIR_VISUAL_SPEC: MythicHeroVisualSpec = {
  heroId: 'fenrir',
  displayName: 'Wolf-King Fenrir, Reformed Eclipse Sovereign',
  width: 32,
  height: 32,
  signatureFeatures: [
    'Silver-frost lupine snout with crisp white fangs',
    'Twin rune-etched Eclipse Battleaxes',
    'Frost-wolf shoulder pauldrons & jagged warcloak',
  ],
  sheet: HERO_FENRIR_MATRIX,
};

export const GREAT_DUCK_VISUAL_SPEC: MythicHeroVisualSpec = {
  heroId: 'great_duck',
  displayName: 'The Great Duck, Archmage of the Golden Pond',
  width: 32,
  height: 32,
  signatureFeatures: [
    'Golden-white Mallard plumage with bright amber bill',
    'Star-spangled indigo archmage hat',
    'Flapping wing animation frames & floating golden lotus pedestal',
  ],
  sheet: HERO_GREAT_DUCK_MATRIX,
};

export interface PrebakedMythicHeroAtlas {
  readonly heroId: Extract<HeroId, 'fenrir' | 'great_duck'>;
  readonly width: 32;
  readonly height: 32;
  readonly frames: Readonly<Record<SpriteFrame8Name, HTMLCanvasElement>>;
}

const MYTHIC_ATLAS_CACHE = new Map<string, PrebakedMythicHeroAtlas>();

export function prebakeFenrirOrDuckAtlas(
  heroId: Extract<HeroId, 'fenrir' | 'great_duck'>,
): PrebakedMythicHeroAtlas | null {
  if (typeof document === 'undefined') return null;
  const cached = MYTHIC_ATLAS_CACHE.get(heroId);
  if (cached) return cached;

  const spec = heroId === 'fenrir' ? FENRIR_VISUAL_SPEC : GREAT_DUCK_VISUAL_SPEC;
  const frameNames: ReadonlyArray<SpriteFrame8Name> = [
    'idle1',
    'idle2',
    'walk1',
    'walk2',
    'walk3',
    'walk4',
    'attack1',
    'attack2',
  ];

  const frames = {} as Record<SpriteFrame8Name, HTMLCanvasElement>;
  for (const name of frameNames) {
    frames[name] = renderPixelMatrixToCanvas(
      spec.sheet.frames[name],
      spec.sheet.palette,
      spec.width,
      spec.height,
    );
  }

  const atlas: PrebakedMythicHeroAtlas = {
    heroId,
    width: 32,
    height: 32,
    frames,
  };
  MYTHIC_ATLAS_CACHE.set(heroId, atlas);
  return atlas;
}

export function drawHeroFenrirOrGreatDuck(
  ctx: CanvasRenderingContext2D,
  heroId: Extract<HeroId, 'fenrir' | 'great_duck'>,
  x: number,
  y: number,
  clip: AnimationClipName,
  frameIndex: number,
  facingX: 1 | -1,
  timeSec: number,
): void {
  const atlas = prebakeFenrirOrDuckAtlas(heroId);
  if (!atlas) return;
  const frame = atlas.frames[mapClipToFrame8(clip, frameIndex)];

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const lotusHoverY = heroId === 'great_duck' ? Math.sin(timeSec * 4.2) * 1.8 : 0;
  ctx.translate(Math.round(x), Math.round(y + lotusHoverY));

  if (heroId === 'great_duck') {
    // Subtle floating golden lotus ring beneath The Great Duck
    ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 1, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (facingX < 0) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(frame, -16, -32);
  ctx.restore();
}

export { HERO_FENRIR_MATRIX, HERO_GREAT_DUCK_MATRIX };
