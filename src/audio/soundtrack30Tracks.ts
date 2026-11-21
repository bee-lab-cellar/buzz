/**
 * Pillar 3 — Complete 30-Track 16-Bit Chiptune & FM Soundtrack Suite
 *
 * 30 distinct musical compositions spanning all 6 Story Arcs, Sanctuaries,
 * Mini-Boss Encounters, Final Boss Phases, Royal Capital Hub, Cutscene Cinema,
 * and Replay Theater. Every track has explicit melodic, harmonic, bass, and
 * percussion patterns consumed directly by `DspChiptuneSynthesizer`.
 */

import type { DspSoundtrackComposition, DspWaveShape, SoundtrackStepNote } from './dspChiptuneSynthesizer';

interface TrackSeedSpec {
  readonly id: string;
  readonly title: string;
  readonly arc: 1 | 2 | 3 | 4 | 5 | 6 | 0;
  readonly mood: DspSoundtrackComposition['mood'];
  readonly bpm: number;
  readonly rootMidi: number;
  readonly scaleIntervals: ReadonlyArray<number>;
  readonly melodyDegrees: ReadonlyArray<number>;
  readonly bassDegrees: ReadonlyArray<number>;
  readonly drumPattern: string;
  readonly filterCutoffHz: number;
  readonly fmModIndex: number;
  readonly leadWave: DspWaveShape;
  readonly harmonyWave: DspWaveShape;
}

const MAJOR_HEROIC: ReadonlyArray<number> = [0, 2, 4, 5, 7, 9, 11, 12];
const DORIAN_QUEST: ReadonlyArray<number> = [0, 2, 3, 5, 7, 9, 10, 12];
const PHRYGIAN_BOSS: ReadonlyArray<number> = [0, 1, 3, 5, 7, 8, 10, 12];
const MINOR_DRAMATIC: ReadonlyArray<number> = [0, 2, 3, 5, 7, 8, 10, 12];
const LYDIAN_ASTRAL: ReadonlyArray<number> = [0, 2, 4, 6, 7, 9, 11, 12];
const PENTATONIC_SANCTUARY: ReadonlyArray<number> = [0, 2, 4, 7, 9, 12, 14, 16];

function degToMidi(root: number, scale: ReadonlyArray<number>, deg: number): number {
  if (deg < 0) return 0;
  const oct = Math.floor(deg / scale.length);
  const idx = deg % scale.length;
  return root + oct * 12 + scale[idx];
}

function compileTrack(seed: TrackSeedSpec, index: number): DspSoundtrackComposition {
  const leadPattern: SoundtrackStepNote[] = seed.melodyDegrees.map((deg, i) => ({
    midi: degToMidi(seed.rootMidi + 12, seed.scaleIntervals, deg),
    steps: deg < 0 ? 1 : i % 4 === 0 ? 2 : 1,
    velocity: i % 4 === 0 ? 0.92 : 0.74,
  }));

  const harmonyPattern: SoundtrackStepNote[] = seed.melodyDegrees.map((deg, i) => ({
    midi: deg < 0 ? 0 : degToMidi(seed.rootMidi, seed.scaleIntervals, Math.max(0, deg - 2)),
    steps: 2,
    velocity: i % 2 === 0 ? 0.62 : 0.45,
  }));

  const bassPattern: SoundtrackStepNote[] = seed.bassDegrees.map((deg, i) => ({
    midi: degToMidi(seed.rootMidi - 12, seed.scaleIntervals, deg),
    steps: i % 2 === 0 ? 2 : 1,
    velocity: i % 4 === 0 ? 0.95 : 0.78,
  }));

  return {
    id: seed.id,
    index,
    title: seed.title,
    arc: seed.arc,
    mood: seed.mood,
    bpm: seed.bpm,
    filterCutoffHz: seed.filterCutoffHz,
    fmModIndex: seed.fmModIndex,
    leadWave: seed.leadWave,
    harmonyWave: seed.harmonyWave,
    leadPattern,
    harmonyPattern,
    bassPattern,
    drumPattern: seed.drumPattern,
  };
}

