import { WindowComponent } from '~/platform/components/Window';
import { WindowInstance } from '~/platform/services/WindowManager';

export interface TaskDescriptor {
  windowComponent: WindowComponent;
  windowInstance?: WindowInstance;
}
