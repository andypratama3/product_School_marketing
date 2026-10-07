---
name: seo-optimize
description: Audit dan perbaiki SEO teknis dan on-page project Next.js App Router (metadata, canonical, Open Graph, Twitter, robots, sitemap, JSON-LD, gambar OG, struktur heading, crawlability) tanpa mengubah tampilan, teks, data, atau perilaku. Gunakan saat diminta "SEO", "optimasi mesin pencari", "meta tag", "sitemap", "schema", atau agar situs lebih mudah ditemukan di Google.
---

# SEO Optimize — SEO yang benar, tidak terlihat, tidak merusak

## Prinsip
1. **Additive & invisible.** Perubahan SEO berupa metadata, file route khusus, dan structured data. Pengunjung tidak boleh melihat perbedaan apa pun.
2. **Jujur ke mesin pencari.** Semua yang dideklarasikan (JSON-LD, meta) harus cocok dengan isi halaman. Tidak ada data karangan, tidak ada keyword stuffing, tidak ada konten tersembunyi, tidak ada cloaking.
3. **Gagal aman.** Bila domain produksi belum diketahui, situs dibuat `noindex` dan build memberi peringatan. Lebih baik tidak terindeks sementara daripada terindeks dengan canonical salah.
4. **Bukti, bukan klaim.** Setiap perbaikan diverifikasi dari HTML hasil render, bukan dari asumsi.

## Input yang dibutuhkan
Dari pengguna (blok "DATA BISNIS" di prompt): domain produksi, nama brand, target bahasa/negara. Opsional: nama entitas, akun sosial resmi (untuk `sameAs`), harga resmi (untuk `Offer`), token Google Search Console.
Kalau kosong: jangan mengarang. Terapkan fallback aman (lihat `lib/seo.ts`) dan catat di laporan sebagai "butuh data".

## Allowed surface (satu-satunya yang boleh disentuh)
| File | Boleh |
|---|---|
| `app/layout.tsx` | Perluas objek `metadata`; tambah `<JsonLd />` di dalam `<head>` yang sudah ada. **Dilarang** menyentuh `viewport`, `<link>` font, script tema inline, atribut `<html>`, `<body>`, atau `{children}` |
| `app/not-found.tsx` | Hanya tambah `export const metadata` |
| BARU `lib/seo.ts` | Konstanta & helper SEO |
| BARU `components/JsonLd.tsx` | Server component untuk `<script type="application/ld+json">` |
| BARU `app/robots.ts`, `app/sitemap.ts` | Route metadata Next |
| BARU `app/opengraph-image.tsx`, `app/twitter-image.tsx` | Gambar sosial |
| BARU `.env.example` | Dokumentasi variabel env |

## Frozen surface (tidak boleh berubah)
`app/globals.css`, seluruh `data/*`, semua teks yang tampil, urutan section di `app/page.tsx`, semua class CSS & DOM id (`hero stats eco fit flow done cta map stage toast`), nama event (`open-feature`, `open-flow`), `localStorage['ps-theme']`, komponen lain di `components/`, `package.json`, `package-lock.json`, `next.config.mjs`, `tsconfig.json`.
Tidak ada dependency baru. `next/og` (`ImageResponse`) sudah bagian dari Next.

## Larangan SEO (anti-pola)
- `meta keywords` (tidak dipakai Google), hreflang (situs satu bahasa), `AggregateRating`/`Review`/`Offer` tanpa data nyata, FAQ schema (rich result FAQ dibatasi), URL hash di sitemap (hash tidak terindeks), `noindex` pada produksi yang valid, memblokir `/_next/` di robots, `lastModified` palsu (`new Date()` setiap build).
- Menyisipkan kata kunci ke teks yang tampil atau menyembunyikan teks (`display:none`, teks putih) demi SEO.
- Menggandakan title/description sama persis di banyak halaman.
- Mengubah copy karena "kurang SEO" — hanya laporan.

