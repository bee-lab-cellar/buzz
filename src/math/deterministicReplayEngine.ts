/**
 * Pillar 1 — Deterministic 60Hz Fixed-Timestep Input Recorder & Replay Serializer
 *
 * Records a battle's Mulberry32 RNG seed, Act ID, Hero ID, and per-tick quantized inputs
 * so `[🎬 Watch Saved Replay]` reproduces Boss Fights & Kingdom Wars frame-for-frame!
 * Zero `any` types.
 */

import { Mulberry32, type DeterministicRNG, type FixedTimestepState } from '../types/math';
import type { DeterministicInputFrame, PlayableHeroId } from '../types/combat';

export const FIXED_STEP_HZ = 60;
export const FIXED_DELTA_SEC = 1 / FIXED_STEP_HZ;
const REPLAY_PREFIX = 'COTCR1:';
const REPLAY_STORAGE_KEY = 'cotc_last_saved_replay_v7';

export interface RecordedBattleReplay {
  readonly schemaVersion: 1;
  readonly actId: number;
  readonly heroId: PlayableHeroId;
  readonly seed: number;
  readonly recordedAtIso: string;
  readonly totalTicks: number;
  readonly frames: ReadonlyArray<DeterministicInputFrame>;
  readonly checksumHex: string;
}

export function createFixedTimestepState(maxSubSteps = 4): FixedTimestepState {
  return {
    fixedDeltaSec: FIXED_DELTA_SEC,
    accumulatorSec: 0,
    tickCount: 0,
    alpha: 0,
    maxSubSteps,
  };
}

/**
 * Advances a deterministic fixed-timestep simulation loop cleanly at 60Hz.
 */
export function advanceFixedTimestep(
  stepper: FixedTimestepState,
  frameDeltaSec: number,
  onFixedTick: (tick: number, fixedDt: number) => void,
): number {
  const clampedDt = Math.min(0.1, Math.max(0, frameDeltaSec));
  stepper.accumulatorSec += clampedDt;

  let stepsRun = 0;
  while (stepper.accumulatorSec >= stepper.fixedDeltaSec && stepsRun < stepper.maxSubSteps) {
    onFixedTick(stepper.tickCount, stepper.fixedDeltaSec);
    stepper.tickCount += 1;
    stepper.accumulatorSec -= stepper.fixedDeltaSec;
    stepsRun += 1;
  }

  stepper.alpha = stepper.accumulatorSec / stepper.fixedDeltaSec;
  return stepsRun;
}

export class DeterministicReplayRecorder {
  private actId = 1;
  private heroId: PlayableHeroId = 'nyx';
  private seed = 1337;
  private recording = false;
  private totalTicks = 0;
  private readonly frames: DeterministicInputFrame[] = [];

  public startRecording(actId: number, heroId: PlayableHeroId, seed: number): DeterministicRNG {
    this.actId = actId;
    this.heroId = heroId;
    this.seed = (seed >>> 0) || 1337;
    this.recording = true;
    this.totalTicks = 0;
    this.frames.length = 0;
    return new Mulberry32(this.seed);
  }

  public recordFrame(frame: DeterministicInputFrame): void {
    if (!this.recording) return;
    // Delta-compress: store frame only when inputs are non-idle or change from previous tick
    const prev = this.frames[this.frames.length - 1];
    const changed =
      !prev ||
      prev.moveX !== frame.moveX ||
      prev.moveY !== frame.moveY ||
      prev.actionMask !== frame.actionMask ||
      prev.swapSlot !== frame.swapSlot ||
      prev.aimDeciDeg !== frame.aimDeciDeg;
    if (changed) {
      this.frames.push({ ...frame });
    }
    this.totalTicks = Math.max(this.totalTicks, frame.tick + 1);
  }

