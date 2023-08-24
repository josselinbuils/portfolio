import { type RendererType } from '../interfaces/RendererType';
import { type ViewType } from '../interfaces/ViewType';
import { type Dataset } from '../models/Dataset';

export function getAvailableViewTypes(
  dataset: Dataset,
  rendererType: RendererType,
): ViewType[] {
  const availableViewTypes: ViewType[] = ['native'];

  if (dataset.is3D) {
    availableViewTypes.push('axial', 'coronal', 'sagittal', 'bones', 'skin');

    if (rendererType === 'WebGPU') {
      availableViewTypes.push('mip');
    }
  }
  return availableViewTypes;
}
