# 10-brand-and-trademark-screening.md
**ID Laporan:** PS-AUD-BRAND-001  
**Tanggal Audit:** 2026-10-28  
**Area:** Branding & Penamaan  
**Status Bukti:** TERINDIKASI (pencarian web awal)  
**Severity:** Medium  
**PIC/Target:** Belum ditentukan  
**Disclaimer:** Laporan ini BUKAN nasihat hukum. Hanya merupakan hasil pemeriksaan awal berbasis sumber yang tersedia saat ini.

## 1. Objek Pemeriksaan

| Nama | Tipe | Keterangan |
|---|---|---|
| `ProductSchool` | Brand platform | Platform sekolah (primary brand) |
| `NEXORA` | Kandidat subproduk | Pernah dibahas untuk subproduk pembayaran/H2H |
| `SAKOLENTRA` | Kandidat kreatif | Belum terbukti unik/tersedia |
| `Sakola` | Produk Indonesia | Sudah ada di Indonesia di bidang sistem sekolah/keuangan (kemiripan perlu dipertimbangkan) |
| `landing_product` | Nama repo | Repo situs marketing lengkap (ditemukan di audit-rules) |
| `sales_web` | Nama repo | Repo saat ini (situs marketing) |

## 2. Hasil Pencarian Awal (Bertanggal 2026-10-28)

| Nama | Exact/Variasi | Industri yang Ditemukan | Sumber + URL + Tanggal | Status | Risiko | Rekomendasi |
|---|---|---|---|---|---|---|
| `ProductSchool` | Exact (`ProductSchool`) | EdTech/AI Product Training (internasional) - platform pelatihan PM/AI untuk build dengan AI. Juga ada entitas lain. | Websearch: https://productschool.com/ (2026-10-28). Pencarian terkait tidak menunjukkan hasil pasti di PDKI publik via websearch saat ini. | `belum ditemukan dalam pencarian awal` (di PDKI publik via websearch) / perlu verifikasi resmi | Medium - Ada entitas komersial internasional (Product School Inc.) yang aktif di edtech/AI training. Bisa ada potensi kebingungan/konflik tergantung kelas merek & yurisdiksi. | Verifikasi PDKI Indonesia (kelas relevan), domain Indonesia, dan apakah ada penggunaan di Indonesia. Pisahkan dari entitas asing (Product School global) dengan analisis kelas & wilayah. |
| `NEXORA` | Exact (`NEXORA`, `Nexora`) | Fintech/Payments, ISP, Aplikasi, Perbankan digital. Banyak entitas: Nexora.cash (payment solutions), Nexora Group Indonesia (PT terdaftar), Nexora (ISP di Indonesia), Nexora Fintech Ltd (UK), aplikasi/aplikasi lokal, merek diajukan di India (Nexora Financials Class 9 - Formalities Chk Pass), dll. | Websearch: https://nexora.cash/ (2026-10-28), https://nexora.co.id/ (2026-10-28), https://companieshouse.id/nexora-group-indonesia (2026-10-28), https://www.registerkaro.in/.../nexora-financials... (2026-10-28) - India application. | `belum ditemukan dalam pencarian awal` (konfirmasi PDKI) / `perlu verifikasi resmi` | **Tinggi** - Sangat umum digunakan di fintech/payments/tech. Ada PT Nexora Group Indonesia, aplikasi lokal, dan permohonan merek di yurisdiksi lain. Risiko konflik tinggi untuk subproduk pembayaran/H2H. | **TIDAK DISARANKAN** untuk subproduk pembayaran/H2H tanpa verifikasi PDKI menyeluruh (kelas 9/36/42) dan clearence mendalam. Pertimbangkan alternatif. |
| `SAKOLENTRA` | Exact (`SAKOLENTRA`) | Belum ditemukan entitas jelas dalam hasil websearch awal. Kandidat kreatif. | Websearch tidak menemukan entitas komersial/signifikan (2026-10-28). Pencarian PDKI publik via websearch tidak menghasilkan hasil. | `belum ditemukan dalam pencarian awal` / `perlu verifikasi resmi` | Rendah-Menengah - Belum terlihat penggunaan luas, namun perlu verifikasi PDKI untuk kepastian (kemungkinan kosong). Perlu cek variasi ejaan/bunyi. | Verifikasi PDKI (semua kelas relevan), domain .com/.id, dan pastikan unik. Layak dipertimbangkan sebagai kandidat jika lolos verifikasi resmi. |
| `Sakola` | Exact/Variasi (`Sakola`) | Sistem sekolah/keuangan di Indonesia (disebutkan ada produk bernama Sakola). | Konteks dari brief: "Ada produk bernama `Sakola` di Indonesia dalam bidang sistem sekolah/keuangan" (2026-10-28). Detail spesifik tidak terungkap dalam websearch saat ini. | `diperiksa berdasarkan sumber bertanggal` (konteks brief) / `perlu verifikasi resmi` | Menengah-Tinggi - Kemiripan dengan "sekolah" (Sakola ~ "sekolah" dalam beberapa bahasa/konotasi). Risiko kebingungan di pasar Indonesia karena sudah ada produk dengan nama serupa di bidang yang sama. | Verifikasi PDKI Indonesia dengan analisis kemiripan (fonetik/visual), penggunaan aktual, dan kelas yang relevan. Perlu kehati-hatian - mungkin ada konflik di kelas terkait pendidikan/SMS. |
| `landing_product` | Nama repo | Internal repo name | Ditemukan di audit-rules.md (2026-10-28). Bukan nama merek komersial yang diusulkan untuk publik. | `TIDAK BERLAKU` sebagai kandidat brand publik | Rendah - Hanya nama repo/internal | Tidak relevan untuk branding publik. |
| `sales_web` | Nama repo | Internal repo name (repo ini) | Repo saat ini (2026-10-28). Bukan nama merek komersial yang diusulkan untuk publik. | `TIDAK BERLAKU` sebagai kandidat brand publik | Rendah - Hanya nama repo/internal | Tidak relevan untuk branding publik. |

