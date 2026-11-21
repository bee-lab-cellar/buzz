/**
 * File 6 / 100 — Strict 2D Vector, 3x3 Affine Matrix, Interpolation & Cubic-Bezier Easing Math.
 * Zero `any` types.
 */

import type { Mat3, ReadonlyVec2, Vec2 } from '../types/math';

export function vec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function cloneVec2(v: ReadonlyVec2): Vec2 {
  return { x: v.x, y: v.y };
}

export function addVec2(a: ReadonlyVec2, b: ReadonlyVec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subVec2(a: ReadonlyVec2, b: ReadonlyVec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scaleVec2(v: ReadonlyVec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

export function dotVec2(a: ReadonlyVec2, b: ReadonlyVec2): number {
  return a.x * b.x + a.y * b.y;
}

export function crossVec2(a: ReadonlyVec2, b: ReadonlyVec2): number {
  return a.x * b.y - a.y * b.x;
}

export function lengthSqVec2(v: ReadonlyVec2): number {
  return v.x * v.x + v.y * v.y;
}

export function lengthVec2(v: ReadonlyVec2): number {
  return Math.hypot(v.x, v.y);
}

export function distanceVec2(a: ReadonlyVec2, b: ReadonlyVec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalizeVec2(v: ReadonlyVec2): Vec2 {
  const len = Math.hypot(v.x, v.y);
  if (len <= 1e-8) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function perpVec2(v: ReadonlyVec2): Vec2 {
  return { x: -v.y, y: v.x };
}

export function rotateVec2(v: ReadonlyVec2, radians: number): Vec2 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  return {
    x: v.x * c - v.y * s,
    y: v.x * s + v.y * c,
  };
}

export function lerpScalar(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function lerpVec2(a: ReadonlyVec2, b: ReadonlyVec2, t: number): Vec2 {
  const k = Math.max(0, Math.min(1, t));
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
  };
}

export function clampScalar(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function dampScalar(current: number, target: number, lambda: number, dt: number): number {
  return lerpScalar(current, target, 1 - Math.exp(-lambda * Math.max(0, dt)));
}

/**
 * Analytic 1D cubic-bezier easing curve for smooth 60FPS cutscene camera choreography.
 */
export function cubicBezierEase(tRaw: number, p1: number, p2: number): number {
  const t = clampScalar(tRaw, 0, 1);
  const u = 1 - t;
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
}

export function easeInOutCubic(tRaw: number): number {
  const t = clampScalar(tRaw, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function mat3Identity(): Mat3 {
  return {
    m00: 1, m01: 0, m02: 0,
    m10: 0, m11: 1, m12: 0,
    m20: 0, m21: 0, m22: 1,
  };
}

export function mat3FromTRS(tx: number, ty: number, rad: number, sx = 1, sy = 1): Mat3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return {
    m00: c * sx, m01: -s * sy, m02: tx,
    m10: s * sx, m11: c * sy, m12: ty,
    m20: 0, m21: 0, m22: 1,
  };
}

export function mat3Multiply(a: Mat3, b: Mat3): Mat3 {
  return {
    m00: a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20,
    m01: a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21,
    m02: a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22,
    m10: a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20,
    m11: a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21,
    m12: a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22,
    m20: a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20,
    m21: a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21,
    m22: a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22,
  };
}

export function mat3Determinant(m: Mat3): number {
  return (
    m.m00 * (m.m11 * m.m22 - m.m12 * m.m21) -
    m.m01 * (m.m10 * m.m22 - m.m12 * m.m20) +
    m.m02 * (m.m10 * m.m21 - m.m11 * m.m20)
  );
}

export function mat3Invert(m: Mat3): Mat3 | null {
  const det = mat3Determinant(m);
  if (Math.abs(det) <= 1e-10) return null;
  const inv = 1 / det;
  return {
    m00: (m.m11 * m.m22 - m.m12 * m.m21) * inv,
    m01: (m.m02 * m.m21 - m.m01 * m.m22) * inv,
    m02: (m.m01 * m.m12 - m.m02 * m.m11) * inv,
    m10: (m.m12 * m.m20 - m.m10 * m.m22) * inv,
    m11: (m.m00 * m.m22 - m.m02 * m.m20) * inv,
    m12: (m.m02 * m.m10 - m.m00 * m.m12) * inv,
    m20: (m.m10 * m.m21 - m.m11 * m.m20) * inv,
    m21: (m.m01 * m.m20 - m.m00 * m.m21) * inv,
    m22: (m.m00 * m.m11 - m.m01 * m.m10) * inv,
  };
}

export function mat3TransformPoint(m: Mat3, p: ReadonlyVec2): Vec2 {
  return {
    x: m.m00 * p.x + m.m01 * p.y + m.m02,
    y: m.m10 * p.x + m.m11 * p.y + m.m12,
  };
}
