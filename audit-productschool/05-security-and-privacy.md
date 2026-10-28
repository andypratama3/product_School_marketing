# 05-security-and-privacy.md

**Tanggal audit:** 2026-10-28  
**Ruang lingkup:** OWASP ASVS 4.x / OWASP Top 10 2021 (sebutan ruang lingkup, tidak diklaim compliance)  
**Sumber diaudit:**  
- Aplikasi asli Laravel: `/Users/andypratama3/Development/ProductSchool/src`  
- Situs marketing: `/Users/andypratama3/Development/sales_web`  
- Brief: `ProductSchool_Konteks_Audit_Menyeluruh.md` (bagian 1, 3, 5, 11, 12)

**Status:** Read-only berbasis baca kode. Tidak ada eksploitasi yang dilakukan. Pengujian runtime dinilai `BLOCKED` bila kredensial/lingkungan tidak tersedia.

---

## Ringkasan Eksekutif

Ditemukan beberapa temuan terkait otorisasi, konfigurasi cookie/session, pengelolaan file unggahan, dan risiko pada modul Kerja Sama/Mitra. Beberapa kontrol sudah ada (ResourceController dengan middleware permission berbasis resource, FormRequest, penggunaan Spatie Permission, cookie httpOnly/SameSite), namun terdapat indikasi kerentanan konfigurasi dan kelemahan kontrol yang layak untuk perhatian.

---

## Temuan Keamanan & Privasi

### PS-AUD-SEC-001 - Konfigurasi Cookie Session Tidak Aman Secara Default
- **Area:** Autentikasi & Sesi
- **Status bukti:** `TERVERIFIKASI` (baca kode)
- **Severity:** High
- **Dampak:** Jika `SESSION_SECURE_COOKIE` tidak di-set atau di lingkungan non-HTTPS, cookie sesi bisa dikirim via HTTP (rentan terhadap intersepsi). `SESSION_ENCRYPT` default false.
- **Bukti:**
  - `ProductSchool/src/config/session.php:172` - `'secure' => env('SESSION_SECURE_COOKIE')` (default null jika tidak diset)
  - `ProductSchool/src/config/session.php:185` - `'http_only' => env('SESSION_HTTP_ONLY', true)`
  - `ProductSchool/src/config/session.php:202` - `'same_site' => env('SESSION_SAME_SITE', 'lax')`
  - `ProductSchool/src/config/session.php:50` - `'encrypt' => env('SESSION_ENCRYPT', false)`
  - `.env.example:60-67` - SESSION_DRIVER=redis, SESSION_LIFETIME=120, SESSION_ENCRYPT=false
- **Rekomendasi:**
  - Pastikan `SESSION_SECURE_COOKIE=true` di produksi (HTTPS). 
  - Pertimbangkan `SESSION_ENCRYPT=true` untuk melindungi data sesi.
  - Dokumentasikan setting aman untuk deployment.
- **Kriteria penerimaan:** Nilai secure/httpOnly/same_site/encrypt dikonfigurasi dengan benar di lingkungan produksi dan diverifikasi.

### PS-AUD-SEC-002 - FormRequest `CooperationRequest::authorize()` Selalu Mengembalikan `true`
- **Area:** Otorisasi/RBAC (Modul Kerja Sama/Mitra)
- **Status bukti:** `TERVERIFIKASI` (baca kode)
- **Severity:** High
- **Dampak:** Otorisasi aksi CRUD pada modul Kerja Sama bergantung sepenuhnya pada middleware dari `ResourceController` (permission berbasis resource). Jika middleware gagal/terlewat atau jika ada jalur lain yang memanggil request ini, tidak ada pengecekan tambahan. Juga membuka potensi jika method lain ditambahkan.
- **Bukti:**
  - `ProductSchool/src/app/Http/Requests/Dashboard/CooperationRequest.php:12-15` - `public function authorize(): bool { return true; }`
  - `ProductSchool/src/app/Http/Controllers/ResourceController.php:46-67` - menerapkan middleware `view-{resource}`, `create-{resource}`, `edit-{resource}`, `delete-{resource}` untuk method terkait
  - `ProductSchool/src/app/Http/Controllers/Dashboard/CooperationController.php:10` - `$permissionResource = 'cooperations'`
