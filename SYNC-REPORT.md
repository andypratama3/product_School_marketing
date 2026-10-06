# Laporan Sinkronisasi — Situs vs Aplikasi ProductSchool

Tanggal: 2026-10-06. Sumber app: `ProductSchool/src` (Laravel, hanya baca statis;
`artisan` tidak dijalankan karena butuh DB). Angka situs dari `data/*` tidak diubah
(di luar wewenang; keputusan pemilik konten).

## Angka utama: situs vs realita

| Klaim situs | Realita di kode | Status |
|---|---|---|
| 226 route API (`sales.ts`, Hero) | 184 deklarasi / ±188 efektif di `routes/api.php` | ❌ OVERCLAIM ~20% (−38) |
| 380 permission RBAC (`sales.ts`, audiences) | 288 unik di `RoleSeeder::allPermissions()` (dokumen repo: 272) | ❌ OVERCLAIM (+92 vs kode) |
| 34 policy (audiences "34 policy") | 36 file di `app/Policies/` + 36 mapping `AuthServiceProvider` | ⚠️ UNDERCOUNT (+2) |
| 75 fitur / 14 kategori / 9 alur | Konsisten internal situs; tiap kategori ada padanannya di kode (156 controller, 137 model) | ✅ struktur OK |
| Laravel 11 + PHP 8.3 (stack) | Laravel **12.69.1**, PHP 8.3 ✓ | ❌ versi framework salah |
| Next.js 15 + React 19 (stack) | **Tidak ada Next.js** — frontend Blade + Vite + React 19 | ❌ BERTENTANGAN |
| MySQL / PostgreSQL | MySQL dipakai; pgsql hanya driver bawaan, tak dipakai | ⚠️ klaim ganda menyesatkan |
| Midtrans Snap & Core API | `MidtransService` (Snap token, status/cancel/refund) + `config/midtrans.php` | ✅ |
| WhatsApp Cloud API | `WhatsappMetaService` (graph v24.0), webhook, jobs, migrasi chat | ✅ (+bot live `WhatsAppBotService`, 26 ref intent/menu) |
| Google Maps & KML geofence | Maps → **Leaflet 1.9.4 + OSM** (nol ref googleapis); KML ✓ (`KmlService`, controller, file `.kml`) | ❌ separuh salah |
| Spatie Permission (RBAC) | v6.25, `HasRoles`, dipakai di route | ✅ |
| Laravel Sanctum | v4.3.3, `HasApiTokens`, guard `auth:sanctum` | ✅ |
| Queue workers | 23+ jobs `ShouldQueue`, default database; supervisor-conf hanya di docs | ✅ bernuansa |
| Sentry monitoring | **SDK tidak terpasang** (env + referensi provider menggantung, tanpa package/file) | ❌ klaim tanpa bukti |

## Detail fitur yang sempat diragukan — semuanya ADA
CCTV → `CctvManagementController` ✓ · Tasks & Timesheets → `TaskController` + `TaskTimesheet` ✓ ·
Instagram (6 fitur) → `InstagramIntegrationsController` (OAuth, 21 ref token), chat, webhook, carousel job ✓ ·
CMS (4 fitur) → `Hero/Post/Gallery/Achievement/CooperationController` + API V2 ✓ ·
PPDB → `AdmissionService` (queue_number, approve, enroll) ✓ · Payroll → `PayrollService` + export slip ✓ ·
Rapor → renderer PDF + QR + distribusi WA ✓ · TTD → `SignatureRequestController` + `/sign/{slug}` publik ✓.

## Drift kecil (tidak user-facing, catat saja)
String `evidence` di `data/flows.ts` menyebut nama kelas yang tidak persis sama di kode:
`InstagramOAuthController` (aslinya `InstagramIntegrationsController`),
`CmsController` (aslinya controller konten terpisah), `PaymentExportService`
(aslinya `PaymentExport`), `GradeService`/`RaporDistributionService`/`SignaturePdfService`
(perlu cek ulang nama persis). Panel situs sendiri menyatakan alur adalah ilustrasi —
tetap selaraskan namanya saat senggang agar tidak menyesatkan dev yang membaca kode.

## Rekomendasi urutan perbaikan (pemilik konten)
1. Angka: 226→188, 380→288, 34→36 (atau turunkan ke klaim aman "180+ route", "280+ permission").
2. Stack: Laravel 11→12; Next.js 15→Blade + Vite + React 19 (atau hapus jika maksudnya produk lain); Google Maps→Leaflet/OSM; PostgreSQL→MySQL saja; Sentry→cabut sampai SDK dipasang.
3. Selaraskan nama evidence flow dengan kelas asli.
4. Pasang workflow `sync-check` (sudah ditambahkan di `.opencode/skills/sync-check/`) dan jalankan tiap rilis.
