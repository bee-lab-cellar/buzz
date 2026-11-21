/**
 * Pillar 3 — 4-Layer iPad/Safari Bulletproof Save Vault Engine (V6 + V7 Compatible)
 *
 * Redundancy Layers:
 * 1. `localStorage` (synchronous fast path, primary + backup mirror)
 * 2. `IndexedDB` (`cotc_omniverse_vault_db` -> `vault_records`, resilient to Safari ITP eviction)
 * 3. `window.name` (survives tab reloads & cross-navigation in iOS WebViews)
 * 4. Base64 `COTC1:...` Portable Save Code (Copy/Paste backup across devices)
 * Plus an in-memory mirror for deterministic headless/Node Vitest verification!
 *
 * CRITICAL ANTI-OVERWRITE GUARD:
 * - Never downgrades `maxUnlockedAct` unless `state.forceReset === true`.
 * - Includes 1-Tap `createScaledActRestorePayload(134)` and Act 1–300 Jump Slider with Scaled Gear.
 */

import type { CapitalBuildingId, COTCSavePayloadV6 } from '../types/saveAndProgression';
import type { HeroId } from '../types/entities';
import type { SaveVaultPayloadV7, SaveVaultPayloadV8 } from '../types/world';

export type AnyVaultPayload = COTCSavePayloadV6 | SaveVaultPayloadV7 | SaveVaultPayloadV8;

export const VAULT_STORAGE_KEY = 'cotc_omniverse_vault_v8';
export const VAULT_BACKUP_KEY = 'cotc_omniverse_vault_v8_backup';
export const LEGACY_VAULT_KEY_V7 = 'cotc_omniverse_vault_v7';
export const LEGACY_VAULT_KEY_V6 = 'cotc_omniverse_vault_v6';
const WINDOW_NAME_PREFIX = 'COTC_VAULT_V8::';
const LEGACY_WINDOW_NAME_PREFIX_V7 = 'COTC_VAULT_V7::';
const LEGACY_WINDOW_NAME_PREFIX = 'COTC_VAULT_V6::';
const SAVE_CODE_PREFIX = 'COTC1:';
const IDB_NAME = 'cotc_omniverse_vault_db';
const IDB_STORE = 'vault_records';
const IDB_RECORD_KEY = 'primary_v8';

const DEFAULT_CAPITAL_LEVELS: Record<CapitalBuildingId, number> = {
  royal_palace: 1,
  star_forge_smithy: 1,
  blockcraft_alchemy_lab: 1,
  cat_knight_barracks: 1,
  dog_alliance_embassy: 1,
  great_duck_observatory: 1,
  fish_market_bazaar: 1,
  arcane_library: 1,
  training_dojo: 1,
  sky_harpoon_armory: 1,
  abyssal_drydock: 1,
  chronos_clocktower: 1,
};

/**
 * In-memory mirror used as a fast cache in browsers AND as the authoritative store
 * in headless Node/Vitest environments where `window` / `localStorage` do not exist.
 */
let inMemoryVaultRecord: COTCSavePayloadV6 | null = null;

export function resetInMemoryVaultForTests(): void {
  inMemoryVaultRecord = null;
}

function isValidPayload(raw: unknown): raw is AnyVaultPayload {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  return (
    (obj.schemaVersion === 6 || obj.schemaVersion === 7 || obj.schemaVersion === 8) &&
    typeof obj.currentAct === 'number' &&
    typeof obj.maxUnlockedAct === 'number' &&
    typeof obj.level === 'number' &&
    typeof obj.gold === 'number' &&
    Array.isArray(obj.clearedActs)
  );
}