const TRACK_SEEDS: ReadonlyArray<TrackSeedSpec> = [
  // 1-4: Title, Capital, Cinema, Dojo
  {
    id: 'trk_01_crown_overture',
    title: 'Claws of the Crown — Overture',
    arc: 0,
    mood: 'heroic',
    bpm: 132,
    rootMidi: 62,
    scaleIntervals: MAJOR_HEROIC,
    melodyDegrees: [0, 2, 4, 7, 6, 4, 2, 4, 5, 4, 2, 0, 4, 5, 7, -1],
    bassDegrees: [0, 0, 4, 4, 5, 5, 3, 4],
    drumPattern: 'K.H.S.H.K.HKS.H.',
    filterCutoffHz: 4200,
    fmModIndex: 0.45,
    leadWave: 'square',
    harmonyWave: 'triangle',
  },
  {
    id: 'trk_02_royal_capital_hearth',
    title: 'Sunlit Whisker Capital',
    arc: 0,
    mood: 'capital',
    bpm: 112,
    rootMidi: 60,
    scaleIntervals: PENTATONIC_SANCTUARY,
    melodyDegrees: [0, 2, 4, 5, 4, 2, 1, 2, 4, 5, 7, 5, 4, 2, 0, -1],
    bassDegrees: [0, -1, 3, -1, 4, -1, 2, -1],
    drumPattern: 'K...H...S...H...',
    filterCutoffHz: 3100,
    fmModIndex: 0.25,
    leadWave: 'fm_bell',
    harmonyWave: 'triangle',
  },
  {
    id: 'trk_03_cinema_chronicle',
    title: 'Chronicle of the Four Kings',
    arc: 0,
    mood: 'cinema',
    bpm: 96,
    rootMidi: 57,
    scaleIntervals: MINOR_DRAMATIC,
    melodyDegrees: [0, -1, 2, 3, 4, -1, 3, 2, 0, -1, 4, 5, 7, -1, 4, -1],
    bassDegrees: [0, 0, 5, 5, 3, 3, 4, 4],
    drumPattern: 'K.......S...H...',
    filterCutoffHz: 2600,
    fmModIndex: 0.55,
    leadWave: 'fm_bell',
    harmonyWave: 'sine',
  },
  {
    id: 'trk_04_training_dojo',
    title: 'Sparring Grounds of Nyx',
    arc: 0,
    mood: 'heroic',
    bpm: 128,
    rootMidi: 64,
    scaleIntervals: DORIAN_QUEST,
    melodyDegrees: [0, 3, 4, 3, 2, 0, 4, 5, 7, 5, 4, 2, 3, 2, 0, -1],
    bassDegrees: [0, 0, 3, 3, 4, 4, 2, 4],
    drumPattern: 'K.H.S.H.K.H.S.HH',
    filterCutoffHz: 3900,
    fmModIndex: 0.3,
    leadWave: 'square',
    harmonyWave: 'triangle',
  },

  // 5-8: Arc I — Verdant Forest & Cat Kingdom (Acts 1–41)
  {
    id: 'trk_05_verdant_meadows',
    title: 'Verdant Whisker Meadows',
    arc: 1,
    mood: 'forest',
    bpm: 122,
    rootMidi: 62,
    scaleIntervals: MAJOR_HEROIC,
    melodyDegrees: [0, 1, 2, 4, 5, 4, 2, 1, 2, 4, 5, 7, 5, 4, 2, 0],
    bassDegrees: [0, 4, 5, 3, 0, 4, 2, 4],
    drumPattern: 'K.H.S.H.K.H.S.H.',
    filterCutoffHz: 3800,
    fmModIndex: 0.25,
    leadWave: 'square',
    harmonyWave: 'triangle',
  },
  {
    id: 'trk_06_canopy_skirmish',
    title: 'Emerald Canopy Skirmish',
    arc: 1,
    mood: 'battle',
    bpm: 142,
    rootMidi: 64,
    scaleIntervals: DORIAN_QUEST,
    melodyDegrees: [0, 2, 3, 5, 4, 3, 2, 0, 5, 4, 3, 2, 3, 4, 6, 7],
    bassDegrees: [0, 0, 2, 2, 3, 3, 4, 4],
    drumPattern: 'K.HHS.HHK.HHS.HK',
    filterCutoffHz: 4600,
    fmModIndex: 0.5,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
  },
  {
    id: 'trk_07_sanctuary_act40',
    title: 'Emerald Sanctuary — Act 40',
    arc: 1,
    mood: 'sanctuary',
    bpm: 94,
    rootMidi: 65,
    scaleIntervals: PENTATONIC_SANCTUARY,
    melodyDegrees: [0, -1, 2, 4, 5, -1, 4, 2, 1, -1, 2, 4, 2, -1, 0, -1],
    bassDegrees: [0, -1, 2, -1, 3, -1, 4, -1],
    drumPattern: 'K.......H.......',
    filterCutoffHz: 2500,
    fmModIndex: 0.35,
    leadWave: 'fm_bell',
    harmonyWave: 'sine',
  },
  {
    id: 'trk_08_ironpaw_boss',
    title: 'Wrath of Warlord Ironpaw',
    arc: 1,
    mood: 'boss',
    bpm: 154,
    rootMidi: 57,
    scaleIntervals: PHRYGIAN_BOSS,
    melodyDegrees: [0, 1, 3, 4, 3, 1, 0, 4, 5, 4, 3, 1, 0, 1, 3, 5],
    bassDegrees: [0, 1, 0, 3, 4, 3, 1, 0],
    drumPattern: 'KKH.S.HKKKH.S.SH',
    filterCutoffHz: 5200,
    fmModIndex: 0.95,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
  },

  // 9-12: Arc II — Wolf-King Fenrir's Iron Wastes (Acts 42–82)
  {
    id: 'trk_09_iron_wastes_march',
    title: 'March Across the Iron Wastes',
    arc: 2,
    mood: 'battle',
    bpm: 136,
    rootMidi: 59,
    scaleIntervals: MINOR_DRAMATIC,
    melodyDegrees: [0, 0, 2, 3, 4, 3, 2, -1, 5, 4, 3, 2, 0, 2, 4, -1],
    bassDegrees: [0, 0, 3, 3, 5, 4, 2, 0],
    drumPattern: 'K.H.S.H.KKH.S.H.',
    filterCutoffHz: 3900,
    fmModIndex: 0.65,
    leadWave: 'square',
    harmonyWave: 'sawtooth',
  },
  {
    id: 'trk_10_trench_siege',
    title: 'Siege of Howling Canyon',
    arc: 2,
    mood: 'battle',
    bpm: 148,
    rootMidi: 58,
    scaleIntervals: PHRYGIAN_BOSS,
    melodyDegrees: [0, 1, 0, 3, 4, 3, 1, 0, 7, 5, 4, 3, 1, 3, 4, 5],
    bassDegrees: [0, 0, 1, 1, 3, 3, 4, 1],
    drumPattern: 'K.HKS.HKK.HKS.SH',
    filterCutoffHz: 4800,
    fmModIndex: 0.85,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
  },
  {
    id: 'trk_11_sanctuary_act81',
    title: 'Truce of the Wolf Shrine — Act 81',
    arc: 2,
    mood: 'sanctuary',
    bpm: 92,
    rootMidi: 60,
    scaleIntervals: DORIAN_QUEST,
    melodyDegrees: [0, -1, 3, 4, 6, -1, 4, 3, 2, -1, 3, 4, 2, -1, 0, -1],
    bassDegrees: [0, -1, 4, -1, 3, -1, 2, -1],
    drumPattern: 'K.......H...H...',
    filterCutoffHz: 2400,
    fmModIndex: 0.4,
    leadWave: 'fm_bell',
    harmonyWave: 'triangle',
  },
  {
    id: 'trk_12_fenrir_duel',
    title: 'Fang & Crown — Wolf-King Fenrir',
    arc: 2,
    mood: 'boss',
    bpm: 158,
    rootMidi: 55,
    scaleIntervals: MINOR_DRAMATIC,
    melodyDegrees: [0, 3, 4, 7, 6, 4, 3, 2, 0, 4, 5, 7, 6, 5, 4, 2],
    bassDegrees: [0, 0, 5, 5, 3, 4, 6, 5],
    drumPattern: 'KKHKS.HKKKHKS.SH',
    filterCutoffHz: 5400,
    fmModIndex: 1.05,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
  },

  // 13-16: Arc III — Draconic Sky-Spire & Ignis-Bahamut (Acts 83–122)
  {
    id: 'trk_13_obsidian_ascent',
    title: 'Obsidian Sky-Spire Ascent',
    arc: 3,
    mood: 'dragon_sky',
    bpm: 140,
    rootMidi: 62,
    scaleIntervals: DORIAN_QUEST,
    melodyDegrees: [0, 2, 4, 7, 6, 7, 4, 2, 3, 4, 6, 7, 6, 4, 2, 0],
    bassDegrees: [0, 0, 4, 4, 6, 5, 3, 4],
    drumPattern: 'K.HHS.H.K.HHS.HK',
    filterCutoffHz: 4700,
    fmModIndex: 0.75,
    leadWave: 'fm_bell',
    harmonyWave: 'sawtooth',
  },
  {
    id: 'trk_14_sky_harpoon_raid',
    title: 'Harpoon Ballista Sky-Siege',
    arc: 3,
    mood: 'dragon_sky',
    bpm: 152,
    rootMidi: 64,
    scaleIntervals: MINOR_DRAMATIC,
    melodyDegrees: [0, 4, 3, 4, 7, 6, 4, 3, 2, 5, 4, 5, 7, 6, 5, 4],
    bassDegrees: [0, 0, 3, 4, 5, 5, 6, 4],
    drumPattern: 'KKH.S.HKK.HKS.SH',
    filterCutoffHz: 5100,
    fmModIndex: 0.9,
    leadWave: 'square',
    harmonyWave: 'sawtooth',
  },
  {
    id: 'trk_15_sanctuary_act121',
    title: 'Dragon-Roost Sanctuary — Act 121',
    arc: 3,
    mood: 'sanctuary',
    bpm: 96,
    rootMidi: 62,
    scaleIntervals: LYDIAN_ASTRAL,
    melodyDegrees: [0, -1, 3, 4, 6, -1, 7, 4, 3, -1, 2, 4, 3, -1, 0, -1],
    bassDegrees: [0, -1, 3, -1, 4, -1, 2, -1],
    drumPattern: 'K.......H.......',
    filterCutoffHz: 2700,
    fmModIndex: 0.5,
    leadWave: 'fm_bell',
    harmonyWave: 'sine',
  },
  {
    id: 'trk_16_ignis_bahamut',
    title: 'Ignis-Bahamut — Lord of Embers',
    arc: 3,
    mood: 'boss',
    bpm: 164,
    rootMidi: 57,
    scaleIntervals: PHRYGIAN_BOSS,
    melodyDegrees: [0, 1, 4, 5, 7, 5, 4, 1, 0, 3, 4, 7, 6, 4, 3, 1],
    bassDegrees: [0, 1, 0, 4, 5, 4, 3, 1],
    drumPattern: 'KKHKS.HKKKHKSKSH',
    filterCutoffHz: 5800,
    fmModIndex: 1.25,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
  },

  // 17-20: Arc IV — Abyssal Kraken Armada & Charybdis (Acts 123–180)
  {
    id: 'trk_17_sunken_coral_trench',
    title: 'Sunken Coral Abyss',
    arc: 4,
    mood: 'abyssal',
    bpm: 126,
    rootMidi: 60,
    scaleIntervals: DORIAN_QUEST,
    melodyDegrees: [0, 2, 3, 6, 4, 3, 2, -1, 5, 4, 3, 2, 3, 6, 4, -1],
    bassDegrees: [0, -1, 3, 0, 5, -1, 4, 2],
    drumPattern: 'K.H.S.H.K..KS.H.',
    filterCutoffHz: 3200,
    fmModIndex: 0.6,
    leadWave: 'fm_bell',
    harmonyWave: 'triangle',
  },
  {
    id: 'trk_18_kraken_armada_clash',
    title: 'Tentacles of the Abyssal Armada',
    arc: 4,
    mood: 'abyssal',
    bpm: 146,
    rootMidi: 58,
    scaleIntervals: MINOR_DRAMATIC,
    melodyDegrees: [0, 3, 2, 3, 5, 4, 3, 2, 0, 5, 4, 5, 7, 6, 4, 3],
    bassDegrees: [0, 0, 5, 3, 4, 4, 2, 0],
    drumPattern: 'K.HKS.H.KKH.S.HH',
    filterCutoffHz: 4200,
    fmModIndex: 0.85,
    leadWave: 'square',
    harmonyWave: 'triangle',
  },
  {
    id: 'trk_19_sanctuary_act179',
    title: 'Tidal Sanctum — Act 179',
    arc: 4,
    mood: 'sanctuary',
    bpm: 90,
    rootMidi: 60,
    scaleIntervals: PENTATONIC_SANCTUARY,
    melodyDegrees: [0, -1, 4, 5, 4, -1, 2, 0, 1, -1, 4, 2, 0, -1, 2, -1],
    bassDegrees: [0, -1, 4, -1, 2, -1, 3, -1],
    drumPattern: 'K.......H.......',
    filterCutoffHz: 2300,
    fmModIndex: 0.45,
    leadWave: 'fm_bell',
    harmonyWave: 'sine',
  },
  {
    id: 'trk_20_charybdis_leviathan',
    title: 'Charybdis — 8-Tentacle Leviathan',
    arc: 4,
    mood: 'boss',
    bpm: 162,
    rootMidi: 56,
    scaleIntervals: PHRYGIAN_BOSS,
    melodyDegrees: [0, 1, 3, 7, 6, 4, 3, 1, 0, 4, 5, 7, 6, 5, 3, 1],
    bassDegrees: [0, 1, 3, 1, 4, 5, 3, 1],
    drumPattern: 'KKHKS.HKKKHKS.SH',
    filterCutoffHz: 5500,
    fmModIndex: 1.2,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
  },

  // 21-24: Arc V — Clockwork Steampunk Foundry & Chronos (Acts 181–240)
  {
    id: 'trk_21_brass_gear_citadel',
    title: 'Brass-Gear Clockwork Citadel',
    arc: 5,
    mood: 'steampunk',
    bpm: 138,
    rootMidi: 61,
    scaleIntervals: MINOR_DRAMATIC,
    melodyDegrees: [0, 2, 4, 2, 5, 4, 3, 2, 0, 4, 6, 4, 7, 6, 4, 2],
    bassDegrees: [0, 4, 0, 5, 3, 4, 2, 5],
    drumPattern: 'K.HHS.HHK.HHS.HH',
    filterCutoffHz: 4500,
    fmModIndex: 1.0,
    leadWave: 'fm_bell',
    harmonyWave: 'square',
  },
  {
    id: 'trk_22_foundry_overdrive',
    title: 'Steam-Mecha Foundry Overdrive',
    arc: 5,
    mood: 'steampunk',
    bpm: 150,
    rootMidi: 59,
    scaleIntervals: DORIAN_QUEST,
    melodyDegrees: [0, 3, 4, 6, 7, 6, 4, 3, 2, 4, 6, 7, 6, 4, 2, 0],
    bassDegrees: [0, 0, 2, 3, 4, 4, 6, 4],
    drumPattern: 'K.HKS.HKK.HKS.HK',
    filterCutoffHz: 4900,
    fmModIndex: 1.1,
    leadWave: 'square',
    harmonyWave: 'sawtooth',
  },
  {
    id: 'trk_23_sanctuary_act239',
    title: 'Chronos Belltower — Act 239',
    arc: 5,
    mood: 'sanctuary',
    bpm: 98,
    rootMidi: 64,
    scaleIntervals: LYDIAN_ASTRAL,
    melodyDegrees: [0, -1, 4, 3, 6, -1, 4, 2, 0, -1, 3, 4, 7, -1, 4, -1],
    bassDegrees: [0, -1, 4, -1, 2, -1, 4, -1],
    drumPattern: 'K...H...K...H...',
    filterCutoffHz: 2900,
    fmModIndex: 0.65,
    leadWave: 'fm_bell',
    harmonyWave: 'triangle',
  },
  {
    id: 'trk_24_chronos_gearlord',
    title: 'Chronos — Master of Infinite Gears',
    arc: 5,
    mood: 'boss',
    bpm: 166,
    rootMidi: 57,
    scaleIntervals: MINOR_DRAMATIC,
    melodyDegrees: [0, 4, 7, 6, 5, 4, 3, 2, 0, 3, 7, 6, 7, 5, 4, 2],
    bassDegrees: [0, 0, 4, 5, 6, 5, 3, 4],
    drumPattern: 'KKHKS.HKKKHKSKSH',
    filterCutoffHz: 5900,
    fmModIndex: 1.3,
    leadWave: 'fm_bell',
    harmonyWave: 'sawtooth',
  },

  // 25-30: Arc VI — Astral Star-Forge, Void Sovereign & Grand Finale (Acts 241–300)
  {
    id: 'trk_25_astral_star_bridge',
    title: 'Astral Star-Bridge Horizon',
    arc: 6,
    mood: 'cosmic',
    bpm: 134,
    rootMidi: 64,
    scaleIntervals: LYDIAN_ASTRAL,
    melodyDegrees: [0, 2, 4, 6, 7, 6, 4, 3, 4, 6, 7, 6, 4, 2, 3, 0],
    bassDegrees: [0, 0, 3, 3, 4, 4, 6, 4],
    drumPattern: 'K.H.S.HHK.H.S.H.',
    filterCutoffHz: 4600,
    fmModIndex: 0.8,
    leadWave: 'fm_bell',
    harmonyWave: 'sine',
  },
  {
    id: 'trk_26_void_rift_vanguard',
    title: 'Void-Rift Vanguard',
    arc: 6,
    mood: 'cosmic',
    bpm: 152,
    rootMidi: 60,
    scaleIntervals: PHRYGIAN_BOSS,
    melodyDegrees: [0, 1, 4, 3, 7, 6, 4, 3, 1, 4, 5, 7, 6, 4, 1, 0],
    bassDegrees: [0, 1, 4, 3, 5, 4, 1, 0],
    drumPattern: 'KKH.S.HKK.HKS.SH',
    filterCutoffHz: 5300,
    fmModIndex: 1.15,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
  },
  {
    id: 'trk_27_sanctuary_act299',
    title: 'Star-Forge Eve — Act 299',
    arc: 6,
    mood: 'sanctuary',
    bpm: 88,
    rootMidi: 62,
    scaleIntervals: LYDIAN_ASTRAL,
    melodyDegrees: [0, -1, 4, 6, 7, -1, 6, 4, 2, -1, 3, 4, 6, -1, 7, -1],
    bassDegrees: [0, -1, 4, -1, 3, -1, 5, -1],
    drumPattern: 'K.......H.......',
    filterCutoffHz: 2600,
    fmModIndex: 0.55,
    leadWave: 'fm_bell',
    harmonyWave: 'sine',
  },
  {
    id: 'trk_28_void_sovereign_phase1',
    title: 'Void Sovereign — Eclipse Phase I',
    arc: 6,
    mood: 'boss',
    bpm: 168,
    rootMidi: 55,
    scaleIntervals: PHRYGIAN_BOSS,
    melodyDegrees: [0, 1, 3, 4, 7, 6, 4, 3, 1, 3, 5, 7, 6, 4, 3, 1],
    bassDegrees: [0, 1, 0, 4, 5, 4, 3, 1],
    drumPattern: 'KKHKS.HKKKHKSKSH',
    filterCutoffHz: 6000,
    fmModIndex: 1.35,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
  },
  {
    id: 'trk_29_great_duck_elixir_surge',
    title: "The Great Duck's Elixir — 20s Hyper Surge",
    arc: 6,
    mood: 'heroic',
    bpm: 174,
    rootMidi: 65,
    scaleIntervals: MAJOR_HEROIC,
    melodyDegrees: [0, 2, 4, 7, 5, 7, 4, 5, 7, 6, 7, 5, 4, 2, 4, 7],
    bassDegrees: [0, 4, 5, 4, 3, 4, 5, 7],
    drumPattern: 'KKHKS.HKKKHKSKSH',
    filterCutoffHz: 6200,
    fmModIndex: 0.7,
    leadWave: 'square',
    harmonyWave: 'triangle',
  },
  {
    id: 'trk_30_coronation_epilogue',
    title: 'Coronation of the Four Kings (Act 300 Finale)',
    arc: 6,
    mood: 'heroic',
    bpm: 118,
    rootMidi: 62,
    scaleIntervals: MAJOR_HEROIC,
    melodyDegrees: [0, 2, 4, 5, 7, -1, 5, 4, 2, 4, 5, 7, 6, 5, 4, 7],
    bassDegrees: [0, 0, 5, 5, 3, 3, 4, 4],
    drumPattern: 'K.H.S.H.K.H.S.HH',
    filterCutoffHz: 4100,
    fmModIndex: 0.45,
    leadWave: 'fm_bell',
    harmonyWave: 'triangle',
  },
];

