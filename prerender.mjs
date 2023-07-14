import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { render } from './dist/server/entry-server.mjs';

(async () => {
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const manifest = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'dist/ssr-manifest.json'), 'utf8'),
  );

  const template = fs.readFileSync(
    path.resolve(__dirname, 'dist/index.html'),
    'utf8',
  );

  const appHtml = await render(url, manifest);
  const html = template.replace(`<!--app-html-->`, appHtml);

  fs.writeFileSync(path.resolve(__dirname, 'dist/index.html'), html);
  fs.unlinkSync(path.resolve(__dirname, 'dist/ssr-manifest.json'));
  fs.rmSync(path.resolve(__dirname, 'dist/server'), { recursive: true });
})();
