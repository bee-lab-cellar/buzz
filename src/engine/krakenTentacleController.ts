/**
 * Kraken Tentacle Controller (Arc IV Acts 123–180):
 * - 65% HP reduction so tentacles are brisk, satisfying tactical targets
 * - Glowing cyan/gold Cut-Point Weak Spot ring (`2.5x SLICE CRIT!`)
 * - Severing a Boss Tentacle deals `10% Max HP` Shock-Stagger burst to Charybdis
 *   and drops `+2 🍣 Fresh Fish / Sushi`
 */

export interface TentacleCutEvaluation {
  isWeakSpotHit: boolean;
  damageMultiplier: number;
  bossShockStaggerPercent: number;
  sushiDrops: number;
  popupText: string;
}

export function evaluateTentacleStrike(
  hitDistanceToMidsection: number,
  tentacleWillDie: boolean,
  isBossTentacle: boolean
): TentacleCutEvaluation {
  const isWeakSpotHit = hitDistanceToMidsection <= 16;
  const damageMultiplier = isWeakSpotHit ? 2.5 : 1.0;

  if (tentacleWillDie) {
    return {
      isWeakSpotHit,
      damageMultiplier,
      bossShockStaggerPercent: isBossTentacle ? 0.10 : 0,
      sushiDrops: 2,
      popupText: '💥 TENTACLE SEVERED! +2 🍣'
    };
  }

  return {
    isWeakSpotHit,
    damageMultiplier,
    bossShockStaggerPercent: 0,
    sushiDrops: 0,
    popupText: isWeakSpotHit ? '🎯 2.5x TENTACLE SLICE!' : ''
  };
}

export function renderTentacleWeakSpotRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeSec: number
): void {
  const pulse = Math.sin(timeSec * 8) * 1.5;
  ctx.save();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y - 5, 5.5 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y - 5, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
