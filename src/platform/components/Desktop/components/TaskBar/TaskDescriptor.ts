import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { type WindowInstance } from '@/platform/services/WindowManager/WindowInstance';

export interface TaskDescriptor {
  appDescriptor: AppDescriptor;
  windowInstance?: WindowInstance;
}
