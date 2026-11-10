import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const DAY = 24 * 60 * 60;

export default defineConfig(({ mode }) => {
  // Saat `npm run dev`, semua request /api diteruskan ke API Komik & Novel.
  // API_TARGET bisa diisi lewat shell atau .env.local.
  const env = loadEnv(mode, process.cwd(), '');
  const TARGET = process.env.API_TARGET || env.API_TARGET || 'http://localhost:3000';

  // KOMIK_API_KEY hanya dipakai oleh dev server (Node), tidak pernah masuk bundle.
  // Isi kalau API tujuan sudah dikunci dengan API key.
  const API_KEY = String(process.env.KOMIK_API_KEY || env.KOMIK_API_KEY || '').trim();

  const apiProxy = { target: TARGET, changeOrigin: true };
  if (API_KEY) apiProxy.headers = { 'x-api-key': API_KEY };

  return {
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
        '/api': apiProxy,
      },
    },
    build: { target: 'es2019', sourcemap: false },
  };
});
