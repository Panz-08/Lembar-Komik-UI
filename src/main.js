import './style.css';

/* ============================================================
   Utilities
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const enc = encodeURIComponent;
const dec = s => { try { return decodeURIComponent(s); } catch (e) { return s; } };
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); const l = ks.pop(); ks.reduce((a, k) => a[k], o)[l] = v; };
const clone = o => JSON.parse(JSON.stringify(o));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const bg = u => (u ? `background-image:url(&quot;${esc(u)}&quot;)` : '');

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('on'), 2800);
}
function ago(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return 'barusan';
  if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
  if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
  if (s < 2592000) return Math.floor(s / 86400) + ' hari lalu';
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Link udah disalin'); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Link udah disalin'); } catch (_) { toast('Gagal menyalin'); }
    ta.remove();
  }
}

/* ============================================================
   Icons
   ============================================================ */
const IC = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  compass: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  library: '<rect x="3" y="4" width="4" height="16" rx="1"/><rect x="9" y="4" width="4" height="16" rx="1"/><path d="M15 6l4-1 2 14-4 1z"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>',
  bookmark: '<path d="M6 4h12v16l-6-4-6 4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  moon: '<path d="M20 14A8 8 0 019.5 4 8 8 0 1020 14z"/>',
  auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M12 3a9 9 0 010 18" fill="currentColor"/>',
  sort: '<path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  refresh: '<path d="M20 11a8 8 0 10-2.3 6M20 4v7h-7"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1"/>',
  book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'
};
const ico = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ============================================================
   Storage: setelan + pustaka (semua di localStorage, tanpa database)
   ============================================================ */
const mem = {};
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); if (v != null) return JSON.parse(v); } catch (e) { /* ignore */ } return k in mem ? mem[k] : d; },
  set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
};
function merge(a, b) {
  for (const k in b) {
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) merge(a[k], b[k]);
    else a[k] = b[k];
  }
  return a;
}
// Alamat API: kosong = domain yang sama (dev server meneruskan /api ke API lokal).
// Untuk produksi isi lewat variabel VITE_API_BASE atau di Setelan.
const ENV_API = String(import.meta.env.VITE_API_BASE || 'https://komik-api-pengembangan.vercel.app').replace(/\/+$/, '');
const SITE = 'komikindo';
const DEF = {
  api: ENV_API,
  theme: 'auto', accent: 'coral', density: 'm',
  net: { limit: 100, imgProxy: true },
  rd: { mode: 'scroll', width: 'm', gap: 's', bg: 'black', autoHide: true, prefetch: true, bright: 100, speed: 4 }
};
const LDEF = { favs: {}, hist: {}, read: {}, shelf: {}, marks: [], searches: [] };
let S = merge(clone(DEF), store.get('lembar2.settings', {}));
let L = merge(clone(LDEF), store.get('lembar2.library', {}));
const saveS = () => store.set('lembar2.settings', S);
const saveLNow = () => store.set('lembar2.library', L);
const saveL = debounce(saveLNow, 350);
window.addEventListener('beforeunload', saveLNow);

/* ============================================================
   Tema
   ============================================================ */
const ACC = {
  coral: ['#e8431f', '#ff7a55', 'Koral'], blue: ['#2457e6', '#7a9bff', 'Biru'], green: ['#0f8a5f', '#3ccf97', 'Hijau'],
  violet: ['#6a3de8', '#a98bff', 'Ungu'], rose: ['#d02a78', '#ff86bb', 'Mawar'], amber: ['#b86200', '#ffb04a', 'Jingga']
};
const mq = window.matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const dark = S.theme === 'dark' || (S.theme === 'auto' && mq.matches);
  const r = document.documentElement;
  r.dataset.theme = dark ? 'dark' : 'light';
  r.dataset.density = S.density;
  const a = ACC[S.accent] || ACC.coral;
  r.style.setProperty('--accent', dark ? a[1] : a[0]);
  r.style.setProperty('--accent-ink', dark ? '#12100e' : '#ffffff');
  const b = $('#themeBtn');
  if (b) { b.innerHTML = ico(S.theme === 'auto' ? 'auto' : dark ? 'moon' : 'sun'); b.title = 'Tema: ' + ({ auto: 'ikut sistem', light: 'terang', dark: 'gelap' }[S.theme]); }
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = dark ? '#0c0d11' : '#f6f6f8';
}
if (mq.addEventListener) mq.addEventListener('change', () => { if (S.theme === 'auto') applyTheme(); });

/* ============================================================
   Lapisan jaringan untuk API Komik Scraper
   Semua balasan berbentuk { success, data } atau { success:false, error, code }.
   ============================================================ */
