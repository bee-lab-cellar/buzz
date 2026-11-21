/**
 * File 68 / 100 — 12 Chiptune Soundtrack Compositions for Arcs 1–3 (Tracks 1–12 of 40).
 * Strictly typed (ZERO `any`).
 */

import type {
  ChiptuneNoteEvent,
  SoundtrackTrack40Spec,
  TrackChannelPattern,
} from '../types/audioAndUi';
import type { ArcId } from '../types/world';

const SCALE_INTERVALS: Readonly<Record<SoundtrackTrack40Spec['scaleMode'], ReadonlyArray<number>>> = {
  major: [0, 2, 4, 5, 7, 9, 11, 12],
  minor: [0, 2, 3, 5, 7, 8, 10, 12],
  dorian: [0, 2, 3, 5, 7, 9, 10, 12],
  phrygian: [0, 1, 3, 5, 7, 8, 10, 12],
  lydian: [0, 2, 4, 6, 7, 9, 11, 12],
  harmonic_minor: [0, 2, 3, 5, 7, 8, 11, 12],
};

export function buildChiptunePatterns(
  rootMidi: number,
  scaleMode: SoundtrackTrack40Spec['scaleMode'],
  leadDegrees: ReadonlyArray<number>,
  bassDegrees: ReadonlyArray<number>,
  isBossTheme: boolean,
): ReadonlyArray<TrackChannelPattern> {
  const scale = SCALE_INTERVALS[scaleMode];
  const leadNotes: ChiptuneNoteEvent[] = leadDegrees.map((deg, idx) => ({
    step: idx * 2,
    midiNote: deg < 0 ? 0 : rootMidi + scale[deg % scale.length] + (deg >= scale.length ? 12 : 0),
    durationSteps: isBossTheme ? 1 : 2,
    velocity: idx % 4 === 0 ? 0.92 : 0.74,
  }));

  const counterNotes: ChiptuneNoteEvent[] = leadDegrees.map((deg, idx) => ({
    step: idx * 2 + 1,
    midiNote: deg < 0 ? 0 : rootMidi - 5 + scale[(deg + 2) % scale.length],
    durationSteps: 2,
    velocity: 0.56,
  }));

  const bassNotes: ChiptuneNoteEvent[] = bassDegrees.map((deg, idx) => ({
    step: idx * 4,
    midiNote: rootMidi - 24 + scale[Math.abs(deg) % scale.length],
    durationSteps: 3,
    velocity: 0.85,
  }));

  const percussionNotes: ChiptuneNoteEvent[] = [];
  for (let s = 0; s < 16; s++) {
    if (s % 4 === 0 || (isBossTheme && s % 2 === 0)) {
      percussionNotes.push({
        step: s,
        midiNote: s % 8 === 4 ? 40 : 36,
        durationSteps: 1,
        velocity: s % 4 === 0 ? 0.88 : 0.52,
      });
    }
  }

  return [
    { channel: 'lead_pulse', waveform: isBossTheme ? 'pulse125' : 'pulse25', notes: leadNotes },
    { channel: 'counter_pulse', waveform: 'pulse50', notes: counterNotes },
    { channel: 'bass_triangle', waveform: 'triangle', notes: bassNotes },
    { channel: 'percussion_noise', waveform: 'noise', notes: percussionNotes },
  ];
}

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

export const OST_TRACKS_ARC_1_TO_3: ReadonlyArray<SoundtrackTrack40Spec> = [
  // ARC 1 — Quest to Save King Leo
  makeTrack(1, 1, 'Starlight Awakening (Nyx Theme)', 124, 64, 'major', false, [0, 2, 4, 7, 5, 4, 2, 0], [0, 3, 4, 0]),
  makeTrack(2, 1, 'Meadows of the Whispering Pine', 118, 62, 'dorian', false, [0, 1, 3, 4, 6, 4, 3, 2], [0, 4, 2, 0]),
  makeTrack(3, 1, 'Sanctuary of the Golden Lantern', 96, 60, 'lydian', false, [0, 4, 6, 7, 4, 2, 0, -1], [0, 5, 3, 4]),
  makeTrack(4, 1, 'Usurper King Fenrir — Iron Throne', 152, 57, 'harmonic_minor', true, [0, 3, 4, 6, 7, 6, 4, 1], [0, 0, 5, 4]),

  // ARC 2 — Cat vs Dog Kingdom War
  makeTrack(5, 2, 'March of the Six-Coat Cat Knights', 132, 65, 'major', false, [0, 4, 5, 7, 7, 5, 4, 2], [0, 4, 5, 4]),
  makeTrack(6, 2, 'Siege Trenches of Ironbark', 138, 60, 'minor', false, [0, 2, 3, 5, 7, 5, 3, 2], [0, 5, 6, 4]),
  makeTrack(7, 2, 'War Horn over the Stone Bridge', 142, 62, 'dorian', false, [0, 3, 4, 7, 6, 4, 3, 0], [0, 3, 4, 2]),
  makeTrack(8, 2, 'Ragnarok — Iron Dread-Chariot', 162, 55, 'phrygian', true, [0, 1, 4, 5, 7, 5, 1, 0], [0, 1, 4, 1]),

  // ARC 3 — Dragon Sky-Siege Cataclysm
  makeTrack(9, 3, 'Cinders of the Obsidian Peaks', 136, 58, 'minor', false, [0, 3, 5, 6, 7, 5, 3, 0], [0, 6, 5, 4]),
  makeTrack(10, 3, 'Harpoon Ballistas at Dawn', 144, 64, 'dorian', false, [0, 2, 4, 7, 6, 5, 4, 2], [0, 4, 3, 5]),
  makeTrack(11, 3, 'Oath of the Cat & Dog Alliance', 112, 67, 'major', false, [0, 2, 4, 5, 7, 4, 2, 0], [0, 5, 3, 4]),
  makeTrack(12, 3, 'Ignis-Bahamut — Sky-Cleaver Sovereign', 172, 56, 'harmonic_minor', true, [0, 2, 3, 6, 7, 6, 3, 2], [0, 3, 6, 5]),
];
