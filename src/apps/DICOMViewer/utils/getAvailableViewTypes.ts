import { type ViewType } from '../interfaces/ViewType';
import { type Dataset } from '../models/Dataset';

export function getAvailableViewTypes(dataset: Dataset): ViewType[] {
  const availableViewTypes: ViewType[] = ['Native'];

  if (dataset.is3D) {
    availableViewTypes.push(
      'Axial',
      'Coronal',
      'Sagittal',
      '3D Bones',
      '3D Skin',
    );
  }
  return availableViewTypes;
}
