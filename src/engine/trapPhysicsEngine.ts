import { ActBlueprint } from '../maps/arc1Acts1to41';
import { getTileElevation } from './terrainTopographyEngine';

export interface ActiveTrapHazard {
  id: string;
  trapType: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  timer: number;
  phase: number;
  active: boolean;
  elevation: 0 | 1 | 2;
}

export interface TrapSystemState {
  hazards: ActiveTrapHazard[];
  acidTideLevel: number; // 0 to 1.0 (when > 0.65, Elevation 0 takes acid damage; > 0.85, Elevation 1 takes damage; Elevation 2 is always safe!)
  acidTideRising: boolean;
  globalCycleTimer: number;
}

const EXCLUDED_TRAP_ACTS = new Set([40, 41, 81, 82, 121, 122, 179, 180, 239, 240, 299, 300]);

export function initActTrapSystem(blueprint: ActBlueprint, grid: string[], tileSize: number): TrapSystemState {
  const hazards: ActiveTrapHazard[] = [];
  if (EXCLUDED_TRAP_ACTS.has(blueprint.actId)) {
    return {
      hazards,
      acidTideLevel: 0,
      acidTideRising: true,
      globalCycleTimer: 0
    };
  }

  const rows = grid.length;
  const cols = grid[0]?.length || 38;
  const seed = blueprint.actId * 41 + 17;

  // Scan grid for 'T' trap tiles and also spawn dynamic bespoke trap hazards from blueprint.trapTypes
  let idx = 0;
  for (let r = 3; r < rows - 3; r++) {
    for (let c = 3; c < cols - 3; c++) {
      if (grid[r][c] === 'T') {
        const trapType = blueprint.trapTypes[idx % blueprint.trapTypes.length] || 'bear_trap';
        hazards.push({
          id: `trap_${blueprint.actId}_${idx}`,
          trapType,
          x: c * tileSize + tileSize / 2,
          y: r * tileSize + tileSize / 2,
          vx: 0,
          vy: 0,
          radius: 11,
          timer: (idx * 0.7) % 3.0,
          phase: idx,
          active: true,
          elevation: getTileElevation(blueprint, c, r)
        });
        idx++;
      }
    }
  }

  // Ensure every Act has signature trap nodes placed strictly on safe dry interior tiles away from West/East spawns
  for (let i = 0; i < Math.max(3, blueprint.trapTypes.length * 2); i++) {
    const trapType = blueprint.trapTypes[i % blueprint.trapTypes.length];
    const c = 8 + ((seed + i * 7) % Math.max(1, cols - 16));
    const r = 4 + ((seed + i * 5) % Math.max(1, rows - 8));
    const ch = grid[r]?.[c] || '#';
    if (ch !== '.' && ch !== ',' && ch !== 'P') continue;

    const isMoving =
      trapType === 'rolling_boulder' ||
      trapType === 'sawmill_buzzsaw' ||
      trapType === 'minecart_track' ||
      trapType === 'phantom_train' ||
      trapType === 'whirlpool_vortex';

    hazards.push({
      id: `bespoke_trap_${blueprint.actId}_${i}`,
      trapType,
      x: c * tileSize + tileSize / 2,
      y: r * tileSize + tileSize / 2,
      vx: isMoving ? (i % 2 === 0 ? 52 : -52) : 0,
      vy: trapType === 'rolling_boulder' ? 45 : 0,
      radius: trapType === 'black_hole_well' || trapType === 'whirlpool_vortex' ? 20 : 12,
      timer: i * 0.85,
      phase: i,
      active: true,
      elevation: getTileElevation(blueprint, c, r)
    });
  }

  return {
    hazards,
    acidTideLevel: 0,
    acidTideRising: true,
    globalCycleTimer: 0
  };
}

export interface TrapInteractionOutcome {
  damageToPlayer: number;
  knockbackVx: number;
  knockbackVy: number;
  bounceToHighGround: boolean;
  pullVx: number;
  pullVy: number;
  statusMessage: string | null;
  statusColor: string;
}

