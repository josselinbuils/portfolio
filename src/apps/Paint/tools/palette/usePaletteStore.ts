import { create } from 'zustand/react';

type PaletteState = {
  fillColor: string;
  strokeColor: string;
};

export const usePaletteStore = create<PaletteState>(() => ({
  fillColor: '#ffffff',
  strokeColor: '#000000',
}));
