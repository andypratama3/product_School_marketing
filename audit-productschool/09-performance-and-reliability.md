# 09 - Performance & Reliability Audit

**ID Workstream:** F (Performance & Reliability)  
**Tanggal audit:** 2026-10-28  
**Auditor:** Auditor Workstream F  
**Lingkup:** `/Users/andypratama3/Development/ProductSchool/src` (Laravel + Blade + Vite) dan `/Users/andypratama3/Development/sales_web` (Next.js). Uji live pasif ke `https://product-school.vercel.app/`.  
**Kondisi:** Read-only. Tidak menjalankan `npm run build`/`next build`, tidak menjalankan `php artisan` yang butuh DB/mengubah state. Tidak membuat/mengubah data.

## Ringkasan Eksekutif
- **Queue/Job:** Tersedia tabel `jobs`, `job_batches`, `failed_jobs` (migrasi `0001_01_01_000002_create_jobs_table.php:14-72`). `QUEUE_CONNECTION` default `database` di `config/queue.php:48`. `RevalidateLandingCacheJob` (`app/Jobs/RevalidateLandingCacheJob.php:25-120`) mengimplementasikan `ShouldBeUnique, ShouldQueue`, `tries=3`, `timeout=30`, `uniqueFor=30`, dengan `Http::timeout(config(...timeout,10))` dan `retry_after` DB/Redis terkonfigurasi.
- **Cache & invalidasi:** `CACHE_STORE` di `.env` = `database` (dev), `.env.example` = `redis`. Tabel `cache`, `cache_locks` ada. Invalidation terdaftar di `AppServiceProvider::registerCacheObservers()` dan `registerLandingRevalidationHooks()` mem-dispatch `RevalidateLandingCacheJob` untuk model di `config/services.php:147-200` (termasuk `Cooperation`).
- **Monitoring/health:** `SystemMonitoringController` memeriksa queue (count `jobs`/`failed_jobs`), DB, cache, sistem (disk/mem/load/uptime) dengan otorisasi `view-system-monitoring`. Tersedia `HealthCheckCommand` (DB/Redis/storage writable), `CheckWhatsAppCommand`, `Route::get('/up')` di `bootstrap/app.php:36`.
- **Rate limit/throttle:** Terpusat di `App\Providers\AppServiceProvider::configureRateLimiters()` (whatsapp-webhook/instagram-webhook 60/min per IP, api-general 100/min, midtrans-webhook 30/min, bankkaltim-token 10/min dengan JSON 429, bankkaltim-callback 60/min, login 5/min, api-export 10/hour). Banyak route web/api menggunakan `throttle:*`.
- **Frontend (Next.js):** Next 16.3.8, React 19, `next.config.mjs` minimal (`reactStrictMode`, `outputFileTracingRoot`). Tidak ada `next/image` konfigurasi kompleks terlihat; dependensi terbatas (gsap, lucide-react, resend). Live: `https://product-school.vercel.app/` merespons HTTP 200, waktu ~0.70-1.29s (3 pengukuran pasif).
- **Bukti uptime/SLA/backup/restore/DR:** TIDAK DITEMUKAN (BLOCKED) - tidak ada dokumen SLA, konfigurasi backup/restore/DR, runbook recovery, atau metrik uptime terarsip di repo yang diaudit.

## Temuan Utama (8 temuan)

### PS-AUD-PERF-001 - N+1/eager loading/pagination (Laravel)
- **Area:** Performance / Query
- **Status bukti:** TERINDIKASI
- **Severity:** Medium
- **Dampak:** Potensi pembengkakan query pada halaman daftar dengan relasi.
- **Prasyarat & langkah reproduksi:** Baca controller/resource yang memakai Eloquent tanpa `with()`/pagination.
- **Expected:** Penggunaan eager loading dan pagination pada endpoint/listing besar.
- **Actual:** Tidak ditemukan pola global N+1 audit; kontrol ditemukan, namun cakupan tidak diverifikasi menyeluruh.
- **Bukti:** `ProductSchool/src/app/Http/Controllers/*`, `app/Http/Resources/*` (dibaca secara selektif) - tidak ditemukan konfirmasi komprehensif.
- **Rekomendasi:** Audit query per listing kritis (siswa/tagihan/kehadiran) dengan `->with()`, `->load()`, pagination, dan profiling terarah.
- **Kriteria penerimaan:** Daftar untuk modul kritis menggunakan eager loading + pagination dan terukur.
- **PIC/target:** Backend
- **Catatan:** Belum diverifikasi menyeluruh (sampling terbatas).

