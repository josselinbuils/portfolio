import { ENV_DEV } from '~/platform/api/constants';
import { DatasetDescriptor } from '../interfaces/DatasetDescriptor';
import { getDatasetDescriptors } from './utils/getDatasetDescriptors';

const ENV = process.env.NODE_ENV || ENV_DEV;
const datasetDescriptors = getDatasetDescriptors();

export function getList(): DatasetDescriptor[] {
  return ENV === ENV_DEV ? getDatasetDescriptors() : datasetDescriptors;
}
