import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';

// TODO move in platform interfaces

type AppFactory = <T extends WindowComponent>() => Promise<{
  default: T;
}>;

export interface AppDescriptor {
  appName: string;
  factory: AppFactory;
  icon: IconDefinition;
  iconScale?: number;
}

export function isAppDescriptor(app: any): app is AppDescriptor {
  return typeof app.factory === 'function';
}
