import { type Awaitable } from '@/platform/interfaces/Awaitable';

import { type Viewport } from '../../../models/Viewport';

export type Renderer = {
  destroy?(): void;
  init?(viewport: Viewport): Awaitable<void>;
  render(viewport: Viewport): Awaitable<void>;
};
