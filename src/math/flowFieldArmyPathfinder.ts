/**
 * Pillar 1 — Dijkstra Integration Field + Vector Flow-Field Pathfinding Engine
 * with Boids Separation & Cohesion Steering.
 *
 * Guarantees:
 * - RiverWater (3), CliffWall (7), Lava (10), AcidBog (13) have STRICT `Infinity` cost.
 * - Dry Land & Bridges (0,1,2,5,6,8,9,11,12,14,15) have finite traversal costs (`1.0` / `0.9` on roads/bridges).
 * - Tracing or steering along the generated flow-field NEVER steps onto any water/river/lava tile!
 * - 20+ Allied Cat Knights, Dog Warriors, and 10-Enemy Ambush Squads smoothly cross bridges in formation
 *   without stacking into blobs thanks to Boids separation + cohesion steering.
 */

import type { FlowFieldCell, GridCoord, Vec2 } from '../types/math';

export interface FlowFieldGrid {
  readonly rows: number;
  readonly cols: number;
  readonly goal: GridCoord;
  readonly cells: ReadonlyArray<FlowFieldCell>;
}

export interface BoidAgent {
  readonly id: string;
  position: Vec2;
  velocity: Vec2;
  readonly radius: number;
  readonly maxSpeed: number;
}

export const WATER_OR_HAZARD_TILE_CODES: ReadonlySet<number> = new Set([3, 7, 10, 13]);

export function getFlowTileCost(tileCode: number): number {
  switch (tileCode) {
    case 3: // RiverWater
    case 7: // CliffWall
    case 10: // Lava
    case 13: // AcidBog
      return Number.POSITIVE_INFINITY;
    case 1: // DirtRoad
    case 9: // CobblePatio
      return 0.9;
    case 5: // WoodBridge
    case 6: // StoneBridge
      return 1.0;
    case 4: // ShallowFord (discouraged vs bridges, walkable if needed)
      return 2.4;
    default:
      return 1.0;
  }
}

export function isWaterOrImpassableTile(tileCode: number): boolean {
  return !Number.isFinite(getFlowTileCost(tileCode));
}

interface DijkstraNode {
  readonly idx: number;
  readonly dist: number;
}

class MinPriorityQueue {
  private readonly heap: DijkstraNode[] = [];

  public get length(): number {
    return this.heap.length;
  }

  public push(node: DijkstraNode): void {
    this.heap.push(node);
    let i = this.heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[i].dist >= this.heap[p].dist) break;
      const tmp = this.heap[i];
      this.heap[i] = this.heap[p];
      this.heap[p] = tmp;
      i = p;
    }
  }

  public pop(): DijkstraNode | undefined {
    const n = this.heap.length;
    if (n === 0) return undefined;
    const top = this.heap[0];
    const tail = this.heap.pop();
    if (n > 1 && tail) {
      this.heap[0] = tail;
      let i = 0;
      const len = this.heap.length;
      while (true) {
        const l = (i << 1) + 1;
        const r = l + 1;
        let smallest = i;
        if (l < len && this.heap[l].dist < this.heap[smallest].dist) smallest = l;
        if (r < len && this.heap[r].dist < this.heap[smallest].dist) smallest = r;
        if (smallest === i) break;
        const tmp = this.heap[i];
        this.heap[i] = this.heap[smallest];
        this.heap[smallest] = tmp;
        i = smallest;
      }
    }
    return top;
  }
}

const ORTHO_NEIGHBORS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const EIGHT_NEIGHBORS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

/**
 * Builds the Dijkstra Integration Field and Flow-Vector Field over a `rows x cols` numeric tile grid.
 */
