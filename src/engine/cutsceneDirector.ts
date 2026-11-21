/**
 * Pillar 2 — 60FPS Smooth Keyframe Cutscene Cinema Engine
 *
 * Features:
 * - Butter-smooth Cubic-Bezier camera & letterbox rig (`easeInOutCubic` / `easeOutBack`):
 *   interpolates `camX`, `camY`, `camZoom (1.0x <-> 1.75x)`, `letterboxBarHeight (0px <-> 32px)`,
 *   and atmospheric lighting tint at full 60FPS with ZERO jarring cuts!
 * - Animated Lip-Sync `48x48` Pixel Portraits (`^ω^`, `>ω<`, `O_O`, `😤`) synced with unique
 *   per-character chiptune voice blips (`nyx`, `king_leo`, `fenrir`, `great_duck`, `boss`).
 * - Zero-Cut `0.85s` Smooth Glide Hand-Off back onto Nyx (`1.6x -> 1.0x`) + `[⏩ 2x]` & `[⏭️ SKIP]`.
 */

import type { PlayableHeroId } from '../types/combat';
import type { Vec2 } from '../types/math';

export type PortraitExpression = '^ω^' | '>ω<' | 'O_O' | '😤';
export type EmoteBubbleKind = 'none' | '!' | '?' | '♪' | '💢';
export type CutsceneWeatherKind = 'sunlit' | 'rain' | 'golden_petals' | 'ember_eclipse' | 'abyss_mist' | 'astral_stars';
export type CutsceneVoiceProfile = PlayableHeroId | 'boss';

export interface VoiceBlipSpec {
  readonly profile: CutsceneVoiceProfile;
  readonly waveform: OscillatorType;
  readonly baseFreqHz: number;
  readonly pitchVarianceHz: number;
  readonly description: string;
}

export const CHARACTER_VOICE_BLIPS: Readonly<Record<CutsceneVoiceProfile, VoiceBlipSpec>> = {
  nyx: {
    profile: 'nyx',
    waveform: 'triangle',
    baseFreqHz: 680,
    pitchVarianceHz: 95,
    description: 'Bright arcane starlight chime',
  },
  king_leo: {
    profile: 'king_leo',
    waveform: 'sawtooth',
    baseFreqHz: 245,
    pitchVarianceHz: 30,
    description: 'Warm sovereign lion brass',
  },
  fenrir: {
    profile: 'fenrir',
    waveform: 'square',
    baseFreqHz: 148,
    pitchVarianceHz: 24,
    description: 'Low eclipse synth growl',
  },
  great_duck: {
    profile: 'great_duck',
    waveform: 'triangle',
    baseFreqHz: 510,
    pitchVarianceHz: 115,
    description: 'Musical golden pond quack chime',
  },
  boss: {
    profile: 'boss',
    waveform: 'sawtooth',
    baseFreqHz: 110,
    pitchVarianceHz: 18,
    description: 'Resonant titan rumble',
  },
};

export interface CutsceneActorPose {
  readonly actorId: string;
  readonly x: number;
  readonly y: number;
  readonly facing: 1 | -1;
  readonly emote: EmoteBubbleKind;
}

export interface CutsceneKeyframeBeat {
  readonly id: string;
  readonly durationSec: number;
  readonly cameraTarget: Vec2;
  readonly cameraZoom: number; // 1.0 .. 1.75
  readonly easing: 'easeInOutCubic' | 'easeOutBack';
  readonly lightingTintHex: string;
  readonly lightingAlpha: number;
  readonly weather: CutsceneWeatherKind;
  readonly slowMoScale: number; // e.g., 0.35 for slow-mo stained glass shatter
  readonly speakerName: string;
  readonly voiceProfile: CutsceneVoiceProfile;
  readonly expression: PortraitExpression;
  readonly dialogueText: string;
  readonly swordClashFlash: boolean;
  readonly actorPoses: ReadonlyArray<CutsceneActorPose>;
}

export interface CutsceneCinemaTrack {
  readonly id: string;
  readonly title: string;
  readonly actTrigger: number;
  readonly beats: ReadonlyArray<CutsceneKeyframeBeat>;
}