  public stopAndExport(): RecordedBattleReplay {
    this.recording = false;
    const base = {
      schemaVersion: 1 as const,
      actId: this.actId,
      heroId: this.heroId,
      seed: this.seed,
      recordedAtIso: new Date().toISOString(),
      totalTicks: this.totalTicks,
      frames: [...this.frames],
    };
    const crc = computeReplayCrc32({ ...base, checksumHex: '' });
    return {
      ...base,
      checksumHex: crc.toString(16).toUpperCase().padStart(8, '0'),
    };
  }

  public isRecording(): boolean {
    return this.recording;
  }
}

export class DeterministicReplayPlayer {
  private readonly replay: RecordedBattleReplay;
  private cursor = 0;
  private activeFrame: DeterministicInputFrame = {
    tick: 0,
    moveX: 0,
    moveY: 0,
    actionMask: 0,
    swapSlot: 0,
    aimDeciDeg: 0,
  };
  public readonly rng: DeterministicRNG;

  constructor(replay: RecordedBattleReplay) {
    this.replay = replay;
    this.rng = new Mulberry32(replay.seed);
  }

  public getInputForTick(tick: number): DeterministicInputFrame {
    while (
      this.cursor < this.replay.frames.length &&
      this.replay.frames[this.cursor].tick <= tick
    ) {
      this.activeFrame = this.replay.frames[this.cursor];
      this.cursor += 1;
    }
    return {
      ...this.activeFrame,
      tick,
    };
  }

  public isFinished(tick: number): boolean {
    return tick >= this.replay.totalTicks;
  }

  public getMetadata(): Pick<RecordedBattleReplay, 'actId' | 'heroId' | 'seed' | 'totalTicks'> {
    return {
      actId: this.replay.actId,
      heroId: this.replay.heroId,
      seed: this.replay.seed,
      totalTicks: this.replay.totalTicks,
    };
  }
}

export function serializeReplay(replay: RecordedBattleReplay): string {
  const json = JSON.stringify(replay);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return REPLAY_PREFIX + btoa(bin);
}

export function deserializeReplay(encoded: string): RecordedBattleReplay | null {
  const trimmed = encoded.trim();
  if (!trimmed.startsWith(REPLAY_PREFIX)) return null;
  try {
    const bin = atob(trimmed.slice(REPLAY_PREFIX.length));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== 'object') return null;
    const rec = parsed as Record<string, unknown>;
    if (
      rec.schemaVersion !== 1 ||
      typeof rec.actId !== 'number' ||
      typeof rec.seed !== 'number' ||
      typeof rec.totalTicks !== 'number' ||
      !Array.isArray(rec.frames)
    ) {
      return null;
    }
    return parsed as RecordedBattleReplay;
  } catch {
    return null;
  }
}

export function saveLastReplayToStorage(replay: RecordedBattleReplay): string {
  const encoded = serializeReplay(replay);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(REPLAY_STORAGE_KEY, encoded);
    } catch {
      // Ignore storage limits
    }
  }
  return encoded;
}

export function loadLastReplayFromStorage(): RecordedBattleReplay | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(REPLAY_STORAGE_KEY);
    if (!raw) return null;
    return deserializeReplay(raw);
  } catch {
    return null;
  }
}

const CRC32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

export function computeCrc32Hex(input: string): string {
  let crc = 0xffffffff;
  for (let i = 0; i < input.length; i++) {
    crc = CRC32_TABLE[(crc ^ input.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

export function computeReplayCrc32(replay: RecordedBattleReplay): number {
  const canonical = JSON.stringify({
    actId: replay.actId,
    heroId: replay.heroId,
    seed: replay.seed,
    totalTicks: replay.totalTicks,
    frames: replay.frames,
  });
  let crc = 0xffffffff;
  for (let i = 0; i < canonical.length; i++) {
    crc = CRC32_TABLE[(crc ^ canonical.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function verifyReplayChecksum(
  replay: RecordedBattleReplay,
  expectedCrc32?: number,
): boolean {
  const computed = computeReplayCrc32(replay);
  if (expectedCrc32 !== undefined) {
    return computed === (expectedCrc32 >>> 0);
  }
  const computedHex = computed.toString(16).toUpperCase().padStart(8, '0');
  return replay.checksumHex === computedHex;
}