export function buildFlowField(
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  goal: GridCoord,
): FlowFieldGrid {
  const rows = tileGrid.length;
  const cols = rows > 0 ? tileGrid[0].length : 0;
  const total = rows * cols;
  const cells: FlowFieldCell[] = new Array<FlowFieldCell>(total);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells[r * cols + c] = {
        col: c,
        row: r,
        cost: getFlowTileCost(tileGrid[r][c]),
        integration: Number.POSITIVE_INFINITY,
        flowX: 0,
        flowY: 0,
      };
    }
  }

  const clampedGoal: GridCoord = {
    col: Math.max(0, Math.min(cols - 1, Math.floor(goal.col))),
    row: Math.max(0, Math.min(rows - 1, Math.floor(goal.row))),
  };

  if (rows === 0 || cols === 0) {
    return { rows, cols, goal: clampedGoal, cells };
  }

  const goalIdx = clampedGoal.row * cols + clampedGoal.col;
  if (Number.isFinite(cells[goalIdx].cost)) {
    cells[goalIdx].integration = 0;
    const pq = new MinPriorityQueue();
    pq.push({ idx: goalIdx, dist: 0 });

    while (pq.length > 0) {
      const current = pq.pop();
      if (!current) break;
      const curCell = cells[current.idx];
      if (current.dist > curCell.integration) continue;

      for (let d = 0; d < ORTHO_NEIGHBORS.length; d++) {
        const nc = curCell.col + ORTHO_NEIGHBORS[d][0];
        const nr = curCell.row + ORTHO_NEIGHBORS[d][1];
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
        const nIdx = nr * cols + nc;
        const nCell = cells[nIdx];
        if (!Number.isFinite(nCell.cost)) continue;

        const nextDist = curCell.integration + nCell.cost;
        if (nextDist < nCell.integration) {
          nCell.integration = nextDist;
          pq.push({ idx: nIdx, dist: nextDist });
        }
      }
    }
  }

  // Compute flow vectors strictly toward finite-cost neighbors with no corner-cutting over water
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r * cols + c];
      if (!Number.isFinite(cell.cost) || !Number.isFinite(cell.integration)) continue;
      if (c === clampedGoal.col && r === clampedGoal.row) continue;

      let bestDist = cell.integration;
      let bestDx = 0;
      let bestDy = 0;

      for (let d = 0; d < EIGHT_NEIGHBORS.length; d++) {
        const dx = EIGHT_NEIGHBORS[d][0];
        const dy = EIGHT_NEIGHBORS[d][1];
        const nc = c + dx;
        const nr = r + dy;
        if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
        const nCell = cells[nr * cols + nc];
        if (!Number.isFinite(nCell.cost) || !Number.isFinite(nCell.integration)) continue;

        // Prevent diagonal corner-cutting across water or cliff tiles
        if (dx !== 0 && dy !== 0) {
          const adj1 = cells[r * cols + nc];
          const adj2 = cells[nr * cols + c];
          if (!Number.isFinite(adj1.cost) || !Number.isFinite(adj2.cost)) continue;
        }

        if (nCell.integration < bestDist) {
          bestDist = nCell.integration;
          bestDx = dx;
          bestDy = dy;
        }
      }

      const len = Math.hypot(bestDx, bestDy);
      if (len > 0) {
        cell.flowX = bestDx / len;
        cell.flowY = bestDy / len;
      }
    }
  }

  return { rows, cols, goal: clampedGoal, cells };
}

export function sampleFlowVector(field: FlowFieldGrid, col: number, row: number): Vec2 {
  if (row < 0 || row >= field.rows || col < 0 || col >= field.cols) {
    return { x: 0, y: 0 };
  }
  const cell = field.cells[row * field.cols + col];
  return { x: cell.flowX, y: cell.flowY };
}

/**
 * Traces discrete grid steps by following the Flow Field from `start` to `field.goal`.
 * Guaranteed to NEVER step onto a river/water/lava/cliff tile.
 */
export function traceFlowFieldPath(
  field: FlowFieldGrid,
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  start: GridCoord,
  maxSteps = 400,
): GridCoord[] {
  const path: GridCoord[] = [];
  if (field.rows === 0 || field.cols === 0) return path;

  let curCol = Math.max(0, Math.min(field.cols - 1, Math.floor(start.col)));
  let curRow = Math.max(0, Math.min(field.rows - 1, Math.floor(start.row)));
  const startCell = field.cells[curRow * field.cols + curCol];
  if (!Number.isFinite(startCell.cost) || !Number.isFinite(startCell.integration)) {
    return path;
  }

  const visited = new Set<number>();
  path.push({ col: curCol, row: curRow });
  visited.add(curRow * field.cols + curCol);

  for (let step = 0; step < maxSteps; step++) {
    if (curCol === field.goal.col && curRow === field.goal.row) break;

    let bestCol = curCol;
    let bestRow = curRow;
    let bestInteg = field.cells[curRow * field.cols + curCol].integration;

    for (let d = 0; d < ORTHO_NEIGHBORS.length; d++) {
      const nc = curCol + ORTHO_NEIGHBORS[d][0];
      const nr = curRow + ORTHO_NEIGHBORS[d][1];
      if (nc < 0 || nc >= field.cols || nr < 0 || nr >= field.rows) continue;
      if (isWaterOrImpassableTile(tileGrid[nr][nc])) continue;
      const nCell = field.cells[nr * field.cols + nc];
      if (nCell.integration < bestInteg) {
        bestInteg = nCell.integration;
        bestCol = nc;
        bestRow = nr;
      }
    }

    const nextIdx = bestRow * field.cols + bestCol;
    if ((bestCol === curCol && bestRow === curRow) || visited.has(nextIdx)) {
      break;
    }
    visited.add(nextIdx);
    curCol = bestCol;
    curRow = bestRow;
    path.push({ col: curCol, row: curRow });
  }

  return path;
}

