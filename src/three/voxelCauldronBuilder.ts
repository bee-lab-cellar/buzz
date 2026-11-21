/**
 * File 16 / 100 — Authentic BlockCraft 3D Hollow Voxel Alchemy Cauldron Builder.
 *
 * Strictly builds a TRUE HOLLOW Minecraft-style cast-iron voxel cauldron (NEVER a flat grey box):
 * - 4 chunky iron corner feet lifted cleanly above the hearth
 * - Recessed bottom plate + 4 separate hollow cast-iron walls + flared stepped iron rim + side iron rings
 * - Recessed glowing emissive bubbling potion surface + 32 instanced rising bubble voxels
 * - Oak-log & magma-cube campfire underneath with 6 flickering flame cubes + warm PointLight
 * - Spinning wooden stirring ladle dipping inside the hollow bowl
 * - 3 blocky 3D glass potion bottles with cork stoppers & colored liquid cores around the dais
 * Zero `any` types.
 */

import * as THREE from 'three';
import {
  createVoxelMesh,
  type VoxelPbrMaterials,
  type VoxelResourceTracker,
} from './voxelGeometryFactory';

export interface BubbleParticleState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  scale: number;
  phase: number;
  life: number;
  burst: boolean;
}

export interface VoxelCauldronAssembly {
  readonly root: THREE.Group;
  readonly wallMeshes: ReadonlyArray<THREE.Mesh>;
  readonly footMeshes: ReadonlyArray<THREE.Mesh>;
  readonly flameMeshes: ReadonlyArray<THREE.Mesh>;
  readonly bottleGroups: ReadonlyArray<THREE.Group>;
  readonly liquidMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  readonly bubblesMesh: THREE.InstancedMesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  readonly bubbleStates: BubbleParticleState[];
  readonly ladlePivot: THREE.Group;
  readonly campfireLight: THREE.PointLight;
  readonly potionLight: THREE.PointLight;
}

const BUBBLE_INSTANCE_COUNT = 32;
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _color = new THREE.Color();

