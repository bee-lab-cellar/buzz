/**
 * Pillar 2 — Bespoke 48x48–88x88 Arc Boss, 4-Part Articulated Dragon,
 * and 8-Tentacle Kraken Weak-Spot Pixel Matrix Hub.
 */

import type { ArticulatedDragonAnatomy } from '../types/combat';
import {
  ARC1_AND_2_BOSS_PROFILES,
  getArc1Or2BossCanvas,
  resolveArc1Or2BossByAct,
} from './arc1And2BossSprites';
import {
  ARC3_ARTICULATED_DRAGON_MATRICES,
  ARC3_DRAGON_PALETTES,
  drawArticulatedDragonBoss,
} from './arc3DragonBossSprites';
import {
  BOSS_AETHER_NULL_MATRIX,
  BOSS_CHARYBDIS_KRAKEN_MATRIX,
  BOSS_CHRONOS_OMEGA_MATRIX,
  drawKrakenTentacleWeakSpotRing,
  getArc4To6SpriteCanvas,
} from './arc4To6EnemyAndBossSprites';

export function createStructuredDragonAnatomy(bossMaxHp: number): ArticulatedDragonAnatomy {
  return {
    wings: {
      partId: 'wings',
      label: 'Dragon Wings (Break to Ground)',
      localOffset: { x: 0, y: -26 },
      hitRadius: 24,
      hp: Math.round(bossMaxHp * 0.22),
      maxHp: Math.round(bossMaxHp * 0.22),
      broken: false,
      critMultiplier: 1.5,
      bypassesBossCap: true,
    },
    severableTail: {
      partId: 'severable_tail',
      label: 'Severable Tail (Slice for Loot)',
      localOffset: { x: -26, y: 14 },
      hitRadius: 18,
      hp: Math.round(bossMaxHp * 0.16),
      maxHp: Math.round(bossMaxHp * 0.16),
      broken: false,
      critMultiplier: 2.0,
      bypassesBossCap: true,
    },
    chestCore: {
      partId: 'chest_core',
      label: 'Ember Chest Core (2.5x CRIT)',
      localOffset: { x: 2, y: -4 },
      hitRadius: 15,
      hp: Math.round(bossMaxHp * 0.35),
      maxHp: Math.round(bossMaxHp * 0.35),
      broken: false,
      critMultiplier: 2.5,
      bypassesBossCap: false,
    },
    head: {
      partId: 'head',
      label: 'Crowned Dragon Head (3.0x CRIT)',
      localOffset: { x: 18, y: -22 },
      hitRadius: 16,
      hp: Math.round(bossMaxHp * 0.27),
      maxHp: Math.round(bossMaxHp * 0.27),
      broken: false,
      critMultiplier: 3.0,
      bypassesBossCap: false,
    },
  };
}

export {
  ARC1_AND_2_BOSS_PROFILES,
  ARC3_ARTICULATED_DRAGON_MATRICES,
  ARC3_DRAGON_PALETTES,
  BOSS_AETHER_NULL_MATRIX,
  BOSS_CHARYBDIS_KRAKEN_MATRIX,
  BOSS_CHRONOS_OMEGA_MATRIX,
  drawArticulatedDragonBoss,
  drawKrakenTentacleWeakSpotRing,
  getArc1Or2BossCanvas,
  getArc4To6SpriteCanvas,
  resolveArc1Or2BossByAct,
};