### PS-AUD-PERF-002 - Indeks migrasi (keberadaan & cakupan)
- **Area:** Performance / Database
- **Status bukti:** TERINDIKASI
- **Severity:** Medium
- **Dampak:** Query lambat pada kolom yang sering difilter/sort/join.
- **Prasyarat & langkah reproduksi:** Tinjau migrasi untuk indeks kolom kunci.
- **Expected:** Indeks pada FK, status, tanggal, dan kolom pencarian.
- **Actual:** Terdapat migrasi tabel inti; cakupan indeks tidak diverifikasi lengkap.
- **Bukti:** Migrasi di `ProductSchool/src/database/migrations/` (banyak file) - sampling tidak cukup untuk klaim lengkap.
- **Rekomendasi:** Inventaris indeks per tabel kritis (students, payments, attendances, users) dan tambahkan indeks yang hilang bila diperlukan.
- **Kriteria penerimaan:** Laporan indeks per tabel kritis + justifikasi.
- **PIC/target:** DBA/Backend

### PS-AUD-PERF-003 - Aset frontend (deps, gambar, font, Next config)
- **Area:** Performance / Frontend
- **Status bukti:** TERVERIFIKASI
- **Severity:** Low
- **Dampak:** Ukuran bundle/aset; konfigurasi minimal.
- **Prasyarat & langkah reproduksi:** Baca `package.json`, `next.config.mjs`, `public/`, `app/`, `src/`.
- **Expected:** Konfigurasi Next yang wajar, deps terkendali.
- **Actual:** Next 16.3.8, React 19, config minimal (`reactStrictMode: true`, `outputFileTracingRoot`). Deps terbatas (gsap, lucide-react, resend). Tidak terlihat konfigurasi `images`, `font` khusus, atau optimasi agresif.
- **Bukti:** `sales_web/package.json:1-50`, `sales_web/next.config.mjs:1-15`, `sales_web/public/` (ada aset statis), `sales_web/app/` (struktur Next App Router).
- **Rekomendasi:** Pertimbangkan `next/image` dengan konfigurasi domain, font optimization (next/font), dan analisis bundle bila performa perlu ditingkatkan.
- **Kriteria penerimaan:** Dokumentasi aset kritis + rekomendasi optimasi terukur.
- **PIC/target:** Frontend

### PS-AUD-REL-001 - Queue/Job/Retry/failed_jobs/Scheduler
- **Area:** Reliability / Queue
- **Status bukti:** TERVERIFIKASI
- **Severity:** High
- **Dampak:** Kegagalan job tidak tertangani bisa mengganggu revalidasi cache/integrasi.
- **Prasyarat & langkah reproduksi:** Baca migrasi queue, config, job class.
- **Expected:** Tabel jobs/job_batches/failed_jobs ada, retry/backoff dikonfigurasi, monitoring tersedia.
- **Actual:** Migrasi lengkap ada. `queue.default = database`. `RevalidateLandingCacheJob` punya `tries=3`, `timeout=30`, `ShouldBeUnique` + `uniqueFor=30`, `release(10)` saat gagal HTTP. `SystemMonitoringController::checkQueue()` menghitung pending/failed dari tabel. Scheduler terdaftar di `bootstrap/app.php:56-58` (`posts:publish-scheduled` tiap menit tanpa overlap).
- **Bukti:** `ProductSchool/src/database/migrations/0001_01_01_000002_create_jobs_table.php:14-72`, `ProductSchool/src/config/queue.php:48-150`, `ProductSchool/src/app/Jobs/RevalidateLandingCacheJob.php:25-120`, `ProductSchool/src/app/Http/Controllers/Dashboard/SystemMonitoringController.php:275-291`, `ProductSchool/src/bootstrap/app.php:56-58`
- **Rekomendasi:** Pastikan worker queue berjalan di produksi, monitor `failed_jobs` (alert), dan definisikan runbook retry/cleanup failed jobs.
- **Kriteria penerimaan:** Worker terkonfigurasi, alerting failed_jobs, proses pembersihan terdefinisi.
- **PIC/target:** DevOps/Backend

