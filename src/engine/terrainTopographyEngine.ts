import { ActBlueprint, DestructiblePropKind, RampKind } from '../maps/arc1Acts1to41';
import { BiomePalette, findNearestDryTile } from '../game/acts';

export interface ActiveDestructibleProp {
  id: string;
  kind: DestructiblePropKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  destroyed: boolean;
  hitFlash: number;
}

export interface SurfacePhysicsState {
  playerElevation: 0 | 1 | 2;
  prevElevation: 0 | 1 | 2;
  inTallGrassStealth: boolean;
  ambushCritReady: boolean;
  onRoadSpeedBoost: boolean;
  inShallowWaterWet: boolean;
  cinderCrustStandTimer: number;
  ledgePlungeWindowTimer: number;
}

export function createInitialSurfacePhysicsState(): SurfacePhysicsState {
  return {
    playerElevation: 0,
    prevElevation: 0,
    inTallGrassStealth: false,
    ambushCritReady: false,
    onRoadSpeedBoost: false,
    inShallowWaterWet: false,
    cinderCrustStandTimer: 0,
    ledgePlungeWindowTimer: 0,
  };
}

// Fast 2D Value-Simplex Noise for organic terrain blending (Zero Flat Checkerboards!)
function hash2D(gx: number, gy: number, seed: number): number {
  let n = gx * 374761393 + gy * 668265263 + seed * 1442695041;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

export function sampleMultiOctaveTerrainNoise(wx: number, wy: number, seed: number): number {
  const gx = Math.floor(wx / 8);
  const gy = Math.floor(wy / 8);
  const fx = (wx % 8) / 8;
  const fy = (wy % 8) / 8;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);

  const a = hash2D(gx, gy, seed);
  const b = hash2D(gx + 1, gy, seed);
  const c = hash2D(gx, gy + 1, seed);
  const d = hash2D(gx + 1, gy + 1, seed);

  const oct1 = a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  const detail = hash2D(Math.floor(wx / 4), Math.floor(wy / 4), seed + 97) * 0.35;
  return Math.min(1, oct1 * 0.72 + detail);
}

// 4-Bit Bitmask Auto-Tile helper (North=1, East=2, South=4, West=8)
export function computeAutoTileBitmask(
  grid: string[],
  gx: number,
  gy: number,
  targetChar: string
): number {
  let mask = 0;
  if (grid[gy - 1]?.[gx] === targetChar) mask |= 1;
  if (grid[gy]?.[gx + 1] === targetChar) mask |= 2;
  if (grid[gy + 1]?.[gx] === targetChar) mask |= 4;
  if (grid[gy]?.[gx - 1] === targetChar) mask |= 8;
  return mask;
}

const EXCLUDED_ELEVATION_ACTS = new Set([40, 41, 81, 82, 121, 122, 179, 180, 239, 240, 299, 300]);

export function shouldRenderElevationForBlueprint(blueprint: ActBlueprint): boolean {
  if (EXCLUDED_ELEVATION_ACTS.has(blueprint.actId)) return false;
  if (blueprint.topologyArchetype === 'colosseum_citadel') return false;
  return true;
}

export function getElevationAtPixel(blueprint: ActBlueprint, wx: number, wy: number): 0 | 1 | 2 {
  if (!shouldRenderElevationForBlueprint(blueprint)) return 0;
  const gx = Math.floor(wx / 16);
  const gy = Math.floor(wy / 16);
  let highest: 0 | 1 | 2 = 0;
  for (const z of blueprint.elevationZones) {
    if (gx >= z.x1 && gx <= z.x2 && gy >= z.y1 && gy <= z.y2) {
      if (z.tier > highest) highest = z.tier;
    }
  }
  return highest;
}

export function isNearElevationRamp(blueprint: ActBlueprint, wx: number, wy: number): boolean {
  if (!shouldRenderElevationForBlueprint(blueprint)) return false;
  const gx = wx / 16;
  const gy = wy / 16;
  return blueprint.elevationZones.some(
    (z) => Math.hypot(gx - (z.rampAt.x + 0.5), gy - (z.rampAt.y + 0.5)) <= 2.4
  );
}

