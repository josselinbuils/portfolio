import path from 'node:path';
import { glob } from 'glob';
import renderToString from 'preact-render-to-string';
import { createServer, type Plugin, type ViteDevServer } from 'vite';

export const VIRTUAL_DOCUMENT_ID = 'virtual:page:document';
export const VIRTUAL_ENTRY_CLIENT_PREFIX = '/virtual:page:entry-client:';
export const VIRTUAL_ENTRY_PAGE_PREFIX = 'virtual:page:entry-page:';
export const VIRTUAL_ENTRY_SERVER_PREFIX = 'virtual:page:entry-server:';

const pagesDirPath = path.join(__dirname, '../src/pages');
const documentPath = path.join(pagesDirPath, '_document.tsx');

export function vitePluginPage(): Plugin {
  let viteDevServerPromise: Promise<ViteDevServer> | undefined;
  let pageNames: string[];

  return {
    name: 'vite-plugin-page',
    enforce: 'pre',
    async config(userConfig) {
      if (userConfig.build?.rollupOptions?.input !== undefined) {
        throw new Error(
          'build.rollupOptions.input must not be set by user because it will be done by vite-plugin-page.',
        );
      }

      pageNames = await listSourcePages();

      return {
        build: {
          rollupOptions: {
            input: Object.fromEntries(
              pageNames.map((pageName) => [pageName, `${pageName}.html`]),
            ),
          },
        },
      };
    },
    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const { url } = req;

        if (!url) {
          next();
          return;
        }

        const matchingPageName = pageNames.find((pageName) =>
          new RegExp(
            `^/${pageName.replace(/index$/, '').replace(/:[^/]+/, '[^/]+')}$`,
          ).test(url),
        );

        if (matchingPageName) {
          const { render } = (await server.ssrLoadModule(
            `${VIRTUAL_ENTRY_SERVER_PREFIX}${matchingPageName}`,
          )) as any;
          res.end(
            await server.transformIndexHtml?.(
              req.url!,
              withDocType(render()),
              req.originalUrl,
            ),
          );
        } else {
          next();
        }
      });
    },
    resolveId(source) {
      if (source === VIRTUAL_DOCUMENT_ID) {
        return documentPath;
      }
      if (source.startsWith(VIRTUAL_ENTRY_PAGE_PREFIX)) {
        const pageName = source.replace(VIRTUAL_ENTRY_PAGE_PREFIX, '');
        return path.join(pagesDirPath, `${pageName}.tsx`);
      }
      if (
        source.startsWith(VIRTUAL_ENTRY_CLIENT_PREFIX) ||
        source.startsWith(VIRTUAL_ENTRY_SERVER_PREFIX) ||
        source.endsWith('.html')
      ) {
        return source;
      }
    },
    async load(id) {
      if (id.startsWith(VIRTUAL_ENTRY_CLIENT_PREFIX)) {
        const pageName = id.replace(VIRTUAL_ENTRY_CLIENT_PREFIX, '');
        return `\
import { hydrate } from 'preact';
import Page from '${VIRTUAL_ENTRY_PAGE_PREFIX}${pageName}';

hydrate(Page(), document.getElementById('app'));
`;
      }
      if (id.startsWith(VIRTUAL_ENTRY_SERVER_PREFIX)) {
        const pageName = id.replace(VIRTUAL_ENTRY_SERVER_PREFIX, '');
        return `\
import { renderToString } from 'preact-render-to-string';
import Document from '${VIRTUAL_DOCUMENT_ID}';
import Page from '${VIRTUAL_ENTRY_PAGE_PREFIX}${pageName}';

export function render() {
  return renderToString(Document({ entryScriptUrl: '${VIRTUAL_ENTRY_CLIENT_PREFIX}${pageName}' }));
}
`;
      }
      if (id.endsWith('.html')) {
        const pageName = id.replace(/\.html$/, '');

        if (viteDevServerPromise === undefined) {
          viteDevServerPromise = createServer({
            server: { middlewareMode: true },
          });
        }
        const viteDevServer = await viteDevServerPromise;

        const { default: Document } = await viteDevServer.ssrLoadModule(
          VIRTUAL_DOCUMENT_ID,
        );

        return withDocType(
          renderToString(
            Document({
              entryScriptUrl: `${VIRTUAL_ENTRY_CLIENT_PREFIX}${pageName}`,
            }),
          ),
        );
      }
    },
    async buildEnd() {
      if (viteDevServerPromise) {
        await (await viteDevServerPromise).close();
      }
    },
  };
}

async function listSourcePages() {
  return (
    await glob('**/[!_]*.tsx', { cwd: path.join(process.cwd(), 'src/pages') })
  ).map((filePath) => filePath.replace(/\.tsx$/, ''));
}

function withDocType(html: string): string {
  return `<!DOCTYPE html>\n${html}`;
}
