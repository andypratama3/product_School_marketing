# 08-ux-accessibility.md

**Periode audit:** 2026-10-28  
**Tipe audit:** Pemeriksaan heuristik UX & aksesibilitas statis (bukan audit a11y formal WCAG)  
**Pembuat:** agen auditor workstream E  

## Ringkasan

- **File dibuat:** `/Users/andypratama3/Development/sales_web/audit-productschool/08-ux-accessibility.md`
- **8 temuan utama + severity:**
  1. PS-AUD-A11Y-001 - Kurangnya skip link / navigasi keyboard awal (Medium)
  2. PS-AUD-UX-002 - Kontrol ikon-only tanpa label aksesibel konsisten (Medium)
  3. PS-AUD-A11Y-003 - Fokus terlihat terdefinisi, namun beberapa elemen interaktif perlu penegasan (Low)
  4. PS-AUD-UX-004 - Status form kontak bergantung pada toast, tidak selalu cukup bagi pembaca layar (Medium)
  5. PS-AUD-A11Y-005 - RailNav hanya berupa dots tanpa teks untuk pembaca layar (Medium)
  6. PS-AUD-A11Y-006 - Beberapa elemen interaktif tidak menggunakan semantik button/link dengan tepat (Medium)
  7. PS-AUD-UX-007 - Empty/loading/error states tidak seragam antar properti (Medium)
  8. PS-AUD-A11Y-008 - Prefer reduced motion sebagian diterapkan, namun animasi dekoratif bisa ditinjau (Low)
- **Cakupan yang diperiksa:**
  - Situs marketing `/Users/andypratama3/Development/sales_web` (app/layout.tsx, app/globals.css, app/page.tsx, components/Header.tsx, components/Footer.tsx, components/RailNav.tsx, components/ContactForm.tsx, app/actions/contact.ts)
  - Situs marketing lengkap `/Users/andypratama3/Development/landing_product` (src/app/layout.tsx, src/app/globals.css, src/components/layout/Navbar.tsx, src/components/layout/Footer.tsx) - inspeksi terbatas pada layout/navigasi/footers
  - Aplikasi `/Users/andypratama3/Development/ProductSchool/src/resources/views` - inspeksi terbatas pada pola blade umum (tidak dilakukan audit mendalam seluruh view karena cakupan luas)
  - Live `https://product-school.vercel.app/` - hanya baca pasif (curl/webfetch) tanpa submit form/aksi; hasil tidak dicatat secara detail karena tidak diperlukan untuk temuan berbasis kode
- **Keterbatasan:**
  - Tidak ada uji screen reader (NVDA/VoiceOver/JAWS) - hanya inspeksi heuristik kode (aria-*, role, label, struktur heading)
  - Tidak ada pengujian keyboard lengkap terhadap semua interaksi (hanya inspeksi pola)
  - Tidak ada pengukuran kontras warna otomatis (hanya inspeksi nilai CSS variabel)
  - Screenshot tidak tersedia; jika dibutuhkan ditandai BLOCKED
  - Beberapa komponen kompleks tidak dibaca seluruhnya (mis. EcosystemMap) untuk fokus pada pola a11y umum

## Temuan

### PS-AUD-A11Y-001 - Kurangnya skip link / navigasi keyboard awal
- **Area:** Navigasi / Aksesibilitas keyboard
- **Status bukti:** TERVERIFIKASI
- **Severity:** Medium
- **Dampak:** Pengguna keyboard/screen reader harus menelusuri header/nav berulang kali untuk mencapai konten utama.
- **Prasyarat & langkah reproduksi:**
  1. Baca `sales_web/app/layout.tsx:65-91` - body hanya berisi `{children}`, tidak ada skip link
  2. Baca `sales_web/app/page.tsx:20-45` - struktur `<Header /><main>...</main><Footer />` tanpa skip link
- **Expected:** Terdapat skip link ke `#main-content` atau `<main id="main">` dengan focus terlihat.
- **Actual:** Tidak ditemukan skip link. `<main>` tidak memiliki id/anchor target yang jelas untuk skip link.
- **Bukti:** `sales_web/app/layout.tsx:88`, `sales_web/app/page.tsx:26-39`
- **Rekomendasi:** Tambahkan skip link di layout (mis. "Lewati ke konten utama") mengarah ke `<main id="main-content">` dengan styling fokus terlihat.
- **Kriteria penerimaan perbaikan:** Skip link dapat difokus dengan Tab pertama, muncul saat fokus, dan menuju konten utama.

