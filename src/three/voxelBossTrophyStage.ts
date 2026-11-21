/**
 * File 17 / 100 — 3D Rotating Voxel Boss Trophy & Relic Pedestal Stage.
 *
 * Showcases 10 Arc Finale Boss Trophies (Fenrir Fang Crown, Ignis-Bahamut Dragon Skull,
 * Charybdis Abyssal Pearl, Chronos-Omega Chrono-Gear, Aether-Null Eclipse Singularity, etc.)
 * on a grounded gilded stone pedestal with RoomEnvironment PBR reflections and zero-leak cleanup.
 * Zero `any` types.
 */

import * as THREE from 'three';
import type { ArcId } from '../types/world';
import {
  attachStudioRoomEnvironment,
  buildStonePedestalBase,
  createSharedVoxelMaterials,
  createVoxelMesh,
  detectSoftwareWebGLRenderer,
  VoxelResourceTracker,
} from './voxelGeometryFactory';

export interface BossTrophyMetadata {
  readonly arcId: ArcId;
  readonly bossAct: number;
  readonly bossName: string;
  readonly trophyTitle: string;
  readonly primaryHex: string;
  readonly accentHex: string;
}

export const TEN_ARC_BOSS_TROPHIES: ReadonlyArray<BossTrophyMetadata> = [
  { arcId: 1, bossAct: 100, bossName: 'Usurper King Fenrir', trophyTitle: 'Eclipse Fang War-Crown', primaryHex: '#64748b', accentHex: '#38bdf8' },
  { arcId: 2, bossAct: 200, bossName: 'War-Emperor Cerberus-Fenrir', trophyTitle: 'Iron Chariot Banner-Crest', primaryHex: '#991b1b', accentHex: '#fbbf24' },
  { arcId: 3, bossAct: 300, bossName: 'Ignis-Bahamut', trophyTitle: 'World-Breaker Dragon Crest', primaryHex: '#dc2626', accentHex: '#f97316' },
  { arcId: 4, bossAct: 400, bossName: 'Charybdis, World-Kraken', trophyTitle: 'Abyssal 8-Tentacle Pearl', primaryHex: '#0e7490', accentHex: '#22d3ee' },
  { arcId: 5, bossAct: 500, bossName: 'Chronos-Omega', trophyTitle: 'Prime Clockwork Chrono-Gear', primaryHex: '#b45309', accentHex: '#fde047' },
  { arcId: 6, bossAct: 600, bossName: 'Pyro-Malakor', trophyTitle: 'Obsidian Caldera Heart', primaryHex: '#7c2d12', accentHex: '#fb923c' },
  { arcId: 7, bossAct: 700, bossName: 'Glacius-Ymir', trophyTitle: 'Astral Glacier Spire-Core', primaryHex: '#0284c7', accentHex: '#bae6fd' },
  { arcId: 8, bossAct: 800, bossName: 'Zephyrus-Sovereign', trophyTitle: 'Tempest Sky-Wing Diadem', primaryHex: '#15803d', accentHex: '#fde047' },
  { arcId: 9, bossAct: 900, bossName: 'Eclipse-Nyx Prime', trophyTitle: 'Shattered Mirror Prism', primaryHex: '#7e22ce', accentHex: '#f0abfc' },
  { arcId: 10, bossAct: 1000, bossName: 'Aether-Null Singularity', trophyTitle: 'Omniverse Eclipse Halo', primaryHex: '#312e81', accentHex: '#f43f5e' },
];