export interface CutsceneCinemaRigState {
  active: boolean;
  phase: 'idle' | 'playing_beats' | 'handoff_glide' | 'completed';
  track: CutsceneCinemaTrack | null;
  beatIndex: number;
  beatElapsedSec: number;
  handoffElapsedSec: number;
  readonly handoffDurationSec: 0.85;
  playbackSpeed: 1 | 2;
  camX: number;
  camY: number;
  camZoom: number;
  letterboxBarHeightPx: number; // 0px <-> 32px
  hudFadeAlpha: number; // 0 during cinema -> 1 smoothly during handoff
  lightingTintHex: string;
  lightingAlpha: number;
  revealedChars: number;
  lipSyncMouthOpen: boolean;
  portraitBlinkClosed: boolean;
  portraitBobOffsetPx: number;
  voiceBlipsTriggered: number;
  privateStartCamX: number;
  privateStartCamY: number;
  privateStartZoom: number;
}

export function easeInOutCubic(tRaw: number): number {
  const t = Math.max(0, Math.min(1, tRaw));
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(tRaw: number): number {
  const t = Math.max(0, Math.min(1, tRaw));
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function createCutsceneCinemaRig(): CutsceneCinemaRigState {
  return {
    active: false,
    phase: 'idle',
    track: null,
    beatIndex: 0,
    beatElapsedSec: 0,
    handoffElapsedSec: 0,
    handoffDurationSec: 0.85,
    playbackSpeed: 1,
    camX: 240,
    camY: 135,
    camZoom: 1.0,
    letterboxBarHeightPx: 0,
    hudFadeAlpha: 1,
    lightingTintHex: '#0f172a',
    lightingAlpha: 0,
    revealedChars: 0,
    lipSyncMouthOpen: false,
    portraitBlinkClosed: false,
    portraitBobOffsetPx: 0,
    voiceBlipsTriggered: 0,
    privateStartCamX: 240,
    privateStartCamY: 135,
    privateStartZoom: 1.0,
  };
}

export function startCinemaCutscene(
  rig: CutsceneCinemaRigState,
  track: CutsceneCinemaTrack,
  initialCamPos: Vec2 = { x: 240, y: 135 },
): void {
  rig.active = true;
  rig.phase = 'playing_beats';
  rig.track = track;
  rig.beatIndex = 0;
  rig.beatElapsedSec = 0;
  rig.handoffElapsedSec = 0;
  rig.playbackSpeed = 1;
  rig.camX = initialCamPos.x;
  rig.camY = initialCamPos.y;
  rig.camZoom = 1.0;
  rig.letterboxBarHeightPx = 0;
  rig.hudFadeAlpha = 0;
  rig.revealedChars = 0;
  rig.voiceBlipsTriggered = 0;
  rig.privateStartCamX = initialCamPos.x;
  rig.privateStartCamY = initialCamPos.y;
  rig.privateStartZoom = 1.0;
}

export function toggleCutsceneFastForward(rig: CutsceneCinemaRigState): 1 | 2 {
  rig.playbackSpeed = rig.playbackSpeed === 1 ? 2 : 1;
  return rig.playbackSpeed;
}

export function skipCinemaCutscene(rig: CutsceneCinemaRigState): void {
  if (!rig.active) return;
  rig.phase = 'handoff_glide';
  rig.handoffElapsedSec = 0;
  rig.privateStartCamX = rig.camX;
  rig.privateStartCamY = rig.camY;
  rig.privateStartZoom = rig.camZoom;
}

/**
 * Steps the 60FPS Cubic-Bezier Cutscene Rig and returns the active beat + optional voice blip trigger.
 */
export function stepCinemaCutsceneRig(
  rig: CutsceneCinemaRigState,
  dt: number,
  nyxReturnTarget: Vec2,
): {
  readonly currentBeat: CutsceneKeyframeBeat | null;
  readonly voiceBlipToPlay: VoiceBlipSpec | null;
  readonly finishedNow: boolean;
} {
  if (!rig.active || !rig.track) {
    return { currentBeat: null, voiceBlipToPlay: null, finishedNow: false };
  }

  const scaledDt = Math.min(0.05, Math.max(0, dt)) * rig.playbackSpeed;

  if (rig.phase === 'handoff_glide') {
    rig.handoffElapsedSec += Math.min(0.05, Math.max(0, dt));
    const t = easeInOutCubic(rig.handoffElapsedSec / rig.handoffDurationSec);
    rig.camX = rig.privateStartCamX + (nyxReturnTarget.x - rig.privateStartCamX) * t;
    rig.camY = rig.privateStartCamY + (nyxReturnTarget.y - rig.privateStartCamY) * t;
    rig.camZoom = rig.privateStartZoom + (1.0 - rig.privateStartZoom) * t;
    rig.letterboxBarHeightPx = Math.round(32 * (1 - t));
    rig.hudFadeAlpha = t;
    rig.lightingAlpha = Math.max(0, rig.lightingAlpha * (1 - t));

    if (rig.handoffElapsedSec >= rig.handoffDurationSec) {
      rig.active = false;
      rig.phase = 'completed';
      rig.camX = nyxReturnTarget.x;
      rig.camY = nyxReturnTarget.y;
      rig.camZoom = 1.0;
      rig.letterboxBarHeightPx = 0;
      rig.hudFadeAlpha = 1;
      return { currentBeat: null, voiceBlipToPlay: null, finishedNow: true };
    }
    return { currentBeat: null, voiceBlipToPlay: null, finishedNow: false };
  }

  const beat = rig.track.beats[rig.beatIndex];
  if (!beat) {
    skipCinemaCutscene(rig);
    return { currentBeat: null, voiceBlipToPlay: null, finishedNow: false };
  }

  rig.beatElapsedSec += scaledDt;
  const rawT = Math.min(1, rig.beatElapsedSec / Math.max(0.1, beat.durationSec));
  const eased = beat.easing === 'easeOutBack' ? easeOutBack(rawT) : easeInOutCubic(rawT);

  rig.camX = rig.privateStartCamX + (beat.cameraTarget.x - rig.privateStartCamX) * eased;
  rig.camY = rig.privateStartCamY + (beat.cameraTarget.y - rig.privateStartCamY) * eased;
  rig.camZoom = Math.max(
    1.0,
    Math.min(1.75, rig.privateStartZoom + (beat.cameraZoom - rig.privateStartZoom) * eased),
  );

  // Smooth 0px <-> 32px letterbox slide-in during first beat
  if (rig.beatIndex === 0) {
    rig.letterboxBarHeightPx = Math.round(32 * easeInOutCubic(Math.min(1, rig.beatElapsedSec / 0.45)));
  } else {
    rig.letterboxBarHeightPx = 32;
  }

  rig.lightingTintHex = beat.lightingTintHex;
  rig.lightingAlpha = beat.lightingAlpha;

  // Lip-sync typewriter reveal + per-character voice blips
  const charsPerSec = 38;
  const targetChars = Math.min(beat.dialogueText.length, Math.floor(rig.beatElapsedSec * charsPerSec));
  let voiceBlipToPlay: VoiceBlipSpec | null = null;
  if (targetChars > rig.revealedChars) {
    if (targetChars % 3 === 0) {
      voiceBlipToPlay = CHARACTER_VOICE_BLIPS[beat.voiceProfile];
      rig.voiceBlipsTriggered += 1;
    }
    rig.revealedChars = targetChars;
  }

  const stillTyping = rig.revealedChars < beat.dialogueText.length;
  rig.lipSyncMouthOpen = stillTyping && Math.floor(rig.beatElapsedSec * 14) % 2 === 0;
  rig.portraitBlinkClosed = Math.floor(rig.beatElapsedSec * 1.2) % 4 === 3 && (rig.beatElapsedSec % 1) < 0.12;
  rig.portraitBobOffsetPx = Math.sin(rig.beatElapsedSec * 6.5) * 1.5;

  if (rig.beatElapsedSec >= beat.durationSec) {
    rig.beatIndex += 1;
    rig.beatElapsedSec = 0;
    rig.revealedChars = 0;
    rig.privateStartCamX = rig.camX;
    rig.privateStartCamY = rig.camY;
    rig.privateStartZoom = rig.camZoom;

    if (rig.beatIndex >= rig.track.beats.length) {
      rig.phase = 'handoff_glide';
      rig.handoffElapsedSec = 0;
    }
  }

  return {
    currentBeat: rig.track.beats[rig.beatIndex] ?? beat,
    voiceBlipToPlay,
    finishedNow: false,
  };
}

/**
 * Renders the Cat-Paw Iris Wipe overlay cleanly without shadowBlur.
 */
export function renderCatPawIrisWipe(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  closeProgress: number,
): void {
  if (closeProgress <= 0.01) return;
  const maxR = Math.hypot(width, height) * 0.62;
  const openR = Math.max(0, maxR * (1 - closeProgress));

  ctx.save();
  ctx.fillStyle = '#070812';
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.arc(width / 2, height / 2 + 8, openR, 0, Math.PI * 2, true);
  const toeR = openR * 0.32;
  ctx.arc(width / 2 - openR * 0.72, height / 2 - openR * 0.68, toeR, 0, Math.PI * 2, true);
  ctx.arc(width / 2, height / 2 - openR * 0.92, toeR, 0, Math.PI * 2, true);
  ctx.arc(width / 2 + openR * 0.72, height / 2 - openR * 0.68, toeR, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.restore();
}
