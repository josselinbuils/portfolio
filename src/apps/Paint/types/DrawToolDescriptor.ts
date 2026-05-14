import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { type SharedState } from './SharedState';

export type DrawToolDescriptor<DrawToolState = any> = {
  description: string;
  icon: IconDefinition;
  initialState: DrawToolState;
  name: string;
  onMouseDown: (data: DrawToolListenerData<DrawToolState>) => void;
  shortcut: string;
};

export type DrawToolListenerData<DrawToolState = unknown> = {
  event: MouseEvent;
  getSharedState: () => SharedState;
  getToolState: () => DrawToolState;
  mainCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  position: { x: number; y: number };
  setSharedState: StateSetterDispatch<SharedState>;
  setToolState: StateSetterDispatch<DrawToolState>;
  snapshot: () => void;
  stageInner: HTMLDivElement;
};

export type StateSetterDispatch<State> = (
  setter: (state: State) => State,
) => void;
