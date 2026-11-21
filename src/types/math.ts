/**
 * File 1 / 100 — Strict 2D/3D Mathematical, Geometric, Spatial-Hash, Verlet Cloth,
 * Cellular Fluid/Fire, Raycast Lighting, Flow-Field, Fixed-Timestep & Mulberry32 Types.
 * Zero `any` types.
 */

export type ElevationLayer = 0 | 1 | 2;
export type ElevationTier = ElevationLayer;

export interface Vec2 {
  x: number;
  y: number;
}

export interface ReadonlyVec2 {
  readonly x: number;
  readonly y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ReadonlyVec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Column-major 3x3 affine 2D transformation matrix:
 * [ m00 m01 m02 ]
 * [ m10 m11 m12 ]
 * [ m20 m21 m22 ]
 */
export interface Mat3 {
  readonly m00: number;
  readonly m01: number;
  readonly m02: number;
  readonly m10: number;
  readonly m11: number;
  readonly m12: number;
  readonly m20: number;
  readonly m21: number;
  readonly m22: number;
}

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface OBB {
  center: Vec2;
  halfExtents: Vec2;
  /** Rotation in radians */
  rotation: number;
}

export interface Ray2D {
  readonly origin: ReadonlyVec2;
  /** Unit direction vector */
  readonly direction: ReadonlyVec2;
  readonly maxDistance: number;
}

export interface Segment2D {
  readonly a: ReadonlyVec2;
  readonly b: ReadonlyVec2;
}

export interface Polygon2D {
  readonly vertices: ReadonlyArray<ReadonlyVec2>;
}

export interface CircleCollider {
  x: number;
  y: number;
  radius: number;
  elevation: ElevationTier;
}

export interface CubicBezierSpline {
  readonly p0: ReadonlyVec2;
  readonly p1: ReadonlyVec2;
  readonly p2: ReadonlyVec2;
  readonly p3: ReadonlyVec2;
}

export interface FlowFieldCell {
  readonly col: number;
  readonly row: number;
  /** Movement cost: Infinity for impassable river/lava/cliff, 1.0 for dry land/bridges */
  cost: number;
  /** Dijkstra integration distance to goal */
  integration: number;
  /** Normalized steering vector toward lower integration neighbor */
  flowX: number;
  flowY: number;
}

export type FluidPhase =
  | 'empty'
  | 'solid'
  | 'water'
  | 'lava'
  | 'acid'
  | 'fire'
  | 'steam'
  | 'obsidian'
  | 'smoke';

export interface CellularFluidCell {
  phase: FluidPhase;
  temperature: number;
  fuel: number;
  updatedThisTick: boolean;
}

export interface FixedTimestepState {
  readonly fixedDeltaSec: number;
  accumulatorSec: number;
  tickCount: number;
  alpha: number;
  readonly maxSubSteps: number;
}

export interface DeterministicRNG {
  readonly initialSeed: number;
  getState(): number;
  nextFloat(): number;
  nextInt(minInclusive: number, maxInclusive: number): number;
  nextRange(min: number, max: number): number;
  chance(probability: number): boolean;
  clone(): DeterministicRNG;
}

export class Mulberry32 implements DeterministicRNG {
  public readonly initialSeed: number;
  private state: number;

  constructor(seed: number) {
    const normalized = (seed >>> 0) || 0x9e3779b9;
    this.initialSeed = normalized;
    this.state = normalized;
  }

  public getState(): number {
    return this.state >>> 0;
  }

  public nextFloat(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    const lo = Math.ceil(Math.min(minInclusive, maxInclusive));
    const hi = Math.floor(Math.max(minInclusive, maxInclusive));
    return lo + Math.floor(this.nextFloat() * (hi - lo + 1));
  }

  public nextRange(min: number, max: number): number {
    return min + (max - min) * this.nextFloat();
  }

  public chance(probability: number): boolean {
    return this.nextFloat() < probability;
  }

  public clone(): DeterministicRNG {
    const copy = new Mulberry32(this.initialSeed);
    copy.state = this.state;
    return copy;
  }
}

export interface SpatialHashEntity {
  readonly id: string;
  x: number;
  y: number;
  radius: number;
  layer: 'hero' | 'ally' | 'enemy' | 'boss' | 'projectile' | 'prop' | 'trap';
}

export interface SpatialHashCell {
  readonly key: number;
  readonly cx: number;
  readonly cy: number;
  entities: SpatialHashEntity[];
  count: number;
}

export interface Transform2D {
  position: Vec2;
  velocity: Vec2;
  scale: Vec2;
  rotation: number;
  elevation: ElevationTier;
  facing: 1 | -1;
}

export interface RaycastHit2D {
  hit: boolean;
  point: Vec2;
  normal: Vec2;
  distance: number;
  tileX: number;
  tileY: number;
}

export interface SATCollisionResult {
  colliding: boolean;
  overlap: number;
  mtv: Vec2;
}

export interface GridCoord {
  readonly col: number;
  readonly row: number;
}

export interface PathNode {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parentIdx: number;
}

export interface VerletNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  pinned: boolean;
  readonly mass: number;
}

export interface VerletStick {
  readonly indexA: number;
  readonly indexB: number;
  readonly restLength: number;
  readonly stiffness: number;
}

export interface VerletClothRig {
  readonly id: string;
  readonly kind:
    | 'nyx_cloak'
    | 'nyx_hat_tip'
    | 'king_leo_mane'
    | 'king_leo_cape'
    | 'fenrir_scarf'
    | 'war_banner';
  readonly nodes: VerletNode[];
  readonly sticks: ReadonlyArray<VerletStick>;
  readonly damping: number;
  readonly gravityY: number;
  readonly constraintIterations: number;
}
