import { BiomeId, CutsceneCue } from './types';

export type TrackId =
  | 'none'
  | 'track_01_prologue'
  | 'track_01_storm'
  | 'track_02_woods'
  | 'track_03_ravine'
  | 'track_04_fungal'
  | 'track_05_autumn'
  | 'track_06_frost'
  | 'track_07_lava'
  | 'track_08_marsh'
  | 'track_09_astral'
  | 'track_10_sanctuary'
  | 'track_11_miniboss'
  | 'track_12_boss'
  | 'track_13_fenrir_p1'
  | 'track_14_fenrir_p2'
  | 'track_14_epilogue'
  | 'track_15_march'
  | 'track_16_siege'
  | 'track_17_banners'
  | 'track_18_ragnarok'
  | 'track_19_cataclysm'
  | 'track_20_united'
  | 'track_21_wyrms'
  | 'track_22_bahamut';

export type LegacyThemeAlias = 'calm' | 'adventure' | 'sanctuary' | 'boss' | 'victory';

interface ChiptuneTrackSpec {
  id: TrackId;
  title: string;
  bpm: number;
  leadWave: OscillatorType;
  harmonyWave: OscillatorType;
  bassWave: OscillatorType;
  lead: number[];
  harmony: number[];
  bass: number[];
  drums: ('K' | 'S' | 'H' | '.')[];
}

// MIDI note to Hz helper for clean musical scales
const N = (midi: number): number => (midi <= 0 ? 0 : 440 * Math.pow(2, (midi - 69) / 12));