/**
 * Computes combined Flow-Field + Boids Separation/Cohesion steering for an army squad.
 * Clamps candidate moves against impassable water/cliff tiles so units stay strictly dry.
 */
export function stepArmyBoidsOnFlowField(
  agents: BoidAgent[],
  field: FlowFieldGrid,
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  tileSizePx: number,
  dt: number,
  separationRadius = 26,
  cohesionRadius = 58,
): void {
  const sepRadiusSq = separationRadius * separationRadius;
  const cohRadiusSq = cohesionRadius * cohesionRadius;

  for (let i = 0; i < agents.length; i++) {
    const a = agents[i];
    const col = Math.max(0, Math.min(field.cols - 1, Math.floor(a.position.x / tileSizePx)));
    const row = Math.max(0, Math.min(field.rows - 1, Math.floor(a.position.y / tileSizePx)));
    const flow = sampleFlowVector(field, col, row);

    let sepX = 0;
    let sepY = 0;
    let cohX = 0;
    let cohY = 0;
    let cohCount = 0;

    for (let j = 0; j < agents.length; j++) {
      if (i === j) continue;
      const b = agents[j];
      const dx = a.position.x - b.position.x;
      const dy = a.position.y - b.position.y;
      const dSq = dx * dx + dy * dy;
      if (dSq > 1e-6 && dSq < sepRadiusSq) {
        const invDist = 1 / Math.sqrt(dSq);
        const weight = (separationRadius - Math.sqrt(dSq)) / separationRadius;
        sepX += dx * invDist * weight;
        sepY += dy * invDist * weight;
      }
      if (dSq < cohRadiusSq) {
        cohX += b.position.x;
        cohY += b.position.y;
        cohCount += 1;
      }
    }

    let steerX = flow.x * 1.45 + sepX * 1.9;
    let steerY = flow.y * 1.45 + sepY * 1.9;

    if (cohCount > 0) {
      const cx = cohX / cohCount - a.position.x;
      const cy = cohY / cohCount - a.position.y;
      const cLen = Math.hypot(cx, cy);
      if (cLen > 12) {
        steerX += (cx / cLen) * 0.22;
        steerY += (cy / cLen) * 0.22;
      }
    }

    const sLen = Math.hypot(steerX, steerY);
    if (sLen > 1e-6) {
      a.velocity.x = (steerX / sLen) * a.maxSpeed;
      a.velocity.y = (steerY / sLen) * a.maxSpeed;
    } else {
      a.velocity.x = 0;
      a.velocity.y = 0;
    }

    const nextX = a.position.x + a.velocity.x * dt;
    const nextY = a.position.y + a.velocity.y * dt;
    const nextCol = Math.max(0, Math.min(field.cols - 1, Math.floor(nextX / tileSizePx)));
    const nextRow = Math.max(0, Math.min(field.rows - 1, Math.floor(nextY / tileSizePx)));

    // Strict dry-land/bridge guard: reject stepping into water/lava/cliffs
    if (!isWaterOrImpassableTile(tileGrid[nextRow][nextCol])) {
      a.position.x = nextX;
      a.position.y = nextY;
    } else {
      // Axis-separated fallback slide along dry tile edge (updating curCol before Y check!)
      let curCol = col;
      const slideXCol = Math.max(0, Math.min(field.cols - 1, Math.floor(nextX / tileSizePx)));
      if (!isWaterOrImpassableTile(tileGrid[row][slideXCol])) {
        a.position.x = nextX;
        curCol = slideXCol;
      }
      const slideYRow = Math.max(0, Math.min(field.rows - 1, Math.floor(nextY / tileSizePx)));
      if (!isWaterOrImpassableTile(tileGrid[slideYRow][curCol])) {
        a.position.y = nextY;
      }
    }
  }
}
