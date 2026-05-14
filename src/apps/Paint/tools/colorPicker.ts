import { faEyeDropper } from '@fortawesome/free-solid-svg-icons/faEyeDropper';

import { MAIN_BUTTON, SECONDARY_BUTTON } from '../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../types/DrawToolDescriptor';
import { getCanvasContext } from '../utils/getCanvasContext';

type ColorPickerState = {
  activeSwatch: 'fill' | 'stroke';
};

export const colorPickerDescriptor = {
  description: 'Color picker',
  icon: faEyeDropper,
  initialState: {
    activeSwatch: 'stroke',
  },
  name: 'colorPicker' as const,
  onMouseDown: handlePicker,
  shortcut: 'i',
} satisfies DrawToolDescriptor<ColorPickerState>;

function handlePicker({
  event,
  mainCanvas,
  position: { x, y },
  setSharedState,
}: DrawToolListenerData<ColorPickerState>) {
  const context = getCanvasContext(mainCanvas);
  const imageData = context.getImageData(x, y, 1, 1).data;
  const hex = `#${[imageData[0], imageData[1], imageData[2]]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;

  if (event.button === MAIN_BUTTON) {
    setSharedState((state) => ({ ...state, strokeColor: hex }));
  } else if (event.button === SECONDARY_BUTTON) {
    setSharedState((state) => ({ ...state, fillColor: hex }));
  }
}
