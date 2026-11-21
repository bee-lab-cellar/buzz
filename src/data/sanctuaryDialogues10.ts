/**
 * File 37 / 100 — Explicit `switch (currentAct)` Sanctuary Dialogue, Royal Dark Tileset
 * & Dynamic `currentAct + 1` Portal Routing for ALL 10 Sanctuaries (99..999).
 *
 * Renewal Pillar 1 Rule #2:
 * - Explicit `switch (currentAct)` covering 99, 199, 299, 399, 499, 599, 699, 799, 899, 999
 * - Unique 3-line dialogue script per Sanctuary
 * - Dark royal cosmic/biome tileset palettes (NEVER blinding neon-yellow borders or teal checkerboards!)
 * - Exit portal ALWAYS warps to `currentAct + 1` (NEVER hardcoded to Act 41!)
 * Zero `any` types.
 */

import type { ArcId } from '../types/world';

export interface SanctuaryDialogueAndTheme {
  readonly sanctuaryAct: number;
  readonly arcId: ArcId;
  readonly destinationAct: number;
  readonly sanctuaryName: string;
  readonly speaker: string;
  readonly lines: readonly [string, string, string];
  readonly portalLabel: string;
  readonly floorBaseHex: string;
  readonly floorTrimHex: string;
  readonly borderStoneHex: string;
  readonly torchGlowHex: string;
  readonly hasKingLeoNpc: boolean;
  readonly hasFenrirNpc: boolean;
  readonly hasGreatDuckNpc: boolean;
}

export const ALL_10_SANCTUARY_ACTS: ReadonlyArray<number> = [
  99, 199, 299, 399, 499, 599, 699, 799, 899, 999,
];