export function buildAuthenticHollowVoxelCauldron(
  tracker: VoxelResourceTracker,
  materials: VoxelPbrMaterials,
  castShadow: boolean,
  initialPotionColorHex = '#38bdf8',
): VoxelCauldronAssembly {
  const root = new THREE.Group();
  root.name = 'authentic_blockcraft_voxel_cauldron';

  // 1. Oak-Log & Magma-Cube Campfire Hearth directly underneath the hollow cauldron
  const campfireGroup = new THREE.Group();
  campfireGroup.name = 'oak_magma_campfire';

  const logA = createVoxelMesh(tracker, {
    w: 1.55,
    h: 0.2,
    d: 0.24,
    x: 0,
    y: 0.1,
    z: 0,
    material: materials.oakWood,
    castShadow,
    name: 'campfire_log_a',
  });
  logA.rotation.y = Math.PI / 4;
  campfireGroup.add(logA);

  const logB = createVoxelMesh(tracker, {
    w: 1.55,
    h: 0.2,
    d: 0.24,
    x: 0,
    y: 0.12,
    z: 0,
    material: materials.oakWood,
    castShadow,
    name: 'campfire_log_b',
  });
  logB.rotation.y = -Math.PI / 4;
  campfireGroup.add(logB);

  const magmaCore = createVoxelMesh(tracker, {
    w: 0.88,
    h: 0.18,
    d: 0.88,
    x: 0,
    y: 0.1,
    z: 0,
    material: materials.magmaEmber,
    name: 'campfire_magma_core',
  });
  campfireGroup.add(magmaCore);

  // 6 Flickering Voxel Flame Cubes rising between the logs and cauldron belly
  const flameMeshes: THREE.Mesh[] = [];
  const flameOffsets: ReadonlyArray<readonly [number, number, number]> = [
    [-0.28, 0.28, -0.22],
    [0.26, 0.3, -0.18],
    [-0.18, 0.32, 0.26],
    [0.22, 0.29, 0.22],
    [0.0, 0.34, 0.0],
    [-0.04, 0.27, -0.3],
  ];
  for (let i = 0; i < flameOffsets.length; i++) {
    const [fx, fy, fz] = flameOffsets[i];
    const flame = createVoxelMesh(tracker, {
      w: 0.18,
      h: 0.26,
      d: 0.18,
      x: fx,
      y: fy,
      z: fz,
      material: i % 2 === 0 ? materials.flameCore : materials.magmaEmber,
      name: `campfire_flame_${i}`,
    });
    flameMeshes.push(flame);
    campfireGroup.add(flame);
  }

  const campfireLight = new THREE.PointLight('#fb923c', 2.4, 5.8, 1.8);
  campfireLight.position.set(0, 0.42, 0);
  campfireGroup.add(campfireLight);
  root.add(campfireGroup);

  // 2. Four Chunky Cast-Iron Corner Feet
  const footMeshes: THREE.Mesh[] = [];
  const footCoords: ReadonlyArray<readonly [number, number]> = [
    [-0.78, -0.78],
    [0.78, -0.78],
    [-0.78, 0.78],
    [0.78, 0.78],
  ];
  for (let i = 0; i < footCoords.length; i++) {
    const [fx, fz] = footCoords[i];
    const foot = createVoxelMesh(tracker, {
      w: 0.34,
      h: 0.46,
      d: 0.34,
      x: fx,
      y: 0.23,
      z: fz,
      material: materials.castIron,
      castShadow,
      name: `cauldron_foot_${i}`,
    });
    footMeshes.push(foot);
    root.add(foot);
  }

  // 3. Recessed Cauldron Floor + 4 SEPARATE HOLLOW CAST-IRON WALLS (true cavity inside!)
  const bottomPlate = createVoxelMesh(tracker, {
    w: 1.72,
    h: 0.2,
    d: 1.72,
    x: 0,
    y: 0.56,
    z: 0,
    material: materials.darkRimIron,
    castShadow,
    name: 'cauldron_hollow_floor',
  });
  root.add(bottomPlate);

  const wallMeshes: THREE.Mesh[] = [
    createVoxelMesh(tracker, {
      w: 1.88,
      h: 1.12,
      d: 0.22,
      x: 0,
      y: 1.2,
      z: -0.83,
      material: materials.castIron,
      castShadow,
      name: 'cauldron_wall_north',
    }),
    createVoxelMesh(tracker, {
      w: 1.88,
      h: 1.12,
      d: 0.22,
      x: 0,
      y: 1.2,
      z: 0.83,
      material: materials.castIron,
      castShadow,
      name: 'cauldron_wall_south',
    }),
    createVoxelMesh(tracker, {
      w: 0.22,
      h: 1.12,
      d: 1.44,
      x: -0.83,
      y: 1.2,
      z: 0,
      material: materials.castIron,
      castShadow,
      name: 'cauldron_wall_west',
    }),
    createVoxelMesh(tracker, {
      w: 0.22,
      h: 1.12,
      d: 1.44,
      x: 0.83,
      y: 1.2,
      z: 0,
      material: materials.castIron,
      castShadow,
      name: 'cauldron_wall_east',
    }),
  ];
  for (let i = 0; i < wallMeshes.length; i++) {
    root.add(wallMeshes[i]);
  }

  // 4. Stepped Flared Rim (4 separate rim lips preserving the hollow opening!) + Side Iron Rings
  const rimSpecs: ReadonlyArray<readonly [number, number, number, number, number, number]> = [
    [2.12, 0.16, 0.26, 0, 1.82, -0.92],
    [2.12, 0.16, 0.26, 0, 1.82, 0.92],
    [0.26, 0.16, 1.6, -0.92, 1.82, 0],
    [0.26, 0.16, 1.6, 0.92, 1.82, 0],
  ];
  for (let i = 0; i < rimSpecs.length; i++) {
    const [w, h, d, x, y, z] = rimSpecs[i];
    root.add(
      createVoxelMesh(tracker, {
        w,
        h,
        d,
        x,
        y,
        z,
        material: materials.darkRimIron,
        castShadow,
        name: `cauldron_rim_${i}`,
      }),
    );
  }

  // Side Cast-Iron Carry Rings (Left & Right Handles)
  for (const side of [-1, 1] as const) {
    const ringAnchor = createVoxelMesh(tracker, {
      w: 0.16,
      h: 0.16,
      d: 0.16,
      x: side * 0.98,
      y: 1.28,
      z: 0,
      material: materials.goldTrim,
      name: `cauldron_ring_mount_${side}`,
    });
    const ringLoop = createVoxelMesh(tracker, {
      w: 0.1,
      h: 0.34,
      d: 0.34,
      x: side * 1.08,
      y: 1.14,
      z: 0,
      material: materials.darkRimIron,
      name: `cauldron_ring_loop_${side}`,
    });
    root.add(ringAnchor, ringLoop);
  }

  // 5. Recessed Glowing Emissive Bubbling Potion Surface INSIDE the hollow walls
  const liquidGeo = tracker.track(new THREE.BoxGeometry(1.42, 0.14, 1.42));
  const liquidMat = tracker.track(
    new THREE.MeshStandardMaterial({
      color: initialPotionColorHex,
      emissive: initialPotionColorHex,
      emissiveIntensity: 0.95,
      roughness: 0.18,
      metalness: 0.12,
    }),
  );
  const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
  liquidMesh.position.set(0, 1.54, 0);
  liquidMesh.name = 'cauldron_potion_surface';
  root.add(liquidMesh);

  const potionLight = new THREE.PointLight(initialPotionColorHex, 1.7, 5.0, 1.6);
  potionLight.position.set(0, 2.05, 0);
  root.add(potionLight);

  // 6. Spinning Wooden Stirring Ladle dipping into the hollow brew
  const ladlePivot = new THREE.Group();
  ladlePivot.name = 'wooden_ladle_pivot';
  ladlePivot.position.set(0, 1.56, 0);

  const ladleStick = createVoxelMesh(tracker, {
    w: 0.13,
    h: 1.65,
    d: 0.13,
    x: 0.3,
    y: 0.62,
    z: 0.08,
    material: materials.oakWood,
    castShadow,
    name: 'ladle_handle',
  });
  ladleStick.rotation.z = -0.34;
  ladlePivot.add(ladleStick);

  const ladleSpoon = createVoxelMesh(tracker, {
    w: 0.36,
    h: 0.14,
    d: 0.36,
    x: 0.06,
    y: -0.05,
    z: 0.08,
    material: materials.oakWood,
    name: 'ladle_bowl',
  });
  ladlePivot.add(ladleSpoon);
  root.add(ladlePivot);

  // 7. Rising Instanced Voxel Bubbles
  const bubbleGeo = tracker.track(new THREE.BoxGeometry(0.14, 0.14, 0.14));
  const bubbleMat = tracker.track(
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: initialPotionColorHex,
      emissiveIntensity: 0.95,
      roughness: 0.14,
      metalness: 0.08,
    }),
  );
  const bubblesMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, BUBBLE_INSTANCE_COUNT);
  bubblesMesh.name = 'cauldron_instanced_bubbles';
  const bubbleStates: BubbleParticleState[] = [];
  for (let i = 0; i < BUBBLE_INSTANCE_COUNT; i++) {
    bubbleStates.push({
      x: (Math.sin(i * 2.13) * 0.56),
      y: 1.62 + (i / BUBBLE_INSTANCE_COUNT) * 1.15,
      z: (Math.cos(i * 1.77) * 0.56),
      vx: 0,
      vy: 0.48 + (i % 5) * 0.12,
      vz: 0,
      scale: 0.65 + (i % 4) * 0.22,
      phase: i * 0.62,
      life: 1,
      burst: false,
    });
  }
  root.add(bubblesMesh);

  // 8. Three 3D Blocky Glass Potion Bottles beside the Cauldron
  const bottleGroups: THREE.Group[] = [];
  const bottleConfigs: ReadonlyArray<{
    readonly x: number;
    readonly z: number;
    readonly liquidHex: string;
    readonly rotY: number;
  }> = [
    { x: -1.62, z: 0.78, liquidHex: '#f43f5e', rotY: 0.3 },
    { x: 1.58, z: 0.86, liquidHex: '#38bdf8', rotY: -0.45 },
    { x: 1.48, z: -0.82, liquidHex: '#a855f7', rotY: 0.7 },
  ];
  for (let i = 0; i < bottleConfigs.length; i++) {
    const cfg = bottleConfigs[i];
    const bottle = new THREE.Group();
    bottle.name = `potion_bottle_${i}`;
    bottle.position.set(cfg.x, 0, cfg.z);
    bottle.rotation.y = cfg.rotY;

    const glassBody = createVoxelMesh(tracker, {
      w: 0.42,
      h: 0.5,
      d: 0.42,
      x: 0,
      y: 0.25,
      z: 0,
      material: materials.glassBottle,
      name: `bottle_glass_${i}`,
    });
    const innerLiquidMat = tracker.track(
      new THREE.MeshStandardMaterial({
        color: cfg.liquidHex,
        emissive: cfg.liquidHex,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.1,
      }),
    );
    const innerLiquid = createVoxelMesh(tracker, {
      w: 0.3,
      h: 0.32,
      d: 0.3,
      x: 0,
      y: 0.2,
      z: 0,
      material: innerLiquidMat,
      name: `bottle_liquid_${i}`,
    });
    const neck = createVoxelMesh(tracker, {
      w: 0.2,
      h: 0.18,
      d: 0.2,
      x: 0,
      y: 0.59,
      z: 0,
      material: materials.glassBottle,
      name: `bottle_neck_${i}`,
    });
    const cork = createVoxelMesh(tracker, {
      w: 0.18,
      h: 0.12,
      d: 0.18,
      x: 0,
      y: 0.72,
      z: 0,
      material: materials.oakWood,
      name: `bottle_cork_${i}`,
    });

    bottle.add(glassBody, innerLiquid, neck, cork);
    bottleGroups.push(bottle);
    root.add(bottle);
  }

  return {
    root,
    wallMeshes,
    footMeshes,
    flameMeshes,
    bottleGroups,
    liquidMesh,
    bubblesMesh,
    bubbleStates,
    ladlePivot,
    campfireLight,
    potionLight,
  };
}