const hits = [];          // waktu tiap request JSON yang benar-benar keluar
let cooldownUntil = 0, lastWaitToast = 0;
const winUsed = () => { const t = Date.now() - 60000; while (hits.length && hits[0] < t) hits.shift(); return hits.length; };
const limitN = () => Math.max(5, Math.min(120, +S.net.limit || 100));
async function slot() {
  for (;;) {
    const now = Date.now();
    if (now < cooldownUntil) { await sleep(cooldownUntil - now); continue; }
    if (winUsed() < limitN()) { hits.push(Date.now()); return; }
    const wait = Math.max(250, hits[0] + 60000 - now + 25);
    if (wait > 1500 && now - lastWaitToast > 8000) { lastWaitToast = now; toast('Lagi ngantri sebentar biar nggak kena limit…'); }
    await sleep(wait);
  }
}
class ApiError extends Error {
  constructor(msg, status, code) { super(msg); this.status = status; this.code = code; }
}
const base = () => S.api.replace(/\/+$/, '');
const absUrl = u => (!u ? '' : /^(https?:|data:|blob:)/i.test(u) ? u : base() + (u.startsWith('/') ? u : '/' + u));
async function request(path, attempt = 0) {
  await slot();
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), 30000);
  let r, text;
  try { r = await fetch(base() + '/api' + path, { signal: ctl.signal }); text = await r.text(); }
  catch (e) {
    if (e && e.name === 'AbortError') throw new ApiError('Servernya kelamaan jawab. Coba lagi sebentar ya.', 0, 'TIMEOUT');
    throw new ApiError('Nggak bisa nyambung ke API' + (base() ? ' di ' + base() : '') + '. Pastikan API kamu lagi jalan (npm start) dan alamatnya benar.', 0, 'NETWORK');
  } finally { clearTimeout(to); }
  let j = null;
  try { j = JSON.parse(text); } catch (_) { /* bukan JSON */ }
  if (!j || typeof j !== 'object' || !('success' in j)) throw new ApiError('Alamat itu bukan API Komik Scraper (balasannya bukan JSON yang dikenal). Cek Alamat API di Setelan.', r.status, 'NOT_API');
  if (r.status === 429 || j.code === 'RATE_LIMIT') {
    cooldownUntil = Date.now() + 20000;
    if (attempt < 1) { toast('Kena limit dari API, istirahat 20 detik lalu coba lagi otomatis…'); return request(path, attempt + 1); }
    throw new ApiError(j.error || 'Terlalu banyak request. Tunggu sebentar.', 429, 'RATE_LIMIT');
  }
  if (!j.success) throw new ApiError(j.error || 'Terjadi kesalahan', r.status, j.code || 'ERROR');
  return j.data;
}
const mc = new Map();
function cacheGet(path, ttl) {
  const c = mc.get(path);
  if (c && Date.now() - c.t < ttl) return c.v;
  try { const raw = sessionStorage.getItem('lc2:' + path); if (raw) { const o = JSON.parse(raw); if (Date.now() - o.t < ttl) { mc.set(path, o); return o.v; } } } catch (e) { /* ignore */ }
  return null;
}
function cacheSet(path, v) {
  const o = { t: Date.now(), v };
  mc.set(path, o);
  try { const s = JSON.stringify(o); if (s.length < 400000) sessionStorage.setItem('lc2:' + path, s); }
  catch (e) { try { Object.keys(sessionStorage).filter(k => k.startsWith('lc2:')).forEach(k => sessionStorage.removeItem(k)); } catch (_) { /* ignore */ } }
}
const inflight = new Map();
function get(path, ttl = 300000) {
  const key = base() + path;
  const c = cacheGet(key, ttl);
  if (c) return Promise.resolve(c);
  if (inflight.has(key)) return inflight.get(key);
  const p = request(path).then(v => { cacheSet(key, v); return v; }).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/* ---------- normalisasi data dari API ---------- */
const coverOf = c => (S.net.imgProxy && c.coverProxy ? absUrl(c.coverProxy) : c.cover || absUrl(c.coverProxy));
const normComic = c => ({ slug: c.id, title: c.title || c.id, image: coverOf(c), url: c.url || '' });
function normDetail(d) {
  return {
    slug: d.id, title: d.title || d.id, image: coverOf(d), summary: d.summary || '', genres: d.genres || [],
    status: d.status || '', url: d.url || '',
    chapters: (d.chapters || []).map(c => ({ id: c.id, title: c.title || 'Chapter', number: c.number == null ? null : c.number, date: c.date || '', url: c.url || '' }))
  };
}
function normPages(p) {
  const raw = p.pages || [];
  const prox = (p.proxy || []).map(absUrl);
  const useProxy = S.net.imgProxy && prox.length === raw.length;
  return { title: p.title || '', imgs: useProxy ? prox : raw, alt: useProxy ? raw : (prox.length === raw.length ? prox : []) };
}
const api = {
  search: (q, page = 1) => get(`/search?q=${enc(q)}&site=${SITE}&page=${page}`).then(d => {
    const items = (d.results || []).map(normComic).filter(i => i.slug && i.title);
    return { items, hasNext: items.length >= 10 };
  }),
  comic: slug => get(`/comics/${enc(slug)}?site=${SITE}`, 600000).then(normDetail),
  pages: id => get(`/chapters/${enc(id)}/pages?site=${SITE}`, 1800000).then(normPages),
  sites: () => request('/sites')
};
function ascChapters(chs) {
  const list = chs.slice();
  if (list.length < 2) return list;
  const a = list[0].number, b = list[list.length - 1].number;
  if (a != null && b != null) return a > b ? list.reverse() : list;
  return list.reverse();   // komikindo menampilkan terbaru di atas
}

/* ============================================================
   Pustaka (kunci = slug komik)
   ============================================================ */
const isFav = slug => !!L.favs[slug];
function histList() { return Object.entries(L.hist).map(([slug, h]) => ({ slug, ...h })).sort((a, b) => b.ts - a.ts); }
const readCount = () => Object.values(L.read).reduce((n, o) => n + Object.keys(o).length, 0);
function markRead(slug, ch) { (L.read[slug] = L.read[slug] || {})[ch] = 1; saveL(); }

/* ============================================================
   Komponen UI
   ============================================================ */
const app = $('#app');
let navToken = 0, heroTimer = 0, meterTimer = 0;
const setApp = html => { app.innerHTML = html; app.style.animation = 'none'; void app.offsetWidth; app.style.animation = ''; };
const hrefTitle = slug => `#/title/${enc(slug)}`;
const hrefRead = (slug, ch, q) => `#/read/${enc(slug)}/${enc(ch)}${q ? '?' + q : ''}`;
const imgTag = (src, cls = 'cimg') => src ? `<img class="${cls}" src="${esc(src)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '';
function card(it, o = {}) {
  const sub = o.sub != null ? o.sub : '';
  return `<a class="card" href="${hrefTitle(it.slug)}" title="${esc(it.title)}">
    <div class="cover"><span class="ph">${esc((it.title || '?').trim().charAt(0).toUpperCase())}</span>${imgTag(it.image)}
    ${isFav(it.slug) ? `<span class="fav">${ico('heart', 18).replace('fill="none"', 'fill="currentColor"')}</span>` : ''}
    ${o.progress != null ? `<i class="bar"><b style="width:${Math.max(3, Math.round(o.progress * 100))}%"></b></i>` : ''}</div>
    <div class="ct">${esc(it.title)}</div>${sub ? `<div class="cm">${esc(sub)}</div>` : ''}</a>`;
}
const skelGrid = n => `<div class="grid">${Array.from({ length: n }, () => '<div><div class="sk" style="aspect-ratio:3/4;border-radius:18px"></div><div class="sk" style="height:12px;margin-top:10px;width:90%"></div><div class="sk" style="height:10px;margin-top:6px;width:55%"></div></div>').join('')}</div>`;
function errorBlock(e) {
  const cfg = e && (e.code === 'NOT_API' || e.code === 'NETWORK');
  return `<div class="state"><h3>Waduh, gagal memuat</h3><p>${esc((e && e.message) || e)}</p>
    ${cfg ? `<div class="bform" style="justify-content:center"><input class="txt" id="apiIn" value="${esc(S.api)}" placeholder="http://localhost:3000" spellcheck="false" style="max-width:320px" aria-label="Alamat API"><button class="btn" data-act="setapi">Simpan alamat</button></div>` : ''}
    <div class="acts"><button class="btn pri" data-act="retry">${ico('refresh', 18)} Coba lagi</button><a class="btn" href="#/settings">Buka Setelan</a></div></div>`;
}
const seg = (path, opts) => `<div class="seg" data-set="${path}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" class="${String(getPath(S, path)) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
const toggle = path => `<label class="sw"><input type="checkbox" data-toggle="${path}" ${getPath(S, path) ? 'checked' : ''}><span></span></label>`;
const range = (path, min, max, step) => `<input type="range" data-range="${path}" min="${min}" max="${max}" step="${step}" value="${getPath(S, path)}">`;
function greet() {
  const h = new Date().getHours();
  const t = h < 4 ? 'Masih melek nih' : h < 11 ? 'Pagi' : h < 15 ? 'Siang' : h < 19 ? 'Sore' : 'Malam';
  return t + '! Mau baca apa hari ini?';
}

/* ============================================================
   Router
   ============================================================ */
function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/home';
  const [p, q] = h.split('?');
  return { seg: p.split('/').filter(Boolean).map(dec), q: new URLSearchParams(q || '') };
}
function updateChrome(page) {
  const defs = [['home', 'Beranda', 'home', '#/home'], ['browse', 'Cari', 'compass', '#/browse'], ['library', 'Pustaka', 'library', '#/library/continue'], ['settings', 'Setelan', 'settings', '#/settings']];
  const on = page === 'title' ? 'home' : page;
  $('#nav').innerHTML = defs.map(d => `<a href="${d[3]}" class="${on === d[0] ? 'on' : ''}">${ico(d[2], 18)}${d[1]}</a>`).join('');
  $('#tabbar').innerHTML = defs.map(d => `<a href="${d[3]}" class="${on === d[0] ? 'on' : ''}">${ico(d[2], 22)}${d[1]}</a>`).join('');
}
function route() {
  stopReader();
  clearInterval(heroTimer); clearInterval(meterTimer);
  const { seg: s, q } = parseHash();
  const page = s[0] || 'home';
  document.body.classList.remove('reading');
  $('#reader').innerHTML = '';
  if (page === 'read' && s.length >= 3) { updateChrome('read'); return viewRead(s[1], s[2], q); }
  window.scrollTo(0, 0);
  if (page === 'title' && s.length >= 2) { updateChrome('title'); return viewTitle(s[1]); }
  if (page === 'browse') { updateChrome('browse'); return viewBrowse(q); }
  if (page === 'library') { updateChrome('library'); return viewLibrary(s[1] || 'continue'); }
  if (page === 'settings') { updateChrome('settings'); return viewSettings(); }
  updateChrome('home'); return viewHome();
}

/* ============================================================
   Beranda
   API ini hanya punya pencarian, jadi rak di beranda diisi dari
   beberapa kata kunci populer (1 request per rak, di-cache 5 menit).
   ============================================================ */
