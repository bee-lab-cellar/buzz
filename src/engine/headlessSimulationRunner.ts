/**
 * File 61 / 100 — Headless 3,600-Frame (60s @ 60Hz) Deterministic Omniverse Stress Simulation Runner.
 *
 * Integrates:
 * - 1,000-Act Blueprint Registry (`getOmniverseActBlueprint`)
 * - Dijkstra Flow-Field + 26px Boids Separation (`buildFlowField`, `stepArmyBoidsOnFlowField`)
 * - 2D Verlet Spring-Mass Cloth (`createNyxStarryCloakRig`, `integrateNodes`, `applyWindVector`, `solveDistanceConstraints`)
 * - Cellular Fluid & Fire Reaction Automaton (`CellularFluidAndFireSim`)
 * - Boss Behavior Tree AI (`createNightmareBossBehaviorTree`)
 * - Zero-Lag VFX Ring Buffer (`ZeroLagVfxRingBuffer`)
 * - Deterministic 60Hz Replay Engine + IEEE-802.3 CRC32 Checksum (`DeterministicReplayRecorder`)
 *
 * Zero DOM dependencies, ZERO `any` types, zero NaN tolerance!
 */

import { getOmniverseActBlueprint } from '../data/arc10_acts901to1000';
import {
  buildFlowField,
  stepArmyBoidsOnFlowField,
  type BoidAgent,
} from '../math/flowFieldArmyPathfinder';
import {
  applyWindVector,
  createNyxStarryCloakRig,
  integrateNodes,
  solveDistanceConstraints,
} from '../math/verletCapeAndManePhysics';
import { CellularFluidAndFireSim } from '../math/cellularFluidAndFireSim';
import { DeterministicReplayRecorder } from '../math/deterministicReplayEngine';
import { createNightmareBossBehaviorTree } from '../ai/bossBehaviorTrees';
import {
  INPUT_BIT_ATTACK,
  INPUT_BIT_DODGE,
  INPUT_BIT_ELIXIR,
  INPUT_BIT_WAR_HORN,
} from '../types/combat';
import type { BehaviorBlackboard } from '../types/ai';
import { ZeroLagVfxRingBuffer } from './zeroLagVfxRingBuffer';
import { canUnlockExitPortal } from './kingdomWarAndCounterWaves';

export interface HeadlessSimSummary {
  readonly actId: number;
  readonly seed: number;
  readonly framesSimulated: number;
  readonly nanCount: number;
  readonly totalVfxEmitted: number;
  readonly activeVfxAtEnd: number;
  readonly bossFinalHp: number;
  readonly bossDefeated: boolean;
  readonly portalUnlockedAtEnd: boolean;
  readonly obsidianReactions: number;
  readonly replayFrameCount: number;
  readonly replayChecksumHex: string;
  readonly finalHeroX: number;
  readonly finalHeroY: number;
}

