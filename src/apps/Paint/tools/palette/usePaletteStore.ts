import { create } from 'zustand/react';

type PaletteState = {
  fillColor: string;
  strokeColor: string;
  swatches: string[];
};

const PRESET_PALETTE = [
  '#000000',
  '#3f3f3f',
  '#7f7f7f',
  '#bfbfbf',
  '#ffffff',
  '#e20000',
  '#ff4501',
  '#cc7832',
  '#f1c40f',
  '#27ae60',
  '#16a085',
  '#00aaff',
  '#007ad8',
  '#0044cc',
  '#8e44ad',
  '#c0399b',
  '#d35400',
  '#ecf0f1',
  '#222831',
];

export const usePaletteStore = create<PaletteState>(() => ({
  fillColor: '#ffffff',
  strokeColor: '#000000',
  swatches: PRESET_PALETTE,
}));
