/**
 * File 70 / 100 — 16 Chiptune Soundtrack Compositions for Arcs 7–10 (Tracks 25–40 of 40)
 * + Unified `ALL_40_OST_TRACKS` Catalog & DSP Synthesizer Adapter.
 * Strictly typed (ZERO `any`).
 */

import type { SoundtrackTrack40Spec } from '../types/audioAndUi';
import type { ArcId } from '../types/world';
import type { DspSoundtrackComposition, SoundtrackStepNote } from './dspChiptuneSynthesizer';
import { buildChiptunePatterns, OST_TRACKS_ARC_1_TO_3 } from './ostTracksArc1to3';
import { OST_TRACKS_ARC_4_TO_6 } from './ostTracksArc4to6';

function makeTrack(
  trackId: number,
  arcId: ArcId,
  title: string,
  bpm: number,
  keyRootMidi: number,
  scaleMode: SoundtrackTrack40Spec['scaleMode'],
  isBossTheme: boolean,
  leadDegrees: ReadonlyArray<number>,
  bassDegrees: ReadonlyArray<number>,
): SoundtrackTrack40Spec {
  return {
    trackId,
    arcId,
    title,
    bpm,
    keyRootMidi,
    scaleMode,
    isBossTheme,
    patterns: buildChiptunePatterns(keyRootMidi, scaleMode, leadDegrees, bassDegrees, isBossTheme),
  };
}

export const OST_TRACKS_ARC_7_TO_10: ReadonlyArray<SoundtrackTrack40Spec> = [
  // ARC 7 — Astral Glacier Tundra
  makeTrack(25, 7, 'Crystalline Frost of the North', 114, 66, 'lydian', false, [0, 2, 4, 6, 7, 4, 2, 0], [0, 4, 5, 2]),
  makeTrack(26, 7, 'Aurora Valkyrie Patrol', 136, 61, 'minor', false, [0, 3, 5, 7, 8, 7, 5, 3], [0, 5, 3, 4]),
  makeTrack(27, 7, 'Star-Ice Hearth Sanctuary', 92, 64, 'major', false, [0, 4, 5, 7, 4, 2, 0, -1], [0, 3, 4, 0]),
  makeTrack(28, 7, 'Borealis — Prism Frost Sovereign', 166, 59, 'harmonic_minor', true, [0, 2, 3, 7, 6, 5, 3, 2], [0, 6, 5, 4]),

  // ARC 8 — Sky-Island Cloud Citadel
  makeTrack(29, 8, 'Soaring Across the Wind Spires', 138, 67, 'major', false, [0, 2, 4, 7, 9, 7, 4, 2], [0, 4, 5, 3]),
  makeTrack(30, 8, 'Tempest Bridge Plunge', 146, 62, 'dorian', false, [0, 3, 5, 7, 6, 4, 3, 2], [0, 3, 4, 5]),
  makeTrack(31, 8, 'Cloud-Deck Cathedral', 102, 65, 'lydian', false, [0, 4, 6, 7, 6, 4, 2, 0], [0, 5, 3, 4]),
  makeTrack(32, 8, 'Zephyrus — Hurricane Winglord', 170, 60, 'phrygian', true, [0, 1, 4, 5, 7, 5, 4, 1], [0, 1, 4, 5]),

  // ARC 9 — Mirror-Realm Dimension
  makeTrack(33, 9, 'Prismatic Hall of Reflections', 126, 63, 'harmonic_minor', false, [0, 3, 4, 6, 7, 6, 3, 0], [0, 4, 6, 5]),
  makeTrack(34, 9, 'Shattered Glass Labyrinth', 140, 58, 'phrygian', false, [0, 1, 3, 6, 5, 3, 1, 0], [0, 3, 1, 5]),
  makeTrack(35, 9, 'Quiet Reflection of King Leo', 96, 62, 'minor', false, [0, 2, 3, 5, 3, 2, 0, -1], [0, 5, 3, 4]),
  makeTrack(36, 9, 'Umbra-Nyx — Eclipse Doppelganger', 176, 56, 'harmonic_minor', true, [0, 3, 6, 7, 8, 7, 6, 3], [0, 6, 5, 7]),

  // ARC 10 — Omniverse Void-Eclipse Finale
  makeTrack(37, 10, 'Event Horizon March (Act 901)', 142, 57, 'minor', false, [0, 2, 3, 7, 5, 3, 2, 0], [0, 6, 5, 4]),
  makeTrack(38, 10, '1,000-Act Starlight Convergence', 150, 64, 'lydian', false, [0, 4, 6, 7, 9, 7, 6, 4], [0, 4, 5, 6]),
  makeTrack(39, 10, 'Sanctuary 999 — Before the Void', 100, 60, 'dorian', false, [0, 3, 5, 7, 5, 4, 2, 0], [0, 4, 3, 5]),
  makeTrack(40, 10, 'AETHER-NULL — Sovereign of the Omniverse', 184, 55, 'harmonic_minor', true, [0, 1, 3, 6, 7, 8, 7, 3], [0, 1, 5, 6]),
];

export const ALL_40_OST_TRACKS: ReadonlyArray<SoundtrackTrack40Spec> = [
  ...OST_TRACKS_ARC_1_TO_3,
  ...OST_TRACKS_ARC_4_TO_6,
  ...OST_TRACKS_ARC_7_TO_10,
];

export function getOstTrackForAct(actId: number, isBossAct: boolean, isSanctuary: boolean): SoundtrackTrack40Spec {
  const clamped = Math.max(1, Math.min(1000, Math.floor(actId)));
  const arcIndex = Math.floor((clamped - 1) / 100); // 0..9
  const baseIdx = arcIndex * 4;
  if (isBossAct) return ALL_40_OST_TRACKS[baseIdx + 3];
  if (isSanctuary) return ALL_40_OST_TRACKS[baseIdx + 2];
  return ALL_40_OST_TRACKS[baseIdx + (clamped % 2)];
}

export function toDspComposition(track: SoundtrackTrack40Spec): DspSoundtrackComposition {
  const toSteps = (idx: number): ReadonlyArray<SoundtrackStepNote> => {
    const ch = track.patterns[idx];
    if (!ch || ch.notes.length === 0) return [{ midi: 0, steps: 1, velocity: 0 }];
    return ch.notes.map((n) => ({
      midi: n.midiNote,
      steps: n.durationSteps,
      velocity: n.velocity,
    }));
  };

  return {
    id: `ost_${String(track.trackId).padStart(2, '0')}`,
    index: track.trackId,
    title: track.title,
    arc: track.arcId,
    mood: track.isBossTheme ? 'boss' : track.arcId >= 9 ? 'cosmic' : 'battle',
    bpm: track.bpm,
    filterCutoffHz: track.isBossTheme ? 4200 : 3000,
    fmModIndex: track.isBossTheme ? 1.15 : 0.45,
    leadWave: track.isBossTheme ? 'fm_bell' : 'square',
    harmonyWave: 'sawtooth',
    leadPattern: toSteps(0),
    harmonyPattern: toSteps(1),
    bassPattern: toSteps(2),
    drumPattern: track.isBossTheme ? 'K.H.S.H.KKH.S.HH' : 'K...S...K..HS...',
  };
}
