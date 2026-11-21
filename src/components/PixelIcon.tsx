import React, { useMemo } from 'react';
import { getSpriteBank } from '../game/sprites';
import { GearTier } from '../game/types';

interface PixelIconProps {
  kind: 'weapon' | 'armor' | 'healPotion' | 'duckElixir' | 'fishTreat';
  tier?: GearTier;
  size?: number;
  className?: string;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ kind, tier = 1, size = 20, className = '' }) => {
  const src = useMemo(() => {
    const bank = getSpriteBank();
    if (kind === 'weapon') return bank.icons.weapon[tier].toDataURL();
    if (kind === 'armor') return bank.icons.armor[tier].toDataURL();
    if (kind === 'healPotion') return bank.icons.healPotion.toDataURL();
    if (kind === 'fishTreat') return bank.icons.fishTreat.toDataURL();
    return bank.icons.duckElixir.toDataURL();
  }, [kind, tier]);

  return (
    <img
      src={src}
      alt={kind}
      width={size}
      height={size}
      className={`pixelated-canvas shrink-0 select-none ${className}`}
      draggable={false}
    />
  );
};