export function getSanctuaryDialogueAndTheme(currentAct: number): SanctuaryDialogueAndTheme | null {
  switch (currentAct) {
    case 99:
      return {
        sanctuaryAct: 99,
        arcId: 1,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Golden Lotus Moon-Shrine',
        speaker: 'The Great Duck',
        lines: [
          'Quack! You crossed 98 forest and river trials to reach the Moon-Shrine, Nyx.',
          'Take my Golden Pond Elixir [Q] — its 20-second surge shatters Fenrir’s Eclipse Ward.',
          'Step through the Royal Gate to Act 100 and free Lion King Leo from the Throne Cage!',
        ],
        portalLabel: `Royal Warp -> Act ${currentAct + 1}: Usurper King Fenrir`,
        floorBaseHex: '#172033',
        floorTrimHex: '#334155',
        borderStoneHex: '#0f172a',
        torchGlowHex: '#f59e0b',
        hasKingLeoNpc: false,
        hasFenrirNpc: false,
        hasGreatDuckNpc: true,
      };
    case 199:
      return {
        sanctuaryAct: 199,
        arcId: 2,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Obsidian War-Council Pavilion',
        speaker: 'King Leo & The Great Duck',
        lines: [
          'Our Cat-Knights hold the western trenches while the Iron Dog Legion rallies ahead.',
          'King Leo’s Solar Roar and my Star-Forge anvil have tempered your blades for siege combat.',
          'March into Act 200 and break War-Emperor Fenrir’s Dread-Chariot Cerberus!',
        ],
        portalLabel: `War Council Gate -> Act ${currentAct + 1}: Emperor Fenrir & Ragnarok`,
        floorBaseHex: '#1c1926',
        floorTrimHex: '#3b324c',
        borderStoneHex: '#110f18',
        torchGlowHex: '#fb923c',
        hasKingLeoNpc: true,
        hasFenrirNpc: false,
        hasGreatDuckNpc: true,
      };
    case 299:
      return {
        sanctuaryAct: 299,
        arcId: 3,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Astral Star-Forge Aerie',
        speaker: 'King Leo, Wolf-King Fenrir & The Great Duck',
        lines: [
          'Cats and Dogs stand united! Reformed Wolf-King Fenrir now pledges his twin axes to our cause.',
          'Aim the Harpoon Ballistas to break Ignis-Bahamut’s wings and expose his fiery chest core.',
          'Ascend into Act 300 — the Dragon Cataclysm ends tonight!',
        ],
        portalLabel: `Star-Forge Gate -> Act ${currentAct + 1}: Ignis-Bahamut`,
        floorBaseHex: '#1f1522',
        floorTrimHex: '#4a2335',
        borderStoneHex: '#120b14',
        torchGlowHex: '#f97316',
        hasKingLeoNpc: true,
        hasFenrirNpc: true,
        hasGreatDuckNpc: true,
      };
    case 399:
      return {
        sanctuaryAct: 399,
        arcId: 4,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Sunken Pearl Basilica',
        speaker: 'The Great Duck',
        lines: [
          'Beneath the Kraken Archipelago lies the Abyssal Dome where Charybdis coils in darkness.',
          'Sever all 8 glowing tentacle weak-spots for 2.5x damage and grab the Golden Fish heals.',
          'Dive into Act 400 with full oxygen and shatter the World-Kraken’s Abyssal Ward!',
        ],
        portalLabel: `Abyssal Dive Gate -> Act ${currentAct + 1}: Charybdis, World-Kraken`,
        floorBaseHex: '#0d1f2d',
        floorTrimHex: '#1b3a50',
        borderStoneHex: '#07131d',
        torchGlowHex: '#38bdf8',
        hasKingLeoNpc: true,
        hasFenrirNpc: true,
        hasGreatDuckNpc: true,
      };
    case 499:
      return {
        sanctuaryAct: 499,
        arcId: 5,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Horologium Brass Sanctum',
        speaker: 'Master Forgepaw & The Great Duck',
        lines: [
          'Every pendulum in the Clockwork Sky-Citadel ticks toward Chronos-Omega’s temporal reset.',
          'Shatter the 4 Corner Chrono-Gears before the Time-Rewinding Titan restores his hull.',
          'Board the Sky-Lift to Act 500 — your Steam-Mecha cores are primed!',
        ],
        portalLabel: `Chrono-Lift -> Act ${currentAct + 1}: Chronos-Omega`,
        floorBaseHex: '#1f1b16',
        floorTrimHex: '#453827',
        borderStoneHex: '#120f0c',
        torchGlowHex: '#fbbf24',
        hasKingLeoNpc: true,
        hasFenrirNpc: true,
        hasGreatDuckNpc: true,
      };
    case 599:
      return {
        sanctuaryAct: 599,
        arcId: 6,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Obsidian Hearth Cloister',
        speaker: 'Wolf-King Fenrir',
        lines: [
          'Even the Volcanic Underworld bends to our united pack, Nyx.',
          'Quench Vulcan-Rex’s magma streams with Frost Flasks to bridge the caldera in solid obsidian.',
          'Cross the Caldera Arch to Act 600 and extinguish the Molten Core!',
        ],
        portalLabel: `Caldera Arch -> Act ${currentAct + 1}: Vulcan-Rex`,
        floorBaseHex: '#221414',
        floorTrimHex: '#4c211d',
        borderStoneHex: '#140b0b',
        torchGlowHex: '#ef4444',
        hasKingLeoNpc: true,
        hasFenrirNpc: true,
        hasGreatDuckNpc: true,
      };
    case 699:
      return {
        sanctuaryAct: 699,
        arcId: 7,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Aurora Prism Observatory',
        speaker: 'King Leo',
        lines: [
          'The Astral Glaciers freeze time itself, yet our Royal Solar Roar keeps the frost at bay.',
          'Watch Borealis’s crystal telegraph rings and counter-dash into the warm hearth zones.',
          'Advance to Act 700 and thaw the Absolute-Zero Leviathan!',
        ],
        portalLabel: `Aurora Gate -> Act ${currentAct + 1}: Borealis`,
        floorBaseHex: '#101d2e',
        floorTrimHex: '#233f63',
        borderStoneHex: '#08101c',
        torchGlowHex: '#7dd3fc',
        hasKingLeoNpc: true,
        hasFenrirNpc: true,
        hasGreatDuckNpc: true,
      };
    case 799:
      return {
        sanctuaryAct: 799,
        arcId: 8,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Emerald Sky-Spire Haven',
        speaker: 'The Great Duck',
        lines: [
          'High above the clouds, Zephyrus whips the Sky-Islands into an endless emerald hurricane.',
          'Use the updraft geysers for 2.0x Plunge Slashes and keep your cloak anchored.',
          'Leap through the Wind-Gate to Act 800 and claim the Tempest Crown!',
        ],
        portalLabel: `Tempest Gate -> Act ${currentAct + 1}: Zephyrus`,
        floorBaseHex: '#0f231e',
        floorTrimHex: '#1f493d',
        borderStoneHex: '#081411',
        torchGlowHex: '#34d399',
        hasKingLeoNpc: true,
        hasFenrirNpc: true,
        hasGreatDuckNpc: true,
      };
    case 899:
      return {
        sanctuaryAct: 899,
        arcId: 9,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Hall of Prismatic Reflections',
        speaker: 'Nyx & King Leo',
        lines: [
          'Inside the Mirror-Realm, shadows mimic our every spell — even Umbra-Nyx wears a dark echo of my hat.',
          'Strike the reflection whose starlight wand flickers out of sync to collapse her illusions.',
          'Step into Act 900 and shatter the Mirror Monarch’s glass throne!',
        ],
        portalLabel: `Mirror Threshold -> Act ${currentAct + 1}: Umbra-Nyx`,
        floorBaseHex: '#1a122b',
        floorTrimHex: '#38245c',
        borderStoneHex: '#0e0918',
        torchGlowHex: '#e879f9',
        hasKingLeoNpc: true,
        hasFenrirNpc: true,
        hasGreatDuckNpc: true,
      };
    case 999:
      return {
        sanctuaryAct: 999,
        arcId: 10,
        destinationAct: currentAct + 1,
        sanctuaryName: 'Royal Cosmic Omniverse Sanctum',
        speaker: 'Nyx, King Leo, Fenrir & The Great Duck',
        lines: [
          'All Four Leaders stand together on the Dark Cosmic Stone Platform at Act 999.',
          'Every Tier-50 relic, 60-node constellation, and Golden Pond Elixir resonates as one.',
          'Cross the Singularity Threshold to Act 1000 and vanquish AETHER-NULL forever!',
        ],
        portalLabel: `Singularity Gate -> Act ${currentAct + 1}: AETHER-NULL (5 Phases)`,
        floorBaseHex: '#130d24',
        floorTrimHex: '#312059',
        borderStoneHex: '#090612',
        torchGlowHex: '#c084fc',
        hasKingLeoNpc: true,
        hasFenrirNpc: true,
        hasGreatDuckNpc: true,
      };
    default:
      return null;
  }
}

export function resolveDynamicSanctuaryPortalDestination(currentAct: number): number | null {
  const theme = getSanctuaryDialogueAndTheme(currentAct);
  return theme ? theme.destinationAct : null;
}
