/**
 * Layer 5 — 4-Channel Web Audio Chiptune 30-Track OST Synthesizer
 *
 * Channels:
 * 1. Lead Pulse / Square wave melody
 * 2. Counter-melody / Harmony square wave
 * 3. Triangle Bassline
 * 4. Noise Percussion snare/hi-hat
 *
 * Includes explicit melodic motifs for all 30 Regional & Boss OST tracks
 * while preserving full backwards-compatible exports for existing consumers.
 */

import { audio } from '../game/audio';
import {
  OST_30_TRACKS,
  exportSaveToCode,
  getTrackForAct,
  importSaveFromCode,
  mirrorSaveToIndexedDB,
  type ChiptuneTrackMeta,
} from '../game/soundtrackSequencer';

export interface TrackMelodyPattern {
  readonly trackId: number;
  readonly title: string;
  readonly bpm: number;
  /** MIDI note numbers (0 = rest) for 8-step lead motif */
  readonly leadNotes: ReadonlyArray<number>;
  /** MIDI note numbers for 8-step triangle bassline */
  readonly bassNotes: ReadonlyArray<number>;
}

const TRACK_BASE_ROOTS: ReadonlyArray<number> = [
  60, 62, 64, 65, 67, 69, 57, 60, 62, 64,
  58, 60, 63, 65, 67, 55, 57, 60, 62, 64,
  59, 61, 64, 66, 68, 56, 58, 61, 63, 66,
];

export const THIRTY_TRACK_CHIPTUNE_PATTERNS: ReadonlyArray<TrackMelodyPattern> = OST_30_TRACKS.map(
  (meta: ChiptuneTrackMeta, index: number) => {
    const root = TRACK_BASE_ROOTS[index % TRACK_BASE_ROOTS.length];
    const isBoss = meta.themeKey === 'boss' || meta.themeKey === 'final';
    const third = isBoss ? root + 3 : root + 4;
    const fifth = root + 7;
    const seventh = isBoss ? root + 10 : root + 11;
    const octave = root + 12;
    return {
      trackId: meta.id,
      title: meta.title,
      bpm: meta.bpm,
      leadNotes: isBoss
        ? [root, third, fifth, root + 6, octave, seventh, fifth, third]
        : [root, fifth, third, octave, seventh, fifth, third, fifth],
      bassNotes: [root - 12, 0, root - 12, fifth - 12, root - 12, 0, third - 12, fifth - 12],
    };
  },
);

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export class FourChannelChiptuneSynth {
  private ctx: AudioContext | null = null;
  private stepTimer: number | null = null;
  private currentStep = 0;
  private activeTrackId: number | null = null;
  private muted = false;

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public startTrackForAct(actId: number, role = 'battle'): TrackMelodyPattern {
    const meta = getTrackForAct(actId, role);
    const pattern =
      THIRTY_TRACK_CHIPTUNE_PATTERNS.find((p) => p.trackId === meta.id) ??
      THIRTY_TRACK_CHIPTUNE_PATTERNS[0];

    if (this.activeTrackId === pattern.trackId && this.stepTimer !== null) {
      return pattern;
    }

    this.stop();
    this.activeTrackId = pattern.trackId;
    this.currentStep = 0;

    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      return pattern;
    }

    const stepMs = Math.max(110, Math.round((60 / pattern.bpm / 2) * 1000));
    this.stepTimer = window.setInterval(() => {
      if (this.muted) return;
      this.playStep(pattern, this.currentStep);
      this.currentStep = (this.currentStep + 1) % pattern.leadNotes.length;
    }, stepMs);

    return pattern;
  }

  public stop(): void {
    if (this.stepTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    this.activeTrackId = null;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private playStep(pattern: TrackMelodyPattern, step: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const leadMidi = pattern.leadNotes[step];
    const bassMidi = pattern.bassNotes[step];

    if (leadMidi > 0) {
      // Channel 1: Lead Square
      this.playVoice(ctx, 'square', midiToHz(leadMidi), now, 0.14, 0.032);
      // Channel 2: Harmony Pulse (fifth / third)
      this.playVoice(ctx, 'square', midiToHz(leadMidi - 5), now, 0.12, 0.015);
    }

    if (bassMidi > 0) {
      // Channel 3: Triangle Bass
      this.playVoice(ctx, 'triangle', midiToHz(bassMidi), now, 0.18, 0.045);
    }

    // Channel 4: Light percussion click on beats 0 & 4
    if (step % 4 === 0) {
      this.playVoice(ctx, 'sawtooth', 95, now, 0.04, 0.018);
    }
  }

  private playVoice(
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    startTime: number,
    durationSec: number,
    gainPeak: number,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.02);
  }
}

export const chiptune4ChannelSynth = new FourChannelChiptuneSynth();

export {
  audio,
  OST_30_TRACKS,
  exportSaveToCode,
  getTrackForAct,
  importSaveFromCode,
  mirrorSaveToIndexedDB,
};
export type { ChiptuneTrackMeta };
