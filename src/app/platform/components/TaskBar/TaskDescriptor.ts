import {
  WindowComponent,
  WindowInstance
} from '~/platform/providers/WindowProvider';

export interface TaskDescriptor {
  windowComponent: WindowComponent;
  windowInstance?: WindowInstance;
}
