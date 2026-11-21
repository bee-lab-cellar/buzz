import { ActBlueprint, ARC1_ACTS_1_TO_41 } from '../maps/arc1Acts1to41';
import { ARC2_ACTS_42_TO_82 } from '../maps/arc2Acts42to82';
import { ARC3_ACTS_83_TO_122 } from '../maps/arc3Acts83to122';
import { ARC4_ACTS_123_TO_180 } from '../maps/arc4Acts123to180';
import { ARC5_ACTS_181_TO_240 } from '../maps/arc5Acts181to240';
import { ARC6_ACTS_241_TO_300 } from '../maps/arc6Acts241to300';
import { ALL_300_ATLAS_ACTS, getAtlasAct, type AtlasActEntry, type AtlasTileCode } from '../atlas/index';
import { TERRAIN_TILESET_16X16, getLandmarkSpriteMatrix } from '../sprites/index';
import { carveBezierRiverIntoGrid } from './riverHydrologyEngine';

export { ALL_300_ATLAS_ACTS, getAtlasAct };
export type { AtlasActEntry };

export const ALL_300_ACT_BLUEPRINTS: Record<number, ActBlueprint> = {};

const ALL_ARCS: ActBlueprint[][] = [
  ARC1_ACTS_1_TO_41,
  ARC2_ACTS_42_TO_82,
  ARC3_ACTS_83_TO_122,
  ARC4_ACTS_123_TO_180,
  ARC5_ACTS_181_TO_240,
  ARC6_ACTS_241_TO_300
];

for (const arcList of ALL_ARCS) {
  for (const bp of arcList) {
    ALL_300_ACT_BLUEPRINTS[bp.actId] = bp;
  }
}

export function getActBlueprint(actId: number): ActBlueprint {
  const clamped = Math.max(1, Math.min(300, Math.floor(actId || 1)));
  return ALL_300_ACT_BLUEPRINTS[clamped] || ARC1_ACTS_1_TO_41[0];
}

export function getCompiledAtlasBundle(actId: number): {
  blueprint: ActBlueprint;
  atlas: AtlasActEntry;
  landmarkMatrix: ReturnType<typeof getLandmarkSpriteMatrix>;
  tileset: typeof TERRAIN_TILESET_16X16;
} {
  const blueprint = getActBlueprint(actId);
  const atlas = getAtlasAct(actId);
  return {
    blueprint,
    atlas,
    landmarkMatrix: getLandmarkSpriteMatrix(atlas.landmark.id),
    tileset: TERRAIN_TILESET_16X16,
  };
}

export function sanitizeWorldGrid(rows: string[][]): void {
  const h = rows.length;
  const w = rows[0]?.length || 38;
  const midY = Math.floor(h / 2);

  // Pass 1: Remove isolated 1x1 speckle walls or water dots in the interior
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        const ch = rows[y][x];
        if (ch === '#' || ch === 'W' || ch === ',') {
          let sameOrth = 0;
          if (rows[y - 1][x] === ch) sameOrth++;
          if (rows[y + 1][x] === ch) sameOrth++;
          if (rows[y][x - 1] === ch) sameOrth++;
          if (rows[y][x + 1] === ch) sameOrth++;
          if (sameOrth === 0) {
            rows[y][x] = '.';
          }
        }
      }
    }
  }

  // Pass 2: Prune orphan 'B' bridge components that do NOT touch any 'W' or 'L' anywhere on their span
  const visitedB: boolean[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => false));
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (rows[y][x] !== 'B' || visitedB[y][x]) continue;
      const comp: Array<[number, number]> = [];
      const queue: Array<[number, number]> = [[x, y]];
      visitedB[y][x] = true;
      let touchesLiquid = false;

      while (queue.length > 0) {
        const [cx, cy] = queue.shift()!;
        comp.push([cx, cy]);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 1 || nx >= w - 1 || ny < 1 || ny >= h - 1) continue;
          const n = rows[ny][nx];
          if (n === 'W' || n === 'L') {
            touchesLiquid = true;
          } else if (n === 'B' && !visitedB[ny][nx]) {
            visitedB[ny][nx] = true;
            queue.push([nx, ny]);
          }
        }
      }

      if (!touchesLiquid) {
        for (const [bx, by] of comp) {
          rows[by][bx] = 'P';
        }
      }
    }
  }

  // Pass 3: Guarantee unbroken West-to-East walkable central causeway (rows 11..12)
  for (let gy = midY - 1; gy <= midY; gy++) {
    if (gy <= 0 || gy >= h - 1) continue;
    for (let x = 1; x <= w - 2; x++) {
      const cur = rows[gy][x];
      if (cur === 'W' || cur === 'L') {
        rows[gy][x] = 'B';
      } else if (cur === '#') {
        rows[gy][x] = 'P';
      }
    }
  }
}

