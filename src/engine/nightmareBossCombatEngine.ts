export const NIGHTMARE_SINGLE_HIT_CAP_RATIO = 0.012; // 1.2% Max HP damage cap per single hit
export const NIGHTMARE_PHASE_GATES: ReadonlyArray<number> = [0.75, 0.5, 0.25];

export interface SiphonObeliskNode {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shattered: boolean;
  element: 'solar' | 'abyss' | 'void';
}

export interface NightmareBossState {
  bossId: string;
  maxHp: number;
  currentHp: number;
  triggeredGates: number[];
  shieldActive: boolean;
  siphonObelisks: SiphonObeliskNode[];
  counterStanceActive: boolean;
  counterStanceTimer: number;
  staggerTimer: number;
}

export function createNightmareBossState(bossId: string, maxHp: number): NightmareBossState {
  return {
    bossId,
    maxHp: Math.max(1, maxHp),
    currentHp: Math.max(1, maxHp),
    triggeredGates: [],
    shieldActive: false,
    siphonObelisks: [],
    counterStanceActive: false,
    counterStanceTimer: 0,
    staggerTimer: 0,
  };
}

export function spawnThreeSiphonObelisks(
  centerX: number,
  centerY: number,
  obeliskHp: number,
  gateRatio: number
): SiphonObeliskNode[] {
  const offsets: Array<{ dx: number; dy: number; element: SiphonObeliskNode['element'] }> = [
    { dx: -96, dy: -46, element: 'solar' },
    { dx: 96, dy: -46, element: 'abyss' },
    { dx: 0, dy: 64, element: 'void' },
  ];
  return offsets.map((o, idx) => ({
    id: `siphon_${Math.round(gateRatio * 100)}_${idx + 1}`,
    x: centerX + o.dx,
    y: centerY + o.dy,
    hp: Math.max(40, Math.round(obeliskHp)),
    maxHp: Math.max(40, Math.round(obeliskHp)),
    shattered: false,
    element: o.element,
  }));
}

export interface NightmareDamageOutcome {
  appliedDamage: number;
  wasCapped: boolean;
  blockedByShield: boolean;
  triggeredCounterRiposte: boolean;
  staggerTriggered: boolean;
  newPhaseGate: number | null;
  bannerText: string | null;
}

export function applyNightmareBossDamage(
  state: NightmareBossState,
  rawDamage: number,
  bossX: number,
  bossY: number,
  options: { isBackstab?: boolean; isProjectile?: boolean } = {}
): NightmareDamageOutcome {
  if (state.shieldActive) {
    return {
      appliedDamage: 0,
      wasCapped: false,
      blockedByShield: true,
      triggeredCounterRiposte: false,
      staggerTriggered: false,
      newPhaseGate: null,
      bannerText: '🛡️ PHASE SHIELD! SHATTER ALL 3 SIPHON OBELISKS!',
    };
  }

  if (state.counterStanceActive && !options.isBackstab && !options.isProjectile) {
    return {
      appliedDamage: Math.round(rawDamage * 0.15),
      wasCapped: false,
      blockedByShield: false,
      triggeredCounterRiposte: true,
      staggerTriggered: false,
      newPhaseGate: null,
      bannerText: '⚡ COUNTER RIPOSTE! DASH BEHIND BOSS TO BREAK STANCE!',
    };
  }

  let staggerTriggered = false;
  let effectiveRaw = rawDamage;
  if (state.counterStanceActive && options.isBackstab) {
    state.counterStanceActive = false;
    state.counterStanceTimer = 0;
    state.staggerTimer = 3.5;
    staggerTriggered = true;
    effectiveRaw *= 1.8;
  }

  const singleHitCap = Math.max(1, Math.round(state.maxHp * NIGHTMARE_SINGLE_HIT_CAP_RATIO));
  const wasCapped = effectiveRaw > singleHitCap;
  let appliedDamage = Math.min(singleHitCap, Math.max(1, Math.round(effectiveRaw)));

  const prevRatio = state.currentHp / state.maxHp;
  let newPhaseGate: number | null = null;
  for (const gate of NIGHTMARE_PHASE_GATES) {
    if (
      prevRatio > gate &&
      (state.currentHp - appliedDamage) / state.maxHp <= gate &&
      !state.triggeredGates.includes(gate)
    ) {
      newPhaseGate = gate;
      appliedDamage = Math.max(1, state.currentHp - Math.floor(state.maxHp * gate));
      state.triggeredGates.push(gate);
      state.shieldActive = true;
      state.siphonObelisks = spawnThreeSiphonObelisks(
        bossX,
        bossY,
        Math.round(state.maxHp * 0.04),
        gate
      );
      break;
    }
  }

  state.currentHp = Math.max(0, state.currentHp - appliedDamage);

  return {
    appliedDamage,
    wasCapped,
    blockedByShield: false,
    triggeredCounterRiposte: false,
    staggerTriggered,
    newPhaseGate,
    bannerText: newPhaseGate
      ? `🔮 ${Math.round(newPhaseGate * 100)}% PHASE GATE! DESTROY 3 SIPHON OBELISKS!`
      : staggerTriggered
      ? '💥 COUNTER STANCE BROKEN! BOSS STAGGERED!'
      : null,
  };
}

export function damageSiphonObelisk(
  state: NightmareBossState,
  obeliskId: string,
  damage: number
): { shatteredObelisk: boolean; shieldBroken: boolean } {
  const node = state.siphonObelisks.find((o) => o.id === obeliskId);
  if (!node || node.shattered) {
    return { shatteredObelisk: false, shieldBroken: false };
  }
  node.hp = Math.max(0, node.hp - Math.max(1, Math.round(damage)));
  if (node.hp <= 0) {
    node.shattered = true;
  }
  const allShattered = state.siphonObelisks.every((o) => o.shattered);
  if (allShattered) {
    state.shieldActive = false;
    state.staggerTimer = 3.0;
  }
  return {
    shatteredObelisk: node.shattered,
    shieldBroken: allShattered,
  };
}

export function tickNightmareBossStance(state: NightmareBossState, dt: number): void {
  if (state.staggerTimer > 0) {
    state.staggerTimer = Math.max(0, state.staggerTimer - dt);
  }
  if (state.counterStanceActive) {
    state.counterStanceTimer -= dt;
    if (state.counterStanceTimer <= 0) {
      state.counterStanceActive = false;
      state.counterStanceTimer = 0;
    }
  }
}
