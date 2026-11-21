/**
 * Layer 3 — 60FPS Keyframe Cutscene Choreography Scripts (Arcs 7 to 9)
 *
 * Covers:
 * - Act 700: Astral Glacier Awakening (Borealis)
 * - Act 800: Sky-Island Tempest (Zephyrus)
 * - Act 900: Mirror-Realm Confrontation vs Evil Clone Umbra-Nyx
 */

import type { CutsceneCinemaTrack } from './cutsceneDirector';

export const CUTSCENE_ACT_700_GLACIER_AWAKENING: CutsceneCinemaTrack = {
  id: 'omni_cutscene_09_glacier_awakening',
  title: 'Act 700: Permafrost Crown — Borealis Awakens',
  actTrigger: 700,
  beats: [
    {
      id: 'a700_aurora_shatter',
      durationSec: 2.5,
      cameraTarget: { x: 240, y: 124 },
      cameraZoom: 1.5,
      easing: 'easeInOutCubic',
      lightingTintHex: '#38bdf8',
      lightingAlpha: 0.26,
      weather: 'astral_stars',
      slowMoScale: 0.65,
      speakerName: 'Borealis',
      voiceProfile: 'boss',
      expression: '😤',
      dialogueText: 'EVEN THE STARS FREEZE AT MY TUSKS. STEP NO CLOSER TO THE ASTRAL POLE!',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'borealis', x: 260, y: 116, facing: -1, emote: '💢' },
        { actorId: 'nyx', x: 180, y: 154, facing: 1, emote: '?' },
      ],
    },
    {
      id: 'a700_nyx_frost_resolve',
      durationSec: 2.2,
      cameraTarget: { x: 194, y: 150 },
      cameraZoom: 1.56,
      easing: 'easeOutBack',
      lightingTintHex: '#bae6fd',
      lightingAlpha: 0.16,
      weather: 'astral_stars',
      slowMoScale: 1.0,
      speakerName: 'Nyx',
      voiceProfile: 'nyx',
      expression: '^ω^',
      dialogueText: 'Our warm Star-Forge lanterns melt permafrost in seconds—keep moving on the ice bridges!',
      swordClashFlash: false,
      actorPoses: [
        { actorId: 'nyx', x: 194, y: 150, facing: 1, emote: '!' },
        { actorId: 'great_duck', x: 168, y: 156, facing: 1, emote: '♪' },
      ],
    },
  ],
};

export const CUTSCENE_ACT_800_SKY_TEMPEST: CutsceneCinemaTrack = {
  id: 'omni_cutscene_10_sky_tempest',
  title: 'Act 800: Eye of the Ten-Mile Tempest — Zephyrus',
  actTrigger: 800,
  beats: [
    {
      id: 'a800_gale_descent',
      durationSec: 2.4,
      cameraTarget: { x: 240, y: 112 },
      cameraZoom: 1.58,
      easing: 'easeInOutCubic',
      lightingTintHex: '#2dd4bf',
      lightingAlpha: 0.24,
      weather: 'rain',
      slowMoScale: 0.55,
      speakerName: 'Zephyrus',
      voiceProfile: 'boss',
      expression: '😤',
      dialogueText: 'GROUND-DWELLERS DARE CLIMB MY CLOUD ARCHIPELAGO? RIDE THE CYCLONE TO YOUR DOOM!',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'zephyrus', x: 248, y: 98, facing: -1, emote: '!' },
        { actorId: 'king_leo', x: 190, y: 158, facing: 1, emote: '💢' },
      ],
    },
    {
      id: 'a800_verlet_banner',
      durationSec: 2.2,
      cameraTarget: { x: 204, y: 154 },
      cameraZoom: 1.48,
      easing: 'easeOutBack',
      lightingTintHex: '#99f6e4',
      lightingAlpha: 0.18,
      weather: 'sunlit',
      slowMoScale: 1.0,
      speakerName: 'King Leo',
      voiceProfile: 'king_leo',
      expression: '^ω^',
      dialogueText: 'Anchor the War Banners into the Sky-Bridge—when Zephyrus dives, strike its Tempest Crest!',
      swordClashFlash: false,
      actorPoses: [
        { actorId: 'king_leo', x: 204, y: 154, facing: 1, emote: '!' },
        { actorId: 'fenrir', x: 174, y: 158, facing: 1, emote: '!' },
      ],
    },
  ],
};

export const CUTSCENE_ACT_900_MIRROR_CLONE: CutsceneCinemaTrack = {
  id: 'omni_cutscene_11_mirror_umbra_nyx',
  title: 'Act 900: Mirror-Realm Confrontation — Umbra-Nyx',
  actTrigger: 900,
  beats: [
    {
      id: 'a900_mirror_step',
      durationSec: 2.5,
      cameraTarget: { x: 256, y: 130 },
      cameraZoom: 1.62,
      easing: 'easeInOutCubic',
      lightingTintHex: '#d946ef',
      lightingAlpha: 0.28,
      weather: 'astral_stars',
      slowMoScale: 0.45,
      speakerName: 'Umbra-Nyx',
      voiceProfile: 'boss',
      expression: '😤',
      dialogueText: 'Every spell you cast, every dodge you perfected—I am your shadow reflection, sharpened by void!',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'umbra_nyx', x: 268, y: 132, facing: -1, emote: '💢' },
        { actorId: 'nyx', x: 192, y: 132, facing: 1, emote: '?' },
      ],
    },
    {
      id: 'a900_true_heart',
      durationSec: 2.3,
      cameraTarget: { x: 204, y: 132 },
      cameraZoom: 1.54,
      easing: 'easeOutBack',
      lightingTintHex: '#f0abfc',
      lightingAlpha: 0.2,
      weather: 'golden_petals',
      slowMoScale: 1.0,
      speakerName: 'Nyx',
      voiceProfile: 'nyx',
      expression: '>ω<',
      dialogueText: 'You copied my wand, but you can’t copy my friends—Leo, Fenrir, Great Duck, let’s shatter this glass!',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'nyx', x: 204, y: 132, facing: 1, emote: '!' },
        { actorId: 'king_leo', x: 170, y: 146, facing: 1, emote: '!' },
      ],
    },
  ],
};

export const CUTSCENES_ARC_7_TO_9: ReadonlyArray<CutsceneCinemaTrack> = [
  CUTSCENE_ACT_700_GLACIER_AWAKENING,
  CUTSCENE_ACT_800_SKY_TEMPEST,
  CUTSCENE_ACT_900_MIRROR_CLONE,
];
