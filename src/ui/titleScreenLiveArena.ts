/**
 * Pillar 2 & 3 — Title Screen Live 60FPS AI-vs-AI Battle Arena + Deterministic Replay Theater
 *
 * RENEWAL PILLAR 2 ENFORCEMENT:
 * - ZERO emoji bosses (ogre emoji banned); renders real pixel-art Boss sprites (Fenrir, Ignis-Bahamut, etc.)
 * - Keeps Nyx's Crooked Starry Wizard Hat ON in both live showcase & Replay Theater!
 * - Arc III–X Replays (`actId >= 83`): Reformed Fenrir & The Great Duck fight on the LEFT Hero Team
 *   alongside Nyx & King Leo (Fenrir ONLY fights on the RIGHT Enemy Team in Arcs 1–2!).
 * - Real Act arena background + Boss HP Bar rendered behind the replay!
 * - Floating combat callouts ("ARCANE CRIT!", "STARLIGHT CLEAVE!", "⚡ PERFECT DODGE!") are
 *   strictly vertically staggered so they NEVER overlap in one pile!
 */

import type { Vec2 } from '../types/math';
import type { PlayableHeroId } from '../types/combat';
import {
  INPUT_BIT_ATTACK,
  INPUT_BIT_DODGE,
  INPUT_BIT_ELIXIR,
  INPUT_BIT_WAR_HORN,
} from '../types/combat';
import {
  DeterministicReplayPlayer,
  DeterministicReplayRecorder,
  loadLastReplayFromStorage,
  type RecordedBattleReplay,
} from '../math/deterministicReplayEngine';
import { drawHeroNyxOrLeo } from '../sprites/heroNyxAndKingLeo';
import { drawHeroFenrirOrGreatDuck } from '../sprites/heroFenrirAndGreatDuck';
import { drawArticulatedDragonBoss } from '../sprites/arc3DragonBossSprites';
import { ZeroLagVfxPool } from '../engine/zeroLagVfxPool';

export interface TitleCalloutPop {
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface ReplayTeamFormation {
  readonly actId: number;
  readonly leftHeroTeam: ReadonlyArray<PlayableHeroId>;
  readonly rightBossName: string;
  readonly fenrirOnHeroTeam: boolean;
}

/**
 * Renewal Pillar 2 Single Source of Truth for Replay Theater Team Sides:
 * - Acts 1..82 (Arcs I–II): Nyx & King Leo (LEFT) vs Usurper/Emperor Fenrir (RIGHT).
 * - Acts 83..1000 (Arcs III–X): Nyx, King Leo, Reformed Fenrir, & The Great Duck (LEFT)
 *   vs the Act's true Pixel-Art Boss (RIGHT)!
 */
export function getReplayTeamFormation(actId: number): ReplayTeamFormation {
  const clamped = Math.max(1, Math.min(1000, Math.floor(actId)));
  if (clamped < 83) {
    return {
      actId: clamped,
      leftHeroTeam: ['nyx', 'king_leo'],
      rightBossName: clamped <= 41 ? 'Usurper King Fenrir' : 'Emperor Fenrir & Ragnarok',
      fenrirOnHeroTeam: false,
    };
  }

  let bossName = 'Ignis-Bahamut, World-Breaker';
  if (clamped >= 901) bossName = 'AETHER-NULL, Void Sovereign';
  else if (clamped >= 801) bossName = 'Umbra-Nyx, Mirror Sovereign';
  else if (clamped >= 701) bossName = 'Zephyrus, Sky-Island Lord';
  else if (clamped >= 601) bossName = 'Borealis, Astral Glacier';
  else if (clamped >= 501) bossName = 'Vulcan-Rex, Magma Colossus';
  else if (clamped >= 401) bossName = 'Chronos-Omega, Clockwork Core';
  else if (clamped >= 301) bossName = 'Charybdis, Kraken Sovereign';

  return {
    actId: clamped,
    leftHeroTeam: ['nyx', 'king_leo', 'fenrir', 'great_duck'],
    rightBossName: bossName,
    fenrirOnHeroTeam: true,
  };
}

export function createShowcaseBossReplay(actId = 300): RecordedBattleReplay {
  const rec = new DeterministicReplayRecorder();
  rec.startRecording(actId, 'nyx', 0xc07c0300);
  const totalTicks = 360; // 6 seconds at 60Hz
  for (let tick = 0; tick < totalTicks; tick++) {
    const moveX: -1 | 0 | 1 = tick % 90 < 45 ? 1 : -1;
    const sinY = Math.sin(tick * 0.08);
    const moveY: -1 | 0 | 1 = sinY > 0.35 ? 1 : sinY < -0.35 ? -1 : 0;
    let actionMask = 0;
    if (tick % 24 === 8) actionMask |= INPUT_BIT_ATTACK;
    if (tick % 60 === 30) actionMask |= INPUT_BIT_DODGE;
    if (tick % 96 === 48) actionMask |= INPUT_BIT_WAR_HORN;
    if (tick === 150) actionMask |= INPUT_BIT_ELIXIR;
    const swapSlot: 0 | 1 | 2 | 3 | 4 = tick === 120 ? 2 : tick === 240 ? 1 : 0;
    rec.recordFrame({
      tick,
      moveX,
      moveY,
      actionMask,
      swapSlot,
      aimDeciDeg: (tick * 15) % 3600,
    });
  }
  return rec.stopAndExport();
}

export class TitleScreenLiveArena {
  private elapsedSec = 0;
  private calloutTimer = 0.7;
  private calloutIdx = 0;
  private readonly vfx = new ZeroLagVfxPool();
  private readonly callouts: TitleCalloutPop[] = [];

