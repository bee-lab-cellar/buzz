/**
 * File 21 / 100 — Multi-Phase Nightmare Boss Raid Behavior Trees (Arcs 1–10).
 *
 * Orchestrates stun recovery, HP-threshold enrage transitions, signature telegraph attacks,
 * counter-stance guard baits, and gap-closing pursuit via composable Behavior Tree nodes.
 * Zero `any` types.
 */

import type { BehaviorBlackboard, BehaviorTreeNode } from '../types/ai';
import type { ArcId } from '../types/world';
import {
  ActionNode,
  ConditionNode,
  CooldownDecorator,
  SelectorNode,
  SequenceNode,
} from './behaviorTreeCore';

export function getSignatureBossSkillForArc(arcId: ArcId): string {
  switch (arcId) {
    case 1:
      return 'eclipse_wolf_cleave';
    case 2:
      return 'dread_chariot_charge';
    case 3:
      return 'bahamut_sky_firebreath';
    case 4:
      return 'charybdis_tentacle_maelstrom';
    case 5:
      return 'chronos_time_rewind_pulse';
    case 6:
      return 'caldera_obsidian_eruption';
    case 7:
      return 'astral_glacier_shatter';
    case 8:
      return 'tempest_sky_cyclone';
    case 9:
      return 'mirror_doppelganger_nova';
    case 10:
      return 'aether_null_singularity_beam';
  }
}

export function createNightmareBossBehaviorTree(arcId: ArcId): BehaviorTreeNode {
  const signatureAction = getSignatureBossSkillForArc(arcId);

  const stunnedBranch = new SequenceNode('BossStunnedRecovery', [
    new ConditionNode('IsStunned', (bb) => bb.isStunned),
    new ActionNode('HoldStaggered', (bb) => {
      bb.chosenAction = 'staggered_vulnerable';
      return 'RUNNING';
    }),
  ]);

  const enrageBranch = new SequenceNode('BossEnragePhaseGate', [
    new ConditionNode('Below50PctAndNotEnraged', (bb) => bb.selfHp <= bb.selfMaxHp * 0.5 && !bb.enraged),
    new ActionNode('TriggerEnrage', (bb) => {
      bb.enraged = true;
      bb.memoryFlags.enragedRoarDone = true;
      bb.chosenAction = 'phase_two_enrage_roar';
      return 'SUCCESS';
    }),
  ]);

  const signatureSpecialBranch = new CooldownDecorator(
    'SignatureSpecialCooldown',
    4.5,
    new SequenceNode('BossSignatureSpecial', [
      new ConditionNode('TargetWithinSpecialRange', (bb) => bb.targetPos !== null && bb.targetDistancePx <= 220),
      new ActionNode('CastSignatureSpecial', (bb) => {
        bb.chosenAction = signatureAction;
        return 'SUCCESS';
      }),
    ]),
  );

  const counterStanceBranch = new CooldownDecorator(
    'CounterStanceCooldown',
    6.0,
    new SequenceNode('BossCounterGuard', [
      new ConditionNode('TargetCloseEnoughForGuard', (bb) => bb.targetPos !== null && bb.targetDistancePx <= 72 && bb.enraged),
      new ActionNode('EnterCounterGuard', (bb) => {
        bb.chosenAction = 'counter_stance_guard';
        return 'SUCCESS';
      }),
    ]),
  );

  const meleeStrikeBranch = new SequenceNode('BossMeleeCleave', [
    new ConditionNode('TargetInMeleeRange', (bb) => bb.targetPos !== null && bb.targetDistancePx <= 56),
    new ActionNode('ExecuteMeleeCleave', (bb) => {
      bb.chosenAction = 'heavy_melee_cleave';
      return 'SUCCESS';
    }),
  ]);

  const pursueBranch = new ActionNode('PursueHero', (bb, dt) => {
    if (bb.targetPos) {
      const dx = bb.targetPos.x - bb.selfPos.x;
      const dy = bb.targetPos.y - bb.selfPos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const speed = bb.enraged ? 96 : 74;
        bb.selfPos.x += (dx / dist) * speed * dt;
        bb.selfPos.y += (dy / dist) * speed * dt;
        bb.targetDistancePx = Math.max(0, dist - speed * dt);
      }
    }
    bb.chosenAction = 'pursue_target';
    return 'RUNNING';
  });

  return new SelectorNode(`NightmareBossBT_Arc${arcId}`, [
    stunnedBranch,
    enrageBranch,
    signatureSpecialBranch,
    counterStanceBranch,
    meleeStrikeBranch,
    pursueBranch,
  ]);
}

export function evaluateBossBehaviorTick(
  tree: BehaviorTreeNode,
  bb: BehaviorBlackboard,
  dt: number,
): string {
  bb.chosenAction = null;
  tree.tick(bb, dt);
  return bb.chosenAction ?? 'idle_observe';
}
