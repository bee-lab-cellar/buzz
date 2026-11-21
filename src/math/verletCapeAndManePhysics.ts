/**
 * Layer 1 — 2D Verlet Integration Spring-Mass Cloth & Mane Physics Engine
 *
 * Dynamically animates:
 * - Nyx's Starry Cloak & Crooked Wizard Hat Tip
 * - King Leo's 360° Golden Lion Mane Strands & Crimson Royal Cape
 * - Wolf-King Fenrir's Eclipse Scarf
 * - Kingdom War Banners reacting to movement velocity and biome wind gusts
 *
 * Pure deterministic math (`ZERO any`), bounded stability, convergence guaranteed
 * under repeated distance-constraint relaxation passes.
 */

import type { ReadonlyVec2, Vec2, VerletClothRig, VerletNode, VerletStick } from '../types/math';

export interface BiomeWindField {
  readonly baseWindX: number;
  readonly baseWindY: number;
  readonly gustAmplitude: number;
  readonly gustFrequencyHz: number;
}

export function createVerletChainRig(
  id: string,
  kind: VerletClothRig['kind'],
  anchor: ReadonlyVec2,
  segmentCount: number,
  segmentLength: number,
  options: {
    readonly damping?: number;
    readonly gravityY?: number;
    readonly stiffness?: number;
    readonly constraintIterations?: number;
    readonly initialDirX?: number;
    readonly initialDirY?: number;
  } = {},
): VerletClothRig {
  const count = Math.max(2, Math.floor(segmentCount));
  const dirX = options.initialDirX ?? -1;
  const dirY = options.initialDirY ?? 0.35;
  const dirLen = Math.hypot(dirX, dirY) || 1;
  const nx = dirX / dirLen;
  const ny = dirY / dirLen;

  const nodes: VerletNode[] = [];
  const sticks: VerletStick[] = [];

  for (let i = 0; i < count; i++) {
    const x = anchor.x + nx * segmentLength * i;
    const y = anchor.y + ny * segmentLength * i;
    nodes.push({
      x,
      y,
      oldX: x,
      oldY: y,
      pinned: i === 0,
      mass: 1.0,
    });
    if (i > 0) {
      sticks.push({
        indexA: i - 1,
        indexB: i,
        restLength: segmentLength,
        stiffness: options.stiffness ?? 0.96,
      });
    }
  }

  return {
    id,
    kind,
    nodes,
    sticks,
    damping: options.damping ?? 0.94,
    gravityY: options.gravityY ?? 180,
    constraintIterations: options.constraintIterations ?? 6,
  };
}

export function createNyxStarryCloakRig(anchor: ReadonlyVec2): VerletClothRig {
  return createVerletChainRig('nyx_starry_cloak', 'nyx_cloak', anchor, 6, 4.5, {
    damping: 0.92,
    gravityY: 145,
    stiffness: 0.98,
    constraintIterations: 7,
  });
}

export function createKingLeoCapeAndManeRig(anchor: ReadonlyVec2): {
  readonly crimsonCape: VerletClothRig;
  readonly goldenManeTop: VerletClothRig;
  readonly goldenManeSide: VerletClothRig;
} {
  return {
    crimsonCape: createVerletChainRig('king_leo_crimson_cape', 'king_leo_cape', anchor, 7, 5.2, {
      damping: 0.93,
      gravityY: 175,
      stiffness: 0.98,
      constraintIterations: 8,
    }),
    goldenManeTop: createVerletChainRig('king_leo_mane_top', 'king_leo_mane', { x: anchor.x, y: anchor.y - 8 }, 4, 3.2, {
      damping: 0.88,
      gravityY: 95,
      stiffness: 0.99,
      constraintIterations: 6,
    }),
    goldenManeSide: createVerletChainRig('king_leo_mane_side', 'king_leo_mane', { x: anchor.x - 4, y: anchor.y - 4 }, 4, 3.4, {
      damping: 0.88,
      gravityY: 110,
      stiffness: 0.99,
      constraintIterations: 6,
    }),
  };
}

export function createFenrirWolfScarfRig(anchor: ReadonlyVec2): VerletClothRig {
  return createVerletChainRig('fenrir_wolf_scarf', 'fenrir_scarf', anchor, 6, 4.8, {
    damping: 0.91,
    gravityY: 135,
    stiffness: 0.97,
    constraintIterations: 6,
  });
}

export function createWarBannerRig(id: string, poleTopAnchor: ReadonlyVec2): VerletClothRig {
  return createVerletChainRig(id, 'war_banner', poleTopAnchor, 6, 5.0, {
    damping: 0.94,
    gravityY: 120,
    stiffness: 0.98,
    constraintIterations: 7,
    initialDirX: 1,
    initialDirY: 0.2,
  });
}

/**
 * Evaluates instantaneous biome wind vector at a given simulation time.
 */