  private activeReplay: RecordedBattleReplay | null = null;
  private replayPlayer: DeterministicReplayPlayer | null = null;
  private replayTick = 0;
  private replayTickAccumulator = 0;
  private replayLabel = '';
  private bossHpPct = 0.82;

  private nyxPos: Vec2 = { x: 112, y: 184 };
  private leoPos: Vec2 = { x: 158, y: 196 };
  private fenrirPos: Vec2 = { x: 204, y: 182 };
  private duckPos: Vec2 = { x: 74, y: 176 };
  private bahamutPos: Vec2 = { x: 356, y: 162 };

  private readonly calloutScript: ReadonlyArray<{
    readonly text: string;
    readonly color: string;
    readonly target: 'nyx' | 'leo' | 'fenrir';
  }> = [
    { text: 'ARCANE CRIT!', color: '#c084fc', target: 'fenrir' },
    { text: 'STARLIGHT CLEAVE!', color: '#fde047', target: 'leo' },
    { text: '⚡ PERFECT DODGE!', color: '#38bdf8', target: 'nyx' },
  ];

  public hasSavedReplay(): boolean {
    return loadLastReplayFromStorage() !== null;
  }

  public isReplayActive(): boolean {
    return this.replayPlayer !== null && !this.replayPlayer.isFinished(this.replayTick);
  }

  public getReplayProgress(): number {
    if (!this.activeReplay || this.activeReplay.totalTicks <= 0) return 0;
    return Math.max(0, Math.min(1, this.replayTick / this.activeReplay.totalTicks));
  }

  public getReplayLabel(): string {
    return this.replayLabel;
  }

  public getActiveFormation(): ReplayTeamFormation {
    return getReplayTeamFormation(this.activeReplay?.actId ?? 300);
  }

  public startSavedReplay(explicitRecording?: RecordedBattleReplay): void {
    const recording = explicitRecording ?? loadLastReplayFromStorage() ?? createShowcaseBossReplay(300);
    this.activeReplay = recording;
    this.replayPlayer = new DeterministicReplayPlayer(recording);
    this.replayTick = 0;
    this.replayTickAccumulator = 0;
    this.bossHpPct = 1.0;
    const team = getReplayTeamFormation(recording.actId);
    this.replayLabel = `🎬 REPLAY • ACT ${recording.actId} • ${team.rightBossName} (${recording.totalTicks} TICKS)`;
    this.nyxPos = { x: 118, y: 186 };
    this.leoPos = { x: 164, y: 194 };
    this.fenrirPos = team.fenrirOnHeroTeam ? { x: 204, y: 184 } : { x: 320, y: 186 };
    this.duckPos = { x: 78, y: 176 };
    this.bahamutPos = { x: 358, y: 160 };
    this.callouts.length = 0;
  }

  public stopSavedReplay(): void {
    this.activeReplay = null;
    this.replayPlayer = null;
    this.replayTick = 0;
    this.replayLabel = '';
  }

  public update(dt: number): void {
    const safeDt = Math.min(0.05, dt);
    this.elapsedSec += safeDt;

    if (this.replayPlayer && this.activeReplay) {
      if (this.replayPlayer.isFinished(this.replayTick)) {
        this.replayPlayer = new DeterministicReplayPlayer(this.activeReplay);
        this.replayTick = 0;
        this.bossHpPct = 1.0;
      }
      this.stepReplaySimulation(safeDt);
    } else {
      this.stepLiveAiSimulation(safeDt);
    }

    for (let i = this.callouts.length - 1; i >= 0; i--) {
      const pop = this.callouts[i];
      pop.life -= safeDt;
      pop.y += pop.vy * safeDt;
      if (pop.life <= 0) {
        this.callouts.splice(i, 1);
      }
    }

    this.vfx.update(safeDt);
  }