export function computeHighGroundCombatMultiplier(
  attackerElevation: 0 | 1 | 2,
  targetElevation: 0 | 1 | 2
): { dmgMult: number; rangeMult: number; hasAdvantage: boolean } {
  if (attackerElevation > targetElevation) {
    return { dmgMult: 1.25, rangeMult: 1.3, hasAdvantage: true };
  }
  return { dmgMult: 1.0, rangeMult: 1.0, hasAdvantage: false };
}

export function getTileElevation(blueprint: ActBlueprint, gx: number, gy: number): 0 | 1 | 2 {
  return getElevationAtPixel(blueprint, gx * 16 + 8, gy * 16 + 8);
}

export function spawnActDestructibleProps(
  blueprint: ActBlueprint,
  grid: string[],
  tileSize = 16
): ActiveDestructibleProp[] {
  return blueprint.destructibleProps.map((p, idx) => {
    const dry = findNearestDryTile(grid, p.x, p.y, true);
    const maxHp =
      p.kind === 'zelda_bush'
        ? 1
        : p.kind === 'wood_crate'
        ? 30 + blueprint.actId * 3
        : p.kind === 'oil_barrel'
        ? 25 + blueprint.actId * 2
        : p.kind === 'crumbling_pillar'
        ? 85 + blueprint.actId * 5
        : 999999;
    return {
      id: `prop_${blueprint.actId}_${idx}`,
      kind: p.kind,
      x: dry.x || p.x * (tileSize / 16),
      y: dry.y || p.y * (tileSize / 16),
      hp: maxHp,
      maxHp,
      destroyed: false,
      hitFlash: 0,
    };
  });
}

export function damageDestructiblePropsInRadius(
  props: ActiveDestructibleProp[],
  slashX: number,
  slashY: number,
  reach: number,
  damage: number
): {
  goldDropped: number;
  heartsDropped: number;
  explosions: Array<{ x: number; y: number; radius: number; damage: number }>;
} {
  let goldDropped = 0;
  let heartsDropped = 0;
  const explosions: Array<{ x: number; y: number; radius: number; damage: number }> = [];

  for (const prop of props) {
    if (prop.destroyed) continue;
    const dist = Math.hypot(prop.x - slashX, prop.y - slashY);
    if (dist <= reach + 14) {
      if (prop.kind === 'push_block') {
        const dx = prop.x - slashX;
        const dy = prop.y - slashY;
        const len = Math.max(1, Math.hypot(dx, dy));
        prop.x += (dx / len) * 12;
        prop.y += (dy / len) * 12;
        prop.hitFlash = 0.15;
        continue;
      }
      prop.hp -= Math.max(1, damage);
      prop.hitFlash = 0.16;
      if (prop.hp <= 0) {
        prop.destroyed = true;
        if (prop.kind === 'zelda_bush') {
          goldDropped += 12;
          if (Math.random() < 0.35) heartsDropped += 1;
        } else if (prop.kind === 'wood_crate') {
          goldDropped += 25;
          if (Math.random() < 0.45) heartsDropped += 1;
        } else if (prop.kind === 'oil_barrel') {
          explosions.push({ x: prop.x, y: prop.y, radius: 56, damage: Math.max(60, damage * 2.2) });
        } else if (prop.kind === 'crumbling_pillar') {
          explosions.push({ x: prop.x, y: prop.y, radius: 44, damage: Math.max(45, damage * 1.6) });
        }
      }
    }
  }

  return { goldDropped, heartsDropped, explosions };
}

