/**
 * File 38 / 100 — 20 Bounty Quests & 20 Achievement Titles across all 10 Omniverse Arcs.
 * Zero `any` types.
 */

import type { AchievementTitleSpec, ArcId, BountyQuestSpec } from '../types/world';

export const BOUNTY_QUESTS_20: ReadonlyArray<BountyQuestSpec> = [
  { id: 'bounty_01', title: 'Clear the Outskirts', description: 'Defeat 25 Usurper Wolves in Arc I.', targetArc: 1, targetCount: 25, rewardGold: 450, rewardStarPoints: 1, rewardTitleId: 'title_01' },
  { id: 'bounty_02', title: 'Liberator of King Leo', description: 'Vanquish Usurper King Fenrir in Act 100.', targetArc: 1, targetCount: 1, rewardGold: 1200, rewardStarPoints: 2, rewardTitleId: 'title_02' },
  { id: 'bounty_03', title: 'Trench Breaker', description: 'Capture 10 War Banners in Arc II.', targetArc: 2, targetCount: 10, rewardGold: 900, rewardStarPoints: 1, rewardTitleId: 'title_03' },
  { id: 'bounty_04', title: 'Shatter the Dread-Chariot', description: 'Defeat Emperor Fenrir & Ragnarok in Act 200.', targetArc: 2, targetCount: 1, rewardGold: 1800, rewardStarPoints: 2, rewardTitleId: 'title_04' },
  { id: 'bounty_05', title: 'Ballista Sharpshooter', description: 'Break 6 Dragon Wings with Harpoon Ballistas in Arc III.', targetArc: 3, targetCount: 6, rewardGold: 1600, rewardStarPoints: 2, rewardTitleId: 'title_05' },
  { id: 'bounty_06', title: 'World-Breaker Bane', description: 'Slay Ignis-Bahamut in Act 300.', targetArc: 3, targetCount: 1, rewardGold: 2800, rewardStarPoints: 3, rewardTitleId: 'title_06' },
  { id: 'bounty_07', title: 'Tentacle Cleaver', description: 'Sever 24 Kraken Tentacles across Arc IV.', targetArc: 4, targetCount: 24, rewardGold: 2200, rewardStarPoints: 2, rewardTitleId: 'title_07' },
  { id: 'bounty_08', title: 'Tide Sovereign', description: 'Defeat Charybdis in Act 400.', targetArc: 4, targetCount: 1, rewardGold: 3600, rewardStarPoints: 3, rewardTitleId: 'title_08' },
  { id: 'bounty_09', title: 'Gear Saboteur', description: 'Destroy 16 Chrono-Gears in Arc V.', targetArc: 5, targetCount: 16, rewardGold: 3000, rewardStarPoints: 2, rewardTitleId: 'title_09' },
  { id: 'bounty_10', title: 'Master of Time', description: 'Defeat Chronos-Omega in Act 500.', targetArc: 5, targetCount: 1, rewardGold: 4800, rewardStarPoints: 3, rewardTitleId: 'title_10' },
  { id: 'bounty_11', title: 'Obsidian Alchemist', description: 'Trigger 12 Lava + Water Obsidian reactions in Arc VI.', targetArc: 6, targetCount: 12, rewardGold: 3800, rewardStarPoints: 2, rewardTitleId: 'title_11' },
  { id: 'bounty_12', title: 'Caldera Extinguisher', description: 'Vanquish Vulcan-Rex in Act 600.', targetArc: 6, targetCount: 1, rewardGold: 6200, rewardStarPoints: 3, rewardTitleId: 'title_12' },
  { id: 'bounty_13', title: 'Glacier Pathfinder', description: 'Clear 20 Frost stages without slipping into chasms in Arc VII.', targetArc: 7, targetCount: 20, rewardGold: 4600, rewardStarPoints: 2, rewardTitleId: 'title_13' },
  { id: 'bounty_14', title: 'Aurora Champion', description: 'Defeat Borealis in Act 700.', targetArc: 7, targetCount: 1, rewardGold: 7800, rewardStarPoints: 4, rewardTitleId: 'title_14' },
  { id: 'bounty_15', title: 'Sky-Plunge Duelist', description: 'Land 15 Plunge Slashes from High Ground in Arc VIII.', targetArc: 8, targetCount: 15, rewardGold: 5500, rewardStarPoints: 3, rewardTitleId: 'title_15' },
  { id: 'bounty_16', title: 'Hurricane Tamer', description: 'Defeat Zephyrus in Act 800.', targetArc: 8, targetCount: 1, rewardGold: 9500, rewardStarPoints: 4, rewardTitleId: 'title_16' },
  { id: 'bounty_17', title: 'Mirror Breaker', description: 'Dispel 18 Doppelganger Illusions in Arc IX.', targetArc: 9, targetCount: 18, rewardGold: 7000, rewardStarPoints: 3, rewardTitleId: 'title_17' },
  { id: 'bounty_18', title: 'True Starlight Mage', description: 'Defeat Umbra-Nyx in Act 900.', targetArc: 9, targetCount: 1, rewardGold: 12000, rewardStarPoints: 5, rewardTitleId: 'title_18' },
  { id: 'bounty_19', title: 'Constellation Grandmaster', description: 'Unlock 30+ Constellation Skill Nodes.', targetArc: 10, targetCount: 30, rewardGold: 10000, rewardStarPoints: 5, rewardTitleId: 'title_19' },
  { id: 'bounty_20', title: 'Savior of the 1,000-Act Omniverse', description: 'Vanquish AETHER-NULL in Act 1000.', targetArc: 10, targetCount: 1, rewardGold: 25000, rewardStarPoints: 10, rewardTitleId: 'title_20' },
];

export const ACHIEVEMENT_TITLES_20: ReadonlyArray<AchievementTitleSpec> = BOUNTY_QUESTS_20.map(
  (q, idx) => ({
    id: q.rewardTitleId,
    badge: `ARC ${q.targetArc}`,
    title: q.title,
    requirement: q.description,
    bonusAtkPct: 1 + Math.floor(idx / 4),
    bonusDefPct: 1 + Math.floor(idx / 5),
  }),
);

export function getBountiesForArc(arcId: ArcId): ReadonlyArray<BountyQuestSpec> {
  return BOUNTY_QUESTS_20.filter((b) => b.targetArc === arcId);
}