## 2A. Keputusan Brand (2026-10-28)

**Keputusan pemilik konten:** nama payung yang dipilih adalah **Sakolentra**.

| Atribut | Nilai |
|---|---|
| Nama | **Sakolentra** |
| Deskripsi/positioning | **Sistem Administrasi dan Keuangan Operasional Lembaga Pendidikan Terintegrasi** |
| Cakupan | Akademik, administrasi, keuangan, presensi, dan integrasi perbankan |
| Alasan pemilihan | `NEXORA` berisiko tinggi di fintech/payments; `Sakola` mirip produk pendidikan yang sudah ada; `SAKOLENTRA` paling rendah risikonya secara **indikatif** |
| Sifat keputusan | Keputusan produk/konten, **bukan clearance hukum** |

**Status verifikasi (tetap):**
- PDKI (exact/fonetik, kelas 9/36/42), domain `.com`/`.id`, App Store/Google Play, dan handle media sosial: **`BLOCKED`/`PERLU VERIFIKASI`**. Jangan menyatakan Sakolentra "tersedia", "aman", atau "terdaftar" sampai pemeriksaan resmi selesai.
- Rename situs publik sebaiknya menunggu minimal hasil pencarian PDKI dan ketersediaan domain.

**Langkah berikutnya (pemilik):**
1. Cek exact match `SAKOLENTRA` + variasi ejaan di PDKI dan publikasi merek.
2. Cek domain `sakolentra.com`, `sakolentra.id`, `sakolentra.co.id` dan handle sosial.
3. Konsultasikan kelas 9/36/42 dengan konsultan KI sebelum investasi branding.
4. Bila lolos: siapkan rename bertahap (metadata, UI, dokumen, kontrak) dan pertahankan `ProductSchool` sebagai deskriptor/internal selama masa transisi.