  private stepReplaySimulation(dt: number): void {
    if (!this.replayPlayer || !this.activeReplay) return;
    const team = getReplayTeamFormation(this.activeReplay.actId);
    this.replayTickAccumulator += dt;
    const fixedStep = 1 / 60;
    while (
      this.replayTickAccumulator >= fixedStep &&
      !this.replayPlayer.isFinished(this.replayTick)
    ) {
      this.replayTickAccumulator -= fixedStep;
      const frame = this.replayPlayer.getInputForTick(this.replayTick);
      this.replayTick += 1;

      this.nyxPos.x = Math.max(64, Math.min(220, this.nyxPos.x + frame.moveX * 1.3));
      this.nyxPos.y = Math.max(150, Math.min(218, this.nyxPos.y + frame.moveY * 0.9));
      this.leoPos.x = Math.max(96, Math.min(246, this.nyxPos.x + 38));
      this.duckPos.x = Math.max(44, this.nyxPos.x - 36);
      this.duckPos.y = 176 + Math.sin(frame.tick * 0.09) * 8;
      this.fenrirPos.x = team.fenrirOnHeroTeam
        ? Math.max(132, Math.min(268, this.leoPos.x + 34))
        : 318 - Math.sin(frame.tick * 0.05) * 24;
      this.bahamutPos.y = 158 + Math.cos(frame.tick * 0.04) * 10;
      this.bossHpPct = Math.max(0.08, 1 - (this.replayTick / Math.max(1, this.activeReplay.totalTicks)) * 0.88);

      if ((frame.actionMask & INPUT_BIT_WAR_HORN) !== 0) {
        this.spawnCallout('📯 WAR HORN RALLY!', '#c084fc', this.fenrirPos);
      } else if ((frame.actionMask & INPUT_BIT_DODGE) !== 0) {
        this.spawnCallout('⚡ PERFECT DODGE!', '#38bdf8', this.nyxPos);
      } else if ((frame.actionMask & INPUT_BIT_ELIXIR) !== 0) {
        this.spawnCallout('🦆 GREAT DUCK ELIXIR!', '#fde047', this.duckPos);
      } else if ((frame.actionMask & INPUT_BIT_ATTACK) !== 0 && frame.tick % 48 === 8) {
        this.spawnCallout('STARLIGHT CLEAVE!', '#fde047', this.leoPos);
      }
    }
  }

  private stepLiveAiSimulation(safeDt: number): void {
    this.nyxPos.x = 114 + Math.sin(this.elapsedSec * 2.4) * 22;
    this.nyxPos.y = 186 + Math.cos(this.elapsedSec * 3.1) * 10;

    this.leoPos.x = 160 + Math.cos(this.elapsedSec * 1.9) * 18;
    this.leoPos.y = 194 + Math.sin(this.elapsedSec * 2.5) * 8;

    // Reformed Fenrir & Great Duck fight on the LEFT Hero Team against Ignis-Bahamut!
    this.fenrirPos.x = 204 + Math.sin(this.elapsedSec * 2.1) * 20;
    this.fenrirPos.y = 186 + Math.sin(this.elapsedSec * 2.8) * 10;

    this.duckPos.x = 74 + Math.cos(this.elapsedSec * 1.7) * 12;
    this.duckPos.y = 176 + Math.sin(this.elapsedSec * 2.3) * 8;

    this.bahamutPos.x = 358 + Math.cos(this.elapsedSec * 1.1) * 12;
    this.bahamutPos.y = 160 + Math.sin(this.elapsedSec * 1.8) * 9;
    this.bossHpPct = 0.35 + 0.55 * (0.5 + 0.5 * Math.cos(this.elapsedSec * 0.45));

    this.calloutTimer -= safeDt;
    if (this.calloutTimer <= 0) {
      this.calloutTimer = 1.45;
      const spec = this.calloutScript[this.calloutIdx % this.calloutScript.length];
      this.calloutIdx += 1;
      const anchor =
        spec.target === 'nyx'
          ? this.nyxPos
          : spec.target === 'leo'
            ? this.leoPos
            : this.fenrirPos;
      this.spawnCallout(spec.text, spec.color, anchor);
    }
  }