export function buildVoxelBossTrophyGroup(
  tracker: VoxelResourceTracker,
  meta: BossTrophyMetadata,
  castShadow: boolean,
): THREE.Group {
  const group = new THREE.Group();
  group.name = `boss_trophy_arc_${meta.arcId}`;

  const primaryMat = tracker.track(
    new THREE.MeshStandardMaterial({
      color: meta.primaryHex,
      roughness: 0.34,
      metalness: 0.72,
    }),
  );
  const accentMat = tracker.track(
    new THREE.MeshStandardMaterial({
      color: meta.accentHex,
      emissive: meta.accentHex,
      emissiveIntensity: 0.9,
      roughness: 0.18,
      metalness: 0.3,
    }),
  );
  const goldMat = tracker.track(
    new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      roughness: 0.22,
      metalness: 0.92,
    }),
  );

  // Pedestal Plinth
  group.add(
    createVoxelMesh(tracker, {
      w: 1.55,
      h: 0.42,
      d: 1.55,
      x: 0,
      y: 0.21,
      z: 0,
      material: primaryMat,
      castShadow,
      name: 'trophy_plinth_base',
    }),
    createVoxelMesh(tracker, {
      w: 1.18,
      h: 0.56,
      d: 1.18,
      x: 0,
      y: 0.7,
      z: 0,
      material: goldMat,
      castShadow,
      name: 'trophy_plinth_column',
    }),
  );

  // Sculpted Voxel Relic Core + 4 Crown Spikes + Floating Energy Gem
  group.add(
    createVoxelMesh(tracker, {
      w: 0.86,
      h: 0.86,
      d: 0.86,
      x: 0,
      y: 1.52,
      z: 0,
      material: primaryMat,
      castShadow,
      name: 'trophy_core_cube',
    }),
    createVoxelMesh(tracker, {
      w: 0.44,
      h: 0.44,
      d: 0.44,
      x: 0,
      y: 2.34,
      z: 0,
      material: accentMat,
      name: 'trophy_floating_crystal',
    }),
  );

  const spikePositions: ReadonlyArray<readonly [number, number]> = [
    [-0.58, -0.58],
    [0.58, -0.58],
    [-0.58, 0.58],
    [0.58, 0.58],
  ];
  for (let i = 0; i < spikePositions.length; i++) {
    const [sx, sz] = spikePositions[i];
    group.add(
      createVoxelMesh(tracker, {
        w: 0.22,
        h: 0.68,
        d: 0.22,
        x: sx,
        y: 1.88,
        z: sz,
        material: i % 2 === 0 ? goldMat : accentMat,
        castShadow,
        name: `trophy_horn_${i}`,
      }),
    );
  }

  return group;
}

export class VoxelBossTrophyStage {
  private readonly tracker = new VoxelResourceTracker();
  private readonly isSoftwareGl: boolean;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly pivot = new THREE.Group();
  private activeTrophy: THREE.Group | null = null;
  private elapsedSec = 0;
  private lastTs = 0;
  private frameId = 0;
  private disposed = false;

  constructor(container: HTMLElement, initialArcId: ArcId = 3) {
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
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#090d1c');
    attachStudioRoomEnvironment(this.renderer, this.scene, this.tracker);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.camera.position.set(0, 2.8, 5.1);
    this.camera.lookAt(0, 1.25, 0);

    this.scene.add(new THREE.HemisphereLight('#bae6fd', '#1e1b4b', 0.9));
    const key = new THREE.DirectionalLight('#fef08a', 1.8);
    key.position.set(4, 6, 4);
    this.scene.add(key);

    const materials = createSharedVoxelMaterials(this.tracker);
    this.scene.add(buildStonePedestalBase(this.tracker, materials, !this.isSoftwareGl));
    this.scene.add(this.pivot);

    this.selectArcTrophy(initialArcId);
    this.lastTs = performance.now();
    this.startLoop();
  }

  public selectArcTrophy(arcId: ArcId): void {
    if (this.activeTrophy) {
      this.pivot.remove(this.activeTrophy);
    }
    const meta = TEN_ARC_BOSS_TROPHIES.find((t) => t.arcId === arcId) ?? TEN_ARC_BOSS_TROPHIES[0];
    this.activeTrophy = buildVoxelBossTrophyGroup(this.tracker, meta, !this.isSoftwareGl);
    this.pivot.add(this.activeTrophy);
  }

  public resize(width: number, height: number): void {
    if (this.disposed || width < 10 || height < 10) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private startLoop(): void {
    const tick = (ts: number): void => {
      if (this.disposed) return;
      const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) / 1000));
      this.lastTs = ts;
      this.elapsedSec += dt;

      this.pivot.rotation.y = this.elapsedSec * 0.72;
      if (this.activeTrophy) {
        const crystal = this.activeTrophy.getObjectByName('trophy_floating_crystal');
        if (crystal) {
          crystal.position.y = 2.34 + Math.sin(this.elapsedSec * 3.1) * 0.14;
          crystal.rotation.y = -this.elapsedSec * 1.4;
        }
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
