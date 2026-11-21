/**
 * File 79 / 100 — Unified Omniverse 3D Command Hub Modal (All 11 Tabs).
 *
 * Strictly avoids `backdrop-blur` on modal surfaces so all 3 embedded Three.js
 * WebGL renderers (Hollow Voxel Cauldron, 10 Boss Trophies, 4 Voxel Heroes)
 * maintain crisp 60FPS rendering without GPU compositor overhead.
 * Zero `any` types.
 */

import { useState } from 'react';
import {
  Award,
  Box,
  Building2,
  Crown,
  Grid3X3,
  Map,
  Save,
  Sparkles,
  Sword,
  Swords,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { HubInventoryTab } from './hubInventoryTab';
import { HubWorldMap1000Tab } from './hubWorldMap1000Tab';
import { HubCapitalTab } from './hubCapitalTab';
import { Hub3DAlchemyCauldronTab } from './hub3DAlchemyCauldronTab';
import { Hub3DBossTrophyTab } from './hub3DBossTrophyTab';
import { Hub3DHeroShowcaseTab } from './hub3DHeroShowcaseTab';
import { HubSkillTree60Tab } from './hubSkillTree60Tab';
import { HubBountyAndTitlesTab } from './hubBountyAndTitlesTab';
import { HubSaveVaultAndJukeboxTab } from './hubSaveVaultAndJukeboxTab';
import { InteractiveDojoGuideView } from './InteractiveDojoGuideView';
import { CustomDungeonAndBossEditor } from './customDungeonAndBossEditor';

export type OmniverseHubTabId =
  | 'voxel_cauldron'
  | 'boss_trophies_3d'
  | 'hero_showcase_3d'
  | 'world_map_1000'
  | 'armory_50'
  | 'capital_12'
  | 'skills_60'
  | 'bounties_20'
  | 'skills_vault'
  | 'dojo'
  | 'custom_editor';

export interface OmniverseCommandHubModalProps {
  readonly currentAct: number;
  readonly maxUnlockedAct: number;
  readonly gold: number;
  readonly starPoints: number;
  readonly equippedWeaponId: string;
  readonly equippedArmorId: string;
  readonly gearStarLevels: Readonly<Record<string, number>>;
  readonly unlockedSkillNodeIds: ReadonlyArray<string>;
  readonly initialTab?: OmniverseHubTabId;
  readonly onClose: () => void;
  readonly onTravelAct: (actId: number) => void;
  readonly onRestoreAct: (targetAct: number) => void;
  readonly onExportSaveCode: () => string;
  readonly onImportSaveCode: (code: string) => boolean;
}

const HUB_TABS: ReadonlyArray<{
  readonly id: OmniverseHubTabId;
  readonly label: string;
}> = [
  { id: 'voxel_cauldron', label: '3D Cauldron' },
  { id: 'boss_trophies_3d', label: '3D Trophies' },
  { id: 'hero_showcase_3d', label: '3D Heroes' },
  { id: 'world_map_1000', label: '1,000-Act Map' },
  { id: 'armory_50', label: '50-Tier Armory' },
  { id: 'capital_12', label: 'Capital (12)' },
  { id: 'skills_60', label: '60 Skills' },
  { id: 'bounties_20', label: 'Bounties' },
  { id: 'skills_vault', label: 'Vault & 40 OST' },
  { id: 'dojo', label: 'Dojo Guide' },
  { id: 'custom_editor', label: 'Map Editor' },
];

export function OmniverseCommandHubModal({
  currentAct,
  maxUnlockedAct,
  gold,
  starPoints,
  equippedWeaponId,
  equippedArmorId,
  gearStarLevels,
  unlockedSkillNodeIds,
  initialTab = 'voxel_cauldron',
  onClose,
  onTravelAct,
  onRestoreAct,
  onExportSaveCode,
  onImportSaveCode,
}: OmniverseCommandHubModalProps) {
  const [activeTab, setActiveTab] = useState<OmniverseHubTabId>(initialTab);

  const renderTabIcon = (id: OmniverseHubTabId) => {
    switch (id) {
      case 'voxel_cauldron':
        return <Box className="h-3.5 w-3.5" />;
      case 'boss_trophies_3d':
        return <Trophy className="h-3.5 w-3.5" />;
      case 'hero_showcase_3d':
        return <Users className="h-3.5 w-3.5" />;
      case 'world_map_1000':
        return <Map className="h-3.5 w-3.5" />;
      case 'armory_50':
        return <Sword className="h-3.5 w-3.5" />;
      case 'capital_12':
        return <Building2 className="h-3.5 w-3.5" />;
      case 'skills_60':
        return <Sparkles className="h-3.5 w-3.5" />;
      case 'bounties_20':
        return <Award className="h-3.5 w-3.5" />;
      case 'skills_vault':
        return <Save className="h-3.5 w-3.5" />;
      case 'custom_editor':
        return <Grid3X3 className="h-3.5 w-3.5" />;
      case 'dojo':
        return <Swords className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-slate-950/92 p-3">
      <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-amber-400/60 bg-slate-950 shadow-2xl">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-black tracking-wide text-amber-100">
                CLAWS OF THE CROWN • 1,000-ACT OMNIVERSE HYPER-HUB ULTRA
              </h2>
              <p className="text-[10px] text-slate-400">
                Act {currentAct}/1,000 • 3D Hollow BlockCraft Cauldron • 50 Gear Tiers • 40 DSP OST Tracks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        {/* 11-Tab Navigation Strip */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 bg-slate-900/70 px-4 py-2">
          {HUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {renderTabIcon(tab.id)}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'voxel_cauldron' && <Hub3DAlchemyCauldronTab gold={gold} />}
          {activeTab === 'boss_trophies_3d' && <Hub3DBossTrophyTab />}
          {activeTab === 'hero_showcase_3d' && <Hub3DHeroShowcaseTab />}
          {activeTab === 'world_map_1000' && (
            <HubWorldMap1000Tab
              currentAct={currentAct}
              maxUnlockedAct={maxUnlockedAct}
              onTravelAct={(actId) => {
                onTravelAct(actId);
                onClose();
              }}
            />
          )}
          {activeTab === 'armory_50' && (
            <HubInventoryTab
              currentAct={currentAct}
              gold={gold}
              equippedWeaponId={equippedWeaponId}
              equippedArmorId={equippedArmorId}
              gearStarLevels={gearStarLevels}
            />
          )}
          {activeTab === 'capital_12' && <HubCapitalTab gold={gold} />}
          {activeTab === 'skills_60' && (
            <HubSkillTree60Tab starPoints={starPoints} initialUnlockedIds={unlockedSkillNodeIds} />
          )}
          {activeTab === 'bounties_20' && <HubBountyAndTitlesTab currentAct={currentAct} />}
          {activeTab === 'skills_vault' && (
            <HubSaveVaultAndJukeboxTab
              currentAct={currentAct}
              onRestoreAct={onRestoreAct}
              onExportSaveCode={onExportSaveCode}
              onImportSaveCode={onImportSaveCode}
            />
          )}
          {activeTab === 'dojo' && <InteractiveDojoGuideView />}
          {activeTab === 'custom_editor' && <CustomDungeonAndBossEditor />}
        </div>
      </div>
    </div>
  );
}
