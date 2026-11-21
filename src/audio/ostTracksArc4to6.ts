/**
 * File 69 / 100 — 12 Chiptune Soundtrack Compositions for Arcs 4–6 (Tracks 13–24 of 40).
 * Strictly typed (ZERO `any`).
 */

import type { SoundtrackTrack40Spec } from '../types/audioAndUi';
import type { ArcId } from '../types/world';
import { buildChiptunePatterns } from './ostTracksArc1to3';

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

export const OST_TRACKS_ARC_4_TO_6: ReadonlyArray<SoundtrackTrack40Spec> = [
  // ARC 4 — Sunken Kraken Archipelago
  makeTrack(13, 4, 'Coral Reefs of the Sunken Fleet', 116, 61, 'lydian', false, [0, 2, 4, 6, 7, 6, 4, 2], [0, 4, 2, 5]),
  makeTrack(14, 4, 'Abyssal Trench Currents', 128, 59, 'dorian', false, [0, 3, 5, 7, 5, 3, 2, 0], [0, 2, 5, 4]),
  makeTrack(15, 4, 'Bubble Vent Sanctuary', 94, 64, 'major', false, [0, 4, 7, 5, 4, 2, 0, -1], [0, 3, 5, 4]),
  makeTrack(16, 4, 'Charybdis — Eight-Tentacle Maelstrom', 164, 54, 'phrygian', true, [0, 1, 3, 6, 7, 5, 3, 1], [0, 1, 5, 1]),

  // ARC 5 — Clockwork Mecha Citadel
  makeTrack(17, 5, 'Brass Gears & Steam Pistons', 136, 63, 'dorian', false, [0, 2, 3, 5, 6, 5, 3, 2], [0, 4, 6, 5]),
  makeTrack(18, 5, 'Starlight Mecha Suit Launch', 148, 66, 'major', false, [0, 4, 5, 7, 9, 7, 5, 4], [0, 4, 5, 0]),
  makeTrack(19, 5, 'Pendulum Hall of the Great Duck', 108, 60, 'lydian', false, [0, 2, 6, 7, 4, 2, 0, 4], [0, 5, 4, 2]),
  makeTrack(20, 5, 'Chronos-Omega — Singularity Engine', 174, 57, 'harmonic_minor', true, [0, 3, 5, 7, 6, 4, 3, 1], [0, 5, 6, 7]),

  // ARC 6 — Volcanic Underworld
  makeTrack(21, 6, 'Magma Rivers & Obsidian Bridges', 134, 55, 'phrygian', false, [0, 1, 3, 4, 7, 4, 3, 1], [0, 1, 3, 1]),
  makeTrack(22, 6, 'Forgepaw’s Star-Anvil Hammer', 140, 62, 'minor', false, [0, 4, 3, 5, 7, 5, 4, 0], [0, 3, 5, 4]),
  makeTrack(23, 6, 'Basalt Shrine of the Ember Cat', 98, 58, 'dorian', false, [0, 3, 4, 6, 4, 3, 0, -1], [0, 4, 2, 0]),
  makeTrack(24, 6, 'Vulcan-Rex — Molten Core Colossus', 168, 53, 'harmonic_minor', true, [0, 2, 3, 6, 7, 5, 2, 0], [0, 0, 3, 6]),
];
