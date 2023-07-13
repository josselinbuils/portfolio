// Open executor dynamically imported in Terminal so no cycle
// eslint-disable-next-line import/no-cycle
import { APP_DESCRIPTORS } from '@/platform/appDescriptors';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';

export function getAppDescriptors(): { [name: string]: AppDescriptor } {
  const descriptors: { [name: string]: AppDescriptor } = {};

  APP_DESCRIPTORS.slice()
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
    .forEach((descriptor) => {
      descriptors[descriptor.name.toLowerCase()] = descriptor;
    });

  return descriptors;
}
