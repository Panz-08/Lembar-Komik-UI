import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Saat `npm run dev`, semua request /api diteruskan ke API Komik & Novel milikmu.
// Ubah targetnya lewat variabel API_TARGET kalau API-mu tidak di localhost:3000.
const TARGET = process.env.API_TARGET || 'http://localhost:3000';

const DAY = 24 * 60 * 60;

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png'],
      manifest: {
        name: 'Lembar - Baca Komik & Novel',
        short_name: 'Lembar',
        description:
          'Baca komik dan novel dengan tampilan rapi. Riwayat, favorit, dan setelan tersimpan di browser.',
        lang: 'id',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#f6f6f8',
        theme_color: '#f6f6f8',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Gambar chapter: cache dulu supaya chapter yang sudah dibuka tetap
            // terbaca saat offline. Dibatasi 120 entri / 7 hari.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' && url.pathname === '/api/image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'lembar-images',
              expiration: { maxEntries: 120, maxAgeSeconds: 7 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Metadata komik/novel: tampilkan versi cache dulu, lalu perbarui.
            // Dibatasi 200 entri / 24 jam.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              /^\/api\/(sites|sources|search|comics|chapters|novels)/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lembar-api',
              expiration: { maxEntries: 200, maxAgeSeconds: DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    proxy: {
      '/api': { target: TARGET, changeOrigin: true },
    },
  },
  build: { target: 'es2019', sourcemap: false },
});