export function setCauldronBrewColor(
  assembly: VoxelCauldronAssembly,
  potionColorHex: string,
): void {
  _color.set(potionColorHex);
  assembly.liquidMesh.material.color.copy(_color);
  assembly.liquidMesh.material.emissive.copy(_color);
  assembly.bubblesMesh.material.emissive.copy(_color);
  assembly.potionLight.color.copy(_color);
}

export function triggerCauldronBrewBurst(
  assembly: VoxelCauldronAssembly,
  potionColorHex: string,
): void {
  setCauldronBrewColor(assembly, potionColorHex);
  for (let i = 0; i < assembly.bubbleStates.length; i++) {
    const b = assembly.bubbleStates[i];
    const angle = (Math.PI * 2 * i) / assembly.bubbleStates.length;
    const speed = 0.7 + (i % 5) * 0.22;
    b.x = Math.cos(angle) * 0.25;
    b.y = 1.66;
    b.z = Math.sin(angle) * 0.25;
    b.vx = Math.cos(angle) * speed;
    b.vy = 2.0 + (i % 4) * 0.42;
    b.vz = Math.sin(angle) * speed;
    b.burst = true;
    b.life = 1.05;
  }
}

export function stepVoxelCauldronAnimation(
  assembly: VoxelCauldronAssembly,
  dt: number,
  elapsedSec: number,
  stirSpeedMultiplier = 1.0,
): void {
  assembly.ladlePivot.rotation.y += dt * 1.45 * stirSpeedMultiplier;
  assembly.liquidMesh.position.y = 1.54 + Math.sin(elapsedSec * 4.2) * 0.03;

  // Flicker campfire flames & warm PointLight
  assembly.campfireLight.intensity = 2.25 + Math.sin(elapsedSec * 14.5) * 0.45 + Math.cos(elapsedSec * 9.2) * 0.22;
  for (let i = 0; i < assembly.flameMeshes.length; i++) {
    const flame = assembly.flameMeshes[i];
    const flicker = 0.8 + Math.sin(elapsedSec * 13 + i * 1.9) * 0.35;
    flame.scale.set(1, flicker, 1);
    flame.position.y = 0.25 + flicker * 0.07;
  }

  // Update instanced voxel bubbles (zero per-frame heap allocations)
  for (let i = 0; i < assembly.bubbleStates.length; i++) {
    const b = assembly.bubbleStates[i];
    if (b.burst) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;
      b.vy -= 3.8 * dt;
      b.life -= dt;
      if (b.life <= 0 || b.y < 1.52) {
        b.burst = false;
        b.x = Math.sin(i * 2.13) * 0.56;
        b.y = 1.62;
        b.z = Math.cos(i * 1.77) * 0.56;
        b.vx = 0;
        b.vy = 0.48 + (i % 5) * 0.12;
        b.vz = 0;
      }
    } else {
      b.y += b.vy * dt;
      if (b.y > 2.95) {
        b.y = 1.62;
        b.x = Math.sin(elapsedSec * 1.5 + i * 2.3) * 0.55;
        b.z = Math.cos(elapsedSec * 1.2 + i * 1.9) * 0.55;
      }
    }

    const s = b.burst ? b.scale * Math.max(0.25, b.life) : b.scale * (0.85 + Math.sin(elapsedSec * 5 + b.phase) * 0.18);
    _pos.set(b.x, b.y, b.z);
    _quat.identity();
    _scale.set(s, s, s);
    _mat4.compose(_pos, _quat, _scale);
    assembly.bubblesMesh.setMatrixAt(i, _mat4);
  }
  assembly.bubblesMesh.instanceMatrix.needsUpdate = true;
}
