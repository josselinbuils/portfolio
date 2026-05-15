import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { type SharedState } from './SharedState';

export type DrawToolDescriptor<DrawToolState = any> = {
  description: string;
  icon: IconDefinition;
  initialState: DrawToolState;
  name: string;
  onMouseDown: (
    event: MouseEvent,
    data: DrawToolListenerData<DrawToolState>,
  ) => void;
  shortcuts?: readonly {
    description: string;
    handler: (
      event: KeyboardEvent,
      data: DrawToolListenerData<DrawToolState>,
    ) => void | false;
    keyStr: string;
  }[];
};

export type DrawToolListenerData<DrawToolState = unknown> = {
  getSharedState: () => SharedState;
  getToolState: () => DrawToolState;
  mainCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  setSharedState: StateSetterDispatch<SharedState>;
  setToolState: StateSetterDispatch<DrawToolState>;
  snapshot: () => void;
  viewportInner: HTMLDivElement;
};

export type StateSetterDispatch<State> = (
  setter: (state: State) => State,
) => void;
