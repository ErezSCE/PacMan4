import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import gzipPlugin from 'rollup-plugin-gzip';
import { resolve } from 'path';
import { generateSW } from 'workbox-build';

export default defineConfig({
  // Plugins for Vite build
  plugins: [
    react(),
    // Custom plugin to generate Service Worker with Workbox after build
    {
      name: 'workbox-generate-sw',
      async closeBundle() {
        const swDest = resolve(__dirname, 'dist', 'service-worker.js');
        await generateSW({
          swDest,
          globDirectory: resolve(__dirname, 'dist'),
          globPatterns: ['**/*.{js,css,html,png,svg,webp,mp3,ogg}'],
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                },
              },
            },
          ],
        });
        console.log('Service worker generated at', swDest);
      },
    },
    gzipPlugin(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'howler'],
        },
      },
    },
  },
});
