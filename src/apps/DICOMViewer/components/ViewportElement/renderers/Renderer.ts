import { type Viewport } from '@/apps/DICOMViewer/models/Viewport';

export interface Renderer {
  destroy?(): void;
  render(viewport: Viewport): void | Promise<void>;
}
