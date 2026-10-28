# 12 - Remediation Roadmap

**Tanggal laporan:** 2026-10-28  
**Basis:** `_AUDIT-RULES.md`, `ProductSchool_Konteks_Audit_Menyeluruh.md`, dan seluruh file audit `02`-`10` di folder ini.  
**Catatan:** roadmap disusun dari `01`-`11`, aturan audit, dan brief.  
**Sifat:** rencana perbaikan berbasis bukti. Tidak ada tanggal absolut, angka, atau status yang dikarang. Target waktu memakai hari relatif terhadap mulai remediasi (Hari 0).

---

## 1. Cara membaca roadmap

- **Fakta** = sudah dibaca/diuji dan dicatat di file audit.
- **Klaim** = pernyataan pemasaran/dokumen yang belum tentu benar.
- **Asumsi** = interpretasi yang dipakai untuk menyusun prioritas dan harus diverifikasi.
- **BLOCKED** = tidak dapat diselesaikan tanpa bukti/akses yang disebutkan.
- Priority mengikuti brief bagian 12: **P0 Kritis, P1 Tinggi, P2 Sedang, P3 Rendah**.
- Severity pada register dipertahankan dari temuan sumber; priority adalah sintesis berdasarkan bukti, dampak, dan ketergantungan.

---

## 2. Fakta terverifikasi yang mengikat roadmap

| Fakta | Status | Bukti | Implikasi roadmap |
|---|---|---|---|
| `privkey.pem` di root repo aplikasi **tracked git** | TERVERIFIKASI | `git ls-files --error-unmatch privkey.pem`; `git log --all -- privkey.pem` menunjukkan riwayat | P0; rotasi + purge history + secret scanning |
| Private key TLS juga tracked di `docker/ssl/live/.../privkey.pem` dan `docker/ssl/archive/.../privkey1.pem`, `privkey2.pem` | TERVERIFIKASI | `git ls-tree -r HEAD` | Masuk lingkup rotasi yang sama |
| `src/storage/snap-keys/snap_private.pem` **ada di disk**, tetapi **untracked/ignored** | TERVERIFIKASI | `git check-ignore -v`; `src/.gitignore:67` | Tetap diperlakukan sebagai secret; rotasi jika pernah dipakai; jangan dikirim ke mana pun |
| 75 fitur dan 14 kategori | TERVERIFIKASI | `data/features.ts` (75 `id`), `data/categories.ts` | Jangan ubah angka ini saat koreksi klaim |
| Flows = 72 objek; README situs masih menulis 9 | TERVERIFIKASI | `data/flows.ts`; README stale | Koreksi copy, bukan ubah data |
| API = 188 deklarasi endpoint / 207 baris `Route::`; klaim 226 TIDAK TERBUKTI | TERVERIFIKASI | `routes/api.php` | Definisikan metode hitung sebelum publikasi |
| Permission = 233 token unik seeder / 272 dokumen; klaim 380 TIDAK TERBUKTI | TERVERIFIKASI | `database/seeders/RoleSeeder.php`; `PRODUCTSCHOOL_DOKUMENTASI.md` | Hentikan klaim 380 sampai ada definisi dan bukti |
| Typecheck `sales_web` gagal karena `tsc` tidak ditemukan = **BLOCKED**, bukan kegagalan tipe kode | TERVERIFIKASI | `npm run typecheck` | Selesaikan tooling/CI, jangan menyimpulkan kode gagal |
| Bank Kaltim classic VA: implementasi + test tersedia (TERINDIKASI); Bankaltimtara SNAP masih stub; tidak ada bukti persetujuan bank/UAT/produksi | TERINDIKASI | `07-payment-and-h2h-audit.md`; `PS-AUD-H2H-003/004` | P0 untuk klaim produksi; P1 untuk stub |

---

## 3. Ringkasan register

