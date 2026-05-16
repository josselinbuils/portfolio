import { faEyeDropper } from '@fortawesome/free-solid-svg-icons/faEyeDropper';

import { MAIN_BUTTON, SECONDARY_BUTTON } from '../../constants';
import {
  type DrawToolDescriptor,
  type DrawToolListenerData,
} from '../../types/DrawToolDescriptor';
import { getCanvasContext } from '../../utils/getCanvasContext';
import { getPositionInCanvas } from '../../utils/getPositionInCanvas';
import { usePaletteStore } from './usePaletteStore';

export const colorPickerDescriptor = {
  description: 'Color picker',
  icon: faEyeDropper,
  name: 'colorPicker' as const,
  onMouseDown: handlePicker,
} satisfies DrawToolDescriptor;

function handlePicker(event: MouseEvent, { mainCanvas }: DrawToolListenerData) {
  const context = getCanvasContext(mainCanvas);
  const { x, y } = getPositionInCanvas(event, mainCanvas);
  const imageData = context.getImageData(x, y, 1, 1).data;
  const hex = `#${[imageData[0], imageData[1], imageData[2]]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')}`;

  if (event.button === MAIN_BUTTON) {
    usePaletteStore.setState({ strokeColor: hex });
  } else if (event.button === SECONDARY_BUTTON) {
    usePaletteStore.setState({ fillColor: hex });
  }
}