---

## 3. Analisis Pemisahan Brand: ProductSchool vs Subproduk H2H

**Konteks:** Perlu memisahkan platform sekolah (`ProductSchool`) dengan subproduk pembayaran/H2H.

### Temuan
- `ProductSchool` (global) sudah eksis di ranah pelatihan AI/Product Management. Di Indonesia, verifikasi PDKI masih perlu dilakukan untuk memastikan tidak ada konflik kelas/merek di yurisdiksi Indonesia.
- Untuk subproduk H2H/pembayaran, `NEXORA` terbukti sangat ramai digunakan (payments, fintech, ISP, ada entitas Indonesia, dan permohonan merek). Risiko konflik signifikan.
- `SAKOLENTRA` tampak kurang digunakan berdasarkan pencarian awal - kandidat yang lebih aman secara indikatif, namun tetap wajib verifikasi resmi.
- `Sakola` berpotensi konflik karena kemiripan dengan industri yang sama (sekolah) dan sudah ada produk serupa di Indonesia.

### Rekomendasi Arah Penamaan (Bukan Keputusan Hukum)

**Opsi 1: Brand Terpisah (Direkomendasikan)**
- Platform: `ProductSchool` (tetap, dengan verifikasi PDKI Indonesia)
- Subproduk H2H/Payment: Cari nama alternatif selain NEXORA. Jika ingin nama yang terkait sekolah, pertimbangkan varian unik (misalnya kombinasi yang tidak mirip dengan "Sakola" atau entitas yang ada). Prioritaskan nama yang bisa dibedakan dengan jelas dari `ProductSchool`.

**Opsi 2: Satu Brand Payung**
- Jika menggunakan satu brand payung, perlu nama yang mencakup akademik, siswa, SDM, keuangan, komunikasi. Nama tersebut harus diverifikasi di PDKI untuk kelas 9, 36, 42 (relevan untuk software/pembayaran/layanan). Saat ini sulit menilai kelayakan tanpa clearence resmi.

**Catatan Penting:**
- Jangan menggunakan `NEXORA` untuk subproduk H2H tanpa clearence PDKI menyeluruh - berdasarkan temuan saat ini, risiko terlalu tinggi.
- Hati-hati dengan `Sakola` karena kemiripan fonetik dengan "sekolah" dan keberadaan produk serupa di Indonesia.
- `SAKOLENTRA` layak dipertimbangkan untuk diuji kelayakannya di PDKI.

## 4. Daftar Verifikasi Resmi yang Masih Diperlukan

