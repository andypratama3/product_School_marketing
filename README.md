# ProductSchool — Situs Penjualan Sistem Sekolah

Situs marketing satu halaman untuk **ProductSchool**: source code lengkap sistem
sekolah terintegrasi (akademik, siswa, staf, keuangan, kehadiran, komunikasi,
CMS). Pengunjung menjelajahi fitur, melihat peta ekosistem, lalu mencoba
simulator alur interaktif dari awal sampai hasil.

## Isi situs

- **Hero** — ringkasan + mock dashboard + tombol ke fitur dan alur.
- **Angka utama** — 75 fitur terverifikasi, 14 kategori inti, 9 alur interaktif,
  226 route API, 380 permission RBAC.
- **Peta ekosistem** — 14 node kategori mengelilingi pusat ProductSchool.
  Node default **Akademik**; pertama kali peta terlihat ada intro sekali jalan
  (aktif ikut node satu-satu lalu berhenti di Akademik). Panel info mengikuti
  node yang dipilih (maks 6 fitur + sisa hitungan).
- **Daftar fitur** — 75 fitur dengan filter kategori, klik membuka panel detail
  (pengguna, kemampuan, alur kerja, fitur sekelompok).
- **Simulator alur** — 9 alur (CMS, pembayaran, Instagram, PPDB, payroll,
  kehadiran, rapor, tanda tangan, WhatsApp): panel admin vs tampilan publik,
  langkah 1..N, bisa lewat tombol, keyboard, atau scroll.
- **Hasil + CTA** — ringkasan hasil alur, keunggulan source-code (milik penuh,
  keamanan berlapis, API-first), tumpukan teknologi, tombol source dan fitur.
- **Pencarian** (`Cari` / `Ctrl/⌘+K`) — cari fitur atau alur, Enter membuka
  hasil pertama. Toggle tema terang/gelap tersimpan di `localStorage`.

## Teknologi

- Next.js 16 (App Router) + React 19 + TypeScript `strict`
- GSAP + ScrollTrigger (animasi entrance, dimatikan saat reduced-motion)
- lucide-react (seluruh ikon lewat registry `lib/icons.tsx`)
- Satu file CSS global (`app/globals.css`), tanpa framework CSS

## Struktur

```
app/          layout, halaman utama, 404, CSS global
components/   ±20 komponen (Hero, StatsBar, EcosystemMap*, FeaturesSection,
              FlowSection, ResultsSection, CTASection, SearchDialog,
              FeatureDialog, Header, Footer, RailNav, ScrollFx, Toast, ...)
data/         features.ts (75) · categories.ts (14) · flows.ts (9) · sales.ts
lib/          types.ts · icons.tsx · scroll.ts
```

Komunikasi antar komponen lewat custom event (`open-feature`, `open-flow`)
dan helper `scrollToId`. Tidak ada test/ESLint di repo ini.

## Cara jalan

```bash
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
npm start        # serve production di port 3100
```
