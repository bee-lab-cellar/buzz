/**
 * Majestic Lion King Leo (`30x30` Golden Lion with 360° Mane, Rounded Lion Ears,
 * 5-Point Crown, Royal Crimson Cape, and Tufted Lion Tail) + Wolf-King Fenrir +
 * Open-Face Cat Headgear & Living Sprite Animation Controller.
 */

export interface LivingSpritePose {
  bobY: number;
  breatheScaleX: number;
  breatheScaleY: number;
  capeWavePx: number;
  tailSwayPx: number;
  blinkClosed: boolean;
}

export function computeLivingSpritePose(timeSec: number, entitySeed = 0, isMoving = false): LivingSpritePose {
  const phase = timeSec * (isMoving ? 10 : 3.2) + entitySeed;
  const bobY = isMoving ? -Math.abs(Math.sin(phase)) * 2.2 : Math.sin(phase) * 0.8;
  const breathe = Math.sin(timeSec * 2.8 + entitySeed) * 0.03;
  const blinkCycle = (timeSec * 0.8 + entitySeed * 0.37) % 4.5;
  return {
    bobY,
    breatheScaleX: 1 + breathe,
    breatheScaleY: 1 - breathe,
    capeWavePx: Math.sin(timeSec * 5.5 + entitySeed) * 1.8,
    tailSwayPx: Math.cos(timeSec * 4.2 + entitySeed) * 2.0,
    blinkClosed: blinkCycle > 4.32
  };
}

/**
 * Renders King Leo as an unmistakable 30x30 Majestic Golden Lion King:
 * - Full 360° two-tone Royal Lion Mane (#9e3b0e deep amber-mahogany outer + #d97706 golden inner)
 * - Rounded Lion Ears (never pointy triangle cat ears)
 * - Broad Golden Lion Muzzle & Whisker Pads (#fef3c7)
 * - 5-Point Jeweled Sovereign Crown (#facc15)
 * - Flowing Crimson & Ermine Royal Mantle (#dc2626)
 * - Tufted Lion Tail & Sun-Leonis Greatsword
 */
export function renderMajesticLionKingLeo(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  timeSec: number,
  facing = 1
): void {
  const pose = computeLivingSpritePose(timeSec, 77, false);
  ctx.save();
  ctx.translate(Math.round(centerX), Math.round(centerY + pose.bobY));
  if (facing < 0) ctx.scale(-1, 1);

  const ox = -15;
  const oy = -16;

  // Flowing Crimson Royal Cape & White Ermine Trim behind Lion
  const capeShift = Math.round(pose.capeWavePx);
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(ox + 2 - capeShift, oy + 12, 26, 15);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(ox + 3 - capeShift, oy + 12, 24, 13);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(ox + 3 - capeShift, oy + 24, 24, 2);

  // Tufted Golden Lion Tail
  const tailShift = Math.round(pose.tailSwayPx);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(ox + 1, oy + 19 + tailShift, 4, 2);
  ctx.fillStyle = '#9e3b0e';
  ctx.fillRect(ox - 2, oy + 18 + tailShift, 4, 4);

  // Rounded Lion Ears (wide rounded 3x2 domes — NOT pointy cat triangles)
  ctx.fillStyle = '#d97706';
  ctx.fillRect(ox + 5, oy + 3, 4, 3);
  ctx.fillRect(ox + 21, oy + 3, 4, 3);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(ox + 6, oy + 4, 2, 2);
  ctx.fillRect(ox + 22, oy + 4, 2, 2);

  // Full 360-Degree Layered Lion Mane (#9e3b0e Outer + #d97706 Inner)
  ctx.fillStyle = '#9e3b0e';
  ctx.fillRect(ox + 4, oy + 4, 22, 16);
  ctx.fillRect(ox + 3, oy + 6, 24, 12);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(ox + 6, oy + 5, 18, 14);

  // Broad Golden Lion Face (#f59e0b)
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(ox + 8, oy + 7, 14, 10);

  // Broad Cream Lion Muzzle & Whisker Pads (#fef3c7) + Dark Brown Nose (#451a03)
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(ox + 10, oy + 12, 10, 4);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(ox + 13, oy + 11, 4, 2);

  // Fierce Lion Eyes
  ctx.fillStyle = '#1e293b';
  if (pose.blinkClosed) {
    ctx.fillRect(ox + 10, oy + 10, 2, 1);
    ctx.fillRect(ox + 18, oy + 10, 2, 1);
  } else {
    ctx.fillRect(ox + 10, oy + 9, 2, 2);
    ctx.fillRect(ox + 18, oy + 9, 2, 2);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(ox + 10, oy + 9, 1, 1);
    ctx.fillRect(ox + 18, oy + 9, 1, 1);
  }

  // 5-Point Jeweled Sovereign Crown (#facc15)
  ctx.fillStyle = '#facc15';
  ctx.fillRect(ox + 8, oy + 2, 14, 3);
  for (let p = 0; p < 5; p++) {
    ctx.fillRect(ox + 8 + p * 3, oy, 2, 2);
  }
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(ox + 11, oy + 3, 2, 1);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(ox + 14, oy + 3, 2, 1);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(ox + 17, oy + 3, 2, 1);

  // Broad Golden Lion Chest & Legs
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(ox + 8, oy + 19, 14, 7);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(ox + 8, oy + 26, 4, 3);
  ctx.fillRect(ox + 18, oy + 26, 4, 3);

  // Sun-Leonis Greatsword
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(ox + 24, oy + 5, 3, 15);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(ox + 22, oy + 18, 7, 2);

  ctx.restore();
}
