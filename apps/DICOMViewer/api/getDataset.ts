import fs from 'node:fs';
import path from 'node:path';
import { type NextApiRequest, type NextApiResponse } from 'next';
import { HTTP_NOT_FOUND } from '~/platform/api/constants';
import { DATASETS_PATH, MAX_AGE } from './constants';

export async function getDataset(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { dataset } = req.query;
  const assetPath = path.join(DATASETS_PATH, dataset as string);

  if (!fs.existsSync(assetPath)) {
    res.status(HTTP_NOT_FOUND).send('Dataset not found');
    return;
  }

  const compressedAssetPath = `${assetPath}.gz`;
  const isCompressed = fs.existsSync(compressedAssetPath);

  res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}, immutable`);
  res.setHeader('Content-Type', 'application/octet-stream');

  if (isCompressed) {
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Length-Uncompressed',
    );
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader(
      'Content-Length-Uncompressed',
      fs.statSync(assetPath).size.toString(),
    );
  }

  const assetToSendPath = isCompressed ? compressedAssetPath : assetPath;

  res.setHeader('Content-Length', fs.statSync(assetToSendPath).size.toString());

  return new Promise((resolve, reject) => {
    fs.createReadStream(assetToSendPath)
      .on('error', reject)
      .on('finish', resolve)
      .pipe(res);
  });
}
