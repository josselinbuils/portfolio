import { RefObject } from 'react';
import {
  InjectedWindowProps,
  Window,
  WindowComponent,
} from '~/platform/components/Window';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export interface WindowInstance extends Partial<InjectedWindowProps> {
  active: boolean;
  appDescriptor: AppDescriptor;
  id: number;
  minimizedTopPosition?: number;
  windowRef: RefObject<Window>;
  windowComponent: WindowComponent;
  zIndex: number;
}