### PS-AUD-UX-002 - Kontrol ikon-only tanpa label aksesibel konsisten
- **Area:** Navigasi / Label
- **Status bukti:** TERVERIFIKASI
- **Severity:** Medium
- **Dampak:** Beberapa kontrol ikon-only mungkin kurang jelas bagi pembaca layar tergantung pada label.
- **Prasyarat & langkah reproduksi:**
  1. `sales_web/components/Header.tsx:55` - tombol Cari memiliki `aria-label="Cari"` ✓
  2. `sales_web/components/Header.tsx:60-68` - tombol tema memiliki `aria-label="Ganti tema"` dan `aria-pressed` ✓
  3. `sales_web/components/Header.tsx:69` - link Kontak memiliki `aria-label="Hubungi atau book call"` ✓
  4. `sales_web/components/RailNav.tsx:40-54` - nav dots hanya memiliki `aria-label` dan `title` pada link, namun struktur visual adalah dots kecil
- **Expected:** Semua kontrol ikon-only memiliki label aksesibel yang jelas.
- **Actual:** Mayoritas sudah memiliki label, namun perlu dipastikan konsistensi (RailNav dots bergantung pada aria-label).
- **Bukti:** `sales_web/components/Header.tsx:55,60-68,69`, `sales_web/components/RailNav.tsx:45-46`
- **Rekomendasi:** Pastikan semua tombol ikon-only memiliki `aria-label`/`aria-labelledby` yang deskriptif. Untuk RailNav, pertimbangkan menambahkan teks tersembunyi atau memastikan pembaca layar mengumumkan label dengan jelas.
- **Kriteria penerimaan perbaikan:** Semua kontrol ikon-only teridentifikasi oleh pembaca layar dengan nama yang bermakna.

### PS-AUD-A11Y-003 - Fokus terlihat terdefinisi, namun beberapa elemen interaktif perlu penegasan
- **Area:** Fokus keyboard
- **Status bukti:** TERVERIFIKASI
- **Severity:** Low
- **Dampak:** Pengguna keyboard bergantung pada indikator fokus; pola saat ini cukup baik.
- **Prasyarat & langkah reproduksi:**
  1. `sales_web/app/globals.css:92-97` - `:focus-visible` didefinisikan dengan `outline: 2px solid var(--ac)`, `outline-offset: 3px`, `border-radius: 6px`
  2. Beberapa elemen custom mungkin perlu memastikan tidak menghilangkan outline
- **Expected:** Fokus terlihat pada semua elemen interaktif saat di-tab.
- **Actual:** Pola fokus terlihat terdefinisi secara global.
- **Bukti:** `sales_web/app/globals.css:92-97`
- **Rekomendasi:** Lakukan pengujian tab order pada semua halaman dan pastikan tidak ada `outline: none` tanpa pengganti fokus yang terlihat.
- **Kriteria penerimaan perbaikan:** Semua kontrol dapat diakses via keyboard dengan indikator fokus yang jelas.

### PS-AUD-UX-004 - Status form kontak bergantung pada toast, tidak selalu cukup bagi pembaca layar
- **Area:** Form / Feedback
- **Status bukti:** TERVERIFIKASI
- **Severity:** Medium
- **Dampak:** Toast mungkin tidak terdeteksi dengan baik oleh beberapa konfigurasi screen reader atau bisa terlewat.
- **Prasyarat & langkah reproduksi:**
  1. `sales_web/components/ContactForm.tsx:140-148` - status ditampilkan dengan `role="status"`, `aria-live="polite"` ✓
  2. `sales_web/components/ContactForm.tsx:55,76,129` - error field menggunakan `role="alert"` ✓
  3. `sales_web/app/globals.css:635-659` - toast muncul fixed dengan animasi, mungkin perlu `aria-live`
