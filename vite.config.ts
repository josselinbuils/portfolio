/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  resolve: {
    alias: {
      '@/root': __dirname,
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: { port: 3000 },
});
