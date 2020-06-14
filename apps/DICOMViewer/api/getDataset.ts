import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { serveStatic } from 'next/dist/next-server/server/serve-static';
import path from 'path';
import { HTTP_NOT_FOUND } from '~/platform/api/constants';
import { DATASETS_PATH, MAX_AGE } from './constants';

export async function getDataset(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { dataset } = req.query;
  const assetPath = path.join(DATASETS_PATH, dataset as string);

  if (!fs.existsSync(assetPath)) {
    res.status(HTTP_NOT_FOUND).send('Dataset not found');
    return;
  }

  res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}, immutable`);

  if (fs.existsSync(`${assetPath}.gz`)) {
    const { size } = fs.statSync(assetPath);

    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Length-Uncompressed'
    );
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length-Uncompressed', size.toString());

    return serveStatic(req, res, `${assetPath}.gz`);
  }
  return serveStatic(req, res, assetPath);
}
