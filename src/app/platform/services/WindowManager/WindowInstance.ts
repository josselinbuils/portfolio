import { WindowComponent } from '~/platform/components/Window';

export interface WindowInstance {
  active: boolean;
  id: number;
  minimizedTopPosition?: number;
  visible: boolean;
  zIndex: number;
  windowComponent: WindowComponent;
}
