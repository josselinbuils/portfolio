import { RendererType, ViewType } from '../constants';
import { Dataset } from '../models';

export function getAvailableViewTypes(
  dataset: Dataset,
  rendererType: RendererType
): ViewType[] {
  const availableViewTypes = [ViewType.Native];

  if (dataset.is3D && rendererType !== RendererType.WebGL) {
    availableViewTypes.push(
      ...[ViewType.Axial, ViewType.Coronal, ViewType.Sagittal]
    );
  }
  return availableViewTypes;
}
