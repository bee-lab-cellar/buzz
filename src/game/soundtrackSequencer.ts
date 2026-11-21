export interface ChiptuneTrackMeta {
  id: number;
  title: string;
  arc: string;
  bpm: number;
  themeKey: 'calm' | 'adventure' | 'sanctuary' | 'boss' | 'final';
}

export const OST_30_TRACKS: ChiptuneTrackMeta[] = [
  { id: 1, title: '01. Crown of Starlight (Title Overture)', arc: 'Prologue', bpm: 112, themeKey: 'calm' },
  { id: 2, title: '02. Whispering Citadel Gates', arc: 'Arc I: Forest', bpm: 128, themeKey: 'adventure' },
  { id: 3, title: '03. Bramble Ravine Ambush', arc: 'Arc I: Forest', bpm: 134, themeKey: 'adventure' },
  { id: 4, title: '04. Bioluminescent Spore Waltz', arc: 'Arc I: Grotto', bpm: 120, themeKey: 'calm' },
  { id: 5, title: '05. Crimson Canopy Rope-Walk', arc: 'Arc I: Autumn', bpm: 136, themeKey: 'adventure' },
  { id: 6, title: '06. Permafrost Crystal Echoes', arc: 'Arc I: Frostpeak', bpm: 124, themeKey: 'adventure' },
  { id: 7, title: '07. Embercrag Smelter March', arc: 'Arc I: Volcanic', bpm: 140, themeKey: 'boss' },
  { id: 8, title: '08. Miasma Bog & Hydra Reedbeds', arc: 'Arc I: Marsh', bpm: 130, themeKey: 'adventure' },
  { id: 9, title: '09. Sacred Lotus Pond of the Great Duck', arc: 'Arc I: Act 40 Sanctuary', bpm: 98, themeKey: 'sanctuary' },
  { id: 10, title: '10. Usurper King Fenrir (Throne Showdown)', arc: 'Arc I: Act 41 Finale', bpm: 156, themeKey: 'final' },
  { id: 11, title: '11. Drums of the Shattered Border', arc: 'Arc II: Cat-Dog War', bpm: 142, themeKey: 'adventure' },
  { id: 12, title: '12. River of Claws Naval Bridgehead', arc: 'Arc II: Cat-Dog War', bpm: 138, themeKey: 'adventure' },
  { id: 13, title: '13. Sky-Galleon Paratrooper Ridge', arc: 'Arc II: Cat-Dog War', bpm: 145, themeKey: 'adventure' },
  { id: 14, title: '14. Iron-Collar Steam Foundry', arc: 'Arc II: Cat-Dog War', bpm: 148, themeKey: 'boss' },
  { id: 15, title: '15. Supreme War Council Pavilion', arc: 'Arc II: Act 81 Sanctuary', bpm: 104, themeKey: 'sanctuary' },
  { id: 16, title: '16. Obsidian Colosseum: Ragnarok III', arc: 'Arc II: Act 82 Finale', bpm: 162, themeKey: 'final' },
  { id: 17, title: '17. Ashes of the Broken Treaty', arc: 'Arc III: Dragon Cataclysm', bpm: 144, themeKey: 'adventure' },
  { id: 18, title: '18. Molten Bullion & Greed-Maw Vaults', arc: 'Arc III: Dragon Cataclysm', bpm: 146, themeKey: 'adventure' },
  { id: 19, title: '19. Riding the World-Breaker’s Spine', arc: 'Arc III: Dragon Mount', bpm: 158, themeKey: 'boss' },
  { id: 20, title: '20. Ignis-Bahamut: Supernova Sky-Throne', arc: 'Arc III: Act 122 Finale', bpm: 168, themeKey: 'final' },
  { id: 21, title: '21. Sunken Coral Citadel & Oxygen Bubbles', arc: 'Arc IV: Abyssal Kraken', bpm: 126, themeKey: 'adventure' },
  { id: 22, title: '22. Broadside Cannons of the Cat-Galleon', arc: 'Arc IV: Naval Armada', bpm: 148, themeKey: 'boss' },
  { id: 23, title: '23. Siren Song of the Whirlpool Lagoon', arc: 'Arc IV: Abyssal Kraken', bpm: 118, themeKey: 'calm' },
  { id: 24, title: '24. Charybdis: 8-Tentacle Hadal Maelstrom', arc: 'Arc IV: Act 180 Finale', bpm: 166, themeKey: 'final' },
  { id: 25, title: '25. Brass-Gear Sky-Docks & Pendulums', arc: 'Arc V: Clockwork Mecha', bpm: 140, themeKey: 'adventure' },
  { id: 26, title: '26. Cyber-Rat Neon Monorail Overdrive', arc: 'Arc V: Clockwork Mecha', bpm: 152, themeKey: 'adventure' },
  { id: 27, title: '27. Chronos-Omega: Rewind the Horologium', arc: 'Arc V: Act 240 Finale', bpm: 170, themeKey: 'final' },
  { id: 28, title: '28. Zero-G Asteroid Shrines & Black Holes', arc: 'Arc VI: Void Multiverse', bpm: 144, themeKey: 'adventure' },
  { id: 29, title: '29. Duel of the Twin Starlight Cats (Act 280)', arc: 'Arc VI: Mirror Nyx', bpm: 164, themeKey: 'boss' },
  { id: 30, title: '30. AETHER-NULL: The Eclipse Singularity', arc: 'Arc VI: Act 300 True Finale', bpm: 176, themeKey: 'final' },
];

