import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';
import { ASSETS_DIR, ENV_DEV } from '../../constants';
import { Logger } from '../../Logger';

const ENV = process.env.NODE_ENV || ENV_DEV;
const dicomPath = join(process.cwd(), ASSETS_DIR, '/dicom');
const datasetsPath = join(dicomPath, '/datasets');
const previewsPath = join(dicomPath, '/previews');

export class DicomController {
  datasetDescriptors = getDatasetDescriptors();

  getList = async (): Promise<DatasetDescriptor[]> => {
    return ENV === ENV_DEV ? getDatasetDescriptors() : this.datasetDescriptors;
  };
}

function getDatasetDescriptors(): DatasetDescriptor[] {
  Logger.info(`Loads datasets from ${datasetsPath}`);

  try {
    return readdirSync(datasetsPath)
      .filter(fileName => !fileName.startsWith('.'))
      .map(fileName => {
        const files = getFiles(datasetsPath, fileName);
        const name = fileName.replace(/(\.[a-z]+)+$/, '');
        const preview = readdirSync(previewsPath).find(p => p.includes(name));
        return { files, name, preview };
      })
      .filter(
        (descriptor, index, descriptors) =>
          descriptors.findIndex(d => d.name === descriptor.name) === index
      );
  } catch (error) {
    Logger.error(`Unable to compute datasets descriptors: ${error.stack}`);
    return [];
  }
}

function getFiles(folderPath: string, name: string): string[] {
  const path = join(folderPath, name);

  return lstatSync(path).isDirectory()
    ? readdirSync(path).map(
        fileName => `${name}/${fileName.replace('.gz', '')}`
      )
    : [name.replace('.gz', '')];
}

interface DatasetDescriptor {
  files: string[];
  name: string;
  preview?: string;
}
