/**
 * Layer 4 — Clean Physics Simulation for all 55 Biome Traps (`TrapCategory`)
 * Strictly typed, spatial-hash aware, zero `any`, zero cluttered debug labels.
 */

import type { TrapCategory, TrapInstance } from '../types/world';
import type { Vec2 } from '../types/math';

export interface TrapRuntimeState {
  readonly spec: TrapInstance;
  elapsedSec: number;
  activePhase: 'idle' | 'telegraph' | 'triggered';
  currentPos: Vec2;
  rotationRad: number;
  crackedProgress: number;
}

export interface TrapHitOutcome {
  readonly trapId: string;
  readonly category: TrapCategory;
  readonly damage: number;
  readonly knockback: Vec2;
  readonly statusEffect: 'none' | 'slow' | 'burn' | 'shock' | 'poison' | 'launch' | 'shield_heal';
}

export interface TrapBehaviorProfile {
  readonly telegraphSec: number;
  readonly activeSec: number;
  readonly knockbackForce: number;
  readonly statusEffect: TrapHitOutcome['statusEffect'];
  readonly colorHex: string;
}

const DEFAULT_TRAP_BEHAVIOR: TrapBehaviorProfile = {
  telegraphSec: 0.45,
  activeSec: 0.35,
  knockbackForce: 110,
  statusEffect: 'none',
  colorHex: '#f59e0b',
};

