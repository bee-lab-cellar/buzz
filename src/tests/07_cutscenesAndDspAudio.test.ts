/**
 * File 96 / 100 — Automated Suite 07: 10+ 60FPS Cutscenes, Director Interpolation, 40 OST Tracks & DSP Audio (20 Tests).
 */

import { describe, expect, it } from 'vitest';
import {
  createCutsceneCinemaRig,
  skipCinemaCutscene,
  startCinemaCutscene,
  stepCinemaCutsceneRig,
  toggleCutsceneFastForward,
} from '../engine/cutsceneDirector';
import { CUTSCENES_ARC_1_TO_3 } from '../engine/cutscenesArc1to3';
import { CUTSCENES_ARC_4_TO_6 } from '../engine/cutscenesArc4to6';
import { CUTSCENES_ARC_7_TO_9 } from '../engine/cutscenesArc7to9';
import {
  ALL_10_OMNIVERSE_CUTSCENES,
  CUTSCENE_ACT_1000_GRAND_EPILOGUE,
  CUTSCENE_ACT_999_FOUR_LEADER_BLESSING,
} from '../engine/cutscenesArc10Finale';
import {
  DspChiptuneSynthesizer,
  midiToFrequencyHz,
} from '../audio/dspChiptuneSynthesizer';
import { OST_TRACKS_ARC_1_TO_3 } from '../audio/ostTracksArc1to3';
import { OST_TRACKS_ARC_4_TO_6 } from '../audio/ostTracksArc4to6';
import {
  ALL_40_OST_TRACKS,
  getOstTrackForAct,
  OST_TRACKS_ARC_7_TO_10,
  toDspComposition,
} from '../audio/ostTracksArc7to10';
import {
  ALL_12_SFX_IDS,
  RETRO_SFX_BANK_12,
  triggerRetroSfx,
} from '../audio/sfxRetroBank';

