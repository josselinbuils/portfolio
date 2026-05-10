import { type RefObject } from 'preact';

import { type Window } from '@/platform/components/Window/Window';
import {
  type InjectedWindowProps,
  type WindowComponent,
} from '@/platform/components/Window/WindowComponent';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';

export interface WindowInstance extends Partial<InjectedWindowProps> {
  active: boolean;
  appDescriptor: AppDescriptor;
  id: number;
  minimizedTopPosition?: number;
  windowComponent: WindowComponent;
  windowRef: RefObject<Window>;
  zIndex: number;
}