## Prosedur

### Fase 0 — Persiapan & baseline
```bash
git status --porcelain            # harus bersih
git checkout -b seo/optimize 2>/dev/null || true
npm ci || npm install
npm run typecheck 2>&1 | tee /tmp/seo-baseline-typecheck.txt
npm run build     2>&1 | tee /tmp/seo-baseline-build.txt
git ls-files app/globals.css data package.json package-lock.json next.config.mjs tsconfig.json \
  | xargs sha256sum > /tmp/seo-frozen.sha
```

Tangkap HTML **sebelum** perubahan. Gunakan User-Agent Googlebot: pada Next 15.2+ metadata dapat di-stream ke body untuk UA browser biasa, sedangkan bot menerima metadata di `<head>`; yang ingin kita ukur adalah apa yang dilihat bot.
```bash
UA='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
(npm start > /tmp/next-before.log 2>&1 &)
for i in $(seq 1 40); do curl -s http://localhost:3100 >/dev/null && break; sleep 1; done
curl -s -A "$UA" http://localhost:3100/ -o /tmp/before.html
curl -s -o /dev/null -w "robots:%{http_code} " http://localhost:3100/robots.txt
curl -s -o /dev/null -w "sitemap:%{http_code} " http://localhost:3100/sitemap.xml
curl -s -o /dev/null -w "404:%{http_code}\n" http://localhost:3100/halaman-tidak-ada
pkill -f "next start" || true
```

Buat skrip audit **di /tmp** (jangan di repo):
```bash
cat > /tmp/seo_audit.py <<'PY'
import sys, json, re
from html.parser import HTMLParser

class P(HTMLParser):
    def __init__(s):
        super().__init__()
        s.title=''; s.in_title=False; s.meta=[]; s.links=[]; s.heads=[]; s._h=None
        s.ld=[]; s._ld=False; s.imgs=[]; s.lang=None; s.anchors=[]
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=='html': s.lang=a.get('lang')
        elif t=='title': s.in_title=True
        elif t=='meta': s.meta.append(a)
        elif t=='link': s.links.append(a)
        elif re.fullmatch(r'h[1-6]',t): s._h=[t,'']
        elif t=='script' and a.get('type')=='application/ld+json': s._ld=True; s.ld.append('')
        elif t=='img': s.imgs.append(a)
        elif t=='a': s.anchors.append(a)
    def handle_endtag(s,t):
        if t=='title': s.in_title=False
        elif s._h and t==s._h[0]: s.heads.append((s._h[0], s._h[1].strip())); s._h=None
        elif t=='script': s._ld=False
    def handle_data(s,d):
        if s.in_title: s.title+=d
        if s._h: s._h[1]+=d
        if s._ld: s.ld[-1]+=d

p=P(); p.feed(open(sys.argv[1],encoding='utf-8').read())
m=lambda k,v='name': next((x.get('content') for x in p.meta if x.get(v)==k),None)
canon=next((l.get('href') for l in p.links if l.get('rel')=='canonical'),None)
print('html lang      :',p.lang)
print('title          :',repr(p.title.strip()),len(p.title.strip()),'char (target <=60)')
d=m('description'); print('description    :',(len(d) if d else None),'char (target 70-160)')
print('canonical      :',canon)
print('robots meta    :',m('robots'))
print('viewport       :',m('viewport'))
for k in ['og:title','og:description','og:type','og:url','og:image','og:locale','og:site_name']:
    print(f'{k:15}:',m(k,'property'))
for k in ['twitter:card','twitter:title','twitter:image']:
    print(f'{k:15}:',m(k))
h1=[h for h in p.heads if h[0]=='h1']; print('jumlah h1      :',len(h1),'(target 1)')
print('outline heading:'); [print('  ',h[0],h[1][:70]) for h in p.heads]
print('img tanpa alt  :',sum(1 for i in p.imgs if not i.get('alt')),'dari',len(p.imgs))
print('JSON-LD blok   :',len(p.ld))
for i,b in enumerate(p.ld):
    try:
        j=json.loads(b); print('  blok',i,'valid JSON; tipe:',[x.get('@type') for x in j.get('@graph',[j])])
    except Exception as e: print('  blok',i,'INVALID:',e)
PY
python3 /tmp/seo_audit.py /tmp/before.html | tee /tmp/seo-before.txt
```

