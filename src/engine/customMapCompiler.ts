/**
 * File 59 / 100 — Custom Dungeon & Boss Arena Compiler (`CustomDungeonMapV1`).
 *
 * Enforces clean 16-bit architectural rules:
 * - Grid strictly 24x14 tiles (`0=ground, 1=perimeter wall, 2=water/lava, 3=bridge, 4=blacksmith patio`).
 * - Outer perimeter walls automatically sealed (with West/East portal arches).
 * - Spawn & Boss coordinates guaranteed on walkable dry land.
 * - Max 4 hazard traps per custom arena (zero trap spam).
 * - Deterministic JSON serialization & safe import parser.
 * Zero `any` types.
 */

import type { ArcId, CustomDungeonMapV1, TileKindCode } from '../types/world';
import type { GridCoord } from '../types/math';

export const CUSTOM_MAP_COLS = 24;
export const CUSTOM_MAP_ROWS = 14;
export const MAX_CUSTOM_ARENA_TRAPS = 4;

export interface CustomMapValidationReport {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly walkableTileCount: number;
  readonly bridgeTileCount: number;
  readonly hazardTileCount: number;
}

export function createBlankCustomDungeonMap(
  name = 'Starlight Trial Arena',
  arcId: ArcId = 1,
): CustomDungeonMapV1 {
  const tiles: TileKindCode[][] = [];
  for (let r = 0; r < CUSTOM_MAP_ROWS; r++) {
    const row: TileKindCode[] = [];
    for (let c = 0; c < CUSTOM_MAP_COLS; c++) {
      const isBorder =
        r === 0 || r === CUSTOM_MAP_ROWS - 1 || c === 0 || c === CUSTOM_MAP_COLS - 1;
      const isPortalGap = (c === 0 || c === CUSTOM_MAP_COLS - 1) && (r === 6 || r === 7);
      row.push(isBorder && !isPortalGap ? 1 : 0);
    }
    tiles.push(row);
  }

  // Place a clean central vertical river at col 12 with a wide 2-row bridge at rows 6..7
  for (let r = 1; r < CUSTOM_MAP_ROWS - 1; r++) {
    tiles[r][12] = r === 6 || r === 7 ? 3 : 2;
  }

  return {
    version: 1,
    name,
    arcId,
    cols: CUSTOM_MAP_COLS,
    rows: CUSTOM_MAP_ROWS,
    tiles,
    spawnTile: { col: 3, row: 7 },
    bossTile: { col: 19, row: 7 },
    trapCount: 2,
  };
}

function isWalkableTileCode(code: TileKindCode): boolean {
  return code === 0 || code === 3 || code === 4;
}

function canReachTargetBFS(
  tiles: ReadonlyArray<ReadonlyArray<TileKindCode>>,
  start: GridCoord,
  goal: GridCoord,
): boolean {
  const rows = tiles.length;
  const cols = rows > 0 ? tiles[0].length : 0;
  if (
    start.row < 0 ||
    start.row >= rows ||
    start.col < 0 ||
    start.col >= cols ||
    goal.row < 0 ||
    goal.row >= rows ||
    goal.col < 0 ||
    goal.col >= cols
  ) {
    return false;
  }
  if (!isWalkableTileCode(tiles[start.row][start.col]) || !isWalkableTileCode(tiles[goal.row][goal.col])) {
    return false;
  }

  const visited = new Uint8Array(rows * cols);
  const queueCol: number[] = [start.col];
  const queueRow: number[] = [start.row];
  visited[start.row * cols + start.col] = 1;

  const dc = [1, -1, 0, 0];
  const dr = [0, 0, 1, -1];
  let head = 0;

  while (head < queueCol.length) {
    const c = queueCol[head];
    const r = queueRow[head];
    head += 1;
    if (c === goal.col && r === goal.row) return true;

    for (let k = 0; k < 4; k++) {
      const nc = c + dc[k];
      const nr = r + dr[k];
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
      const idx = nr * cols + nc;
      if (visited[idx] === 1) continue;
      if (!isWalkableTileCode(tiles[nr][nc])) continue;
      visited[idx] = 1;
      queueCol.push(nc);
      queueRow.push(nr);
    }
  }

  return false;
}

