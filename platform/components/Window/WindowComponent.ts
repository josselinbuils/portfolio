import { type FC, type RefObject } from 'react';
import { type Size } from '~/platform/interfaces/Size';
import { type Window, type WindowProps } from './Window';

export type WindowComponent<T = unknown> = FC<T & InjectedWindowProps>;

export interface InjectedWindowProps extends Partial<WindowProps> {
  active: boolean;
  id: number;
  visibleAreaSize: Size | undefined;
  windowRef: RefObject<Window>;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onSelect(id: number): void;
  onUnselect(id: number): void;
}