### Fase 1 — Audit (read-only) → tulis `SEO-REPORT.md` → BERHENTI
Periksa semua butir; laporkan hanya yang **terbukti**.

**A. Indexability & crawl**
- [ ] `robots.txt` ada, tidak memblokir `/_next/` dan aset; menunjuk ke sitemap.
- [ ] `sitemap.xml` ada, berisi URL kanonik absolut yang benar-benar 200.
- [ ] 404 mengembalikan status 404 (bukan 200 "soft 404").
- [ ] Meta robots konsisten dengan `robots.txt`; produksi `index,follow`.
- [ ] Tidak ada konten penting yang hanya muncul setelah interaksi/JS. Catat: isi `FeatureDialog` dan langkah `FlowSection` selain langkah aktif tidak ada di HTML awal — itu wajar untuk dialog, tetapi artinya detail fitur tidak terindeks (Tier 3).
- [ ] Rute `/` tetap statis (tabel route di `npm run build` menandai `○`), tidak memakai API dinamis.

**B. Metadata**
- [ ] `title` 30–60 karakter, unik, memuat brand + kategori; `description` 70–160 karakter, bernilai jual, cocok dengan isi halaman.
- [ ] `metadataBase`, canonical `/`, `openGraph` (`type website`, `locale id_ID`, `siteName`, `url`, image), `twitter` (`summary_large_image`).
- [ ] Angka di description (mis. "75 fitur") sama dengan `features.length` saat ini. Jika berbeda → **laporkan**, jangan ubah teks.
- [ ] `icons` yang sudah ada tidak berubah.

**C. On-page & struktur**
- [ ] Tepat satu `<h1>`, hierarki tidak melompat level secara berarti.
- [ ] Bukti pelanggaran HTML: `<h3>` di dalam `<button>` (`FeatureCard`) → Tier 2.
- [ ] Teks link deskriptif; link eksternal punya `rel="noopener noreferrer"` (sudah ada). Catat bila tujuan link placeholder (mis. `https://github.com`) → laporan konten.
- [ ] `<html lang="id">` benar. Tidak ada gambar → tidak ada masalah alt; catat ini.
- [ ] Heading generik ("Alur selesai", "Langkah N") → saran copy, tidak diubah.

**D. Structured data**
- [ ] Belum ada JSON-LD → rencanakan `Organization`, `WebSite`, `SoftwareApplication` (lihat template).
- [ ] Setiap properti harus bisa ditelusuri ke konten halaman atau data dari pengguna.

**E. Sosial & gambar**
- [ ] Ada gambar OG 1200×630 dengan teks yang terbaca; `og:image` dan `twitter:image` absolut (via `metadataBase`).

**F. Performa sebagai sinyal SEO (hanya ukur/laporkan)**
- [ ] Elemen LCP kemungkinan `<h1>` Hero. Cek apakah ditahan animasi GSAP (`gsap.from ... autoAlpha:0` setelah `import('gsap')`). Dampak: LCP tertunda. Perbaikan menyentuh animasi → Tier 2.
- [ ] Font Google via `<link>` render-blocking; `next/font` akan lebih cepat tetapi dapat mengubah rendering → Tier 2.
- [ ] Ukuran JS/CSS dari output `npm run build`; CSS 31 KB satu file; laporkan saja.
- [ ] Verifikasi: tidak ada selector CSS yang menyembunyikan `.r`/`.rv` secara default (konten harus terlihat bila JS gagal).
- [ ] Pengukuran Lighthouse/PageSpeed hanya bila pengguna menyetujui (`npx lighthouse` mengunduh paket; ini bukan dependency repo).

