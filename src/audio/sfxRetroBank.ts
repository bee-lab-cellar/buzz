/**
 * File 71 / 100 — 12 Retro 16-Bit Chiptune SFX Recipes & Safe WebAudio Trigger Bank.
 * Strictly typed (ZERO `any`), headless/Vitest safe.
 */

import type { SfxId, WaveformKind } from '../types/audioAndUi';
import { GLOBAL_DSP_SYNTH } from './dspChiptuneSynthesizer';

export interface RetroSfxRecipe {
  readonly id: SfxId;
  readonly label: string;
  readonly waveform: WaveformKind;
  readonly startFreqHz: number;
  readonly endFreqHz: number;
  readonly durationMs: number;
  readonly harmonicChordHz?: ReadonlyArray<number>;
}

export const RETRO_SFX_BANK_12: Readonly<Record<SfxId, RetroSfxRecipe>> = {
  sword_slash: {
    id: 'sword_slash',
    label: 'Starlight Blade Slash',
    waveform: 'sawtooth',
    startFreqHz: 620,
    endFreqHz: 210,
    durationMs: 75,
  },
  magic_cast: {
    id: 'magic_cast',
    label: 'Arcane Star Bolt',
    waveform: 'pulse25',
    startFreqHz: 520,
    endFreqHz: 1180,
    durationMs: 140,
  },
  perfect_dodge: {
    id: 'perfect_dodge',
    label: 'Perfect Counter-Dodge',
    waveform: 'triangle',
    startFreqHz: 680,
    endFreqHz: 1360,
    durationMs: 110,
    harmonicChordHz: [680, 1020],
  },
  critical_hit: {
    id: 'critical_hit',
    label: '2.5x Arcane Crit Impact',
    waveform: 'pulse125',
    startFreqHz: 880,
    endFreqHz: 1520,
    durationMs: 150,
    harmonicChordHz: [880, 1320, 1760],
  },
  elixir_awaken: {
    id: 'elixir_awaken',
    label: 'Super Elixir Awakening',
    waveform: 'pulse50',
    startFreqHz: 440,
    endFreqHz: 880,
    durationMs: 260,
    harmonicChordHz: [523.25, 659.25, 783.99, 1046.5],
  },
  war_horn: {
    id: 'war_horn',
    label: 'Cat-Dog Alliance War Horn',
    waveform: 'sawtooth',
    startFreqHz: 196,
    endFreqHz: 293.66,
    durationMs: 420,
    harmonicChordHz: [196, 293.66, 392],
  },
  portal_unlock: {
    id: 'portal_unlock',
    label: 'East Portal Unlocked',
    waveform: 'triangle',
    startFreqHz: 392,
    endFreqHz: 784,
    durationMs: 240,
    harmonicChordHz: [392, 587.33, 784],
  },
  chest_fanfare: {
    id: 'chest_fanfare',
    label: 'Royal Treasure Fanfare',
    waveform: 'pulse25',
    startFreqHz: 523.25,
    endFreqHz: 1046.5,
    durationMs: 320,
    harmonicChordHz: [523.25, 659.25, 783.99, 1046.5],
  },
  cauldron_brew: {
    id: 'cauldron_brew',
    label: 'BlockCraft Cauldron Brew',
    waveform: 'triangle',
    startFreqHz: 280,
    endFreqHz: 940,
    durationMs: 220,
  },
  boss_roar: {
    id: 'boss_roar',
    label: 'Act Boss Phase Roar',
    waveform: 'noise',
    startFreqHz: 180,
    endFreqHz: 65,
    durationMs: 460,
  },
  shield_shatter: {
    id: 'shield_shatter',
    label: 'Boss Guard Shatter',
    waveform: 'noise',
    startFreqHz: 1400,
    endFreqHz: 310,
    durationMs: 180,
  },
  star_upgrade: {
    id: 'star_upgrade',
    label: '+25★ Star-Anvil Forge',
    waveform: 'pulse125',
    startFreqHz: 587.33,
    endFreqHz: 1174.66,
    durationMs: 250,
    harmonicChordHz: [587.33, 880, 1174.66],
  },
};

export const ALL_12_SFX_IDS: ReadonlyArray<SfxId> = Object.keys(RETRO_SFX_BANK_12) as SfxId[];

export function triggerRetroSfx(id: SfxId): RetroSfxRecipe {
  const recipe = RETRO_SFX_BANK_12[id];
  switch (id) {
    case 'sword_slash':
    case 'magic_cast':
      GLOBAL_DSP_SYNTH.playCombatSfx('slash');
      break;
    case 'critical_hit':
    case 'star_upgrade':
      GLOBAL_DSP_SYNTH.playCombatSfx('crit');
      break;
    case 'perfect_dodge':
    case 'portal_unlock':
      GLOBAL_DSP_SYNTH.playCombatSfx('dodge');
      break;
    case 'shield_shatter':
    case 'boss_roar':
      GLOBAL_DSP_SYNTH.playCombatSfx('sever');
      break;
    case 'elixir_awaken':
    case 'cauldron_brew':
    case 'chest_fanfare':
      GLOBAL_DSP_SYNTH.playCombatSfx('elixir');
      break;
    case 'war_horn':
      GLOBAL_DSP_SYNTH.playCombatSfx('war_horn');
      break;
  }
  return recipe;
}
