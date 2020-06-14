import { BASE_URL } from '~/platform/constants';
import { DatasetDescriptor } from '../../../interfaces/DatasetDescriptor';

export async function loadDatasetList(): Promise<DatasetDescriptor[]> {
  const response = await fetch(`${BASE_URL}/api/DICOMViewer/list`);
  return response.json();
}
