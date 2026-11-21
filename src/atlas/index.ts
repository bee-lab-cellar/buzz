import type { AtlasActEntry } from './atlasTypes';
import { VOL01_ACTS } from './vol01_acts001to010';
import { VOL02_ACTS } from './vol02_acts011to020';
import { VOL03_ACTS } from './vol03_acts021to030';
import { VOL04_ACTS } from './vol04_acts031to040';
import { VOL05_ACTS } from './vol05_acts041to050';
import { VOL06_ACTS } from './vol06_acts051to060';
import { VOL07_ACTS } from './vol07_acts061to070';
import { VOL08_ACTS } from './vol08_acts071to080';
import { VOL09_ACTS } from './vol09_acts081to090';
import { VOL10_ACTS } from './vol10_acts091to100';
import { VOL11_ACTS } from './vol11_acts101to110';
import { VOL12_ACTS } from './vol12_acts111to120';
import { VOL13_ACTS } from './vol13_acts121to130';
import { VOL14_ACTS } from './vol14_acts131to140';
import { VOL15_ACTS } from './vol15_acts141to150';
import { VOL16_ACTS } from './vol16_acts151to160';
import { VOL17_ACTS } from './vol17_acts161to170';
import { VOL18_ACTS } from './vol18_acts171to180';
import { VOL19_ACTS } from './vol19_acts181to190';
import { VOL20_ACTS } from './vol20_acts191to200';
import { VOL21_ACTS } from './vol21_acts201to210';
import { VOL22_ACTS } from './vol22_acts211to220';
import { VOL23_ACTS } from './vol23_acts221to230';
import { VOL24_ACTS } from './vol24_acts231to240';
import { VOL25_ACTS } from './vol25_acts241to250';
import { VOL26_ACTS } from './vol26_acts251to260';
import { VOL27_ACTS } from './vol27_acts261to270';
import { VOL28_ACTS } from './vol28_acts271to280';
import { VOL29_ACTS } from './vol29_acts281to290';
import { VOL30_ACTS } from './vol30_acts291to300';

export * from './atlasTypes';
export {
  VOL01_ACTS,
  VOL02_ACTS,
  VOL03_ACTS,
  VOL04_ACTS,
  VOL05_ACTS,
  VOL06_ACTS,
  VOL07_ACTS,
  VOL08_ACTS,
  VOL09_ACTS,
  VOL10_ACTS,
  VOL11_ACTS,
  VOL12_ACTS,
  VOL13_ACTS,
  VOL14_ACTS,
  VOL15_ACTS,
  VOL16_ACTS,
  VOL17_ACTS,
  VOL18_ACTS,
  VOL19_ACTS,
  VOL20_ACTS,
  VOL21_ACTS,
  VOL22_ACTS,
  VOL23_ACTS,
  VOL24_ACTS,
  VOL25_ACTS,
  VOL26_ACTS,
  VOL27_ACTS,
  VOL28_ACTS,
  VOL29_ACTS,
  VOL30_ACTS,
};

export const ALL_300_ATLAS_VOLUMES: ReadonlyArray<ReadonlyArray<AtlasActEntry>> = [
  VOL01_ACTS,
  VOL02_ACTS,
  VOL03_ACTS,
  VOL04_ACTS,
  VOL05_ACTS,
  VOL06_ACTS,
  VOL07_ACTS,
  VOL08_ACTS,
  VOL09_ACTS,
  VOL10_ACTS,
  VOL11_ACTS,
  VOL12_ACTS,
  VOL13_ACTS,
  VOL14_ACTS,
  VOL15_ACTS,
  VOL16_ACTS,
  VOL17_ACTS,
  VOL18_ACTS,
  VOL19_ACTS,
  VOL20_ACTS,
  VOL21_ACTS,
  VOL22_ACTS,
  VOL23_ACTS,
  VOL24_ACTS,
  VOL25_ACTS,
  VOL26_ACTS,
  VOL27_ACTS,
  VOL28_ACTS,
  VOL29_ACTS,
  VOL30_ACTS,
];

export const ALL_300_ATLAS_ACTS: AtlasActEntry[] = [
  ...VOL01_ACTS,
  ...VOL02_ACTS,
  ...VOL03_ACTS,
  ...VOL04_ACTS,
  ...VOL05_ACTS,
  ...VOL06_ACTS,
  ...VOL07_ACTS,
  ...VOL08_ACTS,
  ...VOL09_ACTS,
  ...VOL10_ACTS,
  ...VOL11_ACTS,
  ...VOL12_ACTS,
  ...VOL13_ACTS,
  ...VOL14_ACTS,
  ...VOL15_ACTS,
  ...VOL16_ACTS,
  ...VOL17_ACTS,
  ...VOL18_ACTS,
  ...VOL19_ACTS,
  ...VOL20_ACTS,
  ...VOL21_ACTS,
  ...VOL22_ACTS,
  ...VOL23_ACTS,
  ...VOL24_ACTS,
  ...VOL25_ACTS,
  ...VOL26_ACTS,
  ...VOL27_ACTS,
  ...VOL28_ACTS,
  ...VOL29_ACTS,
  ...VOL30_ACTS,
];

const ATLAS_BY_ACT_ID = new Map<number, AtlasActEntry>(
  ALL_300_ATLAS_ACTS.map((entry) => [entry.actId, entry]),
);

export function getAtlasAct(actId: number): AtlasActEntry {
  const clamped = Math.max(1, Math.min(300, Math.floor(actId)));
  return ATLAS_BY_ACT_ID.get(clamped) ?? VOL01_ACTS[0];
}

export function getAtlasActsByArc(arc: 1 | 2 | 3 | 4 | 5 | 6): AtlasActEntry[] {
  return ALL_300_ATLAS_ACTS.filter((entry) => entry.arc === arc);
}
