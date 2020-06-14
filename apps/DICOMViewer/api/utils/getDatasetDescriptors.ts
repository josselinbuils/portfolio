import fs from 'fs';
import path from 'path';
import { Logger } from '~/platform/api/Logger';
import { DatasetDescriptor } from '../../interfaces/DatasetDescriptor';
import {
  DATASETS_PATH,
  DATASETS_URL,
  PREVIEWS_PATH,
  PREVIEWS_URL,
} from '../constants';

export function getDatasetDescriptors(): DatasetDescriptor[] {
  Logger.info(`Loads datasets from ${DATASETS_PATH}`);

  try {
    return fs
      .readdirSync(DATASETS_PATH)
      .filter(
        (fileName) => !fileName.startsWith('.') && !fileName.endsWith('.gz')
      )
      .map((fileName) => {
        const name = path.parse(fileName).name;
        const url = `${DATASETS_URL}/${fileName}`;
        const preview = fs
          .readdirSync(PREVIEWS_PATH)
          .find((p) => p.includes(name));

        if (preview === undefined) {
          throw new Error(`Unable to find preview for ${name}`);
        }
        const previewURL = `${PREVIEWS_URL}/${preview}`;
        return { name, previewURL, url };
      });
  } catch (error) {
    Logger.error(`Unable to compute datasets descriptors: ${error.stack}`);
    return [];
  }
}
