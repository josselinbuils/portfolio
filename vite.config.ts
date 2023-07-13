/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  publicDir: false,
  resolve: {
    alias: {
      '@/root': __dirname,
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: { port: 3000 },
});