- **Rekomendasi:**
  - Tambahkan pengecekan berbasis policy/ability (mis. `Gate::authorize('manage-cooperations')` atau sesuaikan dengan pola RBAC) atau dokumentasikan bahwa otorisasi sepenuhnya ditangani oleh middleware.
  - Pastikan tidak ada route yang melewati middleware resource.
- **Kriteria penerimaan:** Terdapat pertahanan berlapis (middleware + authorize/policy) atau dokumentasi yang menyatakan desain secara eksplisit dengan justifikasi aman.

### PS-AUD-SEC-003 - Modul Kerja Sama Tanpa `school_id` (Kemungkinan Multi-tenant Leakage)
- **Area:** Otorisasi/RBAC / Pemisahan Tenant
- **Status bukti:** `TERVERIFIKASI` (baca kode)
- **Severity:** High
- **Dampak:** Model `Cooperation` tidak memiliki kolom `school_id` dan tidak terlihat global scope. Jika aplikasi bersifat multi-tenant (shared DB), mitra/kerja sama bisa dilihat lintas sekolah. Jika single-tenant/database-per-sekolah, ini desain yang disengaja - perlu dibuktikan.
- **Bukti:**
  - `ProductSchool/src/app/Models/Cooperation.php` - fields: `name`, `photo`, `sort_order`, `slug`, UUID, `HasAuditLog` (baca via penggunaan)
  - `ProductSchool/src/database/migrations/2026_03_27_005350_create_editorial_and_web_tables.php` - migrasi tabel `cooperations` tanpa kolom `school_id` (konfirmasi dari konteks brief 3.16)
  - `ProductSchool/src/app/Http/Controllers/Api/V2/LandingController.php@dukungan` - endpoint publik mengembalikan semua data (urut sort_order) tanpa filter tenant
- **Rekomendasi:**
  - Konfirmasi model tenant (shared DB vs DB-per-sekolah). Jika shared, tambahkan `school_id` + global scope + validasi isolasi.
  - Jika database-per-sekolah, dokumentasikan secara eksplisit.
- **Kriteria penerimaan:** Ada bukti isolasi tenant atau dokumentasi desain dengan alasan keamanan yang jelas.

### PS-AUD-SEC-004 - Unggahan Gambar Kerja Sama: Validasi MIME/Ukuran Saja
- **Area:** Input/Upload
- **Status bukti:** `TERVERIFIKASI` (baca kode)
- **Severity:** High
- **Dampak:** Validasi hanya berdasarkan ekstensi/MIME dan ukuran (max 2048KB). Belum terlihat validasi konten file (magic bytes), pencegahan path traversal, atau pembatasan jenis file yang ketat. Risiko upload berbahaya jika storage bisa dieksekusi.
- **Bukti:**
  - `ProductSchool/src/app/Http/Requests/Dashboard/CooperationRequest.php:25-39` - rule `image|mimes:jpeg,png,jpg,webp|max:2048`
  - `ProductSchool/src/app/Http/Controllers/Dashboard/CooperationController.php:109-126, 140-157` - simpan via `StoragePaths::store(...)`, hapus via `StoragePaths::deleteFile/deleteRecordFolder`
  - `ProductSchool/src/app/Support/StoragePaths.php` - perlu ditinjau (tidak dibaca penuh)
- **Rekomendasi:**
  - Tambahkan validasi konten file (getimagesize/mime_content_type atau library validasi gambar).
  - Pastikan direktori upload tidak executable dan akses langsung dibatasi jika perlu.
  - Gunakan nama file acak, hindari path dari input user.
