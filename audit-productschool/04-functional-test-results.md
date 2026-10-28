# Hasil Pengujian Fungsional - Workstream A

Tanggal audit: 2026-10-28  
Auditor: Auditor Workstream A  
Ruang lingkup: Hanya file yang diinstruksikan (02,03,04). Tidak mengubah kode.

## Metode
- **Statis (kode):** Baca `routes/web.php`, `routes/api.php`, controller, model, service, request, seeder, migrasi terkait. Hitung deklarasi `Route::` dan entri permission di `RoleSeeder::allPermissions()`.
- **Dinamis (runtime):** TIDAK DILAKUKAN karena tidak ada kredensial/akun uji, tidak ada akses ke lingkungan pengujian/produksi. Semua uji dinamis ditandai `BLOCKED` sesuai aturan.
- **Sumber marketing:** `data/features.ts`, `data/categories.ts`, `data/flows.ts`, `data/sales.ts` di repo situs marketing (`/Users/andypratama3/Development/sales_web`).
- **Sumber aplikasi:** `/Users/andypratama3/Development/ProductSchool/src`.
- **Referensi brief:** `ProductSchool_Konteks_Audit_Menyeluruh.md` (bagian 1,3,6,11,3.16).

## Verifikasi Klaim Angka
| Klaim | Metode hitung (bukti) | Hasil hitung | Status | Keterangan |
|---|---|---|---|---|
| 75 fitur | `grep -c "^\s*id:" /Users/andypratama3/Development/sales_web/data/features.ts` | 75 | COCOK | Sesuai persis dengan jumlah `id` di data/features.ts |
| 14 kategori | `data/categories.ts` (SEED array) - dihitung manual dari daftar | 14 | COCOK | Akademik,Siswa,PPDB,Kehadiran,Guru & HR,Payroll,Keuangan,CMS,Komunikasi,Instagram,Analitik,AI,Administrasi,Sistem |
| 9 alur (brief lama menyebut 71 alur) | Hitung objek flow di `data/flows.ts` (`^  {`, 2 spasi) dan `flows.length` | **72 flow** | BERBEDA DEFINISI (README stale) | `data/flows.ts` (uncommitted) berisi 72 objek flow; README situs masih menulis 9 (stale). Klaim brief "71 alur" ≈ 72. `flows.length` dipakai dinamis oleh `data/sales.ts:9`. |
| 226 API route | `rg -c "Route::"` (semua wrapper) dan `rg -c "Route::(get\|post\|put\|patch\|delete\|match)\\("` (deklarasi endpoint) di `routes/api.php` | **207 wrapper / 188 endpoint** | TAK TERBUKTI / OVERCLAIM | 207 baris `Route::` termasuk 19 wrapper `middleware/group/prefix/controller`; deklarasi endpoint = 188. Klaim 226 tidak cocok dengan hitungan deklarasi. Definisikan "route" (deklarasi vs expanded vs termasuk web). |
| 380 permission RBAC | Token unik di `database/seeders/RoleSeeder.php` + dokumen aplikasi | **~233 unik (seeder)** | TAK TERBUKTI / OVERCLAIM | 233 token unik (215 berprefix permission); 866 kemunculan (duplikat antar-role). `PRODUCTSCHOOL_DOKUMENTASI.md:61,183` menyebut 272. Klaim 380 tidak ditemukan sumbernya. |

Catatan metode: perhitungan berbasis file yang disebutkan. "Route" bisa dihitung sebagai deklarasi vs route name vs group-expanded.

## Modul Terbukti Ada di Kode vs Hanya Klaim Marketing
| Modul | Status | Bukti |
|---|---|---|
| Akademik (Kurikulum,Tahun,Kelas,Jadwal,Nilai,Rapor,Dokumen,Template,TTD,Inklusi) | TERBUKTI DI KODE | Controller/Service/Model ada di ProductSchool/src |
| Siswa (Data Siswa, Akademik Siswa, Performa, EWS, Ekskul) | TERBUKTI DI KODE | Controller/Service ada |
| PPDB | TERBUKTI DI KODE | Controller publik & dashboard ada |
| Kehadiran (Siswa, GPS Pegawai, Geofencing KML, QR) | TERBUKTI DI KODE | Service/Controller ada |
| Guru & HR (Guru/Pegawai, Cuti) | TERBUKTI DI KODE | Controller/Model ada |
| Payroll | TERBUKTI DI KODE | Controller/Service/Model ada |
| Keuangan (Tagihan, Midtrans, Laporan) | TERBUKTI DI KODE | Controller/Service/Midtrans callback ada |
| Kerja Sama/Mitra (Cooperations) | TERBUKTI DI KODE (CRUD+API publik) | routes/web.php:263, CooperationController, Cooperation model/migration/request, routes/api.php:106 dukungan-kerja-sama; perlu verifikasi tenant isolation & field deskripsi/URL mitra |
| CMS (Halaman/Artikel/Media) | TERBUKTI DI KODE | CmsPage/CmsPost Controller ada |
| Komunikasi (WhatsApp) | TERBUKTI DI KODE | Controller/Service ada |
| Instagram/Meta | TERBUKTI DI KODE | Controller/Service ada |
| Analitik | TERBUKTI DI KODE | Controller/Service ada |
| AI | TERBUKTI DI KODE | Controller/Service ada |
| Administrasi/RBAC (User/Role/Permission) | TERBUKTI DI KODE | Spatie permission, RoleSeeder allPermissions() ada |
| Sistem (API/Webhook/Queue) | TERBUKTI DI KODE | routes/api.php ada, callback Midtrans ada |

