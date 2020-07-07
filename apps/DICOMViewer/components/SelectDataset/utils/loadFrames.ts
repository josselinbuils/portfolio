import untar from 'js-untar';
import { onFetchProgress } from '~/platform/utils/onFetchProgress';
import { DatasetDescriptor } from '../../../interfaces/DatasetDescriptor';
import { DicomFrame } from '../../../models/DicomFrame';
import { decodeFrames } from '../../../utils/decodeFrames';

export async function loadFrames(
  descriptor: DatasetDescriptor,
  onProgress: (progress: number) => void
): Promise<DicomFrame[]> {
  const { url } = descriptor;
  const buffer = await getDICOMFile(url, onProgress);
  const fileBuffers = /\.tar$/.test(url)
    ? (await untar(buffer)).map((res: any) => res.buffer)
    : [buffer];

  return decodeFrames(fileBuffers);
}

async function getDICOMFile(
  url: string,
  onProgress: (progress: number) => void
): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url).then(onFetchProgress(onProgress));
    return response.arrayBuffer();
  } catch (error) {
    throw new Error(`Unable to retrieve DICOM file: ${error.stack}`);
  }
}
