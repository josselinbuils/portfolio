import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type ToolDescriptor = {
  description: string;
  icon: IconDefinition;
  name: string;
  onDeactivate?: (data: ToolListenerData) => void;
  onMouseDown: (event: MouseEvent, data: ToolListenerData) => void;
  shortcuts?: readonly {
    description: string;
    handler: (event: KeyboardEvent, data: ToolListenerData) => void | false;
    keyStr: string;
  }[];
};

export type ToolListenerData = {
  mainCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  snapshot: () => void;
  viewportElement: HTMLDivElement;
};
