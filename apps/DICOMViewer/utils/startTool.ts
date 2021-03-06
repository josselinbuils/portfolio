import { MouseButton } from '~/platform/constants';
import { MouseTool } from '../constants';
import { Viewport } from '../models/Viewport';
import { startPaging } from './tools/startPaging';
import { startPan } from './tools/startPan';
import { startRotate } from './tools/startRotate';
import { startWindowing } from './tools/startWindowing';
import { startZoom } from './tools/startZoom';

export function startTool(
  downEvent: MouseEvent,
  viewport: Viewport,
  activeLeftTool: MouseTool,
  activeMiddleTool?: MouseTool,
  activeRightTool?: MouseTool,
  onUpdate: (tool: MouseTool, ...additionalArgs: any[]) => void = () => {}
): void {
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
    case MouseTool.Paging:
      moveListener = startPaging(viewport, downEvent);
      break;
    case MouseTool.Pan:
      moveListener = startPan(viewport, downEvent);
      break;
    case MouseTool.Rotate:
      moveListener = startRotate(viewport, downEvent, handleToolUpdate);
      break;
    case MouseTool.Windowing:
      moveListener = startWindowing(viewport, downEvent, handleToolUpdate);
      break;
    case MouseTool.Zoom:
      moveListener = startZoom(viewport, downEvent, handleToolUpdate);
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