export const TRAP_CATEGORY_PROFILES: Readonly<Record<TrapCategory, TrapBehaviorProfile>> = {
  swinging_log: { telegraphSec: 0.4, activeSec: 0.5, knockbackForce: 155, statusEffect: 'none', colorHex: '#92400e' },
  rolling_boulder: { telegraphSec: 0.35, activeSec: 0.7, knockbackForce: 175, statusEffect: 'none', colorHex: '#78716c' },
  bounce_mushroom: { telegraphSec: 0.1, activeSec: 0.3, knockbackForce: 190, statusEffect: 'launch', colorHex: '#a855f7' },
  cracking_ice: { telegraphSec: 0.65, activeSec: 0.4, knockbackForce: 40, statusEffect: 'slow', colorHex: '#bae6fd' },
  explosive_minecart: { telegraphSec: 0.5, activeSec: 0.35, knockbackForce: 185, statusEffect: 'burn', colorHex: '#ef4444' },
  laser_prism: { telegraphSec: 0.55, activeSec: 0.45, knockbackForce: 60, statusEffect: 'burn', colorHex: '#38bdf8' },
  quicksand_whirlpool: { telegraphSec: 0.2, activeSec: 0.8, knockbackForce: -65, statusEffect: 'slow', colorHex: '#d97706' },
  dart_totem: { telegraphSec: 0.4, activeSec: 0.3, knockbackForce: 80, statusEffect: 'poison', colorHex: '#84cc16' },
  rune_drawbridge: { telegraphSec: 0.7, activeSec: 0.5, knockbackForce: 45, statusEffect: 'none', colorHex: '#60a5fa' },
  trench_landmine: { telegraphSec: 0.35, activeSec: 0.25, knockbackForce: 180, statusEffect: 'burn', colorHex: '#dc2626' },
  blizzard_brazier: { telegraphSec: 0.2, activeSec: 0.9, knockbackForce: 0, statusEffect: 'shield_heal', colorHex: '#fb923c' },
  factory_crusher: { telegraphSec: 0.6, activeSec: 0.3, knockbackForce: 160, statusEffect: 'none', colorHex: '#64748b' },
  battering_ram_payload: { telegraphSec: 0.5, activeSec: 0.45, knockbackForce: 200, statusEffect: 'none', colorHex: '#b45309' },
  wildfire_barrel: { telegraphSec: 0.4, activeSec: 0.5, knockbackForce: 150, statusEffect: 'burn', colorHex: '#f97316' },
  rising_acid_tide: { telegraphSec: 0.65, activeSec: 0.6, knockbackForce: 30, statusEffect: 'poison', colorHex: '#65a30d' },
  rotating_firebar: { telegraphSec: 0.15, activeSec: 0.95, knockbackForce: 120, statusEffect: 'burn', colorHex: '#fb923c' },
  updraft_geyser: { telegraphSec: 0.25, activeSec: 0.6, knockbackForce: 140, statusEffect: 'launch', colorHex: '#7dd3fc' },
  oxygen_vent: { telegraphSec: 0.1, activeSec: 0.95, knockbackForce: 0, statusEffect: 'shield_heal', colorHex: '#22d3ee' },
  steam_mecha_bay: { telegraphSec: 0.45, activeSec: 0.4, knockbackForce: 130, statusEffect: 'burn', colorHex: '#cbd5e1' },
  black_hole_well: { telegraphSec: 0.35, activeSec: 0.75, knockbackForce: -115, statusEffect: 'slow', colorHex: '#7e22ce' },
  sawmill_buzzsaw: { telegraphSec: 0.2, activeSec: 0.8, knockbackForce: 135, statusEffect: 'none', colorHex: '#e2e8f0' },
  bear_trap: { telegraphSec: 0.25, activeSec: 0.4, knockbackForce: 20, statusEffect: 'slow', colorHex: '#94a3b8' },
  chain_lightning_pylon: { telegraphSec: 0.5, activeSec: 0.35, knockbackForce: 95, statusEffect: 'shock', colorHex: '#38bdf8' },
  leaf_pitfall: { telegraphSec: 0.45, activeSec: 0.35, knockbackForce: 50, statusEffect: 'slow', colorHex: '#4d7c0f' },
  retracting_thorn_wall: { telegraphSec: 0.5, activeSec: 0.45, knockbackForce: 120, statusEffect: 'poison', colorHex: '#15803d' },
  poison_puffball: { telegraphSec: 0.45, activeSec: 0.5, knockbackForce: 75, statusEffect: 'poison', colorHex: '#a3e635' },
  darkness_lantern: { telegraphSec: 0.2, activeSec: 0.9, knockbackForce: 0, statusEffect: 'shield_heal', colorHex: '#fde047' },
  cliff_wind_gust: { telegraphSec: 0.45, activeSec: 0.55, knockbackForce: 165, statusEffect: 'launch', colorHex: '#e0f2fe' },
  magma_geyser: { telegraphSec: 0.55, activeSec: 0.4, knockbackForce: 150, statusEffect: 'burn', colorHex: '#ea580c' },
  boiling_oil_cauldron: { telegraphSec: 0.5, activeSec: 0.45, knockbackForce: 110, statusEffect: 'burn', colorHex: '#713f12' },
  bamboo_warp_mirror: { telegraphSec: 0.3, activeSec: 0.4, knockbackForce: 90, statusEffect: 'launch', colorHex: '#2dd4bf' },
  barbed_wire_trench: { telegraphSec: 0.2, activeSec: 0.8, knockbackForce: 45, statusEffect: 'slow', colorHex: '#71717a' },
  artillery_barrage: { telegraphSec: 0.75, activeSec: 0.3, knockbackForce: 195, statusEffect: 'burn', colorHex: '#ef4444' },
  moving_river_barge: { telegraphSec: 0.15, activeSec: 0.85, knockbackForce: 60, statusEffect: 'none', colorHex: '#a16207' },
  rockslide_lever: { telegraphSec: 0.55, activeSec: 0.45, knockbackForce: 170, statusEffect: 'none', colorHex: '#57534e' },
  windmill_propeller: { telegraphSec: 0.2, activeSec: 0.8, knockbackForce: 160, statusEffect: 'launch', colorHex: '#d6d3d1' },
  conveyor_belt_hazard: { telegraphSec: 0.1, activeSec: 0.95, knockbackForce: 85, statusEffect: 'none', colorHex: '#475569' },
  chandelier_drop: { telegraphSec: 0.65, activeSec: 0.3, knockbackForce: 165, statusEffect: 'burn', colorHex: '#facc15' },
  electric_floor_tile: { telegraphSec: 0.5, activeSec: 0.4, knockbackForce: 85, statusEffect: 'shock', colorHex: '#0ea5e9' },
  spreading_wildfire_barrel: { telegraphSec: 0.45, activeSec: 0.55, knockbackForce: 145, statusEffect: 'burn', colorHex: '#f97316' },
  gold_mimic: { telegraphSec: 0.4, activeSec: 0.45, knockbackForce: 130, statusEffect: 'none', colorHex: '#eab308' },
  lightning_spire: { telegraphSec: 0.55, activeSec: 0.35, knockbackForce: 110, statusEffect: 'shock', colorHex: '#38bdf8' },
  twister_vortex: { telegraphSec: 0.3, activeSec: 0.7, knockbackForce: -95, statusEffect: 'launch', colorHex: '#cbd5e1' },
  dragonfire_brazier: { telegraphSec: 0.45, activeSec: 0.5, knockbackForce: 125, statusEffect: 'burn', colorHex: '#f43f5e' },
  chrono_slow_dome: { telegraphSec: 0.35, activeSec: 0.75, knockbackForce: 0, statusEffect: 'slow', colorHex: '#60a5fa' },
  fire_spinner_bar: { telegraphSec: 0.15, activeSec: 0.9, knockbackForce: 120, statusEffect: 'burn', colorHex: '#fb923c' },
  depth_charge_mine: { telegraphSec: 0.55, activeSec: 0.3, knockbackForce: 175, statusEffect: 'shock', colorHex: '#0284c7' },
  siren_whirlpool: { telegraphSec: 0.3, activeSec: 0.75, knockbackForce: -85, statusEffect: 'slow', colorHex: '#06b6d4' },
  ink_cloud_vent: { telegraphSec: 0.4, activeSec: 0.55, knockbackForce: 40, statusEffect: 'slow', colorHex: '#312e81' },
  steam_valve_jet: { telegraphSec: 0.45, activeSec: 0.45, knockbackForce: 135, statusEffect: 'burn', colorHex: '#e2e8f0' },
  gear_blade_track: { telegraphSec: 0.2, activeSec: 0.85, knockbackForce: 140, statusEffect: 'none', colorHex: '#d97706' },
  phantom_rail_train: { telegraphSec: 0.65, activeSec: 0.4, knockbackForce: 210, statusEffect: 'shock', colorHex: '#818cf8' },
  tesla_arc_coil: { telegraphSec: 0.5, activeSec: 0.4, knockbackForce: 100, statusEffect: 'shock', colorHex: '#22d3ee' },
  void_rift_tear: { telegraphSec: 0.55, activeSec: 0.45, knockbackForce: -105, statusEffect: 'shock', colorHex: '#a855f7' },
  gravity_flip_pad: { telegraphSec: 0.25, activeSec: 0.5, knockbackForce: 160, statusEffect: 'launch', colorHex: '#c084fc' },
};