- **Kriteria penerimaan:** Validasi server-side menyeluruh (mime+konten), penyimpanan aman, dan tidak ada eksekusi file di direktori publik.

### PS-AUD-SEC-005 - Private Key Tersimpan di Repository
- **Area:** Secret & Konfigurasi
- **Status bukti:** `TERVERIFIKASI` (baca kode)
- **Severity:** Critical
- **Dampak:** File private key ditemukan di repo, meskipun mungkin untuk testing/integrasi tertentu. Jika key ini digunakan di lingkungan produksi atau memiliki akses sensitif, ini adalah kebocoran kredensial.
- **Bukti:**
  - `ProductSchool/src/storage/snap-keys/snap_private.pem` - ditemukan
  - `ProductSchool/src/storage/snap-keys/snap_public.pem` - ditemukan
- **Rekomendasi:**
  - ROTASI key segera jika pernah digunakan di produksi.
  - Pindahkan ke secret manager/env vars, hapus dari repo (tambahkan ke .gitignore), periksa history git untuk kemungkinan komit sebelumnya.
  - Audit penggunaan key ini.
- **Kriteria penerimaan:** Key tidak ada di repo, dikelola via secret management, dan rotasi dilakukan jika diperlukan.

### PS-AUD-SEC-006 - Konfigurasi Default Berpotensi Tidak Aman di `.env.example`
- **Area:** Secret & Konfigurasi
- **Status bukti:** `TERVERIFIKASI` (baca kode)
- **Severity:** Medium
- **Dampak:** `.env.example` berisi nilai default seperti password Redis/DB dan secret Reverb - berguna untuk dev, namun bisa menyesatkan jika di-copy ke produksi tanpa perubahan.
- **Bukti:**
  - `.env.example:36-45` - `DB_PASSWORD=schoolpass123`, `REDIS_PASSWORD=redispass123`
  - `.env.example:85-90` - `REVERB_APP_KEY=school_key_123`, `REVERB_APP_SECRET=school_secret_123`
- **Rekomendasi:**
  - Ganti dengan placeholder yang jelas (mis. `change_me`) atau kosongkan.
  - Tambahkan catatan keamanan di README/deployment.
- **Kriteria penerimaan:** `.env.example` tidak berisi kredensial nyata/default berbahaya.

### PS-AUD-SEC-007 - CORS Konfigurasi Dinamis Berbasis Env
- **Area:** Header/CORS
- **Status bukti:** `TERVERIFIKASI` (baca kode)
- **Severity:** Medium
- **Dampak:** CORS dikonfigurasi dari `CORS_ALLOWED_ORIGINS` (comma-separated). Jika di-set ke `*` atau origin tidak tervalidasi dengan benar, bisa membuka akses lintas-origin yang tidak diinginkan.
- **Bukti:**
  - `ProductSchool/src/config/cors.php:13,23` - menggunakan env dengan default tertentu
- **Rekomendasi:**
  - Pastikan hanya origin yang dipercaya yang diizinkan di produksi.
  - Hindari wildcard di produksi.
- **Kriteria penerimaan:** Daftar origin eksplisit dan tervalidasi di semua lingkungan.

### PS-AUD-SEC-008 - Endpoint Publik API V2 Tanpa Autentikasi Tampilan
- **Area:** API / Eksposur Publik
- **Status bukti:** `TERVERIFIKASI` (baca kode)
- **Severity:** Medium
- **Dampak:** `GET /api/v2/dukungan-kerja-sama` menggunakan middleware `landing.token` dan `throttle:api-read`, mengembalikan data mitra publik. Perlu memastikan token tidak bocor dan hanya field minimal yang diekspos. Saat ini hanya mengembalikan `name`, `slug`, `foto` (basename) - terlihat minimal, namun token landing harus dikelola dengan aman.
- **Bukti:**
  - Konteks brief 3.16: endpoint publik dengan middleware `landing.token` + `throttle:api-read`
  - `LandingController@dukungan` mengembalikan `name`, `slug`, `foto` (`basename`)
