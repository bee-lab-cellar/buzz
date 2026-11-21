/**
 * File 85 / 100 — 3D Voxel Hero Diorama Showcase Tab (Nyx, King Leo, Fenrir, The Great Duck).
 * Isolated `useRef` WebGL container with NO `backdrop-blur`. Zero `any` types.
 */

import { useEffect, useRef, useState } from 'react';
import { Crown } from 'lucide-react';
import { VoxelHeroShowcaseStage } from '../three/voxelHeroShowcaseStage';
import type { PlayableHeroId } from '../types/combat';

const HERO_CARDS: ReadonlyArray<{
  readonly id: PlayableHeroId;
  readonly name: string;
  readonly role: string;
  readonly detail: string;
}> = [
  {
    id: 'nyx',
    name: 'Nyx (Starlight Cat Mage)',
    role: 'Arcane Blade & Counter-Stance',
    detail: 'Void-black feline mage wearing her signature crooked starry wizard hat and wielding the Starlight Wand.',
  },
  {
    id: 'king_leo',
    name: 'King Leo (Golden Lion)',
    role: 'Royal Vanguard Tank',
    detail: 'Towering golden lion monarch with 360° layered mahogany-and-gold mane, 5-point crown, and Sun Greatsword.',
  },
  {
    id: 'fenrir',
    name: 'Fenrir (Reformed Wolf-King)',
    role: 'Eclipse Vanguard Bruiser',
    detail: 'Silver-charcoal Dire Wolf fighting on the Cat-Dog Alliance Hero Team across Arcs III–X.',
  },
  {
    id: 'great_duck',
    name: 'The Great Duck (Archmage)',
    role: 'BlockCraft Alchemist Support',
    detail: 'Cosmic mallard sage channeling the Super Duck Elixir and orbital Starlight Feather Beams.',
  },
];

export function Hub3DHeroShowcaseTab() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<VoxelHeroShowcaseStage | null>(null);
  const [selectedHero, setSelectedHero] = useState<PlayableHeroId>('nyx');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let stage: VoxelHeroShowcaseStage | null = null;
    try {
      stage = new VoxelHeroShowcaseStage(mount, selectedHero);
      stageRef.current = stage;
    } catch {
      stageRef.current = null;
    }

    const onResize = (): void => {
      if (stage && mount.clientWidth > 10 && mount.clientHeight > 10) {
        stage.resize(mount.clientWidth, mount.clientHeight);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      stage?.dispose();
      stageRef.current = null;
    };
  }, []);

  const handleSelect = (heroId: PlayableHeroId): void => {
    setSelectedHero(heroId);
    stageRef.current?.selectHero(heroId);
  };

  const activeHero = HERO_CARDS.find((h) => h.id === selectedHero) ?? HERO_CARDS[0];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="space-y-2 lg:col-span-6">
        <div
          ref={mountRef}
          className="h-72 w-full overflow-hidden rounded-xl border border-purple-500/40 bg-slate-950"
        />
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
          <div className="flex items-center gap-2 font-black text-amber-300">
            <Crown className="h-4 w-4" />
            {activeHero.name}
          </div>
          <p className="mt-1 text-slate-300">{activeHero.detail}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-6">
        {HERO_CARDS.map((hero) => (
          <button
            key={hero.id}
            type="button"
            onClick={() => handleSelect(hero.id)}
            className={`rounded-xl border p-3 text-left transition cursor-pointer ${
              selectedHero === hero.id
                ? 'border-amber-400 bg-slate-800'
                : 'border-slate-800 bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-black text-slate-100">{hero.name}</div>
            <div className="mt-0.5 text-[11px] font-bold text-purple-300">{hero.role}</div>
            <p className="mt-1.5 text-[11px] text-slate-400">{hero.detail}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
