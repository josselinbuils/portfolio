import { RefObject } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';

export interface WindowInstance {
  active: boolean;
  id: number;
  minimizedTopPosition?: number;
  ref: RefObject<Window>;
  windowComponent: WindowComponent;
  zIndex: number;
}
