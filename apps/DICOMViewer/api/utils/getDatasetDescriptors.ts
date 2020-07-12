import { promises as fs } from 'fs';
import path from 'path';
import { decodeFrames } from '~/apps/DICOMViewer/utils/decodeFrames';
import { Logger } from '~/platform/api/Logger';
import { DatasetDescriptor } from '../../interfaces/DatasetDescriptor';
import { computeFrames } from '../../utils/computeFrames';
import { isVolume } from '../../utils/isVolume';
import {
  DATASETS_PATH,
  DATASETS_URL,
  PREVIEWS_PATH,
  PREVIEWS_URL,
} from '../constants';
import { untar } from './untar';

export async function getDatasetDescriptors(): Promise<DatasetDescriptor[]> {
  Logger.info(`Loads datasets from ${DATASETS_PATH}`);

  try {
    return Promise.all(
      (await fs.readdir(DATASETS_PATH))
        .filter(
          (fileName) => !fileName.startsWith('.') && !fileName.endsWith('.gz')
        )
        .map(async (fileName) => {
          const { name } = path.parse(fileName);
          const url = `${DATASETS_URL}/${fileName}`;
          const preview = (await fs.readdir(PREVIEWS_PATH)).find((p) =>
            p.includes(name)
          );
          if (preview === undefined) {
            throw new Error(`Unable to find preview for ${name}`);
          }
          const previewURL = `${PREVIEWS_URL}/${preview}`;
          const is3D = await is3DDataset(fileName);

          return { is3D, name, previewURL, url };
        })
    );
  } catch (error) {
    Logger.error(`Unable to compute datasets descriptors: ${error.stack}`);
    return [];
  }
}

async function is3DDataset(fileName: string): Promise<boolean> {
  const buffer = await fs.readFile(path.join(DATASETS_PATH, fileName));
  const fileBuffers = /\.tar$/.test(fileName)
    ? (await untar(buffer)).map((res: any) => res.buffer)
    : [buffer];
  const frames = computeFrames(await decodeFrames(fileBuffers));
  return isVolume(frames);
}
