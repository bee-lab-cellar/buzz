/**
 * File 93 / 100 — Automated Suite 04: Behavior Trees, Squad 26px Separation & Story NPC Deduplication (20 Tests).
 */

import { describe, expect, it } from 'vitest';
import {
  ActionNode,
  ConditionNode,
  CooldownDecorator,
  createBehaviorBlackboard,
  InverterDecorator,
  SelectorNode,
  SequenceNode,
} from '../ai/behaviorTreeCore';
import {
  computeTacticalFormationSlots,
  MINIMUM_SQUAD_SEPARATION_PX,
  resolveSquadSeparation,
  stepSquadTacticalFormation,
  type TacticalUnitState,
} from '../ai/squadTacticalFormationAI';
import {
  createNightmareBossBehaviorTree,
  getSignatureBossSkillForArc,
} from '../ai/bossBehaviorTrees';
import {
  buildStoryNpcPresenceForAct,
  evaluateCompanionSpawns,
  filterDeduplicatedCompanionIds,
} from '../ai/companionHeroAI';
import type { BehaviorBlackboard } from '../types/ai';

function makeBlackboard(overrides: Partial<BehaviorBlackboard> = {}): BehaviorBlackboard {
  return {
    ...createBehaviorBlackboard(100, 1, 'boss_1', 1000, 1000),
    selfPos: { x: 200, y: 120 },
    targetPos: { x: 100, y: 120 },
    targetDistancePx: 100,
    ...overrides,
  };
}

