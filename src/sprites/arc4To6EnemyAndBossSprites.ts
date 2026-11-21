/**
 * Layer 3 — Arc IV–VI Enemy & Final Boss Sprite Atlas (Acts 123–300)
 * - Arc IV: Shark-Knights, Crab-Corsairs, Siren-Mages, 8-Tentacle Charybdis
 *   with crisp glowing cyan/gold 2.5x Severing Weak-Spot rings (zero clutter!)
 * - Arc V: Steam-Golems, Clockwork Owls, Cyber-Rats, Chronos-Omega
 * - Arc VI: Void-Stalkers, Evil Clone Nyx, 5-Phase Aether-Null
 */

import type { AnimationClipName } from '../types/entities';
import {
  BOSS_CHARYBDIS_KRAKEN_MATRIX,
  ENEMY_CRAB_CORSAIR_MATRIX,
  ENEMY_SHARK_KNIGHT_MATRIX,
  ENEMY_SIREN_MAGE_MATRIX,
  KRAKEN_TENTACLE_WEAKSPOT_RING,
} from './arc4KrakenAndAbyssMatrices';
import {
  BOSS_AETHER_NULL_MATRIX,
  BOSS_CHRONOS_OMEGA_MATRIX,
  ENEMY_CLOCKWORK_OWL_MATRIX,
  ENEMY_CYBER_RAT_MATRIX,
  ENEMY_STEAM_GOLEM_MATRIX,
} from './arc5And6MechaVoidMatrices';
import { HERO_NYX_MATRIX } from './heroNyxMatrices';
import { mapClipToFrame8 } from './heroNyxAndKingLeo';
import {
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
  type SpriteSheet8Frame,
} from './spriteMatrixTypes';

export type Arc4To6EntitySpriteId =
  | 'shark_knight'
  | 'crab_corsair'
  | 'siren_mage'
  | 'charybdis_kraken'
  | 'steam_golem'
  | 'clockwork_owl'
  | 'cyber_rat'
  | 'chronos_omega'
  | 'void_stalker'
  | 'evil_clone_nyx'
  | 'aether_null';

const EVIL_CLONE_NYX_PALETTE: Record<string, string> = {
  ...HERO_NYX_MATRIX.palette,
  b: '#140b24',
  c: '#2e1065',
  e: '#f43f5e',
  g: '#c084fc',
  w: '#a855f7',
  n: '#fb7185',
};

const VOID_STALKER_PALETTE: Record<string, string> = {
  ...ENEMY_SHARK_KNIGHT_MATRIX.palette,
  s: '#1e1b4b',
  a: '#312e81',
  e: '#e879f9',
  g: '#c084fc',
};

const ARC4_TO_6_SHEET_MAP: Readonly<Record<Arc4To6EntitySpriteId, { sheet: SpriteSheet8Frame; palette?: Record<string, string> }>> = {
  shark_knight: { sheet: ENEMY_SHARK_KNIGHT_MATRIX },
  crab_corsair: { sheet: ENEMY_CRAB_CORSAIR_MATRIX },
  siren_mage: { sheet: ENEMY_SIREN_MAGE_MATRIX },
  charybdis_kraken: { sheet: BOSS_CHARYBDIS_KRAKEN_MATRIX },
  steam_golem: { sheet: ENEMY_STEAM_GOLEM_MATRIX },
  clockwork_owl: { sheet: ENEMY_CLOCKWORK_OWL_MATRIX },
  cyber_rat: { sheet: ENEMY_CYBER_RAT_MATRIX },
  chronos_omega: { sheet: BOSS_CHRONOS_OMEGA_MATRIX },
  void_stalker: { sheet: ENEMY_SHARK_KNIGHT_MATRIX, palette: VOID_STALKER_PALETTE },
  evil_clone_nyx: { sheet: HERO_NYX_MATRIX, palette: EVIL_CLONE_NYX_PALETTE },
  aether_null: { sheet: BOSS_AETHER_NULL_MATRIX },
};

const ARC46_CACHE = new Map<string, HTMLCanvasElement>();

export function getArc4To6SpriteCanvas(
  spriteId: Arc4To6EntitySpriteId,
  clip: AnimationClipName,
  frameIndex: number,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const frame: SpriteFrame8Name = mapClipToFrame8(clip, frameIndex);
  const key = `arc46:${spriteId}:${frame}`;
  const cached = ARC46_CACHE.get(key);
  if (cached) return cached;

  const entry = ARC4_TO_6_SHEET_MAP[spriteId];
  const canvas = renderPixelMatrixToCanvas(
    entry.sheet.frames[frame],
    entry.palette ?? entry.sheet.palette,
    entry.sheet.width,
    entry.sheet.height,
  );
  ARC46_CACHE.set(key, canvas);
  return canvas;
}

/**
 * Draws the crisp cyan/gold 2.5x Severing Weak-Spot cut ring at a Kraken Tentacle's mid/base segment.
 * Zero `ctx.shadowBlur` — pure crisp concentric pixel-art ring for 60FPS clarity.
 */
export function drawKrakenTentacleWeakSpotRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  timeSec: number,
): void {
  const pulse = 1 + Math.sin(timeSec * 8) * 0.12;
  const r = Math.max(5, radius * pulse);

  ctx.save();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), Math.max(2, r - 2.5), 0, Math.PI * 2);
  ctx.stroke();

  // Four crisp compass cut ticks
  ctx.fillStyle = '#fef08a';
  const rx = Math.round(x);
  const ry = Math.round(y);
  const d = Math.round(r + 1);
  ctx.fillRect(rx - 1, ry - d - 1, 2, 2);
  ctx.fillRect(rx - 1, ry + d - 1, 2, 2);
  ctx.fillRect(rx - d - 1, ry - 1, 2, 2);
  ctx.fillRect(rx + d - 1, ry - 1, 2, 2);
  ctx.restore();
}

export {
  BOSS_AETHER_NULL_MATRIX,
  BOSS_CHARYBDIS_KRAKEN_MATRIX,
  BOSS_CHRONOS_OMEGA_MATRIX,
  KRAKEN_TENTACLE_WEAKSPOT_RING,
};