function normalizeToV6Compatible(payload: AnyVaultPayload): COTCSavePayloadV6 {
  return {
    schemaVersion: 6,
    savedAtIso: payload.savedAtIso,
    currentAct: payload.currentAct,
    maxUnlockedAct: payload.maxUnlockedAct,
    clearedActs: [...payload.clearedActs],
    activeHeroId: payload.activeHeroId,
    unlockedHeroes: [...payload.unlockedHeroes],
    level: payload.level,
    xp: payload.xp,
    gold: payload.gold,
    starPoints: payload.starPoints,
    healthPotions: payload.healthPotions,
    hasDuckElixir: payload.hasDuckElixir,
    nightmareMode: payload.nightmareMode,
    nightmareUnlocked: payload.nightmareUnlocked,
    screenShakeEnabled: payload.screenShakeEnabled,
    muted: payload.muted,
    equippedWeaponId: payload.equippedWeaponId,
    equippedArmorId: payload.equippedArmorId,
    ownedGearIds: [...payload.ownedGearIds],
    gearStarLevels: { ...payload.gearStarLevels },
    primordialGearIds: [...payload.primordialGearIds],
    capitalBuildingLevels: { ...payload.capitalBuildingLevels },
    unlockedSkillNodeIds: [...payload.unlockedSkillNodeIds],
    brewedFlaskCounts: { ...payload.brewedFlaskCounts },
    forceReset: payload.forceReset,
  };
}

export function upgradePayloadToV7(
  payload: AnyVaultPayload,
  lastReplaySerialized?: string,
): SaveVaultPayloadV7 {
  const base = normalizeToV6Compatible(payload);
  return {
    ...base,
    schemaVersion: 7,
    lastReplaySerialized:
      lastReplaySerialized ??
      (payload.schemaVersion === 7 || payload.schemaVersion === 8
        ? payload.lastReplaySerialized
        : undefined),
  };
}

export function upgradePayloadToV8(
  payload: AnyVaultPayload,
  lastReplaySerialized?: string,
): SaveVaultPayloadV8 {
  const base = normalizeToV6Compatible(payload);
  return {
    ...base,
    schemaVersion: 8,
    lastReplaySerialized:
      lastReplaySerialized ??
      (payload.schemaVersion === 7 || payload.schemaVersion === 8
        ? payload.lastReplaySerialized
        : undefined),
  };
}

function readLocalStorageVault(): COTCSavePayloadV6 | null {
  if (typeof window === 'undefined') return null;
  const keys = [VAULT_STORAGE_KEY, VAULT_BACKUP_KEY, LEGACY_VAULT_KEY_V7, LEGACY_VAULT_KEY_V6];
  let best: COTCSavePayloadV6 | null = null;
  for (let i = 0; i < keys.length; i++) {
    try {
      const raw = window.localStorage.getItem(keys[i]);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (isValidPayload(parsed)) {
        const normalized = normalizeToV6Compatible(parsed);
        if (!best || normalized.maxUnlockedAct > best.maxUnlockedAct) {
          best = normalized;
        }
      }
    } catch {
      // Safari private mode / quota error ignored
    }
  }
  return best;
}

function readWindowNameVault(): COTCSavePayloadV6 | null {
  if (typeof window === 'undefined') return null;
  try {
    if (typeof window.name === 'string') {
      const prefix = window.name.startsWith(WINDOW_NAME_PREFIX)
        ? WINDOW_NAME_PREFIX
        : window.name.startsWith(LEGACY_WINDOW_NAME_PREFIX_V7)
          ? LEGACY_WINDOW_NAME_PREFIX_V7
          : window.name.startsWith(LEGACY_WINDOW_NAME_PREFIX)
            ? LEGACY_WINDOW_NAME_PREFIX
            : null;
      if (prefix) {
        const json = window.name.slice(prefix.length);
        const parsed: unknown = JSON.parse(json);
        if (isValidPayload(parsed)) return normalizeToV6Compatible(parsed);
      }
    }
  } catch {
    // Ignore corrupt window.name
  }
  return null;
}

function writeWindowNameVault(payload: SaveVaultPayloadV8): void {
  if (typeof window === 'undefined') return;
  try {
    window.name = WINDOW_NAME_PREFIX + JSON.stringify(payload);
  } catch {
    // Ignore restricted frame window.name
  }
}

