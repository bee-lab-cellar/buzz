/**
 * Layer 3 — 60FPS Keyframe Cutscene Choreography Scripts (Arc 10 Finale)
 * + Unified 10-Arc Signature Cutscene Catalog
 *
 * Covers:
 * - Act 999: Four-Leader Omniverse Blessing (Sanctuary 999 -> Act 1,000)
 * - Act 1,000: Grand Golden Age Multiverse Epilogue (AETHER-NULL Defeated!)
 */

import type { CutsceneCinemaTrack } from './cutsceneDirector';
import {
  CUTSCENE_PROLOGUE_WAND_THEFT,
  CUTSCENE_ACT_99_LOTUS_BLESSING,
  CUTSCENE_ACT_100_WAR_HORNS,
  CUTSCENE_ACT_200_PEACE_SHATTERED,
  CUTSCENE_ACT_299_STAR_FORGE,
  CUTSCENES_ARC_1_TO_3,
} from './cutscenesArc1to3';
import {
  CUTSCENE_ACT_400_KRAKEN_FLOOD,
  CUTSCENE_ACT_500_CLOCKWORK_DESCENT,
  CUTSCENE_ACT_600_VOLCANIC_ERUPTION,
  CUTSCENES_ARC_4_TO_6,
} from './cutscenesArc4to6';
import {
  CUTSCENE_ACT_700_GLACIER_AWAKENING,
  CUTSCENE_ACT_800_SKY_TEMPEST,
  CUTSCENE_ACT_900_MIRROR_CLONE,
  CUTSCENES_ARC_7_TO_9,
} from './cutscenesArc7to9';

export const CUTSCENE_ACT_999_FOUR_LEADER_BLESSING: CutsceneCinemaTrack = {
  id: 'omni_cutscene_12_four_leader_blessing',
  title: 'Act 999: Four-Leader Omniverse Crown Blessing',
  actTrigger: 999,
  beats: [
    {
      id: 'a999_unity_circle',
      durationSec: 2.5,
      cameraTarget: { x: 240, y: 132 },
      cameraZoom: 1.5,
      easing: 'easeInOutCubic',
      lightingTintHex: '#fbbf24',
      lightingAlpha: 0.24,
      weather: 'astral_stars',
      slowMoScale: 0.85,
      speakerName: 'The Great Duck',
      voiceProfile: 'great_duck',
      expression: '^ω^',
      dialogueText: 'Four Heroes, Ten Arcs, Nine Hundred Ninety-Nine Trials—the Crown of Stars is whole!',
      swordClashFlash: false,
      actorPoses: [
        { actorId: 'nyx', x: 220, y: 132, facing: 1, emote: '♪' },
        { actorId: 'king_leo', x: 186, y: 140, facing: 1, emote: '!' },
        { actorId: 'fenrir', x: 294, y: 140, facing: -1, emote: '!' },
        { actorId: 'great_duck', x: 258, y: 132, facing: -1, emote: '♪' },
      ],
    },
    {
      id: 'a999_singularity_gate',
      durationSec: 2.3,
      cameraTarget: { x: 240, y: 104 },
      cameraZoom: 1.68,
      easing: 'easeOutBack',
      lightingTintHex: '#818cf8',
      lightingAlpha: 0.26,
      weather: 'astral_stars',
      slowMoScale: 1.0,
      speakerName: 'Nyx',
      voiceProfile: 'nyx',
      expression: '^ω^',
      dialogueText: 'Beyond this Final Sanctuary Portal stands AETHER-NULL in Act 1,000. Together—for every realm!',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'nyx', x: 240, y: 128, facing: 1, emote: '!' },
      ],
    },
  ],
};

