/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { Box, Film } from 'lucide-react';
import { CapitalHubModal } from './components/CapitalHubModal';
import { DialogueBox } from './components/DialogueBox';
import { GameHud } from './components/GameHud';
import { InventoryModal } from './components/InventoryModal';
import { GameOverOverlay, TitleOverlay, VictoryOverlay } from './components/Overlays';
import { SkillTreeModal } from './components/SkillTreeModal';
import { TouchControls } from './components/TouchControls';
import { WorldMapModal } from './components/WorldMapModal';
import { RpgEngine } from './game/engine';
import { HUDState } from './game/types';
import { runWorldIntegrityAudit } from './tests/worldIntegrityAudit';
import { OmniverseCommandHubModal } from './ui/OmniverseCommandHubModal';
import { ReplayTheaterModal } from './ui/replayTheaterModal';

function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
    Boolean(window.matchMedia?.('(pointer: coarse)').matches)
  );
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<RpgEngine | null>(null);
  const [hud, setHud] = useState<HUDState | null>(null);
  const [touchEnabled, setTouchEnabled] = useState<boolean>(() => detectTouchDevice());
  const [omniverseHubOpen, setOmniverseHubOpen] = useState<boolean>(false);
  const [replayTheaterOpen, setReplayTheaterOpen] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new RpgEngine(canvas, (nextHud) => {
      setHud(nextHud);
    });
    engineRef.current = engine;
    const audit = runWorldIntegrityAudit();
    if (!audit.passed) {
      console.warn('World integrity audit warnings:', audit.errors.slice(0, 5));
    }
    engine.startLoop();

    const onKeyDown = (e: KeyboardEvent) => engine.handleKeyDown(e);
    const onKeyUp = (e: KeyboardEvent) => engine.handleKeyUp(e);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const isAnyHubModalOpen =
    hud &&
    (hud.mode === 'CAPITAL_HUB' ||
      hud.mode === 'INVENTORY' ||
      hud.mode === 'BLACKSMITH' ||
      hud.mode === 'WORLD_MAP' ||
      hud.mode === 'SKILL_TREE');

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#0b0e14]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Crisp 16:9 Pixel-Art Canvas Container */}
      <div className="relative aspect-video w-full max-h-screen max-w-[177.78vh] overflow-hidden bg-slate-950 shadow-2xl">
        <canvas
          ref={canvasRef}
          onMouseMove={(e) => engineRef.current?.handleMouseMove(e.clientX, e.clientY)}
          onMouseDown={(e) => engineRef.current?.handleMouseDown(e.button)}
          className="block h-full w-full cursor-crosshair"
        />

        {/* Single-Line 32px Top HUD Strip (<10% viewport footprint) */}
        {hud && hud.mode !== 'TITLE' && (
          <GameHud
            hud={hud}
            touchEnabled={touchEnabled}
            onToggleTouch={() => setTouchEnabled((prev) => !prev)}
            onToggleMute={() => engineRef.current?.toggleMute()}
            onToggleScreenShake={() => engineRef.current?.toggleScreenShake()}
            onToggleInventory={() => engineRef.current?.toggleInventory()}
            onOpenWorldMap={() => engineRef.current?.openWorldMap()}
            onOpenCapitalHub={() => engineRef.current?.openCapitalHub()}
            onOpenSkillTree={() => engineRef.current?.openSkillTree()}
            onSwapHero={(heroId) => engineRef.current?.swapHero(heroId)}
            onTossBrewPotion={() => engineRef.current?.tossBrewedPotion()}
            onToggleSteamMecha={() => engineRef.current?.toggleSteamMecha()}
            onHeal={() => engineRef.current?.useHealthPotion()}
            onUseElixir={() => engineRef.current?.useDuckElixir()}
            onSummon={() => engineRef.current?.triggerDuckSummon()}
            onToggleLoaf={() => engineRef.current?.toggleBreadLoaf()}
            onCycleEmote={() => engineRef.current?.cycleCatEmote()}
          />
        )}

        {/* Unified Top Switcher Bar when inside any Kingdom Command Hub sub-modal */}
        {isAnyHubModalOpen && (
          <div className="pointer-events-auto absolute top-1 left-1/2 z-50 -translate-x-1/2 flex items-center gap-1 rounded-full border border-amber-400/70 bg-slate-950/95 px-2.5 py-1 shadow-xl">
            <button
              type="button"
              onClick={() => engineRef.current?.openCapitalHub()}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                hud.mode === 'CAPITAL_HUB'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-amber-200 hover:bg-slate-800'
              }`}
            >
              🏰 Capital / ⚗️ Brew / 🔨 +25★
            </button>
            <button
              type="button"
              onClick={() => engineRef.current?.openSkillTree()}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                hud.mode === 'SKILL_TREE'
                  ? 'bg-cyan-400 text-slate-950 font-bold'
                  : 'text-cyan-200 hover:bg-slate-800'
              }`}
            >
              🌟 60-Node Skills
            </button>
            <button
              type="button"
              onClick={() => engineRef.current?.toggleInventory()}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                hud.mode === 'INVENTORY' || hud.mode === 'BLACKSMITH'
                  ? 'bg-emerald-400 text-slate-950 font-bold'
                  : 'text-emerald-200 hover:bg-slate-800'
              }`}
            >
              🎒 Bag, Fur & Emotes
            </button>
            <button
              type="button"
              onClick={() => engineRef.current?.openWorldMap()}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                hud.mode === 'WORLD_MAP'
                  ? 'bg-indigo-400 text-slate-950 font-bold'
                  : 'text-indigo-200 hover:bg-slate-800'
              }`}
            >
              🗺️ 300-Act Map
            </button>
            <button
              type="button"
              onClick={() => setOmniverseHubOpen(true)}
              className="flex items-center gap-1 rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-cyan-400/35 cursor-pointer"
            >
              <Box className="h-3 w-3" />
              3D Voxel & 1,000-Act Hub
            </button>
          </div>
        )}

        {/* Compact Omniverse 3D Voxel Hub & 60Hz Replay Theater Triggers (Bottom-Right Corner) */}
        {!omniverseHubOpen && !replayTheaterOpen && (
          <div className="pointer-events-auto absolute right-2.5 bottom-2.5 z-40 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setReplayTheaterOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-amber-400/50 bg-slate-950/90 px-2.5 py-1 text-[10px] font-black text-amber-200 shadow-lg hover:bg-slate-900 cursor-pointer"
            >
              <Film className="h-3.5 w-3.5 text-amber-300" />
              60Hz Replay
            </button>
            <button
              type="button"
              onClick={() => setOmniverseHubOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-400/60 bg-slate-950/90 px-2.5 py-1 text-[10px] font-black text-cyan-200 shadow-lg hover:bg-slate-900 cursor-pointer"
            >
              <Box className="h-3.5 w-3.5 text-amber-300" />
              3D Voxel Hub (1,000 Acts)
            </button>
          </div>
        )}

        {/* Multi-Touch Mobile Controls (Hidden by default on Desktop PC) */}
        {hud && hud.mode === 'PLAYING' && touchEnabled && (
          <TouchControls
            hud={hud}
            onAnalogMove={(x, y) => engineRef.current?.setAnalogVector(x, y)}
            onAction={(action) => engineRef.current?.triggerActionButton(action)}
          />
        )}

        {/* Typewriter RPG Cutscene / Dialogue Box */}
        {hud && hud.dialogue && (
          <DialogueBox
            lines={hud.dialogue.lines}
            index={hud.dialogue.index}
            displayedChars={hud.dialogue.displayedChars}
            isCutscene={hud.dialogue.isCutscene}
            onAdvance={() => engineRef.current?.advanceDialogue()}
            onSelectChoice={(choiceId) => engineRef.current?.selectDialogueChoice(choiceId)}
            onSkip={() => engineRef.current?.skipCutscene()}
          />
        )}

        {/* Toggleable Equipment & Blacksmith Modal */}
        {hud && (hud.mode === 'INVENTORY' || hud.mode === 'BLACKSMITH') && (
          <InventoryModal
            hud={hud}
            isBlacksmithMode={hud.mode === 'BLACKSMITH'}
            onClose={() => engineRef.current?.closeModal()}
            onEquip={(id) => engineRef.current?.equipItem(id)}
            onUpgrade={(id) => engineRef.current?.upgradeGear(id)}
            onBuyPotion={() => engineRef.current?.buyPotion()}
            onSelectFur={(furId) => engineRef.current?.setFur(furId)}
            onSelectEmote={(emoteId) => {
              engineRef.current?.closeModal();
              engineRef.current?.setCatEmote(emoteId);
            }}
            onCraftAlchemy={(recipeId) => engineRef.current?.craftAlchemyRelic(recipeId)}
            onClaimUltimateLoadout={() => engineRef.current?.claimUltimateDuckAndGear(false)}
            onClaimTier30Loadout={() => engineRef.current?.claimTier30EternalOmni(false)}
            onForgeGear={(id) => engineRef.current?.forgeBlacksmithGear(id)}
          />
        )}

        {/* 300-Act Interactive Omniverse World Map Modal */}
        {hud && hud.mode === 'WORLD_MAP' && (
          <WorldMapModal
            hud={hud}
            onClose={() => engineRef.current?.closeModal()}
            onTravel={(actNum) => engineRef.current?.travelToAct(actNum)}
          />
        )}

        {/* Felis-Fang United Capital Hub (12 Buildings, BlockCraft Cauldron, +25★ Star-Up Anvil, 30-Track OST & Save Vault) */}
        {hud && hud.mode === 'CAPITAL_HUB' && (
          <CapitalHubModal
            hud={hud}
            onClose={() => engineRef.current?.closeModal()}
            onUpgradeBuilding={(bId) => engineRef.current?.upgradeCapitalBuilding(bId)}
            onExchangeResources={() => engineRef.current?.exchangeKingdomResources()}
            onBrewCauldronPotion={(ing1, ing2, ing3) => engineRef.current?.brewCauldronPotion(ing1, ing2, ing3)}
            onEquipBrewedPotion={(id) => engineRef.current?.equipBrewedPotion(id)}
            onStarUpGear={(itemId) => engineRef.current?.starUpGear(itemId)}
            onSocketGem={(itemId, gemId) => engineRef.current?.socketGem(itemId, gemId)}
            onReforgeMutation={(itemId) => engineRef.current?.reforgeMutation(itemId)}
            onExportSaveCode={() => engineRef.current?.exportSaveCode() ?? ''}
            onImportSaveCode={(code) => engineRef.current?.importSaveCode(code) ?? false}
            onOpenInventory={() => engineRef.current?.toggleInventory()}
            onOpenSkillTree={() => engineRef.current?.openSkillTree()}
            onOpenWorldMap={() => engineRef.current?.openWorldMap()}
            onToggleLoaf={() => engineRef.current?.toggleBreadLoaf()}
            onCycleEmote={() => engineRef.current?.cycleCatEmote()}
          />
        )}

        {/* 60-Node Constellation Skill Tree Modal */}
        {hud && hud.mode === 'SKILL_TREE' && (
          <SkillTreeModal
            hud={hud}
            onClose={() => engineRef.current?.closeModal()}
            onUnlockNode={(nodeId) => engineRef.current?.unlockSkillNode(nodeId)}
            onBuyStarPoint={() => engineRef.current?.buyStarPoint()}
          />
        )}

        {/* Title Screen */}
        {(!hud || hud.mode === 'TITLE') && (
          <TitleOverlay
            hud={hud}
            touchEnabled={touchEnabled}
            onStart={() => engineRef.current?.startNewGame(false)}
            onContinue={() => engineRef.current?.continueSavedGame()}
            onStartNightmare={() => engineRef.current?.startNightmareMode()}
            onBossRush={() => engineRef.current?.startBossRush(true)}
            onStartWarCampaign={() => engineRef.current?.startWarOfTwoKingdoms()}
            onStartDragonCampaign={() => engineRef.current?.startDragonCataclysmCampaign()}
            onOpenCapitalHub={() => engineRef.current?.openCapitalHub()}
            onToggleMute={() => engineRef.current?.toggleMute()}
            onToggleScreenShake={() => engineRef.current?.toggleScreenShake()}
            onToggleTouch={() => setTouchEnabled((prev) => !prev)}
            onRestoreAct={(targetAct) => engineRef.current?.restoreActWithScaledGear(targetAct)}
            onExportSaveCode={() => engineRef.current?.exportSaveCode() ?? ''}
            onImportSaveCode={(code) => engineRef.current?.importSaveCode(code) ?? false}
          />
        )}

        {/* Game Over Screen */}
        {hud && hud.mode === 'GAME_OVER' && (
          <GameOverOverlay
            currentAct={hud.currentAct}
            onRetryAct={() => engineRef.current?.retryCurrentAct()}
            onRestart={() => engineRef.current?.startNewGame(false)}
          />
        )}

        {/* Victory Screen */}
        {hud && hud.mode === 'VICTORY' && (
          <VictoryOverlay
            hud={hud}
            onPlayAgain={() => engineRef.current?.startNewGame(false)}
            onStartNightmare={() => engineRef.current?.startNightmareMode()}
            onOpenWorldMap={() => engineRef.current?.openWorldMap()}
            onBossRush={() => engineRef.current?.startBossRush(true)}
            onVisitSanctuary={() => engineRef.current?.visitSanctuaryPostVictory()}
            onStartWarCampaign={() => engineRef.current?.startWarOfTwoKingdoms()}
            onStartDragonCampaign={() => engineRef.current?.startDragonCataclysmCampaign()}
          />
        )}

        {/* Omniverse 1,000-Act Hyper-Hub Modal (Three.js 3D Voxel Cauldron + 50 Tiers + 60 Skills + V8 Vault) */}
        {omniverseHubOpen && (
          <OmniverseCommandHubModal
            currentAct={hud?.currentAct ?? 1}
            maxUnlockedAct={hud?.maxUnlockedAct ?? 1}
            gold={hud?.gold ?? 500}
            starPoints={hud?.starPoints ?? 3}
            equippedWeaponId={hud?.equippedWeapon.id ?? 'wpn_tier_1'}
            equippedArmorId={hud?.equippedArmor.id ?? 'arm_tier_1'}
            gearStarLevels={{}}
            unlockedSkillNodeIds={hud?.unlockedSkills ?? []}
            onClose={() => setOmniverseHubOpen(false)}
            onTravelAct={(actId) => engineRef.current?.travelToAct(Math.min(300, actId))}
            onRestoreAct={(targetAct) => engineRef.current?.restoreActWithScaledGear(Math.min(300, targetAct))}
            onExportSaveCode={() => engineRef.current?.exportSaveCode() ?? ''}
            onImportSaveCode={(code) => engineRef.current?.importSaveCode(code) ?? false}
          />
        )}
        {/* 60Hz Deterministic Replay Theater Modal */}
        {replayTheaterOpen && (
          <ReplayTheaterModal
            initialActId={hud?.currentAct ?? 300}
            onClose={() => setReplayTheaterOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
