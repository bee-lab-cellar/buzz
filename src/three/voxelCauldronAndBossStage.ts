/**
 * Compatibility & Unified 3D Voxel Cauldron + Boss Trophy Stage Wrapper.
 * Delegates to the authentic hollow 4-wall cast-iron cauldron (`voxelCauldronBuilder.ts`)
 * and 10-Arc Boss Trophy Pedestal (`voxelBossTrophyStage.ts`). Zero `any` types.
 */

import * as THREE from 'three';
import {
  attachStudioRoomEnvironment,
  buildStonePedestalBase,
  createSharedVoxelMaterials,
  detectSoftwareWebGLRenderer,
  VoxelResourceTracker,
} from './voxelGeometryFactory';
import {
  buildAuthenticHollowVoxelCauldron,
  setCauldronBrewColor,
  stepVoxelCauldronAnimation,
  triggerCauldronBrewBurst,
  type VoxelCauldronAssembly,
} from './voxelCauldronBuilder';
import { buildVoxelBossTrophyGroup, TEN_ARC_BOSS_TROPHIES } from './voxelBossTrophyStage';
import type { ArcId } from '../types/world';

export type VoxelStageMode = 'alchemy_cauldron' | 'boss_relic_pedestal';

export class VoxelCauldronAndBossStage {
  private readonly tracker = new VoxelResourceTracker();
  private readonly isSoftwareGl: boolean;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;

  private readonly cauldronAssembly: VoxelCauldronAssembly;
  private readonly trophyPivot = new THREE.Group();
  private mode: VoxelStageMode;
  private stirBoostSec = 0;
  private elapsedSec = 0;
  private lastTs = 0;
  private frameId = 0;
  private disposed = false;

  constructor(container: HTMLElement, initialMode: VoxelStageMode = 'alchemy_cauldron') {
    this.mode = initialMode;
    this.isSoftwareGl = detectSoftwareWebGLRenderer();
    const width = Math.max(240, container.clientWidth || 360);
    const height = Math.max(180, container.clientHeight || 220);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0c1222');
    this.scene.fog = new THREE.Fog('#0c1222', 8.5, 20);
    attachStudioRoomEnvironment(this.renderer, this.scene, this.tracker);

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    this.camera.position.set(0, 3.0, 5.2);
    this.camera.lookAt(0, 1.05, 0);

    this.scene.add(new THREE.HemisphereLight('#93c5fd', '#1e1b4b', 0.85));
    const keyLight = new THREE.DirectionalLight('#fef08a', 1.8);
    keyLight.position.set(4.5, 6.5, 4.0);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#38bdf8', 0.9);
    rimLight.position.set(-4.5, 3.2, -3.5);
    this.scene.add(rimLight);

    const materials = createSharedVoxelMaterials(this.tracker);
    this.scene.add(buildStonePedestalBase(this.tracker, materials, !this.isSoftwareGl));

    this.cauldronAssembly = buildAuthenticHollowVoxelCauldron(
      this.tracker,
      materials,
      !this.isSoftwareGl,
      '#38bdf8',
    );
    this.scene.add(this.cauldronAssembly.root);

    const defaultTrophy = buildVoxelBossTrophyGroup(
      this.tracker,
      TEN_ARC_BOSS_TROPHIES[2],
      !this.isSoftwareGl,
    );
    this.trophyPivot.add(defaultTrophy);
    this.scene.add(this.trophyPivot);

    this.syncStageVisibility();
    this.lastTs = performance.now();
    this.startLoop();
  }

  public setMode(nextMode: VoxelStageMode): void {
    this.mode = nextMode;
    this.syncStageVisibility();
  }

  public setArcTrophy(arcId: ArcId): void {
    this.trophyPivot.clear();
    const meta = TEN_ARC_BOSS_TROPHIES.find((t) => t.arcId === arcId) ?? TEN_ARC_BOSS_TROPHIES[0];
    this.trophyPivot.add(buildVoxelBossTrophyGroup(this.tracker, meta, !this.isSoftwareGl));
  }

  public setBrewColor(hex: string): void {
    setCauldronBrewColor(this.cauldronAssembly, hex);
  }

  public triggerBrewExplosion(potionColorHex: string): void {
    this.stirBoostSec = 1.65;
    triggerCauldronBrewBurst(this.cauldronAssembly, potionColorHex);
  }

  public resize(width: number, height: number): void {
    if (this.disposed || width < 10 || height < 10) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private syncStageVisibility(): void {
    this.cauldronAssembly.root.visible = this.mode === 'alchemy_cauldron';
    this.trophyPivot.visible = this.mode === 'boss_relic_pedestal';
  }

  private startLoop(): void {
    const tick = (ts: number): void => {
      if (this.disposed) return;
      const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) / 1000));
      this.lastTs = ts;
      this.elapsedSec += dt;

      if (this.stirBoostSec > 0) {
        this.stirBoostSec = Math.max(0, this.stirBoostSec - dt);
      }

      if (this.mode === 'alchemy_cauldron') {
        const stirMult = this.stirBoostSec > 0 ? 4.2 : 1.0;
        stepVoxelCauldronAnimation(this.cauldronAssembly, dt, this.elapsedSec, stirMult);
        this.cauldronAssembly.root.rotation.y = Math.sin(this.elapsedSec * 0.42) * 0.28;
      } else {
        this.trophyPivot.rotation.y = this.elapsedSec * 0.72;
      }

      this.renderer.render(this.scene, this.camera);
      this.frameId = requestAnimationFrame(tick);
    };
    this.frameId = requestAnimationFrame(tick);
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.tracker.disposeAll();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