  private spawnCallout(text: string, color: string, anchor: Vec2): void {
    // Strictly vertically stagger active callouts so they NEVER overlap in one pile!
    let targetY = anchor.y - 26;
    for (let i = 0; i < this.callouts.length; i++) {
      const existing = this.callouts[i];
      if (Math.abs(existing.x - anchor.x) < 68 && Math.abs(existing.y - targetY) < 16) {
        targetY = Math.min(targetY, existing.y - 18);
      }
    }

    this.callouts.push({
      text,
      x: anchor.x,
      y: Math.max(46, targetY),
      vy: -20,
      life: 1.15,
      maxLife: 1.15,
      color,
    });
    this.vfx.emitBurst(
      { x: (this.leoPos.x + this.bahamutPos.x) * 0.5, y: 176 },
      10,
      52,
      color,
      color === '#38bdf8' ? 'glow_cyan' : 'glow_gold',
    );
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const team = this.getActiveFormation();

    // Real 16-bit Act Arena Backdrop (dark royal castle/sky stone, NEVER flat neon!)
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.55, '#1e1b4b');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Arena floor tiles + stone parapet border
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, height * 0.58, width, height * 0.42);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, height * 0.58, width, 3);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    for (let tx = 0; tx < width; tx += 32) {
      ctx.fillRect(tx, height * 0.58 + 3, 1, height * 0.42);
    }

    const frameIdx = Math.floor(this.elapsedSec * 7);
    const attackBeat = Math.floor(this.elapsedSec * 2) % 3 === 0;

    // LEFT Hero Team (Nyx with crooked starry wizard hat ALWAYS ON + Golden Lion King Leo)
    drawHeroNyxOrLeo(ctx, 'nyx', this.nyxPos.x, this.nyxPos.y, attackBeat ? 'attack' : 'walk', frameIdx, 1, 0, 4);
    drawHeroNyxOrLeo(ctx, 'king_leo', this.leoPos.x, this.leoPos.y, attackBeat ? 'attack' : 'walk', frameIdx + 1, 1);

    if (team.fenrirOnHeroTeam) {
      // Arcs III–X: Reformed Fenrir & The Great Duck fight on the LEFT Hero Team!
      drawHeroFenrirOrGreatDuck(ctx, 'great_duck', this.duckPos.x, this.duckPos.y, attackBeat ? 'attack' : 'walk', frameIdx, 1, this.elapsedSec);
      drawHeroFenrirOrGreatDuck(ctx, 'fenrir', this.fenrirPos.x, this.fenrirPos.y, attackBeat ? 'attack' : 'walk', frameIdx, 1, this.elapsedSec);

      // RIGHT Pixel-Art Act Boss (ZERO emojis!)
      drawArticulatedDragonBoss(
        ctx,
        'ignis_bahamut',
        this.bahamutPos.x,
        this.bahamutPos.y,
        attackBeat ? 'attack' : 'idle',
        frameIdx,
        -1,
        {
          wingsBroken: false,
          tailSevered: false,
          chestCoreExposed: true,
          wingFlapRadians: Math.sin(this.elapsedSec * 5.2),
          tailSwayRadians: Math.cos(this.elapsedSec * 3.1),
        },
        1.1,
      );
    } else {
      // Arcs I–II: Usurper/Emperor Fenrir stands on the RIGHT Boss side!
      drawHeroFenrirOrGreatDuck(ctx, 'fenrir', this.fenrirPos.x, this.fenrirPos.y, attackBeat ? 'attack' : 'walk', frameIdx, -1, this.elapsedSec);
    }

    this.vfx.render(ctx, 0, 0);

    // Boss HP Bar rendered crisp at top-right of the arena
    ctx.save();
    const barW = Math.min(180, width * 0.42);
    const barX = width - barW - 12;
    const barY = this.replayPlayer ? 36 : 12;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, 18);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(barX, barY + 9, Math.max(4, barW * this.bossHpPct), 5);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 8px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(team.rightBossName, barX + 2, barY + 6);

    // Staggered Floating Combat Callouts
    ctx.font = 'bold 10px ui-sans-serif, system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    for (let i = 0; i < this.callouts.length; i++) {
      const pop = this.callouts[i];
      ctx.globalAlpha = Math.max(0, Math.min(1, pop.life / pop.maxLife));
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = '#020617';
      ctx.strokeText(pop.text, Math.round(pop.x), Math.round(pop.y));
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, Math.round(pop.x), Math.round(pop.y));
    }

    if (this.replayPlayer) {
      ctx.globalAlpha = 0.94;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(10, 10, width - 20, 20);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(10, 28, (width - 20) * this.getReplayProgress(), 2);
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.font = 'bold 9px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(this.replayLabel, 16, 23);
    }
    ctx.restore();
  }
}
