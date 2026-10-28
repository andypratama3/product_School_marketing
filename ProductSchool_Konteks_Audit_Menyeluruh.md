# ProductSchool — Konteks Audit Menyeluruh

> **Tujuan:** brief utama untuk mengaudit ProductSchool secara menyeluruh: produk, fitur, arsitektur, keamanan, kualitas, pembayaran dan H2H, operasional, UX, serta branding.
>
> **Website referensi:** https://product-school.vercel.app/
>
> **Status:** dokumen konteks awal, bukan laporan audit final. Keberadaan fitur di website tidak membuktikan fitur tersebut telah diuji atau berfungsi di produksi.

---

## 1. Instruksi untuk Auditor

Lakukan audit berbasis bukti, sistematis, dan dapat direproduksi. Jangan menganggap fitur berfungsi hanya karena tercantum di website, menu, dokumentasi, screenshot, atau daftar fitur.

### Aturan wajib
1. Jelajahi website, seluruh halaman, menu, submenu, tab, dan modal yang aman dibuka. Jika tersedia secara sah, periksa juga repositori, dokumentasi API, test suite, dan lingkungan pengujian.
2. Beri status pada setiap klaim:
   - `TERVERIFIKASI` — diuji langsung dan hasilnya dicatat.
   - `TERINDIKASI` — ada bukti pendukung tetapi belum diuji tuntas.
   - `BELUM DIVERIFIKASI` — bukti belum cukup.
   - `GAGAL` — diuji dan gagal.
   - `TIDAK BERLAKU` — tidak relevan, dengan alasan.
3. Jangan mengarang fitur, endpoint, hasil tes, integrasi, performa, kepatuhan, sertifikasi, atau status legal.
4. Jangan mengubah data produksi. Jangan mengirim pesan sungguhan, membuat pembayaran, mengubah nilai siswa, mengubah pengaturan, membuat/menghapus pengguna, mengirim email, mempublikasikan konten, atau menjalankan tindakan destruktif.
5. Jangan melewati autentikasi/otorisasi, menebak kredensial, mengeksploitasi sistem, atau mengakses data pengguna lain. Gunakan hanya akses yang disediakan dan diizinkan.
6. Lindungi data pribadi. Gunakan data sintetis/non-produksi. Redaksi nama, nomor telepon, email, token, data siswa, informasi keuangan, dan rahasia dalam bukti.
7. Setiap temuan harus mencatat URL/route, waktu, kondisi awal, langkah reproduksi, expected result, actual result, dampak, serta screenshot/log yang disanitasi.
8. Bedakan klaim pemasaran, bukti kode, hasil tes, dan asumsi. Jangan menyamakan menu dengan fitur selesai, route dengan API yang berfungsi, atau adanya integrasi dengan transaksi end-to-end yang berhasil.
9. Jangan menganggap jumlah fitur sebagai bukti kualitas. Verifikasi alur, hak akses, validasi, error handling, dan konsistensi data.
10. Jika akses/bukti tidak tersedia, tandai `BLOCKED` dan jelaskan apa yang diperlukan.

---

## 2. Konteks Produk

- **Nama platform:** ProductSchool.
- **Website referensi:** https://product-school.vercel.app/
- **Jenis produk:** platform manajemen sekolah dengan banyak modul dan kemungkinan integrasi pihak ketiga.
- **Konteks pembayaran:** fitur keuangan/pembayaran sekolah disebut mencakup SPP/tagihan dan integrasi Midtrans.
- **Konteks H2H:** integrasi bank Host-to-Host (H2H) pernah dibahas sebagai arah/kebutuhan. **Jangan menganggap H2H bank telah diimplementasikan atau aktif sampai dibuktikan melalui kode, konfigurasi aman, dokumen bank, dan tes end-to-end.**
- **Tujuan audit:** memeriksa keadaan sebenarnya, cakupan fitur, kualitas teknis, keamanan, integrasi keuangan, UX, kesiapan produksi, serta arah branding.
- **Batasan:** website publik merupakan peta awal, bukan bukti lengkap tentang backend, database, role, deployment, dan integrasi produksi.

### Klaim website yang harus diperiksa ulang
Ringkasan sebelumnya dari situs menyebut klaim berikut:
- 75 fitur terverifikasi;
- 14 kategori inti;
- 71 alur interaktif;
- 226 API routes;
- 380 permission RBAC.

