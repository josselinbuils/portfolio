import { FC, RefObject } from 'react';
import { AppDescriptor } from '~/apps/AppDescriptor';
import { Size } from '~/platform/interfaces';
import { Window } from './Window';

export interface WindowComponent extends FC<InjectedWindowProps> {
  appDescriptor: AppDescriptor;
}

interface InjectedWindowProps {
  active: boolean;
  id: number;
  minimizedTopPosition?: number;
  visibleAreaSize: Size | undefined;
  windowRef: RefObject<Window>;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onSelect(id: number): void;
}
