# 07 - Payment & H2H Audit

**Tanggal Audit:** 2026-10-28  
**Bahasa:** Indonesia  
**Sumber yang diaudit:** `/Users/andypratama3/Development/ProductSchool/src` (Aplikasi asli)  
**Ruang lingkup:** Pembayaran statis (Midtrans, Bank Kaltim VA/Bankaltimtara, webhook, H2H)  
**Aturan:** Read-only, tidak membuat transaksi/memanggil endpoint yang mengubah uang, redaksi secret/rekening.  
**Standar ID:** `PS-AUD-PAY-xxx`, `PS-AUD-H2H-xxx`

---

## Ringkasan

| Item | Status | Catatan |
| :-- | :-- | :-- |
| File dibuat | **BERHASIL** | `audit-productschool/07-payment-and-h2h-audit.md` |
| Status Midtrans | **TERINDIKASI TERIMPLEMENTASI** | Service, gateway adapter, controller, webhook route + signature verification, idempotensi (lock per charge + duplikasi), status mapping, refund, reconciliation command. Konfigurasi berbasis env/system config. SDK (`midtrans/midtrans-php`) dipanggil. |
| Status H2H (Bank Kaltim classic VA) | **TERVERIFIKASI TERIMPLEMENTASI (VA inbound/outbound + callback token)** | Bank Kaltim classic VA (VASPEC) memiliki client, token manager, VA service, gateway adapter, callback controller (token + callback) dengan auth/token mekanisme, settlement service, rate limiting, logging, scheduler reconciliation, UI/operasional. Belum ditemukan bukti persetujuan bank/sertifikat/mTLS/UAT resmi tertulis di repo. |
| Status H2H (Bankaltimtara SNAP) | **TERINDIKASI STUB / BELUM SIAP** | Controller, route webhook, toggle gateway, struktur signature (HMAC), rate limit ada namun `notification()` masih stub dan `getStatus()` 501; driver `null`, spec ditandai UNKNOWN menunggu ISA resmi. |

---

## Tabel Status Provider/Bank (sesuai brief bagian 9)

| Provider/Bank | Jenis integrasi | Environment | Status | Bukti yang diperlukan | Risiko/catatan |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **Midtrans** | Payment gateway (Snap + Core API) | Sandbox/Production (dikontrol via `MIDTRANS_IS_PRODUCTION` / `get_system_config('midtrans_*')`) | **TERINDIKASI (implementasi ada)** | Bukti kredensial/flag produksi, webhook URL terdaftar, histori transaksi sukses, test notification, log webhook | Signature SHA512 (`order_id+status_code+gross_amount+server_key`), idempotensi lock + duplikasi, guard menolak downgrade payment completed, test notification diakui. Perlu verifikasi end-to-end produksi. |
| **Bank Kaltim (classic VA / VASPEC)** | H2H VA outbound/inbound + callback + reconciliation | Sandbox/Production (dikontrol via `BANKKALTIM_ENABLED` / config) | **TERINDIKASI (implementasi ada, konfiguratif)** | Spesifikasi VASPEC, kredensial/env, base_url, cert/TLS, callback credentials, UAT/bukti persetujuan bank, settlement reports, monitoring | Memiliki JWT token manager, VA create/reset/delete/status, callback token auth (username+password/hash), callback settlement, rate limiting (`bankkaltim-token`, `bankkaltim-callback`), logging terpisah, scheduler reconcile daily/monthly. Belum ada bukti mTLS/sertifikat mutual/ISA resmi di repo. |
| **Bankaltimtara (SNAP)** | H2H SNAP (stub) | Tidak aktif / menunggu spec | **TIDAK DITEMUKAN BUKTI SIAP** | ISA resmi Bankaltimtara, partnerId/clientSecret, X-SIGNATURE skema final, endpoint callback, UAT/approval | Route + controller + toggle ada, signature helper ada, namun `notification()` stub, `getStatus()` 501, driver null. Jangan klaim aktif/real-time. |
| **Provider lain** | Tidak teridentifikasi dalam scope ini | N/A | **TIDAK DITEMUKAN** | N/A | Tidak ditemukan bukti implementasi lain di `app/Services/**` terkait pembayaran selain Midtrans/Bank Kaltim/Bankaltimtara. | 

