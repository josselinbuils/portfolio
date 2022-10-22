import { onFetchProgress } from '~/platform/utils/onFetchProgress';
import type { DatasetDescriptor } from '../../../interfaces/DatasetDescriptor';
import type { DicomFrame } from '../../../models/DicomFrame';
import { decodeFrames } from '../../../utils/decodeFrames';
import { untar } from '../../../utils/untar';

export async function loadFrames(
  descriptor: DatasetDescriptor,
  onProgress: (progress: number) => void
): Promise<DicomFrame[]> {
  const { name, url } = descriptor;
  const content = await getDICOMFile(url, onProgress);
  const fileBuffers = /\.tar$/.test(url) ? untar(content) : [{ name, content }];

  return decodeFrames(fileBuffers);
}

async function getDICOMFile(
  url: string,
  onProgress: (progress: number) => void
): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url).then(onFetchProgress(onProgress));
    return response.arrayBuffer();
  } catch (error: any) {
    throw new Error(`Unable to retrieve DICOM file: ${error.stack}`);
  }
}
