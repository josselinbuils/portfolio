import { RendererType, ViewType } from '../constants';
import { Dataset } from '../models/Dataset';

export function getAvailableViewTypes(
  dataset: Dataset,
  rendererType: RendererType
): ViewType[] {
  const availableViewTypes = [ViewType.Native];

  if (dataset.is3D && rendererType !== RendererType.WebGL) {
    availableViewTypes.push(
      ViewType.Axial,
      ViewType.Coronal,
      ViewType.Sagittal,
      ViewType.VolumeBones,
      ViewType.VolumeSkin
    );
  }
  return availableViewTypes;
}