| Verifikasi | Status | Langkah Manual yang Diperlukan | Catatan |
|---|---|---|---|
| **PDKI Indonesia** (https://pdki-indonesia.dgip.go.id/) - Kelas 9, 36, 42 | `BLOCKED` | Akses manual ke PDKI. Cek exact match dan similar/fonetik untuk: `ProductSchool`, `NEXORA`, `SAKOLENTRA`, `Sakola`. Periksa status (didaftar/menunggu/ditolak), pemilik, tanggal. | Webfetch ke pdki-indonesia.dgip.go.id berhasil diakses (halaman tersedia), namun pencarian spesifik tidak dapat dieksekusi otomatis via tools saat ini. Perlu pencarian manual via interface PDKI. |
| **PDKI Publikasi Merek** (https://merek.dgip.go.id/publikasi-merek) | `BLOCKED` | Cek publikasi/gazet untuk nama-nama kandidat. | Halaman tersedia, perlu pencarian manual. |
| **E-SAKI** (https://e-saki.dgip.go.id/) | `BLOCKED` | Cek status permohonan/pendaftaran. | Error saat webfetch, perlu akses manual. |
| **Konsultan KI** | `BELUM DILAKUKAN` | Konsultasi dengan konsultan Kekayaan Intelektual terdaftar untuk keputusan hukum penting (khususnya untuk pembayaran/H2H). | Sangat disarankan mengingat kompleksitas dan potensi konflik. |
| **Domain** (.com, .id) | `PERLU VERIFIKASI` | Cek ketersediaan via registrar (whois/DNS). Fokus: `productschool.co.id/.com`, `nexora.id/.com` (kemungkinan sulit), `sakolentra.com/.id`, `sakola.com/.id`. | Belum dicek via tools. Perlu dilakukan terpisah. |
| **App Store/Google Play** | `PERLU VERIFIKASI` | Cari aplikasi dengan nama serupa di Indonesia & global. | Belum dicek. Perlu dilakukan. |
| **Akun Media Sosial** (Instagram, X/Twitter, LinkedIn, TikTok) | `PERLU VERIFIKASI` | Cek handle yang relevan untuk masing-masing kandidat. | Belum dicek. Perlu dilakukan. |

## 5. ID Temuan
Semua temuan menggunakan ID: `PS-AUD-BRAND-xxx`

- `PS-AUD-BRAND-001`: Laporan ini (screening awal)
- `PS-AUD-BRAND-002`: Konflik potensial NEXORA (fintech/payments) - perlu verifikasi PDKI
- `PS-AUD-BRAND-003`: Kemiripan SAKOLA dengan industri sekolah di Indonesia - perlu verifikasi PDKI
- `PS-AUD-BRAND-004`: Perlu pemisahan brand ProductSchool vs subproduk H2H
- `PS-AUD-BRAND-005`: BLOCKED - Akses PDKI untuk pencarian spesifik

## Ringkasan Eksekutif

**File dibuat:** `/Users/andypratama3/Development/sales_web/audit-productschool/10-brand-and-trademark-screening.md`

**Status tiap nama:**
- `ProductSchool`: `belum ditemukan dalam pencarian awal` (di PDKI publik) / `perlu verifikasi resmi` - ada entitas global, perlu clearence Indonesia
- `NEXORA`: `belum ditemukan dalam pencarian awal` (konfirmasi PDKI) / `perlu verifikasi resmi` - **RISIKO TINGGI** (banyak penggunaan di fintech/payments)
- `SAKOLENTRA`: **dipilih sebagai nama payung (2026-10-28)**; `belum ditemukan dalam pencarian awal` / `perlu verifikasi resmi` - kandidat paling menjanjikan secara indikatif
- `Sakola`: `diperiksa berdasarkan sumber bertanggal` / `perlu verifikasi resmi` - kemiripan dengan produk sekolah di Indonesia
- `landing_product`/`sales_web`: `TIDAK BERLAKU` (nama repo)

**5 Risiko Utama:**
1. **Konflik NEXORA** - Penggunaan luas di fintech/payments, ada PT Nexora Group Indonesia dan permohonan merek. Sangat berisiko untuk subproduk H2H.
2. **Kemiripan SAKOLA** - Sudah ada produk bernama Sakola di bidang sistem sekolah/keuangan di Indonesia, berpotensi kebingungan.
3. **Konflik ProductSchool Global** - Entitas Product School global aktif; perlu pastikan tidak ada konflik kelas/merek di Indonesia.
4. **Kebutuhan clearence resmi** - Banyak verifikasi hanya bisa dilakukan via PDKI (BLOCKED untuk pencarian otomatis), tanpa clearence resmi tidak bisa menyimpulkan "aman".
5. **Pemisahan brand** - Perlu strategi pemisahan yang jelas antara platform sekolah dan subproduk pembayaran untuk menghindari perluasan brand yang berisiko.

**BLOCKED:** Pencarian spesifik di PDKI (pdki-indonesia.dgip.go.id, merek.dgip.go.id, e-saki.dgip.go.id) tidak dapat dilakukan otomatis - memerlukan akses manual untuk verifikasi exact match, fonetik, kelas 9/36/42, dan status pendaftaran.
