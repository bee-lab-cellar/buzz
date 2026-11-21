import {
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
  type SpriteSheet8Frame,
} from './spriteMatrixTypes';
import {
  HERO_NYX_MATRIX,
  NYX_COAT_PALETTES,
  NYX_WEAPON_TIERS,
  getNyxPalette,
} from './heroNyxMatrices';
import { HERO_KING_LEO_MATRIX } from './heroKingLeoMatrices';
import {
  HERO_FENRIR_MATRIX,
  HERO_GREAT_DUCK_MATRIX,
} from './heroFenrirAndDuckMatrices';
import {
  ALLY_CAT_ARCHER_MATRIX,
  ALLY_CAT_KNIGHT_MATRIX,
  ALLY_CAT_MAGE_MATRIX,
  ALLY_DOG_WARRIOR_MATRIX,
} from './alliedCatAndDogArmyMatrices';
import {
  BOSS_DOG_WARLORD_MATRIX,
  BOSS_LICH_OVERLORD_MATRIX,
} from './arc1And2BossMatrices';
import {
  ARC3_DRAGON_PALETTES,
} from './arc3DragonBossMatrices';
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
import {
  TERRAIN_TILESET_16X16,
  WATERFALL_CASCADE_FRAMES,
  type TerrainTileMatrix,
} from './terrainAndFoliageTileset';
import {
  CAPITAL_BUILDING_MATRICES_24X24,
  LANDMARK_MATRICES_48X48,
  getCapitalBuildingSpriteMatrix,
  getLandmarkSpriteMatrix,
  type StaticSpriteMatrix,
} from './landmarksAndBuildingsMatrices';

export * from './spriteMatrixTypes';
export * from './heroNyxMatrices';
export * from './heroKingLeoMatrices';
export * from './heroFenrirAndDuckMatrices';
export * from './alliedCatAndDogArmyMatrices';
export * from './arc1And2BossMatrices';
export * from './arc3DragonBossMatrices';
export * from './arc4KrakenAndAbyssMatrices';
export * from './arc5And6MechaVoidMatrices';
export * from './terrainAndFoliageTileset';
export * from './landmarksAndBuildingsMatrices';
export {
  NYX_VISUAL_SPEC,
  KING_LEO_VISUAL_SPEC,
  mapClipToFrame8,
  getNyxCoatIndex,
  prebakeNyxAndKingLeoAtlas,
  drawHeroNyxOrLeo,
} from './heroNyxAndKingLeo';
export {
  FENRIR_VISUAL_SPEC,
  GREAT_DUCK_VISUAL_SPEC,
  prebakeFenrirOrDuckAtlas,
  drawHeroFenrirOrGreatDuck,
} from './heroFenrirAndGreatDuck';
export {
  ALLIED_CAT_COAT_PALETTES,
  DOG_BREED_PALETTES,
  ALL_CAT_COATS,
  ALL_DOG_BREEDS,
  ShuffleBagSpawner,
  getAlliedCatFrameCanvas,
  getDogBreedFrameCanvas,
  createCatCoatShuffleBag,
  createDogBreedShuffleBag,
} from './alliedCatAndDogArmies';
export {
  ARC1_AND_2_BOSS_PROFILES,
  getArc1Or2BossCanvas,
  resolveArc1Or2BossByAct,
} from './arc1And2BossSprites';
export {
  createArticulatedDragonHitboxes,
  drawArticulatedDragonBoss,
} from './arc3DragonBossSprites';
export {
  getArc4To6SpriteCanvas,
  drawKrakenTentacleWeakSpotRing,
} from './arc4To6EnemyAndBossSprites';
export {
  CLEAN_BIOME_PALETTES,
  tileCodeToTileId,
  getCleanTerrainTileCanvas,
  drawSwayingStealthGrassOverlay,
} from './cleanTerrainTileset';
export {
  getPrebakedLandmarkCanvas,
  getPrebakedCapitalBuildingCanvas,
  drawLandmarkWithAura,
} from './landmarksAndCapitalSprites';

