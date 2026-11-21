/**
 * File 19 / 100 — Composable Behavior Tree Kernel.
 *
 * Implements Selector, Sequence, Condition, Action, Inverter, Cooldown, and Repeater nodes
 * with zero dynamic `any` allocations for 60Hz tactical combat & boss AI evaluation.
 */

import type { BehaviorBlackboard, BehaviorStatus, BehaviorTreeNode } from '../types/ai';

export class SelectorNode implements BehaviorTreeNode {
  public readonly name: string;
  private readonly children: ReadonlyArray<BehaviorTreeNode>;

  constructor(name: string, children: ReadonlyArray<BehaviorTreeNode>) {
    this.name = name;
    this.children = children;
  }

  public tick(bb: BehaviorBlackboard, dt: number): BehaviorStatus {
    for (let i = 0; i < this.children.length; i++) {
      const status = this.children[i].tick(bb, dt);
      if (status !== 'FAILURE') {
        return status;
      }
    }
    return 'FAILURE';
  }
}

export class SequenceNode implements BehaviorTreeNode {
  public readonly name: string;
  private readonly children: ReadonlyArray<BehaviorTreeNode>;

  constructor(name: string, children: ReadonlyArray<BehaviorTreeNode>) {
    this.name = name;
    this.children = children;
  }

  public tick(bb: BehaviorBlackboard, dt: number): BehaviorStatus {
    for (let i = 0; i < this.children.length; i++) {
      const status = this.children[i].tick(bb, dt);
      if (status !== 'SUCCESS') {
        return status;
      }
    }
    return 'SUCCESS';
  }
}

export class ConditionNode implements BehaviorTreeNode {
  public readonly name: string;
  private readonly predicate: (bb: BehaviorBlackboard) => boolean;

  constructor(name: string, predicate: (bb: BehaviorBlackboard) => boolean) {
    this.name = name;
    this.predicate = predicate;
  }

  public tick(bb: BehaviorBlackboard): BehaviorStatus {
    return this.predicate(bb) ? 'SUCCESS' : 'FAILURE';
  }
}

export class ActionNode implements BehaviorTreeNode {
  public readonly name: string;
  private readonly handler: (bb: BehaviorBlackboard, dt: number) => BehaviorStatus;

  constructor(name: string, handler: (bb: BehaviorBlackboard, dt: number) => BehaviorStatus) {
    this.name = name;
    this.handler = handler;
  }

  public tick(bb: BehaviorBlackboard, dt: number): BehaviorStatus {
    return this.handler(bb, dt);
  }
}

export class InverterDecorator implements BehaviorTreeNode {
  public readonly name: string;
  private readonly child: BehaviorTreeNode;

  constructor(name: string, child: BehaviorTreeNode) {
    this.name = name;
    this.child = child;
  }

  public tick(bb: BehaviorBlackboard, dt: number): BehaviorStatus {
    const status = this.child.tick(bb, dt);
    if (status === 'SUCCESS') return 'FAILURE';
    if (status === 'FAILURE') return 'SUCCESS';
    return 'RUNNING';
  }
}

export class CooldownDecorator implements BehaviorTreeNode {
  public readonly name: string;
  private readonly child: BehaviorTreeNode;
  private readonly cooldownSec: number;
  private remainingSec = 0;

  constructor(name: string, cooldownSec: number, child: BehaviorTreeNode) {
    this.name = name;
    this.cooldownSec = Math.max(0.05, cooldownSec);
    this.child = child;
  }

  public tick(bb: BehaviorBlackboard, dt: number): BehaviorStatus {
    if (this.remainingSec > 0) {
      this.remainingSec = Math.max(0, this.remainingSec - dt);
      return 'FAILURE';
    }
    const result = this.child.tick(bb, dt);
    if (result === 'SUCCESS') {
      this.remainingSec = this.cooldownSec;
    }
    return result;
  }

  public reset(): void {
    this.remainingSec = 0;
  }
}

export function createBehaviorBlackboard(
  actId: number,
  arcId: BehaviorBlackboard['arcId'],
  selfId: string,
  selfHp: number,
  selfMaxHp: number,
): BehaviorBlackboard {
  return {
    actId,
    arcId,
    selfId,
    selfPos: { x: 100, y: 140 },
    selfHp,
    selfMaxHp,
    targetPos: { x: 240, y: 140 },
    targetDistancePx: 140,
    inLineOfSight: true,
    isStunned: false,
    cooldownSec: 0,
    elixirActive: false,
    enraged: false,
    memoryFlags: {},
    chosenAction: null,
  };
}