**G. Konten & strategi (laporan, bukan tindakan)**
- Kata kunci yang bisa disasar dan sudah selaras dengan konten: "sistem informasi sekolah", "aplikasi sekolah terintegrasi", "source code sistem sekolah", "PPDB online", "absensi GPS sekolah", "rapor digital QR", "SPP online Midtrans". Jangan disisipkan ke copy tanpa persetujuan; sampaikan ke pemilik konten.
- Satu URL = batas jangkauan. Lihat Tier 3.

**Klasifikasi tier**
- **Tier 1 — otomatis:** `metadata` lengkap, canonical, OG/Twitter, robots, sitemap, JSON-LD, gambar OG, title 404.
- **Tier 2 — perlu persetujuan** (menyentuh DOM/animasi/loading): `h3` dalam `button`, LCP/animasi Hero, `next/font`, link GitHub placeholder, ketergantungan JS.
- **Tier 3 — strategis (butuh keputusan produk):** halaman statis per kategori/fitur, mis. `/fitur/[slug]` via `generateStaticParams` dari `data/features.ts`, dengan metadata dan JSON-LD per halaman, `sitemap` berisi semua URL, link internal antarhalaman, halaman per persona (kepala sekolah, bendahara, operator PPDB), halaman harga/kontak/FAQ, konten edukasi.

Format temuan:
```
### SEO-01 — <judul>
- Tier: 1 | 2 | 3
- File: ...
- Bukti: <kutipan kode atau hasil seo_audit.py>
- Dampak SEO: ...
- Usulan minimal: ...
- Alasan aman (tidak mengubah tampilan/perilaku): ...
```
Setelah menulis `SEO-REPORT.md`: **berhenti**, tunggu persetujuan.

### Fase 2 — Implementasi (setelah "lanjut")

Satu temuan = satu perubahan kecil = satu commit `feat(seo): <ringkas> [SEO-xx]`. Setelah tiap commit: `npm run typecheck`. Di akhir: `npm run build`.

**2.1 `lib/seo.ts`** — nilai teks title/description **disalin persis** dari `layout.tsx` yang ada.
```ts
const RAW = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (RAW || 'http://localhost:3100').replace(/\/+$/, '');
export const SITE_NAME = 'ProductSchool';
export const SITE_TITLE = 'ProductSchool — Sistem Sekolah Terintegrasi';
export const SITE_DESCRIPTION =
  'ProductSchool menyatukan akademik, keuangan, kehadiran, komunikasi, dan CMS sekolah dalam satu sistem. Jelajahi 75 fitur terverifikasi.';

/**
 * Indexable hanya bila: build produksi, domain diset, dan NOINDEX tidak diaktifkan.
 * Domain belum diset => noindex + peringatan (gagal aman, bukan canonical salah).
 */
export const INDEXABLE =
  process.env.NODE_ENV === 'production' &&
  Boolean(RAW) &&
  process.env.NEXT_PUBLIC_NOINDEX !== 'true';

if (process.env.NODE_ENV === 'production' && !RAW) {
  console.warn(
    '[seo] NEXT_PUBLIC_SITE_URL belum diset: situs dibuat noindex. Set domain produksi sebelum deploy.',
  );
}
```

**2.2 `app/layout.tsx`** — hanya perluas `metadata` dan tambah JSON-LD di `<head>`. Jangan ubah bagian lain.
```tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import JsonLd from '@/components/JsonLd';
import { INDEXABLE, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo';

const GSC = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: INDEXABLE
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
      }
    : { index: false, follow: false },
  icons: { icon: '/icon.svg' }, // sudah ada: jangan ubah
  ...(GSC ? { verification: { google: GSC } } : {}),
};
// `viewport`, <head> font links, script tema, <body>: TIDAK DIUBAH.
// Tambahkan HANYA satu baris ini di dalam <head> yang ada, setelah script tema:
//   <JsonLd data={jsonLd} />
```
`jsonLd` didefinisikan di `lib/seo.ts` (lihat 2.3) dan di-import.

