import { AppDescriptor } from '~/apps/AppDescriptor';
import { WindowInstance } from '~/platform/services/WindowManager';

export interface TaskDescriptor {
  appDescriptor: AppDescriptor;
  windowInstance?: WindowInstance;
}
