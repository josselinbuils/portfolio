import { faEyeDropper } from '@fortawesome/free-solid-svg-icons/faEyeDropper';

import type { DrawToolDescriptor } from '../types/DrawToolDescriptor';

export const colorPickerDescriptor = {
  description: 'Color picker',
  icon: faEyeDropper,
  name: 'colorPicker' as const,
  shortcut: 'i',
} satisfies DrawToolDescriptor;

export type ColorPickerRefs = {
  activeSwatchRef: { current: 'fill' | 'stroke' };
  mainRef: { current: HTMLCanvasElement | null };
};

export function handlePicker(
  refs: ColorPickerRefs,
  p: { x: number; y: number },
  setFill: (color: string) => void,
  setStroke: (color: string) => void,
): void {
  const mctx = refs.mainRef.current!.getContext('2d')!;
  const px = mctx.getImageData(p.x, p.y, 1, 1).data;
  const hex =
    '#' +
    [px[0], px[1], px[2]].map((n) => n.toString(16).padStart(2, '0')).join('');
  if (refs.activeSwatchRef.current === 'fill') setFill(hex);
  else setStroke(hex);
}