export function mirrorVaultToIndexedDB(payload: AnyVaultPayload): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(false);
  const v8 = upgradePayloadToV8(payload);
  return new Promise<boolean>((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction(IDB_STORE, 'readwrite');
          tx.objectStore(IDB_STORE).put(v8, IDB_RECORD_KEY);
          tx.oncomplete = () => {
            db.close();
            resolve(true);
          };
          tx.onerror = () => {
            db.close();
            resolve(false);
          };
        } catch {
          db.close();
          resolve(false);
        }
      };
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export function readVaultFromIndexedDB(): Promise<COTCSavePayloadV6 | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(inMemoryVaultRecord);
  return new Promise<COTCSavePayloadV6 | null>((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        try {
          const tx = db.transaction(IDB_STORE, 'readonly');
          const getReq = tx.objectStore(IDB_STORE).get(IDB_RECORD_KEY);
          getReq.onsuccess = () => {
            const res: unknown = getReq.result;
            db.close();
            resolve(isValidPayload(res) ? normalizeToV6Compatible(res) : null);
          };
          getReq.onerror = () => {
            db.close();
            resolve(null);
          };
        } catch {
          db.close();
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Synchronous load for boot/render paths: chooses the highest-progress save
 * across localStorage (V7/V6), window.name, and in-memory vault mirror.
 */
export function loadSavedGame(): COTCSavePayloadV6 | null {
  const candidates: COTCSavePayloadV6[] = [];
  const ls = readLocalStorageVault();
  const wn = readWindowNameVault();
  if (ls) candidates.push(ls);
  if (wn) candidates.push(wn);
  if (inMemoryVaultRecord) candidates.push(inMemoryVaultRecord);

  if (candidates.length === 0) return null;
  let best = candidates[0];
  for (let i = 1; i < candidates.length; i++) {
    if (candidates[i].maxUnlockedAct > best.maxUnlockedAct) {
      best = candidates[i];
    }
  }
  return best;
}

/**
 * Saves across localStorage (V7 primary + backup + V6 mirror), window.name,
 * IndexedDB asynchronously, and the in-memory vault mirror.
 *
 * STRICT ANTI-OVERWRITE GUARD:
 * Never overwrites a higher `maxUnlockedAct` save unless `state.forceReset === true`.
 */
export function saveToVault(
  state: AnyVaultPayload,
): { readonly saved: boolean; readonly blockedByGuard: boolean } {
  const existing = loadSavedGame();
  if (existing && existing.maxUnlockedAct > state.maxUnlockedAct && !state.forceReset) {
    return { saved: false, blockedByGuard: true };
  }

  const v8Sanitized: SaveVaultPayloadV8 = {
    ...upgradePayloadToV8(state),
    savedAtIso: new Date().toISOString(),
    forceReset: undefined,
  };
  const v6Sanitized = normalizeToV6Compatible(v8Sanitized);
  inMemoryVaultRecord = v6Sanitized;

  const jsonV8 = JSON.stringify(v8Sanitized);
  const jsonV6 = JSON.stringify(v6Sanitized);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(VAULT_STORAGE_KEY, jsonV8);
      window.localStorage.setItem(VAULT_BACKUP_KEY, jsonV8);
      window.localStorage.setItem(LEGACY_VAULT_KEY_V7, jsonV8);
      window.localStorage.setItem(LEGACY_VAULT_KEY_V6, jsonV6);
    } catch {
      // Ignore storage quota errors; window.name & IDB still preserve progress
    }
  }
  writeWindowNameVault(v8Sanitized);
  void mirrorVaultToIndexedDB(v8Sanitized);

  return { saved: true, blockedByGuard: false };
}

export function exportVaultToSaveCode(payload: AnyVaultPayload): string {
  const json = JSON.stringify(upgradePayloadToV8(payload));
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return SAVE_CODE_PREFIX + btoa(binary);
}

export function importVaultFromSaveCode(code: string): COTCSavePayloadV6 | null {
  const trimmed = code.trim();
  if (!trimmed.startsWith(SAVE_CODE_PREFIX)) return null;
  try {
    const b64 = trimmed.slice(SAVE_CODE_PREFIX.length);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);
    if (!isValidPayload(parsed)) return null;
    const normalized = normalizeToV6Compatible(parsed);
    saveToVault({ ...normalized, forceReset: true });
    return normalized;
  } catch {
    return null;
  }
}