Angka-angka ini **harus diperlakukan sebagai klaim yang perlu diaudit**, bukan fakta yang otomatis benar. Verifikasi definisi, metode hitung, cakupan tes, status route, dan penerapan permission di backend.

---

## 3. Peta Area Fitur untuk Audit

Daftar berikut adalah cakupan pemeriksaan, **bukan jaminan bahwa semua fitur tersedia atau berfungsi**.

### 3.1 Akademik
- Kurikulum dan struktur akademik.
- Tahun ajaran, semester, kelas, rombongan belajar, jadwal.
- Penilaian, nilai, rapor digital, template rapor.
- Tanda tangan digital atau alur persetujuan dokumen.
- Riwayat akademik dan konsistensi data.

Periksa validasi, batas akses guru/wali kelas/admin, audit perubahan nilai, perhitungan rapor, ekspor PDF, dan pencegahan kebocoran data antar kelas.

### 3.2 Data Siswa
- Profil dan identitas siswa.
- Penempatan kelas dan riwayat siswa.
- Ekstrakurikuler atau data pendukung jika tersedia.
- Status aktif, pindah, lulus, atau nonaktif.

Periksa validasi, duplikasi, pengarsipan, retensi, akses berbasis peran, dan ekspor data pribadi.

### 3.3 PPDB
- Pendaftaran calon siswa.
- CRM calon siswa jika tersedia.
- Review, verifikasi dokumen, persetujuan, dan status proses.

Periksa keamanan unggahan, validasi tipe/ukuran file, akses dokumen, transisi status, spam, duplikasi, dan perlindungan data.

### 3.4 Kehadiran
- Absensi siswa dan/atau staf.
- QR, lokasi/GPS, geofencing/KML jika diterapkan.
- Rekap dan laporan kehadiran.

Periksa manipulasi lokasi, validasi waktu, duplikasi absensi, zona waktu, izin lokasi, fallback offline, akses, dan retensi lokasi.

### 3.5 Guru, Pegawai, dan HR
- Profil guru dan pegawai.
- Cuti/izin, penugasan, data kepegawaian jika tersedia.
- Peran serta ruang lingkup data.

Periksa kerahasiaan data, alur persetujuan, pemisahan tugas, dan hak akses.

### 3.6 Payroll
- Konfigurasi komponen gaji.
- Proses payroll, slip gaji, dan laporan jika tersedia.

Periksa akurasi perhitungan, pembulatan, periode, approval, pemisahan pembuat/penyetuju, audit trail, dan kerahasiaan. Jangan menjalankan payroll nyata selama audit.

### 3.7 Keuangan dan Pembayaran
- Tagihan SPP/biaya sekolah.
- Status pembayaran dan riwayat transaksi.
- Integrasi yang disebutkan, termasuk Midtrans.
- Virtual Account, QR, e-wallet, atau metode lain hanya jika implementasinya terbukti.
- Rekonsiliasi, laporan, pembatalan/refund jika relevan.

Periksa:
- Siklus transaksi: dibuat, menunggu, berhasil, gagal, kedaluwarsa, dibatalkan, refund.
- Idempotensi webhook/notifikasi; event duplikat dan terlambat.
- Verifikasi signature/autentikasi notifikasi provider.
- Nominal, mata uang, reference ID, invoice, dan pemetaan ke siswa/tagihan.
- Race condition, double payment, pembayaran parsial/lebih, retry, timeout, dan kegagalan provider.
- Rekonsiliasi catatan lokal dengan laporan provider/bank.
- Audit log untuk perubahan status.
- Pengamanan secret/API key, pemisahan sandbox/production, dan redaksi log.
- Kontrol akses ke data pembayaran dan laporan keuangan.

**Larangan:** jangan membuat transaksi riil, instruksi pembayaran, refund, atau memanggil endpoint produksi yang memengaruhi uang. Gunakan sandbox/mock yang sah.