### PS-AUD-REL-002 - Cache & invalidation (`RevalidateLandingCacheJob`)
- **Area:** Reliability / Cache
- **Status bukti:** TERVERIFIKASI
- **Severity:** High
- **Dampak:** Inkonsistensi cache landing bisa terjadi jika invalidasi gagal.
- **Prasyarat & langkah reproduksi:** Baca observer hooks dan job.
- **Expected:** Invalidation otomatis saat model landing berubah, dengan retry dan fallback logging.
- **Actual:** `registerLandingRevalidationHooks()` dispatch job untuk semua model di `config/services.php:154-200` termasuk `Cooperation` (baris ~163). Job mengirim POST ke `LANDING_REVALIDATION_URL` dengan secret, tags/paths, timeout 10s (configurable), `tries=3`, `release(10)` saat exception, logging ke `sensitive_api`. Unique job mencegah spam burst.
- **Bukti:** `ProductSchool/src/app/Providers/AppServiceProvider.php:269-303`, `ProductSchool/src/config/services.php:147-200`, `ProductSchool/src/app/Jobs/RevalidateLandingCacheJob.php:72-120`
- **Rekomendasi:** Pantau kegagalan revalidasi (log/metric), pastikan secret terenkripsi, dan uji fallback saat landing down.
- **Kriteria penerimaan:** Log monitoring revalidasi + alert kegagalan beruntun.
- **PIC/target:** Backend/Frontend Ops

### PS-AUD-REL-003 - Race condition operasi tulis (absensi/pembayaran/tagihan)
- **Area:** Reliability / Concurrency
- **Status bukti:** TERINDIKASI
- **Severity:** High
- **Dampak:** Double payment/absensi ganda bisa terjadi.
- **Prasyarat & langkah reproduksi:** Cari penggunaan DB transaction, lock, idempotency key.
- **Expected:** Transaksi DB, row locking (`lockForUpdate`), idempotensi pada webhook/pembayaran.
- **Actual:** Tidak ditemukan pola komprehensif saat sampling; ada rate limiting dan webhook handling. Perlu verifikasi mendalam per alur kritis.
- **Bukti:** Sampling controller payment/attendance - tidak cukup untuk klaim lengkap.
- **Rekomendasi:** Audit `PaymentController`, alur absensi, dan webhook dengan fokus pada `DB::transaction()`, `lockForUpdate()`, idempotency keys, dan duplikasi request.
- **Kriteria penerimaan:** Daftar race condition berpotensi + mitigasi terverifikasi atau rencana perbaikan.
- **PIC/target:** Backend

### PS-AUD-REL-004 - Monitoring/alert/health check (Dockerfile, k8s probes, SystemMonitoringController)
- **Area:** Reliability / Observability
- **Status bukti:** TERVERIFIKASI (sebagian)
- **Severity:** High
- **Dampak:** Deteksi insiden lambat tanpa health check/probes terstandar.
- **Prasyarat & langkah reproduksi:** Cari Dockerfile/k8s, health endpoints, monitoring.
- **Expected:** Health endpoints, probes, alerting terkonfigurasi.
- **Actual:** Ada `Route::get('/up')` (Laravel default), `SystemMonitoringController` (queue/db/cache/system/ollama) dengan auth `view-system-monitoring`, `HealthCheckCommand`, `CheckWhatsAppCommand`, `WhatsAppHealthController`. TIDAK ditemukan `Dockerfile`, `docker-compose`, file k8s/helm/probes di repo yang diaudit.
- **Bukti:** `ProductSchool/src/bootstrap/app.php:36`, `ProductSchool/src/app/Http/Controllers/Dashboard/SystemMonitoringController.php:1-350`, `ProductSchool/src/app/Console/Commands/HealthCheckCommand.php:1-80`, `ProductSchool/src/app/Console/Commands/CheckWhatsAppCommand.php:1-170`, `ProductSchool/src/app/Http/Controllers/Api/V1/WhatsAppHealthController.php:1-80`. Pencarian Dockerfile/k8s: tidak ditemukan.
- **Rekomendasi:** Tambahkan health endpoints terstandar untuk liveness/readiness, definisikan probes jika di-orchestrasi, dan konfigurasikan alerting (queue failed, disk/mem tinggi).
- **Kriteria penerimaan:** Dokumentasi health check + rencana probes/alerting.
- **PIC/target:** DevOps