const TRACK_LIBRARY: Record<Exclude<TrackId, 'none'>, ChiptuneTrackSpec> = {
  // Track 01A: Prologue Royal Citadel Theme ("Crown of Starlight") — Noble C-Major fanfare (96 BPM)
  track_01_prologue: {
    id: 'track_01_prologue',
    title: '01 · Crown of Starlight',
    bpm: 96,
    leadWave: 'triangle',
    harmonyWave: 'sine',
    bassWave: 'triangle',
    lead: [N(72), N(76), N(79), N(84), N(83), N(79), N(76), N(72), N(74), N(77), N(81), N(79), N(76), N(74), N(72), 0],
    harmony: [N(64), N(67), N(72), N(76), N(71), N(67), N(64), N(60), N(65), N(69), N(72), N(71), N(67), N(65), N(64), 0],
    bass: [N(48), 0, N(55), 0, N(45), 0, N(52), 0, N(41), 0, N(48), 0, N(43), 0, N(48), 0],
    drums: ['K', '.', 'H', '.', 'S', '.', 'H', '.', 'K', '.', 'H', '.', 'S', '.', 'H', '.'],
  },
  // Track 01B: Prologue Breach ("Shattered Glass") — Tense D-Minor storm march (132 BPM)
  track_01_storm: {
    id: 'track_01_storm',
    title: '01 · Shattered Star-Wand',
    bpm: 132,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(62), N(65), N(69), N(70), N(69), N(65), N(61), N(62), N(74), N(73), N(70), N(69), N(65), N(64), N(62), 0],
    harmony: [N(57), 0, N(62), 0, N(58), 0, N(57), 0, N(65), 0, N(64), 0, N(62), 0, N(57), 0],
    bass: [N(38), N(38), N(50), N(38), N(46), N(46), N(45), N(45), N(38), N(38), N(43), N(43), N(45), N(45), N(38), 0],
    drums: ['K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'S', 'K', 'S'],
  },
  // Track 02: Biome 1 (Acts 1–4): Whispering Goblin Woods ("Paws in the Pine") — Heroic A-Minor / C-Major (125 BPM)
  track_02_woods: {
    id: 'track_02_woods',
    title: '02 · Paws in the Pine',
    bpm: 125,
    leadWave: 'square',
    harmonyWave: 'triangle',
    bassWave: 'triangle',
    lead: [N(69), N(72), N(76), N(81), N(79), N(76), N(72), N(74), N(76), N(79), N(84), N(83), N(81), N(76), N(79), N(69)],
    harmony: [N(60), N(64), N(69), N(72), N(67), N(64), N(60), N(62), N(64), N(67), N(72), N(71), N(69), N(64), N(67), N(60)],
    bass: [N(45), N(57), N(45), N(57), N(48), N(60), N(50), N(62), N(52), N(64), N(48), N(60), N(43), N(55), N(45), N(57)],
    drums: ['K', 'H', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'H'],
  },
  // Track 03: Biome 2 (Acts 6–9): Howling Bramble Ravine ("Thorn & Tusk") — Driving Dorian wilderness (134 BPM)
  track_03_ravine: {
    id: 'track_03_ravine',
    title: '03 · Thorn & Tusk',
    bpm: 134,
    leadWave: 'square',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    lead: [N(62), N(65), N(69), N(71), N(74), N(71), N(69), N(65), N(64), N(67), N(71), N(74), N(72), N(69), N(65), N(62)],
    harmony: [N(50), N(57), N(62), 0, N(55), N(59), N(62), 0, N(52), N(59), N(64), 0, N(57), N(60), N(57), 0],
    bass: [N(38), N(38), N(50), N(38), N(43), N(43), N(55), N(43), N(40), N(40), N(52), N(40), N(45), N(43), N(40), N(38)],
    drums: ['K', 'K', 'S', 'H', 'K', 'H', 'S', 'K', 'K', 'K', 'S', 'H', 'K', 'S', 'K', 'S'],
  },
  // Track 04: Biome 3 (Acts 11–14): Fungal Glow-Shroom Grotto ("Bioluminescent Bounce") — Lydian/Pentatonic (112 BPM)
  track_04_fungal: {
    id: 'track_04_fungal',
    title: '04 · Bioluminescent Bounce',
    bpm: 112,
    leadWave: 'triangle',
    harmonyWave: 'sine',
    bassWave: 'triangle',
    lead: [N(72), N(78), N(79), N(84), N(83), N(79), N(78), N(72), N(74), N(79), N(83), N(86), N(84), N(79), N(76), 0],
    harmony: [N(60), N(67), N(72), N(78), N(67), N(74), N(79), N(74), N(62), N(69), N(74), N(78), N(64), N(71), N(76), 0],
    bass: [N(48), 0, N(60), N(55), N(47), 0, N(59), N(55), N(50), 0, N(62), N(57), N(45), 0, N(57), N(52)],
    drums: ['K', 'H', '.', 'H', 'S', 'H', '.', 'H', 'K', 'H', 'K', 'H', 'S', 'H', '.', 'H'],
  },
  // Track 05: Biome 4 (Acts 16–19): Crimson Autumn Canopy ("Blades in the Wind") — Samurai E-Minor (140 BPM)
  track_05_autumn: {
    id: 'track_05_autumn',
    title: '05 · Blades in the Wind',
    bpm: 140,
    leadWave: 'square',
    harmonyWave: 'triangle',
    bassWave: 'sawtooth',
    lead: [N(76), N(79), N(81), N(83), N(86), N(83), N(81), N(79), N(76), N(74), N(71), N(74), N(76), N(79), N(76), 0],
    harmony: [N(64), N(71), N(76), N(71), N(67), N(74), N(79), N(74), N(62), N(69), N(74), N(69), N(64), N(71), N(64), 0],
    bass: [N(40), N(52), N(40), N(52), N(43), N(55), N(43), N(55), N(38), N(50), N(38), N(50), N(40), N(52), N(47), N(40)],
    drums: ['K', 'H', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'S', 'H', 'S'],
  },
  // Track 06: Biome 5 (Acts 21–24): Frostpeak Crystal Caverns ("Waltz of Eternal Rime") — Shimmering 3/4 Waltz (118 BPM)
  track_06_frost: {
    id: 'track_06_frost',
    title: '06 · Waltz of Eternal Rime',
    bpm: 118,
    leadWave: 'sine',
    harmonyWave: 'triangle',
    bassWave: 'triangle',
    lead: [N(76), N(79), N(84), N(83), N(79), N(76), N(81), N(77), N(72), N(79), N(76), N(74)],
    harmony: [N(60), N(67), N(72), N(59), N(67), N(71), N(57), N(65), N(69), N(55), N(62), N(67)],
    bass: [N(48), 0, 0, N(47), 0, 0, N(45), 0, 0, N(43), 0, 0],
    drums: ['K', 'H', 'H', 'S', 'H', 'H', 'K', 'H', 'H', 'S', 'H', 'H'],
  },
  // Track 07: Biome 6 (Acts 26–29): Embercrag Lava Mines ("Crucible of Ash") — Phrygian-Dominant Metal (145 BPM)
  track_07_lava: {
    id: 'track_07_lava',
    title: '07 · Crucible of Ash',
    bpm: 145,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(64), N(65), N(68), N(69), N(71), N(69), N(68), N(65), N(64), N(76), N(73), N(71), N(69), N(68), N(65), N(64)],
    harmony: [N(52), N(53), N(56), N(57), N(59), N(57), N(56), N(53), N(52), N(64), N(61), N(59), N(57), N(56), N(53), N(52)],
    bass: [N(40), N(40), N(41), N(40), N(40), N(44), N(45), N(40), N(40), N(40), N(47), N(45), N(44), N(41), N(40), N(40)],
    drums: ['K', 'K', 'S', 'K', 'K', 'K', 'S', 'H', 'K', 'K', 'S', 'K', 'K', 'S', 'K', 'S'],
  },
  // Track 08: Biome 7 (Acts 31–34): Cursed Blight Marsh ("Miasma Catacombs") — Eerie Harmonic-Minor (104 BPM)
  track_08_marsh: {
    id: 'track_08_marsh',
    title: '08 · Miasma Catacombs',
    bpm: 104,
    leadWave: 'triangle',
    harmonyWave: 'sine',
    bassWave: 'sawtooth',
    lead: [N(69), N(72), N(76), N(80), N(81), N(80), N(76), N(72), N(71), N(74), N(77), N(80), N(76), N(72), N(68), N(69)],
    harmony: [N(57), 0, N(64), 0, N(60), 0, N(57), 0, N(56), 0, N(62), 0, N(64), 0, N(56), 0],
    bass: [N(45), N(46), N(45), N(44), N(45), N(48), N(47), N(44), N(45), N(41), N(40), N(44), N(45), 0, N(33), 0],
    drums: ['K', '.', 'H', '.', 'S', '.', 'H', '.', 'K', '.', 'H', 'K', 'S', '.', 'H', '.'],
  },
  // Track 09: Biome 8 (Acts 36–38): Astral Bamboo Grove ("Starlight Ascent") — Cosmic Pentatonic (128 BPM)
  track_09_astral: {
    id: 'track_09_astral',
    title: '09 · Starlight Ascent',
    bpm: 128,
    leadWave: 'square',
    harmonyWave: 'sine',
    bassWave: 'triangle',
    lead: [N(74), N(77), N(81), N(84), N(86), N(89), N(86), N(84), N(81), N(84), N(86), N(91), N(89), N(86), N(81), N(77)],
    harmony: [N(62), N(69), N(74), N(77), N(65), N(72), N(77), N(81), N(67), N(74), N(79), N(84), N(69), N(76), N(81), N(74)],
    bass: [N(50), N(62), N(50), N(62), N(46), N(58), N(46), N(58), N(48), N(60), N(48), N(60), N(45), N(57), N(50), N(62)],
    drums: ['K', 'H', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H'],
  },
  // Track 10: Act 40 & 80 Sanctuary of The Great Duck ("Sacred Lotus & Golden Quack") — Warm F-Major (88 BPM)
  track_10_sanctuary: {
    id: 'track_10_sanctuary',
    title: '10 · Sacred Lotus & Golden Quack',
    bpm: 88,
    leadWave: 'sine',
    harmonyWave: 'triangle',
    bassWave: 'triangle',
    lead: [N(77), N(81), N(84), N(89), N(88), N(84), N(81), N(77), N(79), N(82), N(86), N(84), N(81), N(79), N(77), 0],
    harmony: [N(65), N(69), N(72), N(77), N(64), N(67), N(72), N(76), N(62), N(65), N(70), N(74), N(60), N(64), N(69), 0],
    bass: [N(41), 0, N(53), 0, N(45), 0, N(57), 0, N(46), 0, N(58), 0, N(48), 0, N(41), 0],
    drums: ['K', '.', 'H', '.', '.', '.', 'H', '.', 'K', '.', 'H', '.', 'S', '.', 'H', '.'],
  },
  // Track 11: Mini-Boss Battle Theme ("Clash of Claws") — Urgent Arcade Duel (152 BPM)
  track_11_miniboss: {
    id: 'track_11_miniboss',
    title: '11 · Clash of Claws (Mini-Boss)',
    bpm: 152,
    leadWave: 'square',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    lead: [N(72), N(75), N(79), N(78), N(79), N(84), N(79), N(75), N(72), N(74), N(77), N(79), N(77), N(75), N(74), N(71)],
    harmony: [N(60), N(63), N(67), N(66), N(67), N(72), N(67), N(63), N(60), N(62), N(65), N(67), N(65), N(63), N(62), N(59)],
    bass: [N(36), N(48), N(36), N(48), N(39), N(51), N(39), N(51), N(41), N(53), N(41), N(53), N(43), N(55), N(43), N(36)],
    drums: ['K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'K', 'S', 'S', 'K', 'S'],
  },
  // Track 12: Major Regional Boss Theme ("Behemoth's Roar") — Symphonic Boss Anthem (160 BPM -> 184 BPM Overdrive)
  track_12_boss: {
    id: 'track_12_boss',
    title: "12 · Behemoth's Roar (Boss)",
    bpm: 160,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(69), N(72), N(71), N(74), N(76), N(74), N(72), N(71), N(69), N(76), N(77), N(76), N(74), N(72), N(71), N(67)],
    harmony: [N(57), N(60), N(59), N(62), N(64), N(62), N(60), N(59), N(57), N(64), N(65), N(64), N(62), N(60), N(59), N(55)],
    bass: [N(33), N(33), N(45), N(33), N(36), N(36), N(35), N(35), N(33), N(33), N(38), N(38), N(36), N(35), N(33), N(31)],
    drums: ['K', 'K', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'K', 'S', 'K', 'K', 'S', 'K', 'S'],
  },
  // Track 13: Final Boss Phase 1 ("Usurper King Fenrir — Stolen Starlight") — Baroque Organ & Synth Duel (158 BPM)
  track_13_fenrir_p1: {
    id: 'track_13_fenrir_p1',
    title: '13 · Stolen Starlight (Fenrir P1)',
    bpm: 158,
    leadWave: 'square',
    harmonyWave: 'sawtooth',
    bassWave: 'sawtooth',
    lead: [N(74), N(77), N(81), N(82), N(81), N(77), N(73), N(74), N(86), N(85), N(82), N(81), N(77), N(76), N(74), N(69)],
    harmony: [N(62), N(65), N(69), N(70), N(69), N(65), N(61), N(62), N(74), N(73), N(70), N(69), N(65), N(64), N(62), N(57)],
    bass: [N(38), N(50), N(38), N(50), N(46), N(58), N(45), N(57), N(38), N(50), N(43), N(55), N(45), N(57), N(38), N(38)],
    drums: ['K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'S', 'K', 'S'],
  },
  // Track 14A: Final Boss Phase 2 ("Calamity Overlord") — Blistering 176 BPM Dual-Counterpoint Masterpiece
  track_14_fenrir_p2: {
    id: 'track_14_fenrir_p2',
    title: '14 · Calamity Overlord (Phase 2)',
    bpm: 176,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(76), N(79), N(83), N(84), N(88), N(86), N(84), N(83), N(81), N(84), N(88), N(91), N(88), N(84), N(83), N(79)],
    harmony: [N(64), N(67), N(71), N(72), N(76), N(74), N(72), N(71), N(69), N(72), N(76), N(79), N(76), N(72), N(71), N(67)],
    bass: [N(40), N(40), N(52), N(40), N(48), N(48), N(47), N(47), N(45), N(45), N(57), N(45), N(43), N(43), N(47), N(47)],
    drums: ['K', 'K', 'S', 'K', 'K', 'K', 'S', 'K', 'K', 'K', 'S', 'K', 'S', 'S', 'K', 'S'],
  },
  // Track 14B: Epilogue & Victory ("Dawn of the Two Kingdoms") — Triumphant Celebratory Medley (115 BPM)
  track_14_epilogue: {
    id: 'track_14_epilogue',
    title: '14 · Dawn of the Two Kingdoms',
    bpm: 115,
    leadWave: 'triangle',
    harmonyWave: 'square',
    bassWave: 'triangle',
    lead: [N(72), N(76), N(79), N(84), N(86), N(88), N(84), N(79), N(81), N(84), N(88), N(91), N(88), N(84), N(79), N(84)],
    harmony: [N(60), N(64), N(67), N(72), N(62), N(67), N(71), N(67), N(65), N(69), N(72), N(77), N(67), N(71), N(74), N(72)],
    bass: [N(48), 0, N(55), 0, N(50), 0, N(55), 0, N(41), 0, N(48), 0, N(43), 0, N(48), 0],
    drums: ['K', 'H', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'S', 'H', '.'],
  },
  // Track 15: "March of the Golden Lion" — Heroic brass/square-wave military march for Frontline War Acts (138 BPM)
  track_15_march: {
    id: 'track_15_march',
    title: '15 · March of the Golden Lion',
    bpm: 138,
    leadWave: 'square',
    harmonyWave: 'triangle',
    bassWave: 'sawtooth',
    lead: [N(74), 0, N(74), N(78), N(81), N(86), N(85), N(81), N(79), N(78), N(76), N(74), N(78), N(81), N(79), N(74)],
    harmony: [N(62), 0, N(62), N(66), N(69), N(74), N(73), N(69), N(67), N(66), N(64), N(62), N(66), N(69), N(67), N(62)],
    bass: [N(50), N(50), N(57), N(50), N(47), N(47), N(54), N(47), N(43), N(43), N(50), N(43), N(45), N(45), N(52), N(50)],
    drums: ['K', 'S', 'S', 'H', 'K', 'S', 'S', 'H', 'K', 'K', 'S', 'S', 'K', 'S', 'S', 'S'],
  },
  // Track 16: "Steel & Siege Engines" — Heavy industrial war-drum percussion for Fortress & Trench Sieges (146 BPM)
  track_16_siege: {
    id: 'track_16_siege',
    title: '16 · Steel & Siege Engines',
    bpm: 146,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(64), N(64), N(67), N(71), N(72), N(71), N(67), N(64), N(65), N(68), N(71), N(74), N(72), N(71), N(68), N(64)],
    harmony: [N(52), N(52), N(55), N(59), N(60), N(59), N(55), N(52), N(53), N(56), N(59), N(62), N(60), N(59), N(56), N(52)],
    bass: [N(40), N(40), N(40), N(47), N(40), N(40), N(48), N(47), N(41), N(41), N(41), N(47), N(40), N(43), N(41), N(40)],
    drums: ['K', 'K', 'S', 'H', 'K', 'S', 'K', 'S', 'K', 'K', 'S', 'H', 'K', 'S', 'S', 'S'],
  },
  // Track 17: "Banners of the Two Kingdoms" — Soaring dual-melody anthem when King Leo & The Great Duck fight beside Nyx (152 BPM)
  track_17_banners: {
    id: 'track_17_banners',
    title: '17 · Banners of the Two Kingdoms',
    bpm: 152,
    leadWave: 'square',
    harmonyWave: 'triangle',
    bassWave: 'triangle',
    lead: [N(76), N(79), N(83), N(88), N(86), N(83), N(79), N(84), N(83), N(79), N(76), N(79), N(81), N(84), N(86), N(88)],
    harmony: [N(64), N(67), N(71), N(76), N(74), N(71), N(67), N(72), N(71), N(67), N(64), N(67), N(69), N(72), N(74), N(76)],
    bass: [N(52), N(59), N(52), N(59), N(48), N(55), N(48), N(55), N(45), N(52), N(45), N(52), N(50), N(57), N(50), N(57)],
    drums: ['K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'H', 'K', 'S', 'S', 'H'],
  },
  // Track 18: "Ragnarok of Claws & Fangs" — 185 BPM climactic finale theme for Act 82 Colosseum of Kings
  track_18_ragnarok: {
    id: 'track_18_ragnarok',
    title: '18 · Ragnarok of Claws & Fangs',
    bpm: 185,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(74), N(77), N(81), N(86), N(89), N(86), N(81), N(77), N(76), N(79), N(82), N(88), N(86), N(85), N(81), N(86)],
    harmony: [N(62), N(65), N(69), N(74), N(77), N(74), N(69), N(65), N(64), N(67), N(70), N(76), N(74), N(73), N(69), N(74)],
    bass: [N(38), N(50), N(38), N(50), N(41), N(53), N(41), N(53), N(40), N(52), N(40), N(52), N(45), N(57), N(37), N(49)],
    drums: ['K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'S', 'K', 'S', 'K', 'S', 'S', 'S'],
  },
  // Track 19: "Wings of Cataclysm" — Scorched-earth urgent minor orchestral chip theme (150 BPM)
  track_19_cataclysm: {
    id: 'track_19_cataclysm',
    title: '19 · Wings of Cataclysm',
    bpm: 150,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(64), N(67), N(71), N(72), N(76), N(74), N(71), N(67), N(65), N(69), N(72), N(77), N(76), N(72), N(71), N(64)],
    harmony: [N(52), N(55), N(59), N(60), N(64), N(62), N(59), N(55), N(53), N(57), N(60), N(65), N(64), N(60), N(59), N(52)],
    bass: [N(40), N(40), N(52), N(40), N(41), N(41), N(53), N(41), N(43), N(43), N(55), N(43), N(40), N(43), N(47), N(40)],
    drums: ['K', 'H', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'H', 'S', 'K', 'K', 'S', 'S', 'H'],
  },
  // Track 20: "Claws & Fangs United" — Heroic Cat-and-Dog Alliance March (144 BPM)
  track_20_united: {
    id: 'track_20_united',
    title: '20 · Claws & Fangs United',
    bpm: 144,
    leadWave: 'square',
    harmonyWave: 'triangle',
    bassWave: 'triangle',
    lead: [N(74), N(78), N(81), N(86), N(85), N(81), N(78), N(83), N(81), N(78), N(74), N(79), N(81), N(85), N(86), N(88)],
    harmony: [N(62), N(66), N(69), N(74), N(73), N(69), N(66), N(71), N(69), N(66), N(62), N(67), N(69), N(73), N(74), N(76)],
    bass: [N(50), N(57), N(50), N(57), N(47), N(54), N(47), N(54), N(43), N(50), N(43), N(50), N(45), N(52), N(50), N(57)],
    drums: ['K', 'S', 'S', 'H', 'K', 'S', 'S', 'H', 'K', 'K', 'S', 'H', 'K', 'S', 'K', 'S'],
  },
  // Track 21: "Flight of the Elder Wyrms" — Soaring Dragon Boss Battle Theme (168 BPM)
  track_21_wyrms: {
    id: 'track_21_wyrms',
    title: '21 · Flight of the Elder Wyrms',
    bpm: 168,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(69), N(72), N(76), N(81), N(79), N(76), N(72), N(79), N(77), N(74), N(69), N(74), N(76), N(79), N(83), N(81)],
    harmony: [N(57), N(60), N(64), N(69), N(67), N(64), N(60), N(67), N(65), N(62), N(57), N(62), N(64), N(67), N(71), N(69)],
    bass: [N(45), N(45), N(57), N(45), N(43), N(43), N(55), N(43), N(41), N(41), N(53), N(41), N(40), N(43), N(44), N(45)],
    drums: ['K', 'K', 'S', 'H', 'K', 'S', 'K', 'S', 'K', 'K', 'S', 'H', 'K', 'S', 'S', 'S'],
  },
  // Track 22: "Slayer of the World-Breaker" — 192 BPM 4-Channel Supernova Final Boss Theme (Ignis-Bahamut!)
  track_22_bahamut: {
    id: 'track_22_bahamut',
    title: '22 · Slayer of the World-Breaker',
    bpm: 192,
    leadWave: 'sawtooth',
    harmonyWave: 'square',
    bassWave: 'sawtooth',
    lead: [N(76), N(80), N(83), N(88), N(91), N(88), N(83), N(80), N(77), N(81), N(84), N(89), N(88), N(86), N(83), N(88)],
    harmony: [N(64), N(68), N(71), N(76), N(79), N(76), N(71), N(68), N(65), N(69), N(72), N(77), N(76), N(74), N(71), N(76)],
    bass: [N(40), N(52), N(40), N(52), N(43), N(55), N(43), N(55), N(41), N(53), N(41), N(53), N(47), N(59), N(39), N(51)],
    drums: ['K', 'K', 'S', 'K', 'K', 'K', 'S', 'K', 'K', 'S', 'K', 'S', 'K', 'S', 'S', 'S'],
  },
};

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = true;
  private bgmTimer: number | null = null;
  private bgmStep = 0;
  private currentTrack: TrackId = 'none';
  private overdriveActive = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getCurrentTrackTitle(): string {
    if (this.muted) return 'Muted';
    if (this.currentTrack === 'none') return '01 · Crown of Starlight';
    const spec = TRACK_LIBRARY[this.currentTrack];
    if (!spec) return '02 · Paws in the Pine';
    return this.overdriveActive &&
      (this.currentTrack === 'track_11_miniboss' ||
        this.currentTrack === 'track_12_boss' ||
        this.currentTrack === 'track_18_ragnarok' ||
        this.currentTrack === 'track_21_wyrms' ||
        this.currentTrack === 'track_22_bahamut')
      ? `${spec.title} [OVERDRIVE]`
      : spec.title;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgm();
    } else if (this.currentTrack !== 'none') {
      const tr = this.currentTrack;
      this.currentTrack = 'none';
      this.setTrack(tr, this.overdriveActive);
    }
    return this.muted;
  }

  private getDestination(): AudioNode | null {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    return this.masterGain ?? ctx.destination;
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.08,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(35, freq), now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(35, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoise(duration: number, volume = 0.06, delay = 0, filterFreq = 1400) {
    const ctx = this.ensureContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    const sampleCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;

    const gain = ctx.createGain();
    const now = ctx.currentTime + delay;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    source.start(now);
  }

  public swordSlash(comboStep: number) {
    const base = comboStep === 2 ? 520 : comboStep === 1 ? 420 : 340;
    this.playNoise(0.09, 0.07);
    this.playTone(base, 140, 0.1, 'sawtooth', 0.06);
  }

  public swordBeam() {
    this.playTone(760, 1280, 0.16, 'triangle', 0.08);
    this.playTone(540, 920, 0.14, 'square', 0.04, 0.02);
  }

  public hitImpact(crit = false) {
    if (crit) {
      this.playNoise(0.11, 0.1);
      this.playTone(380, 95, 0.14, 'square', 0.09);
      this.playTone(880, 1320, 0.12, 'triangle', 0.08, 0.02);
    } else {
      this.playNoise(0.06, 0.06);
      this.playTone(220, 75, 0.09, 'square', 0.07);
    }
  }

  public staggerBreak() {
    const notes = [587.33, 783.99, 1046.5, 1567.98];
    notes.forEach((f, i) => {
      this.playTone(f, f * 1.05, 0.16, 'square', 0.08, i * 0.045);
    });
    this.playNoise(0.15, 0.09);
  }

  public shieldImmune() {
    this.playTone(260, 220, 0.08, 'triangle', 0.07);
    this.playTone(190, 160, 0.12, 'sawtooth', 0.05, 0.04);
  }

  public dodgeRoll() {
    this.playNoise(0.08, 0.04);
    this.playTone(240, 480, 0.1, 'triangle', 0.05);
  }

  public playerHurt() {
    this.playTone(190, 65, 0.18, 'sawtooth', 0.09);
    this.playNoise(0.08, 0.06);
  }

  public enemyCry() {
    this.playTone(320, 110, 0.15, 'square', 0.06);
  }

  public chestFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, n, 0.16, 'square', 0.07, idx * 0.09);
    });
  }

  public duckQuack() {
    this.playTone(430, 310, 0.12, 'sawtooth', 0.09, 0);
    this.playTone(580, 390, 0.12, 'square', 0.05, 0);
    this.playTone(450, 320, 0.14, 'sawtooth', 0.08, 0.14);
    this.playTone(987.77, 1318.5, 0.25, 'triangle', 0.06, 0.26);
  }

  public potionDrink() {
    this.playTone(440, 880, 0.18, 'triangle', 0.08, 0);
    this.playTone(660, 1320, 0.22, 'sine', 0.07, 0.08);
  }

  public elixirAwaken() {
    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    arpeggio.forEach((f, i) => {
      this.playTone(f, f * 1.03, 0.22, 'square', 0.07, i * 0.065);
    });
    this.playTone(150, 60, 0.38, 'sawtooth', 0.08, 0.15);
  }

  public levelUp() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((n, i) => {
      this.playTone(n, n, 0.14, 'triangle', 0.08, i * 0.08);
    });
  }

  public bossRoar() {
    this.playTone(130, 48, 0.48, 'sawtooth', 0.11, 0);
    this.playTone(180, 62, 0.45, 'square', 0.07, 0.04);
    this.playNoise(0.35, 0.09, 0.05);
  }

  public laserBeam() {
    this.playTone(920, 260, 0.32, 'sawtooth', 0.08);
    this.playTone(620, 180, 0.32, 'square', 0.05);
  }

  public talkBlip(pitch = 460) {
    this.playTone(pitch, pitch * 1.05, 0.035, 'square', 0.03);
  }

  public catLoafPurr() {
    this.playTone(135, 118, 0.28, 'triangle', 0.075, 0);
    this.playTone(145, 125, 0.28, 'sine', 0.06, 0.14);
    this.playTone(587.33, 880, 0.18, 'triangle', 0.065, 0.05);
    this.playTone(880, 1174.66, 0.22, 'sine', 0.055, 0.16);
  }

  public catMeow() {
    this.playTone(520, 860, 0.11, 'triangle', 0.075, 0);
    this.playTone(860, 610, 0.16, 'sine', 0.07, 0.1);
  }

  public victoryFanfare() {
    const melody = [
      { f: 523.25, d: 0.14, t: 0 },
      { f: 659.25, d: 0.14, t: 0.14 },
      { f: 783.99, d: 0.14, t: 0.28 },
      { f: 1046.5, d: 0.35, t: 0.42 },
      { f: 783.99, d: 0.14, t: 0.8 },
      { f: 1046.5, d: 0.5, t: 0.96 },
    ];
    melody.forEach((m) => this.playTone(m.f, m.f, m.d, 'square', 0.07, m.t));
  }

  public warHorn() {
    // Heroic Golden Lion Brass War-Horn Fanfare!
    this.playTone(196, 196, 0.24, 'sawtooth', 0.075, 0);
    this.playTone(293.66, 293.66, 0.24, 'sawtooth', 0.075, 0.12);
    this.playTone(392, 392, 0.48, 'sawtooth', 0.085, 0.24);
    this.playTone(587.33, 587.33, 0.45, 'square', 0.065, 0.28);
  }

  public bannerCaptured() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.playTone(f, f, 0.14, 'triangle', 0.075, i * 0.07));
  }

  public counterGuard() {
    // Metallic crimson/silver guard clang when Dog enters Counter Stance
    this.playTone(680, 980, 0.09, 'triangle', 0.07, 0);
    this.playTone(1320, 880, 0.11, 'square', 0.055, 0.05);
  }

  public counterParry() {
    // Heavy metallic parry clash + Fang Counter-Slash
    this.playTone(1480, 320, 0.16, 'sawtooth', 0.095, 0);
    this.playTone(220, 75, 0.22, 'square', 0.09, 0.04);
    this.playNoise(0.14, 0.075, 0, 2200);
  }

  public dogCounterHorn() {
    // Ominous Direfang Wolf War-Horn for Dog Kingdom Counter-Offensives
    this.playTone(146.83, 130.81, 0.35, 'sawtooth', 0.085, 0);
    this.playTone(110.0, 98.0, 0.45, 'sawtooth', 0.09, 0.18);
  }

  public harpoonFire() {
    // Heavy iron-chain ballista launch + whistling bolt
    this.playNoise(0.12, 0.09, 0, 1400);
    this.playTone(320, 880, 0.14, 'sawtooth', 0.085, 0);
    this.playTone(180, 95, 0.22, 'square', 0.075, 0.04);
  }

  public skyCrash() {
    // Massive earth-shattering slam when a flying Dragon is reeled down
    this.playNoise(0.32, 0.13, 0, 600);
    this.playTone(140, 38, 0.42, 'sawtooth', 0.12, 0);
    this.playTone(220, 52, 0.36, 'square', 0.085, 0.05);
  }

  public windGale() {
    // Sweeping hurricane wing-gust pushback
    this.playNoise(0.28, 0.09, 0, 2600);
    this.playTone(280, 110, 0.24, 'triangle', 0.06, 0);
  }

  public hoardVortex() {
    // Swirling golden-crimson treasure vacuum hum
    this.playTone(240, 620, 0.28, 'triangle', 0.075, 0);
    this.playTone(360, 840, 0.25, 'sine', 0.06, 0.08);
  }

  public partBreak() {
    // Armor-shattering dragon wing/tail/core break fanfare
    this.playNoise(0.18, 0.1, 0, 1800);
    this.playTone(523.25, 1046.5, 0.18, 'square', 0.085, 0);
    this.playTone(783.99, 1567.98, 0.22, 'triangle', 0.085, 0.06);
  }

  public stopBgm() {
    if (this.bgmTimer !== null) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public getTrackForBiome(
    biomeId: BiomeId,
    role: 'normal' | 'miniboss' | 'boss' | 'sanctuary' | 'final_boss',
    bossKind?: string
  ): TrackId {
    if (biomeId === 'war_sanctuary' || biomeId === 'dragon_sanctuary') {
      return biomeId === 'dragon_sanctuary' ? 'track_20_united' : 'track_17_banners';
    }
    if (role === 'sanctuary' || biomeId === 'sanctuary') {
      return 'track_10_sanctuary';
    }
    if (biomeId === 'sky_throne') {
      return 'track_22_bahamut';
    }
    if (biomeId === 'imperial_throne') {
      return 'track_18_ragnarok';
    }
    if (role === 'final_boss' || biomeId === 'throne') {
      return bossKind === 'fenrir_p2' ? 'track_14_fenrir_p2' : 'track_13_fenrir_p1';
    }
    if (typeof biomeId === 'number' && biomeId >= 17 && biomeId <= 24) {
      if (role === 'boss' || role === 'miniboss') return 'track_21_wyrms';
      return biomeId >= 20 ? 'track_20_united' : 'track_19_cataclysm';
    }
    if (role === 'miniboss') return 'track_11_miniboss';
    if (role === 'boss') return 'track_12_boss';

    switch (biomeId) {
      case 1:
        return 'track_02_woods';
      case 2:
        return 'track_03_ravine';
      case 3:
        return 'track_04_fungal';
      case 4:
        return 'track_05_autumn';
      case 5:
        return 'track_06_frost';
      case 6:
        return 'track_07_lava';
      case 7:
        return 'track_08_marsh';
      case 8:
        return 'track_09_astral';
      // Arc II (Acts 42–82): War of the Two Kingdoms Anthems (Tracks 15–17)
      case 9:
      case 10:
      case 11:
      case 12:
        return 'track_15_march';
      case 13:
      case 14:
      case 15:
        return 'track_16_siege';
      case 16:
        return 'track_17_banners';
      default:
        return 'track_02_woods';
    }
  }

  public setCutsceneCueTrack(cue?: CutsceneCue) {
    if (!cue) return;
    if (cue === 'prologue_1') {
      this.setTrack('track_01_prologue', false);
    } else if (cue === 'prologue_2' || cue === 'prologue_3' || cue === 'prologue_4') {
      this.setTrack('track_01_storm', false);
    } else if (cue === 'cataclysm_1' || cue === 'cataclysm_2') {
      this.setTrack('track_19_cataclysm', false);
    } else if (cue.startsWith('epilogue_')) {
      this.setTrack('track_14_epilogue', false);
    }
  }

  public setOverdrive(overdrive: boolean) {
    if (this.overdriveActive === overdrive) return;
    this.overdriveActive = overdrive;
    if (this.currentTrack !== 'none') {
      const tr = this.currentTrack;
      this.currentTrack = 'none';
      this.setTrack(tr, overdrive);
    }
  }

  public setTrack(trackId: TrackId, overdrive = false) {
    if (this.currentTrack === trackId && this.overdriveActive === overdrive && this.bgmTimer !== null) {
      return;
    }
    this.currentTrack = trackId;
    this.overdriveActive = overdrive;
    this.stopBgm();
    if (this.muted || trackId === 'none') return;

    const spec = TRACK_LIBRARY[trackId];
    if (!spec) return;

    // Smooth crossfade ramp on masterGain to prevent clicks
    const ctx = this.ensureContext();
    if (ctx && this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0.35, now);
      this.masterGain.gain.linearRampToValueAtTime(1.0, now + 0.45);
    }

    this.bgmStep = 0;
    const effectiveBpm = overdrive ? Math.round(spec.bpm * 1.15) : spec.bpm;
    const stepMs = Math.max(85, Math.round((60000 / effectiveBpm) * 0.5)); // 8th-note sequencer grid
    const noteDur = (stepMs / 1000) * 0.88;

    this.bgmTimer = window.setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const idx = this.bgmStep % spec.lead.length;

      // Channel 1: Lead Pulse / Square / Sine
      const leadFreq = spec.lead[idx];
      if (leadFreq > 0) {
        this.playTone(leadFreq, leadFreq, noteDur, spec.leadWave, 0.022);
      }

      // Channel 2: Harmony Triangle / FM Bell
      const harmFreq = spec.harmony[idx % spec.harmony.length];
      if (harmFreq > 0) {
        this.playTone(harmFreq, harmFreq, noteDur * 0.95, spec.harmonyWave, 0.015);
      }

      // Channel 3: Bass Sawtooth / Sub-Triangle
      const bassFreq = spec.bass[idx % spec.bass.length];
      if (bassFreq > 0) {
        this.playTone(bassFreq, bassFreq, noteDur * 0.92, spec.bassWave, 0.025);
      }

      // Channel 4: Noise / Kick Percussion
      const drum = spec.drums[idx % spec.drums.length];
      if (drum === 'K') {
        this.playTone(115, 42, 0.07, 'sine', 0.032);
      } else if (drum === 'S') {
        this.playNoise(0.065, 0.018, 0, 1600);
      } else if (drum === 'H') {
        this.playNoise(0.028, 0.009, 0, 4200);
      }

      this.bgmStep++;
    }, stepMs);
  }

  public setTheme(theme: TrackId | LegacyThemeAlias) {
    switch (theme) {
      case 'calm':
        this.setTrack('track_01_prologue', false);
        break;
      case 'adventure':
        this.setTrack('track_02_woods', false);
        break;
      case 'sanctuary':
        this.setTrack('track_10_sanctuary', false);
        break;
      case 'boss':
        this.setTrack('track_12_boss', this.overdriveActive);
        break;
      case 'victory':
        this.setTrack('track_14_epilogue', false);
        break;
      default:
        this.setTrack(theme, this.overdriveActive);
        break;
    }
  }
}

export const audio = new RetroAudioEngine();