**Total risiko:** 30  
**P0:** 2 | **P1:** 6 | **P2:** 15 | **P3:** 7

### 10 risiko teratas (berdasarkan priority, severity, dan dampak)

| Peringkat | RISK ID | Severity | Priority | Judul singkat |
|---:|---|---|---|---|
| 1 | RISK-001 | Critical | P0 | Private key tracked di git |
| 2 | RISK-002 | Critical | P0 | Kesiapan produksi H2H tanpa bukti bank/UAT/ISA |
| 3 | RISK-003 | Critical | P1 | RBAC deny-by-default belum terbukti; klaim permission tidak konsisten |
| 4 | RISK-004 | High | P1 | Isolasi tenant modul Kerja Sama belum terbukti |
| 5 | RISK-005 | High | P1 | Otorisasi Kerja Sama satu lapis; `authorize()` selalu true |
| 6 | RISK-006 | High | P1 | Bankaltimtara SNAP stub berisiko diklaim aktif |
| 7 | RISK-007 | Critical | P1 | Backup/restore/DR/SLA tidak tersedia (BLOCKED) |
| 8 | RISK-008 | High | P1 | Uji end-to-end semua alur kritis BLOCKED |
| 9 | RISK-009 | High | P2 | Kredensial/rotasi/alert callback Bank Kaltim belum terbukti |
| 10 | RISK-013 | High | P2 | Race condition absensi/pembayaran/tagihan belum diverifikasi |

**Berikutnya:** RISK-010 (queue/idempotensi), RISK-011 (alerting/monitoring), RISK-014 (cookie sesi), RISK-015 (upload), RISK-012 (rekonsiliasi pembayaran).

---

## 4. Prinsip prioritas dan definisi selesai

1. **P0 tidak menunggu fase.** Key tracking dan klaim H2H produksi harus ditangani pada Hari 0-7.
2. **P1 harus selesai atau turun status dengan bukti pada Hari 0-30.** Jika BLOCKED, catat bukti yang dibutuhkan dan jangan menaikkan klaim.
3. **P2 pada Hari 30-60**; **P3 pada Hari 60-90**.
4. **Definisi selesai:** bukti tersimpan di `audit-productschool/evidence/` (screenshot/log/artefak tersanitasi), acceptance criteria terpenuhi, dan tidak ada regresi pada kontrol yang sudah terverifikasi.
5. **Larangan:** jangan melakukan tes yang mengubah data produksi, transaksi uang riil, kirim pesan nyata, atau eksploitasi. Gunakan staging/sandbox dan data sintetis.

---

## 5. Fase 0 - Hari 0-30

### 5.1 Sprint 0A - Hari 0-7 (P0 dan quick win)