export function updateSurfacePhysics(
  state: SurfacePhysicsState,
  blueprint: ActBlueprint,
  grid: string[],
  props: ActiveDestructibleProp[],
  playerX: number,
  playerY: number,
  isDodging: boolean,
  dt: number,
  tileSize = 16
): { speedMultiplier: number; triggeredPlungeWindow: boolean } {
  for (const p of props) {
    if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - dt);
  }
  if (state.ledgePlungeWindowTimer > 0) {
    state.ledgePlungeWindowTimer = Math.max(0, state.ledgePlungeWindowTimer - dt);
  }

  const newElev = getElevationAtPixel(blueprint, playerX, playerY);
  let triggeredPlungeWindow = false;
  if (newElev < state.playerElevation && isDodging) {
    state.ledgePlungeWindowTimer = 1.25;
    triggeredPlungeWindow = true;
  }
  state.prevElevation = state.playerElevation;
  state.playerElevation = newElev;

  const tx = Math.floor(playerX / tileSize);
  const ty = Math.floor(playerY / tileSize);
  const ch = grid[ty]?.[tx] ?? '.';

  const onDryGrassPatch =
    (ch === '.' || ch === ',') &&
    !EXCLUDED_ELEVATION_ACTS.has(blueprint.actId) &&
    blueprint.tallGrassPatches.some(
      (patch) => Math.hypot(playerX - patch.x, playerY - patch.y) <= patch.radius
    );
  const inBush = ch === ',' || onDryGrassPatch;
  state.inTallGrassStealth = inBush;
  if (inBush) {
    state.ambushCritReady = true;
  }

  state.onRoadSpeedBoost = ch === 'P' || ch === 'C';
  state.inShallowWaterWet = ch === 'M';

  const speedMultiplier = state.onRoadSpeedBoost ? 1.2 : state.inShallowWaterWet ? 0.9 : 1.0;
  return { speedMultiplier, triggeredPlungeWindow };
}

function computeMultiMask(
  grid: string[],
  gx: number,
  gy: number,
  predicate: (ch: string | undefined) => boolean
): number {
  let mask = 0;
  if (predicate(grid[gy - 1]?.[gx])) mask |= 1;
  if (predicate(grid[gy]?.[gx + 1])) mask |= 2;
  if (predicate(grid[gy + 1]?.[gx])) mask |= 4;
  if (predicate(grid[gy]?.[gx - 1])) mask |= 8;
  return mask;
}

