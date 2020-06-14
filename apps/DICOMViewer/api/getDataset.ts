import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { serveStatic } from 'next/dist/next-server/server/serve-static';
import path from 'path';
import { DATASETS_PATH, MAX_AGE } from './constants';

export async function getDataset(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { dataset } = req.query;
  const assetPath = path.join(DATASETS_PATH, dataset as string);

  res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}, immutable`);

  if (fs.existsSync(`${assetPath}.gz`)) {
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Length, Content-Length-Uncompressed'
    );
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'application/octet-stream');

    if (fs.existsSync(assetPath)) {
      const { size } = fs.statSync(assetPath);
      res.setHeader('Content-Length-Uncompressed', size.toString());
    }
    return serveStatic(req, res, `${assetPath}.gz`);
  }
  return serveStatic(req, res, assetPath);
}
