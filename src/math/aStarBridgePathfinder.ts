/**
 * Full A* Grid Pathfinding Engine with Binary Min-Heap Priority Queue
 * Enforces Infinity cost on River/Lava/Wall tiles and 1.0 cost on Dry Land & Bridges
 * so Allied Cat/Dog Soldiers, Companion Heroes, and Ground Enemies route smoothly across bridges.
 */

import type { GridCoord, Vec2 } from '../types/math';

interface HeapEntry {
  readonly index: number;
  readonly fScore: number;
}

class BinaryMinHeap {
  private readonly items: HeapEntry[] = [];

  public get size(): number {
    return this.items.length;
  }

  public push(entry: HeapEntry): void {
    this.items.push(entry);
    this.bubbleUp(this.items.length - 1);
  }

  public pop(): HeapEntry | undefined {
    const count = this.items.length;
    if (count === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop();
    if (count > 1 && last) {
      this.items[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(idx: number): void {
    let i = idx;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.items[i].fScore >= this.items[parent].fScore) break;
      const tmp = this.items[i];
      this.items[i] = this.items[parent];
      this.items[parent] = tmp;
      i = parent;
    }
  }

  private sinkDown(idx: number): void {
    let i = idx;
    const len = this.items.length;
    while (true) {
      const left = (i << 1) + 1;
      const right = left + 1;
      let smallest = i;
      if (left < len && this.items[left].fScore < this.items[smallest].fScore) {
        smallest = left;
      }
      if (right < len && this.items[right].fScore < this.items[smallest].fScore) {
        smallest = right;
      }
      if (smallest === i) break;
      const tmp = this.items[i];
      this.items[i] = this.items[smallest];
      this.items[smallest] = tmp;
      i = smallest;
    }
  }
}

export function getTileTraversalCost(tileChar: string): number {
  switch (tileChar) {
    case '#':
    case 'W':
    case 'L':
      return Number.POSITIVE_INFINITY; // Strictly impassable walls, rivers, and lava
    case 'P':
    case 'C':
      return 0.85; // Fast packed roads & royal plazas
    case 'B':
      return 1.0; // Railed bridges across rivers/lava
    case 'M':
      return 1.35; // Shallow mud ford (walkable but slightly slower)
    case 'I':
      return 1.05;
    case '.':
    case ',':
    default:
      return 1.0;
  }
}

const ORTHO_DIRS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export interface BridgePathResult {
  readonly found: boolean;
  readonly waypoints: ReadonlyArray<GridCoord>;
  readonly worldWaypoints: ReadonlyArray<Vec2>;
  readonly totalCost: number;
}

/**
 * Finds an optimal dry-land & bridge path between two pixel coordinates on a string[] tile grid.
 */
export function findAStarBridgePath(
  grid: ReadonlyArray<string>,
  startPx: Vec2,
  goalPx: Vec2,
  tileSize = 16,
  maxExpandedNodes = 600
): BridgePathResult {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;
  if (rows === 0 || cols === 0) {
    return { found: false, waypoints: [], worldWaypoints: [], totalCost: Number.POSITIVE_INFINITY };
  }

  const startCol = Math.max(0, Math.min(cols - 1, Math.floor(startPx.x / tileSize)));
  const startRow = Math.max(0, Math.min(rows - 1, Math.floor(startPx.y / tileSize)));
  const goalCol = Math.max(0, Math.min(cols - 1, Math.floor(goalPx.x / tileSize)));
  const goalRow = Math.max(0, Math.min(rows - 1, Math.floor(goalPx.y / tileSize)));

  if (!Number.isFinite(getTileTraversalCost(grid[goalRow][goalCol]))) {
    return { found: false, waypoints: [], worldWaypoints: [], totalCost: Number.POSITIVE_INFINITY };
  }

  if (startCol === goalCol && startRow === goalRow) {
    const pt = { x: goalCol * tileSize + tileSize * 0.5, y: goalRow * tileSize + tileSize * 0.5 };
    return {
      found: true,
      waypoints: [{ col: goalCol, row: goalRow }],
      worldWaypoints: [pt],
      totalCost: 0,
    };
  }

  const totalCells = rows * cols;
  const gScores = new Float64Array(totalCells);
  gScores.fill(Number.POSITIVE_INFINITY);
  const cameFrom = new Int32Array(totalCells);
  cameFrom.fill(-1);
  const closed = new Uint8Array(totalCells);

  const startIdx = startRow * cols + startCol;
  const goalIdx = goalRow * cols + goalCol;
  gScores[startIdx] = 0;

  const openHeap = new BinaryMinHeap();
  const hStart = Math.abs(goalCol - startCol) + Math.abs(goalRow - startRow);
  openHeap.push({ index: startIdx, fScore: hStart });

  let expanded = 0;
  let reachedGoal = false;

  while (openHeap.size > 0 && expanded < maxExpandedNodes) {
    const current = openHeap.pop();
    if (!current) break;
    const curIdx = current.index;
    if (closed[curIdx] === 1) continue;
    closed[curIdx] = 1;
    expanded++;

    if (curIdx === goalIdx) {
      reachedGoal = true;
      break;
    }

    const curRow = Math.floor(curIdx / cols);
    const curCol = curIdx - curRow * cols;
    const curG = gScores[curIdx];

    for (let d = 0; d < ORTHO_DIRS.length; d++) {
      const nc = curCol + ORTHO_DIRS[d][0];
      const nr = curRow + ORTHO_DIRS[d][1];
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
      const nIdx = nr * cols + nc;
      if (closed[nIdx] === 1) continue;

      const stepCost = getTileTraversalCost(grid[nr][nc]);
      if (!Number.isFinite(stepCost)) continue;

      const tentativeG = curG + stepCost;
      if (tentativeG < gScores[nIdx]) {
        gScores[nIdx] = tentativeG;
        cameFrom[nIdx] = curIdx;
        const h = Math.abs(goalCol - nc) + Math.abs(goalRow - nr);
        openHeap.push({ index: nIdx, fScore: tentativeG + h });
      }
    }
  }

  if (!reachedGoal) {
    return { found: false, waypoints: [], worldWaypoints: [], totalCost: Number.POSITIVE_INFINITY };
  }

  const waypoints: GridCoord[] = [];
  const worldWaypoints: Vec2[] = [];
  let trace = goalIdx;
  while (trace !== -1) {
    const r = Math.floor(trace / cols);
    const c = trace - r * cols;
    waypoints.push({ col: c, row: r });
    worldWaypoints.push({ x: c * tileSize + tileSize * 0.5, y: r * tileSize + tileSize * 0.5 });
    trace = cameFrom[trace];
  }
  waypoints.reverse();
  worldWaypoints.reverse();

  return {
    found: true,
    waypoints,
    worldWaypoints,
    totalCost: gScores[goalIdx],
  };
}

/**
 * Returns true if a numeric Atlas tile code (0..15) is walkable on foot or via bridge.
 */
export function isTileWalkableCode(code: number): boolean {
  // Impassable numeric codes: RiverWater (3), CliffWall (7), Lava (10), AcidBog (13)
  return code !== 3 && code !== 7 && code !== 10 && code !== 13;
}

function numericCodeToChar(code: number): string {
  switch (code) {
    case 1:
    case 9:
      return 'P';
    case 3:
      return 'W';
    case 4:
      return 'M';
    case 5:
    case 6:
      return 'B';
    case 7:
      return '#';
    case 10:
    case 13:
      return 'L';
    case 11:
    case 12:
      return 'I';
    default:
      return '.';
  }
}

/**
 * Runs A* bridge pathfinding directly on a numeric 14x24 Atlas `tileGrid`.
 */
export function findAStarNumericBridgePath(
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  start: GridCoord,
  goal: GridCoord,
): GridCoord[] {
  const stringGrid: string[] = tileGrid.map((row) =>
    row.map((code) => numericCodeToChar(code)).join(''),
  );
  const result = findAStarBridgePath(
    stringGrid,
    { x: start.col * 16 + 8, y: start.row * 16 + 8 },
    { x: goal.col * 16 + 8, y: goal.row * 16 + 8 },
    16,
    800,
  );
  return result.found ? [...result.waypoints] : [];
}

