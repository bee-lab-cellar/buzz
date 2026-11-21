/**
 * File 18 / 100 — 3D Voxel Hero Diorama Showcase Stage.
 *
 * Interactive 3D voxel sculptures of all 4 Playable Heroes:
 * 1. Nyx (Void-Black Cat with crooked starry wizard hat, glowing golden eyes & Starlight Wand)
 * 2. King Leo (Towering Golden Lion with 360° amber-mahogany mane, 5-point crown & Sun Greatsword)
 * 3. Wolf-King Fenrir (Silver-charcoal Dire Wolf with astral cyan eyes & Twin Eclipse Axes)
 * 4. The Great Duck (Chubby Mallard Archmage with starry wizard hat, golden bill & Lotus Scepter)
 * Zero `any` types.
 */

import * as THREE from 'three';
import type { PlayableHeroId } from '../types/combat';
import {
  attachStudioRoomEnvironment,
  buildStonePedestalBase,
  createSharedVoxelMaterials,
  createVoxelMesh,
  detectSoftwareWebGLRenderer,
  VoxelResourceTracker,
} from './voxelGeometryFactory';

export function buildVoxelHeroSculpture(
  tracker: VoxelResourceTracker,
  heroId: PlayableHeroId,
  castShadow: boolean,
): THREE.Group {
  const group = new THREE.Group();
  group.name = `voxel_hero_${heroId}`;

  const mat = (hex: string, emissive = '#000000', emInt = 0, metal = 0.15, rough = 0.65) =>
    tracker.track(
      new THREE.MeshStandardMaterial({
        color: hex,
        emissive,
        emissiveIntensity: emInt,
        metalness: metal,
        roughness: rough,
      }),
    );

  const eyeGold = mat('#fbbf24', '#f59e0b', 1.1, 0.1, 0.2);
  const eyeCyan = mat('#38bdf8', '#0284c7', 1.2, 0.1, 0.2);
  const crownGold = mat('#ffd700', '#f59e0b', 0.35, 0.9, 0.22);

  if (heroId === 'nyx') {
    const voidFur = mat('#14121f');
    const cloakPurple = mat('#4c1d95');
    const hatIndigo = mat('#312e81');
    const nosePink = mat('#ff8fab');
    const starGem = mat('#38bdf8', '#38bdf8', 1.3, 0.2, 0.15);

    // Body + Cloak + Head + Pointy Cat Ears + Open Face Eyes & Pink Nose
    group.add(
      createVoxelMesh(tracker, { w: 0.84, h: 0.92, d: 0.68, x: 0, y: 0.46, z: 0, material: cloakPurple, castShadow, name: 'nyx_cloak' }),
      createVoxelMesh(tracker, { w: 0.92, h: 0.82, d: 0.82, x: 0, y: 1.3, z: 0, material: voidFur, castShadow, name: 'nyx_head' }),
      createVoxelMesh(tracker, { w: 0.24, h: 0.32, d: 0.2, x: -0.34, y: 1.84, z: 0, material: voidFur, name: 'nyx_ear_l' }),
      createVoxelMesh(tracker, { w: 0.24, h: 0.32, d: 0.2, x: 0.34, y: 1.84, z: 0, material: voidFur, name: 'nyx_ear_r' }),
      createVoxelMesh(tracker, { w: 0.18, h: 0.16, d: 0.08, x: -0.22, y: 1.34, z: 0.42, material: eyeGold, name: 'nyx_eye_l' }),
      createVoxelMesh(tracker, { w: 0.18, h: 0.16, d: 0.08, x: 0.22, y: 1.34, z: 0.42, material: eyeGold, name: 'nyx_eye_r' }),
      createVoxelMesh(tracker, { w: 0.12, h: 0.08, d: 0.08, x: 0, y: 1.18, z: 0.42, material: nosePink, name: 'nyx_nose' }),
      // Crooked Starry Wizard Hat (ALWAYS ON!)
      createVoxelMesh(tracker, { w: 1.32, h: 0.14, d: 1.24, x: 0, y: 1.76, z: 0, material: hatIndigo, castShadow, name: 'nyx_hat_brim' }),
      createVoxelMesh(tracker, { w: 0.72, h: 0.46, d: 0.72, x: -0.05, y: 2.04, z: 0, material: hatIndigo, name: 'nyx_hat_mid' }),
      createVoxelMesh(tracker, { w: 0.38, h: 0.38, d: 0.38, x: -0.2, y: 2.38, z: 0, material: hatIndigo, name: 'nyx_hat_tip' }),
      createVoxelMesh(tracker, { w: 0.12, h: 0.12, d: 0.12, x: 0.1, y: 2.04, z: 0.38, material: crownGold, name: 'nyx_hat_star' }),
      // Starlight Wand
      createVoxelMesh(tracker, { w: 0.12, h: 1.32, d: 0.12, x: 0.72, y: 0.96, z: 0.24, material: crownGold, name: 'nyx_wand_shaft' }),
      createVoxelMesh(tracker, { w: 0.28, h: 0.28, d: 0.28, x: 0.72, y: 1.7, z: 0.24, material: starGem, name: 'nyx_wand_gem' }),
    );
  } else if (heroId === 'king_leo') {
    const lionFur = mat('#f59e0b');
    const maneDark = mat('#9e3b0e');
    const crimsonCape = mat('#dc2626');
    const snoutCream = mat('#fef3c7');
    const bladeGlow = mat('#fde047', '#f59e0b', 0.9, 0.85, 0.2);

    // Towering Lion Silhouette (Taller & broader than Nyx!)
    group.add(
      createVoxelMesh(tracker, { w: 1.18, h: 1.22, d: 0.88, x: 0, y: 0.61, z: 0, material: crownGold, castShadow, name: 'leo_armor' }),
      createVoxelMesh(tracker, { w: 1.26, h: 1.12, d: 0.22, x: 0, y: 0.6, z: -0.52, material: crimsonCape, name: 'leo_crimson_cape' }),
      createVoxelMesh(tracker, { w: 1.46, h: 1.28, d: 1.18, x: 0, y: 1.66, z: -0.06, material: maneDark, castShadow, name: 'leo_360_mane' }),
      createVoxelMesh(tracker, { w: 0.96, h: 0.88, d: 0.86, x: 0, y: 1.64, z: 0.18, material: lionFur, name: 'leo_face' }),
      createVoxelMesh(tracker, { w: 0.56, h: 0.34, d: 0.24, x: 0, y: 1.44, z: 0.6, material: snoutCream, name: 'leo_snout' }),
      createVoxelMesh(tracker, { w: 0.18, h: 0.14, d: 0.08, x: -0.22, y: 1.72, z: 0.62, material: eyeGold, name: 'leo_eye_l' }),
      createVoxelMesh(tracker, { w: 0.18, h: 0.14, d: 0.08, x: 0.22, y: 1.72, z: 0.62, material: eyeGold, name: 'leo_eye_r' }),
      // 5-Point Golden Crown
      createVoxelMesh(tracker, { w: 0.98, h: 0.24, d: 0.86, x: 0, y: 2.38, z: 0.08, material: crownGold, name: 'leo_crown_band' }),
      createVoxelMesh(tracker, { w: 0.16, h: 0.26, d: 0.16, x: -0.36, y: 2.6, z: 0.22, material: crownGold, name: 'leo_crown_p1' }),
      createVoxelMesh(tracker, { w: 0.18, h: 0.32, d: 0.18, x: 0, y: 2.64, z: 0.22, material: crownGold, name: 'leo_crown_p2' }),
      createVoxelMesh(tracker, { w: 0.16, h: 0.26, d: 0.16, x: 0.36, y: 2.6, z: 0.22, material: crownGold, name: 'leo_crown_p3' }),
      // Sun Greatsword
      createVoxelMesh(tracker, { w: 0.22, h: 1.75, d: 0.12, x: 0.92, y: 1.25, z: 0.26, material: bladeGlow, castShadow, name: 'leo_sun_greatsword' }),
    );
  } else if (heroId === 'fenrir') {
    const wolfSilver = mat('#64748b');
    const wolfDark = mat('#334155');
    const wolfSnout = mat('#cbd5e1');
    const axeBlade = mat('#38bdf8', '#0284c7', 0.85, 0.85, 0.22);

    group.add(
      createVoxelMesh(tracker, { w: 1.12, h: 1.16, d: 0.82, x: 0, y: 0.58, z: 0, material: wolfDark, castShadow, name: 'fenrir_plate' }),
      createVoxelMesh(tracker, { w: 1.0, h: 0.9, d: 0.96, x: 0, y: 1.56, z: 0.04, material: wolfSilver, castShadow, name: 'fenrir_head' }),
      createVoxelMesh(tracker, { w: 0.52, h: 0.36, d: 0.42, x: 0, y: 1.4, z: 0.58, material: wolfSnout, name: 'fenrir_snout' }),
      createVoxelMesh(tracker, { w: 0.24, h: 0.44, d: 0.2, x: -0.36, y: 2.16, z: -0.04, material: wolfDark, name: 'fenrir_ear_l' }),
      createVoxelMesh(tracker, { w: 0.24, h: 0.44, d: 0.2, x: 0.36, y: 2.16, z: -0.04, material: wolfDark, name: 'fenrir_ear_r' }),
      createVoxelMesh(tracker, { w: 0.18, h: 0.14, d: 0.08, x: -0.24, y: 1.66, z: 0.54, material: eyeCyan, name: 'fenrir_eye_l' }),
      createVoxelMesh(tracker, { w: 0.18, h: 0.14, d: 0.08, x: 0.24, y: 1.66, z: 0.54, material: eyeCyan, name: 'fenrir_eye_r' }),
      // Twin Eclipse Axes
      createVoxelMesh(tracker, { w: 0.34, h: 0.72, d: 0.12, x: -0.84, y: 1.24, z: 0.25, material: axeBlade, name: 'fenrir_axe_l' }),
      createVoxelMesh(tracker, { w: 0.34, h: 0.72, d: 0.12, x: 0.84, y: 1.24, z: 0.25, material: axeBlade, name: 'fenrir_axe_r' }),
    );
  } else {
    // The Great Duck
    const mallardGreen = mat('#047857');
    const duckWhite = mat('#f8fafc');
    const billGold = mat('#facc15');
    const wizardBlue = mat('#2563eb');

    group.add(
      createVoxelMesh(tracker, { w: 1.18, h: 0.96, d: 1.12, x: 0, y: 0.52, z: 0, material: duckWhite, castShadow, name: 'duck_body' }),
      createVoxelMesh(tracker, { w: 0.88, h: 0.78, d: 0.88, x: 0, y: 1.38, z: 0.06, material: mallardGreen, castShadow, name: 'duck_head' }),
      createVoxelMesh(tracker, { w: 0.54, h: 0.22, d: 0.44, x: 0, y: 1.28, z: 0.62, material: billGold, name: 'duck_golden_bill' }),
      createVoxelMesh(tracker, { w: 0.14, h: 0.14, d: 0.08, x: -0.24, y: 1.48, z: 0.52, material: eyeGold, name: 'duck_eye_l' }),
      createVoxelMesh(tracker, { w: 0.14, h: 0.14, d: 0.08, x: 0.24, y: 1.48, z: 0.52, material: eyeGold, name: 'duck_eye_r' }),
      // Starry Archmage Hat
      createVoxelMesh(tracker, { w: 1.28, h: 0.14, d: 1.28, x: 0, y: 1.82, z: 0.04, material: crownGold, name: 'duck_hat_brim' }),
      createVoxelMesh(tracker, { w: 0.68, h: 0.62, d: 0.68, x: 0, y: 2.18, z: 0.04, material: wizardBlue, name: 'duck_hat_cone' }),
      // Golden Lotus Scepter
      createVoxelMesh(tracker, { w: 0.14, h: 1.5, d: 0.14, x: 0.82, y: 0.96, z: 0.2, material: crownGold, name: 'duck_scepter' }),
      createVoxelMesh(tracker, { w: 0.34, h: 0.34, d: 0.34, x: 0.82, y: 1.8, z: 0.2, material: eyeGold, name: 'duck_lotus_orb' }),
    );
  }

  return group;
}

