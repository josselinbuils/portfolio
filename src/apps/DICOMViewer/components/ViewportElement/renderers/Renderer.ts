import { type Awaitable } from '@/platform/interfaces/Awaitable';
import { type Viewport } from '../../../models/Viewport';

export interface Renderer {
  destroy?(): void;
  init?(viewport: Viewport): Awaitable<void>;
  render(viewport: Viewport): Awaitable<void>;
}
