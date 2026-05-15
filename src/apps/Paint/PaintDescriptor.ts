import { faPaintbrush } from '@fortawesome/free-solid-svg-icons/faPaintbrush';

import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';

export const PaintDescriptor: AppDescriptor = {
  description: 'Raster image editor.',
  factory: () => import('./Paint'),
  icon: faPaintbrush,
  iconScale: 0.85,
  name: 'Paint',
};
