import { WindowComponent } from '~/platform/components/Window';

type AppFactory = <T extends WindowComponent>() => Promise<{
  default: T;
}>;

export interface AppDescriptor {
  appName: string;
  factory: AppFactory;
  iconClass: string;
}
