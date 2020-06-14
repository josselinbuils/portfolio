import { AppDescriptor } from '~/apps/AppDescriptor';
import { WindowInstance } from '~/platform/services/WindowManager/WindowInstance';

export interface TaskDescriptor {
  appDescriptor: AppDescriptor;
  windowInstance?: WindowInstance;
}
