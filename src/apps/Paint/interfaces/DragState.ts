import { type DrawTool } from './DrawTool';

export interface DragState {
  baseDx?: number;
  baseDy?: number;
  kind: 'marquee' | 'path' | 'selmove' | 'shape';
  startX?: number;
  startY?: number;
  tool?: DrawTool;
  x0?: number;
  y0?: number;
}
