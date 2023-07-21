const result = await Bun.build({
  entrypoints: ['./src/pages/index/index-client.tsx'],
  loader: {
    '.frag': 'text',
    '.vert': 'text',
  },
  outdir: './dist',
  plugins: [
    {
      name: 'sass',
      async setup(build) {
        const fs = await import('fs/promises');
        const path = await import('path');
        const postcss = (await import('postcss')).default;
        const postcssModules = (await import('postcss-modules')).default;
        const { compileStringAsync } = await import('sass');
        const { createMatchPath } = await import('tsconfig-paths');
        const { compilerOptions } = (await import('../tsconfig.json')).default;

        const matchPath = createMatchPath(process.cwd(), compilerOptions.paths);

        build.onLoad({ filter: /\.s?css$/ }, async ({ path: filePath }) => {
          const id = path.relative(process.cwd(), filePath);
          const fileContent = await fs.readFile(filePath, 'utf8');

          const sassResult = await compileStringAsync(fileContent, {
            importer: {
              findFileUrl(url) {
                const resolvedPath = matchPath(url);
                return resolvedPath ? new URL(`file://${resolvedPath}`) : null;
              },
            },
            loadPaths: [path.dirname(filePath)],
            style: 'compressed',
          });

          let styles: Record<string, string> = {};

          const { css } = await postcss([
            postcssModules({
              generateScopedName: '[hash:hex:5]',
              getJSON(_, json) {
                styles = json;
              },
            }),
          ]).process(sassResult.css.toString(), { from: undefined });

          if (css.includes('`')) {
            throw new Error(`Forbidden "\`" character in ${id}`);
          }

          return {
            contents: `\
import { injectStyles } from '@/platform/utils/injectStyles';

export const css = \`${css}\`;
export const id = '${id}';
export default ${JSON.stringify(styles)};

if (typeof window !== 'undefined') {
  injectStyles(\`${css}\`);
}`,
            loader: 'js',
          };
        });
      },
    },
  ],
  sourcemap: 'external',
  splitting: true,
});

if (!result.success) {
  console.error(result.logs);
}
