import { getBaseURL } from '~/platform/utils/getBaseURL';
import { DatasetDescriptor } from '../../../interfaces/DatasetDescriptor';

export async function loadDatasetList(): Promise<DatasetDescriptor[]> {
  const response = await fetch(`${getBaseURL()}/api/DICOMViewer/list`);
  return response.json();
}