describe('04. Behavior Trees, Squad Separation & Story NPC Deduplication (20 Tests)', () => {
  it('01. SelectorNode succeeds on first passing child and skips later children', () => {
    let secondRan = false;
    const sel = new SelectorNode('root', [
      new ActionNode('first', () => 'SUCCESS'),
      new ActionNode('second', () => {
        secondRan = true;
        return 'SUCCESS';
      }),
    ]);
    expect(sel.tick(makeBlackboard(), 0.016)).toBe('SUCCESS');
    expect(secondRan).toBe(false);
  });

  it('02. SequenceNode fails fast when first condition fails', () => {
    const seq = new SequenceNode('seq', [
      new ConditionNode('always_false', () => false),
      new ActionNode('never', () => 'SUCCESS'),
    ]);
    expect(seq.tick(makeBlackboard(), 0.016)).toBe('FAILURE');
  });

  it('03. InverterDecorator flips SUCCESS <-> FAILURE and preserves RUNNING', () => {
    const invS = new InverterDecorator('inv1', new ActionNode('s', () => 'SUCCESS'));
    const invF = new InverterDecorator('inv2', new ActionNode('f', () => 'FAILURE'));
    const invR = new InverterDecorator('inv3', new ActionNode('r', () => 'RUNNING'));
    expect(invS.tick(makeBlackboard(), 0.016)).toBe('FAILURE');
    expect(invF.tick(makeBlackboard(), 0.016)).toBe('SUCCESS');
    expect(invR.tick(makeBlackboard(), 0.016)).toBe('RUNNING');
  });

  it('04. CooldownDecorator blocks repeated execution until cooldown expires', () => {
    const cd = new CooldownDecorator('cd', 2.0, new ActionNode('cast', () => 'SUCCESS'));
    const bb = makeBlackboard();
    expect(cd.tick(bb, 0.016)).toBe('SUCCESS');
    expect(cd.tick(bb, 0.5)).toBe('FAILURE');
    expect(cd.tick(bb, 1.5)).toBe('FAILURE');
    expect(cd.tick(bb, 0.016)).toBe('SUCCESS');
  });

  it('05. createBehaviorBlackboard initializes clean finite state with zero NaN', () => {
    const bb = createBehaviorBlackboard(300, 3, 'enemy_1', 1500, 1500);
    expect(bb.actId).toBe(300);
    expect(bb.arcId).toBe(3);
    expect(bb.selfHp).toBe(1500);
    expect(bb.chosenAction).toBeNull();
  });

  it('06. Boss Behavior Tree holds staggered_vulnerable when isStunned is true', () => {
    const bt = createNightmareBossBehaviorTree(3);
    const bb = makeBlackboard({ isStunned: true });
    expect(bt.tick(bb, 0.016)).toBe('RUNNING');
    expect(bb.chosenAction).toBe('staggered_vulnerable');
  });

  it('07. Boss Behavior Tree triggers phase_two_enrage_roar below 50% HP', () => {
    const bt = createNightmareBossBehaviorTree(3);
    const bb = makeBlackboard({ selfHp: 450, selfMaxHp: 1000, enraged: false });
    expect(bt.tick(bb, 0.016)).toBe('SUCCESS');
    expect(bb.enraged).toBe(true);
    expect(bb.chosenAction).toBe('phase_two_enrage_roar');
  });

  it('08. Boss Behavior Tree fires Arc-specific signature skill within 220px', () => {
    const bt = createNightmareBossBehaviorTree(4);
    const bb = makeBlackboard({ targetDistancePx: 140 });
    expect(bt.tick(bb, 0.016)).toBe('SUCCESS');
    expect(bb.chosenAction).toBe('charybdis_tentacle_maelstrom');
  });

  it('09. getSignatureBossSkillForArc maps all 10 Arcs to unique boss skills', () => {
    const set = new Set<string>();
    for (let a = 1; a <= 10; a++) {
      set.add(getSignatureBossSkillForArc(a as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10));
    }
    expect(set.size).toBe(10);
  });

  it('10. Boss Behavior Tree pursues distant target (> 220px) toward hero', () => {
    const bt = createNightmareBossBehaviorTree(1);
    const bb = makeBlackboard({ selfPos: { x: 400, y: 120 }, targetPos: { x: 100, y: 120 }, targetDistancePx: 300 });
    bt.tick(bb, 0.5);
    expect(bb.chosenAction).toBe('pursue_target');
    expect(bb.selfPos.x).toBeLessThan(400);
  });

  it('11. MINIMUM_SQUAD_SEPARATION_PX enforces strict 26px spacing (Renewal Pillar 2)', () => {
    expect(MINIMUM_SQUAD_SEPARATION_PX).toBeGreaterThanOrEqual(26);
  });

  it('12. computeTacticalFormationSlots places vanguard/flanker/mage slots distinctly', () => {
    const slots = computeTacticalFormationSlots(
      { x: 100, y: 100 },
      0,
      ['vanguard', 'flanker', 'skirmisher', 'support_mage'],
    );
    expect(slots.length).toBe(4);
    const dist = Math.hypot(
      slots[0].offset.x - slots[1].offset.x,
      slots[0].offset.y - slots[1].offset.y,
    );
    expect(dist).toBeGreaterThan(15);
  });

  it('13. stepSquadTacticalFormation & resolveSquadSeparation push stacked allies >= 26px apart', () => {
    const units: TacticalUnitState[] = [
      { id: 'u1', role: 'vanguard', position: { x: 100, y: 100 }, velocity: { x: 0, y: 0 }, maxSpeed: 80, hp: 100 },
      { id: 'u2', role: 'vanguard', position: { x: 101, y: 100 }, velocity: { x: 0, y: 0 }, maxSpeed: 80, hp: 100 },
    ];
    for (let i = 0; i < 40; i++) {
      stepSquadTacticalFormation(units, { x: 100, y: 100 }, 0, 1 / 60);
    }
    resolveSquadSeparation(units);
    const dist = Math.hypot(
      units[0].position.x - units[1].position.x,
      units[0].position.y - units[1].position.y,
    );
    expect(dist).toBeGreaterThanOrEqual(25.9);
  });

  it('14. NEVER spawns duplicate King Leo when King Leo is caged in Throne Room (Act 41 / 100)', () => {
    const presence = buildStoryNpcPresenceForAct(41, { isSanctuary: false, hasCagedKingLeo: true });
    const spawned = filterDeduplicatedCompanionIds('nyx', ['nyx', 'king_leo', 'fenrir', 'great_duck'], presence);
    expect(spawned).not.toContain('king_leo');
  });

  it('15. NEVER spawns duplicate Fenrir when Fenrir is Enemy Boss in Arc 1 or Arc 2', () => {
    const presence = buildStoryNpcPresenceForAct(100, { isSanctuary: false, activeBossIds: ['usurper_fenrir'] });
    const spawned = filterDeduplicatedCompanionIds('nyx', ['nyx', 'king_leo', 'fenrir', 'great_duck'], presence);
    expect(spawned).not.toContain('fenrir');
  });

  it('16. NEVER spawns duplicate Great Duck on Sanctuary acts (99, 199, ..., 999)', () => {
    const presence = buildStoryNpcPresenceForAct(299, { isSanctuary: true });
    const spawned = filterDeduplicatedCompanionIds('nyx', ['nyx', 'king_leo', 'fenrir', 'great_duck'], presence);
    expect(spawned).not.toContain('great_duck');
  });

  it('17. NEVER spawns currently controlled active hero as an AI companion', () => {
    const presence = buildStoryNpcPresenceForAct(350, { isSanctuary: false });
    const spawned = filterDeduplicatedCompanionIds('king_leo', ['nyx', 'king_leo', 'fenrir', 'great_duck'], presence);
    expect(spawned).not.toContain('king_leo');
    expect(spawned).toContain('nyx');
    expect(spawned).toContain('fenrir');
    expect(spawned).toContain('great_duck');
  });

  it('18. Spawns Reformed Fenrir & Great Duck alongside Nyx in Arc III+ standard combat acts', () => {
    const presence = buildStoryNpcPresenceForAct(320, { isSanctuary: false });
    const spawned = filterDeduplicatedCompanionIds('nyx', ['nyx', 'king_leo', 'fenrir', 'great_duck'], presence);
    expect(spawned).toEqual(['king_leo', 'fenrir', 'great_duck']);
  });

  it('19. evaluateCompanionSpawns provides human-readable skipReason for every deduplicated NPC', () => {
    const presence = buildStoryNpcPresenceForAct(100, { isSanctuary: false, hasCagedKingLeo: true });
    const decisions = evaluateCompanionSpawns('nyx', ['nyx', 'king_leo', 'fenrir'], presence);
    const leoDecision = decisions.find((d) => d.heroId === 'king_leo');
    expect(leoDecision?.shouldSpawn).toBe(false);
    expect(leoDecision?.skipReason).toContain('deduplicated');
  });

  it('20. deduplicates repeated hero IDs inside unlockedHeroes array safely', () => {
    const presence = buildStoryNpcPresenceForAct(450, { isSanctuary: false });
    const spawned = filterDeduplicatedCompanionIds('nyx', ['nyx', 'king_leo', 'king_leo', 'fenrir'], presence);
    expect(spawned).toEqual(['king_leo', 'fenrir']);
  });
});