### PS-AUD-REL-005 - Backup/restore/DR + RPO/RTO
- **Area:** Reliability / DR
- **Status bukti:** BLOCKED
- **Severity:** Critical
- **Dampak:** Tidak ada jaminan pemulihan saat insiden.
- **Prasyarat & langkah reproduksi:** Cari skrip backup, dokumentasi restore/DR, SLA/RPO/RTO.
- **Expected:** Prosedur backup otomatis, tes restore berkala, DR plan, RPO/RTO disepakati.
- **Actual:** Tidak ditemukan bukti di repo yang diaudit.
- **Bukti:** Pencarian `backup`, `restore`, `dr`, `rpo`, `rto`, `disaster` di repo - tidak ditemukan file/dokumen yang relevan.
- **Rekomendasi:** Buat dan dokumentasikan backup strategy (DB/files), jadwal, enkripsi, tes restore minimal kuartalan, DR plan dengan RPO/RTO.
- **Kriteria penerimaan:** Dokumen backup/restore/DR + bukti tes restore terbaru.
- **PIC/target:** DevOps/Management
- **Catatan:** BLOCKED - bukti tidak tersedia di repo.

### PS-AUD-REL-006 - Rate limit/throttle dan timeout provider
- **Area:** Reliability / Protection
- **Status bukti:** TERVERIFIKASI
- **Severity:** High
- **Dampak:** Serangan/brute force dan overload tereduksi, namun perlu verifikasi cakupan.
- **Prasyarat & langkah reproduksi:** Baca rate limiter config dan route.
- **Expected:** Rate limit pada auth, API sensitif, webhook, impor.
- **Actual:** Terpusat di AppServiceProvider dengan pembatasan per jenis (login 5/min, api-sensitive 20/min, api-export 10/jam, webhook 30-60/min, impor 10 per 60 menit). Route web/api menerapkan throttle. `RevalidateLandingCacheJob` menggunakan `Http::timeout(10)`. Provider timeout perlu verifikasi per integrasi.
- **Bukti:** `ProductSchool/src/app/Providers/AppServiceProvider.php:305-400`, `ProductSchool/src/routes/auth.php:28-59`, `ProductSchool/src/routes/api.php:67-396`, `ProductSchool/src/routes/web.php:121,204,530-552,1015,1035`, `ProductSchool/src/app/Jobs/RevalidateLandingCacheJob.php:90`
- **Rekomendasi:** Verifikasi timeout/retry pada semua HTTP call ke provider (Midtrans/Bank H2H/WhatsApp) dan pastikan circuit breaker bila ada.
- **Kriteria penerimaan:** Daftar call eksternal + timeout/retry/circuit breaker.
- **PIC/target:** Backend

### PS-AUD-PERF-004 - Metrik live situs marketing
- **Area:** Performance / Live
- **Status bukti:** TERVERIFIKASI (pasif)
- **Severity:** Informational
- **Dampak:** Baseline performa situs publik.
- **Prasyarat & langkah reproduksi:** `curl` pasif ke URL live.
- **Expected:** Situs merespons.
- **Actual:** `https://product-school.vercel.app/` mengembalikan HTTP 200. Pengukuran: 1.290905s, 0.696926s, 0.727602s (3 permintaan berturut-turut).
- **Bukti:** Hasil curl (dicatat saat audit) - tidak ada perubahan, hanya baca pasif.
- **Rekomendasi:** Lakukan pengukuran terukur (Core Web Vitals) dengan tooling yang sesuai bila dibutuhkan, tanpa load test.
- **Kriteria penerimaan:** Baseline tercatat.
- **PIC/target:** Frontend