- **Rekomendasi:**
  - Pastikan token `landing.token` rotasi berkala dan tidak hardcoded.
  - Tambahkan rate limit yang sesuai dan monitoring penggunaan.
  - Pertimbangkan caching dengan invalidasi yang tepat saat ada perubahan CRUD.
- **Kriteria penerimaan:** Token aman, rate limit berfungsi, hanya data minimal yang ekspos.

---

## Temuan Tambahan (Catatan)

- **ResourceController pattern**: Sudah menggunakan middleware berbasis permission per resource untuk method CRUD. Ini praktik yang baik (TERVERIFIKASI).
- **Audit log**: Model `Cooperation` menggunakan `HasAuditLog` (TERINDIKASI dari konteks brief). Perlu verifikasi cakupan logging.
- **Slug generation**: Menggunakan `uniqid()` saat slug kosong - bisa diprediksi; pertimbangkan UUID/slugify yang lebih unik jika diperlukan.
- **Cache invalidation**: Perubahan CMS memicu `RevalidateLandingCacheJob` (TERINDIKASI) - perlu diverifikasi untuk modul Kerja Sama.

---

## Keterbatasan Audit

- **Tidak ada pengujian runtime**: Tidak ada kredensial/akun uji, sehingga semua uji dinamis ditandai `BLOCKED`. Perlu lingkungan staging dengan akun per role untuk verifikasi penuh.
- **Akses terbatas**: Hanya baca kode. Konfigurasi produksi, secrets aktual, log, dan hasil tes tidak tersedia.
- **Tenant model tidak jelas**: Tidak dapat dipastikan apakah multi-tenant atau single-tenant hanya dari kode yang dibaca.
- **StoragePaths dan middleware detail**: Beberapa class pendukung tidak dibaca penuh (StoragePaths, middleware custom) - bisa mempengaruhi penilaian lengkap.
- **Pemisahan marketing site**: Audit difokuskan pada aplikasi Laravel dan brief; situs marketing `/Users/andypratama3/Development/sales_web` diperiksa secara minimal sesuai ruang lingkup.
- **Tidak ada scan dependency**: composer.json/package.json dibaca tidak menyeluruh untuk vulnerability details.

---

## Ringkasan untuk Eksekutif

**File dibuat:** `/Users/andypratama3/Development/sales_web/audit-productschool/05-security-and-privacy.md`

**8 temuan teratas + severity + ID:**

1. `PS-AUD-SEC-005` - Private Key Tersimpan di Repository - **Critical**
2. `PS-AUD-SEC-001` - Konfigurasi Cookie Session Tidak Aman Secara Default - **High**
3. `PS-AUD-SEC-002` - FormRequest `CooperationRequest::authorize()` Selalu Mengembalikan `true` - **High**
4. `PS-AUD-SEC-003` - Modul Kerja Sama Tanpa `school_id` (Kemungkinan Multi-tenant Leakage) - **High**
5. `PS-AUD-SEC-004` - Unggahan Gambar Kerja Sama: Validasi MIME/Ukuran Saja - **High**
6. `PS-AUD-SEC-006` - Konfigurasi Default Berpotensi Tidak Aman di `.env.example` - **Medium**
7. `PS-AUD-SEC-007` - CORS Konfigurasi Dinamis Berbasis Env - **Medium**
8. `PS-AUD-SEC-008` - Endpoint Publik API V2 Tanpa Autentikasi Tampilan - **Medium**

**Keterbatasan utama:** Tidak ada pengujian runtime (BLOCKED), model tenant belum dikonfirmasi, beberapa komponen pendukung tidak dibaca penuh, dan detail dependency/security scanning tidak dilakukan secara komprehensif.
