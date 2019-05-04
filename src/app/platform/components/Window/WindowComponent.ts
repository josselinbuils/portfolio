import { FC } from 'react';
import { Position } from '~/platform/interfaces';

export interface WindowComponent extends FC<InjectedWindowProps> {
  appName: string;
  iconClass: string;
}

interface InjectedWindowProps {
  active: boolean;
  id: number;
  minimizedPosition?: Position;
  visible: boolean;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onSelect(id: number): void;
}
