import { create } from 'zustand/react';

type DrawState = {
  lineWidth: number;
};

export const useDrawStore = create<DrawState>(() => ({
  lineWidth: 3,
}));
