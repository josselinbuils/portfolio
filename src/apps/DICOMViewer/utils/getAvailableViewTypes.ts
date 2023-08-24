import { type ViewType } from '../interfaces/ViewType';
import { type Dataset } from '../models/Dataset';

export function getAvailableViewTypes(dataset: Dataset): ViewType[] {
  const availableViewTypes: ViewType[] = ['native'];

  if (dataset.is3D) {
    availableViewTypes.push('axial', 'coronal', 'sagittal', 'bones', 'skin');
  }
  return availableViewTypes;
}
