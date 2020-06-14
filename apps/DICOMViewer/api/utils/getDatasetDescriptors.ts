import fs from 'fs';
import path from 'path';
import { ASSETS_DIR, ASSETS_URL } from '~/platform/api/constants';
import { Logger } from '~/platform/api/Logger';
import { DatasetDescriptor } from '../../interfaces/DatasetDescriptor';

const dicomPath = path.join(process.cwd(), ASSETS_DIR, '/dicom');
const datasetsPath = path.join(dicomPath, '/datasets');
const previewsPath = path.join(dicomPath, '/previews');

export function getDatasetDescriptors(): DatasetDescriptor[] {
  Logger.info(`Loads datasets from ${datasetsPath}`);

  try {
    return fs
      .readdirSync(datasetsPath)
      .filter(
        (fileName) => !fileName.startsWith('.') && !fileName.endsWith('.gz')
      )
      .map((fileName) => {
        const filePath = path.join(datasetsPath, fileName);
        const byteLength = fs.statSync(filePath).size;
        const name = path.parse(fileName).name;
        const url = `${ASSETS_URL}/dicom/datasets/${fileName}`;
        const preview = fs
          .readdirSync(previewsPath)
          .find((p) => p.includes(name));

        if (preview === undefined) {
          throw new Error(`Unable to find preview for ${name}`);
        }

        const descriptor = {
          byteLength,
          name,
          preview,
          url,
        } as DatasetDescriptor;

        if (fs.existsSync(`${filePath}.gz`)) {
          descriptor.compressedURL = `${url}.gz`;
        }

        return descriptor;
      });
  } catch (error) {
    Logger.error(`Unable to compute datasets descriptors: ${error.stack}`);
    return [];
  }
}
