/**
 * File 10 / 100 — 2D Cellular Automata Fluid, Fire, Lava, Water, Acid & BlockCraft Elemental Reaction Engine.
 *
 * Simulates real-time cellular interactions over a 24x14 (or configurable) grid:
 * - Water + Lava -> Solid Obsidian Bridge + Rising Steam cloud!
 * - Water + Fire -> Extinguished Steam cloud!
 * - Fire spreads to adjacent flammable fuel cells & cools over time into Smoke.
 * - Acid erodes low-temp solids or reacts with Lava into Toxic Smoke.
 * - Gravity & lateral dispersion for liquids (`water`, `lava`, `acid`) and upward rise for gases (`steam`, `smoke`).
 * Zero `any` types.
 */

import type { CellularFluidCell, FluidPhase } from '../types/math';

export interface ElementalReactionEvent {
  readonly col: number;
  readonly row: number;
  readonly reaction: 'lava_water_obsidian' | 'fire_extinguished_steam' | 'acid_lava_smoke';
}

export class CellularFluidAndFireSim {
  public readonly cols: number;
  public readonly rows: number;
  private readonly cells: CellularFluidCell[];
  private tickCounter = 0;

  constructor(cols = 24, rows = 14) {
    this.cols = Math.max(4, cols);
    this.rows = Math.max(4, rows);
    this.cells = new Array<CellularFluidCell>(this.cols * this.rows);
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i] = {
        phase: 'empty',
        temperature: 22,
        fuel: 0,
        updatedThisTick: false,
      };
    }
  }

  private idx(col: number, row: number): number {
    return row * this.cols + col;
  }

  public inBounds(col: number, row: number): boolean {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  public getCell(col: number, row: number): CellularFluidCell | null {
    if (!this.inBounds(col, row)) return null;
    return this.cells[this.idx(col, row)];
  }

  public setCell(col: number, row: number, phase: FluidPhase, fuel = 0): void {
    if (!this.inBounds(col, row)) return;
    const cell = this.cells[this.idx(col, row)];
    cell.phase = phase;
    cell.fuel = fuel;
    switch (phase) {
      case 'lava':
        cell.temperature = 1100;
        break;
      case 'fire':
        cell.temperature = 650;
        cell.fuel = Math.max(fuel, 6);
        break;
      case 'steam':
        cell.temperature = 115;
        cell.fuel = Math.max(fuel, 4);
        break;
      case 'smoke':
        cell.temperature = 90;
        cell.fuel = Math.max(fuel, 4);
        break;
      case 'water':
        cell.temperature = 18;
        break;
      case 'acid':
        cell.temperature = 35;
        break;
      case 'obsidian':
        cell.temperature = 140;
        break;
      default:
        cell.temperature = 22;
        break;
    }
  }

  public countPhase(phase: FluidPhase): number {
    let count = 0;
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].phase === phase) count += 1;
    }
    return count;
  }

  public injectSplash(centerCol: number, centerRow: number, radius: number, phase: FluidPhase): void {
    const rCeil = Math.ceil(radius);
    for (let dy = -rCeil; dy <= rCeil; dy++) {
      for (let dx = -rCeil; dx <= rCeil; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          this.setCell(centerCol + dx, centerRow + dy, phase, phase === 'fire' ? 8 : 0);
        }
      }
    }
  }

  private swap(c1: number, r1: number, c2: number, r2: number): void {
    const i1 = this.idx(c1, r1);
    const i2 = this.idx(c2, r2);
    const tmp = this.cells[i1];
    this.cells[i1] = this.cells[i2];
    this.cells[i2] = tmp;
    this.cells[i1].updatedThisTick = true;
    this.cells[i2].updatedThisTick = true;
  }

  public step(): ReadonlyArray<ElementalReactionEvent> {
    this.tickCounter += 1;
    const reactions: ElementalReactionEvent[] = [];

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].updatedThisTick = false;
    }

    const neighbors: ReadonlyArray<readonly [number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];

    // Pass 1: Elemental Reactions (Water + Lava -> Obsidian + Steam, Water + Fire -> Steam, Acid + Lava -> Smoke)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[this.idx(c, r)];
        if (cell.phase === 'lava') {
          for (let d = 0; d < neighbors.length; d++) {
            const nc = c + neighbors[d][0];
            const nr = r + neighbors[d][1];
            if (!this.inBounds(nc, nr)) continue;
            const nb = this.cells[this.idx(nc, nr)];
            if (nb.phase === 'water') {
              this.setCell(c, r, 'obsidian');
              this.setCell(nc, nr, 'steam', 5);
              reactions.push({ col: c, row: r, reaction: 'lava_water_obsidian' });
              break;
            }
            if (nb.phase === 'acid') {
              this.setCell(nc, nr, 'smoke', 5);
              reactions.push({ col: nc, row: nr, reaction: 'acid_lava_smoke' });
            }
          }
        } else if (cell.phase === 'fire') {
          let extinguished = false;
          for (let d = 0; d < neighbors.length; d++) {
            const nc = c + neighbors[d][0];
            const nr = r + neighbors[d][1];
            if (!this.inBounds(nc, nr)) continue;
            const nb = this.cells[this.idx(nc, nr)];
            if (nb.phase === 'water') {
              this.setCell(c, r, 'steam', 4);
              reactions.push({ col: c, row: r, reaction: 'fire_extinguished_steam' });
              extinguished = true;
              break;
            }
            if (nb.phase === 'empty' && nb.fuel > 0) {
              this.setCell(nc, nr, 'fire', nb.fuel);
            }
          }
          if (!extinguished) {
            cell.fuel -= 1;
            if (cell.fuel <= 0) {
              this.setCell(c, r, 'smoke', 3);
            }
          }
        }
      }
    }

    // Pass 2: Liquid downward/lateral flow (bottom-up scan)
    const dirOrder = this.tickCounter % 2 === 0 ? [1, -1] : [-1, 1];
    for (let r = this.rows - 1; r >= 0; r--) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[this.idx(c, r)];
        if (cell.updatedThisTick) continue;
        if (cell.phase === 'water' || cell.phase === 'lava' || cell.phase === 'acid') {
          if (r + 1 < this.rows && this.cells[this.idx(c, r + 1)].phase === 'empty') {
            this.swap(c, r, c, r + 1);
            continue;
          }
          let moved = false;
          for (let k = 0; k < dirOrder.length; k++) {
            const nc = c + dirOrder[k];
            if (this.inBounds(nc, r + 1) && this.cells[this.idx(nc, r + 1)].phase === 'empty') {
              this.swap(c, r, nc, r + 1);
              moved = true;
              break;
            }
          }
          if (!moved) {
            for (let k = 0; k < dirOrder.length; k++) {
              const nc = c + dirOrder[k];
              if (this.inBounds(nc, r) && this.cells[this.idx(nc, r)].phase === 'empty') {
                this.swap(c, r, nc, r);
                break;
              }
            }
          }
        }
      }
    }

    // Pass 3: Gas rise & dissipation (top-down scan)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.cells[this.idx(c, r)];
        if (cell.updatedThisTick) continue;
        if (cell.phase === 'steam' || cell.phase === 'smoke') {
          cell.fuel -= 1;
          if (cell.fuel <= 0) {
            this.setCell(c, r, 'empty');
            continue;
          }
          if (r > 0 && this.cells[this.idx(c, r - 1)].phase === 'empty') {
            this.swap(c, r, c, r - 1);
          }
        }
      }
    }

    return reactions;
  }
}
