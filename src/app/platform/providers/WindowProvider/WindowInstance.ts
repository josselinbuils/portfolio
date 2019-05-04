import { WindowComponent } from '~/platform/providers/WindowProvider';

export interface WindowInstance {
  active: boolean;
  id: number;
  visible: boolean;
  zIndex: number;
  windowComponent: WindowComponent;
}
