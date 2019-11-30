import { FC } from 'react';
import { AppDescriptor } from '~/apps/AppDescriptor';
import { Size } from '~/platform/interfaces';

export interface WindowComponent extends FC<InjectedWindowProps> {
  appDescriptor: AppDescriptor;
}

interface InjectedWindowProps {
  active: boolean;
  id: number;
  minimizedTopPosition?: number;
  visible: boolean;
  visibleAreaSize: Size;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onSelect(id: number): void;
}
