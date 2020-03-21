import { RefObject } from 'react';
import { MouseButton } from '~/platform/constants';
import { MouseTool } from '../../../constants';
import { Viewport } from '../../../models';
import {
  startPaging,
  startPan,
  startRotate,
  startWindowing,
  startZoom
} from './tools';

export function startTool(
  downEvent: MouseEvent,
  activeLeftTool: MouseTool,
  activeRightTool: MouseTool,
  viewport: Viewport,
  viewportElementRef: RefObject<HTMLElement>
): void {
  downEvent.preventDefault();

  const isMacOS = navigator.platform.indexOf('Mac') !== -1;
  let tool: MouseTool;

  switch (downEvent.button) {
    case MouseButton.Left:
      tool = activeLeftTool;
      break;
    case MouseButton.Middle:
      tool = MouseTool.Pan;
      break;
    case MouseButton.Right:
      tool = activeRightTool;
      break;
    default:
      throw new Error('Unknown button');
  }

  let moveListener: (moveEvent: MouseEvent) => void;

  switch (tool) {
    case MouseTool.Paging:
      moveListener = startPaging(viewport, downEvent);
      break;
    case MouseTool.Pan:
      moveListener = startPan(viewport, downEvent);
      break;
    case MouseTool.Rotate:
      if (viewportElementRef.current === null) {
        return;
      }
      const viewportClientRect = viewportElementRef.current.getBoundingClientRect();
      moveListener = startRotate(viewport, downEvent, viewportClientRect);
      break;
    case MouseTool.Windowing:
      moveListener = startWindowing(viewport, downEvent);
      break;
    case MouseTool.Zoom:
      moveListener = startZoom(viewport, downEvent);
      break;
    default:
      throw new Error('Unknown tool');
  }

  window.addEventListener('mousemove', moveListener);

  if (
    [MouseButton.Left, MouseButton.Middle].includes(downEvent.button) ||
    isMacOS
  ) {
    const upListener = () => {
      window.removeEventListener('mousemove', moveListener);
      window.removeEventListener('mouseup', upListener);
    };
    window.addEventListener('mouseup', upListener);
  }

  if (downEvent.button === MouseButton.Right && !isMacOS) {
    const contextMenuListener = () => {
      window.removeEventListener('mousemove', moveListener);
      window.removeEventListener('contextmenu', contextMenuListener);
    };
    window.addEventListener('contextmenu', contextMenuListener);
  }
}
