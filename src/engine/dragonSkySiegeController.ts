/**
 * Dragon Sky-Siege & Harpoon Ballista Controller (Arc III Acts 83–122):
 * - Multi-Part Dragon Anatomy targeting (`HEAD 2.0x Crit`, `WINGS Grounding`, `TAIL Sweep Disable`, `HEART 3.0x Weak-Point`)
 * - Interactive Harpoon Ballista Turrets (`[E]` to fire Sky-Chain Harpoon -> `💥 SKY-CRASH! DRAGON GROUNDED (5s)!`)
 */

export type DragonAnatomyPart = 'HEAD' | 'WINGS' | 'TAIL' | 'HEART_CORE';

export interface DragonPartStrikeResult {
  part: DragonAnatomyPart;
  damageMultiplier: number;
  groundsDragonSec: number;
  disablesTailSweep: boolean;
  bannerText: string;
}

export function evaluateDragonAnatomyStrike(
  relX: number,
  relY: number,
  isGrounded: boolean
): DragonPartStrikeResult {
  if (isGrounded && Math.abs(relX) < 10 && Math.abs(relY) < 10) {
    return {
      part: 'HEART_CORE',
      damageMultiplier: 3.0,
      groundsDragonSec: 0,
      disablesTailSweep: false,
      bannerText: '💎 HEART CORE CRIT! (3.0x)'
    };
  }
  if (relY < -8) {
    return {
      part: 'HEAD',
      damageMultiplier: 2.0,
      groundsDragonSec: 0,
      disablesTailSweep: false,
      bannerText: '🐲 DRAGON HEAD STRIKE! (2.0x)'
    };
  }
  if (Math.abs(relX) > 12) {
    return {
      part: 'WINGS',
      damageMultiplier: 1.35,
      groundsDragonSec: 3.5,
      disablesTailSweep: false,
      bannerText: '🪽 WING SHREDDED! WYRM GROUNDED!'
    };
  }
  return {
    part: 'TAIL',
    damageMultiplier: 1.25,
    groundsDragonSec: 0,
    disablesTailSweep: true,
    bannerText: '⚔️ TAIL SEVERED! SWEEP DISABLED!'
  };
}