**2.3 JSON-LD** — hanya fakta yang ada di halaman atau diberikan pengguna.
```tsx
// components/JsonLd.tsx
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // escape "<" agar tidak bisa menutup tag script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
```
```ts
// tambahkan ke lib/seo.ts
export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      // sameAs: [...]  // HANYA bila pengguna memberi akun resmi
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'id-ID',
      publisher: { '@id': `${SITE_URL}/#org` },
      // JANGAN tambah SearchAction: pencarian situs ini dialog, bukan URL.
    },
    {
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      inLanguage: 'id-ID',
      // offers: {...}  // HANYA bila pengguna memberi harga resmi. Tanpa rating/review.
    },
  ],
};
```
Tanpa `offers`/`aggregateRating`, markup valid tetapi tidak memicu rich result. Itu benar; jangan dipalsukan.

**2.4 `app/robots.ts` dan `app/sitemap.ts`**
```ts
// app/robots.ts
import type { MetadataRoute } from 'next';
import { INDEXABLE, SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE_URL}/sitemap.xml` };
}
```
```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { INDEXABLE, SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!INDEXABLE) return [];
  // Tanpa lastModified: tanggal palsu per build justru merusak kepercayaan crawler.
  return [{ url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 }];
}
```

**2.5 Gambar OG** — memakai warna token yang sudah ada (`#0a0b0a`, `#f2f4f0`, `#5ce70b`) dan teks dari Hero.
```tsx
// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { features } from '@/data/features';
import { SITE_NAME } from '@/lib/seo';

export const alt = `${SITE_NAME} — Sistem Sekolah Terintegrasi`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72, background: '#0a0b0a',
          color: '#f2f4f0', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#5ce70b' }}>{SITE_NAME}</div>
        <div style={{ display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>
          Semua kebutuhan sekolah, terhubung dalam satu sistem.
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#97a096' }}>
          {features.length} fitur terverifikasi
        </div>
      </div>
    ),
    { ...size },
  );
}
```
```tsx
// app/twitter-image.tsx
export { default, alt, size, contentType } from './opengraph-image';
```
Jika re-export gagal di build, duplikasi isi file. Semua `div` bertingkat harus `display:'flex'` (batasan Satori).

**2.6 `app/not-found.tsx`** — tambahkan hanya:
```tsx
export const metadata = { title: 'Halaman tidak ditemukan' };
```

**2.7 `.env.example`**
```
# Wajib di produksi. Tanpa ini situs otomatis noindex.
NEXT_PUBLIC_SITE_URL=https://domain-anda.com
# Opsional: set true di preview/staging agar tidak terindeks.
NEXT_PUBLIC_NOINDEX=false
# Opsional: token verifikasi Google Search Console.
NEXT_PUBLIC_GSC_VERIFICATION=
```

### Fase 3 — Verifikasi (wajib, lampirkan hasilnya)
```bash
export NEXT_PUBLIC_SITE_URL=https://example.com   # placeholder HANYA untuk uji lokal
npm run typecheck && npm run build
(npm start > /tmp/next-after.log 2>&1 &)
for i in $(seq 1 40); do curl -s http://localhost:3100 >/dev/null && break; sleep 1; done
UA='Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
curl -s -A "$UA" http://localhost:3100/ -o /tmp/after.html
python3 /tmp/seo_audit.py /tmp/after.html | tee /tmp/seo-after.txt
curl -s http://localhost:3100/robots.txt
curl -s http://localhost:3100/sitemap.xml
curl -s -o /dev/null -w "og-image:%{http_code} %{content_type}\n" http://localhost:3100/opengraph-image
curl -s -o /dev/null -w "404:%{http_code}\n" http://localhost:3100/halaman-tidak-ada
pkill -f "next start" || true
unset NEXT_PUBLIC_SITE_URL

# 1. Frozen surface utuh
sha256sum -c /tmp/seo-frozen.sha

# 2. <body> identik (abaikan <script>, hash aset)
norm() { perl -0pe 's/.*?(<body)/$1/s; s/<script.*?<\/script>//gs; s#/_next/static/[^"\x27 )]*#ASSET#g' "$1"; }
diff <(norm /tmp/before.html) <(norm /tmp/after.html) && echo "OK: body identik"

# 3. File yang berubah hanya di allowed surface
git diff --name-only $(git merge-base HEAD main 2>/dev/null || echo HEAD~1)..HEAD
```

