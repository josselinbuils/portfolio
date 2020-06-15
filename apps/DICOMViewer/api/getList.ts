import { ENV_DEV } from '~/platform/api/constants';
import { DatasetDescriptor } from '../interfaces/DatasetDescriptor';
import { getDatasetDescriptors } from './utils/getDatasetDescriptors';

const ENV = process.env.NODE_ENV || ENV_DEV;
let datasetDescriptors: DatasetDescriptor[];

export function getList(): DatasetDescriptor[] {
  if (datasetDescriptors === undefined || ENV === ENV_DEV) {
    datasetDescriptors = getDatasetDescriptors();
  }
  return datasetDescriptors;
}
