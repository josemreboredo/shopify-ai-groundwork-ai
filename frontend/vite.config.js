import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  // The discovery service lives outside this folder (../discovery).
  server: { fs: { allow: ['..'] } },
});