---

## Bukti Kode Kunci (dengan file:line)

### Midtrans
- Konfigurasi: `config/midtrans.php:1-119` (server_key/client_key dari env, `is_production`, endpoints snap/api, callbacks, webhook_url)
- Service: `app/Services/MidtransService.php:16-440` (SDK init via `get_system_config`, createTransaction -> Snap token + create Charge, `verifySignatureFromCallback` SHA512, `processCallback` validasi + signature + test notification + lock per charge, `settleCallback` dengan idempotensi duplikasi transaction_id + guard downgrade payment completed + event PaymentCompleted, cancel/refund)
- Gateway adapter: `app/Services/Payment/Gateways/MidtransGateway.php:1-50` (delegasi ke MidtransService)
- Controller dashboard: `app/Http/Controllers/Dashboard/MidtransController.php:1-250` (notification handling, refund request)
- Routes webhook: `routes/web.php:1013-1018` (`midtrans/notification` GET/POST, `withoutMiddleware([VerifyCsrfToken, CheckUserStatus])`, `middleware('throttle:midtrans-webhook')`)
- Rate limit: `app/Providers/AppServiceProvider.php:329-336` (`midtrans-webhook` 30/min per IP)
- Reconcile command: `app/Console/Commands/ReconcilePendingPayments.php:1-140` (hanya Midtrans)

### Bank Kaltim (classic VA / VASPEC)
- Konfigurasi: `config/bankkaltim.php:1-200` (enabled/base_url/username/password/institution_code/timeout/verify_ssl/callback credentials/token TTL/reconcile schedule/VA categories)
- Client/Token: `app/Services/BankKaltim/BankKaltimClient.php:1-250`, `app/Services/BankKaltim/BankKaltimTokenManager.php:1-150`
- VA Service: `app/Services/BankKaltim/BankKaltimVaService.php:1-850` (create/inquiry/reset/delete/status/check, konsolidasi tunggakan, guard gratis/nol, throttle status check)
- Gateway adapter: `app/Services/Payment/Gateways/BankKaltimVaGateway.php:1-200`
- Callback API: `app/Http/Controllers/Api/V1/BankKaltimCallbackController.php:1-140` (POST `/client/api/token` dengan validasi username/password atau hash, issue Bearer token TTL, POST `/client/api/callback` via `BankKaltimSettlementService`)
- Routes: `routes/web.php:1035-1041` (`client/api/token` throttle `bankkaltim-token`, `client/api/callback` middleware `BankCallbackTokenAuth` + throttle `bankkaltim-callback`)
- Rate limits: `app/Providers/AppServiceProvider.php:333-380` (token 10/min JSON 429, callback 60/min JSON 429)
- Middleware: `app/Http/Middleware/AllowSuperadminDuringMaintenance.php:1-30` mencatat callback bank dikecualikan maintenance
- Scheduler: `routes/console.php:32-59` (reconcile daily/monthly bila enabled)
- Models/Migrations: `database/migrations/2026_10_07_000001_bankkaltim_va_charge_columns_and_logs.php:1-80`, `database/migrations/2026_10_28_164004_create_bank_va_paid_reports_table.php:1-50`, `app/Models/BankVaPaidReport.php:1-60`

### Bankaltimtara (SNAP stub)
- Controller: `app/Http/Controllers/Dashboard/BankaltimtaraController.php:1-250` (toggleGateway aktif, notification() stub dengan IP allowlist + signature helper, getStatus() 501)
- Routes: `routes/web.php:1020-1023` (`bankaltimtara/notification` GET/POST, tanpa auth, tanpa throttle khusus teridentifikasi)
- Konfigurasi: `config/bankaltimtara.php` ada (tidak dibaca penuh dalam ringkasan ini)
- Status: driver null, menunggu spec ISA (Gate C)

---

## Temuan (dengan ID, severity, bukti)

