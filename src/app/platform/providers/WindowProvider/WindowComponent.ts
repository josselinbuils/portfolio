import { FC } from 'react';

export interface WindowComponent<T = {}> extends FC<T> {
  appName: string;
  iconClass: string;
}