### 3.8 Integrasi Bank Host-to-Host (H2H)
Verifikasi apakah sistem benar-benar memiliki:
- Bank/mitra yang teridentifikasi dan persetujuan integrasi yang sah.
- Spesifikasi protokol/API bank yang terdokumentasi.
- Autentikasi/otorisasi sesuai spesifikasi bank.
- TLS dan persyaratan sertifikat jika berlaku.
- Signing pesan, checksum, enkripsi, atau mutual TLS jika diwajibkan bank.
- Manajemen secret/sertifikat, rotasi, penyimpanan, dan pemisahan environment.
- Mapping rekening, VA, tagihan, kode transaksi, dan reference ID.
- Inquiry, notifikasi transaksi, status check, settlement, serta rekonsiliasi sesuai ruang lingkup.
- Retry/backoff, idempotensi, timeout, circuit breaker, dan penanganan gangguan.
- Monitoring, alert, audit log, tracing, dan eskalasi.
- UAT bank, persetujuan produksi, dan bukti acceptance jika dipersyaratkan.

Jangan menyebut H2H `aktif`, `real-time`, `secure banking integration`, atau `multi-bank ready` tanpa bukti teknis dan persetujuan terkait. Tandai status: `direncanakan`, `dalam pengembangan`, `sandbox`, `UAT`, atau `produksi-terverifikasi`.

### 3.9 CMS dan Konten
- Halaman, artikel, galeri, publikasi, media, atau pengumuman jika tersedia.

Periksa sanitasi HTML, kontrol upload, hak publikasi, preview, draft/publish, SEO metadata, dan audit perubahan.

### 3.10 Komunikasi dan WhatsApp
- Notifikasi, template, chatbot, WhatsApp Cloud API, atau AI jika tersedia.

Periksa persetujuan penerima, template/provider policy, rate limit, retry, deduplikasi, delivery status, opt-out, pengamanan token, dan pencatatan pengiriman.

Jangan mengirim pesan nyata selama audit tanpa izin eksplisit dan penerima uji yang disetujui.

### 3.11 Media Sosial
- Integrasi akun, publikasi, carousel, atau penjadwalan jika tersedia.

Periksa OAuth, scope minimum, penyimpanan token, expiry/refresh, error API, dan persetujuan sebelum publikasi.

### 3.12 AI
- Asisten AI/integrasi model jika tersedia.
- Saran konten, bantuan dokumen, atau fitur AI jika tersedia.

Periksa privasi input, prompt injection, kebocoran data, penggunaan tool, batas biaya, timeout, fallback, logging, dan verifikasi manusia. Jangan mengirim data pribadi siswa ke layanan eksternal tanpa dasar dan otorisasi yang tepat.

### 3.13 Analitik dan Pelaporan
- Dashboard, metrik, laporan akademik/keuangan, ekspor.

Periksa definisi metrik, konsistensi sumber data, filter, rentang tanggal, timezone, otorisasi, dan ekspor sesuai hak akses.

### 3.14 Pengguna, RBAC, dan Administrasi
- Pengguna, role, permission, tugas, timesheet, atau audit log jika tersedia.
- Klaim 380 permission harus diperiksa ulang, termasuk apakah permission diterapkan di backend.

Periksa least privilege, deny-by-default, server-side authorization di setiap endpoint, pemisahan data sekolah/tenant/kelas, IDOR/BOLA, akses darurat, pemulihan akun, MFA jika sesuai, sesi, pencabutan akses, dan integritas audit log.

### 3.15 API, Webhook, dan Sistem
- REST API, route, webhook, import/export, CCTV atau layanan lain jika tersedia.

Periksa autentikasi, otorisasi, validasi schema, rate limit, pagination, error handling, versioning, CORS, secret leakage, SSRF, mass assignment, injection, dan data exposure.

Jangan melakukan pemindaian invasif/eksploitasi pada layanan live tanpa ruang lingkup dan izin tertulis.

### 3.16 Kerja Sama / Mitra
Modul CMS **Mitra & Kerja Sama** (`cooperations`) untuk mengelola daftar mitra sekolah dan menampilkannya di website publik. Bagian ini **berjalan saat ini** (bukan rencana), sehingga wajib masuk cakupan audit.

