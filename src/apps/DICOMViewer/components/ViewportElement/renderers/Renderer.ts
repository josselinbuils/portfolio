import { Viewport } from '~/apps/DICOMViewer/models';

export interface Renderer {
  destroy?(): void;
  render(viewport: Viewport): void;
}
