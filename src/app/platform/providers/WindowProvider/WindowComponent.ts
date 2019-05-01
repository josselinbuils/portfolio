import { FC } from 'react';
import { InjectedWindowProps } from '~/platform/providers/WindowProvider';

export interface WindowComponent extends FC<InjectedWindowProps> {
  appName: string;
  iconClass: string;
}