Cakupan yang berjalan (bukti kode, bukan hasil uji runtime):
- **CRUD dashboard** — `app/Http/Controllers/Dashboard/CooperationController.php`: index (DataTables), create/store, show (JSON), edit/update, destroy.
- **Route** — `routes/web.php`: `Route::resource('cooperations', CooperationController::class)` di grup `dashboard` (`auth`, `verified`, `CheckUserStatus`).
- **Otorisasi** — `ResourceController::middleware()` memetakan `$permissionResource = 'cooperations'` ke permission `view-cooperations` (index/show), `create-cooperations` (create/store), `edit-cooperations` (edit/update), `delete-cooperations` (destroy). Tidak ditemukan `CooperationPolicy`; `CooperationRequest::authorize()` selalu `true`.
- **Model/skema** — `app/Models/Cooperation.php`: `name`, `photo`, `sort_order`, `slug`; UUID; `HasAuditLog`. Tabel `cooperations` (`database/migrations/2026_03_27_005350_create_editorial_and_web_tables.php`) tidak memiliki kolom `school_id`/tenant.
- **Validasi** — `app/Http/Requests/Dashboard/CooperationRequest.php`: `name` wajib max 255; `photo` wajib saat create, `image` dengan mime jpeg/png/jpg/webp max 2048 KB; `slug` unik; `sort_order` integer. Slug kosong dibuat otomatis dengan `uniqid()`.
- **Media** — `StoragePaths::store(..., 'cooperations')`; URL publik lewat `CmsImageUrl::url(..., 'img/kerjasama')`; file dihapus saat `destroy` dan diganti saat `update`.
- **API landing publik** — `GET /api/v2/dukungan-kerja-sama` (`app/Http/Controllers/Api/V2/LandingController.php@dukungan`) dengan middleware `landing.token` + `throttle:api-read`; hanya mengembalikan `name`, `slug`, `foto` (`basename`), urut `sort_order`; data kosong dibalas sukses (HTTP 200) dengan pesan "Data tidak ditemukan".
- **Seed & test** — `database/seeders/CooperationSeeder.php` berisi data sintetis/placeholder; `tests/Feature/Api/V2/LandingApiV2Test.php` menguji urutan data API.
- **Cache** — perubahan data CMS terkait `RevalidateLandingCacheJob`; verifikasi apakah modul ini benar-benar memicu revalidasi.

Periksa:
- **Otorisasi server-side** setiap aksi, termasuk `show` yang membalas JSON di route dashboard; pastikan permission benar-benar menolak role tanpa hak (bukan hanya menyembunyikan menu), dan tidak ada IDOR pada parameter `cooperationRecord`.
- **Isolasi data/tenant** — tentukan model tenant yang dipakai (database-per-sekolah vs shared DB). Bila shared/multi-tenant, ketiadaan `school_id`/global scope berpotensi membocorkan mitra lintas sekolah; bila database-per-sekolah, catat sebagai desain yang disengaja beserta buktinya.
- **Keamanan unggahan** — validasi isi file (bukan hanya MIME/ekstensi), ukuran, nama file, path traversal, kemungkinan eksekusi file, akses langsung ke direktori `img/kerjasama`, enumerasi file publik, pembersihan file yatim saat update/hapus.
- **Integritas data** — keunikan dan pembuatan slug (`uniqid`), `sort_order` duplikat/null dan stabilitas urutan, retensi/soft delete, serta apakah `HasAuditLog` mencatat aktor dan perubahan.
- **Eksposur publik** — hanya field yang diizinkan yang keluar, `basename` path tidak membocorkan struktur storage, token `landing.token` tidak bocor, rate limit, serta konsistensi cache setelah CRUD.
- **Konten & klaim** — XSS pada `name` (escaping Blade), alt text logo, dan klaim pemasaran "logo dan deskripsi partner": verifikasi apakah field deskripsi/URL mitra benar-benar ada; jika tidak, catat sebagai OVERCLAIM.
- **Persetujuan & privasi** — dasar/persetujuan publikasi nama dan logo mitra, serta perlindungan data narahubung bila field kontak ditambahkan.
- **UX & aksesibilitas halaman publik** — empty state, ukuran/kontras logo, teks alternatif, dan responsivitas.

Status bukti saat ini: keberadaan modul dan perilaku kode = **TERVERIFIKASI (baca kode)**; hasil uji runtime, isi data produksi, dan tampilan publik = **BELUM DIVERIFIKASI**.

---

## 4. Audit Arsitektur dan Kualitas Kode

