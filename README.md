# Lembar

[![CI](https://github.com/Panz-08/Lembar-Komik-UI/actions/workflows/ci.yml/badge.svg)](https://github.com/Panz-08/Lembar-Komik-UI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Web buat baca **komik dan novel** dalam satu tempat. Tampilannya sengaja dibuat tenang: rak komik
yang rapi, rak novel dengan sampul generatif, dan pembaca novel dengan tipografi yang enak buat
dibaca lama.

Lembar adalah frontend Vite yang mengambil data dari
[Komik & Novel API](https://github.com/Panz-08/komik-api-pengembangan). Tidak ada database.
Semua riwayat, favorit, dan setelan disimpan di browser lewat `localStorage`.

Di Vercel, request `/api/*` diteruskan oleh fungsi `api/index.js` yang menyimpan API key
di server. Jadi API key tidak ikut ke bundle JavaScript atau DevTools.

## Fitur

- **Komik** - cari lintas situs, detail komik, daftar chapter, dan pembaca webtoon/manga.
- **Novel** - rak novel populer, update chapter terbaru, pencarian, detail novel, dan daftar chapter.
- **Pembaca novel** - teks chapter lengkap dengan tipografi serif/sans, ukuran huruf, tinggi
  baris, lebar kolom, latar putih/sepia/abu/gelap, dan rata teks. Nyaman buat sesi baca panjang.
- **Pustaka** - lanjut baca, favorit, rak baca, dan penanda. Komik dan novel masuk ke pustaka yang sama.
- **Statistik baca** - target chapter harian, streak hari beruntun, grafik 14 hari, dan judul yang
  paling banyak dibaca. Semua dihitung lokal tanpa mengirim data ke mana pun.
- **Tema** - terang, gelap, atau ikut sistem. Warna aksen bisa diganti.
- **Hemat request** - cache sementara, antrian request, dan batas per menit supaya API tidak kena limit.
- **PWA & offline** - bisa di-install ke home screen. Shell aplikasi, metadata, dan gambar chapter
  yang sudah pernah dibuka disimpan di Cache Storage, jadi chapter tersebut tetap terbaca saat
  koneksi putus. Muncul indikator “Offline - menampilkan data tersimpan” saat offline.
- **Mobile friendly** - navigasi bawah, target sentuh besar, dan pembaca layar penuh.

## PWA & cache offline

Lembar memakai [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) untuk menghasilkan
`manifest.webmanifest` dan service worker saat build. Setelah halaman dibuka sekali:

- Shell aplikasi (HTML/JS/CSS/ikon) di-*precache*.
- Gambar chapter di-cache dengan strategi **CacheFirst**, maksimal 120 gambar / 7 hari.
- Metadata komik, chapter, dan novel di-cache dengan **StaleWhileRevalidate**, maksimal
  200 entri / 24 jam.
- Chapter yang sudah pernah dibuka tetap bisa dibaca saat offline. Cache lama dibersihkan
  otomatis saat service worker diperbarui.

Untuk memasang: buka situs di Chrome/Edge/Android, lalu pilih **Install app** atau
**Tambahkan ke layar utama**. Build tetap statis dan tidak butuh server tambahan.

## Catatan soal novel

API novel mengirim **metadata, daftar chapter, excerpt, dan teks chapter lengkap** dalam bentuk
paragraf biasa. Pembaca novel di Lembar menampilkan teks itu dengan tipografi yang nyaman,
lengkap dengan penanda, daftar chapter, dan tombol **Buka di Sakuranovel** kalau kamu mau
membacanya langsung di sumber. Teks tetap milik penulis dan penerjemahnya.

Sampul novel juga tidak tersedia dari API. Lembar membuat sampul generatif dari judul dan jumlah
chapter, jadi tiap novel tetap punya identitas visual tanpa gambar palsu.

## Jalankan lokal

Butuh Node.js 18 atau lebih baru.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Saat mode dev, request `/api` diteruskan ke `http://localhost:3000`
(tempat API jalan). Kalau API-mu di alamat lain dan sudah dikunci, isi `API_TARGET` dan
`KOMIK_API_KEY` lewat shell atau `.env.local`:

```bash
API_TARGET=https://komik-api-pengembangan.vercel.app \
KOMIK_API_KEY=isi_api_key_kamu \
npm run dev
```

Atau salin `.env.example` menjadi `.env.local`. `KOMIK_API_KEY` sengaja tanpa prefix `VITE_`
supaya hanya dibaca dev server, bukan dikirim ke browser.

Build produksi:

```bash
npm run build
npm run preview
```

## Alamat API

Di Vercel, biarkan alamat API **kosong**. Lembar memanggil `/api/...` di domainnya sendiri,
lalu `api/index.js` menambahkan `KOMIK_API_KEY` di server dan meneruskannya ke API.

Alamat API bisa ditimpa lewat:

1. Variabel lingkungan `VITE_API_BASE` saat build, atau
2. Menu **Setelan → API** di aplikasi (tanpa perlu build ulang).

Kalau kolom alamat dikosongkan, Lembar memakai domain yang sama dengan tempat UI di-deploy.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Buka [vercel.com/new](https://vercel.com/new), import repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Tambahkan environment variable:

   | Nama | Wajib | Keterangan |
   |------|-------|------------|
   | `KOMIK_API_KEY` | ya | API key dari project `komik-api-pengembangan` |
   | `KOMIK_API_BASE` | tidak | Default: `https://komik-api-pengembangan.vercel.app` |
   | `KOMIK_PROXY_TIMEOUT_MS` | tidak | Default: `60000` |

   Jangan memakai prefix `VITE_` untuk `KOMIK_API_KEY`. Kalau dulu pernah mengisi
   `VITE_API_BASE` dengan alamat API Vercel, hapus variabel itu agar Lembar memakai proxy.

5. Deploy, lalu redeploy setelah mengubah environment variable.

### Wajib untuk pemakaian pribadi

Karena Lembar punya proxy yang menyimpan API key, siapa pun yang bisa membuka UI juga bisa
memakai API lewat proxy. Supaya hanya kamu yang bisa memakainya:

1. Buka **Vercel → Project Lembar → Settings → Deployment Protection**.
2. Pilih **Vercel Authentication**.
3. Pilih scope **All Deployments** (Production + Preview).
4. Simpan, lalu buka Lembar sambil login dengan akun Vercel kamu.

Vercel Authentication gratis di semua paket. Dengan ini, orang lain harus login ke akun
Vercel yang punya akses ke project; mereka tidak bisa membuka UI maupun endpoint `/api`
proxy-nya.

Kalau UI dibiarkan publik, API kamu juga efektif publik lewat proxy, walaupun API key-nya
tidak terlihat di browser.

`vercel.json` sudah mengatur build, cache asset, dan `maxDuration` fungsi proxy.

## Deploy ke Wokku

Lembar juga bisa jalan sebagai app Node.js di Wokku. Repo ini sudah menyiapkan `serve`:

- `npm start` menjalankan `serve -s dist -l $PORT`.
- `Procfile` berisi `web: npm start`.
- Nixpacks otomatis menjalankan `npm run build` lalu `npm start`.

Langkahnya:

1. Buat app di dashboard Wokku, pilih server yang sudah terhubung.
2. Tambahkan remote dan push:

   ```bash
   git remote add wokku git@git.wokku.cloud:lembar-komik-ui
   git push wokku main
   ```

3. Kalau API juga jalan di Wokku, UI otomatis memakai
   `https://komik-api-pengembangan.wokku.app` berdasarkan hostname `wokku.app`.
   Di luar Wokku, UI memakai proxy same-origin di deployment Vercel.
   Proxy `api/index.js` hanya tersedia di Vercel; kalau API Wokku dikunci dengan
   `API_KEYS`, gunakan deployment Vercel atau tambahkan proxy sendiri di Wokku.
   `VITE_API_BASE` bisa dipakai untuk menimpa alamat API saat build.

Contoh hasil deploy: `https://lembar-komik-ui.wokku.app`.

## Struktur

```text
index.html          shell aplikasi, font, dan metadata
src/main.js         router, data API, semua tampilan, pembaca komik & novel
src/style.css       tema, komponen, dan tipografi
api/index.js        proxy /api server-side yang menyimpan API key
vite.config.js      dev server + proxy /api
vercel.json         konfigurasi deploy + rewrite /api + maxDuration proxy
.env.example        contoh env untuk dev
```

## Pintasan

Berlaku saat sedang membaca:

| Tombol | Fungsi |
|--------|--------|
| `N` / `P` | chapter berikutnya / sebelumnya |
| `J` / `K` | gulir turun / naik |
| `B` | simpan penanda |
| `C` | daftar chapter |
| `S` | setelan baca |
| `F` | layar penuh |
| `Esc` | kembali |
| `/` | fokus ke pencarian |

## Lisensi

MIT. Data dan hak cipta komik/novel tetap milik situs dan kreator masing-masing. Lembar tidak
berafiliasi dengan sumber mana pun.
