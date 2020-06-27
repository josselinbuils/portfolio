import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';

export interface TaskDescriptor {
  appDescriptor: AppDescriptor;
  windowInstance?: WindowInstance;
}
