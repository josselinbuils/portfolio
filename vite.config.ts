/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import preact from '@preact/preset-vite';
import { glob } from 'glob';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(async ({ ssrBuild }) => {
  const pageNames = (await glob('*.html')).map(
    (filename) => path.parse(filename).name,
  );

  return {
    build: {
      outDir: ssrBuild ? 'build/server' : 'build',
      rollupOptions: {
        input: Object.fromEntries(
          pageNames.map((pageName) => [
            pageName,
            path.resolve(
              __dirname,
              ssrBuild
                ? `src/pages/${pageName}/${pageName}-server.tsx`
                : `${pageName}.html`,
            ),
          ]),
        ),
      },
      sourcemap: true,
    },
    plugins: [
      preact(),
      process.env.ANALYSE === 'true' && visualizer({ open: true }),
    ].filter(Boolean),
    publicDir: false,
    resolve: {
      alias: {
        '@/root': __dirname,
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: { port: 3000 },
  };
});
