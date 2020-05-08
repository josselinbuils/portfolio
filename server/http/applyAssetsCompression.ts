import { Router } from 'express';
import fs from 'fs';
import path, { join } from 'path';
import { ASSETS_DIR, ASSETS_URL_PATH } from './constants';

const ASSETS_FS_PATH = join(process.cwd(), ASSETS_DIR);

export function applyAssetsCompression(router: Router): void {
  router.use(ASSETS_URL_PATH, (req, res, next) => {
    const assetPath = path.join(ASSETS_FS_PATH, req.url);

    res.set('Access-Control-Expose-Headers', 'Content-Length');

    if (fs.existsSync(`${assetPath}.gz`)) {
      req.url += '.gz';
      res.set(
        'Access-Control-Expose-Headers',
        'Content-Length, Content-Length-Uncompressed'
      );
      res.set('Content-Encoding', 'gzip');
      res.set('Content-Type', 'application/octet-stream');

      if (fs.existsSync(assetPath)) {
        const { size } = fs.statSync(assetPath);
        res.set('Content-Length-Uncompressed', size.toString());
      }
    }
    next();
  });
}
