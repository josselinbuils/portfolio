import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';

type AppFactory = <T extends WindowComponent>() => Promise<{
  default: T;
}>;

export interface AppDescriptor {
  description: string;
  factory: AppFactory;
  icon: IconDefinition;
  iconScale?: number;
  name: string;
}