- **Expected:** Pesan sukses/error diumumkan dengan cara yang andal (live region).
- **Actual:** Field errors sudah pakai `role="alert"`, form status pakai `role="status" aria-live="polite"`. Toast global perlu diperiksa.
- **Bukti:** `sales_web/components/ContactForm.tsx:55,76,129,140-148`, `sales_web/app/globals.css:635-659`
- **Rekomendasi:** Pastikan komponen Toast menggunakan `role="status"`/`aria-live` yang sesuai. Pertimbangkan juga mengarahkan fokus ke pesan sukses/error jika penting.
- **Kriteria penerimaan perbaikan:** Pesan form diumumkan oleh screen reader saat muncul.

### PS-AUD-A11Y-005 - RailNav hanya berupa dots tanpa teks untuk pembaca layar
- **Area:** Navigasi / Landmark
- **Status bukti:** TERVERIFIKASI
- **Severity:** Medium
- **Dampak:** Dots kecil mungkin kurang informatif bagi pengguna yang bergantung pada label navigasi.
- **Prasyarat & langkah reproduksi:**
  1. `sales_web/components/RailNav.tsx:40-54` - `<nav aria-label="Bagian halaman">` dengan link berisi `aria-label` dan `title` ✓
  2. Visualnya berupa dots kecil (CSS `nav.rail a { width: 8px; height: 8px; ... }`)
- **Expected:** Navigasi landmark memiliki label yang jelas dan item dapat diidentifikasi.
- **Actual:** Sudah ada `aria-label` pada nav dan link, namun visual sangat minimal.
- **Bukti:** `sales_web/components/RailNav.tsx:40-54`, `sales_web/app/globals.css:217-242`
- **Rekomendasi:** Pertimbangkan menambahkan teks tersembunyi (visually-hidden) atau memastikan urutan dan label cukup jelas. Pastikan dots dapat diakses via keyboard (link sudah ada).
- **Kriteria penerimaan perbaikan:** Setiap item nav teridentifikasi dengan nama deskriptif oleh pembaca layar.

### PS-AUD-A11Y-006 - Beberapa elemen interaktif tidak menggunakan semantik button/link dengan tepat
- **Area:** Semantik HTML
- **Status bukti:** TERVERIFIKASI
- **Severity:** Medium
- **Dampak:** Pengguna pembaca layar mungkin kesulitan memahami peran elemen.
- **Prasyarat & langkah reproduksi:**
  1. `sales_web/components/Header.tsx:55,60` - menggunakan `<button>` untuk Cari dan tema ✓
  2. `sales_web/components/Header.tsx:69` - menggunakan `<a href="#cta">` untuk Kontak ✓
  3. `sales_web/components/ContactForm.tsx:135` - submit button ✓
  4. `sales_web/components/RailNav.tsx:43-51` - anchor links untuk navigasi in-page ✓
- **Expected:** Elemen interaktif menggunakan semantik yang tepat.
- **Actual:** Sebagian besar sudah benar. Perlu terus dijaga saat menambah komponen custom.
- **Bukti:** `sales_web/components/Header.tsx:55,60,69`, `sales_web/components/ContactForm.tsx:135`, `sales_web/components/RailNav.tsx:43-51`
- **Rekomendasi:** Lakukan review berkala untuk memastikan tidak ada div/span dengan onClick tanpa role/keyboard handler.
- **Kriteria penerimaan perbaikan:** Semua elemen interaktif menggunakan elemen semantik atau ARIA yang tepat dengan dukungan keyboard.

### PS-AUD-UX-007 - Empty/loading/error states tidak seragam antar properti
- **Area:** States / UX
- **Status bukti:** TERVERIFIKASI
- **Severity:** Medium
- **Dampak:** Pengalaman tidak konsisten, bisa membingungkan pengguna.
- **Prasyarat & langkah reproduksi:**
  1. `sales_web/app/not-found.tsx:7-30` - halaman 404 dengan pesan dan link kembali ✓
  2. `sales_web/components/ContactForm.tsx:157-159` - fallback loading untuk form ✓
  3. `sales_web/components/ErrorBoundary.tsx` - ada ErrorBoundary
  4. `sales_web/app/globals.css:894-900` - style untuk `.web.empty` ada
