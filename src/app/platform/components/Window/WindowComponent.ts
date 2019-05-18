import { FC } from 'react';
import { Size } from '~/platform/interfaces';

export interface WindowComponent extends FC<InjectedWindowProps> {
  appName: string;
  iconClass: string;
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