export function renderOrganicAutoTiledSurface(
  ctx: CanvasRenderingContext2D,
  grid: string[],
  blueprint: ActBlueprint,
  palette: BiomePalette,
  tileSize = 16
) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 38;
  const seed = blueprint.actId * 131;
  const useForestTrees =
    blueprint.terrainTheme === 'lush_highlands' ||
    blueprint.terrainTheme === 'autumn_ridge' ||
    blueprint.terrainTheme === 'astral_bamboo' ||
    blueprint.terrainTheme === 'sunken_marsh';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = grid[y][x];
      const px = x * tileSize;
      const py = y * tileSize;
      const nVal = sampleMultiOctaveTerrainNoise(px + 8, py + 8, seed);
      const h = Math.abs((x * 73856093) ^ (y * 19349663) ^ seed);

      if (ch === '.' || ch === ',') {
        // Organic Simplex-Noise Meadow / Highland / Cavern Ground (ZERO Checkerboards!)
        ctx.fillStyle = nVal > 0.52 ? palette.groundA : palette.groundB;
        ctx.fillRect(px, py, tileSize, tileSize);

        ctx.fillStyle = nVal > 0.52 ? palette.groundB : palette.groundA;
        if (nVal > 0.36 && nVal < 0.66) {
          ctx.fillRect(px + 2, py + 3, 6, 4);
          ctx.fillRect(px + 8, py + 9, 5, 4);
        }

        if (ch === ',') {
          // Tall Whispering Stealth Grass / Kelp / Ash-Fern (Previously unrendered black holes!)
          const bladeDark =
            blueprint.terrainTheme === 'coral_atoll'
              ? '#0f766e'
              : blueprint.terrainTheme === 'volcanic_caldera'
              ? '#7c2d12'
              : blueprint.terrainTheme === 'void_singularity'
              ? '#4c1d95'
              : '#14532d';
          const bladeBright =
            blueprint.terrainTheme === 'coral_atoll'
              ? '#2dd4bf'
              : blueprint.terrainTheme === 'volcanic_caldera'
              ? '#f97316'
              : blueprint.terrainTheme === 'void_singularity'
              ? '#a855f7'
              : palette.accent || '#4ade80';
          ctx.fillStyle = bladeDark;
          ctx.fillRect(px + 2, py + 5, 3, 6);
          ctx.fillRect(px + 7, py + 4, 3, 7);
          ctx.fillRect(px + 12, py + 6, 2, 6);
          ctx.fillStyle = bladeBright;
          ctx.fillRect(px + 3, py + 3, 2, 4);
          ctx.fillRect(px + 8, py + 2, 2, 4);
          ctx.fillRect(px + 12, py + 4, 2, 3);
        } else {
          // Subtle grass tufts & biome flecks
          if (h % 3 === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(px + (h % 10) + 2, py + ((h >> 3) % 10) + 2, 2, 1);
            ctx.fillRect(px + (h % 8) + 4, py + ((h >> 4) % 8) + 4, 1, 2);
          }
          if (h % 11 === 0) {
            ctx.fillStyle =
              blueprint.terrainTheme === 'lush_highlands'
                ? '#fde047'
                : blueprint.terrainTheme === 'autumn_ridge'
                ? '#fb923c'
                : blueprint.terrainTheme === 'coral_atoll'
                ? '#38bdf8'
                : palette.accent;
            ctx.fillRect(px + 5 + (h % 5), py + 5 + ((h >> 2) % 5), 2, 2);
          }
        }
      } else if (ch === 'P') {
        // 4-Bit Auto-Tiled Packed Stone/Dirt Road (merges cleanly with 'P', 'B', 'C')
        const mask = computeMultiMask(grid, x, y, (n) => n === 'P' || n === 'B' || n === 'C');
        ctx.fillStyle = nVal > 0.52 ? palette.groundA : palette.groundB;
        ctx.fillRect(px, py, tileSize, tileSize);

        const insetN = (mask & 1) === 0 ? 2 : 0;
        const insetE = (mask & 2) === 0 ? 2 : 0;
        const insetS = (mask & 4) === 0 ? 2 : 0;
        const insetW = (mask & 8) === 0 ? 2 : 0;

        ctx.fillStyle = nVal > 0.5 ? palette.pathA : palette.pathB;
        ctx.fillRect(
          px + insetW,
          py + insetN,
          tileSize - insetW - insetE,
          tileSize - insetN - insetS
        );
        // Subtle road curb highlight & cobble speckles
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        if ((mask & 1) === 0) ctx.fillRect(px + insetW, py + insetN, tileSize - insetW - insetE, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.16)';
        if ((mask & 4) === 0) ctx.fillRect(px + insetW, py + tileSize - insetS - 1, tileSize - insetW - insetE, 1);
        if (h % 3 === 0) {
          ctx.fillRect(px + 4 + (h % 5), py + 6 + ((h >> 2) % 4), 2, 2);
        }
      } else if (ch === 'C') {
        // Auto-Tiled Royal Sanctuary Mosaic / Arena Carpet (gold trim ONLY on outer perimeter!)
        const mask = computeAutoTileBitmask(grid, x, y, 'C');
        ctx.fillStyle = (x + y) % 2 === 0 ? palette.carpetA : palette.carpetB;
        ctx.fillRect(px, py, tileSize, tileSize);
        // Subtle inner woven filigree
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.06)';
          ctx.fillRect(px + 4, py + 4, 8, 8);
        }
        // Clean outer royal gold border
        ctx.fillStyle = 'rgba(253, 224, 71, 0.55)';
        if ((mask & 1) === 0) ctx.fillRect(px, py, tileSize, 2);
        if ((mask & 4) === 0) ctx.fillRect(px, py + tileSize - 2, tileSize, 2);
        if ((mask & 8) === 0) ctx.fillRect(px, py, 2, tileSize);
        if ((mask & 2) === 0) ctx.fillRect(px + tileSize - 2, py, 2, tileSize);
      } else if (ch === 'W') {
        // 4-Bit Auto-Tiled Water / Abyssal Ocean with crisp shoreline banks
        const mask = computeMultiMask(grid, x, y, (n) => n === 'W' || n === 'B');
        ctx.fillStyle = nVal > 0.48 ? palette.waterA : palette.waterB;
        ctx.fillRect(px, py, tileSize, tileSize);
        // Subtle organic deep-water ripple
        if (nVal > 0.62) {
          ctx.fillStyle = palette.waterB;
          ctx.fillRect(px + 3, py + 5, 7, 3);
        }
        // Shoreline sandy/stone lip & gentle foam where water meets land
        ctx.fillStyle = 'rgba(186, 230, 253, 0.34)';
        if ((mask & 1) === 0) ctx.fillRect(px, py, tileSize, 2);
        if ((mask & 4) === 0) ctx.fillRect(px, py + tileSize - 2, tileSize, 2);
        if ((mask & 8) === 0) ctx.fillRect(px, py, 2, tileSize);
        if ((mask & 2) === 0) ctx.fillRect(px + tileSize - 2, py, 2, tileSize);
        if (palette.theme === 'sanctuary' && h % 9 === 0) {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(px + 4, py + 5, 7, 6);
          ctx.fillStyle = '#f9a8d4';
          ctx.fillRect(px + 6, py + 6, 3, 3);
        }
      } else if (ch === 'B') {
        // Auto-Tiled Timber/Stone Bridge oriented cleanly to crossing axis
        const nUp = grid[y - 1]?.[x];
        const nDn = grid[y + 1]?.[x];
        const nLt = grid[y]?.[x - 1];
        const nRt = grid[y]?.[x + 1];
        const nearLava =
          (nUp === 'L' || nDn === 'L' || nLt === 'L' || nRt === 'L') &&
          nUp !== 'W' &&
          nDn !== 'W' &&
          nLt !== 'W' &&
          nRt !== 'W';
        const hasWaterNS = nUp === 'W' || nDn === 'W' || nUp === 'L' || nDn === 'L';
        const hasWaterEW = nLt === 'W' || nRt === 'W' || nLt === 'L' || nRt === 'L';

        ctx.fillStyle = nearLava ? palette.hazardA : palette.waterA;
        ctx.fillRect(px, py, tileSize, tileSize);

        if (hasWaterEW && !hasWaterNS) {
          // Vertical N-S bridge
          ctx.fillStyle = y % 2 === 0 ? palette.bridgeA : palette.bridgeB;
          ctx.fillRect(px + 1, py, tileSize - 2, tileSize);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(px + 1, py + 5, tileSize - 2, 1);
          ctx.fillRect(px + 1, py + 11, tileSize - 2, 1);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(px + 1, py, 2, tileSize);
          ctx.fillRect(px + tileSize - 3, py, 2, tileSize);
        } else {
          // Horizontal E-W bridge (default)
          ctx.fillStyle = x % 2 === 0 ? palette.bridgeA : palette.bridgeB;
          ctx.fillRect(px, py + 1, tileSize, tileSize - 2);
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(px + 5, py + 1, 1, tileSize - 2);
          ctx.fillRect(px + 11, py + 1, 1, tileSize - 2);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(px, py + 1, tileSize, 2);
          ctx.fillRect(px, py + tileSize - 3, tileSize, 2);
        }
      } else if (ch === 'M') {
        // Auto-Tiled Marsh Mud / Shallow Pebble Ford
        const mask = computeAutoTileBitmask(grid, x, y, 'M');
        ctx.fillStyle = palette.groundB;
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = '#4a3525';
        ctx.fillRect(
          px + ((mask & 8) === 0 ? 1 : 0),
          py + ((mask & 1) === 0 ? 1 : 0),
          tileSize - ((mask & 8) === 0 ? 1 : 0) - ((mask & 2) === 0 ? 1 : 0),
          tileSize - ((mask & 1) === 0 ? 1 : 0) - ((mask & 4) === 0 ? 1 : 0)
        );
        ctx.fillStyle = '#6b4f3b';
        ctx.fillRect(px + 3, py + 4, 5, 3);
        ctx.fillRect(px + 8, py + 10, 5, 3);
      } else if (ch === 'I') {
        // Glacial Ice Sheet with crystalline refraction lines
        ctx.fillStyle = nVal > 0.5 ? '#bae6fd' : '#7dd3fc';
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = '#f0f9ff';
        ctx.fillRect(px + 3, py + 4, 6, 1);
        ctx.fillRect(px + 8, py + 11, 5, 1);
      } else if (ch === 'L') {
        // Auto-Tiled Scorched Magma / Acid Channel with volcanic rim
        const mask = computeMultiMask(grid, x, y, (n) => n === 'L' || n === 'B');
        ctx.fillStyle = nVal > 0.5 ? palette.hazardA : palette.hazardB;
        ctx.fillRect(px, py, tileSize, tileSize);
        ctx.fillStyle = '#292524';
        if ((mask & 1) === 0) ctx.fillRect(px, py, tileSize, 2);
        if ((mask & 4) === 0) ctx.fillRect(px, py + tileSize - 2, tileSize, 2);
        if ((mask & 8) === 0) ctx.fillRect(px, py, 2, tileSize);
        if ((mask & 2) === 0) ctx.fillRect(px + tileSize - 2, py, 2, tileSize);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 4, py + 5, 5, 2);
        ctx.fillRect(px + 9, py + 10, 4, 2);
      } else if (ch === '#') {
        // Auto-Tiled Solid Perimeter Stone / Tree / Citadel Walls
        const isBorder = x === 0 || x === cols - 1 || y === 0 || y === rows - 1;
        const mask = computeAutoTileBitmask(grid, x, y, '#');
        if (useForestTrees && !isBorder) {
          ctx.fillStyle = palette.groundB;
          ctx.fillRect(px, py, tileSize, tileSize);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(px + 6, py + 10, 4, 6);
          ctx.fillStyle = palette.wallB;
          ctx.fillRect(px + 2, py + 2, 12, 10);
          ctx.fillStyle = palette.wallA;
          ctx.fillRect(px + 3, py + 1, 10, 8);
          ctx.fillStyle = 'rgba(255,255,255,0.14)';
          ctx.fillRect(px + 4, py + 2, 4, 3);
        } else {
          ctx.fillStyle = palette.wallA;
          ctx.fillRect(px, py, tileSize, tileSize);
          // Masonry brick accents
          ctx.fillStyle = palette.wallB;
          ctx.fillRect(px, py + 7, tileSize, 1);
          ctx.fillRect(px + (y % 2 === 0 ? 7 : 3), py, 1, 7);
          // Highlight top edge if exposed to air
          if ((mask & 1) === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.14)';
            ctx.fillRect(px, py, tileSize, 2);
          }
          // 3px dark southern drop-face when bottom edge faces open floor
          if ((mask & 4) === 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.42)';
            ctx.fillRect(px, py + tileSize - 3, tileSize, 3);
          }
        }
      } else {
        // Safe Fallback for any future tile symbol (never leave transparent black holes!)
        ctx.fillStyle = palette.groundA;
        ctx.fillRect(px, py, tileSize, tileSize);
      }
    }
  }

  // Render High-Ground Plateau Tints & Cliff Lips ONLY on valid dry walkable tiles (never over water/lava/walls/bridges/arenas!)
  if (!shouldRenderElevationForBlueprint(blueprint)) return;

  const isDryFloor = (ch: string | undefined) => ch === '.' || ch === ',' || ch === 'P';
  const tileElev = (gx: number, gy: number): 0 | 1 | 2 => {
    const ch = grid[gy]?.[gx];
    if (!isDryFloor(ch)) return 0;
    return getTileElevation(blueprint, gx, gy);
  };

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const elev = tileElev(x, y);
      if (elev === 0) continue;
      const px = x * tileSize;
      const py = y * tileSize;

      // Subtle warm plateau sunlit tint
      ctx.fillStyle = elev === 2 ? 'rgba(254, 240, 138, 0.11)' : 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(px, py, tileSize, tileSize);

      // Draw crisp border rim ONLY where neighbor has lower elevation and is walkable dry ground
      ctx.fillStyle = elev === 2 ? 'rgba(253, 224, 71, 0.5)' : 'rgba(255, 255, 255, 0.25)';
      if (tileElev(x, y - 1) < elev && isDryFloor(grid[y - 1]?.[x])) {
        ctx.fillRect(px, py, tileSize, 1);
      }
      if (tileElev(x - 1, y) < elev && isDryFloor(grid[y]?.[x - 1])) {
        ctx.fillRect(px, py, 1, tileSize);
      }
      if (tileElev(x + 1, y) < elev && isDryFloor(grid[y]?.[x + 1])) {
        ctx.fillRect(px + tileSize - 1, py, 1, tileSize);
      }

      // Draw Southern cliff step-lip ONLY onto lower walkable dry ground (never over rivers, bridges, or walls!)
      if (tileElev(x, y + 1) < elev && isDryFloor(grid[y + 1]?.[x])) {
        const cliffH = elev === 2 ? 6 : 4;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(px, py + tileSize - 1, tileSize, cliffH);
        ctx.fillStyle = '#334155';
        ctx.fillRect(px, py + tileSize - 1, tileSize, cliffH - 2);
      }
    }
  }

  for (const z of blueprint.elevationZones) {
    const rx = z.rampAt.x;
    const ry = z.rampAt.y;
    if (isDryFloor(grid[ry]?.[rx])) {
      drawElevationRamp(ctx, rx * tileSize, ry * tileSize, z.rampAt.kind);
    }
  }
}