Hanya klaim marketing yang perlu diverifikasi lebih lanjut (tanpa bukti runtime): beberapa integrasi/fitur bisa ada di kode tapi status aktif/berfungsi di produksi tidak terbukti (terutama pembayaran H2H).

## Temuan Utama (Format PS-AUD-FN-xxx)
| ID | Judul | Area | Status Bukti | Severity | Dampak | Bukti | Rekomendasi |
|---|---|---|---|---|---|---|---|
| PS-AUD-FN-001 | Jumlah klaim angka tidak sepenuhnya terbukti (API routes/Permissions/Alur) | Verifikasi Klaim | TERINDIKASI | High | Bisa menyesatkan cakupan audit/roadmap | routes/api.php: 188 endpoint (207 wrapper); RoleSeeder ~233 unik/272 dokumen; flows.ts 72 flow vs klaim 226/380/9 | Sepakati definisi (route deklarasi vs expanded, permission unik vs total, flow object vs "alur interaktif"), hitung ulang dengan definisi yang disepakati dan dokumentasikan metodenya |
| PS-AUD-FN-002 | Modul Kerja Sama/Mitra hanya klaim marketing di beberapa sumber? Bukti ada di kode | Kerja Sama/Mitra | TERVERIFIKASI (statis) | High | Perlu pastikan isolasi data & paparan publik sesuai kebijakan | ProductSchool/src/routes/web.php:263; CooperationController; routes/api.php:106 (dukungan-kerja-sama); brief 3.16 | Verifikasi tenant isolation (tidak ada school_id/global scope terlihat), validasi unggahan, pastikan hanya field diizinkan keluar, cek cache invalidation (RevalidateLandingCacheJob) |
| PS-AUD-FN-003 | Permission RBAC diterapkan di route/middleware tapi belum diuji runtime | RBAC/Administrasi | TERINDIKASI | Critical | Risiko akses berlebih jika tidak konsisten di backend | RoleSeeder (~233 unik; dokumen 272; klaim 380), ResourceController middleware mapping (brief 3.16), spatie/laravel-permission usage | Uji deny-by-default per role penting (superadmin/admin/guru/siswa/orang tua/keuangan) di staging; pastikan semua route sensitif punya middleware permission/policy |
| PS-AUD-FN-004 | Integrasi pembayaran Midtrans ada, H2H belum terbukti | Keuangan/Pembayaran/H2H | TERINDIKASI | Critical | Risiko overclaim H2H | MidtransService + MidtransCallbackController ada; brief 3.8 tidak ada bukti bank/sertifikat/UAT/produksi | Jangan klaim H2H aktif; buat status per bank (direncanakan/sandbox/UAT/produksi-terverifikasi) dengan bukti teknis & persetujuan |
| PS-AUD-FN-005 | Uji dinamis diblokir (tidak ada kredensial/akun uji) | Pengujian Fungsional | BLOCKED | High | Tidak bisa verifikasi jalur end-to-end | Aturan audit #9 & #25 | Sediakan akun uji per role (minimal superadmin, admin sekolah, guru, wali kelas, keuangan, PPDB, orang tua/siswa) di lingkungan aman, atau izinkan pengujian read-only terbatas dengan data sintetis | 

## Keterbatasan
- **Tanpa kredensial/akun uji:** Semua test case dinamis ditandai `BLOCKED`. Hanya verifikasi statis (kode/route/config) yang dilakukan.
- **Tanpa akses runtime/DB/log produksi:** Tidak bisa verifikasi webhook nyata, transaksi, rekonsiliasi, performa, atau status integrasi live.
- **Definisi angka berbeda:** "API route", "permission", "alur interaktif" perlu disepakati untuk membandingkan dengan klaim (226/380/9/71/72).
- **Tenant/multi-sekolah:** Belum bisa dipastikan dari pembacaan terbatas; perlu verifikasi skema (school_id/global scope) terutama untuk modul shared seperti CMS/Cooperations.
- **Redaksi:** Tidak menulis secret/token/PII sesuai aturan.

## Ringkasan Akhir
- **File yang dibuat:** `02-product-feature-inventory.csv`, `03-functional-test-cases.csv`, `04-functional-test-results.md` (hanya file ini yang diubah/ditambah)
- **Hasil verifikasi 5 angka klaim:** 75 fitur = COCOK; 14 kategori = COCOK; 9/71 alur = 72 flow (README stale 9; brief 71≈72); 226 API route = 188 endpoint (207 wrapper) = TAK TERBUKTI/OVERCLAIM; 380 permission = 233 unik di RoleSeeder (dokumen 272) = TAK TERBUKTI/OVERCLAIM
- **5 temuan terpenting + ID:** PS-AUD-FN-001 (klaim angka), PS-AUD-FN-002 (Kerja Sama/Mitra), PS-AUD-FN-003 (RBAC deny-by-default), PS-AUD-FN-004 (Pembayaran/H2H), PS-AUD-FN-005 (BLOCKED uji dinamis)
- **Hal yang BLOCKED:** Semua pengujian fungsional dinamis (TC-AKD-*, TC-SIS-*, TC-PPDB-*, TC-HAD-*, TC-HR-*, TC-PAY-*, TC-KEU-*, TC-MIT-*, TC-KOM-*, TC-ADM-*) karena tidak ada kredensial/akun uji dan akses runtime. Diperlukan akun uji per role + lingkungan aman untuk verifikasi end-to-end.