export const CUTSCENE_ACT_1000_GRAND_EPILOGUE: CutsceneCinemaTrack = {
  id: 'omni_cutscene_13_grand_epilogue',
  title: 'Act 1,000: Grand Golden Age Multiverse Epilogue',
  actTrigger: 1000,
  beats: [
    {
      id: 'a1000_singularity_shatter',
      durationSec: 2.6,
      cameraTarget: { x: 240, y: 118 },
      cameraZoom: 1.72,
      easing: 'easeInOutCubic',
      lightingTintHex: '#fbbf24',
      lightingAlpha: 0.32,
      weather: 'golden_petals',
      slowMoScale: 0.35,
      speakerName: 'AETHER-NULL',
      voiceProfile: 'boss',
      expression: 'O_O',
      dialogueText: 'IMPOSSIBLE... FOUR SMALL HEARTS OUTSHONE THE END OF TIME ITSELF...',
      swordClashFlash: true,
      actorPoses: [
        { actorId: 'aether_null', x: 240, y: 98, facing: -1, emote: '!' },
        { actorId: 'nyx', x: 240, y: 158, facing: 1, emote: '♪' },
      ],
    },
    {
      id: 'a1000_golden_dawn',
      durationSec: 2.8,
      cameraTarget: { x: 240, y: 136 },
      cameraZoom: 1.32,
      easing: 'easeOutBack',
      lightingTintHex: '#fde047',
      lightingAlpha: 0.16,
      weather: 'golden_petals',
      slowMoScale: 1.0,
      speakerName: 'King Leo',
      voiceProfile: 'king_leo',
      expression: '^ω^',
      dialogueText: 'The Felis-Fang Omniverse enters its Eternal Golden Age! Long live Nyx and the Four Crowns!',
      swordClashFlash: false,
      actorPoses: [
        { actorId: 'king_leo', x: 196, y: 142, facing: 1, emote: '♪' },
        { actorId: 'nyx', x: 228, y: 140, facing: 1, emote: '♪' },
        { actorId: 'fenrir', x: 262, y: 140, facing: -1, emote: '♪' },
        { actorId: 'great_duck', x: 294, y: 142, facing: -1, emote: '♪' },
      ],
    },
  ],
};

/**
 * The 10 Signature Arc Cutscenes (1 flagship 60FPS keyframe cinema piece per Arc I..X).
 */
export const ALL_10_OMNIVERSE_CUTSCENES: ReadonlyArray<CutsceneCinemaTrack> = [
  CUTSCENE_PROLOGUE_WAND_THEFT,
  CUTSCENE_ACT_100_WAR_HORNS,
  CUTSCENE_ACT_200_PEACE_SHATTERED,
  CUTSCENE_ACT_400_KRAKEN_FLOOD,
  CUTSCENE_ACT_500_CLOCKWORK_DESCENT,
  CUTSCENE_ACT_600_VOLCANIC_ERUPTION,
  CUTSCENE_ACT_700_GLACIER_AWAKENING,
  CUTSCENE_ACT_800_SKY_TEMPEST,
  CUTSCENE_ACT_900_MIRROR_CLONE,
  CUTSCENE_ACT_1000_GRAND_EPILOGUE,
];

/**
 * Full 13-Track Omniverse Story Cinema Catalog (including Sanctuary Blessings at Acts 99, 299, and 999).
 */
export const ALL_13_OMNIVERSE_STORY_CUTSCENES: ReadonlyArray<CutsceneCinemaTrack> = [
  ...CUTSCENES_ARC_1_TO_3,
  ...CUTSCENES_ARC_4_TO_6,
  ...CUTSCENES_ARC_7_TO_9,
  CUTSCENE_ACT_999_FOUR_LEADER_BLESSING,
  CUTSCENE_ACT_1000_GRAND_EPILOGUE,
];

export function getOmniverseCutsceneById(id: string): CutsceneCinemaTrack | null {
  for (let i = 0; i < ALL_13_OMNIVERSE_STORY_CUTSCENES.length; i++) {
    if (ALL_13_OMNIVERSE_STORY_CUTSCENES[i].id === id) {
      return ALL_13_OMNIVERSE_STORY_CUTSCENES[i];
    }
  }
  return null;
}

export function getOmniverseCutsceneForAct(actId: number): CutsceneCinemaTrack | null {
  for (let i = 0; i < ALL_13_OMNIVERSE_STORY_CUTSCENES.length; i++) {
    if (ALL_13_OMNIVERSE_STORY_CUTSCENES[i].actTrigger === actId) {
      return ALL_13_OMNIVERSE_STORY_CUTSCENES[i];
    }
  }
  return null;
}

export {
  CUTSCENE_PROLOGUE_WAND_THEFT,
  CUTSCENE_ACT_99_LOTUS_BLESSING,
  CUTSCENE_ACT_100_WAR_HORNS,
  CUTSCENE_ACT_200_PEACE_SHATTERED,
  CUTSCENE_ACT_299_STAR_FORGE,
  CUTSCENE_ACT_400_KRAKEN_FLOOD,
  CUTSCENE_ACT_500_CLOCKWORK_DESCENT,
  CUTSCENE_ACT_600_VOLCANIC_ERUPTION,
  CUTSCENE_ACT_700_GLACIER_AWAKENING,
  CUTSCENE_ACT_800_SKY_TEMPEST,
  CUTSCENE_ACT_900_MIRROR_CLONE,
};
