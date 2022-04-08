declare module 'dicom-parser';

declare class ResizeObserver {
  disconnect: () => void;
  observe: (target: Element, options?: ResizeObserverObserveOptions) => void;
  unobserve: (target: Element) => void;
  constructor(callback: ResizeObserverCallback);
}

interface ResizeObserverObserveOptions {
  box?: 'content-box' | 'border-box';
}

type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver
) => void;

interface ResizeObserverEntry {
  readonly borderBoxSize: ResizeObserverEntryBoxSize;
  readonly contentBoxSize: ResizeObserverEntryBoxSize;
  readonly contentRect: DOMRectReadOnly;
  readonly target: Element;
}

interface ResizeObserverEntryBoxSize {
  blockSize: number;
  inlineSize: number;
}

interface Window {
  ResizeObserver: ResizeObserver;
}