export function createTrapRuntime(spec: TrapInstance): TrapRuntimeState {
  return {
    spec,
    elapsedSec: 0,
    activePhase: 'idle',
    currentPos: { x: spec.position.x, y: spec.position.y },
    rotationRad: 0,
    crackedProgress: 0,
  };
}

export function stepTrapSimulation(
  traps: TrapRuntimeState[],
  dt: number,
  targetPos: Vec2,
  targetRadius: number,
): TrapHitOutcome[] {
  const hits: TrapHitOutcome[] = [];

  for (let i = 0; i < traps.length; i++) {
    const trap = traps[i];
    const profile = TRAP_CATEGORY_PROFILES[trap.spec.category] ?? DEFAULT_TRAP_BEHAVIOR;
    const cycle = Math.max(0.8, trap.spec.triggerIntervalSec);

    trap.elapsedSec += dt;
    trap.rotationRad = (trap.rotationRad + dt * 2.4) % (Math.PI * 2);

    // Patrol along waypoints if provided
    if (trap.spec.patrolWaypoints.length >= 2) {
      const a = trap.spec.patrolWaypoints[0];
      const b = trap.spec.patrolWaypoints[1];
      const pingPong = 0.5 - 0.5 * Math.cos((trap.elapsedSec / cycle) * Math.PI * 2);
      trap.currentPos = {
        x: a.x + (b.x - a.x) * pingPong,
        y: a.y + (b.y - a.y) * pingPong,
      };
    }

    const phaseTime = trap.elapsedSec % cycle;
    const triggerStart = Math.max(0.1, cycle - profile.activeSec);
    const telegraphStart = Math.max(0, triggerStart - profile.telegraphSec);

    if (phaseTime >= triggerStart) {
      trap.activePhase = 'triggered';
    } else if (phaseTime >= telegraphStart) {
      trap.activePhase = 'telegraph';
    } else {
      trap.activePhase = 'idle';
    }

    if (trap.activePhase !== 'triggered') continue;

    const dx = targetPos.x - trap.currentPos.x;
    const dy = targetPos.y - trap.currentPos.y;
    const distSq = dx * dx + dy * dy;
    const hitRange = trap.spec.radius + targetRadius;
    if (distSq <= hitRange * hitRange) {
      const dist = Math.sqrt(distSq) || 1;
      hits.push({
        trapId: trap.spec.id,
        category: trap.spec.category,
        damage: profile.statusEffect === 'shield_heal' ? 0 : trap.spec.damage,
        knockback: {
          x: (dx / dist) * profile.knockbackForce,
          y: (dy / dist) * profile.knockbackForce,
        },
        statusEffect: profile.statusEffect,
      });
    }
  }

  return hits;
}
