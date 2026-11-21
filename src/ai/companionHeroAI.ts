/**
 * File 22 / 100 — Companion Hero AI & STRICT STORY NPC DEDUPLICATION ENGINE.
 *
 * Renewal Pillar 1 Rule #3 (ZERO DUPLICATE HEROES):
 * Before spawning AI Party Companions (`king_leo`, `fenrir`, `great_duck`) in ANY Act:
 * - If `king_leo` is caged in the Throne Room OR standing as a Sanctuary NPC -> SKIP duplicate companion!
 * - If `fenrir` is the active Enemy Boss (Arcs 1–2) OR standing as a Sanctuary NPC -> SKIP duplicate companion!
 * - If `great_duck` is standing on a Sanctuary platform as an NPC -> SKIP duplicate companion!
 * - Never spawn the currently controlled active hero as an AI companion!
 * Zero `any` types.
 */

import type { CompanionSpawnDecision, StoryNpcPresenceFlags } from '../types/ai';
import type { PlayableHeroId } from '../types/combat';
import type { ArcId } from '../types/world';

export function buildStoryNpcPresenceForAct(
  actId: number,
  options: {
    readonly isSanctuary: boolean;
    readonly hasCagedKingLeo?: boolean;
    readonly activeBossIds?: ReadonlyArray<string>;
    readonly npcSpriteIds?: ReadonlyArray<string>;
  },
): StoryNpcPresenceFlags {
  const clampedAct = Math.max(1, Math.min(1000, Math.floor(actId)));
  const arcId = (Math.floor((clampedAct - 1) / 100) + 1) as ArcId;
  const bossIds = options.activeBossIds ?? [];
  const npcIds = options.npcSpriteIds ?? [];

  const kingLeoCagedOnMap =
    Boolean(options.hasCagedKingLeo) || clampedAct === 41 || clampedAct === 100;

  const kingLeoSanctuaryNpc =
    npcIds.includes('king_leo') || (options.isSanctuary && clampedAct >= 199);

  const fenrirActiveEnemyBoss =
    bossIds.some((id) => id.includes('fenrir')) ||
    (arcId <= 2 && (clampedAct === 41 || clampedAct === 82 || clampedAct === 100 || clampedAct === 200));

  const fenrirSanctuaryNpc =
    npcIds.includes('fenrir') || (options.isSanctuary && clampedAct >= 299);

  const greatDuckSanctuaryNpc =
    npcIds.includes('great_duck') || options.isSanctuary || clampedAct % 100 === 99;

  return {
    actId: clampedAct,
    arcId,
    kingLeoCagedOnMap,
    kingLeoSanctuaryNpc,
    fenrirActiveEnemyBoss,
    fenrirSanctuaryNpc,
    greatDuckSanctuaryNpc,
  };
}

export function evaluateCompanionSpawns(
  activeHeroId: PlayableHeroId,
  unlockedHeroes: ReadonlyArray<PlayableHeroId>,
  presence: StoryNpcPresenceFlags,
): CompanionSpawnDecision[] {
  const decisions: CompanionSpawnDecision[] = [];
  const seen = new Set<PlayableHeroId>();

  for (let i = 0; i < unlockedHeroes.length; i++) {
    const heroId = unlockedHeroes[i];
    if (seen.has(heroId)) continue;
    seen.add(heroId);

    if (heroId === activeHeroId) {
      decisions.push({
        heroId,
        shouldSpawn: false,
        skipReason: 'Hero is currently controlled by the player',
      });
      continue;
    }

    if (heroId === 'king_leo' && (presence.kingLeoCagedOnMap || presence.kingLeoSanctuaryNpc)) {
      decisions.push({
        heroId,
        shouldSpawn: false,
        skipReason: presence.kingLeoCagedOnMap
          ? 'King Leo is already caged on this map (deduplicated)'
          : 'King Leo is already standing as a Sanctuary NPC (deduplicated)',
      });
      continue;
    }

    if (heroId === 'fenrir' && (presence.fenrirActiveEnemyBoss || presence.fenrirSanctuaryNpc)) {
      decisions.push({
        heroId,
        shouldSpawn: false,
        skipReason: presence.fenrirActiveEnemyBoss
          ? 'Wolf-King Fenrir is the active Enemy Boss in this Act (deduplicated)'
          : 'Wolf-King Fenrir is already standing as a Sanctuary NPC (deduplicated)',
      });
      continue;
    }

    if (heroId === 'great_duck' && presence.greatDuckSanctuaryNpc) {
      decisions.push({
        heroId,
        shouldSpawn: false,
        skipReason: 'The Great Duck is already standing on the Sanctuary platform (deduplicated)',
      });
      continue;
    }

    decisions.push({
      heroId,
      shouldSpawn: true,
      skipReason: null,
    });
  }

  return decisions;
}

export function filterDeduplicatedCompanionIds(
  activeHeroId: PlayableHeroId,
  unlockedHeroes: ReadonlyArray<PlayableHeroId>,
  presence: StoryNpcPresenceFlags,
): PlayableHeroId[] {
  return evaluateCompanionSpawns(activeHeroId, unlockedHeroes, presence)
    .filter((d) => d.shouldSpawn)
    .map((d) => d.heroId);
}