/**
 * Generates a balanced, Act-scaled Vault payload for 1-Tap [⚡ RESTORE ACT 134]
 * or any Act 1–1,000 Jump Slider target with appropriate Hero Unlocks, Gold, Level & 50-Tier Gear.
 */
export function createScaledActRestorePayload(targetActRaw: number): COTCSavePayloadV6 {
  const targetAct = Math.max(1, Math.min(1000, Math.floor(targetActRaw)));
  const clearedActs: number[] = [];
  for (let a = 1; a < targetAct; a++) {
    clearedActs.push(a);
  }

  const unlockedHeroes: HeroId[] = ['nyx'];
  if (targetAct >= 20) unlockedHeroes.push('king_leo');
  if (targetAct >= 42) unlockedHeroes.push('fenrir');
  if (targetAct >= 83) unlockedHeroes.push('great_duck');

  const scaledLevel = Math.max(1, Math.round(1 + targetAct * 0.72));
  const scaledGold = Math.round(180 + targetAct * 65);
  const scaledStarPoints = Math.max(1, Math.floor(targetAct / 4));
  const buildingTier = Math.min(10, Math.max(1, Math.floor(1 + targetAct / 95)));

  const capitalBuildingLevels: Record<CapitalBuildingId, number> = {
    ...DEFAULT_CAPITAL_LEVELS,
  };
  (Object.keys(capitalBuildingLevels) as CapitalBuildingId[]).forEach((k) => {
    capitalBuildingLevels[k] = buildingTier;
  });

  const weaponIndex = Math.min(50, Math.max(1, Math.ceil(targetAct / 20)));
  const armorIndex = Math.min(50, Math.max(1, Math.ceil(targetAct / 20)));

  return {
    schemaVersion: 6,
    savedAtIso: new Date().toISOString(),
    currentAct: targetAct,
    maxUnlockedAct: targetAct,
    clearedActs,
    activeHeroId: 'nyx',
    unlockedHeroes,
    level: scaledLevel,
    xp: 0,
    gold: scaledGold,
    starPoints: scaledStarPoints,
    healthPotions: Math.min(12, 3 + Math.floor(targetAct / 30)),
    hasDuckElixir: targetAct >= 39,
    nightmareMode: false,
    nightmareUnlocked: targetAct >= 122,
    screenShakeEnabled: true,
    muted: false,
    equippedWeaponId: `wpn_tier_${weaponIndex}`,
    equippedArmorId: `arm_tier_${armorIndex}`,
    ownedGearIds: [`wpn_tier_${weaponIndex}`, `arm_tier_${armorIndex}`],
    gearStarLevels: {
      [`wpn_tier_${weaponIndex}`]: Math.min(25, Math.floor(targetAct / 40)),
      [`arm_tier_${armorIndex}`]: Math.min(25, Math.floor(targetAct / 40)),
    },
    primordialGearIds: targetAct >= 180 ? [`wpn_tier_${weaponIndex}`] : [],
    capitalBuildingLevels,
    unlockedSkillNodeIds: [],
    brewedFlaskCounts: {},
    forceReset: true,
  };
}

/**
 * Registers iOS Safari / iPadOS `visibilitychange` & `pagehide` hooks so progress
 * is committed immediately whenever the player switches tabs or locks their iPad.
 */
export function attachIpadLifecycleAutosave(
  getPayloadSnapshot: () => AnyVaultPayload | null,
): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => undefined;
  }

  const flush = (): void => {
    const snap = getPayloadSnapshot();
    if (snap) {
      saveToVault(snap);
    }
  };

  const onVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      flush();
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);

  return () => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', flush);
    window.removeEventListener('beforeunload', flush);
  };
}
