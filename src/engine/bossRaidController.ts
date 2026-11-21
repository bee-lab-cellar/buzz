import { ActBlueprint } from '../maps/arc1Acts1to41';

export interface BossPhaseTelemetry {
  actId: number;
  arcNumber: 1 | 2 | 3 | 4 | 5 | 6;
  phaseIndex: 1 | 2 | 3;
  enrageMultiplier: number;
  activeGimmickLabel: string;
}

export function evaluateBossRaidTelemetry(
  blueprint: ActBlueprint,
  bossHpRatio: number
): BossPhaseTelemetry {
  const ratio = Math.max(0, Math.min(1, bossHpRatio));
  const phaseIndex: 1 | 2 | 3 = ratio > 0.65 ? 1 : ratio > 0.3 ? 2 : 3;
  const enrageMultiplier = phaseIndex === 1 ? 1.0 : phaseIndex === 2 ? 1.22 : 1.45;
  const arcNumber: 1 | 2 | 3 | 4 | 5 | 6 =
    blueprint.actId <= 41
      ? 1
      : blueprint.actId <= 82
      ? 2
      : blueprint.actId <= 122
      ? 3
      : blueprint.actId <= 180
      ? 4
      : blueprint.actId <= 240
      ? 5
      : 6;

  const arcGimmicks: Record<number, [string, string, string]> = {
    1: ['🐺 Pack Flanking Formation', '❄️ Howling Blizzard Dash', '🩸 Blood-Moon Pack Frenzy'],
    2: ['🐗 Siege Shield Phalanx', '🔥 Molten Anvil Barrage', '⚡ Berserker Juggernaut Charge'],
    3: ['🐉 Wyrm Thermal Ascent', '☄️ Cinder Starfall Breath', '🏹 Harpoon Ballista Vulnerability'],
    4: ['🐙 Abyssal Tentacle Ring', '🎯 Glowing Cut-Point Weak Spot (2.5x)', '🌊 Maelstrom Ink Surge'],
    5: ['⚙️ Chrono-Gear Synchrony', '⏳ Temporal Rewind Clone', '🌌 Singularity Overdrive'],
    6: ['🦆 Golden Feather Ward', '🍞 Cosmic Bread Meteor Swarm', '👑 Quack-Narok Omniverse Finale']
  };

  const labels = arcGimmicks[arcNumber] || arcGimmicks[1];

  return {
    actId: blueprint.actId,
    arcNumber,
    phaseIndex,
    enrageMultiplier,
    activeGimmickLabel: labels[phaseIndex - 1]
  };
}