| ID | Judul | Area | Status bukti | Severity | Dampak | Bukti (file:line) | Rekomendasi | Kriteria penerimaan |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **PS-AUD-PAY-001** | Verifikasi signature Midtrans menggunakan SHA512 order_id+status_code+gross_amount+server_key | Pembayaran/Midtrans | **TERVERIFIKASI** | Medium | Risiko jika perhitungan/signature beda; saat ini sesuai pola umum Midtrans. Perlu pastikan konsistensi dengan dokumentasi resmi. | `app/Services/MidtransService.php:378-410` (`verifySignatureFromCallback`) | Verifikasi terhadap dokumentasi Midtrans versi saat ini (format string/signature). Tambahkan test unit untuk signature valid/invalid. | Unit test coverage untuk `verifySignatureFromCallback` lulus; dokumentasi internal mencatat rumus. |
| **PS-AUD-PAY-002** | Idempotensi webhook Midtrans kuat (lock per charge + deteksi duplikasi transaction_id + guard downgrade payment completed) | Pembayaran/Midtrans/Webhook | **TERVERIFIKASI** | High | Mencegah double-settlement dan menurunkan status pembayaran yang sudah lunas. | `app/Services/MidtransService.php:221-330` (lock `mt-settle-{id}`, duplikasi `transaction_id` sukses lain, guard `paymentAlreadyCompleted && isDowngrade`) | Pertahankan. Pastikan log tidak membocorkan data sensitif (sudah ada redaksi). Tambahkan metric/alert untuk downgrade attempts. | Guard tercover test; alert dikonfigurasi untuk event downgrade. |
| **PS-AUD-PAY-003** | Test notification Midtrans diakui tanpa proses | Pembayaran/Midtrans/Webhook | **TERVERIFIKASI** | Low | Aman untuk validasi URL dashboard Midtrans. | `app/Services/MidtransService.php:190-210`, `app/Http/Controllers/Dashboard/MidtransController.php:90-97` | Tetap akui hanya untuk prefix `payment_notif_test_` / pola test. Jangan ubah menjadi auto-settle. | Hanya pola test yang diakui, ada log warning jika tanpa signature. |
| **PS-AUD-PAY-004** | Reconciliation command hanya untuk Midtrans (tidak mencakup Bank Kaltim) | Rekonsiliasi | **TERVERIFIKASI** | Medium | Bank Kaltim punya mekanisme reconcile terpisah (scheduler + API). Pastikan cakupan jelas. | `app/Console/Commands/ReconcilePendingPayments.php:45-60` | Dokumentasikan cakupan: Midtrans via command ini, Bank Kaltim via `bankkaltim:reconcile-*`. Pastikan tidak ada duplikasi settle. | Dokumentasi runbook jelas; tidak ada double-processing. |
| **PS-AUD-H2H-001** | Bank Kaltim callback dengan token auth + rate limiting + logging terpisah | H2H/Bank Kaltim/Webhook | **TERVERIFIKASI** | High | Mekanisme auth/token dan throttle ada. Fail-closed pada kredensial tidak dikonfigurasi. | `app/Http/Controllers/Api/V1/BankKaltimCallbackController.php:35-140`, `routes/web.php:1035-1041`, `app/Providers/AppServiceProvider.php:333-380` | Pastikan kredensial produksi tidak plain jika bisa di-hash; rotasi token; pantau log `bankkaltim_callback`. | Kredensial menggunakan hash bila memungkinkan; alert pada auth failed berulang. |
| **PS-AUD-H2H-002** | Bank Kaltim VA lifecycle lengkap (create/reset/delete/status) + guard gratis/nol | H2H/Bank Kaltim | **TERVERIFIKASI** | High | Menghindari delete VA untuk tagihan gratis/nol; konsolidasi tunggakan. | `app/Services/BankKaltim/BankKaltimVaService.php:51-650` | Pastikan perilaku "retain" terdokumentasi dan teruji. Audit penghapusan charge. | Aturan gratis/nol terdokumentasi di runbook; tidak ada kasus delete tidak sengaja. |
| **PS-AUD-H2H-003** | Bankaltimtara SNAP masih stub (notification unprocessed, getStatus 501) | H2H/Bankaltimtara | **TERVERIFIKASI** | High | Berpotensi salah klaim aktif. Saat ini tidak memproses pembayaran. | `app/Http/Controllers/Dashboard/BankaltimtaraController.php:99-250`, `routes/web.php:1020-1023` | Jangan mengaktifkan tanpa spec ISA resmi + signature final + UAT. Tambahkan flag "disabled" jelas di UI. | Tidak ada path produksi yang bergantung; dokumentasi status "menunggu spec". |
| **PS-AUD-H2H-004** | Kurangnya bukti persetujuan bank/sertifikat/mTLS/UAT di repo | H2H/Kompliance | **TERINDIKASI** | Critical | Integrasi H2H tanpa bukti persetujuan bisa berisiko compliance/produksi. Tidak ditemukan di kode. | Repo scan: tidak ditemukan file `*.pem`, `*.crt`, `*.key` (di luar node_modules), tidak ada dokumen persetujuan/UAT eksplisit | Dapatkan dan arsipkan persetujuan bank, spesifikasi VASPEC/ISA, daftar IP allowlist, sertifikat (jika mTLS), hasil UAT, sign-off produksi. Simpan di `evidence/` tersanitasi. | Bukti persetujuan tersimpan dengan metadata (tanggal/penandatangan). |