function nextMulberry32(state: { seed: number }): number {
  state.seed = (state.seed + 0x6d2b79f5) | 0;
  let t = Math.imul(state.seed ^ (state.seed >>> 15), 1 | state.seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function runHeadless3600FrameSimulation(
  actId: number,
  seed = 1337,
  totalFrames = 3600,
): HeadlessSimSummary {
  const clampedAct = Math.max(1, Math.min(1000, Math.floor(actId)));
  const blueprint = getOmniverseActBlueprint(clampedAct);
  const rngState = { seed: (seed ^ (clampedAct * 2654435761)) >>> 0 };
  const dt = 1 / 60;

  // 24x14 dry-land arena with a central river and wide bridge
  const tileGrid: number[][] = [];
  for (let r = 0; r < 14; r++) {
    const row: number[] = [];
    for (let c = 0; c < 24; c++) {
      const isBorder = r === 0 || r === 13 || c === 0 || c === 23;
      const isRiver = c === 12 && r >= 1 && r <= 12;
      const isBridge = c === 12 && (r === 6 || r === 7);
      row.push(isBorder ? 1 : isBridge ? 3 : isRiver ? 2 : 0);
    }
    tileGrid.push(row);
  }

  const flowField = buildFlowField(tileGrid, { col: 19, row: 7 });
  const squad: BoidAgent[] = [];
  for (let i = 0; i < 10; i++) {
    squad.push({
      id: `sim_ally_${i}`,
      position: { x: 48 + (i % 5) * 28, y: 80 + Math.floor(i / 5) * 32 },
      velocity: { x: 0, y: 0 },
      radius: 7,
      maxSpeed: 64,
    });
  }

  const cape = createNyxStarryCloakRig({ x: 80, y: 120 });
  const fluid = new CellularFluidAndFireSim(24, 14);
  fluid.setCell(6, 5, 'water');
  fluid.setCell(7, 5, 'lava');

  const vfx = new ZeroLagVfxRingBuffer();
  const bossBt = createNightmareBossBehaviorTree(blueprint.arcId);
  const recorder = new DeterministicReplayRecorder();
  recorder.startRecording(clampedAct, 'nyx', seed);

  let heroX = blueprint.heroSpawnCol * 16 + 8;
  let heroY = blueprint.heroSpawnRow * 16 + 8;
  let heroHp = 1000;
  const bossMaxHp = 3200 + clampedAct * 24;
  let bossHp = bossMaxHp;
  let bossX = 288;
  let bossY = 112;
  let normalEnemiesAlive = 6;
  let uncapturedBanners = 2;
  let totalVfxEmitted = 0;
  let nanCount = 0;
  let obsidianReactions = 0;

  const bossBlackboard: BehaviorBlackboard = {
    selfId: `boss_act_${clampedAct}`,
    actId: clampedAct,
    arcId: blueprint.arcId,
    selfPos: { x: bossX, y: bossY },
    selfHp: bossHp,
    selfMaxHp: bossMaxHp,
    targetPos: { x: heroX, y: heroY },
    targetDistancePx: Math.hypot(heroX - bossX, heroY - bossY),
    inLineOfSight: true,
    enraged: false,
    isStunned: false,
    cooldownSec: 0,
    elixirActive: false,
    chosenAction: 'idle',
    memoryFlags: {},
  };

  for (let frame = 0; frame < totalFrames; frame++) {
    const moveX: -1 | 0 | 1 = frame % 120 < 80 ? 1 : -1;
    const sinY = Math.sin(frame * 0.04);
    const moveY: -1 | 0 | 1 = sinY > 0.35 ? 1 : sinY < -0.35 ? -1 : 0;
    const attackPressed = frame % 18 === 0;
    let actionMask = 0;
    if (attackPressed) actionMask |= INPUT_BIT_ATTACK;
    if (frame % 90 === 0) actionMask |= INPUT_BIT_DODGE;
    if (frame === 600) actionMask |= INPUT_BIT_ELIXIR;
    if (frame === 900) actionMask |= INPUT_BIT_WAR_HORN;

    recorder.recordFrame({
      tick: frame,
      moveX,
      moveY,
      actionMask,
      swapSlot: 0,
      aimDeciDeg: (frame * 12) % 3600,
    });

    heroX = Math.max(24, Math.min(360, heroX + moveX * 42 * dt));
    heroY = Math.max(24, Math.min(200, heroY + moveY * 36 * dt));

    // Step Verlet cape attached to hero
    integrateNodes(cape, dt, { x: heroX, y: heroY });
    applyWindVector(cape, { x: -45 + Math.cos(frame * 0.05) * 18, y: 12 }, dt);
    solveDistanceConstraints(cape);

    // Step Flow-Field army
    stepArmyBoidsOnFlowField(squad, flowField, tileGrid, 16, dt);

    // Step Cellular fluid automaton periodically
    if (frame % 6 === 0) {
      const reactions = fluid.step();
      for (let r = 0; r < reactions.length; r++) {
        if (reactions[r].reaction === 'lava_water_obsidian') {
          obsidianReactions += 1;
        }
      }
    }

    // Step Boss AI & combat
    if (bossHp > 0) {
      bossBlackboard.selfPos.x = bossX;
      bossBlackboard.selfPos.y = bossY;
      bossBlackboard.selfHp = bossHp;
      bossBlackboard.targetPos = { x: heroX, y: heroY };
      bossBlackboard.targetDistancePx = Math.hypot(heroX - bossX, heroY - bossY);
      bossBt.tick(bossBlackboard, dt);
      bossX = Math.max(48, Math.min(352, bossBlackboard.selfPos.x));
      bossY = Math.max(32, Math.min(192, bossBlackboard.selfPos.y));

      if (attackPressed) {
        const dmg = 55 + Math.floor(nextMulberry32(rngState) * 45);
        bossHp = Math.max(0, bossHp - dmg);
        vfx.emit(
          { x: bossX, y: bossY },
          { x: 18, y: -22 },
          0.35,
          3,
          '#facc15',
          'spark',
        );
        totalVfxEmitted += 1;
      }
    }

    // Gradually clear normal enemies & banners during the 60s engagement
    if (frame > 0 && frame % 300 === 0 && normalEnemiesAlive > 0) {
      normalEnemiesAlive -= 1;
    }
    if (frame === 1200 || frame === 2200) {
      uncapturedBanners = Math.max(0, uncapturedBanners - 1);
    }

    vfx.update(dt);

    if (
      !Number.isFinite(heroX) ||
      !Number.isFinite(heroY) ||
      !Number.isFinite(heroHp) ||
      !Number.isFinite(bossHp) ||
      !Number.isFinite(cape.nodes[cape.nodes.length - 1].x)
    ) {
      nanCount += 1;
    }

    if (heroHp < 300) {
      heroHp = 1000;
    }
  }

  const replay = recorder.stopAndExport();
  const portalCheck = canUnlockExitPortal({
    normalEnemiesAlive,
    hasBoss: true,
    bossDefeated: bossHp <= 0,
    uncapturedBanners,
    isSanctuaryAct: blueprint.isSanctuary,
  });

  return {
    actId: clampedAct,
    seed,
    framesSimulated: totalFrames,
    nanCount,
    totalVfxEmitted,
    activeVfxAtEnd: vfx.getActiveParticleCount(),
    bossFinalHp: bossHp,
    bossDefeated: bossHp <= 0,
    portalUnlockedAtEnd: portalCheck.unlocked,
    obsidianReactions,
    replayFrameCount: replay.totalTicks,
    replayChecksumHex: replay.checksumHex,
    finalHeroX: Number(heroX.toFixed(2)),
    finalHeroY: Number(heroY.toFixed(2)),
  };
}