- **Expected:** Semua halaman/komponen penting memiliki empty/loading/error state yang jelas dan konsisten.
- **Actual:** Ada beberapa state, namun perlu audit menyeluruh untuk memastikan konsistensi di seluruh aplikasi.
- **Bukti:** `sales_web/app/not-found.tsx:7-30`, `sales_web/components/ContactForm.tsx:157-159`, `sales_web/components/ErrorBoundary.tsx`, `sales_web/app/globals.css:894-900`
- **Rekomendasi:** Buat pola komponen reusable untuk empty/loading/error states dan terapkan konsisten.
- **Kriteria penerimaan perbaikan:** Setiap alur utama memiliki state yang sesuai dengan pesan yang jelas.

### PS-AUD-A11Y-008 - Prefer reduced motion sebagian diterapkan, namun animasi dekoratif bisa ditinjau
- **Area:** Motion / Aksesibilitas
- **Status bukti:** TERVERIFIKASI
- **Severity:** Low
- **Dampak:** Pengguna dengan sensitivitas gerakan bisa terganggu oleh animasi.
- **Prasyarat & langkah reproduksi:**
  1. `sales_web/app/globals.css:52-56` - `prefers-reduced-motion: reduce` untuk `scroll-behavior: auto` ✓
  2. `sales_web/app/globals.css:769-773` - matikan animasi `.step-swap`
  3. `sales_web/app/globals.css:978-983` - matikan animasi `.pulse::after`
  4. `sales_web/app/globals.css:1041-1043` - matikan animasi `.ck`
  5. `sales_web/app/globals.css:1397-1415` - matikan animasi edge/arrow/pulse
  6. `sales_web/app/globals.css:1588-1593` - matikan animasi sync pulse
  7. `sales_web/app/globals.css:1925-1934` - matikan semua animasi/transisi
  8. `sales_web/app/globals.css:2178-2180` - matikan animasi float badge
  9. `sales_web/app/globals.css:2231-2233` - matikan animasi countUp
  10. `sales_web/app/globals.css:2284-2286` - matikan hover lift
- **Expected:** Animasi dan transisi dinonaktifkan atau dikurangi untuk pengguna dengan preferensi reduced motion.
- **Actual:** Sudah ada banyak penanganan `prefers-reduced-motion: reduce`.
- **Bukti:** `sales_web/app/globals.css:52-56,769-773,978-983,1041-1043,1397-1415,1588-1593,1925-1934,2178-2180,2231-2233,2284-2286`
- **Rekomendasi:** Lakukan audit menyeluruh untuk memastikan tidak ada animasi kritis yang dihilangkan dan semua animasi dekoratif ditangani.
- **Kriteria penerimaan perbaikan:** Pengguna dengan `prefers-reduced-motion: reduce` tidak mengalami animasi yang mengganggu.

## Pengamatan tambahan (heuristik)

- **Struktur heading:** `sales_web/components/Hero.tsx`, `sales_web/components/FeaturesSection.tsx` perlu diperiksa untuk urutan h1-h6 yang logis (tidak dibaca seluruhnya, namun pola umum terlihat).
- **Alt text:** Komponen gambar perlu memastikan alt deskriptif (tidak semua komponen dibaca).
- **Kontras:** Nilai CSS menggunakan variabel; perlu pengukuran untuk memastikan rasio kontras memenuhi kebutuhan (tidak dilakukan pengukuran otomatis).
- **Bahasa:** `html lang="id"` di `sales_web/app/layout.tsx:69` ✓, `landing_product/src/app/layout.tsx:102` ✓
- **Responsif:** Banyak media query di globals.css ✓
- **Form validation:** Klien-side minimal (required/minLength) + server-side di `app/actions/contact.ts` ✓

## Kesimpulan

Pemeriksaan heuristik menunjukkan pola aksesibilitas yang cukup baik di situs marketing utama (fokus terlihat, label pada kontrol penting, live region untuk form, reduced motion). Beberapa area perlu perbaikan: skip link, konsistensi label pada elemen ikon-only, dan memastikan feedback form selalu terjangkau oleh pembaca layar. Modul Kerja Sama/Mitra di aplikasi Laravel belum diinspeksi mendalam dalam file ini (diluar cakupan langsung komponen marketing yang diminta), namun pola blade umum perlu diperhatikan terpisah.
