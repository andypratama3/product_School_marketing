# Keterbatasan & Pertanyaan Terbuka

**Tanggal:** 2026-10-28  
**Sifat:** Daftar hal yang tidak dapat disimpulkan dari audit ini, bukti yang masih dibutuhkan, dan status pertanyaan terbuka pada brief bagian 13. Dokumen ini **bukan** bukti bahwa fitur aman atau siap produksi.

## 1. Keterbatasan Metode

| # | Keterbatasan | Dampak | Status |
|---|---|---|---|
| L-01 | Audit dilakukan **statis** (baca kode/konfigurasi/dokumen). Tidak ada uji runtime end-to-end. | Fungsi, izin, dan integrasi belum terbukti bekerja di lingkungan nyata. | `BLOCKED` |
| L-02 | Tidak tersedia akun uji per role dan data sintetis di lingkungan aman. | Seluruh test case dinamis di `03-functional-test-cases.csv` berstatus `BLOCKED`. | `BLOCKED` |
| L-03 | Tidak ada akses DB, log produksi, queue worker, scheduler, atau APM. | Tidak dapat memverifikasi data nyata, race condition, retry, dan rekonsiliasi. | `BLOCKED` |
| L-04 | Tidak ada kredensial/sandbox resmi Midtrans dan Bank Kaltim. | Status transaksi, webhook, dan settlement tidak dapat diuji. | `BLOCKED` |
| L-05 | Tidak ada dokumen persetujuan bank, spesifikasi VASPEC/ISA final, sertifikat/mTLS, atau bukti UAT. | H2H tidak dapat disebut produksi-terverifikasi. | `BLOCKED` |
| L-06 | Model tenancy (database-per-sekolah vs shared DB dengan `school_id`) belum dikonfirmasi. | Risiko kebocoran data lintas sekolah belum dapat dinilai final. | `BELUM DIVERIFIKASI` |
| L-07 | Pemeriksaan merek hanya pencarian awal; PDKI/PANDI memerlukan akses/manual query. | Tidak ada kesimpulan ketersediaan/legalitas nama. | `BLOCKED` |
| L-08 | UX/a11y diperiksa heuristik dari kode; tidak ada uji screen reader, keyboard penuh, atau pengukuran kontras otomatis. | Temuan aksesibilitas bersifat indikatif, bukan audit WCAG formal. | `TERBATAS` |
| L-09 | Screenshot/log tersanitasi belum tersedia di `evidence/`. | Bukti visual belum lengkap. | `BLOCKED` |
| L-10 | `npm run typecheck` gagal karena `tsc` tidak ditemukan (dependensi belum terpasang). | Bukan bukti kode gagal typecheck; verifikasi tipe belum dilakukan. | `BLOCKED` |
| L-11 | Tidak ada akses log CI, coverage aktual, atau hasil pipeline produksi. | Kualitas test suite dan gerbang rilis belum dapat dinilai. | `BLOCKED` |
| L-12 | Audit tidak melakukan pemindaian kerentanan dinamis/eksploitasi (sesuai aturan). | Kerentanan runtime di luar bukti kode belum terpetakan. | `TIDAK BERLAKU` |

## 2. Daftar BLOCKED & Bukti yang Dibutuhkan

### 2.1 Fungsional & RBAC
- Akun uji per role: superadmin, admin sekolah, guru/wali kelas, staf keuangan, PPDB, orang tua/siswa — beserta data sintetis.
- Lingkungan staging yang aman untuk uji jalur normal, validasi, permission denial, duplikasi, dan retry.
- Definisi resmi metrik: "fitur", "alur interaktif", "API route", "permission".

### 2.2 Pembayaran & H2H
- Kredensial sandbox/produksi Midtrans yang diizinkan, status webhook terdaftar, histori transaksi, dan log callback tersanitasi.
- Spesifikasi VASPEC Bank Kaltim final, kredensial sandbox, callback allowlist, sertifikat/TLS/mTLS, dan bukti UAT/persetujuan bank.
- ISA resmi Bankaltimtara SNAP, skema signature final, endpoint, dan persetujuan — saat ini stub.
- Runbook transaksi pending, callback gagal, selisih rekonsiliasi, dan downtime bank.

### 2.3 Keamanan
- Konfirmasi model tenancy dan bukti scoping data antar sekolah/kelas.
- Rotasi dan purge riwayat git untuk private key; bukti secret scanning CI.
- Verifikasi cookie/session pada HTTPS produksi dan header keamanan aktual.
- Bukti validasi unggahan (magic bytes), akses direktori media, dan pembersihan file yatim.

### 2.4 Operasional & Reliabilitas
- Bukti backup terbaru + uji restore, RPO/RTO, enkripsi backup, dan akses backup.
- SLA/SLO tertulis, monitoring/alerting, on-call, dan prosedur insiden.
- Log CI, hasil test suite aktual, dan bukti deployment/rollback.

### 2.5 Brand & Legal
- Pencarian resmi PDKI (exact/fonetik; kelas 9/36/42 sesuai barang/jasa), PANDI/domain, App Store/Google Play, dan akun media sosial.
- Kepemilikan merek dan badan hukum operator; pendapat konsultan KI untuk keputusan penting.

