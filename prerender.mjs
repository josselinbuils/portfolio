import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { glob } from 'glob';

(async () => {
  // eslint-disable-next-line no-underscore-dangle
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const pageNames = (await glob('*.html')).map(
    (filename) => path.parse(filename).name,
  );

  await Promise.all(
    pageNames.map(async (pageName) => {
      const template = fs.readFileSync(
        path.join(__dirname, `build/${pageName}.html`),
        'utf8',
      );
      const { render } = await import(
        path.join(__dirname, `build/server/${pageName}.mjs`)
      );
      const appHtml = await render(url);
      const html = template.replace(`<!--app-html-->`, appHtml);
      fs.writeFileSync(path.join(__dirname, `build/${pageName}.html`), html);
    }),
  );

  fs.rmSync(path.join(__dirname, 'build/server'), { recursive: true });
})();
