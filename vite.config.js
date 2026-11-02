import { defineConfig } from 'vite';

// Saat `npm run dev`, semua request /api diteruskan ke API Komik Scraper milikmu.
// Ubah targetnya lewat variabel API_TARGET kalau API-mu tidak di localhost:3000.
const TARGET = process.env.API_TARGET || 'http://localhost:3000';

export default defineConfig({
  server: {
    proxy: {
      '/api': { target: TARGET, changeOrigin: true }
    }
  },
  build: { target: 'es2019', sourcemap: false }
});
