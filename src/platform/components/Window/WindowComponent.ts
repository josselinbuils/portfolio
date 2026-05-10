import { type FunctionComponent, type RefObject } from 'preact';

import { type Size } from '@/platform/interfaces/Size';

import { type Window, type WindowProps } from './Window';

export interface InjectedWindowProps extends Partial<WindowProps> {
  active: boolean;
  id: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onSelect(id: number): void;
  onUnselect(id: number): void;
  visibleAreaSize: Size | undefined;
  windowRef: RefObject<Window>;
  zIndex: number;
}

export type WindowComponent<T = unknown> = FunctionComponent<
  InjectedWindowProps & T
>;