const RAILS = [['Isekai', 'isekai'], ['Cinta', 'love'], ['Pahlawan', 'hero'], ['Sekolah', 'school']];
const MOODS = [['Isekai', 'isekai'], ['Romantis', 'romance'], ['Aksi', 'action'], ['Fantasi', 'fantasy'], ['Komedi', 'comedy'], ['Horor', 'horror'], ['Sekolah', 'school'], ['Sihir', 'magic'], ['Naga', 'dragon'], ['Raja', 'king']];
const KICKS = ['Lagi rame dicari', 'Wajib coba', 'Pilihan hari ini', 'Banyak yang nungguin', 'Jangan sampai ketinggalan'];
const moodStrip = () => `<div class="gstrip">${MOODS.map(([l, q]) => `<a class="chip" href="#/browse?q=${enc(q)}">${l}</a>`).join('')}</div>`;
function heroHTML(items, label) {
  return `<div class="hero" id="hero">${items.map((it, i) => `<div class="slide ${i === 0 ? 'on' : ''}"><div class="hero-bg" style="${bg(it.image)}"></div>
    <div class="hero-in"><div class="hc">${imgTag(it.image, '')}</div><div style="min-width:0">
    <span class="kick">${KICKS[i % KICKS.length]}</span><h2>${esc(it.title)}</h2>
    <div class="meta"><span>Komikindo</span><span>${esc(label)}</span></div>
    <a class="btn pri" href="${hrefTitle(it.slug)}">${ico('book', 18)} Gas baca</a></div></div></div>`).join('')}
    ${items.length > 1 ? `<div class="dots">${items.map((_, i) => `<button class="${i === 0 ? 'on' : ''}" data-act="hero" data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}</div>` : ''}</div>`;
}
function startHero() {
  const h = $('#hero'); if (!h) return;
  const slides = $$('.slide', h), dots = $$('.dots button', h);
  if (slides.length < 2) return;
  let i = 0;
  h._go = n => { i = (n + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('on', k === i)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  if (reduceMotion) return;
  heroTimer = setInterval(() => { if (!h.matches(':hover') && document.hasFocus()) h._go(i + 1); }, 6500);
}
function contSection() {
  const hist = histList().slice(0, 14);
  if (!hist.length) return '';
  return `<section class="sec"><div class="sec-h"><h2>Lanjut baca yuk</h2><a class="more" href="#/library/continue">Semua ${ico('right', 16)}</a></div><div class="hscroll">${hist.map(h => `<a class="card" href="${hrefRead(h.slug, h.chapterId, 'p=' + (h.progress || 0).toFixed(3) + '&pg=' + (h.page || 0))}" title="${esc(h.item.title)}"><div class="cover"><span class="ph">${esc(h.item.title.charAt(0).toUpperCase())}</span>${imgTag(h.item.image)}<i class="bar"><b style="width:${Math.max(4, Math.round((h.progress || 0) * 100))}%"></b></i></div><div class="ct">${esc(h.item.title)}</div><div class="cm">${esc(h.chapterTitle || '')}</div></a>`).join('')}</div></section>`;
}
function favSection() {
  const fs = Object.values(L.favs).sort((a, b) => b.ts - a.ts).slice(0, 14);
  if (!fs.length) return '';
  return `<section class="sec"><div class="sec-h"><h2>Favoritmu</h2><a class="more" href="#/library/fav">Semua ${ico('right', 16)}</a></div><div class="hscroll">${fs.map(f => card(f.item)).join('')}</div></section>`;
}
async function viewHome() {
  const my = ++navToken;
  setApp(`<div class="page-h"><div><h1>Beranda</h1><p class="sub">${esc(greet())}</p></div></div>
    <div id="heroBox"><div class="sk" style="height:330px;border-radius:28px"></div></div>
    ${contSection()}${favSection()}${moodStrip()}
    <div id="rails">${skelGrid(6)}</div>`);
  const res = await Promise.allSettled(RAILS.map(r => api.search(r[1], 1)));
  if (my !== navToken) return;
  const ok = res.map((r, i) => (r.status === 'fulfilled' && r.value.items.length ? { label: RAILS[i][0], q: RAILS[i][1], items: r.value.items } : null)).filter(Boolean);
  if (!ok.length) {
    $('#heroBox').innerHTML = '';
    const bad = res.find(r => r.status === 'rejected');
    $('#rails').innerHTML = errorBlock(bad ? bad.reason : new Error('API menjawab tapi hasilnya kosong. Coba cari judul lewat kolom pencarian.'));
    return;
  }
  const pool = ok[0].items.filter(i => i.image).slice(0, 5);
  $('#heroBox').innerHTML = pool.length ? heroHTML(pool, ok[0].label) : '';
  $('#rails').innerHTML = ok.map(r => `<section class="sec"><div class="sec-h"><h2>${esc(r.label)}</h2><a class="more" href="#/browse?q=${enc(r.q)}">Lihat semua ${ico('right', 16)}</a></div><div class="hscroll stagger">${r.items.slice(0, 14).map(i => card(i)).join('')}</div></section>`).join('');
  startHero();
}

/* ============================================================
   Cari
   ============================================================ */
let B = {}, moreIO;
function viewBrowse(q) {
  navToken++;
  B = { q: (q.get('q') || '').trim(), page: 1, items: [], hasNext: false, loading: false, sort: 'def' };
  const recents = L.searches.length ? `<div class="chips" style="margin-bottom:16px">${L.searches.slice(0, 8).map(s => `<a class="chip" href="#/browse?q=${enc(s)}">${ico('clock', 14)}&nbsp;${esc(s)}</a>`).join('')}</div>` : '';
  setApp(`<div class="page-h"><div><h1>Cari komik</h1><p class="sub">${B.q ? 'Hasil buat “' + esc(B.q) + '”' : 'Ketik judul yang kamu cari'}</p></div></div>
    <form id="bform" class="bform"><div class="field">${ico('search', 18)}<input id="bq" type="search" value="${esc(B.q)}" placeholder="Misalnya: solo leveling" autocomplete="off"></div><button class="btn pri" type="submit">Cari</button>${B.q ? '<a class="btn" href="#/browse">Reset</a>' : ''}</form>
    ${recents}${moodStrip()}
    ${B.q ? `<div class="toolbar" style="margin-top:16px"><select class="sel" id="bsort" aria-label="Urutkan"><option value="def">Urutan asli</option><option value="az">Judul A–Z</option><option value="za">Judul Z–A</option></select><span class="muted" id="bcount"></span></div>
    <div id="bres">${skelGrid(12)}</div><div id="bmore" style="text-align:center;margin-top:26px"></div>`
      : '<div class="state" style="margin-top:20px"><h3>Mau nyari apa?</h3><p>Ketik judul di kolom atas, atau ketuk salah satu kata kunci di atas buat mulai jelajah.</p></div>'}`);
  if (B.q) { pushSearch(B.q); loadBrowse(true); }
}
async function loadBrowse(first) {
  const b = B;
  if (b.loading) return;
  b.loading = true;
  const more = $('#bmore'); if (more && !first) more.innerHTML = '<span class="muted">Memuat…</span>';
  try {
    const r = await api.search(b.q, b.page);
    if (b !== B) return;
    const seen = new Set(b.items.map(i => i.slug));
    const add = r.items.filter(i => !seen.has(i.slug));
    b.items.push(...add);
    b.hasNext = r.hasNext && add.length > 0;
    b.page += 1;
    renderBrowse();
  } catch (e) {
    if (b !== B) return;
    if (first) $('#bres').innerHTML = errorBlock(e); else { toast(e.message); if ($('#bmore')) $('#bmore').innerHTML = '<button class="btn" data-act="more">Coba lagi</button>'; }
  } finally { b.loading = false; }
}
function renderBrowse() {
  let list = B.items.slice();
  if (B.sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title, 'id'));
  if (B.sort === 'za') list.sort((a, b) => b.title.localeCompare(a.title, 'id'));
  $('#bres').innerHTML = list.length ? `<div class="grid">${list.map(i => card(i)).join('')}</div>` : '<div class="state"><h3>Hmm, kosong</h3><p>Nggak ada judul yang cocok. Coba kata kunci lain, misalnya sebagian judulnya saja.</p></div>';
  $('#bcount').textContent = list.length + ' judul';
  const more = $('#bmore');
  more.innerHTML = B.hasNext ? '<button class="btn" data-act="more">Muat lagi</button>' : (B.items.length ? '<span class="muted">Udah sampai ujung daftar</span>' : '');
  if (moreIO) moreIO.disconnect();
  const btn = $('[data-act="more"]', more);
  if (btn && 'IntersectionObserver' in window) { moreIO = new IntersectionObserver(es => { if (es[0].isIntersecting && !B.loading) loadBrowse(false); }, { rootMargin: '400px' }); moreIO.observe(btn); }
}

/* ============================================================
   Detail komik
   ============================================================ */
let D = null;
async function viewTitle(slug) {
  const my = ++navToken;
  setApp('<div class="dh"><div class="dcover sk"></div><div><div class="sk" style="height:46px;width:70%"></div><div class="sk" style="height:16px;width:40%;margin-top:14px"></div><div class="sk" style="height:44px;width:60%;margin-top:26px"></div></div></div>');
  let d;
  try { d = await api.comic(slug); } catch (e) { if (my === navToken) setApp(errorBlock(e)); return; }
  if (my !== navToken) return;
  D = { slug, d, asc: ascChapters(d.chapters), dir: 'desc', filter: '', limit: 100, item: { slug, title: d.title, image: d.image } };
  setApp(`<div class="dwrap"><div class="dbanner"><i style="${bg(d.image)}"></i></div>
    <div class="dh"><div class="dcover"><span style="position:absolute;inset:0;display:grid;place-items:center;font:800 56px var(--f-display);opacity:.3">${esc(d.title.charAt(0).toUpperCase())}</span>${imgTag(d.image, '')}</div>
    <div class="dinfo"><h1>${esc(d.title)}</h1>
    <div class="pills">${d.status ? `<span class="pill">${esc(d.status)}</span>` : ''}<span class="pill">Komikindo</span><span class="pill">${d.chapters.length} chapter</span></div>
    ${d.genres.length ? `<div class="chips">${d.genres.map(g => `<a class="chip" href="#/browse?q=${enc(g)}">${esc(g)}</a>`).join('')}</div>` : ''}
    <div class="acts" id="dacts"></div></div></div></div>
    ${d.summary ? `<section class="syn clamp" id="syn"><div><h2>Ceritanya tentang apa?</h2><p>${esc(d.summary)}</p>${d.summary.length > 280 ? '<button class="linkbtn" data-act="syn">Baca selengkapnya</button>' : ''}</div></section>` : ''}
    <div class="chh"><h2>Daftar chapter <span class="muted" style="font-weight:500">(${d.chapters.length})</span></h2>
    <div class="tools"><div class="field" style="min-width:150px;flex:none"><input id="chq" type="search" placeholder="Cari nomor…" style="padding-top:9px;padding-bottom:9px"></div>
    <button class="btn sm" data-act="chsort">${ico('sort', 16)} <span id="chdir">Terbaru dulu</span></button><button class="btn sm" data-act="markall">${ico('check', 16)} Tandai semua</button></div></div>
    <div id="chbox"></div>`);
  renderActions();
  renderChapters();
}
function renderActions() {
  const el = $('#dacts'); if (!el || !D) return;
  const h = L.hist[D.slug];
  const asc = D.asc;
  let main;
  if (asc.length) {
    const cur = h && asc.find(c => c.id === h.chapterId);
    const nextUnread = asc.find(c => !(L.read[D.slug] || {})[c.id]);
    const target = cur || nextUnread || asc[0];
    const label = cur ? `Lanjut · ${cur.title}` : (nextUnread && nextUnread !== asc[0]) ? `Lanjut ke ${nextUnread.title}` : `Mulai dari ${asc[0].title}`;
    const q = cur && h.progress < 0.97 ? `p=${h.progress.toFixed(3)}&pg=${h.page || 0}` : '';
    main = `<a class="btn pri" href="${hrefRead(D.slug, target.id, q)}">${ico('play', 18)} ${esc(label)}</a>`;
  } else main = '<span class="btn" disabled>Belum ada chapter</span>';
  const sh = L.shelf[D.slug] ? L.shelf[D.slug].status : '';
  el.innerHTML = `${main}<button class="btn ${isFav(D.slug) ? 'on' : ''}" data-act="fav">${ico('heart', 18)} ${isFav(D.slug) ? 'Favorit' : 'Tambah favorit'}</button>
    <select class="sel" data-act="shelf" aria-label="Rak baca"><option value="">Rak: belum diatur</option><option value="reading" ${sh === 'reading' ? 'selected' : ''}>Lagi dibaca</option><option value="plan" ${sh === 'plan' ? 'selected' : ''}>Mau dibaca</option><option value="done" ${sh === 'done' ? 'selected' : ''}>Udah tamat</option></select>
    <button class="btn" data-act="copylink">${ico('link', 18)} Bagikan</button>`;
}
function renderChapters() {
  const box = $('#chbox'); if (!box || !D) return;
  const readMap = L.read[D.slug] || {};
  const h = L.hist[D.slug];
  let list = D.dir === 'desc' ? D.asc.slice().reverse() : D.asc.slice();
  if (D.filter) { const f = D.filter.toLowerCase(); list = list.filter(c => c.title.toLowerCase().includes(f)); }
  const total = list.length;
  list = list.slice(0, D.limit);
  box.innerHTML = total ? `<div class="chlist">${list.map(c => `<a class="chrow ${readMap[c.id] ? 'read' : ''} ${h && h.chapterId === c.id ? 'last' : ''}" href="${hrefRead(D.slug, c.id)}"><span class="n">${esc(c.title)}</span>${c.date ? `<span class="dt">${esc(c.date)}</span>` : ''}<span class="ck">${ico('check', 16)}</span></a>`).join('')}</div>${total > list.length ? `<div style="text-align:center;margin-top:16px"><button class="btn" data-act="chmore">Tampilkan ${total - list.length} lagi</button></div>` : ''}` : '<div class="state"><p style="margin:0">Nggak ada chapter yang cocok.</p></div>';
}

/* ============================================================
   Pustaka
   ============================================================ */
function viewLibrary(tab) {
  navToken++;
  const tabs = [['continue', 'Lanjutin'], ['fav', 'Favorit'], ['shelf', 'Rak baca'], ['marks', 'Penanda']];
  const emptyMsg = t => `<div class="state"><h3>${t}</h3><p>Mulai baca dari Beranda atau Cari, nanti koleksimu muncul di sini. Semuanya disimpan di browser ini.</p><a class="btn pri" href="#/browse">Cari bacaan</a></div>`;
  let body = '';
  if (tab === 'continue') {
    const hs = histList();
    body = hs.length ? `<div class="rows">${hs.map(h => `<div class="lrow"><a class="th" href="${hrefTitle(h.slug)}"><img src="${esc(h.item.image)}" alt="" referrerpolicy="no-referrer" loading="lazy"></a>
      <div class="tx"><b>${esc(h.item.title)}</b><span>${esc(h.chapterTitle || '')} · ${Math.round((h.progress || 0) * 100)}% · ${ago(h.ts)}</span></div>
      <a class="btn pri sm" href="${hrefRead(h.slug, h.chapterId, 'p=' + (h.progress || 0).toFixed(3) + '&pg=' + (h.page || 0))}">Lanjut</a>
      <button class="iconbtn" data-act="rm-hist" data-key="${esc(h.slug)}" title="Hapus dari riwayat">${ico('x', 16)}</button></div>`).join('')}</div>` : emptyMsg('Belum ada yang dibaca');
  } else if (tab === 'fav') {
    const fs = Object.values(L.favs).sort((a, b) => b.ts - a.ts);
    body = fs.length ? `<div class="grid">${fs.map(f => `<div class="lcard">${card(f.item)}<button class="x" data-act="rm-fav" data-key="${esc(f.item.slug)}" title="Hapus favorit">${ico('x', 14)}</button></div>`).join('')}</div>` : emptyMsg('Belum ada favorit');
  } else if (tab === 'shelf') {
    const names = { reading: 'Lagi dibaca', plan: 'Mau dibaca', done: 'Udah tamat' };
    const all = Object.values(L.shelf);
    body = all.length ? Object.keys(names).map(st => { const g = all.filter(x => x.status === st); return g.length ? `<section class="sec" style="margin-top:0;margin-bottom:26px"><div class="sec-h"><h2>${names[st]} <span class="muted" style="font-weight:500">(${g.length})</span></h2></div><div class="grid">${g.map(x => card(x.item)).join('')}</div></section>` : ''; }).join('') : emptyMsg('Rak masih kosong');
  } else {
    const ms = L.marks.slice().sort((a, b) => b.ts - a.ts);
    body = ms.length ? `<div class="rows">${ms.map(m => `<div class="lrow"><a class="th" href="${hrefTitle(m.slug)}"><img src="${esc(m.image || '')}" alt="" referrerpolicy="no-referrer" loading="lazy"></a>
      <div class="tx"><b>${esc(m.title)}</b><span>${esc(m.chapterTitle || '')} · hal. ${(m.page || 0) + 1} · ${ago(m.ts)}</span></div>
      <a class="btn pri sm" href="${hrefRead(m.slug, m.chapterId, 'p=' + (m.progress || 0).toFixed(3) + '&pg=' + (m.page || 0))}">Buka</a>
      <button class="iconbtn" data-act="rm-mark" data-id="${esc(m.id)}" title="Hapus penanda">${ico('x', 16)}</button></div>`).join('')}</div>` : emptyMsg('Belum ada penanda');
  }
  setApp(`<div class="page-h"><div><h1>Pustaka</h1><p class="sub">Koleksi pribadimu, disimpan di browser ini.</p></div></div>
    <div class="stats"><div class="stat"><b>${Object.keys(L.favs).length}</b><span>Favorit</span></div><div class="stat"><b>${Object.keys(L.hist).length}</b><span>Judul dibaca</span></div><div class="stat"><b>${readCount()}</b><span>Chapter kelar</span></div><div class="stat"><b>${L.marks.length}</b><span>Penanda</span></div></div>
    <div class="toolbar"><div class="seg">${tabs.map(([v, l]) => `<a href="#/library/${v}" class="${tab === v ? 'on' : ''}">${l}</a>`).join('')}</div></div>${body}`);
}

/* ============================================================
   Setelan
   ============================================================ */
function updateMeter() {
  const m = $('#meter'); if (!m) return;
  const u = winUsed(), l = limitN();
  m.firstElementChild.style.width = Math.min(100, u / l * 100) + '%';
  m.className = 'meter' + (u >= l ? ' max' : u > l * 0.7 ? ' hot' : '');
  $('#meterTxt').textContent = `${u} dari ${l} request kepakai dalam 60 detik terakhir` + (Date.now() < cooldownUntil ? ' · lagi istirahat sebentar' : '');
}
function viewSettings() {
  navToken++;
  setApp(`<div class="page-h"><div><h1>Setelan</h1><p class="sub">Semua tersimpan otomatis di browser ini.</p></div></div><div class="set">
  <section class="panel"><h2>Tampilan</h2><p>Atur tema, warna, dan ukuran kartu sesuka hati.</p>
    <div class="prow"><span class="lb">Tema</span>${seg('theme', [['auto', 'Ikut sistem'], ['light', 'Terang'], ['dark', 'Gelap']])}</div>
    <div class="prow"><span class="lb">Warna aksen</span><div class="swatches">${Object.entries(ACC).map(([k, a]) => `<button class="swatch ${S.accent === k ? 'on' : ''}" data-act="accent" data-v="${k}" style="background:${a[0]}" title="${a[2]}" aria-label="${a[2]}"></button>`).join('')}</div></div>
    <div class="prow"><span class="lb">Ukuran kartu<small>Berapa banyak judul per baris</small></span>${seg('density', [['s', 'Kecil'], ['m', 'Sedang'], ['l', 'Besar']])}</div></section>
  <section class="panel"><h2>API</h2><p>Lembar membaca komik dari API Komik Scraper milikmu (sumber: komikindo.ch).</p>
    <div class="prow"><label for="baseIn" class="lb">Alamat API<small>Kosong = domain yang sama. Lokal biasanya <code>http://localhost:3000</code></small></label><div style="display:flex;gap:8px;flex:1;min-width:260px"><input class="txt" id="baseIn" value="${esc(S.api)}" placeholder="(domain yang sama)" spellcheck="false"><button class="btn" data-act="saveapi">Simpan</button></div></div>
    <div class="prow"><span class="lb">Gambar lewat proxy API<small>Disarankan. Dipakai buat melewati anti-hotlink komikindo</small></span>${toggle('net.imgProxy')}</div>
    <div class="prow"><span class="lb">Tes koneksi<small>Memanggil /api/sites (1 request)</small></span><button class="btn" data-act="testapi">${ico('refresh', 16)} Tes sekarang</button></div><div class="status" id="apistatus"></div></section>
  <section class="panel"><h2>Batas request</h2><p>API kamu membatasi request per menit per IP. Lembar punya antrian sendiri supaya tidak kena blokir.</p>
    <div class="prow"><span class="lb">Batas per menit<small>Bawaan API: 120 (RATE_LIMIT di .env). Disarankan sedikit di bawahnya</small></span><div style="display:flex;gap:10px;align-items:center">${range('net.limit', 10, 120, 1)}<b id="limOut" style="min-width:30px">${S.net.limit}</b></div></div>
    <div class="prow" style="display:block"><span class="lb">Pemakaian sekarang</span><div class="meter" id="meter"><b></b></div><div class="status" id="meterTxt"></div></div>
    <div class="prow" style="display:block"><span class="lb">Apa maksudnya?</span><p style="margin:6px 0 0;color:var(--muted);font-size:14px">Kalau kebanyakan request dalam satu menit, API membalas error 429 sampai jendela waktunya lewat. Satu halaman biasanya cuma 1–4 request. Gambar chapter lewat <code>/api/image</code> tidak dihitung. Hasil pencarian dan detail juga disimpan sementara (5–10 menit), jadi membuka halaman yang sama berulang tidak memakan kuota.</p></div></section>
  <section class="panel"><h2>Pembaca komik</h2><p>Bawaan untuk semua chapter, bisa diubah juga pas lagi baca.</p>
    <div class="prow"><span class="lb">Mode baca</span>${seg('rd.mode', [['scroll', 'Webtoon'], ['rtl', 'Manga ←'], ['ltr', 'Halaman →']])}</div>
    <div class="prow"><span class="lb">Lebar gambar</span>${seg('rd.width', [['s', 'Sempit'], ['m', 'Sedang'], ['l', 'Lebar'], ['f', 'Penuh']])}</div>
    <div class="prow"><span class="lb">Jarak antar halaman</span>${seg('rd.gap', [['0', 'Rapat'], ['s', 'Tipis'], ['m', 'Lega']])}</div>
    <div class="prow"><span class="lb">Latar</span>${seg('rd.bg', [['black', 'Hitam'], ['gray', 'Abu'], ['theme', 'Ikut tema']])}</div>
    <div class="prow"><span class="lb">Kecerahan</span>${range('rd.bright', 40, 120, 5)}</div>
    <div class="prow"><span class="lb">Kecepatan gulir otomatis</span>${range('rd.speed', 1, 10, 1)}</div>
    <div class="prow"><span class="lb">Sembunyikan bilah saat menggulir</span>${toggle('rd.autoHide')}</div>
    <div class="prow"><span class="lb">Muat chapter berikutnya duluan<small>Lebih mulus, tapi pakai 1 request tambahan</small></span>${toggle('rd.prefetch')}</div></section>
  <section class="panel"><h2>Data</h2><p>Cadangkan atau pindahkan pustaka dan setelan ke perangkat lain.</p>
    <div class="acts" style="margin:0"><button class="btn" data-act="export">Ekspor cadangan</button><label class="btn" style="cursor:pointer">Impor cadangan<input type="file" id="impfile" accept="application/json" hidden></label><button class="btn" data-act="clear-hist">Hapus riwayat</button><button class="btn" data-act="clear-all">Hapus semua data</button></div></section>
  <section class="panel"><h2>Pintasan keyboard</h2><p>Berlaku pas lagi baca.</p><div class="kbd"><span><kbd>N</kbd> / <kbd>P</kbd> chapter berikutnya / sebelumnya</span><span><kbd>←</kbd> <kbd>→</kbd> pindah halaman</span><span><kbd>J</kbd> / <kbd>K</kbd> gulir turun / naik</span><span><kbd>A</kbd> gulir otomatis</span><span><kbd>B</kbd> penanda</span><span><kbd>C</kbd> daftar chapter</span><span><kbd>S</kbd> setelan baca</span><span><kbd>F</kbd> layar penuh</span><span><kbd>Esc</kbd> kembali</span><span><kbd>/</kbd> fokus ke pencarian</span></div></section></div>`);
  updateMeter(); meterTimer = setInterval(updateMeter, 1000);
}
async function testApi() {
  const st = $('#apistatus'); st.className = 'status'; st.textContent = 'Lagi ngetes…';
  const t = performance.now();
  try {
    const sites = await api.sites();
    const k = (sites || []).find(s => s.id === SITE);
    const ms = Math.round(performance.now() - t);
    if (!k) { st.className = 'status err'; st.textContent = `✗ API nyambung (${ms} ms), tapi situs "${SITE}" nggak terdaftar di /api/sites.`; return; }
    st.className = 'status ' + (k.status === 'ready' ? 'ok' : 'err');
    st.textContent = `${k.status === 'ready' ? '✓' : '✗'} Nyambung ke ${base() || 'domain yang sama'} (${ms} ms) · ${k.id}: ${k.status} · ${k.host}`;
  } catch (e) { st.className = 'status err'; st.textContent = '✗ ' + e.message; }
}

/* ============================================================
   Pembaca
   ============================================================ */
const R = { on: false };
let rafAuto = 0, io = null, sheetOpen = false;
function stopReader() {
  if (R.on) { saveProgress(true); saveLNow(); }
  R.on = false; R.auto = false;
  cancelAnimationFrame(rafAuto);
  if (io) { io.disconnect(); io = null; }
  document.removeEventListener('keydown', onKey);
  sheetOpen = false;
}
const readerSkeleton = () => `<div class="rd" data-bg="${S.rd.bg}"><div class="rd-top"><a class="ib" href="#/home" aria-label="Kembali">${ico('left')}</a><div class="rd-ttl"><b>Memuat…</b></div></div><div class="rd-view" style="display:grid;place-items:center"><div class="sk" style="width:min(520px,90%);height:60vh"></div></div></div>`;
async function viewRead(slug, chapterId, q) {
  const my = ++navToken;
  document.body.classList.add('reading');
  const el = $('#reader');
  el.innerHTML = readerSkeleton();
  const [pr, dr] = await Promise.allSettled([api.pages(chapterId), api.comic(slug)]);
  if (my !== navToken) return;
  if (pr.status === 'rejected') {
    el.innerHTML = `<div class="rd" data-bg="theme"><div class="rd-top"><a class="ib" href="${hrefTitle(slug)}" aria-label="Kembali">${ico('left')}</a><div class="rd-ttl"><b>Gagal memuat chapter</b></div></div><div class="rd-view" style="display:grid;place-items:center;padding:20px"><div style="max-width:560px">${errorBlock(pr.reason)}</div></div></div>`;
    return;
  }
  const pg = pr.value;
  const det = dr.status === 'fulfilled' ? dr.value : null;
  const asc = det ? ascChapters(det.chapters) : [];
  const idx = asc.findIndex(c => c.id === chapterId);
  const hh = L.hist[slug];
  Object.assign(R, {
    on: true, slug, chapterId, pg, det, asc, idx,
    imgs: pg.imgs, alt: pg.alt,
    next: idx >= 0 && idx < asc.length - 1 ? asc[idx + 1].id : '',
    prev: idx > 0 ? asc[idx - 1].id : '',
    chTitle: (idx >= 0 && asc[idx].title) || pg.title || 'Chapter',
    item: det ? { slug, title: det.title, image: det.image } : (hh && hh.item) || { slug, title: slug, image: '' },
    page: 0, progress: 0, auto: false, prefetched: false, lastSave: 0
  });
  let resumeP = parseFloat(q.get('p')), resumePg = parseInt(q.get('pg'), 10);
  if (isNaN(resumeP) && hh && hh.chapterId === chapterId && hh.progress < 0.97) { resumeP = hh.progress; resumePg = hh.page; }
  R.resume = { p: isNaN(resumeP) ? 0 : resumeP, pg: isNaN(resumePg) ? 0 : resumePg };
  renderReader();
  saveProgress(true);
  document.addEventListener('keydown', onKey);
}
const isBm = () => L.marks.some(m => m.id === R.slug + '|' + R.chapterId);
function renderReader() {
  $('#reader').innerHTML = `<div class="rd" data-bg="${S.rd.bg}" data-w="${S.rd.width}" data-gap="${S.rd.gap}">
    <div class="rd-line" id="rdLine"></div>
    <div class="rd-top"><a class="ib" href="${hrefTitle(R.slug)}" aria-label="Kembali ke detail">${ico('left')}</a>
      <div class="rd-ttl"><b>${esc(R.item.title)}</b><span>${esc(R.chTitle)}</span></div>
      <button class="ib ${isBm() ? 'on' : ''}" id="bmBtn" data-act="bm" aria-label="Penanda">${ico('bookmark')}</button>
      <button class="ib" data-act="chsheet" aria-label="Daftar chapter">${ico('list')}</button>
      <button class="ib" data-act="rdsheet" aria-label="Setelan baca">${ico('sliders')}</button></div>
    <div class="rd-view" id="rdv" tabindex="0"></div>
    <div class="rd-bot"><button class="ib" data-act="prevch" ${R.prev ? '' : 'disabled'} aria-label="Sebelumnya">${ico('left')}</button>
      <div class="rd-prog"><input type="range" id="rdSlider" min="0" max="1000" value="0" aria-label="Posisi baca"><span id="rdLabel"></span></div>
      <button class="ib" data-act="nextch" ${R.next ? '' : 'disabled'} aria-label="Berikutnya">${ico('right')}</button></div>
    <div class="sheet" id="sheet" hidden></div></div>`;
  applyReaderPrefs();
  renderBody();
  $('#rdSlider').addEventListener('input', onSlider);
  $('#rdv').focus({ preventScroll: true });
}
function applyReaderPrefs(p) {
  const rd = $('.rd'); if (!rd) return;
  rd.dataset.bg = S.rd.bg; rd.dataset.w = S.rd.width; rd.dataset.gap = S.rd.gap;
  rd.style.setProperty('--rb', S.rd.bright / 100);
  if (p === 'rd.mode') renderBody(true);
}
function renderBody(keepPos) {
  const v = $('#rdv'); if (!v) return;
  if (io) { io.disconnect(); io = null; }
  R.auto = false; cancelAnimationFrame(rafAuto);
  const rd = $('.rd');
  const startPage = keepPos ? R.page : R.resume.pg;
  const startP = keepPos ? R.progress : R.resume.p;
  v.onscroll = null; v.onclick = null;
  if (S.rd.mode === 'scroll') {
    const imgs = R.imgs;
    v.innerHTML = `<div class="strip">${imgs.map((u, i) => `<img class="pg" data-i="${i}" src="${esc(u)}" data-alt="${esc((R.alt && R.alt[i]) || '')}" alt="Halaman ${i + 1}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer">`).join('')}</div>${endCard()}`;
    v.addEventListener('load', imgEvt, true); v.addEventListener('error', imgEvt, true);
    v.onscroll = onScroll; v.onclick = onTap;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) { R.page = +e.target.dataset.i; updateLabel(); } }, { root: v, rootMargin: '-45% 0px -54% 0px' });
      $$('.pg', v).forEach(im => io.observe(im));
    }
    if (startPage > 0 || startP > 0) requestAnimationFrame(() => { const t = $(`.pg[data-i="${Math.min(startPage, imgs.length - 1)}"]`, v); if (t && startPage > 0) t.scrollIntoView(); else v.scrollTop = startP * (v.scrollHeight - v.clientHeight); onScroll(); });
  } else {
    const rtl = S.rd.mode === 'rtl';
    v.innerHTML = `<div class="pager"><img id="pimg" alt="" referrerpolicy="no-referrer"><div class="zone zl" data-act="${rtl ? 'pgnext' : 'pgprev'}"></div><div class="zone zr" data-act="${rtl ? 'pgprev' : 'pgnext'}"></div></div>`;
    v.onclick = e => { if (!e.target.closest('.zone')) toggleBars(); };
    showPage(Math.min(Math.max(startPage, 0), R.imgs.length - 1));
  }
  rd.classList.remove('hide');
  updateLabel();
}
function imgEvt(e) {
  const t = e.target;
  if (!t.classList || !t.classList.contains('pg')) return;
  if (e.type === 'load') { t.classList.add('ok'); return; }
  // gagal: coba sekali lewat jalur lain (proxy <-> URL asli), baru tandai error
  if (t.dataset.alt && !t.dataset.fb) { t.dataset.fb = '1'; t.src = t.dataset.alt; return; }
  t.classList.add('err'); t.alt = 'Halaman ' + (+t.dataset.i + 1) + ' gagal dimuat. Ketuk buat coba lagi';
}
function endCard() {
  return `<div class="endcard"><div class="big">${R.next ? 'Chapter kelar!' : 'Udah paling baru'}</div><h3>${esc(R.chTitle)}</h3><p>${R.next ? 'Lanjut ke chapter berikutnya, atau balik ke daftar dulu.' : 'Belum ada chapter lanjutan. Cek lagi nanti ya.'}</p><div class="acts">${R.next ? `<button class="btn pri" data-act="nextch">Lanjut ${ico('right', 18)}</button>` : ''}<a class="btn" href="${hrefTitle(R.slug)}">Daftar chapter</a></div></div>`;
}
function showPage(i) {
  const imgs = R.imgs; i = Math.max(0, Math.min(i, imgs.length - 1));
  R.page = i; R.progress = imgs.length > 1 ? i / (imgs.length - 1) : 1;
  const im = $('#pimg');
  if (im) {
    im.dataset.fb = '';
    im.onerror = () => { const a = R.alt && R.alt[i]; if (a && !im.dataset.fb) { im.dataset.fb = '1'; im.src = a; } };
    im.src = imgs[i];
  }
  [i + 1, i + 2].forEach(j => { if (imgs[j]) { const p = new Image(); p.referrerPolicy = 'no-referrer'; p.src = imgs[j]; } });
  updateLabel(); afterProgress();
}
function pageStep(d) {
  const n = R.imgs.length, t = R.page + d;
  if (t < 0) return R.prev ? goChapter(R.prev) : toast('Ini halaman pertama');
  if (t >= n) { markRead(R.slug, R.chapterId); return R.next ? goChapter(R.next) : toast('Udah sampai chapter terbaru'); }
  showPage(t);
}
function onSlider(e) {
  const v = $('#rdv'); const val = +e.target.value;
  if (S.rd.mode !== 'scroll') showPage(Math.round(val / 1000 * (R.imgs.length - 1)));
  else v.scrollTop = val / 1000 * (v.scrollHeight - v.clientHeight);
}
let lastTop = 0, ticking = false;
function onScroll() {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const v = $('#rdv'); if (!v) return;
    const max = v.scrollHeight - v.clientHeight;
    R.progress = max > 0 ? Math.min(1, v.scrollTop / max) : 1;
    const d = v.scrollTop - lastTop; lastTop = v.scrollTop;
    const rd = $('.rd');
    if (rd && S.rd.autoHide) { if (d > 14 && v.scrollTop > 120) rd.classList.add('hide'); else if (d < -14 || max - v.scrollTop < 200) rd.classList.remove('hide'); }
    updateLabel(); afterProgress();
  });
}
function afterProgress() {
  const s = $('#rdSlider');
  if (s && document.activeElement !== s) s.value = Math.round(R.progress * 1000);
  if (R.progress > 0.88) markRead(R.slug, R.chapterId);
  if (R.progress > 0.6 && !R.prefetched && S.rd.prefetch && R.next && winUsed() < limitN() - 20) {
    R.prefetched = true;
    api.pages(R.next).then(c => c.imgs.slice(0, 3).forEach(u => { const p = new Image(); p.referrerPolicy = 'no-referrer'; p.src = u; })).catch(() => {});
  }
  if (Date.now() - R.lastSave > 1500) saveProgress();
}
function updateLabel() {
  const l = $('#rdLabel'); if (!l) return;
  l.textContent = `Hal. ${R.page + 1}/${R.imgs.length}`;
  const ln = $('#rdLine'); if (ln) ln.style.width = (R.progress * 100) + '%';
}
function saveProgress(force) {
  if (!R.on) return;
  R.lastSave = Date.now();
  L.hist[R.slug] = { item: R.item, chapterId: R.chapterId, chapterTitle: R.chTitle, ts: Date.now(), progress: R.progress, page: R.page };
  if (force) saveLNow(); else saveL();
}
function toggleBars() { const rd = $('.rd'); if (rd) rd.classList.toggle('hide'); }
function onTap(e) { if (e.target.closest('a,button,.endcard')) return; toggleBars(); }
function goChapter(id) {
  if (!id) return;
  markRead(R.slug, R.chapterId);
  location.replace(hrefRead(R.slug, id));
}
function leave() { location.hash = hrefTitle(R.slug).slice(1); }
function toggleBookmark() {
  const id = R.slug + '|' + R.chapterId;
  const i = L.marks.findIndex(m => m.id === id);
  if (i >= 0) { L.marks.splice(i, 1); toast('Penanda dihapus'); }
  else { L.marks.push({ id, slug: R.slug, title: R.item.title, image: R.item.image, chapterId: R.chapterId, chapterTitle: R.chTitle, progress: R.progress, page: R.page, ts: Date.now() }); toast('Penanda disimpan'); }
  saveLNow();
  const b = $('#bmBtn'); if (b) b.classList.toggle('on', isBm());
}
function toggleAuto() {
  if (S.rd.mode !== 'scroll') return toast('Gulir otomatis cuma buat mode Webtoon');
  R.auto = !R.auto;
  const rd = $('.rd'); if (R.auto && rd) rd.classList.add('hide');
  toast(R.auto ? 'Gulir otomatis nyala' : 'Gulir otomatis berhenti');
  if (!R.auto) return cancelAnimationFrame(rafAuto);
  const v = $('#rdv'); let last = performance.now(), acc = 0;
  const stop = () => { R.auto = false; };
  v.addEventListener('wheel', stop, { once: true, passive: true });
  v.addEventListener('touchstart', stop, { once: true, passive: true });
  const step = t => {
    if (!R.auto) return;
    acc += S.rd.speed * 40 * (t - last) / 1000; last = t;
    const px = Math.floor(acc);
    if (px >= 1) { v.scrollTop += px; acc -= px; }
    if (v.scrollTop + v.clientHeight >= v.scrollHeight - 2) { R.auto = false; return; }
    rafAuto = requestAnimationFrame(step);
  };
  rafAuto = requestAnimationFrame(step);
}
function openSheet(type) {
  const sh = $('#sheet'); if (!sh) return;
  sheetOpen = true;
  if (type === 'chapters') {
    const read = L.read[R.slug] || {};
    const list = R.asc.slice().reverse();
    sh.innerHTML = `<div class="sheet-in"><div class="sheet-h"><h3>Daftar chapter</h3><button class="iconbtn" data-act="closesheet" aria-label="Tutup">${ico('x', 18)}</button></div>
      ${list.length ? `<div class="chlist">${list.map(c => `<a class="chrow ${read[c.id] ? 'read' : ''} ${c.id === R.chapterId ? 'cur' : ''}" href="${hrefRead(R.slug, c.id)}" ${c.id === R.chapterId ? 'id="curch"' : ''}><span class="n">${esc(c.title)}</span><span class="ck">${ico('check', 16)}</span></a>`).join('')}</div>` : '<p class="muted">Daftar chapter nggak tersedia buat judul ini.</p>'}</div>`;
    sh.hidden = false;
    const c = $('#curch'); if (c) c.scrollIntoView({ block: 'center' });
  } else {
    sh.innerHTML = `<div class="sheet-in"><div class="sheet-h"><h3>Setelan baca</h3><button class="iconbtn" data-act="closesheet" aria-label="Tutup">${ico('x', 18)}</button></div>
      <div class="prow"><span class="lb">Mode</span>${seg('rd.mode', [['scroll', 'Webtoon'], ['rtl', 'Manga ←'], ['ltr', 'Halaman →']])}</div>
      <div class="prow"><span class="lb">Lebar</span>${seg('rd.width', [['s', 'Sempit'], ['m', 'Sedang'], ['l', 'Lebar'], ['f', 'Penuh']])}</div>
      <div class="prow"><span class="lb">Jarak</span>${seg('rd.gap', [['0', 'Rapat'], ['s', 'Tipis'], ['m', 'Lega']])}</div>
      <div class="prow"><span class="lb">Latar</span>${seg('rd.bg', [['black', 'Hitam'], ['gray', 'Abu'], ['theme', 'Tema']])}</div>
      <div class="prow"><span class="lb">Kecerahan</span>${range('rd.bright', 40, 120, 5)}</div>
      <div class="prow"><span class="lb">Gulir otomatis</span><div style="display:flex;gap:10px;align-items:center">${range('rd.speed', 1, 10, 1)}<button class="btn sm" data-act="auto">${ico('play', 14)} Mulai</button></div></div>
      <div class="prow"><span class="lb">Sembunyikan bilah saat menggulir</span>${toggle('rd.autoHide')}</div></div>`;
    sh.hidden = false;
  }
}
function closeSheet() { const sh = $('#sheet'); if (sh) sh.hidden = true; sheetOpen = false; const v = $('#rdv'); if (v) v.focus({ preventScroll: true }); }
function onKey(e) {
  if (!R.on || e.target.matches('input,textarea,select') || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key, v = $('#rdv');
  const paged = S.rd.mode !== 'scroll';
  if (k === 'Escape') { if (sheetOpen) closeSheet(); else leave(); }
  else if (sheetOpen) return;
  else if (k === 'n' || k === 'N') goChapter(R.next);
  else if (k === 'p' || k === 'P') goChapter(R.prev);
  else if (k === 'b' || k === 'B') toggleBookmark();
  else if (k === 'c' || k === 'C') openSheet('chapters');
  else if (k === 's' || k === 'S') openSheet('settings');
  else if (k === 'a' || k === 'A') toggleAuto();
  else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); }
  else if (paged && (k === 'ArrowRight' || k === 'ArrowLeft' || k === ' ')) { e.preventDefault(); const rtl = S.rd.mode === 'rtl'; pageStep(k === ' ' ? 1 : (k === 'ArrowRight') === !rtl ? 1 : -1); }
  else if (k === 'j' || k === 'J') v.scrollBy({ top: v.clientHeight * 0.8, behavior: 'smooth' });
  else if (k === 'k' || k === 'K') v.scrollBy({ top: -v.clientHeight * 0.8, behavior: 'smooth' });
}

/* ============================================================
   Event global
   ============================================================ */
function prefChanged(p) {
  if (/^(theme|accent|density)$/.test(p)) applyTheme();
  if (R.on && /^rd\./.test(p)) applyReaderPrefs(p);
}
document.addEventListener('click', e => {
  const sb = e.target.closest('.seg[data-set] button[data-v]');
  if (sb) {
    const p = sb.parentElement.dataset.set, cur = getPath(S, p);
    setPath(S, p, typeof cur === 'number' ? Number(sb.dataset.v) : sb.dataset.v);
    saveS();
    $$('.seg[data-set="' + p + '"] button').forEach(x => x.classList.toggle('on', x.dataset.v === sb.dataset.v));
    prefChanged(p); return;
  }
  const a = e.target.closest('[data-act]');
  if (a && a.tagName !== 'SELECT') act(a);
  const img = e.target.closest('.pg.err');
  if (img) { const u = img.getAttribute('src'); img.classList.remove('err'); img.removeAttribute('src'); img.dataset.fb = ''; img.src = u + (u.includes('?') ? '&' : '?') + 'r=' + Date.now(); }
  const sh = $('#sheet');
  if (sh && !sh.hidden && e.target === sh) closeSheet();
  if (e.target.closest('#sheet .chrow')) sheetOpen = false;
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('[data-toggle]')) { setPath(S, t.dataset.toggle, t.checked); saveS(); prefChanged(t.dataset.toggle); }
  else if (t.matches('[data-act="shelf"]')) {
    if (!D) return;
    if (t.value) L.shelf[D.slug] = { status: t.value, item: D.item }; else delete L.shelf[D.slug];
    saveLNow(); toast(t.value ? 'Masuk rak' : 'Keluar dari rak');
  }
  else if (t.id === 'bsort') { B.sort = t.value; renderBrowse(); }
  else if (t.id === 'impfile') importData(t.files[0]);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches('[data-range]')) {
    setPath(S, t.dataset.range, parseFloat(t.value)); saveS(); prefChanged(t.dataset.range);
    if (t.dataset.range === 'net.limit') { const o = $('#limOut'); if (o) o.textContent = t.value; updateMeter(); }
  }
  else if (t.id === 'chq' && D) { D.filter = t.value.trim(); D.limit = 100; renderChapters(); }
});
document.addEventListener('submit', e => {
  if (e.target.id === 'gs') { e.preventDefault(); const q = $('#gq').value.trim(); if (q) { location.hash = `#/browse?q=${enc(q)}`; $('#gq').blur(); } }
  else if (e.target.id === 'bform') { e.preventDefault(); const q = $('#bq').value.trim(); location.hash = q ? `#/browse?q=${enc(q)}` : '#/browse'; }
});
function pushSearch(q) { L.searches = [q, ...L.searches.filter(x => x !== q)].slice(0, 12); saveL(); }
document.addEventListener('keydown', e => {
  if (e.key === '/' && !R.on && !e.target.matches('input,textarea,select')) { e.preventDefault(); $('#gq').focus(); }
});
function saveApiFrom(sel) {
  const v = $(sel).value.trim().replace(/\/+$/, '');
  if (v && !/^https?:\/\//.test(v)) return toast('Alamat harus diawali http:// atau https://');
  S.api = v; saveS(); mc.clear();
  try { Object.keys(sessionStorage).filter(k => k.startsWith('lc2:')).forEach(k => sessionStorage.removeItem(k)); } catch (e) { /* ignore */ }
  toast('Alamat API disimpan');
  return true;
}
function act(a) {
  const n = a.dataset.act;
  switch (n) {
    case 'retry': route(); break;
    case 'more': loadBrowse(false); break;
    case 'hero': { const h = $('#hero'); if (h && h._go) h._go(+a.dataset.i); clearInterval(heroTimer); break; }
    case 'syn': { const s = $('#syn'); s.classList.toggle('clamp'); a.textContent = s.classList.contains('clamp') ? 'Baca selengkapnya' : 'Ringkas'; break; }
    case 'chsort': D.dir = D.dir === 'desc' ? 'asc' : 'desc'; $('#chdir').textContent = D.dir === 'desc' ? 'Terbaru dulu' : 'Terlama dulu'; renderChapters(); break;
    case 'chmore': D.limit += 150; renderChapters(); break;
    case 'markall': {
      const m = (L.read[D.slug] = L.read[D.slug] || {});
      const all = D.asc.every(c => m[c.id]);
      if (all) { L.read[D.slug] = {}; toast('Tanda terbaca direset'); } else { D.asc.forEach(c => { m[c.id] = 1; }); toast('Semua chapter ditandai udah dibaca'); }
      saveLNow(); renderChapters(); renderActions(); break;
    }
    case 'fav':
      if (isFav(D.slug)) { delete L.favs[D.slug]; toast('Dihapus dari favorit'); } else { L.favs[D.slug] = { item: D.item, ts: Date.now() }; toast('Masuk favorit'); }
      saveLNow(); renderActions(); break;
    case 'copylink': copyText(location.href); break;
    case 'rm-hist': delete L.hist[a.dataset.key]; saveLNow(); route(); break;
    case 'rm-fav': delete L.favs[a.dataset.key]; saveLNow(); route(); break;
    case 'rm-mark': L.marks = L.marks.filter(m => m.id !== a.dataset.id); saveLNow(); route(); break;
    case 'accent': S.accent = a.dataset.v; saveS(); applyTheme(); $$('.swatch').forEach(x => x.classList.toggle('on', x === a)); break;
    case 'saveapi': saveApiFrom('#baseIn'); break;
    case 'setapi': if (saveApiFrom('#apiIn')) route(); break;
    case 'testapi': testApi(); break;
    case 'export': exportData(); break;
    case 'clear-hist': L.hist = {}; saveLNow(); toast('Riwayat dihapus'); break;
    case 'clear-all':
      if (!a.dataset.sure) { a.dataset.sure = '1'; a.textContent = 'Ketuk lagi buat yakin'; setTimeout(() => { delete a.dataset.sure; a.textContent = 'Hapus semua data'; }, 3500); }
      else { L = clone(LDEF); S = clone(DEF); saveS(); saveLNow(); applyTheme(); viewSettings(); toast('Semua data dihapus'); }
      break;
    case 'bm': toggleBookmark(); break;
    case 'chsheet': openSheet('chapters'); break;
    case 'rdsheet': openSheet('settings'); break;
    case 'closesheet': closeSheet(); break;
    case 'prevch': goChapter(R.prev); break;
    case 'nextch': goChapter(R.next); break;
    case 'pgprev': pageStep(-1); break;
    case 'pgnext': pageStep(1); break;
    case 'auto': closeSheet(); toggleAuto(); break;
    default: break;
  }
}
function exportData() {
  const blob = new Blob([JSON.stringify({ app: 'lembar', v: 2, settings: S, library: L }, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'lembar-cadangan-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function importData(file) {
  if (!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const j = JSON.parse(fr.result);
      if (!j || j.app !== 'lembar' || j.v !== 2) throw new Error('bukan cadangan Lembar versi ini');
      S = merge(clone(DEF), j.settings || {}); L = merge(clone(LDEF), j.library || {});
      saveS(); saveLNow(); applyTheme(); viewSettings(); toast('Cadangan berhasil dipulihkan');
    } catch (e) { toast('File nggak valid: ' + e.message); }
  };
  fr.readAsText(file);
}
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName === 'IMG' && (t.classList.contains('cimg') || t.closest('.hc,.dcover,.th'))) t.style.display = 'none';
}, true);

/* ============================================================
   Mulai
   ============================================================ */
$('#themeBtn').addEventListener('click', () => {
  S.theme = { auto: 'light', light: 'dark', dark: 'auto' }[S.theme] || 'auto';
  saveS(); applyTheme(); toast('Tema: ' + { auto: 'ikut sistem', light: 'terang', dark: 'gelap' }[S.theme]);
});
window.addEventListener('hashchange', route);
applyTheme();
route();
