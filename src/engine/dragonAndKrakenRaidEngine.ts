import {
  evaluateDragonAnatomyStrike,
  type DragonAnatomyPart,
  type DragonPartStrikeResult,
} from './dragonSkySiegeController';
import {
  evaluateTentacleStrike,
  renderTentacleWeakSpotRing,
  type TentacleCutEvaluation,
} from './krakenTentacleController';
import {
  ARC3_ARTICULATED_DRAGON_MATRICES,
  ARC3_DRAGON_PALETTES,
  BOSS_CHARYBDIS_KRAKEN_MATRIX,
  KRAKEN_TENTACLE_WEAKSPOT_RING,
  getCachedSpriteFrameCanvas,
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
} from '../sprites/index';

export type { DragonAnatomyPart, DragonPartStrikeResult, TentacleCutEvaluation };

export interface HarpoonSkyCrashOutcome {
  groundedDurationSec: number;
  bonusDamageRatio: number;
  bannerText: string;
}

export function evaluateRaidPartHit(
  arc: 1 | 2 | 3 | 4 | 5 | 6,
  relX: number,
  relY: number,
  options: { isGrounded?: boolean; tentacleWillDie?: boolean; isBossTentacle?: boolean } = {}
): { dragon?: DragonPartStrikeResult; kraken?: TentacleCutEvaluation } {
  if (arc === 3) {
    return {
      dragon: evaluateDragonAnatomyStrike(relX, relY, Boolean(options.isGrounded)),
    };
  }
  if (arc === 4) {
    const dist = Math.hypot(relX, relY);
    return {
      kraken: evaluateTentacleStrike(
        dist,
        Boolean(options.tentacleWillDie),
        Boolean(options.isBossTentacle)
      ),
    };
  }
  return {};
}

export function resolveHarpoonSkyCrash(ballistaCharge = 1.0): HarpoonSkyCrashOutcome {
  const clamped = Math.max(0.5, Math.min(2.0, ballistaCharge));
  return {
    groundedDurationSec: 5.0 * clamped,
    bonusDamageRatio: 0.08 * clamped,
    bannerText: '💥 SKY-CRASH! DRAGON GROUNDED (5s)!',
  };
}

export function getArticulatedDragonPartCanvas(
  part: 'head' | 'leftWing' | 'rightWing' | 'severableTail' | 'chestCore',
  frame: SpriteFrame8Name,
  paletteId: keyof typeof ARC3_DRAGON_PALETTES = 'ignis_drakon'
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const palette = ARC3_DRAGON_PALETTES[paletteId] ?? ARC3_ARTICULATED_DRAGON_MATRICES.palette;
  const partRows = ARC3_ARTICULATED_DRAGON_MATRICES[part][frame];
  return renderPixelMatrixToCanvas(
    partRows,
    palette,
    ARC3_ARTICULATED_DRAGON_MATRICES.width,
    ARC3_ARTICULATED_DRAGON_MATRICES.height
  );
}

export function getCharybdisBossCanvas(frame: SpriteFrame8Name): HTMLCanvasElement | null {
  return getCachedSpriteFrameCanvas(BOSS_CHARYBDIS_KRAKEN_MATRIX.id, frame);
}

export function renderKrakenWeakSpotOverlay(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeSec: number
): void {
  if (typeof document !== 'undefined') {
    const pulseFrame = Math.floor(timeSec * 4) % 2;
    const ringCanvas = renderPixelMatrixToCanvas(
      KRAKEN_TENTACLE_WEAKSPOT_RING.frames[pulseFrame],
      KRAKEN_TENTACLE_WEAKSPOT_RING.palette,
      KRAKEN_TENTACLE_WEAKSPOT_RING.width,
      KRAKEN_TENTACLE_WEAKSPOT_RING.height
    );
    ctx.drawImage(ringCanvas, Math.round(x - 8), Math.round(y - 13));
    return;
  }
  renderTentacleWeakSpotRing(ctx, x, y, timeSec);
}
