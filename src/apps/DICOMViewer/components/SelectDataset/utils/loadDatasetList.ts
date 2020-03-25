import { BASE_URL } from '~/platform/constants';
import { DatasetDescriptor } from '../DatasetDescriptor';

export async function loadDatasetList(): Promise<DatasetDescriptor[]> {
  const response = await fetch(`${BASE_URL}/api/dicom`);
  return response.json();
}
