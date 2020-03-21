import { Viewport } from '../../../models';

export interface Renderer {
  destroy?(): void;
  render(viewport: Viewport): void;
}
