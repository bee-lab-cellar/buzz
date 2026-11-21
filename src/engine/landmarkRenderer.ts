import { ActBlueprint } from '../maps/arc1Acts1to41';
import { findNearestDryTile } from '../game/acts';

const SPECIAL_LANDMARK_EXCLUSION_ACTS = new Set([40, 41, 81, 82, 121, 122, 179, 180, 239, 240, 299, 300]);

export function renderActLandmarkPlace(
  ctx: CanvasRenderingContext2D,
  blueprint: ActBlueprint,
  grid: string[],
  playerX: number,
  playerY: number,
  globalTime: number
) {
  if (SPECIAL_LANDMARK_EXCLUSION_ACTS.has(blueprint.actId)) return;

  const lm = blueprint.landmark;
  const safeSpot = grid.length > 0 ? findNearestDryTile(grid, lm.x, lm.y, true) : { x: lm.x, y: lm.y };
  const x = Math.round(safeSpot.x);
  const y = Math.round(safeSpot.y);
  const pulse = Math.sin(globalTime * 5);

  ctx.save();

  // Base Stone Plinth
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.beginPath();
  ctx.ellipse(x, y + 10, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (lm.id) {
    case 'ruined_watchtower':
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - 10, y - 18, 20, 26);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x - 8, y - 16, 16, 22);
      ctx.fillStyle = pulse > 0 ? '#fde047' : '#f97316';
      ctx.fillRect(x - 3, y - 22, 6, 4);
      break;
    case 'goblin_bonfire':
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x - 9, y + 2, 18, 5);
      ctx.fillStyle = pulse > 0 ? '#f97316' : '#ef4444';
      ctx.fillRect(x - 6, y - 10, 12, 12);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x - 3, y - 7, 6, 8);
      break;
    case 'giant_hollow_oak':
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x - 9, y - 14, 18, 22);
      ctx.fillStyle = '#14532d';
      ctx.fillRect(x - 14, y - 24, 28, 14);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x - 11, y - 22, 22, 10);
      break;
    case 'spinning_watermill': {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x - 10, y - 14, 20, 20);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 8, y - 4, 9, 0, Math.PI * 2);
      ctx.stroke();
      const ang = globalTime * 3.5;
      ctx.beginPath();
      ctx.moveTo(x + 8 - Math.cos(ang) * 8, y - 4 - Math.sin(ang) * 8);
      ctx.lineTo(x + 8 + Math.cos(ang) * 8, y - 4 + Math.sin(ang) * 8);
      ctx.stroke();
      break;
    }
    case 'luminous_mushroom_shrine':
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x - 4, y - 6, 8, 14);
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(x - 12, y - 16, 24, 10);
      ctx.fillStyle = '#a5f3fc';
      ctx.fillRect(x - 8, y - 14, 4, 4);
      ctx.fillRect(x + 4, y - 13, 4, 4);
      break;
    case 'frozen_mammoth_skeleton':
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x - 14, y - 10, 28, 4);
      for (let r = -12; r <= 12; r += 6) {
        ctx.fillRect(x + r, y - 10, 2, 14);
      }
      break;
    case 'dwarven_magma_smeltery':
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 12, y - 14, 24, 20);
      ctx.fillStyle = pulse > 0 ? '#fde047' : '#f97316';
      ctx.fillRect(x - 6, y - 6, 12, 10);
      break;
    case 'drowned_bell_tower':
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(x - 9, y - 18, 18, 24);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x - 4, y - 10, 8, 8);
      break;
    default:
      // Sanctuary / Astral / Observatory / Event-Horizon Altars
      ctx.fillStyle = '#312e81';
      ctx.fillRect(x - 12, y - 14, 24, 20);
      ctx.strokeStyle = '#fde047';
      ctx.strokeRect(x - 12.5, y - 14.5, 25, 21);
      ctx.fillStyle = pulse > 0 ? '#38bdf8' : '#fde047';
      ctx.fillRect(x - 4, y - 10, 8, 8);
      break;
  }

  // Show Landmark Name Banner when Nyx is nearby
  if (Math.hypot(playerX - x, playerY - y) <= 64) {
    ctx.font = 'bold 5px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#090d16';
    ctx.fillText(`🏛️ ${lm.name.toUpperCase()}`, x + 1, y - 24);
    ctx.fillStyle = '#fde047';
    ctx.fillText(`🏛️ ${lm.name.toUpperCase()}`, x, y - 25);
  }

  ctx.restore();
}