export function getTrackForAct(actNum: number, role: string): ChiptuneTrackMeta {
  if (actNum === 300) return OST_30_TRACKS[29];
  if (actNum === 280) return OST_30_TRACKS[28];
  if (actNum >= 241) return role === 'sanctuary' ? OST_30_TRACKS[8] : OST_30_TRACKS[27];
  if (actNum === 240) return OST_30_TRACKS[26];
  if (actNum >= 195 && actNum <= 208) return OST_30_TRACKS[25];
  if (actNum >= 181) return role === 'sanctuary' ? OST_30_TRACKS[14] : OST_30_TRACKS[24];
  if (actNum === 180) return OST_30_TRACKS[23];
  if (actNum >= 151 && actNum <= 157) return OST_30_TRACKS[22];
  if (actNum >= 130 && actNum <= 136) return OST_30_TRACKS[21];
  if (actNum >= 123) return role === 'sanctuary' ? OST_30_TRACKS[8] : OST_30_TRACKS[20];
  if (actNum === 122) return OST_30_TRACKS[19];
  if (actNum >= 83) return role === 'sanctuary' ? OST_30_TRACKS[14] : OST_30_TRACKS[16];
  if (actNum === 82) return OST_30_TRACKS[15];
  if (actNum === 81) return OST_30_TRACKS[14];
  if (actNum >= 42) return OST_30_TRACKS[10 + ((actNum - 42) % 4)];
  if (actNum === 41) return OST_30_TRACKS[9];
  if (actNum === 40) return OST_30_TRACKS[8];
  return OST_30_TRACKS[1 + (Math.floor((actNum - 1) / 5) % 7)];
}

// ============================================================================
// BASE64 SAVE VAULT ("COTC1:...") + DUAL-LAYER INDEXEDDB PERSISTENCE
// ============================================================================
const DB_NAME = 'ClawsOfTheCrownOmniverseDB';
const STORE_NAME = 'saves';

export function exportSaveToCode(rawJsonString: string): string {
  try {
    const encoded = btoa(encodeURIComponent(rawJsonString));
    return `COTC1:${encoded}`;
  } catch {
    return '';
  }
}

export function importSaveFromCode(code: string): string | null {
  try {
    const trimmed = code.trim();
    const payload = trimmed.startsWith('COTC1:') ? trimmed.slice(6) : trimmed;
    const json = decodeURIComponent(atob(payload));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || !parsed.player) return null;
    return json;
  } catch {
    return null;
  }
}

export function mirrorSaveToIndexedDB(key: string, rawJsonString: string): void {
  if (typeof indexedDB === 'undefined') return;
  try {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(rawJsonString, key);
    };
  } catch {
    // Ignore IndexedDB quota/privacy errors
  }
}