export function sampleBiomeWind(wind: BiomeWindField, timeSec: number, nodeIndex = 0): Vec2 {
  const wave = Math.sin(timeSec * wind.gustFrequencyHz * Math.PI * 2 + nodeIndex * 0.65);
  return {
    x: wind.baseWindX + wave * wind.gustAmplitude,
    y: wind.baseWindY + Math.cos(timeSec * wind.gustFrequencyHz * 1.4 + nodeIndex * 0.5) * (wind.gustAmplitude * 0.25),
  };
}

/**
 * Applies wind acceleration impulse into unpinned Verlet nodes by shifting previous positions.
 */
export function applyWindVector(
  rig: VerletClothRig,
  windForce: ReadonlyVec2,
  dt: number,
): void {
  const dtSq = dt * dt;
  for (let i = 0; i < rig.nodes.length; i++) {
    const node = rig.nodes[i];
    if (node.pinned) continue;
    const invMass = 1 / Math.max(0.05, node.mass);
    // Tips catch slightly more wind flutter than root joints
    const flutterScale = 0.65 + (i / Math.max(1, rig.nodes.length - 1)) * 0.7;
    node.x += windForce.x * invMass * flutterScale * dtSq;
    node.y += windForce.y * invMass * flutterScale * dtSq;
  }
}

/**
 * Standard Velocity-Verlet positional integration with damping and gravity.
 */
export function integrateNodes(
  rig: VerletClothRig,
  dt: number,
  pinAnchor?: ReadonlyVec2,
): void {
  const safeDt = Math.min(0.05, Math.max(1e-4, dt));
  const dtSq = safeDt * safeDt;

  for (let i = 0; i < rig.nodes.length; i++) {
    const n = rig.nodes[i];
    if (n.pinned) {
      if (pinAnchor && i === 0) {
        n.x = pinAnchor.x;
        n.y = pinAnchor.y;
        n.oldX = pinAnchor.x;
        n.oldY = pinAnchor.y;
      }
      continue;
    }

    const vx = (n.x - n.oldX) * rig.damping;
    const vy = (n.y - n.oldY) * rig.damping;
    n.oldX = n.x;
    n.oldY = n.y;
    n.x += vx;
    n.y += vy + rig.gravityY * dtSq;
  }
}

/**
 * Iterative Jakobsen distance-constraint solver.
 * Converges stick lengths smoothly toward exact restLength without overshoot.
 */
export function solveDistanceConstraints(
  rig: VerletClothRig,
  iterationsOverride?: number,
): number {
  const iters = Math.max(1, iterationsOverride ?? rig.constraintIterations);
  let maxResidualError = 0;

  for (let iter = 0; iter < iters; iter++) {
    maxResidualError = 0;
    for (let s = 0; s < rig.sticks.length; s++) {
      const stick = rig.sticks[s];
      const a = rig.nodes[stick.indexA];
      const b = rig.nodes[stick.indexB];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 1e-8) continue;

      const diff = (dist - stick.restLength) / dist;
      const corrX = dx * diff * stick.stiffness;
      const corrY = dy * diff * stick.stiffness;

      if (a.pinned && !b.pinned) {
        b.x -= corrX;
        b.y -= corrY;
      } else if (!a.pinned && b.pinned) {
        a.x += corrX;
        a.y += corrY;
      } else if (!a.pinned && !b.pinned) {
        a.x += corrX * 0.5;
        a.y += corrY * 0.5;
        b.x -= corrX * 0.5;
        b.y -= corrY * 0.5;
      }

      const postDist = Math.hypot(b.x - a.x, b.y - a.y);
      const err = Math.abs(postDist - stick.restLength);
      if (err > maxResidualError) {
        maxResidualError = err;
      }
    }
  }

  return maxResidualError;
}

/**
 * Full single-frame cloth step: pin anchor -> integrate -> apply biome wind & hero slipstream -> solve sticks.
 */
export function stepVerletClothRig(
  rig: VerletClothRig,
  anchorPos: ReadonlyVec2,
  heroVelocity: ReadonlyVec2,
  wind: BiomeWindField,
  timeSec: number,
  dt: number,
): number {
  integrateNodes(rig, dt, anchorPos);
  const gust = sampleBiomeWind(wind, timeSec, 0);
  // Hero movement creates opposite slipstream drag on capes & manes
  applyWindVector(
    rig,
    {
      x: gust.x - heroVelocity.x * 3.8,
      y: gust.y - heroVelocity.y * 1.4,
    },
    dt,
  );
  return solveDistanceConstraints(rig);
}

/**
 * Computes the maximum stick length deviation across all constraints (used by physics tests).
 */
export function measureMaxStickError(rig: VerletClothRig): number {
  let maxErr = 0;
  for (let i = 0; i < rig.sticks.length; i++) {
    const s = rig.sticks[i];
    const a = rig.nodes[s.indexA];
    const b = rig.nodes[s.indexB];
    const err = Math.abs(Math.hypot(b.x - a.x, b.y - a.y) - s.restLength);
    if (err > maxErr) maxErr = err;
  }
  return maxErr;
}