Jika kode sumber tersedia, audit:
- Struktur frontend/backend dan batas modul.
- Validasi request dan konsistensi domain.
- Skema database, foreign key, indeks, transaksi, migrasi.
- Race condition dan konsistensi transaksi.
- Queue/job, retry, idempotensi, dead-letter handling jika tersedia.
- Cache dan invalidation jika tersedia.
- Logging, tracing, error monitoring, alert.
- Konfigurasi environment dan pemisahan development/staging/production.
- Dependency audit dan paket usang/berisiko.
- Static analysis, linting, unit/integration/e2e tests.
- Backup, restore test, disaster recovery, RPO/RTO.
- Performa query, N+1, pagination, payload, bottleneck.
- Accessibility, responsive layout, browser compatibility, UX.
- Deployment, rollback, migrations, health checks, secret management.

Jangan menyatakan audit kode lulus jika repositori atau bukti teknis belum tersedia.

---

## 5. Audit Keamanan dan Privasi

Sesuaikan dengan stack aktual. Minimal periksa:
- Authentication dan session management.
- Authorization/RBAC dan pemisahan tenant/data.
- Password reset, MFA, brute-force/rate limiting.
- Validasi input dan output encoding.
- CSRF, XSS, SQL/command injection, SSRF, file upload.
- CORS, security headers, TLS, cookie flags.
- Secret/API key leakage.
- Dependency dan supply-chain risk.
- Audit log dan monitoring.
- Data pribadi siswa/orang tua/guru/pegawai.
- Data minimization, retention, deletion, export, consent/notice sesuai kebutuhan.
- Backup encryption dan akses backup.
- Incident response dan akses administratif.

Gunakan OWASP ASVS dan OWASP Top 10 sebagai referensi yang sesuai; catat versi dan ruang lingkup. Jangan mengklaim compliance tanpa penilaian formal yang relevan.

---

## 6. Audit Pengujian Fungsional

Untuk setiap fitur, catat:
1. ID test case.
2. Modul dan route.
3. Role/akun uji.
4. Prasyarat.
5. Data uji sintetis.
6. Langkah pengujian.
7. Hasil yang diharapkan.
8. Hasil aktual.
9. Status pass/fail/blocked/not tested.
10. Bukti tersanitasi.
11. Severity jika gagal.
12. Link bug/tiket.

Uji jalur normal, validasi, empty/loading/error/success states, boundary cases, permission denial, duplicate submissions, retry, dan responsive behavior.

Jangan menggunakan istilah “71 alur interaktif terverifikasi” kecuali setiap alur memiliki definisi, hasil pengujian, dan bukti yang dapat ditinjau.

---

## 7. Audit UX dan Aksesibilitas

Periksa:
- Navigasi dan konsistensi label.
- Hierarki informasi dan pencarian.
- Empty/loading/error/success states.
- Konfirmasi tindakan penting.
- Form validation dan pesan error.
- Responsivitas mobile/tablet/desktop.
- Keyboard navigation dan focus states.
- Contrast, label form, alt text, screen-reader semantics.
- Bahasa dan istilah konsisten.
- Alur penting untuk orang tua/guru/staf keuangan.
- Beban kognitif dashboard dan tabel.
- Pengalaman pada koneksi lambat.

Dokumentasikan temuan dengan screenshot tersanitasi. Jangan memasukkan data pribadi dalam screenshot.

---

## 8. Audit Branding dan Penamaan

### Konteks nama
- Brand platform saat ini: `ProductSchool`.
- Kandidat subproduk pembayaran/H2H yang pernah dibahas: `NEXORA`, lalu `SAKOLENTRA`.
- `NEXORA` ditemukan digunakan sejumlah bisnis/produk teknologi dan pembayaran dalam penelusuran awal; jangan menganggapnya tersedia.
- `SAKOLENTRA` adalah kandidat kreatif, belum terbukti unik atau tersedia.
- Ada produk bernama `Sakola` di Indonesia dalam bidang sistem sekolah/keuangan; kemiripan nama perlu dipertimbangkan, tetapi ini bukan keputusan hukum.

### Keputusan brand (2026-10-28)
- Nama payung terpilih: **Sakolentra**.
- Positioning: **Sistem Administrasi dan Keuangan Operasional Lembaga Pendidikan Terintegrasi**.
- Cakupan: akademik, administrasi, keuangan, presensi, integrasi perbankan.
- Sifat: keputusan pemilik konten, **bukan clearance hukum**. PDKI/domain/sosial tetap wajib diverifikasi; sampai itu selesai, status nama adalah `BELUM DIVERIFIKASI`.
- Rename situs publik belum dilakukan dalam audit ini.

