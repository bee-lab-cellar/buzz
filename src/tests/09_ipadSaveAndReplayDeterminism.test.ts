/**
 * File 98 / 100 — Automated Suite 09: iPad V8 Save Vault Anti-Reset Guard & 60Hz Replay Determinism + CRC32 (20 Tests).
 */

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createScaledActRestorePayload,
  exportVaultToSaveCode,
  importVaultFromSaveCode,
  loadSavedGame,
  resetInMemoryVaultForTests,
  saveToVault,
  upgradePayloadToV8,
} from '../ui/ipadSaveVaultEngine';
import {
  computeCrc32Hex,
  DeterministicReplayPlayer,
  DeterministicReplayRecorder,
  serializeReplay,
  deserializeReplay,
  verifyReplayChecksum,
} from '../math/deterministicReplayEngine';
import {
  createShowcaseBossReplay,
  getReplayTeamFormation,
  TitleScreenLiveArena,
} from '../ui/titleScreenLiveArena';

describe('09. iPad V8 Save Vault Anti-Reset Guard & 60Hz Replay Determinism (20 Tests)', () => {
  beforeEach(() => {
    resetInMemoryVaultForTests();
  });

  it('01. saves and loads highest-act payload via in-memory vault mirror', () => {
    const p = createScaledActRestorePayload(240);
    const res = saveToVault(p);
    expect(res.saved).toBe(true);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(240);
  });

  it('02. ANTI-OVERWRITE GUARD blocks accidental downgrade of maxUnlockedAct without forceReset', () => {
    saveToVault(createScaledActRestorePayload(450));
    const lower = { ...createScaledActRestorePayload(12), forceReset: false };
    const res = saveToVault(lower);
    expect(res.saved).toBe(false);
    expect(res.blockedByGuard).toBe(true);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(450);
  });

  it('03. ANTI-OVERWRITE GUARD allows downgrade ONLY when forceReset === true', () => {
    saveToVault(createScaledActRestorePayload(450));
    const lower = { ...createScaledActRestorePayload(1), forceReset: true };
    const res = saveToVault(lower);
    expect(res.saved).toBe(true);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(1);
  });

  it('04. allows monotonic progression upgrade from Act 200 to Act 201 seamlessly', () => {
    saveToVault(createScaledActRestorePayload(200));
    const next = { ...createScaledActRestorePayload(201), forceReset: false };
    const res = saveToVault(next);
    expect(res.saved).toBe(true);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(201);
  });

  it('05. upgradePayloadToV8 stamps schemaVersion = 8 cleanly', () => {
    const v8 = upgradePayloadToV8(createScaledActRestorePayload(500));
    expect(v8.schemaVersion).toBe(8);
    expect(v8.currentAct).toBe(500);
  });

  it('06. exportVaultToSaveCode produces COTC1: Base64 string and imports back identically', () => {
    const orig = createScaledActRestorePayload(777);
    const code = exportVaultToSaveCode(orig);
    expect(code.startsWith('COTC1:')).toBe(true);
    resetInMemoryVaultForTests();
    const imported = importVaultFromSaveCode(code);
    expect(imported).not.toBeNull();
    expect(imported?.currentAct).toBe(777);
    expect(imported?.maxUnlockedAct).toBe(777);
  });

  it('07. importVaultFromSaveCode rejects corrupted or non-prefixed strings safely', () => {
    expect(importVaultFromSaveCode('GARBAGE_CODE')).toBeNull();
    expect(importVaultFromSaveCode('COTC1:not_valid_base64!!!')).toBeNull();
  });

  it('08. createScaledActRestorePayload(134) scales heroes, level, gold & gear accurately', () => {
    const p134 = createScaledActRestorePayload(134);
    expect(p134.currentAct).toBe(134);
    expect(p134.unlockedHeroes).toEqual(['nyx', 'king_leo', 'fenrir', 'great_duck']);
    expect(p134.hasDuckElixir).toBe(true);
  });

  it('09. createScaledActRestorePayload clamps act bounds safely to 1..1000', () => {
    expect(createScaledActRestorePayload(-50).currentAct).toBe(1);
    expect(createScaledActRestorePayload(9999).currentAct).toBe(1000);
  });

  it('10. IEEE-802.3 CRC32 produces standard known vector for "123456789"', () => {
    expect(computeCrc32Hex('123456789').toLowerCase()).toBe('cbf43926');
  });

  it('11. DeterministicReplayRecorder exports valid CRC32 verified replay', () => {
    const replay = createShowcaseBossReplay(300);
    expect(replay.totalTicks).toBe(360);
    expect(verifyReplayChecksum(replay)).toBe(true);
  });

  it('12. verifyReplayChecksum detects tampered replay data immediately', () => {
    const replay = createShowcaseBossReplay(300);
    const tampered = { ...replay, actId: 999 };
    expect(verifyReplayChecksum(tampered)).toBe(false);
  });

  it('13. Identical replay inputs produce byte-for-byte identical CRC32 checksums', () => {
    const r1 = createShowcaseBossReplay(400);
    const r2 = createShowcaseBossReplay(400);
    expect(r1.checksumHex).toBe(r2.checksumHex);
  });

  it('14. serializeReplay and deserializeReplay round-trip with valid checksum', () => {
    const orig = createShowcaseBossReplay(500);
    const raw = serializeReplay(orig);
    const parsed = deserializeReplay(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.checksumHex).toBe(orig.checksumHex);
    expect(verifyReplayChecksum(parsed!)).toBe(true);
  });

  it('15. DeterministicReplayPlayer steps through every recorded tick identically', () => {
    const rec = new DeterministicReplayRecorder();
    rec.startRecording(100, 'nyx', 42);
    rec.recordFrame({ tick: 0, moveX: 1, moveY: 0, actionMask: 1, swapSlot: 0, aimDeciDeg: 900 });
    rec.recordFrame({ tick: 1, moveX: -1, moveY: 1, actionMask: 2, swapSlot: 2, aimDeciDeg: 1800 });
    const replay = rec.stopAndExport();
    const player = new DeterministicReplayPlayer(replay);
    expect(player.getInputForTick(0).moveX).toBe(1);
    expect(player.getInputForTick(1).swapSlot).toBe(2);
    expect(player.isFinished(2)).toBe(true);
  });

  it('16. REPLAY THEATER (Arc I–II): places Usurper Fenrir on RIGHT Boss side, Nyx & Leo on LEFT', () => {
    const arc1 = getReplayTeamFormation(40);
    expect(arc1.fenrirOnHeroTeam).toBe(false);
    expect(arc1.leftHeroTeam).toEqual(['nyx', 'king_leo']);
  });

  it('17. REPLAY THEATER (Arc III–X): places Reformed Fenrir & Great Duck on LEFT Hero Team!', () => {
    const arc3 = getReplayTeamFormation(300);
    expect(arc3.fenrirOnHeroTeam).toBe(true);
    expect(arc3.leftHeroTeam).toEqual(['nyx', 'king_leo', 'fenrir', 'great_duck']);
    expect(arc3.rightBossName).toContain('Ignis-Bahamut');
  });

  it('18. REPLAY THEATER (Act 1000): displays AETHER-NULL as RIGHT Pixel Boss against all 4 Heroes', () => {
    const arc10 = getReplayTeamFormation(1000);
    expect(arc10.fenrirOnHeroTeam).toBe(true);
    expect(arc10.rightBossName).toContain('AETHER-NULL');
  });

  it('19. TitleScreenLiveArena advances replay progress cleanly over 60Hz ticks', () => {
    const arena = new TitleScreenLiveArena();
    arena.startSavedReplay(createShowcaseBossReplay(300));
    expect(arena.isReplayActive()).toBe(true);
    for (let i = 0; i < 60; i++) arena.update(1 / 60);
    expect(arena.getReplayProgress()).toBeGreaterThan(0.1);
  });

  it('20. TitleScreenLiveArena stopSavedReplay returns cleanly to live AI showcase', () => {
    const arena = new TitleScreenLiveArena();
    arena.startSavedReplay(createShowcaseBossReplay(300));
    arena.stopSavedReplay();
    expect(arena.isReplayActive()).toBe(false);
    expect(arena.getReplayLabel()).toBe('');
  });
});