---

## 8 Temuan Teratas (ringkas)

| Peringkat | ID | Severity | Judul |
| :-- | :-- | :-- | :-- |
| 1 | **PS-AUD-H2H-004** | Critical | Kurangnya bukti persetujuan bank/sertifikat/mTLS/UAT di repo |
| 2 | **PS-AUD-PAY-002** | High | Idempotensi webhook Midtrans kuat (lock + duplikasi + guard downgrade) |
| 3 | **PS-AUD-H2H-001** | High | Bank Kaltim callback dengan token auth + rate limiting + logging terpisah |
| 4 | **PS-AUD-H2H-002** | High | Bank Kaltim VA lifecycle lengkap + guard gratis/nol |
| 5 | **PS-AUD-H2H-003** | High | Bankaltimtara SNAP masih stub (belum siap produksi) |
| 6 | **PS-AUD-PAY-001** | Medium | Verifikasi signature Midtrans SHA512 (perlu verifikasi terhadap dokumen resmi) |
| 7 | **PS-AUD-PAY-004** | Medium | Cakupan reconciliation terpisah (Midtrans vs Bank Kaltim) perlu didokumentasikan |
| 8 | **PS-AUD-PAY-003** | Low | Test notification Midtrans diakui aman |

---

## Catatan Keamanan & Redaksi
- Semua secret dikonfigurasi via env/system config (`MIDTRANS_*`, `BANKKALTIM_*`) — tidak ditemukan hardcode di file yang dibaca. 
- Redaksi diterapkan: tidak mencantumkan nilai secret/nomor rekening lengkap. 
- Log untuk callback/token mencatat metadata (IP, panjang field) tanpa membocorkan kredensial penuh.

## Keterbatasan
- Tidak ada akses kredensial/akun uji/sandbox live — audit statis.
- Tidak ditemukan bukti persetujuan bank, sertifikat, UAT, atau dokumen ISA Bankaltimtara di repo.
- Tidak menjalankan `php artisan`, tidak membuat transaksi, tidak memanggil endpoint.

## BLOCKED
**STATUS: BLOCKED (parsial)**  
- **Dibutuhkan:** Spesifikasi VASPEC Bank Kaltim, dokumen persetujuan/integrasi bank, daftar IP allowlist, sertifikat (jika ada mTLS), hasil UAT, sign-off produksi, serta bukti registrasi webhook Midtrans (URL terdaftar) untuk verifikasi end-to-end.  
- **Alasan:** Bukti kontraktual/operasional tidak tersedia di kodebase; tanpa ini tidak bisa menyimpulkan "aktif/produksi" dengan yakin.
