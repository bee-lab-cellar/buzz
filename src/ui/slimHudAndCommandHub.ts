/**
 * Layer 5 — Slim (<10% Viewport) Anti-GUI-Flooding HUD & 6-Tab Command Hub Controller
 *
 * Strictly enforces:
 * - Top HUD bar <= 32px height (<10% screen coverage)
 * - Maximum 1 transient toast banner active at a time
 * - Clean `lucide-react` icon mapping for all 6 Command Hub tabs
 */

export type CommandHubTabId =
  | 'world_map'
  | 'hero_party'
  | 'star_forge_anvil'
  | 'blockcraft_alchemy'
  | 'constellation_tree'
  | 'vault_and_settings';

export interface CommandHubTabDescriptor {
  readonly id: CommandHubTabId;
  readonly label: string;
  readonly shortLabel: string;
  readonly shortcutKey: string;
  readonly iconName: 'Map' | 'Shield' | 'Hammer' | 'FlaskConical' | 'Sparkles' | 'Settings';
  readonly accentClass: string;
}

export const COMMAND_HUB_6_TABS: ReadonlyArray<CommandHubTabDescriptor> = [
  {
    id: 'world_map',
    label: '300-Act World Map',
    shortLabel: 'MAP',
    shortcutKey: 'M',
    iconName: 'Map',
    accentClass: 'text-sky-300 border-sky-400/50',
  },
  {
    id: 'hero_party',
    label: 'Heroes & Armies',
    shortLabel: 'PARTY',
    shortcutKey: '1-4',
    iconName: 'Shield',
    accentClass: 'text-amber-300 border-amber-400/50',
  },
  {
    id: 'star_forge_anvil',
    label: 'Star-Forge Anvil (+25★)',
    shortLabel: 'FORGE',
    shortcutKey: 'I',
    iconName: 'Hammer',
    accentClass: 'text-orange-300 border-orange-400/50',
  },
  {
    id: 'blockcraft_alchemy',
    label: 'BlockCraft Alchemy',
    shortLabel: 'BREW',
    shortcutKey: 'C',
    iconName: 'FlaskConical',
    accentClass: 'text-emerald-300 border-emerald-400/50',
  },
  {
    id: 'constellation_tree',
    label: '60-Node Star Tree',
    shortLabel: 'SKILLS',
    shortcutKey: 'T',
    iconName: 'Sparkles',
    accentClass: 'text-violet-300 border-violet-400/50',
  },
  {
    id: 'vault_and_settings',
    label: 'iPad Vault & Keys',
    shortLabel: 'VAULT',
    shortcutKey: 'ESC',
    iconName: 'Settings',
    accentClass: 'text-slate-200 border-slate-400/50',
  },
];

export interface ActiveHudToast {
  readonly id: number;
  readonly message: string;
  readonly tone: 'gold' | 'emerald' | 'sky' | 'crimson';
  remainingSec: number;
}

/**
 * Single-slot toast queue that prevents HUD banner flooding during intense raids.
 */
export class AntiFloodHudToastQueue {
  private current: ActiveHudToast | null = null;
  private nextId = 1;

  public push(message: string, tone: ActiveHudToast['tone'] = 'gold', durationSec = 2.6): ActiveHudToast {
    const toast: ActiveHudToast = {
      id: this.nextId++,
      message,
      tone,
      remainingSec: durationSec,
    };
    this.current = toast;
    return toast;
  }

  public tick(dt: number): ActiveHudToast | null {
    if (!this.current) return null;
    this.current.remainingSec -= dt;
    if (this.current.remainingSec <= 0) {
      this.current = null;
    }
    return this.current;
  }

  public getActive(): ActiveHudToast | null {
    return this.current;
  }
}

export const SLIM_HUD_VIEWPORT_RULES = {
  maxTopBarHeightPx: 32,
  maxViewportCoveragePct: 10,
  maxSimultaneousToasts: 1,
} as const;
