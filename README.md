# Lembar

[![CI](https://github.com/Panz-08/Lembar-Komik-UI/actions/workflows/ci.yml/badge.svg)](https://github.com/Panz-08/Lembar-Komik-UI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Web buat baca **komik dan novel** dalam satu tempat. Tampilannya sengaja dibuat tenang: rak komik
yang rapi, rak novel dengan sampul generatif, dan pembaca novel dengan tipografi yang enak buat
dibaca lama.

Lembar adalah frontend statis (Vite) yang mengambil data dari
[Komik & Novel API](https://github.com/Panz-08/komik-api-pengembangan). Tidak ada database dan
tidak ada login. Semua riwayat, favorit, dan setelan disimpan di browser lewat `localStorage`.

## Fitur

- **Komik** — cari lintas situs, detail komik, daftar chapter, dan pembaca webtoon/manga.
- **Novel** — rak novel populer, update chapter terbaru, pencarian, detail novel, dan daftar chapter.
- **Pembaca novel** — teks chapter lengkap dengan tipografi serif/sans, ukuran huruf, tinggi
  baris, lebar kolom, latar putih/sepia/abu/gelap, dan rata teks. Nyaman buat sesi baca panjang.
- **Pustaka** — lanjut baca, favorit, rak baca, dan penanda. Komik dan novel masuk ke pustaka yang sama.
- **Tema** — terang, gelap, atau ikut sistem. Warna aksen bisa diganti.
- **Hemat request** — cache sementara, antrian request, dan batas per menit supaya API tidak kena limit.
- **PWA & offline** — bisa di-install ke home screen. Shell aplikasi, metadata, dan gambar chapter
  yang sudah pernah dibuka disimpan di Cache Storage, jadi chapter tersebut tetap terbaca saat
  koneksi putus. Muncul indikator “Offline — menampilkan data tersimpan” saat offline.
- **Mobile friendly** — navigasi bawah, target sentuh besar, dan pembaca layar penuh.

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
(tempat API jalan). Kalau API-mu di alamat lain:

```bash
API_TARGET=https://komik-api-pengembangan.vercel.app npm run dev
```

Build produksi:

```bash
npm run build
npm run preview
```

## Alamat API

Secara bawaan Lembar memakai:

```text
https://komik-api-pengembangan.vercel.app
```

Alamat ini bisa diganti lewat:

1. Variabel lingkungan `VITE_API_BASE` saat build, atau
2. Menu **Setelan → API** di aplikasi (tanpa perlu build ulang).

Kalau kolom alamat dikosongkan, Lembar memakai domain yang sama dengan tempat UI di-deploy.

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Buka [vercel.com/new](https://vercel.com/new), import repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
4. (Opsional) tambahkan `VITE_API_BASE` kalau API-mu bukan default.
5. Deploy.

`vercel.json` sudah mengatur build dan cache untuk asset.

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
   Di luar Wokku, UI tetap memakai API Vercel. `VITE_API_BASE` bisa dipakai untuk menimpa
   keduanya saat build.

Contoh hasil deploy: `https://lembar-komik-ui.wokku.app`.

## Struktur

```text
index.html          shell aplikasi, font, dan metadata
src/main.js         router, data API, semua tampilan, pembaca komik & novel
src/style.css       tema, komponen, dan tipografi
vite.config.js      dev server + proxy /api
vercel.json         konfigurasi deploy
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
