import { RefObject } from 'react';
import { Window } from '~/platform/components/Window/Window';
import {
  InjectedWindowProps,
  WindowComponent,
} from '~/platform/components/Window/WindowComponent';
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
