import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';

import { type WindowComponent } from '@/platform/components/Window/WindowComponent';

export type AppDescriptor = {
  description: string;
  factory: () => Promise<{ default: WindowComponent }>;
  icon: IconDefinition;
  iconScale?: number;
  name: string;
};