export function validateCustomDungeonMap(map: CustomDungeonMapV1): CustomMapValidationReport {
  const errors: string[] = [];
  if (map.version !== 1) errors.push('Unsupported map version');
  if (map.name.trim().length < 2) errors.push('Arena name must be at least 2 characters');
  if (map.cols !== CUSTOM_MAP_COLS || map.rows !== CUSTOM_MAP_ROWS) {
    errors.push(`Map grid must be ${CUSTOM_MAP_COLS}x${CUSTOM_MAP_ROWS}`);
  }
  if (map.tiles.length !== CUSTOM_MAP_ROWS) {
    errors.push(`Expected ${CUSTOM_MAP_ROWS} tile rows`);
  }
  if (map.trapCount < 0 || map.trapCount > MAX_CUSTOM_ARENA_TRAPS) {
    errors.push(`Trap count must be between 0 and ${MAX_CUSTOM_ARENA_TRAPS}`);
  }

  let walkableTileCount = 0;
  let bridgeTileCount = 0;
  let hazardTileCount = 0;

  for (let r = 0; r < map.tiles.length; r++) {
    const row = map.tiles[r];
    if (row.length !== CUSTOM_MAP_COLS) {
      errors.push(`Row ${r} has invalid column length ${row.length}`);
      continue;
    }
    for (let c = 0; c < row.length; c++) {
      const code = row[c];
      if (isWalkableTileCode(code)) walkableTileCount += 1;
      if (code === 3) bridgeTileCount += 1;
      if (code === 2) hazardTileCount += 1;
    }
  }

  const spawnCode = map.tiles[map.spawnTile.row]?.[map.spawnTile.col];
  if (spawnCode === undefined || !isWalkableTileCode(spawnCode)) {
    errors.push('Player spawn tile must be on dry ground or a bridge');
  }

  const bossCode = map.tiles[map.bossTile.row]?.[map.bossTile.col];
  if (bossCode === undefined || !isWalkableTileCode(bossCode)) {
    errors.push('Boss arena tile must be on dry ground or a bridge');
  }

  if (errors.length === 0 && !canReachTargetBFS(map.tiles, map.spawnTile, map.bossTile)) {
    errors.push('Player spawn cannot reach Boss tile — add a dry bridge across hazards!');
  }

  return {
    valid: errors.length === 0,
    errors,
    walkableTileCount,
    bridgeTileCount,
    hazardTileCount,
  };
}

/**
 * Normalizes a custom map by sealing outer perimeter walls (except portal arches),
 * clamping trapCount to 0..4, and clearing a dry-land buffer around spawn & boss tiles.
 */
export function compileAndSanitizeCustomMap(map: CustomDungeonMapV1): CustomDungeonMapV1 {
  const nextTiles: TileKindCode[][] = map.tiles.map((row, r) =>
    row.map((cell, c) => {
      const isBorder = r === 0 || r === CUSTOM_MAP_ROWS - 1 || c === 0 || c === CUSTOM_MAP_COLS - 1;
      const isPortalGap = (c === 0 || c === CUSTOM_MAP_COLS - 1) && (r === 6 || r === 7);
      if (isBorder) return isPortalGap ? 0 : 1;
      return cell;
    }),
  );

  // Guarantee dry spawn and boss tiles
  if (nextTiles[map.spawnTile.row]?.[map.spawnTile.col] !== undefined) {
    nextTiles[map.spawnTile.row][map.spawnTile.col] = 0;
  }
  if (nextTiles[map.bossTile.row]?.[map.bossTile.col] !== undefined) {
    nextTiles[map.bossTile.row][map.bossTile.col] = 0;
  }

  return {
    ...map,
    name: map.name.trim() || 'Untitled Arena',
    tiles: nextTiles,
    trapCount: Math.max(0, Math.min(MAX_CUSTOM_ARENA_TRAPS, Math.floor(map.trapCount))),
  };
}

export function serializeCustomDungeonMap(map: CustomDungeonMapV1): string {
  return JSON.stringify(compileAndSanitizeCustomMap(map));
}

export function parseCustomDungeonMapJson(rawJson: string): CustomDungeonMapV1 | null {
  try {
    const parsed: unknown = JSON.parse(rawJson);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    if (obj.version !== 1 || typeof obj.name !== 'string' || !Array.isArray(obj.tiles)) {
      return null;
    }
    const arcNum = typeof obj.arcId === 'number' ? Math.max(1, Math.min(10, Math.floor(obj.arcId))) : 1;
    const spawnObj = obj.spawnTile as Record<string, unknown> | undefined;
    const bossObj = obj.bossTile as Record<string, unknown> | undefined;
    const map: CustomDungeonMapV1 = {
      version: 1,
      name: obj.name,
      arcId: arcNum as ArcId,
      cols: CUSTOM_MAP_COLS,
      rows: CUSTOM_MAP_ROWS,
      tiles: (obj.tiles as unknown[]).map((row) =>
        Array.isArray(row)
          ? row.map((v) => (v === 1 || v === 2 || v === 3 || v === 4 ? v : 0))
          : new Array<TileKindCode>(CUSTOM_MAP_COLS).fill(0),
      ),
      spawnTile: {
        col: typeof spawnObj?.col === 'number' ? Math.max(1, Math.min(22, Math.floor(spawnObj.col))) : 3,
        row: typeof spawnObj?.row === 'number' ? Math.max(1, Math.min(12, Math.floor(spawnObj.row))) : 7,
      },
      bossTile: {
        col: typeof bossObj?.col === 'number' ? Math.max(1, Math.min(22, Math.floor(bossObj.col))) : 19,
        row: typeof bossObj?.row === 'number' ? Math.max(1, Math.min(12, Math.floor(bossObj.row))) : 7,
      },
      trapCount: typeof obj.trapCount === 'number' ? obj.trapCount : 2,
    };
    const sanitized = compileAndSanitizeCustomMap(map);
    return validateCustomDungeonMap(sanitized).valid ? sanitized : null;
  } catch {
    return null;
  }
}
