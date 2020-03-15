import { BASE_URL } from '~/platform/constants';
import { DatasetDescriptor } from '../interfaces';

export async function getDatasets(): Promise<DatasetDescriptor[]> {
  const response = await fetch(`${BASE_URL}/api/dicom`);
  return response.json();
}
