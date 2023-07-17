import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';

export interface TaskDescriptor {
  appDescriptor: AppDescriptor;
  windowInstance?: WindowInstance;
}