### Arah yang dipertimbangkan
Pisahkan platform sekolah dan subproduk pembayaran/H2H:
- **ProductSchool** — School Management Platform.
- **[Nama subproduk yang lolos pemeriksaan] H2H** — School Payment & Banking Integration.

Jika ingin satu brand, pilih nama payung yang mencakup akademik, siswa, SDM, keuangan, komunikasi, dan teknologi. Modul H2H dapat memakai nama berbeda.

### Pemeriksaan nama wajib
- Exact match dan variasi ejaan/bunyi di PDKI.
- Kelas merek yang relevan dengan barang/jasa aktual; kelas 9, 36, dan 42 mungkin relevan, tetapi jangan otomatis menganggap semuanya diperlukan.
- Nama perusahaan/produk di Indonesia dan pasar target.
- Domain `.com`, `.id`, serta alternatif.
- App Store/Google Play dan akun media sosial jika relevan.
- Kemiripan di industri sekolah, SaaS, fintech, pembayaran, dan perbankan.
- Reputasi, potensi salah asosiasi, pelafalan, ejaan, dan makna dalam bahasa Indonesia/Inggris.
- Pendapat konsultan KI untuk keputusan hukum penting.

Sumber:
- PDKI: https://pdki-indonesia.dgip.go.id/
- PANDI: https://pandi.id/
- Registrar domain bereputasi.
- Direktori perusahaan dan mesin pencari untuk indikasi penggunaan, bukan pengganti pencarian merek resmi.

**Jangan menyatakan nama “pasti belum digunakan” hanya karena pencarian web tidak menemukan hasil.** Gunakan status yang jujur: `belum ditemukan dalam pencarian awal`, `perlu verifikasi resmi`, atau `diperiksa berdasarkan sumber bertanggal`.

---

## 9. Status Integrasi Pembayaran dan H2H

Buat tabel status untuk setiap provider/bank.

| Provider/Bank | Jenis integrasi | Environment | Status | Bukti yang diperlukan | Risiko/catatan |
|---|---|---|---|---|---|
| Midtrans | Payment gateway, jika terbukti | Sandbox/production | Belum ditetapkan oleh brief ini | Kode, konfigurasi tersanitasi, log, hasil tes | Jangan menganggap end-to-end sukses tanpa bukti |
| Bank yang disebut pemilik | H2H | Development/sandbox/UAT/production | Belum diverifikasi | Dokumen integrasi, persetujuan bank, spesifikasi, UAT | Jangan mengklaim aktif/multi-bank tanpa bukti |
| Provider lain | Sesuai implementasi | Sesuai implementasi | Belum diverifikasi | Bukti teknis dan kontraktual | Verifikasi satu per satu |

Jangan mencantumkan secret, token, private key, sertifikat privat, nomor rekening lengkap, atau data pelanggan di laporan.

---

## 10. Kesiapan Operasional dan Produksi

Audit:
- Availability dan error rate.
- Monitoring dan alerting.
- Log tersanitasi dan traceability.
- Backup dan bukti restore.
- Incident response.
- Manajemen akses produksi.
- Deployment/rollback.
- Kapasitas, load test, dan rate limits.
- SLA/SLO yang benar-benar disepakati.
- Dukungan dan eskalasi vendor/bank.
- Dokumentasi admin, guru, staf keuangan, dan orang tua.
- Runbook untuk transaksi pending, callback gagal, selisih rekonsiliasi, dan downtime bank.
- Prosedur manual aman saat integrasi terganggu.

Semua angka SLA, uptime, performa, atau delivery rate harus memiliki periode pengukuran dan sumber bukti.

---

## 11. Deliverables yang Harus Dihasilkan

Simpan laporan dalam folder seperti `audit-productschool/`:

