/**
 * File 5 / 100 — Strict WebAudio DSP, 40-Track Soundtrack, SFX Bank,
 * Replay Theater, Command Hub Tabs, & Mobile Controller Types. Zero `any` types.
 */

import type { PlayableHeroId } from './combat';
import type { ArcId } from './world';

export type WaveformKind = 'pulse125' | 'pulse25' | 'pulse50' | 'triangle' | 'sawtooth' | 'noise';

export interface ChiptuneNoteEvent {
  readonly step: number;
  readonly midiNote: number;
  readonly durationSteps: number;
  readonly velocity: number;
}

export interface TrackChannelPattern {
  readonly channel: 'lead_pulse' | 'counter_pulse' | 'bass_triangle' | 'percussion_noise';
  readonly waveform: WaveformKind;
  readonly notes: ReadonlyArray<ChiptuneNoteEvent>;
}

export interface SoundtrackTrack40Spec {
  readonly trackId: number;
  readonly arcId: ArcId;
  readonly title: string;
  readonly bpm: number;
  readonly keyRootMidi: number;
  readonly scaleMode: 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'harmonic_minor';
  readonly isBossTheme: boolean;
  readonly patterns: ReadonlyArray<TrackChannelPattern>;
}

export type SfxId =
  | 'sword_slash'
  | 'magic_cast'
  | 'perfect_dodge'
  | 'critical_hit'
  | 'elixir_awaken'
  | 'war_horn'
  | 'portal_unlock'
  | 'chest_fanfare'
  | 'cauldron_brew'
  | 'boss_roar'
  | 'shield_shatter'
  | 'star_upgrade';

export type OmniverseHubTabId =
  | 'inventory'
  | 'world_map'
  | 'capital'
  | 'cauldron_3d'
  | 'boss_trophies_3d'
  | 'hero_showcase_3d'
  | 'skill_tree'
  | 'bounties_titles'
  | 'save_jukebox'
  | 'dojo_guide'
  | 'custom_editor';

export interface MobileTouchState {
  readonly stickActive: boolean;
  readonly stickDx: number;
  readonly stickDy: number;
  readonly activeButtons: ReadonlyArray<'attack' | 'dodge' | 'elixir' | 'war_horn' | 'potion'>;
}

export interface ReplayActorRenderSpec {
  readonly heroId: PlayableHeroId;
  readonly team: 'heroes' | 'boss';
  readonly x: number;
  readonly y: number;
  readonly facing: 1 | -1;
}
