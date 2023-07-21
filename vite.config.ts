/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import preact from '@preact/preset-vite';
import { glob } from 'glob';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { vitePluginPage } from './config/vitePluginPage';

// https://vitejs.dev/config/
export default defineConfig(async ({ ssrBuild }) => {
  const pageNames = (
    await glob('**/[!_]*.tsx', { cwd: path.join(__dirname, 'src/pages') })
  ).map((filePath) => filePath.replace(/\.tsx$/, ''));

  return {
    build: {
      outDir: ssrBuild ? 'build/server' : 'build',
      rollupOptions: {
        input: Object.fromEntries(
          pageNames.map((pageName) => [pageName, `${pageName}.html`]),
        ),
      },
      sourcemap: true,
    },
    plugins: [
      vitePluginPage(),
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
