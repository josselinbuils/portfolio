/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import preact from '@preact/preset-vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { vitePluginPage } from './config/vitePluginPage';

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
}));
