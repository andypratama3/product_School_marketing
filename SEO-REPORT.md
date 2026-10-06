# Laporan SEO — ProductSchool

## Ringkasan
- Baseline: typecheck **OK**, build **OK** (`/` dan `/_not-found` statis `○`)
- Domain produksi: **https://product-school.vercel.app** (diberikan user saat audit)
- Data yang masih dibutuhkan: akun sosial resmi (`sameAs`), harga resmi (`Offer`), token GSC — ketiganya opsional, tidak dikarang
- Temuan: **11** (Tier 1: **7**, Tier 2: **3**, Tier 3: **1**)
- Diubah: **0** (Fase 1 read-only)

## Kondisi sebelum (output seo_audit.py, UA Googlebot)
- `html lang: id`, title 43 char OK, description 135 char OK
- canonical: None | robots meta: None | OG: semua None | Twitter: semua None
- h1: tepat 1; outline h1→h2→h3 tertib; `img tanpa alt: 0 dari 0`; JSON-LD: 0 blok
- `/robots.txt` → 404, `/sitemap.xml` → 404, URL ngawur → 404 (bukan soft-404, bagus)

## Temuan

### SEO-01 — Tanpa canonical + metadataBase
- Tier: 1
- File: app/layout.tsx:4-11
- Bukti: audit `canonical: None`; metadata hanya `title/description/icons`
- Dampak SEO: versi www/non-www, http/https, trailing-slash dianggap duplikat
- Usulan minimal: `metadataBase: new URL(SITE_URL)` + `alternates: { canonical: '/' }` di `lib/seo.ts` + layout
- Alasan aman: hanya tag `<link>` di head, tidak ada piksel/DOM berubah

### SEO-02 — Tanpa Open Graph
- Tier: 1
- Bukti: `og:*` semua None
- Dampak SEO: pratinjau berbagi (WA/LinkedIn/FB) polos; sinyal sosial lemah
- Usulan minimal: blok `openGraph` (type website, locale id_ID, siteName, url, title, description) + `app/opengraph-image.tsx` 1200×630
- Alasan aman: hanya meta di head + file route gambar baru

### SEO-03 — Tanpa Twitter Card
- Tier: 1
- Bukti: `twitter:*` semua None
- Dampak SEO: pratinjau X kecil
- Usulan minimal: `twitter: { card: 'summary_large_image', ... }` + `app/twitter-image.tsx`
- Alasan aman: hanya meta di head + file baru

### SEO-04 — Tanpa robots.txt
- Tier: 1
- Bukti: `/robots.txt` → 404
- Dampak SEO: crawler tanpa arahan; tidak ada rujukan sitemap
- Usulan minimal: `app/robots.ts` baru (allow `/`, rujuk sitemap; fallback disallow-all saat tidak indexable)
- Alasan aman: file route baru, tidak menyentuh halaman

### SEO-05 — Tanpa sitemap.xml
- Tier: 1
- Bukti: `/sitemap.xml` → 404
- Dampak SEO: discovery URL hanya mengandalkan link; wajib untuk Search Console
- Usulan minimal: `app/sitemap.ts` baru berisi 1 URL kanonik (tanpa lastModified palsu)
- Alasan aman: file route baru

### SEO-06 — Tanpa JSON-LD
- Tier: 1
- Bukti: `JSON-LD blok: 0`
- Dampak SEO: mesin harus menebak entitas; tanpa Organization/WebSite/SoftwareApplication
- Usulan minimal: `components/JsonLd.tsx` + `jsonLd` di `lib/seo.ts` (tanpa offers/rating/sameAs karena data tidak diberikan)
- Alasan aman: satu `<script>` di head, tak terlihat pengunjung

### SEO-07 — Halaman 404 tanpa title
- Tier: 1
- File: app/not-found.tsx
- Bukti: tidak ada export `metadata`; tab browser 404 memakai title fallback
- Dampak SEO: kecil (tab/riwayat), tapi gratis
- Usulan minimal: `export const metadata = { title: 'Halaman tidak ditemukan' }`
- Alasan aman: tidak mengubah body 404 sama sekali

### SEO-08 — `<h3>` di dalam `<button>` (PERLU PERSETUJUAN)
- Tier: 2
- File: components/FeaturesSection.tsx:30-33 (`FeatureCard`)
- Bukti: `<button class="card">…<h3>{feature.name}</h3>…</button>` — heading interaktif tidak valid per HTML content model
- Dampak SEO: outline heading tercemar 75 h3 di dalam tombol; parser ketat bisa salah tafsir
- Usulan minimal: ganti `<h3>`→`<span class="card-title">` + tiru gaya h3 via class baru — TAPI class baru = sentuh CSS (frozen) atau inline style (ubah frozen surface tampilan). Alternatif: biarkan, karena browser/AT menoleransi
- Alasan ditahan: perbaikan benar menyentuh DOM/CSS visual → butuh persetujuan + uji visual

