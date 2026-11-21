/**
 * Layer 3 — Arc I & Arc II Boss 8-Frame Sprite Atlas (Acts 1–82)
 * Covers Grommash, Brambleback, Mycora, General Vane, Cryo-Fang, Volcanis,
 * Viperfang, Aether-Wing, Usurper Fenrir (Act 41), and Emperor Ragnarok (Act 82).
 */

import type { AnimationClipName } from '../types/entities';
import {
  BOSS_DOG_WARLORD_MATRIX,
  BOSS_LICH_OVERLORD_MATRIX,
} from './arc1And2BossMatrices';
import { mapClipToFrame8 } from './heroNyxAndKingLeo';
import {
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
  type SpriteSheet8Frame,
} from './spriteMatrixTypes';

export type Arc1And2BossId =
  | 'grommash'
  | 'brambleback'
  | 'mycora'
  | 'general_vane'
  | 'cryo_fang'
  | 'volcanis'
  | 'viperfang'
  | 'aether_wing'
  | 'usurper_fenrir'
  | 'emperor_ragnarok';

export interface Arc1And2BossSpriteProfile {
  readonly bossId: Arc1And2BossId;
  readonly actId: number;
  readonly displayName: string;
  readonly baseSheet: SpriteSheet8Frame;
  readonly paletteOverride: Record<string, string>;
  readonly scale: number;
}

export const ARC1_AND_2_BOSS_PROFILES: Readonly<Record<Arc1And2BossId, Arc1And2BossSpriteProfile>> = {
  grommash: {
    bossId: 'grommash',
    actId: 10,
    displayName: 'Warlord Grommash',
    baseSheet: BOSS_DOG_WARLORD_MATRIX,
    paletteOverride: { r: '#b91c1c', a: '#78716c', g: '#fbbf24' },
    scale: 1.0,
  },
  brambleback: {
    bossId: 'brambleback',
    actId: 18,
    displayName: 'Thorn-Juggernaut Brambleback',
    baseSheet: BOSS_DOG_WARLORD_MATRIX,
    paletteOverride: { r: '#166534', a: '#4d7c0f', g: '#84cc16' },
    scale: 1.05,
  },
  mycora: {
    bossId: 'mycora',
    actId: 24,
    displayName: 'Spore-Matriarch Mycora',
    baseSheet: BOSS_LICH_OVERLORD_MATRIX,
    paletteOverride: { p: '#a855f7', g: '#4ade80', c: '#2e1065' },
    scale: 1.0,
  },
  general_vane: {
    bossId: 'general_vane',
    actId: 30,
    displayName: 'Iron-Fang General Vane',
    baseSheet: BOSS_DOG_WARLORD_MATRIX,
    paletteOverride: { r: '#1e3a8a', a: '#94a3b8', g: '#38bdf8' },
    scale: 1.08,
  },
  cryo_fang: {
    bossId: 'cryo_fang',
    actId: 35,
    displayName: 'Frost-Alpha Cryo-Fang',
    baseSheet: BOSS_DOG_WARLORD_MATRIX,
    paletteOverride: { r: '#0369a1', a: '#bae6fd', g: '#e0f2fe' },
    scale: 1.1,
  },
  usurper_fenrir: {
    bossId: 'usurper_fenrir',
    actId: 41,
    displayName: 'Usurper Wolf-King Fenrir',
    baseSheet: BOSS_DOG_WARLORD_MATRIX,
    paletteOverride: { r: '#581c87', a: '#cbd5e1', g: '#f59e0b' },
    scale: 1.25,
  },
  volcanis: {
    bossId: 'volcanis',
    actId: 52,
    displayName: 'Magma-Hound Volcanis',
    baseSheet: BOSS_DOG_WARLORD_MATRIX,
    paletteOverride: { r: '#9a3412', a: '#451a03', g: '#fb923c' },
    scale: 1.12,
  },
  viperfang: {
    bossId: 'viperfang',
    actId: 64,
    displayName: 'Venom-Marshal Viperfang',
    baseSheet: BOSS_LICH_OVERLORD_MATRIX,
    paletteOverride: { p: '#15803d', g: '#a3e635', c: '#14532d' },
    scale: 1.1,
  },
  aether_wing: {
    bossId: 'aether_wing',
    actId: 74,
    displayName: 'Sky-Archon Aether-Wing',
    baseSheet: BOSS_LICH_OVERLORD_MATRIX,
    paletteOverride: { p: '#0284c7', g: '#fde047', c: '#0c4a6e' },
    scale: 1.15,
  },
  emperor_ragnarok: {
    bossId: 'emperor_ragnarok',
    actId: 82,
    displayName: 'Emperor Ragnarok, Iron Sovereign',
    baseSheet: BOSS_LICH_OVERLORD_MATRIX,
    paletteOverride: { p: '#dc2626', g: '#facc15', c: '#1c1917' },
    scale: 1.32,
  },
};

const BOSS_FRAME_CACHE = new Map<string, HTMLCanvasElement>();

export function getArc1Or2BossCanvas(
  bossId: Arc1And2BossId,
  clip: AnimationClipName,
  frameIndex: number,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const frame: SpriteFrame8Name = mapClipToFrame8(clip, frameIndex);
  const key = `boss12:${bossId}:${frame}`;
  const cached = BOSS_FRAME_CACHE.get(key);
  if (cached) return cached;

  const profile = ARC1_AND_2_BOSS_PROFILES[bossId];
  const mergedPalette: Record<string, string> = {
    ...profile.baseSheet.palette,
    ...profile.paletteOverride,
  };
  const canvas = renderPixelMatrixToCanvas(
    profile.baseSheet.frames[frame],
    mergedPalette,
    profile.baseSheet.width,
    profile.baseSheet.height,
  );
  BOSS_FRAME_CACHE.set(key, canvas);
  return canvas;
}

export function resolveArc1Or2BossByAct(actId: number): Arc1And2BossSpriteProfile {
  if (actId >= 82) return ARC1_AND_2_BOSS_PROFILES.emperor_ragnarok;
  if (actId >= 70) return ARC1_AND_2_BOSS_PROFILES.aether_wing;
  if (actId >= 60) return ARC1_AND_2_BOSS_PROFILES.viperfang;
  if (actId >= 48) return ARC1_AND_2_BOSS_PROFILES.volcanis;
  if (actId >= 41) return ARC1_AND_2_BOSS_PROFILES.usurper_fenrir;
  if (actId >= 33) return ARC1_AND_2_BOSS_PROFILES.cryo_fang;
  if (actId >= 28) return ARC1_AND_2_BOSS_PROFILES.general_vane;
  if (actId >= 21) return ARC1_AND_2_BOSS_PROFILES.mycora;
  if (actId >= 15) return ARC1_AND_2_BOSS_PROFILES.brambleback;
  return ARC1_AND_2_BOSS_PROFILES.grommash;
}