## 3. Status Pertanyaan Terbuka (Brief Bagian 13)

| # | Pertanyaan | Status | Jawaban berbasis bukti |
|---|---|---|---|
| 1 | Website referensi = dokumentasi statis, demo, atau produksi? | `BELUM DIVERIFIKASI` | `https://product-school.vercel.app/` merespons HTTP 200 (uji pasif 2026-10-28), tetapi sifat deployment (demo/produksi) tidak dapat dipastikan dari luar. |
| 2 | Repositori kode lengkap tersedia? | `TERVERIFIKASI (sebagian)` | Tersedia `/Users/andypratama3/Development/ProductSchool/src` (Laravel) dan dua repo marketing (`sales_web`, `landing_product`). Kelengkapan riwayat/secret/infra tidak dapat dipastikan. |
| 3 | Stack frontend/backend/database/queue/cache? | `TERVERIFIKASI (kode)` | Laravel + Blade/Vite; Next.js/React untuk marketing; queue/cache berbasis konfigurasi Laravel (driver aktual produksi belum diverifikasi). |
| 4 | Modul mana aktif/dikembangkan/deprecated/mock? | `SEBAGIAN` | Modul inti ada di kode; Bankaltimtara SNAP = stub; status aktif produksi per modul belum diuji. |
| 5 | Multi-tenant atau pemisahan antarsekolah? | `BELUM DIVERIFIKASI` | Tidak ditemukan `school_id` pada `cooperations`; perlu konfirmasi apakah tenancy memakai DB terpisah. |
| 6 | Provider pembayaran aktif & environment? | `TERINDIKASI` | Midtrans terimplementasi; Bank Kaltim classic VA terimplementasi; environment produksi/sandbox aktual belum terbukti. |
| 7 | H2H sudah punya bank partner, spesifikasi, UAT, persetujuan produksi? | `BLOCKED` | Implementasi ada; dokumen bank/ISA/UAT/persetujuan tidak ditemukan. |
| 8 | Akun uji per role & data sintetis? | `BLOCKED` | Tidak tersedia. |
| 9 | Test suite & laporan CI tersedia? | `SEBAGIAN` | Ada `phpunit.xml`, `tests/`, Playwright, `coverage.xml`; hasil CI aktual tidak tersedia. |
| 10 | Sasaran deployment, SLA, volume transaksi, kebutuhan pemulihan? | `BLOCKED` | Tidak ditemukan SLA/RPO/RTO/volume; sebagian konfigurasi deployment ada (Docker/nginx/k8s). |
| 11 | Target branding Indonesia atau internasional? | `BELUM DIVERIFIKASI` | Materi menyasar sekolah Indonesia; rencana ekspansi tidak terdokumentasi. |
| 12 | Pemilik sah merek & badan hukum operator? | `BLOCKED` | Tidak ditemukan bukti kepemilikan/legalitas. |

## 3A. Catatan Perubahan Setelah Audit (2026-10-28)

| Perubahan | Dampak pada audit |
|---|---|
| Direktori repo aplikasi berganti nama dari `Development/ProductSchool` menjadi `Development/Sakolentra`. | Sitasi path di `01`–`12` dipertahankan sebagai path saat audit. Untuk navigasi sekarang gunakan `Sakolentra/src/...`. |
| HEAD bergerak dari `994b431f` ke `59f68d81` (“update logs blade”), dan ada perubahan eksternal branding ProductSchool → Sakolentra di README, `.env.example`, `SchoolHelper.php`, `school.php`, `AiChatService.php`, `composer.json`, `rapor.php`, `package.json`, `api.json`, `PushNotificationObserver.php`, `RaporDataSeeder.php`. | Temuan yang menyentuh file tersebut perlu dire-verifikasi sebelum ditutup. Perubahan eksternal tidak boleh di-revert. |
| `src/app/Http/Requests/Dashboard/CooperationRequest.php` diubah (izin `create-cooperations`/`edit-cooperations`, `sort_order min:0`, batas dimensi foto). | Uji ulang RBAC/isolasi pada endpoint kerja sama (lihat `verification-checklist.md` V-32). |
| Private key: 4 file `privkey*.pem` tracked (root, live, 2 arsip) pada commit `b0cbeb60`/`3de5949f`/`18f426cc`; sertifikat live Let's Encrypt kedaluwarsa 2026-07-10. | Tetap P0 (pernah bocor), bukan “aman karena kedaluwarsa”. Lihat `private-key-rotation-runbook.md`. |

## 4. Asumsi yang Dipakai

1. Repo `/Users/andypratama3/Development/ProductSchool` adalah sumber aplikasi yang dimaksud brief; `sales_web` adalah situs marketing yang diaudit.
2. Route/permission yang dibaca statis mencerminkan kode saat audit, bukan kondisi produksi.
3. Bank Kaltim classic VA dianggap **belum produksi-terverifikasi** sampai dokumen bank/UAT tersedia; Bankaltimtara SNAP dianggap **tidak siap**.
4. Angka klaim pemasaran diperlakukan sebagai klaim sampai metode hitungnya disepakati.
5. Temuan severity mengikuti bukti kode; prioritas akhir harus dikonfirmasi pemilik produk setelah verifikasi runtime.