| Urutan | RISK | Aksi | Dependency | Acceptance | Verifikasi |
|---:|---|---|---|---|---|
| 1 | RISK-001 | Inventory semua private key yang pernah tracked; rotasi; hapus dari working tree; purge history setelah koordinasi; pindahkan ke secret manager | Daftar pemilik key, deployment window, akses git history, secret manager | Key lama revoked; history bersih; secret scanning CI aktif; tidak ada key di artefak build | `git ls-files` tidak memuat key; `git log --all -- <path>` bersih; scanner CI gagal pada key baru |
| 2 | RISK-002 | **Freeze klaim H2H produksi**; ubah status UI/dokumen menjadi sandbox/UAT/menunggu bukti; kumpulkan dokumen bank | Kontak bank, dokumen ISA/VASPEC, UAT, sign-off, sertifikat/IP allowlist | Tidak ada klaim aktif/real-time/multi-bank; checklist bukti bank terisi; status per bank jelas | Review copy situs + UI; checklist dokumen di `evidence/` |
| 3 | RISK-006 | Nonaktifkan Bankaltimtara SNAP secara default; label "menunggu ISA"; pastikan route tidak memproses pembayaran | Keputusan product + konfirmasi tidak ada dependency produksi | Flag default disabled; route menolak dengan jelas; dokumentasi status | Test route di staging; review config; cek UI |
| 4 | RISK-018 | Ganti kredensial default `.env.example` dengan placeholder; tambahkan catatan deployment | Tidak ada | Tidak ada kredensial default; dokumentasi deployment | Review file + secret scan |
| 5 | RISK-025 | Jalankan `npm ci`; pastikan `typescript` tersedia; tambahkan typecheck ke CI | Akses dependency/CI | `npm run typecheck` lulus; log CI tersedia | `npm ci && npm run typecheck`; simpan log |
| 6 | RISK-019 | Koreksi README flows 9 -> 72; tandai angka 226/380 sebagai belum terbukti; siapkan metode hitung | Data 75/14/72 dan hitungan API/permission | README konsisten; tidak ada klaim 226/380 tanpa definisi | Review copy; recount dengan metode tertulis |
| 7 | RISK-014 | Verifikasi cookie sesi di konfigurasi produksi; set `SESSION_SECURE_COOKIE=true` dan pertimbangkan `SESSION_ENCRYPT=true` | Akses config/deployment | Cookie Secure/HttpOnly/SameSite benar | Inspeksi header cookie di staging/produksi terkontrol |

### 5.2 Sprint 0B - Hari 7-30 (P1)

| RISK | Aksi utama | Dependency | Acceptance | Verifikasi |
|---|---|---|---|---|
| RISK-003 | Bangun matriks role x route; uji deny-by-default; audit route tanpa middleware; rekonsiliasi angka permission | Akun uji per role, staging, data sintetis | Minimal 10 endpoint sensitif menolak role tanpa izin; tidak ada route dashboard tanpa middleware; angka permission terdokumentasi | Negative test per role; log request/response tersanitasi; review route |
| RISK-004 | Putuskan model tenancy (shared DB vs DB-per-sekolah); jika shared, tambah `school_id` + global scope + tes isolasi | Architecture decision record, topologi DB | Tes isolasi lintas sekolah lulus atau bukti DB-per-sekolah | Test dua tenant sintetis; review migration/scope |
| RISK-005 | Tambah policy/Gate ability; pastikan semua aksi CRUD dilindungi; uji akses negatif | RISK-003 staging | Role tanpa izin ditolak di semua aksi; policy test ada | Feature test + manual negative test |
| RISK-007 | Susun backup/restore/DR/RPO/RTO/SLA; jadwalkan restore drill | Akses infra, konfigurasi backup, persetujuan RPO/RTO | Dokumen + bukti restore + RPO/RTO + laporan uptime | Restore ke environment terisolasi; simpan log |
| RISK-008 | Sediakan staging + akun per role + data sintetis; jalankan TC kritis | Infrastruktur staging, persetujuan data | TC kritis dieksekusi atau tetap BLOCKED dengan alasan; hasil tercatat | Test case 03; artefak tersanitasi |
| RISK-019 | Perbarui situs marketing dengan angka yang terbukti | Keputusan product/marketing | Situs/README konsisten; 75/14 dipertahankan; 72 flow; API/permission memakai definisi | Review copy + recount |
| RISK-030 | Audit token/consent/rate limit/retensi WhatsApp, Instagram, AI | Akses konfigurasi tersanitasi, dokumen consent/DPA | Checklist kontrol per integrasi; tidak ada PII ke pihak ketiga tanpa dasar | Review config + sample log tersanitasi |

**Exit Fase 0:** P0 ditutup atau diturunkan dengan bukti; P1 selesai atau BLOCKED dengan daftar bukti; staging dan akun uji tersedia; tidak ada klaim H2H produksi.

---

## 6. Fase 1 - Hari 30-60 (P2)

