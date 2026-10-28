# 06 - Arsitektur & Kualitas Kode

**Tanggal audit:** 2026-10-28  
**Sumber:** 
- LaraveI app: `/Users/andypratama3/Development/ProductSchool/src` (branch `main`, commit `994b431f`)
- Marketing site (Next.js): `/Users/andypratama3/Development/sales_web` (branch `main`, commit `fbbdde7`)

**Aturan:** Sesuai `_AUDIT-RULES.md`. Status bukti mengikuti: TERVERIFIKASI/TERINDIKASI/BELUM DIVERIFIKASI/GAGAL/TIDAK BERLAKU/BLOCKED. ID temuan: `PS-AUD-ARCH-xxx`.

---

## 1) Stack Nyata

### ProductSchool/src (Laravel)
- `composer.json`: Laravel `^12.56`, PHP `^8.2` (platform 8.3.33). Paket kunci: `barryvdh/laravel-dompdf`, `spatie/laravel-permission` ^6.24, `midtrans/midtrans-php` ^2.6, `laravel/sanctum` ^4.0, `laravel/reverb` ^1.0, `yajra/laravel-datatables`, `dedoc/scramble`, `spatie/browsershot`, `phpoffice/phpspreadsheet`, `thiagoalessio/tesseract_ocr`. Dev: `phpunit/phpunit` ^11, `larastan/larastan` ^3, `phpstan/phpstan` ^2, `laravel/pint` ^1.29, `brianium/paratest` ^7.8. (`composer.json:9-46`, `config:102-108`)
- Struktur: `app/` memiliki `Http/Controllers/{Api,Auth,Dashboard,Marketing,Public,...}`, `Models/`, `Services/`, `Jobs/`, `Console/Commands/`, `Helpers/` (autoloaded), `Enums/`, `Rules/`, dll. Modularitas terindikasi kuat. (`src/app/*`)

### sales_web (Next.js)
- `package.json`: Next `^16.3.8`, React `^19.0.0`, TypeScript `^5.7.0`, GSAP, lucide-react, resend. Script: `dev`, `build`, `start -p 3100`, `typecheck` (`tsc --noEmit`). (`package.json:1-26`)
- Struktur: App Router (`app/`), `components/`, `data/`, `lib/`. Berbagai file UI telah dimodifikasi (worktree kotor).

---

## 2) Skema DB, Migrasi, FK/Indeks/Transaksi/Soft Delete/UUID
**Status bukti:** TERINDIKASI

- Migrasi ditemukan di `database/migrations/` (termasuk `2026_03_27_005350_create_editorial_and_web_tables.php` untuk `cooperations`).
- Pola: UUID pada beberapa model (mis. `Cooperation`), `HasAuditLog` pada beberapa model.
- Soft delete: terindikasi ada, **tidak diverifikasi menyeluruh**.
- Foreign key & indeks: **tidak semua tabel diverifikasi**. Modul `cooperations` **tidak memiliki `school_id`/tenant key** (brief 3.16) — potensi isu isolasi data bila multi-tenant shared DB.
- Transaksi: digunakan di beberapa alur; cakupan perlu verifikasi.

---

## 3) Queue/Job/Retry/Idempotensi/Dead-letter, Cache & Invalidation, Scheduler
**Status bukti:** TERINDIKASI

- `config/queue.php`: koneksi (sync/database/beanstalkd/sqs/redis), `failed_jobs` dikonfigurasi. (`config/queue.php:7,41,98,109`)
- Konfigurasi: `config/rapor.php` (retry/queue), `config/services.php` (`LANDING_REVALIDATION_QUEUE`), `config/school.php` (retry Midtrans), `config/bankkaltim.php` (throttle). 
- `RevalidateLandingCacheJob` disebut untuk perubahan CMS landing (termasuk `cooperations`).
- Scheduler/idempotensi/dead-letter: perlu verifikasi lebih lanjut.

---

## 4) Logging/Monitoring/Alert
**Status bukti:** TERVERIFIKASI

- `SystemMonitoringController` (`view-system-monitoring`), route `monitoring`, `monitoring/metrics`, `monitoring/logs`, `monitoring/download-log`. (`routes/web.php:86,981-983`)
- Log viewer/metrics/unduh log terdokumentasi. Rotasi log diperhatikan (`config/logging.php`).
- Sentry terindikasi (command/config/env). Dinonaktifkan di testing (`phpunit.xml`).
- Alerting terpusat: **BELUM DIVERIFIKASI**.

---

## 5) Konfigurasi Lingkungan, Deployment, Health Check, Rollback
**Status bukti:** TERINDIKASI

- `.env.example` ada di kedua repo. `docker-compose.yml` ada di `ProductSchool/src/`, tidak ditemukan `Dockerfile/nginx/k8s` terpusat. `scripts/deploy_production.sh` ada. Health check/rollback perlu verifikasi.

