/**
 * File 20 / 100 — Squad Tactical Formation & Separation AI.
 *
 * Assigns crisp Vanguard / Flanker / Skirmisher / Support Mage formation slots around
 * a target or leader and enforces `MINIMUM_SQUAD_SEPARATION_PX = 26` so cat knights,
 * dog warriors, and enemy ambush waves never stack into overlapping blobs. Zero `any`.
 */

import type { SquadFormationSlot, TacticalRole } from '../types/ai';
import type { ReadonlyVec2, Vec2 } from '../types/math';

export const MINIMUM_SQUAD_SEPARATION_PX = 26;

export interface TacticalUnitState {
  readonly id: string;
  readonly role: TacticalRole;
  position: Vec2;
  velocity: Vec2;
  readonly maxSpeed: number;
  hp: number;
}

export function computeTacticalFormationSlots(
  leaderPos: ReadonlyVec2,
  facingAngleRad: number,
  roles: ReadonlyArray<TacticalRole>,
  separationPx = MINIMUM_SQUAD_SEPARATION_PX,
): SquadFormationSlot[] {
  const cos = Math.cos(facingAngleRad);
  const sin = Math.sin(facingAngleRad);
  const sep = Math.max(MINIMUM_SQUAD_SEPARATION_PX, separationPx);
  const slots: SquadFormationSlot[] = [];

  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    const side = i % 2 === 0 ? 1 : -1;
    const rank = Math.floor(i / 2) + 1;

    let localForward = 0;
    let localLateral = 0;
    switch (role) {
      case 'vanguard':
        localForward = sep * 0.9;
        localLateral = side * sep * (0.65 + (rank - 1) * 0.55);
        break;
      case 'flanker':
        localForward = sep * 0.25;
        localLateral = side * sep * (1.25 + (rank - 1) * 0.6);
        break;
      case 'skirmisher':
        localForward = -sep * 0.65;
        localLateral = side * sep * (0.95 + (rank - 1) * 0.5);
        break;
      case 'support_mage':
        localForward = -sep * 1.15;
        localLateral = side * sep * (0.55 + (rank - 1) * 0.5);
        break;
    }

    const worldX = leaderPos.x + localForward * cos - localLateral * sin;
    const worldY = leaderPos.y + localForward * sin + localLateral * cos;
    slots.push({
      slotIndex: i,
      role,
      offset: { x: worldX, y: worldY },
      separationRadiusPx: sep,
    });
  }
  return slots;
}

/**
 * Resolves pairwise unit overlap strictly enforcing `separationRadiusPx >= 26`
 * so melee units stay crisp, readable, and spaced apart.
 */
export function resolveSquadSeparation(
  units: TacticalUnitState[],
  separationRadiusPx = MINIMUM_SQUAD_SEPARATION_PX,
  iterations = 3,
): number {
  const minDist = Math.max(MINIMUM_SQUAD_SEPARATION_PX, separationRadiusPx);
  const minDistSq = minDist * minDist;
  let overlapsResolved = 0;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < units.length; i++) {
      const a = units[i];
      if (a.hp <= 0) continue;
      for (let j = i + 1; j < units.length; j++) {
        const b = units[j];
        if (b.hp <= 0) continue;
        let dx = b.position.x - a.position.x;
        let dy = b.position.y - a.position.y;
        let distSq = dx * dx + dy * dy;
        if (distSq >= minDistSq) continue;

        if (distSq < 1e-6) {
          const angle = ((i * 7 + j * 13) % 12) * (Math.PI / 6);
          dx = Math.cos(angle) * 0.5;
          dy = Math.sin(angle) * 0.5;
          distSq = dx * dx + dy * dy;
        }
        const dist = Math.sqrt(distSq);
        const push = (minDist - dist) * 0.5 + 0.05;
        const nx = dx / dist;
        const ny = dy / dist;
        a.position.x -= nx * push;
        a.position.y -= ny * push;
        b.position.x += nx * push;
        b.position.y += ny * push;
        overlapsResolved += 1;
      }
    }
  }
  return overlapsResolved;
}

export function stepSquadTacticalFormation(
  units: TacticalUnitState[],
  leaderPos: ReadonlyVec2,
  facingAngleRad: number,
  dt: number,
): void {
  const slots = computeTacticalFormationSlots(
    leaderPos,
    facingAngleRad,
    units.map((u) => u.role),
    MINIMUM_SQUAD_SEPARATION_PX,
  );
  const safeDt = Math.min(0.05, Math.max(0.001, dt));
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    if (unit.hp <= 0) continue;
    const slot = slots[i];
    const dx = slot.offset.x - unit.position.x;
    const dy = slot.offset.y - unit.position.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 2) {
      const speed = Math.min(unit.maxSpeed, dist / safeDt);
      unit.velocity.x = (dx / dist) * speed;
      unit.velocity.y = (dy / dist) * speed;
      unit.position.x += unit.velocity.x * safeDt;
      unit.position.y += unit.velocity.y * safeDt;
    } else {
      unit.velocity.x = 0;
      unit.velocity.y = 0;
    }
  }
  resolveSquadSeparation(units, MINIMUM_SQUAD_SEPARATION_PX, 2);
}