| Kelompok | RISK | Aksi | Acceptance | Verifikasi |
|---|---|---|---|---|
| Pembayaran & H2H | RISK-009 | Hash kredensial callback, rotasi token, alert auth failure, runbook | Kredensial tidak plaintext; rotasi; alert; log tersanitasi | Review config; simulasi auth failure di staging |
| Pembayaran & H2H | RISK-012 | Dokumentasikan rekonsiliasi Midtrans vs Bank Kaltim; alert downgrade; unit test signature | Test signature lulus; alert aktif; runbook ada; tidak ada double settle | Unit test; simulasi duplikasi; review runbook |
| Reliability | RISK-010 | Inventory job kritis, idempotency key, dead-letter, alert `failed_jobs`, cleanup | Daftar job + idempotensi + alert + tes retry | Test retry/duplikasi; monitoring |
| Reliability | RISK-011 | Alert rules queue/error/disk/memori; liveness/readiness; runbook on-call | Alert aktif; probes; simulasi alert | Simulasi alert; review dashboard |
| Concurrency | RISK-013 | Audit `DB::transaction`, `lockForUpdate`, unique constraint, idempotency pada alur tulis | Bukti lock/transaction + tes duplikasi | Test duplikasi/retry; query review |
| Keamanan | RISK-015 | Validasi magic bytes, nama file acak, direktori non-executable, uji path traversal | File berbahaya ditolak; direktori aman | Upload test di staging |
| Keamanan | RISK-016 | Rotasi token landing, monitoring, field minimal, invalidasi cache | Token aman; rate limit; field minimal | Test endpoint + review cache |
| Keamanan | RISK-017 | Allowlist CORS eksplisit; tolak wildcard di produksi | Daftar origin eksplisit; preflight benar | Test preflight |
| Deployment | RISK-022 | `composer audit`, `npm audit`, coverage, runbook deploy/rollback, health check | Laporan audit + coverage + runbook | Jalankan audit; review CI; drill rollback |
| Brand | RISK-020 | PDKI kelas 9/36/42 + konsultan KI untuk NEXORA | Hasil resmi + opini + keputusan | Dokumen PDKI/konsultan |
| Brand | RISK-021 | PDKI/domain/app store/sosmed untuk ProductSchool, Sakola, dan pemisahan brand | Clearance + strategi brand | Dokumen resmi |
| Integrasi | RISK-030 | Lanjutkan audit WhatsApp/Instagram/AI | Checklist + bukti konfigurasi | Review tersanitasi |

**Exit Fase 1:** P2 utama selesai; rekonsiliasi dan alert pembayaran terbukti; audit dependency dan brand clearance terdokumentasi; tidak ada klaim yang melampaui bukti.

---

## 7. Fase 2 - Hari 60-90 (P2 lanjutan dan P3)

| RISK | Aksi | Acceptance | Verifikasi |
|---|---|---|---|
| RISK-021 | Selesaikan clearance brand dan keputusan arsitektur brand | Keputusan tertulis + bukti PDKI | Dokumen legal/brand |
| RISK-023 | Profiling listing kritis, eager loading, pagination, inventory indeks | Query plan + index inventory + target p95 | Read-only DB; `EXPLAIN`; review query |
| RISK-024 | Baseline Core Web Vitals, `next/image`, `next/font`, bundle budget | Baseline + budget + rekomendasi | Lighthouse/CWV; analisis bundle |
| RISK-026 | Skip link, label ikon, teks tersembunyi RailNav, uji keyboard | Tab pertama ke skip link; semua kontrol bernama | Uji keyboard + screen reader dasar |
| RISK-027 | Toast live region, komponen state reusable, fokus saat sukses/error | Status diumumkan; state konsisten | Uji screen reader; review komponen |
| RISK-028 | Audit semantik interaktif dan reduced motion | Checklist lulus | Review kode + uji keyboard |
| RISK-029 | Koreksi copy mitra, slug tidak prediktabel, alt text | Copy sesuai field; slug aman; alt text ada | Review konten + test slug |

