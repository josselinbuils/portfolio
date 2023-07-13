import { type RefObject } from 'preact/compat';
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
  windowRef: RefObject<Window>;
  windowComponent: WindowComponent;
  zIndex: number;
}