export class VoxelHeroShowcaseStage {
  private readonly tracker = new VoxelResourceTracker();
  private readonly isSoftwareGl: boolean;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly turntable = new THREE.Group();
  private activeHeroGroup: THREE.Group | null = null;
  private elapsedSec = 0;
  private lastTs = 0;
  private frameId = 0;
  private disposed = false;

  constructor(container: HTMLElement, initialHero: PlayableHeroId = 'nyx') {
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
    this.scene.background = new THREE.Color('#0c1122');
    attachStudioRoomEnvironment(this.renderer, this.scene, this.tracker);

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.camera.position.set(0, 2.5, 4.9);
    this.camera.lookAt(0, 1.2, 0);

    this.scene.add(new THREE.HemisphereLight('#c4b5fd', '#1e293b', 0.9));
    const key = new THREE.DirectionalLight('#fef9c3', 1.75);
    key.position.set(4, 6, 4);
    this.scene.add(key);

    const materials = createSharedVoxelMaterials(this.tracker);
    this.scene.add(buildStonePedestalBase(this.tracker, materials, !this.isSoftwareGl));
    this.scene.add(this.turntable);

    this.selectHero(initialHero);
    this.lastTs = performance.now();
    this.startLoop();
  }

  public selectHero(heroId: PlayableHeroId): void {
    if (this.activeHeroGroup) {
      this.turntable.remove(this.activeHeroGroup);
    }
    this.activeHeroGroup = buildVoxelHeroSculpture(this.tracker, heroId, !this.isSoftwareGl);
    this.turntable.add(this.activeHeroGroup);
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

      this.turntable.rotation.y = this.elapsedSec * 0.65;
      this.turntable.position.y = Math.sin(this.elapsedSec * 2.4) * 0.04;

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
