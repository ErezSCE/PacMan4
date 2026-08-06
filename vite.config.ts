import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import gzipPlugin from 'rollup-plugin-gzip';

export default defineConfig({
  plugins: [react(), gzipPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'howler'],
        },
      },
      plugins: [gzipPlugin()],
    },
  },
});