**Exit Fase 2:** P3 selesai; residual risk P0/P1 diuji ulang; DR restore drill dan RBAC regression test terdokumentasi; register diperbarui.

---

## 8. Quick wins (dapat dimulai tanpa menunggu staging)

| Quick win | RISK | Estimasi | Verifikasi |
|---|---|---|---|
| Rotasi + purge key tracked; secret scanning CI | RISK-001 | 0-7 hari | `git ls-files`, `git log`, scanner |
| Freeze klaim H2H dan nonaktifkan SNAP default | RISK-002, RISK-006 | 0-3 hari | Review copy/UI/config |
| Placeholder `.env.example` | RISK-018 | < 1 hari | Review file |
| `npm ci` + typecheck CI | RISK-025 | < 1 hari | `npm run typecheck` |
| Koreksi README flows 9 -> 72 dan tandai 226/380 belum terbukti | RISK-019 | < 1 hari | Review copy |
| Tambah alert `failed_jobs` dan downgrade payment | RISK-010, RISK-012 | 1-3 hari | Simulasi alert |
| Verifikasi cookie flags produksi | RISK-014 | < 1 hari | Inspeksi header |
| Skip link + label ikon | RISK-026 | 1-2 hari | Uji keyboard |

---

## 9. Dependency map

```text
RISK-001 (key rotation)
  -> akses git history + secret manager + deployment window
  -> secret scanning CI
  -> audit penggunaan key

RISK-002 (H2H)
  -> dokumen bank/ISA/VASPEC + sertifikat/IP allowlist
  -> UAT + sign-off bank
  -> status produksi-terverifikasi
  -> RISK-006 (SNAP) tetap disabled sampai ISA final

RISK-003 (RBAC)
  -> staging + akun per role + data sintetis
  -> matriks role x route
  -> RISK-005 (policy Kerja Sama)
  -> RISK-004 (tes isolasi tenant)

RISK-007 (DR)
  -> akses infra + konfigurasi backup
  -> RPO/RTO disepakati
  -> restore drill

RISK-019 (klaim)
  -> metode hitung disepakati
  -> update README + situs

RISK-020/021 (brand)
  -> akses PDKI manual + konsultan KI
  -> keputusan nama/domain
```

---

## 10. Item BLOCKED dan bukti yang dibutuhkan

| Item | RISK terkait | Status | Bukti/akses yang dibutuhkan | Setelah tersedia |
|---|---|---|---|---|
| Uji fungsional end-to-end | RISK-008 | BLOCKED | Akun uji per role (superadmin, admin sekolah, guru, wali kelas, keuangan, PPDB, orang tua/siswa), staging terisolasi, data sintetis, akses read-only | Jalankan TC 03; catat pass/fail/blocked |
| H2H produksi | RISK-002, RISK-006, RISK-009 | BLOCKED | Dokumen persetujuan bank, ISA/VASPEC, sertifikat/mTLS, IP allowlist, hasil UAT, sign-off, kredensial sandbox | UAT dan verifikasi status per bank |
| Midtrans end-to-end | RISK-012 | BLOCKED | Kredensial sandbox, URL webhook terdaftar, riwayat transaksi, log webhook tersanitasi | Test notification + duplikasi + rekonsiliasi |
| Backup/restore/DR/SLA | RISK-007 | BLOCKED | Akses infra, konfigurasi backup, bukti restore, RPO/RTO, laporan uptime | Restore drill + dokumen DR |
| PDKI/merek | RISK-020, RISK-021 | BLOCKED | Akses manual PDKI, kelas 9/36/42, publikasi merek, konsultan KI | Clearance resmi + keputusan brand |
| CI/typecheck/dependency | RISK-022, RISK-025 | BLOCKED | Log CI, akses repo, `npm ci`, `tsc`, laporan `composer audit`/`npm audit` | Gate CI + laporan audit |
| Database read-only | RISK-013, RISK-023 | BLOCKED | Replica/read-only DB, query plan, inventory indeks | Profiling + uji race condition |
| Integrasi WA/IG/AI | RISK-030 | BELUM DIVERIFIKASI | Konfigurasi tersanitasi, bukti penyimpanan token, consent/opt-out, DPA jika ada | Checklist kontrol per integrasi |
| Tenancy | RISK-004 | BELUM DIVERIFIKASI | Architecture decision record, topologi DB, bukti isolasi | Tes isolasi atau dokumentasi DB-per-sekolah |