### SEO-09 — LCP (h1 Hero) ditahan animasi GSAP (PERLU PERSETUJUAN)
- Tier: 2
- File: components/ScrollFx.tsx:38-45
- Bukti: `gsap.from('#hero .r', { autoAlpha: 0, ... })` berjalan setelah `import('gsap')` dinamis; h1 baru penuh setelah JS + animasi
- Dampak SEO: LCP tertunda (Core Web Vitals adalah sinyal ranking)
- Usulan minimal: kecualikan h1 dari fade (tetap animasikan sibling) ATAU biarkan — butuh ukur PageSpeed dulu
- Alasan ditahan: menyentuh animasi = perilaku terlihat → butuh persetujuan

### SEO-10 — Link "Lihat source" ke root GitHub (catatan konten)
- Tier: 2
- File: components/CTASection.tsx:34
- Bukti: `href="https://github.com"` — bukan repo/profil produk
- Dampak SEO: link eksternal ke tujuan generik; juga membingungkan pengunjung
- Usulan: ganti ke URL repo/profil resmi bila ada — keputusan pemilik (tidak dikerjakan tanpa URL resmi)

### SEO-11 — Satu URL untuk semua kata kunci fitur (strategis)
- Tier: 3
- Bukti: seluruh 75 fitur + 9 alur hanya hidup di `/` (hash `#fit` tidak terindeks); detail fitur di dialog tidak ada di HTML awal
- Dampak SEO: mustahil bersaing untuk "PPDB online", "absensi GPS", "rapor digital" tanpa halaman sendiri
- Usulan (butuh keputusan produk): rute statis `/fitur/[slug]` via `generateStaticParams` dari `data/features.ts` + metadata/JSON-LD per halaman + sitemap penuh + link internal. Tidak dikerjakan tanpa persetujuan

## Hasil implementasi
| ID | Status | Commit | File |
|----|------|--------|------|
| SEO-01 | selesai | 0dfcb90 (+d34166d) | lib/seo.ts, app/layout.tsx |
| SEO-02 | selesai | 0dfcb90, bc33ca6 | layout.tsx, opengraph-image, twitter-image |
| SEO-03 | selesai | 0dfcb90, bc33ca6 | layout.tsx, twitter-image |
| SEO-04 | selesai | 32f4b94 | app/robots.ts |
| SEO-05 | selesai | 32f4b94 | app/sitemap.ts |
| SEO-06 | selesai | d34166d, 0dfcb90 | lib/seo.ts, JsonLd, layout |
| SEO-07 | selesai | 8a37a1b | app/not-found.tsx |
| SEO-08 | dilewati — di luar allowed surface (butuh ubah FeaturesSection.tsx + CSS visual) | — | — |
| SEO-09 | dilewati — menyentuh animasi terlihat; butuh ukur PageSpeed + persetujuan eksplisit | — | — |
| SEO-10 | dilewati — butuh URL GitHub/profil resmi dari pemilik | — | CTASection.tsx (tak tersentuh) |
| SEO-11 | strategis, butuh keputusan produk | — | — |

## Bukti verifikasi
- seo_audit sesudah (UA Googlebot, domain asli): canonical absolut ✓, robots `index, follow` ✓, OG 7/7 ✓, Twitter 3/3 ✓, h1 tepat 1 ✓, JSON-LD 1 blok valid (Organization, WebSite, SoftwareApplication) ✓
- robots.txt: `Allow: /` + rujukan sitemap ✓; sitemap: 1 URL kanonik ✓; og-image: 200 image/png ✓; URL ngawur: tetap 404 ✓
- sha256 frozen surface: 9/9 OK (gagal: 0)
- diff `<body>` sebelum→sesudah: identik (abaikan script + hash aset)
- `/` tetap statis `○`; file berubah hanya di allowed surface
- Catatan: verifikasi pertama sempat membaca server build lama yang belum mati; diulang dari server fresh — hasil di atas dari build baru

## Tidak diubah dengan sengaja
- Title/description existing dipertahankan persis (43/135 char, sudah dalam target)
- `icons`, `viewport`, `themeColor`, font links, script tema, `<html lang="id">`: tidak disentuh
- `h3` dalam `button`, animasi Hero, link GitHub: Tier 2, menunggu persetujuan
- Tidak ada `sameAs`/`Offer`/`rating` karangan di rencana JSON-LD

## Tugas manual pasca-deploy
1. Set `NEXT_PUBLIC_SITE_URL=https://product-school.vercel.app` di Vercel (Production) + rebuild; `NEXT_PUBLIC_NOINDEX=true` untuk Preview/Staging
2. Verifikasi domain di GSC + Bing Webmaster; kirim `/sitemap.xml`; URL Inspection `/`
3. Rich Results Test / Schema Validator untuk JSON-LD
4. PageSpeed Insights mobile sebagai baseline LCP/CLS/INP
5. Cek pratinjau berbagi (WhatsApp/LinkedIn/FB Debugger) dengan gambar OG
6. Pantau Indexing + Performance 2–4 minggu