function drawElevationRamp(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  kind: RampKind
) {
  if (kind === 'stone_stairs') {
    ctx.fillStyle = '#64748b';
    ctx.fillRect(rx - 1, ry - 1, 18, 14);
    for (let step = 0; step < 4; step++) {
      ctx.fillStyle = step % 2 === 0 ? '#cbd5e1' : '#94a3b8';
      ctx.fillRect(rx + 1, ry + step * 3, 14, 2);
    }
  } else if (kind === 'wood_ramp') {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(rx - 1, ry - 1, 18, 14);
    for (let plank = 0; plank < 4; plank++) {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(rx + 1, ry + plank * 3, 14, 2);
    }
  } else if (kind === 'vine_ladder') {
    ctx.fillStyle = '#14532d';
    ctx.fillRect(rx + 2, ry - 1, 2, 14);
    ctx.fillRect(rx + 12, ry - 1, 2, 14);
    ctx.fillStyle = '#4ade80';
    for (let rung = 0; rung < 4; rung++) {
      ctx.fillRect(rx + 2, ry + rung * 3, 12, 2);
    }
  } else {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.beginPath();
    ctx.arc(rx + 8, ry + 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();
  }
}

export function renderDynamicTopographyOverlays(
  ctx: CanvasRenderingContext2D,
  blueprint: ActBlueprint,
  props: ActiveDestructibleProp[],
  playerX: number,
  playerY: number,
  surfaceState: SurfacePhysicsState,
  globalTime: number,
  grid?: string[]
) {
  const skipGenericDecor = EXCLUDED_ELEVATION_ACTS.has(blueprint.actId);

  // 1. Render Tall Whispering Grass & Reed Patches ONLY on dry '.' / ',' ground (never on water, lava, walls, or carpets!)
  if (!skipGenericDecor) {
    for (const patch of blueprint.tallGrassPatches) {
      if (grid && grid.length > 0) {
        const gx = Math.floor(patch.x / 16);
        const gy = Math.floor(patch.y / 16);
        const ch = grid[gy]?.[gx];
        if (ch !== '.' && ch !== ',') continue;
      }
      const dist = Math.hypot(playerX - patch.x, playerY - patch.y);
      const sway = Math.sin(globalTime * (dist < patch.radius ? 14 : 4) + patch.x) * (dist < patch.radius ? 2.5 : 1.0);
      ctx.save();
      ctx.fillStyle = 'rgba(22, 101, 52, 0.22)';
      ctx.beginPath();
      ctx.arc(patch.x, patch.y, patch.radius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      for (let i = -patch.radius + 7; i < patch.radius - 5; i += 8) {
        for (let j = -patch.radius + 7; j < patch.radius - 5; j += 8) {
          if (i * i + j * j <= (patch.radius - 4) * (patch.radius - 4)) {
            const bx = Math.round(patch.x + i + sway);
            const by = Math.round(patch.y + j);
            if (grid && grid.length > 0) {
              const bTile = grid[Math.floor(by / 16)]?.[Math.floor(bx / 16)];
              if (bTile !== '.' && bTile !== ',') continue;
            }
            ctx.fillStyle = '#15803d';
            ctx.fillRect(bx, by, 2, 4);
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(bx, by - 2, 2, 2);
          }
        }
      }
      if (dist <= patch.radius) {
        ctx.font = 'bold 5px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#86efac';
        ctx.fillText('🐾 BUSH STEALTH (2.0x AMBUSH!)', patch.x, patch.y - patch.radius - 3);
      }
      ctx.restore();
    }
  }

  // 2. Render Destructible Terrain Props (Crates, Oil Barrels, Zelda Bushes, Pillars, Push Blocks)
  for (const prop of props) {
    if (prop.destroyed) continue;
    const px = Math.round(prop.x);
    const py = Math.round(prop.y);
    ctx.save();
    if (prop.kind === 'zelda_bush') {
      ctx.fillStyle = prop.hitFlash > 0 ? '#ffffff' : '#15803d';
      ctx.fillRect(px - 7, py - 7, 14, 13);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(px - 5, py - 6, 10, 8);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(px - 3, py - 4, 3, 2);
    } else if (prop.kind === 'wood_crate') {
      ctx.fillStyle = prop.hitFlash > 0 ? '#ffffff' : '#78350f';
      ctx.fillRect(px - 7, py - 7, 14, 14);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(px - 5, py - 5, 10, 10);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(px - 5, py - 1, 10, 2);
    } else if (prop.kind === 'oil_barrel') {
      ctx.fillStyle = prop.hitFlash > 0 ? '#ffffff' : '#991b1b';
      ctx.fillRect(px - 6, py - 8, 12, 15);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px - 5, py - 6, 10, 11);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px - 2, py - 2, 4, 4);
    } else if (prop.kind === 'crumbling_pillar') {
      ctx.fillStyle = prop.hitFlash > 0 ? '#ffffff' : '#475569';
      ctx.fillRect(px - 7, py - 11, 14, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px - 5, py - 9, 10, 16);
    } else {
      // push_block
      ctx.fillStyle = '#334155';
      ctx.fillRect(px - 8, py - 8, 16, 16);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(px - 6.5, py - 6.5, 13, 13);
    }
    ctx.restore();
  }

  // 3. Render High-Ground Elevation Indicator Badge near Nyx when standing on Tier 1 or Tier 2 Plateau!
  if (surfaceState.playerElevation > 0) {
    ctx.save();
    ctx.font = 'bold 5px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText(
      `⛰️ HIGH GROUND T${surfaceState.playerElevation} (+25% DMG)`,
      Math.round(playerX),
      Math.round(playerY + 15)
    );
    ctx.restore();
  }
}