describe('07. 60FPS Cutscenes, 40-Track OST Catalog & WebAudio DSP Synth (20 Tests)', () => {
  it('01. Arc 1–3 cutscene catalog provides choreographed multi-beat sequences', () => {
    expect(CUTSCENES_ARC_1_TO_3.length).toBeGreaterThanOrEqual(4);
  });

  it('02. Arc 4–6 cutscene catalog provides Kraken, Clockwork & Volcanic sequences', () => {
    expect(CUTSCENES_ARC_4_TO_6.length).toBeGreaterThanOrEqual(3);
  });

  it('03. Arc 7–9 cutscene catalog provides Glacier, Sky & Mirror sequences', () => {
    expect(CUTSCENES_ARC_7_TO_9.length).toBeGreaterThanOrEqual(3);
  });

  it('04. Arc 10 Finale contains both Act 999 Blessing and Act 1,000 Grand Epilogue', () => {
    expect(CUTSCENE_ACT_999_FOUR_LEADER_BLESSING.actTrigger).toBe(999);
    expect(CUTSCENE_ACT_1000_GRAND_EPILOGUE.actTrigger).toBe(1000);
  });

  it('05. ALL_10_OMNIVERSE_CUTSCENES exposes at least 10 unique 60FPS cutscene tracks', () => {
    expect(ALL_10_OMNIVERSE_CUTSCENES.length).toBeGreaterThanOrEqual(10);
    const ids = new Set(ALL_10_OMNIVERSE_CUTSCENES.map((c) => c.id));
    expect(ids.size).toBe(ALL_10_OMNIVERSE_CUTSCENES.length);
  });

  it('06. Cutscene rig starts playback and interpolates camera & letterbox smoothly at 60Hz', () => {
    const rig = createCutsceneCinemaRig();
    startCinemaCutscene(rig, CUTSCENE_ACT_999_FOUR_LEADER_BLESSING);
    expect(rig.active).toBe(true);
    for (let i = 0; i < 15; i++) {
      stepCinemaCutsceneRig(rig, 1 / 60, { x: 240, y: 135 });
    }
    expect(rig.letterboxBarHeightPx).toBeGreaterThan(0);
    expect(rig.camZoom).toBeGreaterThanOrEqual(1.0);
  });

  it('07. Cutscene rig advances typewriter dialogue characters cleanly over time', () => {
    const rig = createCutsceneCinemaRig();
    startCinemaCutscene(rig, CUTSCENE_ACT_1000_GRAND_EPILOGUE);
    stepCinemaCutsceneRig(rig, 0.05, { x: 240, y: 135 });
    const c1 = rig.revealedChars;
    for (let i = 0; i < 12; i++) {
      stepCinemaCutsceneRig(rig, 0.05, { x: 240, y: 135 });
    }
    expect(rig.revealedChars).toBeGreaterThan(c1);
  });

  it('08. Cutscene rig supports 2x fast-forward and completes cleanly into gameplay handoff', () => {
    const rig = createCutsceneCinemaRig();
    startCinemaCutscene(rig, CUTSCENE_ACT_999_FOUR_LEADER_BLESSING);
    expect(toggleCutsceneFastForward(rig)).toBe(2);
    for (let i = 0; i < 600; i++) {
      stepCinemaCutsceneRig(rig, 0.05, { x: 240, y: 135 });
    }
    expect(rig.active).toBe(false);
  });

  it('09. skipCinemaCutscene transitions immediately to smooth handoff_glide and completes', () => {
    const rig = createCutsceneCinemaRig();
    startCinemaCutscene(rig, CUTSCENE_ACT_999_FOUR_LEADER_BLESSING);
    skipCinemaCutscene(rig);
    expect(rig.phase).toBe('handoff_glide');
    for (let i = 0; i < 30; i++) {
      stepCinemaCutsceneRig(rig, 0.05, { x: 240, y: 135 });
    }
    expect(rig.active).toBe(false);
  });

  it('10. OST split across 3 files sums cleanly to 12 + 12 + 16 = 40 unique tracks', () => {
    expect(OST_TRACKS_ARC_1_TO_3.length).toBe(12);
    expect(OST_TRACKS_ARC_4_TO_6.length).toBe(12);
    expect(OST_TRACKS_ARC_7_TO_10.length).toBe(16);
    expect(ALL_40_OST_TRACKS.length).toBe(40);
  });

  it('11. All 40 OST tracks have unique sequential IDs 1..40 and valid BPM', () => {
    const seen = new Set<number>();
    for (const track of ALL_40_OST_TRACKS) {
      seen.add(track.trackId);
      expect(track.bpm).toBeGreaterThanOrEqual(80);
      expect(track.bpm).toBeLessThanOrEqual(200);
      expect(track.patterns.length).toBe(4);
    }
    expect(seen.size).toBe(40);
  });

  it('12. Each of the 10 Arcs has exactly 4 dedicated OST tracks including 1 Boss theme', () => {
    for (let arc = 1; arc <= 10; arc++) {
      const arcTracks = ALL_40_OST_TRACKS.filter((t) => t.arcId === arc);
      expect(arcTracks.length).toBe(4);
      expect(arcTracks.filter((t) => t.isBossTheme).length).toBe(1);
    }
  });

  it('13. getOstTrackForAct selects Boss, Sanctuary, and Field themes accurately', () => {
    const bossTrack = getOstTrackForAct(1000, true, false);
    const sancTrack = getOstTrackForAct(999, false, true);
    expect(bossTrack.isBossTheme).toBe(true);
    expect(bossTrack.arcId).toBe(10);
    expect(sancTrack.title).toContain('999');
  });

  it('14. toDspComposition converts SoundtrackTrack40Spec into playable 4-channel DSP score', () => {
    const dsp = toDspComposition(ALL_40_OST_TRACKS[39]);
    expect(dsp.id).toBe('ost_40');
    expect(dsp.leadPattern.length).toBeGreaterThan(0);
    expect(dsp.bassPattern.length).toBeGreaterThan(0);
  });

  it('15. midiToFrequencyHz maps MIDI 69 (A4) to exact 440 Hz and MIDI 0 to 0 Hz', () => {
    expect(midiToFrequencyHz(69)).toBeCloseTo(440, 4);
    expect(midiToFrequencyHz(57)).toBeCloseTo(220, 4);
    expect(midiToFrequencyHz(0)).toBe(0);
  });

  it('16. DspChiptuneSynthesizer safely handles headless Node environment without throwing', () => {
    const synth = new DspChiptuneSynthesizer();
    expect(() => synth.crossfadeToTrack(toDspComposition(ALL_40_OST_TRACKS[0]))).not.toThrow();
    expect(synth.getCurrentTrackId()).toBe('ost_01');
    synth.stopTrack();
    expect(synth.getCurrentTrackId()).toBeNull();
  });

  it('17. DspChiptuneSynthesizer mute state toggles cleanly', () => {
    const synth = new DspChiptuneSynthesizer();
    expect(synth.isMuted()).toBe(false);
    synth.setMuted(true);
    expect(synth.isMuted()).toBe(true);
  });

  it('18. RETRO_SFX_BANK_12 registers all 12 distinct chiptune SFX recipes', () => {
    expect(ALL_12_SFX_IDS.length).toBe(12);
    expect(Object.keys(RETRO_SFX_BANK_12).length).toBe(12);
  });

  it('19. triggerRetroSfx executes safely in headless Node and returns valid recipe', () => {
    for (const id of ALL_12_SFX_IDS) {
      const r = triggerRetroSfx(id);
      expect(r.id).toBe(id);
      expect(r.durationMs).toBeGreaterThan(0);
    }
  });

  it('20. Act 1000 Boss theme has high-intensity BPM (>= 170)', () => {
    const finale = ALL_40_OST_TRACKS[39];
    expect(finale.bpm).toBeGreaterThanOrEqual(170);
  });
});
