/**
 * File 75 / 100 — Interactive Dojo Guide Component (Heroes, Counter-Stance, Alchemy, Bosses, Controls).
 * Strictly typed (ZERO `any`).
 */

import { useState } from 'react';
import { BookOpen, FlaskConical, Shield, Sparkles, Swords } from 'lucide-react';
import { InteractiveDojoGuideView } from './InteractiveDojoGuideView';

type DojoTopicId = 'practice_arena' | 'heroes_4' | 'combat_counter' | 'alchemy_3d' | 'boss_tactics';

export function InteractiveDojoGuide() {
  const [topic, setTopic] = useState<DojoTopicId>('practice_arena');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTopic('practice_arena')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer ${
            topic === 'practice_arena' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Swords className="h-3.5 w-3.5" />
          Live Dojo Arena
        </button>
        <button
          type="button"
          onClick={() => setTopic('heroes_4')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer ${
            topic === 'heroes_4' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          4 Playable Heroes
        </button>
        <button
          type="button"
          onClick={() => setTopic('combat_counter')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer ${
            topic === 'combat_counter' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          Counter-Stance & Portal Rules
        </button>
        <button
          type="button"
          onClick={() => setTopic('alchemy_3d')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer ${
            topic === 'alchemy_3d' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <FlaskConical className="h-3.5 w-3.5" />
          3D BlockCraft Alchemy
        </button>
        <button
          type="button"
          onClick={() => setTopic('boss_tactics')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer ${
            topic === 'boss_tactics' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Dragon & Kraken Tactics
        </button>
      </div>

      {topic === 'practice_arena' && <InteractiveDojoGuideView />}

      {topic === 'heroes_4' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-500/40 bg-slate-900 p-3">
            <h3 className="text-xs font-black text-purple-300">[1] NYX — STARLIGHT CAT MAGE</h3>
            <p className="mt-1 text-xs text-slate-300">
              Wears her signature crooked starry wizard hat in every mode. Excels at Arcane Bolt combos, Starlight Cleave, and 2.5x Perfect-Dodge Backstabs.
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/40 bg-slate-900 p-3">
            <h3 className="text-xs font-black text-amber-300">[2] KING LEO — MAJESTIC GOLDEN LION</h3>
            <p className="mt-1 text-xs text-slate-300">
              Towering 32x32 golden lion with 360° layered mahogany-and-gold mane, 5-point royal crown, and heavy Royal Cleave shockwaves.
            </p>
          </div>
          <div className="rounded-xl border border-slate-500/40 bg-slate-900 p-3">
            <h3 className="text-xs font-black text-slate-200">[3] FENRIR — REFORMED WOLF VANGUARD</h3>
            <p className="mt-1 text-xs text-slate-300">
              After Arc II, joins the Cat-Dog Alliance on the Hero side. Unleashes rapid Frost-Fang rushes and War Horn squad rallies.
            </p>
          </div>
          <div className="rounded-xl border border-cyan-500/40 bg-slate-900 p-3">
            <h3 className="text-xs font-black text-cyan-300">[4] THE GREAT DUCK — COSMIC ALCHEMIST</h3>
            <p className="mt-1 text-xs text-slate-300">
              Master of the Hollow 3D Voxel Cauldron and Super Duck Elixir. Launches orbital Feather Beams and restores party vitality.
            </p>
          </div>
        </div>
      )}

      {topic === 'combat_counter' && (
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300">
          <p>
            <strong className="text-sky-300">Perfect Dodge (Space / Shift):</strong> Dodging within 0.25s of an enemy telegraph slows time briefly and arms a guaranteed <strong className="text-amber-300">2.5x Arcane Crit Backstab</strong>.
          </p>
          <p>
            <strong className="text-amber-300">Strict 3-Condition Exit Portal Lock:</strong> East Portals stay sealed until ALL normal enemies are defeated, the Act Boss (if present) is vanquished, AND all War Banners are captured.
          </p>
          <p>
            <strong className="text-emerald-300">Zero-Shake Discipline:</strong> Normal strikes never rattle the camera (`camShake = 0`); micro-shake triggers only on Boss/Tentacle finishers and can be toggled anytime via Screen Shake ON/OFF.
          </p>
        </div>
      )}

      {topic === 'alchemy_3d' && (
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300">
          <p>
            Visit the <strong className="text-purple-300">3D Voxel Cauldron</strong> tab to brew 50 BlockCraft Alchemy recipes over the crackling oak-log & magma campfire.
          </p>
          <p>
            Upgrading the <strong className="text-amber-300">BlockCraft Alchemy Lab</strong> in the Capital permanently boosts all brewed flask potency by +8% per level.
          </p>
        </div>
      )}

      {topic === 'boss_tactics' && (
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-300">
          <p>
            <strong className="text-orange-300">Arc III Dragon Sky-Siege:</strong> Man Harpoon Ballistas to shatter Ignis-Bahamut’s wings, ground the dragon, and expose its glowing Starlight Chest Core.
          </p>
          <p>
            <strong className="text-cyan-300">Arc IV Kraken Tentacles:</strong> Strike glowing cyan Weak-Spot Rings for <strong className="text-amber-300">2.5x SLICE CRIT!</strong> Every severed tentacle drops <strong className="text-emerald-300">2 Golden Healing Fish</strong> and deals <strong className="text-rose-300">10% Max HP Shock-Stagger</strong> directly to Charybdis.
          </p>
        </div>
      )}
    </div>
  );
}