export const ALL_8FRAME_SPRITE_SHEETS: Record<string, SpriteSheet8Frame> = {
  hero_nyx: HERO_NYX_MATRIX,
  hero_king_leo: HERO_KING_LEO_MATRIX,
  hero_wolf_king_fenrir: HERO_FENRIR_MATRIX,
  hero_great_duck: HERO_GREAT_DUCK_MATRIX,
  ally_cat_knight: ALLY_CAT_KNIGHT_MATRIX,
  ally_cat_archer: ALLY_CAT_ARCHER_MATRIX,
  ally_cat_mage: ALLY_CAT_MAGE_MATRIX,
  ally_dog_warrior: ALLY_DOG_WARRIOR_MATRIX,
  boss_arc1_warlord: BOSS_DOG_WARLORD_MATRIX,
  boss_arc2_lich_overlord: BOSS_LICH_OVERLORD_MATRIX,
  enemy_shark_knight: ENEMY_SHARK_KNIGHT_MATRIX,
  enemy_crab_corsair: ENEMY_CRAB_CORSAIR_MATRIX,
  enemy_siren_mage: ENEMY_SIREN_MAGE_MATRIX,
  boss_arc4_charybdis_kraken: BOSS_CHARYBDIS_KRAKEN_MATRIX,
  enemy_steam_golem: ENEMY_STEAM_GOLEM_MATRIX,
  enemy_clockwork_owl: ENEMY_CLOCKWORK_OWL_MATRIX,
  enemy_cyber_rat: ENEMY_CYBER_RAT_MATRIX,
  boss_arc5_chronos_omega: BOSS_CHRONOS_OMEGA_MATRIX,
  boss_arc6_aether_null: BOSS_AETHER_NULL_MATRIX,
};

const SPRITE_CANVAS_CACHE = new Map<string, HTMLCanvasElement>();

export function getCachedSpriteFrameCanvas(
  spriteId: string,
  frame: SpriteFrame8Name,
  paletteOverride?: Record<string, string>,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const sheet = ALL_8FRAME_SPRITE_SHEETS[spriteId];
  if (!sheet) return null;
  const cacheKey = paletteOverride ? '' : `${spriteId}:${frame}`;
  if (cacheKey && SPRITE_CANVAS_CACHE.has(cacheKey)) {
    return SPRITE_CANVAS_CACHE.get(cacheKey)!;
  }
  const palette = paletteOverride ?? sheet.palette;
  const canvas = renderPixelMatrixToCanvas(
    sheet.frames[frame],
    palette,
    sheet.width,
    sheet.height,
  );
  if (cacheKey) {
    SPRITE_CANVAS_CACHE.set(cacheKey, canvas);
  }
  return canvas;
}

export function getCachedStaticMatrixCanvas(
  matrix: StaticSpriteMatrix | TerrainTileMatrix,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const key = `static:${'code' in matrix ? `tile_${matrix.code}` : matrix.id}`;
  if (SPRITE_CANVAS_CACHE.has(key)) {
    return SPRITE_CANVAS_CACHE.get(key)!;
  }
  const canvas = renderPixelMatrixToCanvas(
    matrix.pixels,
    matrix.palette,
    matrix.width,
    matrix.height,
  );
  SPRITE_CANVAS_CACHE.set(key, canvas);
  return canvas;
}

export const SPRITE_CATALOG_SUMMARY = {
  sheets8Frame: Object.keys(ALL_8FRAME_SPRITE_SHEETS).length,
  articulatedDragonParts: 5,
  terrainTiles: Object.keys(TERRAIN_TILESET_16X16).length,
  landmarks: Object.keys(LANDMARK_MATRICES_48X48).length,
  capitalBuildings: Object.keys(CAPITAL_BUILDING_MATRICES_24X24).length,
  nyxCoatPalettes: NYX_COAT_PALETTES.length,
  nyxWeaponTiers: NYX_WEAPON_TIERS.length,
  arc3DragonPalettes: Object.keys(ARC3_DRAGON_PALETTES).length,
  hasKrakenWeakspotRing: KRAKEN_TENTACLE_WEAKSPOT_RING.frames.length === 2,
  hasWaterfallCascade: WATERFALL_CASCADE_FRAMES.length === 2,
  getNyxPalette,
  getLandmarkSpriteMatrix,
  getCapitalBuildingSpriteMatrix,
};
