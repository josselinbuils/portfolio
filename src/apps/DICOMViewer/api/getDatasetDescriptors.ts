import fs from 'node:fs/promises';
import path from 'node:path';
import { Logger } from '@/platform/api/Logger';
import { extendError } from '@/platform/utils/extendError';
import { type DatasetDescriptor } from '../interfaces/DatasetDescriptor';
import { computeFrames } from '../utils/computeFrames';
import { decodeFrames } from '../utils/decodeFrames';
import { isVolume } from '../utils/isVolume';
import { untar } from '../utils/untar';
import {
  DATASETS_PATH,
  DATASETS_URL,
  PREVIEWS_PATH,
  PREVIEWS_URL,
} from './constants';

export async function getDatasetDescriptors(): Promise<DatasetDescriptor[]> {
  Logger.info(`Loads datasets from ${DATASETS_PATH}`);

  try {
    return Promise.all(
      (await fs.readdir(DATASETS_PATH))
        .filter(
          (fileName) => !fileName.startsWith('.') && !fileName.endsWith('.gz'),
        )
        .map(async (fileName) => {
          const { name } = path.parse(fileName);
          const url = `${DATASETS_URL}/${fileName}`;
          const preview = (await fs.readdir(PREVIEWS_PATH)).find((p) =>
            p.includes(name),
          );
          if (preview === undefined) {
            throw new Error(`Unable to find preview for ${name}`);
          }
          const previewURL = `${PREVIEWS_URL}/${preview}`;
          const is3D = await is3DDataset(fileName);

          return { is3D, name, previewURL, url };
        }),
    );
  } catch (error: any) {
    Logger.error(`Unable to compute datasets descriptors: ${error.stack}`);
    return [];
  }
}

async function is3DDataset(fileName: string): Promise<boolean> {
  try {
    const { buffer: content } = await fs.readFile(
      path.join(DATASETS_PATH, fileName),
    );
    const files = /\.tar$/.test(fileName)
      ? untar(content)
      : [{ name: fileName, content }];
    const frames = computeFrames(await decodeFrames(files));
    return isVolume(frames);
  } catch (error) {
    throw extendError(
      `Unable to determine if "${fileName}" is a 3D dataset`,
      error,
    );
  }
}
