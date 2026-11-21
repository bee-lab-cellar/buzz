/**
 * Layer 3 — 60FPS Keyframe Cutscene Choreography Scripts (Arcs 4 to 6)
 *
 * Covers:
 * - Act 400: Charybdis the World-Kraken Ocean Flood
 * - Act 500: Clockwork Sky-Citadel Descent (Chronos-Omega)
 * - Act 600: Volcanic Core Eruption (Vulcan-Rex)
 */

import type { CutsceneCinemaTrack } from './cutsceneDirector';

export const CUTSCENE_ACT_400_KRAKEN_FLOOD: CutsceneCinemaTrack = {
  id: 'omni_cutscene_06_kraken_flood',
  title: 'Act 400: Abyssal Surge — Charybdis the World-Kraken',
  actTrigger: 400,
  beats: [
    {
      id: 'a400_abyss_rise',
      durationSec: 2.5,
      cameraTarget: { x: 240, y: 132 },
      cameraZoom: 1.46,
      easing: 'easeInOutCubic',
      lightingTintHex: '#06b6d4',
      lightingAlpha: 0.28,
      weather: 'abyss_mist',
      slowMoScale: 0.7,
      speakerName: 'Charybdis',
      voiceProfile: 'boss',
      expression: '😤',
      dialogueText: 'EIGHT TENTACLES SHALL DRAG YOUR CAT-DOG FLEET INTO THE SUNKEN TRENCH!',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'charybdis', x: 240, y: 102, facing: -1, emote: '💢' },
        { actorId: 'nyx', x: 184, y: 162, facing: 1, emote: '?' },
      ],
    },
    {
      id: 'a400_great_duck_tactic',
      durationSec: 2.3,
      cameraTarget: { x: 210, y: 152 },
      cameraZoom: 1.56,
      easing: 'easeOutBack',
      lightingTintHex: '#22d3ee',
      lightingAlpha: 0.18,
      weather: 'abyss_mist',
      slowMoScale: 1.0,
      speakerName: 'The Great Duck',
      voiceProfile: 'great_duck',
      expression: '^ω^',
      dialogueText: 'Sever the 8 tentacles first—each cut drops Healing Fish and cracks the 2.5x Glowing Heart!',
      swordClashFlash: false,
      actorPoses: [
        { actorId: 'great_duck', x: 214, y: 154, facing: 1, emote: '!' },
        { actorId: 'nyx', x: 188, y: 162, facing: 1, emote: '♪' },
      ],
    },
  ],
};

export const CUTSCENE_ACT_500_CLOCKWORK_DESCENT: CutsceneCinemaTrack = {
  id: 'omni_cutscene_07_clockwork_citadel',
  title: 'Act 500: Clockwork Sky-Citadel Descent',
  actTrigger: 500,
  beats: [
    {
      id: 'a500_gears_grind',
      durationSec: 2.4,
      cameraTarget: { x: 240, y: 120 },
      cameraZoom: 1.5,
      easing: 'easeInOutCubic',
      lightingTintHex: '#d97706',
      lightingAlpha: 0.24,
      weather: 'ember_eclipse',
      slowMoScale: 0.6,
      speakerName: 'Chronos-Omega',
      voiceProfile: 'boss',
      expression: '😤',
      dialogueText: 'TIME-GEARS LOCKED. ALL ORGANIC KINGDOMS SHALL BE REFORGED INTO BRASS.',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'chronos_omega', x: 256, y: 112, facing: -1, emote: '!' },
        { actorId: 'fenrir', x: 180, y: 148, facing: 1, emote: '💢' },
      ],
    },
    {
      id: 'a500_mecha_charge',
      durationSec: 2.2,
      cameraTarget: { x: 190, y: 146 },
      cameraZoom: 1.58,
      easing: 'easeOutBack',
      lightingTintHex: '#fbbf24',
      lightingAlpha: 0.18,
      weather: 'sunlit',
      slowMoScale: 1.0,
      speakerName: 'Fenrir',
      voiceProfile: 'fenrir',
      expression: '>ω<',
      dialogueText: 'Let’s jam its Chrono-Prism Core with our Steam-Mecha armor and shatter its pendulum!',
      swordClashFlash: false,
      actorPoses: [
        { actorId: 'fenrir', x: 190, y: 146, facing: 1, emote: '!' },
        { actorId: 'king_leo', x: 160, y: 152, facing: 1, emote: '♪' },
      ],
    },
  ],
};

export const CUTSCENE_ACT_600_VOLCANIC_ERUPTION: CutsceneCinemaTrack = {
  id: 'omni_cutscene_08_volcanic_eruption',
  title: 'Act 600: Caldera Fracture — Vulcan-Rex Awakens',
  actTrigger: 600,
  beats: [
    {
      id: 'a600_caldera_crack',
      durationSec: 2.5,
      cameraTarget: { x: 240, y: 126 },
      cameraZoom: 1.54,
      easing: 'easeInOutCubic',
      lightingTintHex: '#ea580c',
      lightingAlpha: 0.3,
      weather: 'ember_eclipse',
      slowMoScale: 0.5,
      speakerName: 'Vulcan-Rex',
      voiceProfile: 'boss',
      expression: '😤',
      dialogueText: 'THE PLANET’S MANTLE BOILS FOR MY RETURN! BEHOLD THE OBSIDIAN CORE!',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'vulcan_rex', x: 258, y: 118, facing: -1, emote: '💢' },
        { actorId: 'king_leo', x: 178, y: 154, facing: 1, emote: '?' },
      ],
    },
    {
      id: 'a600_leo_shield',
      durationSec: 2.2,
      cameraTarget: { x: 196, y: 150 },
      cameraZoom: 1.48,
      easing: 'easeOutBack',
      lightingTintHex: '#fb923c',
      lightingAlpha: 0.2,
      weather: 'ember_eclipse',
      slowMoScale: 1.0,
      speakerName: 'King Leo',
      voiceProfile: 'king_leo',
      expression: '😤',
      dialogueText: 'Stay behind my Solar Mane! Strike its exposed magma chest when the obsidian plates part!',
      swordClashFlash: false,
      actorPoses: [
        { actorId: 'king_leo', x: 198, y: 148, facing: 1, emote: '!' },
        { actorId: 'nyx', x: 172, y: 156, facing: 1, emote: '!' },
      ],
    },
  ],
};

export const CUTSCENES_ARC_4_TO_6: ReadonlyArray<CutsceneCinemaTrack> = [
  CUTSCENE_ACT_400_KRAKEN_FLOOD,
  CUTSCENE_ACT_500_CLOCKWORK_DESCENT,
  CUTSCENE_ACT_600_VOLCANIC_ERUPTION,
];
