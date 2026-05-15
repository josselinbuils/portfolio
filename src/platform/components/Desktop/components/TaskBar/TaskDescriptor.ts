import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';

export type ActionTaskDescriptor = {
  action(): unknown;
  description: string;
  icon: IconDefinition;
  iconScale?: number;
  name: string;
};

export type AppTaskDescriptor = AppDescriptor & {
  windowInstance?: WindowInstance;
};

export type TaskDescriptor = ActionTaskDescriptor | AppTaskDescriptor;
