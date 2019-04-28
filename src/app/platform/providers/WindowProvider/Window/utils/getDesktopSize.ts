import { Size } from '~/platform/interfaces';
import { TASKBAR_WIDTH } from '../../constants';

export function getDesktopSize(): Size {
  return {
    width: window.innerWidth - TASKBAR_WIDTH,
    height: window.innerHeight
  };
}
