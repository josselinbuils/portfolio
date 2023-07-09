import { ENV_DEV } from '~/platform/api/constants';
import { type DatasetDescriptor } from '../interfaces/DatasetDescriptor';
import { getDatasetDescriptors } from './utils/getDatasetDescriptors';

const ENV = process.env.NODE_ENV || ENV_DEV;
let datasetDescriptors: DatasetDescriptor[];

export async function getList(): Promise<DatasetDescriptor[]> {
  if (datasetDescriptors === undefined || ENV === ENV_DEV) {
    datasetDescriptors = await getDatasetDescriptors();
  }
  return datasetDescriptors;
}
