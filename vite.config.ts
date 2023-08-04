/* eslint-disable import/no-extraneous-dependencies */
import crypto from 'node:crypto';
import path from 'node:path';
import preact from '@preact/preset-vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { vitePluginPage } from './config/vitePluginPage';

const cssHashMap = new Map<string, string>();

// https://vitejs.dev/config/
export default defineConfig(({ ssrBuild }) => ({
  build: {
    outDir: ssrBuild ? 'build/server' : 'build',
    rollupOptions: {
      onwarn: (log, warn) => {
        if (
          !['perf_hooks', 'Use of eval'].some((entry) =>
            log.message.includes(entry),
          )
        ) {
          warn(log);
        }
      },
      output: {
        assetFileNames: 'assets/[name]-[hash:6].[ext]',
        chunkFileNames: 'assets/[name]-[hash:6].js',
        entryFileNames: 'assets/[name]-[hash:6].js',
      },
    },
    sourcemap: true,
  },
  css: {
    modules: {
      generateScopedName(name, _, css) {
        if (!cssHashMap.has(css)) {
          cssHashMap.set(
            css,
            crypto.createHash('md5').update(css).digest('hex').slice(0, 6),
          );
        }
        return `${name}_${cssHashMap.get(css)}`;
      },
    },
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
}));
