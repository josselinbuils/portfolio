import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';

export interface AppDescriptor {
  description: string;
  factory: () => Promise<{ default: WindowComponent }>;
  icon: IconDefinition;
  iconScale?: number;
  isMobileFriendly: boolean;
  name: string;
}