```text
audit-productschool/
├── README.md
├── 01-executive-summary.md
├── 02-product-feature-inventory.csv
├── 03-functional-test-cases.csv
├── 04-functional-test-results.md
├── 05-security-and-privacy.md
├── 06-architecture-and-code-quality.md
├── 07-payment-and-h2h-audit.md
├── 08-ux-accessibility.md
├── 09-performance-and-reliability.md
├── 10-brand-and-trademark-screening.md
├── 11-risk-register.csv
├── 12-remediation-roadmap.md
├── evidence/
│   ├── screenshots/
│   ├── sanitized-logs/
│   └── test-artifacts/
└── limitations-and-open-questions.md
```

Jika audit tertentu terblokir karena akses atau bukti tidak tersedia, catat `BLOCKED` dan jelaskan apa yang dibutuhkan. Jangan isi kekosongan dengan dugaan.

### Format temuan
- **ID:** `PS-AUD-XXX`
- **Judul:**
- **Area:**
- **Status bukti:** Terverifikasi / Terindikasi / Belum diverifikasi / Gagal / Tidak berlaku
- **Severity:** Critical / High / Medium / Low / Informational
- **Dampak:**
- **Prasyarat dan langkah reproduksi:**
- **Expected result:**
- **Actual result:**
- **Bukti:**
- **Rekomendasi:**
- **Kriteria penerimaan perbaikan:**
- **PIC dan target waktu:** jika disepakati

---

## 12. Prioritas Penanganan

### P0 — Kritis
- Kebocoran data siswa/keuangan lintas pengguna atau tenant.
- Akses tidak sah ke fungsi administratif.
- Pemalsuan status pembayaran atau transaksi ganda dengan dampak finansial.
- Secret produksi terungkap.
- Pembayaran/H2H produksi berjalan tanpa kontrol dasar memadai.

### P1 — Tinggi
- RBAC server-side tidak konsisten.
- Webhook pembayaran tidak terverifikasi atau tidak idempoten.
- Rekonsiliasi gagal dengan risiko salah catat.
- Backup/restore tidak dapat diandalkan.
- Kerentanan keamanan signifikan yang dapat direproduksi.

### P2 — Sedang
- Alur utama rusak tetapi ada workaround.
- Kesalahan laporan/perhitungan terbatas.
- UX meningkatkan risiko salah input.
- Monitoring atau error handling kurang memadai.

### P3 — Rendah
- Isu visual, copy, konsistensi minor, dan peningkatan kenyamanan.

Prioritas akhir harus berdasarkan bukti dan dampak aktual.

---

## 13. Pertanyaan Terbuka

1. Apakah website referensi adalah dokumentasi statis, demo, atau aplikasi produksi?
2. Apakah repositori kode lengkap tersedia?
3. Apa stack frontend/backend/database/queue/cache yang benar-benar digunakan?
4. Modul mana yang aktif, dikembangkan, deprecated, atau hanya mock/demo?
5. Apakah ada multi-tenant atau pemisahan data antarsekolah?
6. Provider pembayaran apa yang aktif dan pada environment apa?
7. Apakah H2H sudah memiliki bank partner, spesifikasi, UAT, dan persetujuan produksi?
8. Apakah ada akun uji per role dan data sintetis?
9. Apakah test suite dan laporan CI tersedia?
10. Apa sasaran deployment, SLA, volume transaksi, dan kebutuhan pemulihan?
11. Apakah target branding hanya Indonesia atau pasar internasional?
12. Siapa pemilik sah merek dan badan hukum operator produk?

---

## 14. Kriteria Selesai Audit

Audit dianggap selesai hanya jika:
- Inventaris mencakup seluruh fitur yang ditemukan dan setiap item memiliki status bukti.
- Alur bisnis utama diuji atau ditandai blocked dengan alasan.
- Hak akses dan pemisahan data diuji secara aman.
- Pembayaran dan H2H memiliki laporan status yang tidak melebih-lebihkan keadaan.
- Risiko keamanan, privasi, finansial, dan operasional diprioritaskan.
- Temuan memiliki bukti, rekomendasi, dan acceptance criteria.
- Keterbatasan dan pertanyaan terbuka tercatat.
- Nama produk diberi status pemeriksaan merek/domain yang jelas.
- Ringkasan eksekutif membedakan fakta, klaim produk, hasil uji, asumsi, dan hal yang belum diketahui.

**Prinsip akhir:** audit harus menjelaskan keadaan ProductSchool yang sebenarnya, bukan sekadar mengulang klaim pemasaran atau daftar fitur.
