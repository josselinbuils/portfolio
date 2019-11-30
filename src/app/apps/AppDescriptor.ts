import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { WindowComponent } from '~/platform/components/Window';

type AppFactory = <T extends WindowComponent>() => Promise<{
  default: T;
}>;

export interface AppDescriptor {
  appName: string;
  factory: AppFactory;
  icon: IconDefinition;
  iconScale?: number;
}
