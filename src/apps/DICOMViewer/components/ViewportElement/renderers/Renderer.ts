import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';

export interface Renderer {
  destroy?(): void;
  init?(viewport: Viewport): void | Promise<void>;
  render(viewport: Viewport): void | Promise<void>;
}
