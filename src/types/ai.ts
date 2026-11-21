/**
 * File 4 / 100 — Strict Behavior Tree, Squad Formation AI, Story NPC Deduplication,
 * & Boss Raid AI Types. Zero `any` types.
 */

import type { PlayableHeroId } from './combat';
import type { Vec2 } from './math';
import type { ArcId } from './world';

export type BehaviorStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING';

export interface BehaviorBlackboard {
  readonly actId: number;
  readonly arcId: ArcId;
  readonly selfId: string;
  selfPos: Vec2;
  selfHp: number;
  selfMaxHp: number;
  targetPos: Vec2 | null;
  targetDistancePx: number;
  inLineOfSight: boolean;
  isStunned: boolean;
  cooldownSec: number;
  elixirActive: boolean;
  enraged: boolean;
  memoryFlags: Record<string, boolean>;
  chosenAction: string | null;
}

export interface BehaviorTreeNode {
  readonly name: string;
  tick(bb: BehaviorBlackboard, dt: number): BehaviorStatus;
}

export type TacticalRole = 'vanguard' | 'flanker' | 'skirmisher' | 'support_mage';

export interface SquadFormationSlot {
  readonly slotIndex: number;
  readonly role: TacticalRole;
  readonly offset: Vec2;
  readonly separationRadiusPx: number;
}

export interface StoryNpcPresenceFlags {
  readonly actId: number;
  readonly arcId: ArcId;
  readonly kingLeoCagedOnMap: boolean;
  readonly kingLeoSanctuaryNpc: boolean;
  readonly fenrirActiveEnemyBoss: boolean;
  readonly fenrirSanctuaryNpc: boolean;
  readonly greatDuckSanctuaryNpc: boolean;
}

export interface CompanionSpawnDecision {
  readonly heroId: PlayableHeroId;
  readonly shouldSpawn: boolean;
  readonly skipReason: string | null;
}