export function updateAndCheckTrapHazards(
  state: TrapSystemState,
  blueprint: ActBlueprint,
  grid: string[],
  playerX: number,
  playerY: number,
  playerElevation: 0 | 1 | 2,
  dt: number,
  tileSize: number
): TrapInteractionOutcome {
  state.globalCycleTimer += dt;

  const outcome: TrapInteractionOutcome = {
    damageToPlayer: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    bounceToHighGround: false,
    pullVx: 0,
    pullVy: 0,
    statusMessage: null,
    statusColor: '#fbbf24'
  };

  // Update Rising Acid / Magma / Abyssal Tide if present in blueprint
  const hasRisingTide = blueprint.trapTypes.some(
    t => t === 'rising_acid_tide' || t === 'lava_geyser' || t === 'depth_charge_mine'
  );
  if (hasRisingTide) {
    const cycle = (Math.sin(state.globalCycleTimer * 0.65) + 1) * 0.5;
    state.acidTideLevel = cycle;
    // Standing on High-Ground Cliff (Elevation 2) completely protects you from Rising Tide!
    if (state.acidTideLevel > 0.78 && playerElevation === 0) {
      outcome.damageToPlayer += 8 * dt;
      if (Math.floor(state.globalCycleTimer * 2) !== Math.floor((state.globalCycleTimer - dt) * 2)) {
        outcome.statusMessage = '☣️ RISING TIDE! CLIMB HIGH GROUND!';
        outcome.statusColor = '#84cc16';
      }
    }
  }

  const maxW = (grid[0]?.length || 28) * tileSize;
  const maxH = grid.length * tileSize;

  for (const h of state.hazards) {
    h.timer += dt;

    // Moving traps patrol or roll along terrain
    if (h.vx !== 0 || h.vy !== 0) {
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      const tc = Math.floor(h.x / tileSize);
      const tr = Math.floor(h.y / tileSize);
      const tile = grid[tr]?.[tc] || '#';
      if (tile === '#' || h.x < tileSize * 3 || h.x > maxW - tileSize * 3) {
        h.vx = -h.vx;
      }
      if (tile === '#' || h.y < tileSize * 3 || h.y > maxH - tileSize * 3) {
        h.vy = -h.vy;
      }
    }

    const dx = playerX - h.x;
    const dy = playerY - h.y;
    const dist = Math.hypot(dx, dy);

    // Gravity / Whirlpool suction pull
    if ((h.trapType === 'black_hole_well' || h.trapType === 'whirlpool_vortex') && dist < 72 && dist > 6) {
      const pullStrength = h.trapType === 'black_hole_well' ? 46 : 34;
      outcome.pullVx += (-dx / dist) * pullStrength;
      outcome.pullVy += (-dy / dist) * pullStrength;
    }

    // Direct contact check
    if (dist < h.radius + 7) {
      if (h.trapType === 'bounce_mushroom' || h.trapType === 'updraft_vent' || h.trapType === 'chrono_rewind_pad') {
        if (h.timer > 1.2) {
          h.timer = 0;
          outcome.bounceToHighGround = true;
          outcome.knockbackVy = -140;
          outcome.statusMessage =
            h.trapType === 'bounce_mushroom'
              ? '🍄 BOUNCE MUSHROOM! VAULTED TO HIGH GROUND!'
              : '🌬️ UPDRAFT LAUNCH! HIGH-GROUND ADVANTAGE!';
          outcome.statusColor = '#34d399';
        }
      } else {
        // Periodic hazard pulse so it doesn't instant-melt in 1 frame
        const pulseActive = Math.sin(h.timer * 3.2 + h.phase) > 0.25;
        if (pulseActive && h.timer > 0.9) {
          h.timer = 0;
          outcome.damageToPlayer += 9;
          if (dist > 0.1) {
            outcome.knockbackVx = (dx / dist) * 95;
            outcome.knockbackVy = (dy / dist) * 95;
          }
          outcome.statusMessage = `⚠️ ${h.trapType.replace(/_/g, ' ').toUpperCase()}!`;
          outcome.statusColor = '#f87171';
        }
      }
    }
  }

  return outcome;
}

export function renderBespokeTrapEffects(
  ctx: CanvasRenderingContext2D,
  state: TrapSystemState,
  time: number
): void {
  for (const h of state.hazards) {
    const x = Math.round(h.x);
    const y = Math.round(h.y);
    const pulse = Math.sin(time * 4 + h.phase) * 0.5 + 0.5;

    if (h.trapType === 'bounce_mushroom') {
      // Elastic Glowing Bounce-Mushroom
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(x - 3, y, 6, 6);
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(x, y, 7 + pulse * 1.5, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(x - 4, y - 5, 2, 2);
      ctx.fillRect(x + 2, y - 4, 2, 2);
    } else if (h.trapType === 'sawmill_buzzsaw' || h.trapType === 'clockwork_gear_blade') {
      // Spinning metallic sawblade
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time * 8);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-7, -7, 14, 14);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-9, -2, 18, 4);
      ctx.fillRect(-2, -9, 4, 18);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
    } else if (h.trapType === 'rolling_boulder') {
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a8a29e';
      ctx.fillRect(x - 4, y - 5, 4, 3);
    } else if (h.trapType === 'black_hole_well' || h.trapType === 'whirlpool_vortex') {
      ctx.strokeStyle = h.trapType === 'black_hole_well' ? 'rgba(168,85,247,0.65)' : 'rgba(56,189,248,0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 8 + pulse * 6, time * 3, time * 3 + Math.PI * 1.5);
      ctx.stroke();
    } else if (h.trapType === 'chain_lightning_pylon' || h.trapType === 'laser_prism' || h.trapType === 'electric_eel_coil') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 4, y - 6, 8, 12);
      ctx.fillStyle = pulse > 0.5 ? '#38bdf8' : '#facc15';
      ctx.fillRect(x - 2, y - 8, 4, 4);
      if (pulse > 0.65) {
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 6);
        ctx.lineTo(x + Math.cos(time * 11) * 12, y + Math.sin(time * 11) * 12);
        ctx.stroke();
      }
    } else {
      // Subtle floor hazard indicator
      ctx.fillStyle = pulse > 0.6 ? 'rgba(239,68,68,0.45)' : 'rgba(120,113,108,0.35)';
      ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
}
