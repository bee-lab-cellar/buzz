export type SpriteFrame8Name =
  | 'idle1'
  | 'idle2'
  | 'walk1'
  | 'walk2'
  | 'walk3'
  | 'walk4'
  | 'attack1'
  | 'attack2';

export interface SpriteSheet8Frame {
  id: string;
  width: number;
  height: number;
  palette: Record<string, string>;
  frames: Record<SpriteFrame8Name, string[]>;
}

export interface ArticulatedDragonMatrices {
  bossId: string;
  name: string;
  width: number;
  height: number;
  palette: Record<string, string>;
  head: Record<SpriteFrame8Name, string[]>;
  leftWing: Record<SpriteFrame8Name, string[]>;
  rightWing: Record<SpriteFrame8Name, string[]>;
  severableTail: Record<SpriteFrame8Name, string[]>;
  chestCore: Record<SpriteFrame8Name, string[]>;
}

export function renderPixelMatrixToCanvas(
  frameRows: string[],
  palette: Record<string, string>,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < frameRows.length && y < height; y++) {
    const row = frameRows[y];
    for (let x = 0; x < row.length && x < width; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const color = palette[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return canvas;
}
