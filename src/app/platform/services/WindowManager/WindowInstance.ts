import { WindowComponent } from '~/platform/components/Window';
import { Position } from '~/platform/interfaces';

export interface WindowInstance {
  active: boolean;
  id: number;
  minimizedPosition?: Position;
  visible: boolean;
  zIndex: number;
  windowComponent: WindowComponent;
}
