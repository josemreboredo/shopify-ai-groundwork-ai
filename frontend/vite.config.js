import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  // The discovery service lives outside this folder (../discovery).
  server: { fs: { allow: ['..'] } },
  // pptxgenjs must be inside the server bundle: left external, the deployed
  // function cannot resolve it and the PowerPoint download fails (2026-09-17).
  ssr: { noExternal: ['pptxgenjs'] },
});
