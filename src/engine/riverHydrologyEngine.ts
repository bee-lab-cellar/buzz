import { ActBlueprint, RiverCurveBlueprint } from '../maps/arc1Acts1to41';

export function sampleCubicBezier(
  t: number,
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  const inv = 1 - t;
  return (
    inv * inv * inv * p0 +
    3 * inv * inv * t * p1 +
    3 * inv * t * t * p2 +
    t * t * t * p3
  );
}

export function carveBezierRiverIntoGrid(rows: string[][], blueprint: ActBlueprint) {
  const river = blueprint.riverConfig;
  if (!river || blueprint.topologyArchetype === 'colosseum_citadel') return;

  const gridH = rows.length;
  const gridW = rows[0]?.length ?? 38;
  const tileChar = river.liquid === 'lava' ? 'L' : 'W';
  const halfW = Math.max(1, Math.floor(river.widthTiles / 2));

  // Track where river was actually carved so bridges/fords only cross actual water
  const carvedRiverMask: boolean[][] = Array.from({ length: gridH }, () =>
    Array.from({ length: gridW }, () => false)
  );

  // Carve smooth Cubic Bezier curve across the map
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = Math.round(
      sampleCubicBezier(t, river.startX, river.ctrl1X, river.ctrl2X, river.endX)
    );
    const cy = Math.round(
      sampleCubicBezier(t, river.startY, river.ctrl1Y, river.ctrl2Y, river.endY)
    );

    for (let dy = -halfW; dy <= halfW; dy++) {
      for (let dx = -halfW; dx <= halfW; dx++) {
        // Taper corners slightly so the river flows organically instead of blocky squares
        if (Math.abs(dx) === halfW && Math.abs(dy) === halfW && halfW > 1) continue;
        const gx = cx + dx;
        const gy = cy + dy;
        if (gx >= 6 && gx <= gridW - 7 && gy >= 2 && gy <= gridH - 3) {
          if (rows[gy][gx] !== 'B') {
            rows[gy][gx] = tileChar;
            carvedRiverMask[gy][gx] = true;
          }
        }
      }
    }
  }

  // Place clean 2-row Stone/Timber Bridges at crossing points where water actually exists
  for (const b of river.bridgeCoords) {
    const baseY = Math.max(3, Math.min(gridH - 4, b.y));
    let hasWaterOnRow = false;
    for (let gx = 4; gx <= gridW - 5; gx++) {
      if (carvedRiverMask[baseY]?.[gx] && Math.abs(gx - b.x) <= halfW + 4) {
        hasWaterOnRow = true;
        break;
      }
    }
    if (!hasWaterOnRow) continue;

    for (let dy = 0; dy <= 1; dy++) {
      const gy = baseY + dy;
      if (gy < 2 || gy > gridH - 3) continue;
      for (let gx = 4; gx <= gridW - 5; gx++) {
        if (Math.abs(gx - b.x) <= halfW + 2 && (rows[gy][gx] === 'W' || rows[gy][gx] === 'L')) {
          rows[gy][gx] = 'B';
        }
      }
    }
  }

  // Shallow Pebble Fords (walkable mud/shoal crossings)
  for (const f of river.fordCoords) {
    const gy = Math.max(3, Math.min(gridH - 4, f.y));
    for (let dx = -halfW - 1; dx <= halfW + 1; dx++) {
      const gx = Math.max(4, Math.min(gridW - 5, f.x + dx));
      if (rows[gy][gx] === 'W') {
        rows[gy][gx] = 'M';
      }
    }
  }

  // Guarantee West-to-East central bridge crossing at rows 11..12 so players & AI never get stranded
  for (let gy = 11; gy <= 12; gy++) {
    for (let gx = 2; gx <= gridW - 3; gx++) {
      if (rows[gy][gx] === 'W' || rows[gy][gx] === 'L') {
        rows[gy][gx] = 'B';
      }
    }
  }
}

export function renderRiverHydrologyEffects(
  ctx: CanvasRenderingContext2D,
  river: RiverCurveBlueprint | null,
  grid: string[],
  globalTime: number
) {
  if (!river || !grid.length) return;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 38;

  ctx.save();
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = ((i / steps) + (globalTime * 0.12) % 1) % 1;
    const wx = sampleCubicBezier(t, river.startX, river.ctrl1X, river.ctrl2X, river.endX) * 16;
    const wy = sampleCubicBezier(t, river.startY, river.ctrl1Y, river.ctrl2Y, river.endY) * 16;
    const gx = Math.floor(wx / 16);
    const gy = Math.floor(wy / 16);
    if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
    const tile = grid[gy][gx];
    // Only draw flowing current highlights on actual water/lava tiles (never over bridges/grass!)
    if (tile !== 'W' && tile !== 'L') continue;

    ctx.fillStyle =
      tile === 'L' || river.liquid === 'lava'
        ? 'rgba(254, 240, 138, 0.5)'
        : river.liquid === 'acid'
        ? 'rgba(74, 222, 128, 0.45)'
        : river.liquid === 'void_stream'
        ? 'rgba(192, 132, 252, 0.5)'
        : 'rgba(186, 230, 253, 0.45)';
    ctx.fillRect(Math.round(wx - 3), Math.round(wy - 1), 6, 2);
  }
  ctx.restore();
}