---

## 6) Kualitas, Static Analysis, Test, Dependency
**Status bukti:** TERINDIKASI

- `phpstan.neon`, baseline, `pint.json`, `larastan/larastan`, `phpunit/phpunit` ^11. `phpunit.xml` (Unit/Feature, SQLite in-memory). `coverage.xml` ada. `playwright.config.js` ada. Dependency audit (`composer audit`/`npm audit`): **BELUM DIVERIFIKASI**.

---

## 7) Backup/Restore & DR
**Status bukti:** BLOCKED

- Tidak ditemukan script/dokumen RPO/RTO terpusat. Hanya template rapor (`resources/views/rapor/backup-template.blade.php`) — bukan backup operasional.

---

## 8) Verifikasi Repositori & Typecheck
- `ProductSchool/src`: **bersih** (git status --short kosong). 
- `sales_web`: **kotor** (banyak MODIFIED) — tidak diubah.
- `npm run typecheck` (sales_web): **GAGAL** — `tsc: command not found` (tooling tidak tersedia di lingkungan). Bukan error tipe.

---

## Temuan Utama (8) + Severity

| ID | Judul | Area | Status Bukti | Severity | Dampak | Bukti | Rekomendasi | Kriteria Penerimaan |
|---|---|---|---|---|---|---|---|---|
| PS-AUD-ARCH-001 | Stack & struktur teridentifikasi | Arsitektur | TERINDIKASI | Informational | Baseline pemahaman | `composer.json`, `package.json` | Dokumentasikan peta modul + diagram. | Peta modul terdokumentasi. |
| PS-AUD-ARCH-002 | Queue/failed_jobs ada, idempotensi/dead-letter belum diverifikasi | Queue/Job | TERINDIKASI | High | Kehilangan job/webhook | `config/queue.php`, `config/rapor.php`, `config/bankkaltim.php` | Audit job kritis, idempotency key, monitoring failed_jobs + alert. | Daftar job kritis + kontrol idempotensi + alert. |
| PS-AUD-ARCH-003 | SystemMonitoring ada, alerting terpusat belum terbukti | Observability | TERINDIKASI | High | Deteksi insiden lambat | `routes/web.php:981-983`, `SystemMonitoringController` | Tambahkan alert rules (queue lag/failed_jobs/errors). | Alert rules terdokumentasi/terkonfigurasi. |
| PS-AUD-ARCH-004 | `cooperations` tanpa `school_id` berpotensi isu isolasi multi-tenant | Skema/Multitenancy | TERINDIKASI | High | Kebocoran lintas sekolah (shared DB) | Brief 3.16 | Verifikasi model tenancy; jika shared tambahkan `school_id` + global scope + tes isolasi. | Keputusan tenancy terdokumentasi + kontrol teruji. |
| PS-AUD-ARCH-005 | Static analysis/test ada, dep audit & coverage perlu validasi | Kualitas Kode | TERINDIKASI | Medium | Risiko dep/coverage | `phpstan*.neon`, `pint.json`, `phpunit.xml`, `coverage.xml` | `composer audit`, `npm audit`, verifikasi coverage terkini, CI gate. | Laporan audit dep + coverage valid + gate. |
| PS-AUD-ARCH-006 | Backup/restore/DR tidak ditemukan | Operasional/DR | BLOCKED | Critical | Tidak siap pulih | Pencarian repo | Kumpulkan kebijakan backup, enkripsi, lokasi, bukti restore, runbook DR, RPO/RTO. | DR plan + bukti restore + RPO/RTO disepakati. |
| PS-AUD-ARCH-007 | Artifacts deploy parsial | Deployment | TERINDIKASI | Medium | Rollback/migrasi kurang terstandar | `docker-compose.yml`, `scripts/deploy_production.sh` | Dokumentasikan deploy/rollback/migrasi/health check. | Runbook deploy+rollback. |
| PS-AUD-ARCH-008 | Typecheck sales_web gagal (tooling hilang) | Tooling/Build | GAGAL | Low | CI/lokal typecheck tidak jalan | `npm run typecheck` gagal | Install deps/restore tooling (`npm ci`), verifikasi `tsc`. | `npm run typecheck` berhasil. |

---

## Ringkasan
- **File dibuat:** `/Users/andypratama3/Development/sales_web/audit-productschool/06-architecture-and-code-quality.md`
- **8 temuan utama + severity:** seperti tabel di atas
- **Typecheck:** sales_web GAGAL (`tsc: command not found`); ProductSchool/src tidak dijalankan
- **Repo status:** `ProductSchool/src` bersih; `sales_web` kotor (tidak diubah)
- **Keterbatasan:** Scan migrasi/FK/index menyeluruh, eksekusi `php artisan`/build, akses kredensial/infra tidak dilakukan. Beberapa temuan TERINDIKASI/BLOCKED sesuai aturan.
