export type CellType = 'empty' | 'wall' | 'door' | 'sofa-single' | 'sofa-rect-h' | 'sofa-rect-v' | 'sofa-l-0' | 'sofa-l-90' | 'sofa-l-180' | 'sofa-l-270';
export type Position = { x: number; y: number };
export type SofaType = 'single' | 'rectangular' | 'l-shaped';
export type Rotation = 0 | 90 | 180 | 270;

export interface SofaPiece {
  type: SofaType;
  position: Position;
  rotation: Rotation;
  id: number;
}

export interface SofaInventory {
  single: number;
  rectangular: number;
  'l-shaped': number;
}

export interface Level {
  width: number;
  height: number;
  walls: Position[];
  doorPosition: Position;
  name: string;
  inventory: SofaInventory;
}