import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
// eslint-disable-next-line import/no-unresolved
import { render } from './dist/server/entry-server.mjs';

(async () => {
  // eslint-disable-next-line no-underscore-dangle
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const template = fs.readFileSync(
    path.resolve(__dirname, 'dist/index.html'),
    'utf8',
  );

  const appHtml = await render(url);
  const html = template.replace(`<!--app-html-->`, appHtml);

  fs.writeFileSync(path.resolve(__dirname, 'dist/index.html'), html);
  fs.rmSync(path.resolve(__dirname, 'dist/server'), { recursive: true });
})();
