import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type DrawToolDescriptor = {
  description: string;
  icon: IconDefinition;
  name: string;
  onMouseDown: (event: MouseEvent, data: DrawToolListenerData) => void;
  shortcuts?: readonly {
    description: string;
    handler: (event: KeyboardEvent, data: DrawToolListenerData) => void | false;
    keyStr: string;
  }[];
};

export type DrawToolListenerData = {
  mainCanvas: HTMLCanvasElement;
  overlayCanvas: HTMLCanvasElement;
  snapshot: () => void;
  viewportElement: HTMLDivElement;
};
