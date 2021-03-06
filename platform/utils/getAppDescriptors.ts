import { APP_DESCRIPTORS } from '~/platform/appDescriptors';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export function getAppDescriptors(): { [name: string]: AppDescriptor } {
  const descriptors = {} as { [name: string]: AppDescriptor };

  APP_DESCRIPTORS.slice()
    .sort((a, b) =>
      a.appName.toLowerCase() > b.appName.toLowerCase() ? 1 : -1
    )
    .forEach((descriptor) => {
      descriptors[descriptor.appName.toLowerCase()] = descriptor;
    });

  return descriptors;
}
