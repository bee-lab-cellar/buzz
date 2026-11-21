import { getAtlasAct, type AtlasActEntry, type TrapInstance } from '../atlas/index';
import { getTileElevation } from './terrainTopographyEngine';
import {
  initActTrapSystem,
  renderBespokeTrapEffects,
  updateAndCheckTrapHazards,
  type ActiveTrapHazard,
  type TrapInteractionOutcome,
  type TrapSystemState,
} from './trapPhysicsEngine';
import type { ActBlueprint } from '../maps/arc1Acts1to41';

export type { ActiveTrapHazard, TrapInteractionOutcome, TrapSystemState };

export function convertAtlasTrapToHazard(
  trap: TrapInstance,
  blueprint: ActBlueprint,
  index: number,
  worldW: number,
  worldH: number,
  tileSize: number
): ActiveTrapHazard {
  // Atlas coordinates live on a 512x224 reference canvas (24x14 tiles * 16px = 384x224, scaled cleanly)
  const normX = Math.max(0.08, Math.min(0.92, trap.x / 512));
  const normY = Math.max(0.12, Math.min(0.88, trap.y / 224));
  const x = Math.round(normX * worldW);
  const y = Math.round(normY * worldH);
  const gx = Math.floor(x / tileSize);
  const gy = Math.floor(y / tileSize);

  const isPatrol =
    trap.type === 'rolling_boulder' ||
    trap.type === 'sawmill_buzzsaw' ||
    trap.type === 'explosive_minecart' ||
    trap.type === 'battering_ram_payload';

  let vx = 0;
  let vy = 0;
  if (isPatrol) {
    if (trap.direction === 'E') vx = 48;
    else if (trap.direction === 'W') vx = -48;
    else if (trap.direction === 'S') vy = 44;
    else if (trap.direction === 'N') vy = -44;
    else vx = index % 2 === 0 ? 46 : -46;
  }

  return {
    id: trap.id,
    trapType: trap.type === 'updraft_geyser' ? 'updraft_vent' : trap.type,
    x,
    y,
    vx,
    vy,
    radius: trap.type === 'black_hole_well' || trap.type === 'quicksand_whirlpool' ? 22 : 12,
    timer: (index * 0.6) % Math.max(1.0, trap.triggerInterval),
    phase: index,
    active: trap.damage > 0 || trap.type === 'bounce_mushroom' || trap.type === 'updraft_geyser',
    elevation: getTileElevation(blueprint, gx, gy),
  };
}

export function compileAtlasTrapsToSystem(
  actId: number,
  blueprint: ActBlueprint,
  grid: string[],
  tileSize: number
): TrapSystemState {
  const baseState = initActTrapSystem(blueprint, grid, tileSize);
  const atlasEntry: AtlasActEntry = getAtlasAct(actId);
  const worldW = (grid[0]?.length || 28) * tileSize;
  const worldH = grid.length * tileSize;

  const atlasHazards = atlasEntry.traps
    .filter((t) => t.damage > 0 || t.type === 'bounce_mushroom' || t.type === 'updraft_geyser')
    .map((t, idx) => convertAtlasTrapToHazard(t, blueprint, idx, worldW, worldH, tileSize));

  // Merge non-overlapping atlas hazards with baseline blueprint traps
  const merged = [...baseState.hazards];
  for (const ah of atlasHazards) {
    const col = Math.floor(ah.x / tileSize);
    const row = Math.floor(ah.y / tileSize);
    const tileChar = grid[row]?.[col] ?? '#';
    if (tileChar === '#' || tileChar === 'W') continue;
    const tooClose = merged.some((m) => Math.hypot(m.x - ah.x, m.y - ah.y) < 18);
    if (!tooClose) {
      merged.push(ah);
    }
  }

  return {
    ...baseState,
    hazards: merged,
  };
}

export function stepUnifiedTrapPhysics(
  state: TrapSystemState,
  blueprint: ActBlueprint,
  grid: string[],
  playerX: number,
  playerY: number,
  playerElevation: 0 | 1 | 2,
  dt: number,
  tileSize: number
): TrapInteractionOutcome {
  return updateAndCheckTrapHazards(
    state,
    blueprint,
    grid,
    playerX,
    playerY,
    playerElevation,
    dt,
    tileSize
  );
}

export function renderUnifiedTrapLayer(
  ctx: CanvasRenderingContext2D,
  state: TrapSystemState,
  timeSec: number
): void {
  renderBespokeTrapEffects(ctx, state, timeSec);
}