**Kriteria lulus**
- [ ] `typecheck` dan `build` sukses; `/` tetap statis.
- [ ] `seo_audit.py` (setelah) menunjukkan: canonical absolut, `og:*` dan `twitter:*` terisi, `robots` = `index, follow`, tepat satu `h1`, semua blok JSON-LD valid JSON.
- [ ] `robots.txt` menunjuk ke `sitemap.xml`; sitemap berisi 1 URL kanonik.
- [ ] OG image 200 `image/png`; 404 mengembalikan 404.
- [ ] `sha256sum -c` semua OK; diff `<body>` kosong; tidak ada file di luar allowed surface yang berubah.
- [ ] Tanpa `NEXT_PUBLIC_SITE_URL` + build produksi: `robots` = `noindex` dan ada peringatan `[seo]` di log build (uji sekali, jangan di-commit).
- Gagal salah satu → revert commit terkait sebelum melapor.

### Daftar tugas manual pasca-deploy (untuk pemilik; masukkan ke laporan)
1. Set `NEXT_PUBLIC_SITE_URL` (dan `NEXT_PUBLIC_NOINDEX=true` untuk staging/preview) lalu rebuild; variabel `NEXT_PUBLIC_*` ditanam saat build.
2. Verifikasi domain di Google Search Console dan Bing Webmaster Tools; kirim `https://domain/sitemap.xml`; jalankan URL Inspection pada `/`.
3. Uji markup di Rich Results Test / Schema Markup Validator.
4. Ukur PageSpeed Insights (mobile) dan catat LCP/CLS/INP sebagai baseline.
5. Cek pratinjau berbagi (WhatsApp, LinkedIn, Facebook Sharing Debugger) memakai gambar OG.
6. Pantau laporan Indexing dan Performance di Search Console selama 2–4 minggu.

## Template `SEO-REPORT.md`
```markdown
# Laporan SEO — ProductSchool

## Ringkasan
- Baseline: typecheck <OK/GAGAL>, build <OK/GAGAL>
- Temuan: <n> (Tier 1: <a>, Tier 2: <b>, Tier 3: <c>)
- Data yang masih dibutuhkan: <domain / sameAs / harga / ...>

## Kondisi sebelum (output seo_audit.py)
...

## Temuan (format SEO-xx)
...

## Hasil implementasi
| ID | Status (selesai/dibatalkan/dilewati) | Commit | File |
|----|------|--------|------|

## Bukti verifikasi
- seo_audit sebelum → sesudah
- sha256 frozen surface: OK/PELANGGARAN
- diff <body>: identik / <rincian>
- robots.txt, sitemap.xml, og-image, 404: <hasil>

## Tidak diubah dengan sengaja (Tier 2 & 3)
...

## Tugas manual pasca-deploy
...
```

## Aturan komunikasi
- Bahasa Indonesia, ringkas, faktual; jangan mengklaim sudah dites bila perintahnya tidak dijalankan.
- Jangan menjanjikan peringkat atau lonjakan trafik; SEO butuh waktu dan konten.
- Jangan membuat temuan hanya untuk memenuhi kuota; "sudah benar" valid.
- Bila permintaan pengguna berbenturan dengan frozen surface atau larangan SEO, tanyakan dulu.
