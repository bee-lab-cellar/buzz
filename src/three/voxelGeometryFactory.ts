/**
 * File 15 / 100 — Shared Three.js Voxel Geometry & PBR Material Factory.
 *
 * Provides pooled voxel BoxGeometry & MeshStandardMaterial / MeshPhysicalMaterial helpers,
 * software-WebGL detection, RoomEnvironment PMREM bootstrap, and complete resource tracking
 * so every 3D showcase stage has zero leaks and crisp reflections. Zero `any` types.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface DisposableResource {
  dispose(): void;
}

export class VoxelResourceTracker {
  private readonly items: DisposableResource[] = [];

  public track<T extends DisposableResource>(resource: T): T {
    this.items.push(resource);
    return resource;
  }

  public disposeAll(): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      this.items[i].dispose();
    }
    this.items.length = 0;
  }
}

export interface VoxelBoxSpec {
  readonly w: number;
  readonly h: number;
  readonly d: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly material: THREE.Material;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
  readonly name?: string;
}

export function createVoxelMesh(
  tracker: VoxelResourceTracker,
  spec: VoxelBoxSpec,
): THREE.Mesh<THREE.BoxGeometry, THREE.Material> {
  const geo = tracker.track(new THREE.BoxGeometry(spec.w, spec.h, spec.d));
  const mesh = new THREE.Mesh(geo, spec.material);
  mesh.position.set(spec.x, spec.y, spec.z);
  if (spec.castShadow) mesh.castShadow = true;
  if (spec.receiveShadow) mesh.receiveShadow = true;
  if (spec.name) mesh.name = spec.name;
  return mesh;
}

export function detectSoftwareWebGLRenderer(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export interface VoxelPbrMaterials {
  readonly castIron: THREE.MeshStandardMaterial;
  readonly darkRimIron: THREE.MeshStandardMaterial;
  readonly oakWood: THREE.MeshStandardMaterial;
  readonly goldTrim: THREE.MeshStandardMaterial;
  readonly stoneDais: THREE.MeshStandardMaterial;
  readonly magmaEmber: THREE.MeshStandardMaterial;
  readonly flameCore: THREE.MeshStandardMaterial;
  readonly glassBottle: THREE.MeshPhysicalMaterial;
}

export function createSharedVoxelMaterials(tracker: VoxelResourceTracker): VoxelPbrMaterials {
  return {
    castIron: tracker.track(
      new THREE.MeshStandardMaterial({
        color: '#272c38',
        roughness: 0.48,
        metalness: 0.82,
      }),
    ),
    darkRimIron: tracker.track(
      new THREE.MeshStandardMaterial({
        color: '#1e2430',
        roughness: 0.36,
        metalness: 0.88,
      }),
    ),
    oakWood: tracker.track(
      new THREE.MeshStandardMaterial({
        color: '#78350f',
        roughness: 0.84,
        metalness: 0.04,
      }),
    ),
    goldTrim: tracker.track(
      new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        roughness: 0.22,
        metalness: 0.92,
      }),
    ),
    stoneDais: tracker.track(
      new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.86,
        metalness: 0.1,
      }),
    ),
    magmaEmber: tracker.track(
      new THREE.MeshStandardMaterial({
        color: '#f97316',
        emissive: '#ea580c',
        emissiveIntensity: 1.5,
        roughness: 0.58,
        metalness: 0.06,
      }),
    ),
    flameCore: tracker.track(
      new THREE.MeshStandardMaterial({
        color: '#fde047',
        emissive: '#f59e0b',
        emissiveIntensity: 1.85,
        roughness: 0.3,
        metalness: 0.0,
      }),
    ),
    glassBottle: tracker.track(
      new THREE.MeshPhysicalMaterial({
        color: '#e0f2fe',
        roughness: 0.08,
        metalness: 0.0,
        transmission: 0.72,
        transparent: true,
        opacity: 0.78,
        thickness: 0.28,
        ior: 1.45,
      }),
    ),
  };
}

export function attachStudioRoomEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  tracker: VoxelResourceTracker,
): THREE.WebGLRenderTarget {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const target = tracker.track(pmrem.fromScene(envScene, 0.04));
  scene.environment = target.texture;
  envScene.dispose();
  pmrem.dispose();
  return target;
}

export function buildStonePedestalBase(
  tracker: VoxelResourceTracker,
  materials: VoxelPbrMaterials,
  receiveShadow: boolean,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'stone_pedestal_base';

  const daisGeo = tracker.track(new THREE.CylinderGeometry(3.2, 3.5, 0.28, 8));
  const dais = new THREE.Mesh(daisGeo, materials.stoneDais);
  dais.position.set(0, -0.14, 0);
  dais.receiveShadow = receiveShadow;
  group.add(dais);

  const ringGeo = tracker.track(new THREE.RingGeometry(1.85, 2.04, 8));
  const ringMat = tracker.track(
    new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      roughness: 0.25,
      metalness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.018;
  group.add(ring);

  return group;
}