**Aturan BLOCKED:** jangan mengisi kekosongan dengan asumsi. Tandai tetap BLOCKED sampai bukti tersedia, dan jangan menaikkan status klaim produk.

---

## 11. Verification playbook

### 11.1 Secret dan repository

```bash
cd /Users/andypratama3/Development/ProductSchool
git ls-files --error-unmatch privkey.pem        # harus gagal setelah remediasi
git log --all --oneline -- privkey.pem          # tidak boleh memuat key aktif
git ls-tree -r --name-only HEAD | grep -Ei '(privkey|\.pem$|\.key$|\.crt$)'
```

Gunakan secret scanner yang disetujui tim (mis. gitleaks) dan simpan hasil tersanitasi. Jangan menampilkan isi key.

### 11.2 CSV register

```bash
cd /Users/andypratama3/Development/sales_web/audit-productschool
python3 - <<'PY'
import csv
rows=list(csv.reader(open('11-risk-register.csv', newline='', encoding='utf-8')))
assert len({len(r) for r in rows}) == 1, 'kolom tidak sama'
assert len({r[0] for r in rows[1:]}) == len(rows)-1, 'risk_id duplikat'
print('OK', len(rows)-1, 'risiko,', len(rows[0]), 'kolom')
PY
```

### 11.3 Typecheck dan dependency

```bash
cd /Users/andypratama3/Development/sales_web
npm ci
npm run typecheck
npm audit --omit=dev
```

Jika `tsc` masih tidak ditemukan, status tetap **BLOCKED**, bukan GAGAL kode.

### 11.4 RBAC dan fungsional

- Gunakan staging, bukan produksi.
- Uji positif dan negatif per role; simpan request/response tersanitasi.
- Untuk setiap endpoint sensitif, pastikan role tanpa permission mendapat 403/redirect yang benar.
- Jangan menembus auth atau mengakses data pengguna lain.

### 11.5 H2H dan pembayaran

- Hanya sandbox/mock yang sah; tidak ada transaksi uang riil.
- Verifikasi signature, duplikasi callback, retry, timeout, dan rekonsiliasi.
- Bank Kaltim: cocokkan dokumen VASPEC/ISA dengan implementasi; Bankaltimtara tetap disabled sampai ISA final.
- Simpan bukti UAT dan sign-off bank di `evidence/` tersanitasi.

### 11.6 DR dan performa

- Restore drill ke environment terisolasi; catat waktu restore dan integritas data.
- Profiling query memakai replica/read-only DB; tidak menjalankan load test di produksi.
- Catat periode pengukuran untuk SLA/uptime; jangan mengklaim angka tanpa periode.

### 11.7 Aksesibilitas dan brand

- Uji keyboard (Tab/Shift+Tab/Escape) dan screen reader dasar; simpan catatan, bukan PII.
- PDKI diperiksa manual; hasil websearch hanya indikasi, bukan clearance.

---

## 12. Traceability risiko -> fase

| Fase | RISK |
|---|---|
| Hari 0-7 | RISK-001, RISK-002, RISK-006, RISK-018, RISK-025, RISK-019 (README), RISK-014 |
| Hari 7-30 | RISK-003, RISK-004, RISK-005, RISK-007, RISK-008, RISK-019 (situs), RISK-030 |
| Hari 30-60 | RISK-009, RISK-010, RISK-011, RISK-012, RISK-013, RISK-015, RISK-016, RISK-017, RISK-020, RISK-021, RISK-022, RISK-030 |
| Hari 60-90 | RISK-021 (lanjutan), RISK-023, RISK-024, RISK-026, RISK-027, RISK-028, RISK-029 |

