/**
 * Wave 5 Automated Vitest Suite #5 (16 Strict Tests):
 * 60Hz Deterministic Combat Replay Engine (Bit-Identical Dual-Run Verification + COTCR1 Serialization),
 * Mulberry32 PRNG Determinism, and 4-Layer iPad V8 Save Vault Anti-Overwrite Guard & Act 1..1,000 Scaling.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { Mulberry32 } from '../types/math';
import {
  INPUT_BIT_ATTACK,
  INPUT_BIT_DODGE,
  INPUT_BIT_ELIXIR,
  INPUT_BIT_WAR_HORN,
} from '../types/combat';
import {
  advanceFixedTimestep,
  createFixedTimestepState,
  deserializeReplay,
  DeterministicReplayPlayer,
  DeterministicReplayRecorder,
  serializeReplay,
  type RecordedBattleReplay,
} from '../math/deterministicReplayEngine';
import {
  createScaledActRestorePayload,
  exportVaultToSaveCode,
  importVaultFromSaveCode,
  loadSavedGame,
  resetInMemoryVaultForTests,
  saveToVault,
  upgradePayloadToV7,
  upgradePayloadToV8,
} from '../ui/ipadSaveVaultEngine';

interface MiniSimResult {
  readonly finalHeroX: number;
  readonly finalHeroY: number;
  readonly finalBossHp: number;
  readonly critsLanded: number;
}

function runDeterministicMiniCombat(replay: RecordedBattleReplay): MiniSimResult {
  const rng = new Mulberry32(replay.seed);
  const player = new DeterministicReplayPlayer(replay);
  let heroX = 120;
  let heroY = 140;
  let bossHp = 50_000;
  let critsLanded = 0;

  for (let tick = 0; tick < replay.totalTicks; tick++) {
    const f = player.getInputForTick(tick);
    heroX += f.moveX * 2.25;
    heroY += f.moveY * 2.25;
    if ((f.actionMask & INPUT_BIT_ATTACK) !== 0) {
      const isCrit = rng.nextFloat() < 0.35;
      const dmg = isCrit ? 480 : 210;
      if (isCrit) critsLanded += 1;
      bossHp = Math.max(0, bossHp - dmg);
    }
    if ((f.actionMask & INPUT_BIT_ELIXIR) !== 0) {
      bossHp = Math.max(0, bossHp - 750);
    }
  }
  return { finalHeroX: heroX, finalHeroY: heroY, finalBossHp: bossHp, critsLanded };
}

function buildTestReplay(actId: number, seed: number): RecordedBattleReplay {
  const rec = new DeterministicReplayRecorder();
  rec.startRecording(actId, 'nyx', seed);
  for (let tick = 0; tick < 180; tick++) {
    rec.recordFrame({
      tick,
      moveX: tick % 30 < 15 ? 1 : -1,
      moveY: tick % 20 < 10 ? 1 : 0,
      actionMask:
        (tick % 6 === 0 ? INPUT_BIT_ATTACK : 0) |
        (tick % 45 === 10 ? INPUT_BIT_DODGE : 0) |
        (tick === 90 ? INPUT_BIT_ELIXIR : 0) |
        (tick === 120 ? INPUT_BIT_WAR_HORN : 0),
      swapSlot: tick === 60 ? 2 : tick === 120 ? 4 : 0,
      aimDeciDeg: (tick * 25) % 3600,
    });
  }
  return rec.stopAndExport();
}

describe('Omniverse Suite 5 — 60Hz Deterministic Replay & 4-Layer iPad V8 Save Vault (16 Tests)', () => {
  beforeEach(() => {
    resetInMemoryVaultForTests();
  });

  it('01. Mulberry32 produces identical float sequences for identical seeds', () => {
    const a = new Mulberry32(0x12345678);
    const b = new Mulberry32(0x12345678);
    expect(Array.from({ length: 20 }, () => a.nextFloat())).toEqual(
      Array.from({ length: 20 }, () => b.nextFloat()),
    );
  });

  it('02. Mulberry32 diverges cleanly for distinct seeds', () => {
    const a = new Mulberry32(1001);
    const b = new Mulberry32(1002);
    expect(a.nextFloat()).not.toBe(b.nextFloat());
  });

  it('03. Fixed-timestep 60Hz accumulator executes exact expected ticks across frames with zero drift', () => {
    const st = createFixedTimestepState();
    const ticks: number[] = [];
    const c1 = advanceFixedTimestep(st, 0.05, (t) => ticks.push(t));
    const c2 = advanceFixedTimestep(st, 0.05, (t) => ticks.push(t));
    expect(c1 + c2).toBe(6);
    expect(ticks).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('04. Deterministic combat replay produces bit-identical final positions, crits & Boss HP across two runs', () => {
    const replay = buildTestReplay(1000, 777999);
    const run1 = runDeterministicMiniCombat(replay);
    const run2 = runDeterministicMiniCombat(replay);
    expect(run1).toEqual(run2);
    expect(run1.finalBossHp).toBeLessThan(50_000);
  });

  it('05. COTCR1 Base64 replay serialization round-trips identically and reproduces identical combat outcome', () => {
    const original = buildTestReplay(600, 314159);
    const encoded = serializeReplay(original);
    expect(encoded.startsWith('COTCR1:')).toBe(true);

    const decoded = deserializeReplay(encoded);
    expect(decoded).not.toBeNull();
    expect(runDeterministicMiniCombat(decoded!)).toEqual(runDeterministicMiniCombat(original));
  });

  it('06. deserializeReplay safely returns null for corrupted or forged replay strings', () => {
    expect(deserializeReplay('INVALID_HEADER')).toBeNull();
    expect(deserializeReplay('COTCR1:%%%NOT_BASE64%%%')).toBeNull();
  });

  it('07. iPad Save Vault Anti-Overwrite Guard STRICTLY BLOCKS Act 1 from overwriting Act 134', () => {
    const act134 = createScaledActRestorePayload(134);
    expect(saveToVault(act134).saved).toBe(true);

    const staleAct1 = { ...createScaledActRestorePayload(1), forceReset: undefined };
    const blocked = saveToVault(staleAct1);
    expect(blocked.saved).toBe(false);
    expect(blocked.blockedByGuard).toBe(true);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(134);
  });

  it('08. Anti-Overwrite Guard STRICTLY BLOCKS Act 134 from overwriting Act 750', () => {
    const act750 = createScaledActRestorePayload(750);
    expect(saveToVault(act750).saved).toBe(true);

    const olderAct134 = { ...createScaledActRestorePayload(134), forceReset: undefined };
    const blocked = saveToVault(olderAct134);
    expect(blocked.saved).toBe(false);
    expect(blocked.blockedByGuard).toBe(true);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(750);
  });

  it('09. Anti-Overwrite Guard PERMITS intentional downgrades ONLY when forceReset is explicitly true', () => {
    saveToVault(createScaledActRestorePayload(500));
    const resetRes = saveToVault({ ...createScaledActRestorePayload(1), forceReset: true });
    expect(resetRes.saved).toBe(true);
    expect(resetRes.blockedByGuard).toBe(false);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(1);
  });

  it('10. Anti-Overwrite Guard ALLOWS forward progression from Act 134 -> Act 450 -> Act 1,000 seamlessly', () => {
    expect(saveToVault(createScaledActRestorePayload(134)).saved).toBe(true);
    expect(saveToVault({ ...createScaledActRestorePayload(450), forceReset: undefined }).saved).toBe(true);
    expect(saveToVault({ ...createScaledActRestorePayload(1000), forceReset: undefined }).saved).toBe(true);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(1000);
  });

  it('11. createScaledActRestorePayload clamps out-of-range targets strictly into [1, 1000]', () => {
    expect(createScaledActRestorePayload(-50).currentAct).toBe(1);
    expect(createScaledActRestorePayload(9999).currentAct).toBe(1000);
  });

  it('12. createScaledActRestorePayload(1000) grants Tier 50 weapon & armor and all 4 heroes', () => {
    const p1000 = createScaledActRestorePayload(1000);
    expect(p1000.currentAct).toBe(1000);
    expect(p1000.clearedActs).toHaveLength(999);
    expect(p1000.equippedWeaponId).toBe('wpn_tier_50');
    expect(p1000.equippedArmorId).toBe('arm_tier_50');
    expect(p1000.unlockedHeroes).toEqual(['nyx', 'king_leo', 'fenrir', 'great_duck']);
  });

  it('13. COTC1 Save Code export/import round-trips Act 1,000 cleanly across fresh memory', () => {
    const p1000 = createScaledActRestorePayload(1000);
    const code = exportVaultToSaveCode(p1000);
    expect(code.startsWith('COTC1:')).toBe(true);

    resetInMemoryVaultForTests();
    const imported = importVaultFromSaveCode(code);
    expect(imported).not.toBeNull();
    expect(imported!.currentAct).toBe(1000);
    expect(imported!.maxUnlockedAct).toBe(1000);
    expect(imported!.equippedWeaponId).toBe('wpn_tier_50');
  });

  it('14. importVaultFromSaveCode rejects malformed or non-COTC1 codes safely', () => {
    expect(importVaultFromSaveCode('BAD_CODE')).toBeNull();
    expect(importVaultFromSaveCode('COTC1:not_valid_json')).toBeNull();
  });

  it('15. upgradePayloadToV8 preserves lastReplaySerialized from V7 and upgrades schemaVersion to 8', () => {
    const base = createScaledActRestorePayload(300);
    const encodedReplay = serializeReplay(buildTestReplay(300, 8888));
    const v7 = upgradePayloadToV7(base, encodedReplay);
    expect(v7.schemaVersion).toBe(7);

    const v8 = upgradePayloadToV8(v7);
    expect(v8.schemaVersion).toBe(8);
    expect(v8.lastReplaySerialized).toBe(encodedReplay);
  });

  it('16. saving a SaveVaultPayloadV8 directly persists and reloads cleanly via loadSavedGame()', () => {
    const v8 = upgradePayloadToV8(createScaledActRestorePayload(888), 'COTCR1:sample');
    const res = saveToVault(v8);
    expect(res.saved).toBe(true);
    expect(res.blockedByGuard).toBe(false);
    expect(loadSavedGame()?.currentAct).toBe(888);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(888);
  });
});