/**
 * Compiles an Act's bespoke room archetype, high-ground accents, tall whispering
 * grass patches, and Cubic Bezier river hydrology into the 2D level grid while
 * respecting existing architectural layouts (twin rivers, islands, mazes) and
 * guaranteeing zero orphan bridges or 1x1 confetti speckles.
 */
export function compileActBespokeTopology(rows: string[][], blueprint: ActBlueprint): void {
  const h = rows.length;
  const w = rows[0]?.length || 38;
  const midX = Math.floor(w / 2);
  const midY = Math.floor(h / 2);
  const layoutMod = blueprint.actId % 6;
  const atlas = getAtlasAct(blueprint.actId);

  const setTile = (x: number, y: number, ch: string) => {
    if (y <= 1 || y >= h - 2 || x <= 1 || x >= w - 2) return;
    if (x <= 5 && Math.abs(y - midY) <= 3) return;
    if (x >= w - 6 && Math.abs(y - midY) <= 3) return;
    const cur = rows[y][x];
    if (cur === 'S' || cur === 'E' || cur === 'K' || cur === 'D' || cur === '$' || cur === 'M' || cur === 'C') return;
    rows[y][x] = ch;
  };

  // Skip structural overrides on layouts that already define rivers, moats, or trenches (2, 4, 5)
  const hasArchitecturalWaterLayout = layoutMod === 2 || layoutMod === 4 || layoutMod === 5;
  const isTightDungeonLayout = layoutMod === 1 || layoutMod === 3;

  // 1. Apply clean structural archetype accents only on compatible open arenas (layoutMod === 0)
  if (!hasArchitecturalWaterLayout && !isTightDungeonLayout) {
    switch (blueprint.topologyArchetype) {
      case 'twin_forked_delta':
      case 'broken_sky_bridge':
        if (!blueprint.riverConfig) {
          for (let y = 2; y < h - 2; y++) {
            const isBridge =
              Math.abs(y - 5) <= 1 || Math.abs(y - (h - 6)) <= 1 || Math.abs(y - midY) <= 1;
            setTile(midX - 1, y, isBridge ? 'B' : 'W');
            setTile(midX, y, isBridge ? 'B' : 'W');
          }
        }
        break;
      case 'spiral_watchtower':
      case 'four_chamber_catacomb':
        for (let x = 9; x < w - 9; x++) {
          if (Math.abs(x - midX) > 2) {
            setTile(x, 5, '#');
            setTile(x, h - 6, '#');
          }
        }
        break;
      case 'venice_canal_fortress':
        if (!blueprint.riverConfig) {
          for (let y = 2; y < h - 2; y++) {
            const isBridge = Math.abs(y - 6) <= 1 || Math.abs(y - midY) <= 1 || Math.abs(y - (h - 7)) <= 1;
            for (const cx of [12, 13, 24, 25]) {
              setTile(cx, y, isBridge ? 'B' : 'W');
            }
          }
        }
        break;
      case 'colosseum_citadel':
        for (let x = 7; x < w - 7; x++) setTile(x, midY, 'P');
        for (let y = 5; y < h - 5; y++) setTile(midX, y, 'P');
        break;
      default:
        break;
    }
  }

  // 2. Overlay organic Tall Stealth Grass patches (',') from Atlas ONLY onto open dry '.' meadow tiles
  const atlasRows = atlas.tileGrid.length;
  const atlasCols = atlas.tileGrid[0]?.length || 24;
  for (let y = 2; y < h - 2; y++) {
    const ay = Math.min(atlasRows - 1, Math.floor((y / h) * atlasRows));
    for (let x = 2; x < w - 2; x++) {
      const ax = Math.min(atlasCols - 1, Math.floor((x / w) * atlasCols));
      const code = atlas.tileGrid[ay]?.[ax] as AtlasTileCode | undefined;
      if (code === 2 && rows[y][x] === '.') {
        setTile(x, y, ',');
      }
    }
  }

  // 3. Carve Bezier River ONLY on open terrain (layoutMod === 0) where it won't collide with twin rivers/moats/dungeon walls
  if (!hasArchitecturalWaterLayout && !isTightDungeonLayout) {
    carveBezierRiverIntoGrid(rows, blueprint);
  }

  // 4. Clean up 1x1 speckles, orphan bridges, and enforce West-East lifeline
  sanitizeWorldGrid(rows);
}
