import { MouseButton } from '~/platform/constants';
import { MouseTool } from '../constants';
import type { Viewport } from '../models/Viewport';

export async function startTool(
  downEvent: MouseEvent,
  viewport: Viewport,
  activeLeftTool: MouseTool,
  activeMiddleTool?: MouseTool,
  activeRightTool?: MouseTool,
  onUpdate: (tool: MouseTool, ...additionalArgs: any[]) => void = () => {}
): Promise<void> {
  downEvent.preventDefault();

  const isMacOS = navigator.platform.indexOf('Mac') !== -1;
  let tool: MouseTool | undefined;

  switch (downEvent.button) {
    case MouseButton.Left:
      tool = activeLeftTool;
      break;

    case MouseButton.Middle:
      tool = activeMiddleTool;
      break;

    case MouseButton.Right:
      tool = activeRightTool;
      break;

    default:
      throw new Error('Unknown mouse button');
  }

  if (tool === undefined) {
    return;
  }

  const handleToolUpdate = (...args: any[]) =>
    onUpdate(tool as MouseTool, ...args);
  let moveListener: (moveEvent: MouseEvent) => void;

  switch (tool) {
    case MouseTool.Paging: {
      const { startPaging } = await import('./tools/startPaging');
      moveListener = startPaging(viewport, downEvent);
      break;
    }

    case MouseTool.Pan: {
      const { startPan } = await import('./tools/startPan');
      moveListener = startPan(viewport, downEvent);
      break;
    }

    case MouseTool.Rotate: {
      const { startRotate } = await import('./tools/startRotate');
      moveListener = startRotate(viewport, downEvent, handleToolUpdate);
      break;
    }

    case MouseTool.Windowing: {
      const { startWindowing } = await import('./tools/startWindowing');
      moveListener = startWindowing(viewport, downEvent, handleToolUpdate);
      break;
    }

    case MouseTool.Zoom: {
      const { startZoom } = await import('./tools/startZoom');
      moveListener = startZoom(viewport, downEvent, handleToolUpdate);
      break;
    }

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
