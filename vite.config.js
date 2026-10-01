import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // GitHub Pages بينشر المشروع تحت /pharmacy-store/ (في البناء بس)
  base: command === 'build' ? '/pharmacy-store/' : '/',
  plugins: [react()],
  server: { watch: { ignored: ['**/server/**'] } },
}));