---

## 13. Kontrol yang sudah terverifikasi dan harus dipertahankan

Jangan merusak kontrol yang sudah baik saat remediasi:

- `ResourceController` memakai middleware permission per resource (TERVERIFIKASI).
- Idempotensi webhook Midtrans: lock per charge, deteksi duplikasi `transaction_id`, guard downgrade payment completed (TERVERIFIKASI).
- Signature callback Midtrans SHA512 dan test notification yang dibatasi pola test (TERVERIFIKASI; tetap perlu unit test).
- Bank Kaltim callback memakai token auth + rate limit + logging terpisah (TERVERIFIKASI; perkuat rotasi/alert).
- Bank Kaltim VA lifecycle lengkap dengan guard gratis/nol (TERVERIFIKASI; dokumentasikan perilaku retain).
- Queue `failed_jobs`, retry `RevalidateLandingCacheJob`, dan rate limiter terpusat (TERVERIFIKASI).
- Focus visible, label ikon utama, live region form, dan reduced-motion sudah ada sebagian (TERVERIFIKASI; lengkapi).

---

## 14. Asumsi dan keterbatasan

### Asumsi

1. Git toplevel aplikasi adalah `/Users/andypratama3/Development/ProductSchool`; `src/` adalah subdirektori. Ini terverifikasi dari `git rev-parse --show-toplevel`.
2. `privkey.pem` yang dimaksud adalah root repo aplikasi dan **tracked**; `snap_private.pem` ada di disk tetapi **tidak tracked** (ignored).
3. Severity dipertahankan dari file sumber; priority disintesis sesuai brief bagian 12. Jika bukti berubah, priority dapat naik/turun.
4. Model tenancy belum diketahui. RISK-004 menjadi P0 jika shared DB terbukti.
5. Bank Kaltim classic VA dianggap belum produksi sampai dokumen bank/UAT/sign-off tersedia.
6. Typecheck yang gagal karena `tsc` tidak ditemukan adalah masalah tooling, bukan kegagalan tipe.
7. Semua target waktu adalah hari relatif; tidak ada tanggal absolut yang dikarang.
8. Uji dinamis tidak dijalankan pada audit ini; semua klaim runtime tetap BLOCKED sampai ada staging/akun.

### Keterbatasan

- `01-executive-summary.md` dan `README.md` tidak ada; konsolidasi memakai `02`-`10`.
- Tidak ada akses produksi, DB, log, kredensial, atau rekaman CI.
- Beberapa temuan bersifat statis/TERINDIKASI dan perlu validasi runtime.
- Audit integrasi WhatsApp/Instagram/AI belum mendalam; dicatat sebagai gap, bukan temuan kerentanan.
- Hasil websearch merek bukan nasihat hukum dan bukan clearance PDKI.

---

## 15. Exit criteria keseluruhan

1. RISK-001 dan RISK-002 ditutup dengan bukti (key revoked/history bersih; dokumen bank/UAT/sign-off atau status non-produksi yang jujur).
2. RISK-003 sampai RISK-008 selesai atau BLOCKED dengan bukti yang diminta, dan tidak ada klaim yang melampaui bukti.
3. P2 utama selesai pada Hari 60; P3 selesai pada Hari 90 atau tercatat sebagai residual.
4. Register `11-risk-register.csv` diperbarui: status, evidence_refs, dan acceptance criteria.
5. Semua bukti tersimpan di `audit-productschool/evidence/` dan bebas secret/PII.
6. Tidak ada klaim H2H aktif, 226 API, 380 permission, atau "9 alur" tanpa metode dan bukti.
