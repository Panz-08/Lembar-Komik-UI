// Proxy same-origin untuk Komik & Novel API.
//
// Browser memanggil /api/... di domain Lembar. Fungsi ini menambahkan API key
// di server, jadi kunci tidak pernah ikut ke bundle JavaScript atau DevTools.
//
// Catatan routing Vercel: catch-all `api/[...path].js` di project non-Next
// hanya cocok untuk satu level path. Karena itu file ini bernama `api/index.js`
// dan vercel.json punya rewrite `/api/(.*)` -> `/api/index` agar path bertingkat
// seperti /api/comics/:slug dan /api/novels/:slug tetap sampai ke fungsi ini.
//
// Environment yang dibutuhkan di Vercel:
//   KOMIK_API_KEY  - API key dari project komik-api-pengembangan
//   KOMIK_API_BASE - opsional, default https://komik-api-pengembangan.vercel.app
//   KOMIK_PROXY_TIMEOUT_MS - opsional, default 60000

const API_BASE = String(
  process.env.KOMIK_API_BASE || 'https://komik-api-pengembangan.vercel.app',
).replace(/\/+$/, '');

// Kalau yang ditempel ternyata daftar API_KEYS (dipisah koma), pakai kunci pertama.
// API hanya butuh satu kunci yang valid.
const API_KEY = String(process.env.KOMIK_API_KEY || '').trim().split(',')[0].trim();

const parsedTimeout = Number(process.env.KOMIK_PROXY_TIMEOUT_MS || 60000);
const TIMEOUT_MS = Number.isFinite(parsedTimeout) && parsedTimeout > 0
  ? Math.floor(parsedTimeout)
  : 60000;

function sendJson(res, status, code, message, extra = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ success: false, error: message, code, ...extra }));
}

function snippet(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

async function proxy(req, res) {
  if (!API_KEY) {
    return sendJson(
      res,
      500,
      'CONFIG',
      'KOMIK_API_KEY belum diatur di environment Vercel project Lembar.',
    );
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return sendJson(res, 405, 'METHOD_NOT_ALLOWED', 'Hanya GET/HEAD yang didukung.');
  }

  // req.url berisi path lengkap, mis. /api/novels?limit=5. Vercel mempertahankan
  // path asli walau request sudah di-rewrite ke /api/index.
  const incoming = new URL(req.url, 'http://localhost');
  const params = new URLSearchParams(incoming.search);
  let pathname = incoming.pathname;

  // Jaring pengaman kalau suatu saat path asli tidak ikut terbawa rewrite.
  if (pathname === '/api' || pathname === '/api/index' || pathname === '/api/index.js') {
    const override = params.get('__path');
    if (override != null) {
      params.delete('__path');
      pathname = `/api/${String(override).replace(/^\/+/, '')}`;
    }
  }

  if (!pathname.startsWith('/api/')) {
    return sendJson(
      res,
      500,
      'PROXY_ROUTE',
      'Proxy tidak menerima path API yang valid.',
      { path: pathname },
    );
  }

  const query = params.toString();
  const target = `${API_BASE}${pathname}${query ? `?${query}` : ''}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let upstream;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: {
        'x-api-key': API_KEY,
        accept: req.headers.accept || '*/*',
        'accept-language': req.headers['accept-language'] || 'id-ID,id;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    const timeout = error && error.name === 'AbortError';
    return sendJson(
      res,
      timeout ? 504 : 502,
      timeout ? 'TIMEOUT' : 'UPSTREAM_ERROR',
      timeout ? 'API terlalu lama merespons.' : 'Tidak bisa menghubungi API.',
    );
  }
  clearTimeout(timer);

  const contentType = upstream.headers.get('content-type') || '';
  const body = req.method === 'HEAD'
    ? Buffer.alloc(0)
    : Buffer.from(await upstream.arrayBuffer());

  // Endpoint data selalu JSON; /api/image mengembalikan gambar. Kalau upstream
  // mengirim HTML/teks (mis. halaman error platform), ubah jadi JSON supaya
  // aplikasi menampilkan pesan yang jelas, bukan "bukan JSON yang dikenal".
  const isJson = contentType.includes('json');
  const isBinary = /^(image\/|application\/octet-stream|font\/|video\/|audio\/)/i.test(contentType);
  if (!isJson && !isBinary) {
    return sendJson(
      res,
      502,
      'UPSTREAM_BAD_RESPONSE',
      'API membalas dengan format yang tidak dikenal.',
      {
        upstreamStatus: upstream.status,
        upstreamContentType: contentType || '(kosong)',
        upstreamBody: snippet(body.toString('utf8')),
        target: pathname,
      },
    );
  }

  res.statusCode = upstream.status;

  // Header yang aman diteruskan. Jangan teruskan content-encoding karena fetch
  // Node sudah mendekode body; content-length dihitung ulang dari Buffer.
  for (const name of ['content-type', 'cache-control', 'etag', 'last-modified', 'content-disposition']) {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  }
  res.setHeader('Content-Length', String(body.length));
  res.setHeader('X-Content-Type-Options', 'nosniff');

  res.end(body);
}

export default async function handler(req, res) {
  try {
    await proxy(req, res);
  } catch (error) {
    if (res.headersSent) return res.end();
    console.error('[lembar-proxy]', error);
    return sendJson(res, 500, 'PROXY_ERROR', 'Proxy gagal memproses permintaan.');
  }
}
