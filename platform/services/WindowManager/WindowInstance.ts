import { RefObject } from 'react';
import {
  InjectedWindowProps,
  Window,
  WindowComponent,
} from '~/platform/components/Window';

export interface WindowInstance extends Partial<InjectedWindowProps> {
  active: boolean;
  id: number;
  minimizedTopPosition?: number;
  windowRef: RefObject<Window>;
  windowComponent: WindowComponent;
  zIndex: number;
}