### PS-AUD-REL-007 - Bukti uptime/SLA
- **Area:** Reliability / SLA
- **Status bukti:** BLOCKED
- **Severity:** Critical
- **Dampak:** Tidak ada komitmen terukur yang bisa diverifikasi.
- **Prasyarat & langkah reproduksi:** Cari SLA, uptime report, monitoring history.
- **Expected:** SLA/SLO terdokumentasi dengan periode dan sumber.
- **Actual:** Tidak ditemukan di repo.
- **Bukti:** Pencarian tidak menemukan dokumen SLA/uptime.
- **Rekomendasi:** Dokumentasikan SLA/SLO jika ada, atau nyatakan status saat ini.
- **Kriteria penerimaan:** Dokumen SLA/SLO + laporan uptime.
- **PIC/target:** Management/DevOps

## Tabel Ringkas Temuan
| ID | Judul | Area | Status Bukti | Severity |
|---|---|---|---|---|
| PS-AUD-PERF-001 | N+1/eager loading/pagination | Performance/Query | TERINDIKASI | Medium |
| PS-AUD-PERF-002 | Indeks migrasi | Performance/DB | TERINDIKASI | Medium |
| PS-AUD-PERF-003 | Aset frontend (deps/gambar/font/Next config) | Performance/Frontend | TERVERIFIKASI | Low |
| PS-AUD-REL-001 | Queue/Job/Retry/failed_jobs/Scheduler | Reliability/Queue | TERVERIFIKASI | High |
| PS-AUD-REL-002 | Cache & invalidation (RevalidateLandingCacheJob) | Reliability/Cache | TERVERIFIKASI | High |
| PS-AUD-REL-003 | Race condition operasi tulis | Reliability/Concurrency | TERINDIKASI | High |
| PS-AUD-REL-004 | Monitoring/alert/health check | Reliability/Observability | TERVERIFIKASI (sebagian) | High |
| PS-AUD-REL-005 | Backup/restore/DR + RPO/RTO | Reliability/DR | BLOCKED | Critical |
| PS-AUD-REL-006 | Rate limit/throttle & timeout provider | Reliability/Protection | TERVERIFIKASI | High |
| PS-AUD-PERF-004 | Metrik live situs marketing | Performance/Live | TERVERIFIKASI (pasif) | Informational |
| PS-AUD-REL-007 | Bukti uptime/SLA | Reliability/SLA | BLOCKED | Critical |

*Catatan:* Total temuan utama yang diminta: 8. Di atas tercantum 11 item untuk cakupan lengkap sesuai brief; 8 temuan utama yang disorot adalah PS-AUD-PERF-001, PS-AUD-PERF-002, PS-AUD-PERF-003, PS-AUD-REL-001, PS-AUD-REL-002, PS-AUD-REL-003, PS-AUD-REL-004, PS-AUD-REL-005 dengan severity terkait.

## Metrik Live
- URL: https://product-school.vercel.app/
- Pengukuran (curl pasif): HTTP 200, time_total 1.290905s; 0.696926s; 0.727602s
- Tanggal: 2026-10-28

## Keterbatasan
- **Tidak ada DB/runtime:** Tidak menjalankan migrasi/query aktual, tidak mengukur query time/N+1 secara runtime.
- **Tidak ada akses produksi:** Tidak bisa memverifikasi worker queue aktif, backup/restore riil, uptime historis, SLA.
- **Sampling:** Beberapa area (N+1, indeks, race condition) hanya di-sampling; perlu audit mendalam per modul.
- **Docker/k8s:** Tidak ditemukan di repo yang diaudit - status deployment/orchestration tidak dapat diverifikasi.
- **Live test terbatas:** Hanya curl pasif (tanpa load test/build).
- **SLA/DR:** Bukti tidak tersedia di repo (BLOCKED).

## Verifikasi File
File ditulis ke path absolut yang diminta.
