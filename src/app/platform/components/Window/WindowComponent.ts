import { FC, RefObject } from 'react';

export interface WindowComponent extends FC<InjectedWindowProps> {
  appName: string;
  iconClass: string;
}

interface InjectedWindowProps {
  active: boolean;
  id: number;
  minimizedTopPosition?: number;
  visible: boolean;
  visibleAreaRef: RefObject<HTMLElement>;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onSelect(id: number): void;
}