export const SOUNDTRACK_30_TRACKS: ReadonlyArray<DspSoundtrackComposition> = TRACK_SEEDS.map(
  (seed, idx) => compileTrack(seed, idx + 1),
);

export function getSoundtrackTrackForAct(
  actId: number,
  isSanctuary: boolean,
  isBoss: boolean,
): DspSoundtrackComposition {
  if (actId <= 41) {
    if (isBoss) return SOUNDTRACK_30_TRACKS[7];
    if (isSanctuary) return SOUNDTRACK_30_TRACKS[6];
    return actId % 2 === 0 ? SOUNDTRACK_30_TRACKS[5] : SOUNDTRACK_30_TRACKS[4];
  }
  if (actId <= 82) {
    if (isBoss) return SOUNDTRACK_30_TRACKS[11];
    if (isSanctuary) return SOUNDTRACK_30_TRACKS[10];
    return actId % 2 === 0 ? SOUNDTRACK_30_TRACKS[9] : SOUNDTRACK_30_TRACKS[8];
  }
  if (actId <= 122) {
    if (isBoss) return SOUNDTRACK_30_TRACKS[15];
    if (isSanctuary) return SOUNDTRACK_30_TRACKS[14];
    return actId % 2 === 0 ? SOUNDTRACK_30_TRACKS[13] : SOUNDTRACK_30_TRACKS[12];
  }
  if (actId <= 180) {
    if (isBoss) return SOUNDTRACK_30_TRACKS[19];
    if (isSanctuary) return SOUNDTRACK_30_TRACKS[18];
    return actId % 2 === 0 ? SOUNDTRACK_30_TRACKS[17] : SOUNDTRACK_30_TRACKS[16];
  }
  if (actId <= 240) {
    if (isBoss) return SOUNDTRACK_30_TRACKS[23];
    if (isSanctuary) return SOUNDTRACK_30_TRACKS[22];
    return actId % 2 === 0 ? SOUNDTRACK_30_TRACKS[21] : SOUNDTRACK_30_TRACKS[20];
  }
  if (isBoss) return SOUNDTRACK_30_TRACKS[27];
  if (isSanctuary) return SOUNDTRACK_30_TRACKS[26];
  return actId % 2 === 0 ? SOUNDTRACK_30_TRACKS[25] : SOUNDTRACK_30_TRACKS[24];
}
