// Open executor dynamically imported in Terminal so no cycle
import { APP_DESCRIPTORS } from '@/platform/appDescriptors';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';

export function getAppDescriptors(): Record<string, AppDescriptor> {
  const descriptors: Record<string, AppDescriptor> = {};

  APP_DESCRIPTORS.slice()
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
    .forEach((descriptor) => {
      descriptors[descriptor.name.toLowerCase()] = descriptor;
    });

  return descriptors;
}
