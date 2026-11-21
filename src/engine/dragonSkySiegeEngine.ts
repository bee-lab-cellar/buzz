/**
 * Pillar 2 — Bespoke Dragon Sky-Siege Engine (Arc III: Acts 83–122)
 *
 * Implements:
 * - 4-Part Breakable Anatomy (`wings`, `severableTail`, `chestCore`, `head 3.0x`)
 * - Sky-Flight Shadow Mode + 4 Corner Harpoon Ballistas (`[E]`)
 * - Magnetic Hoard-Vacuum Gold Theft & Recovery on Tail Sever
 * - Updraft Geyser Dragon-Back Mounting Phase
 */

import type { ArticulatedDragonAnatomy, DragonAnatomyPartId } from '../types/combat';
import type { Vec2 } from '../types/math';
import { createStructuredDragonAnatomy } from '../sprites/bossAndDragonMatrices';

export interface CornerHarpoonBallista {
  readonly id: 'nw' | 'ne' | 'sw' | 'se';
  readonly position: Vec2;
  cooldownSec: number;
  ready: boolean;
}

export interface DragonSkySiegeSession {
  readonly bossName: string;
  bossPosition: Vec2;
  shadowPosition: Vec2;
  isAirborne: boolean;
  flightRemainingSec: number;
  groundedStaggerSec: number;
  hoardVacuumActive: boolean;
  stolenGoldHoard: number;
  mountedRemainingSec: number;
  anatomy: ArticulatedDragonAnatomy;
  ballistas: CornerHarpoonBallista[];
}

export function createDragonSkySiegeSession(
  bossName: string,
  bossMaxHp: number,
  arenaW = 480,
  arenaH = 270,
): DragonSkySiegeSession {
  const m = 42;
  return {
    bossName,
    bossPosition: { x: arenaW * 0.5, y: arenaH * 0.44 },
    shadowPosition: { x: arenaW * 0.5, y: arenaH * 0.54 },
    isAirborne: false,
    flightRemainingSec: 0,
    groundedStaggerSec: 0,
    hoardVacuumActive: false,
    stolenGoldHoard: 0,
    mountedRemainingSec: 0,
    anatomy: createStructuredDragonAnatomy(bossMaxHp),
    ballistas: [
      { id: 'nw', position: { x: m, y: m }, cooldownSec: 0, ready: true },
      { id: 'ne', position: { x: arenaW - m, y: m }, cooldownSec: 0, ready: true },
      { id: 'sw', position: { x: m, y: arenaH - m }, cooldownSec: 0, ready: true },
      { id: 'se', position: { x: arenaW - m, y: arenaH - m }, cooldownSec: 0, ready: true },
    ],
  };
}

export function enterDragonSkyFlightMode(session: DragonSkySiegeSession, durationSec = 9.0): boolean {
  if (session.anatomy.wings.broken) return false; // Broken wings permanently prevent flight!
  session.isAirborne = true;
  session.flightRemainingSec = durationSec;
  return true;
}

export function fireBallistaE(
  session: DragonSkySiegeSession,
  playerPos: Vec2,
): { readonly fired: boolean; readonly skyCrashTriggered: boolean } {
  for (let i = 0; i < session.ballistas.length; i++) {
    const b = session.ballistas[i];
    if (!b.ready) continue;
    if (Math.hypot(playerPos.x - b.position.x, playerPos.y - b.position.y) <= 36) {
      b.ready = false;
      b.cooldownSec = 8.5;
      const skyCrash = session.isAirborne;
      if (skyCrash) {
        session.isAirborne = false;
        session.flightRemainingSec = 0;
        session.groundedStaggerSec = 4.5;
        session.anatomy.wings.hp = Math.max(
          0,
          session.anatomy.wings.hp - Math.round(session.anatomy.wings.maxHp * 0.5),
        );
        if (session.anatomy.wings.hp <= 0) {
          session.anatomy.wings.broken = true;
        }
      }
      return { fired: true, skyCrashTriggered: skyCrash };
    }
  }
  return { fired: false, skyCrashTriggered: false };
}

export function strikeDragonAnatomyPart(
  session: DragonSkySiegeSession,
  partId: DragonAnatomyPartId,
  rawDamage: number,
): { readonly damageDealt: number; readonly partBrokenNow: boolean; readonly goldRecovered: number } {
  const part =
    partId === 'wings'
      ? session.anatomy.wings
      : partId === 'severable_tail'
        ? session.anatomy.severableTail
        : partId === 'chest_core'
          ? session.anatomy.chestCore
          : session.anatomy.head;

  const mult = session.mountedRemainingSec > 0 ? part.critMultiplier * 1.25 : part.critMultiplier;
  const dmg = Math.max(1, Math.round(rawDamage * mult));
  const wasBroken = part.broken;
  part.hp = Math.max(0, part.hp - dmg);
  if (part.hp <= 0) {
    part.broken = true;
  }
  const brokenNow = !wasBroken && part.broken;

  let goldRecovered = 0;
  if (brokenNow && partId === 'severable_tail' && session.stolenGoldHoard > 0) {
    goldRecovered = session.stolenGoldHoard;
    session.stolenGoldHoard = 0;
  }

  return { damageDealt: dmg, partBrokenNow: brokenNow, goldRecovered };
}

export function triggerUpdraftDragonMount(session: DragonSkySiegeSession): boolean {
  if (session.mountedRemainingSec > 0) return false;
  session.mountedRemainingSec = 5.0;
  return true;
}

export function stepDragonSkySiege(session: DragonSkySiegeSession, dt: number): void {
  if (session.groundedStaggerSec > 0) {
    session.groundedStaggerSec = Math.max(0, session.groundedStaggerSec - dt);
  }
  if (session.mountedRemainingSec > 0) {
    session.mountedRemainingSec = Math.max(0, session.mountedRemainingSec - dt);
  }
  if (session.isAirborne) {
    session.flightRemainingSec = Math.max(0, session.flightRemainingSec - dt);
    if (session.flightRemainingSec <= 0) {
      session.isAirborne = false;
    }
  }
  for (let i = 0; i < session.ballistas.length; i++) {
    const b = session.ballistas[i];
    if (!b.ready) {
      b.cooldownSec = Math.max(0, b.cooldownSec - dt);
      if (b.cooldownSec <= 0) b.ready = true;
    }
  }
}
