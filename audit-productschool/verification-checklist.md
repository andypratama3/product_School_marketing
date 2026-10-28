# Verification Checklist — Item BLOCKED dan Cara Menutupnya

Dokumen ini adalah daftar kerja untuk mengubah temuan `BLOCKED` / `BELUM DIVERIFIKASI` menjadi bukti. Setiap item berisi: apa yang harus dibuktikan, cara memperoleh bukti, kriteria lulus, dan siapa yang bisa membuka blokir.

> Aturan tetap berlaku: jangan memakai data produksi nyata, jangan mengirim pesan/email/WA nyata, jangan memproses pembayaran nyata, dan jangan menyalin secret/PII ke dalam repo atau laporan. Gunakan lingkungan uji dan data sintetis.

## A. Bisa dikerjakan tanpa kredensial baru

| ID | Item | Bukti yang dibutuhkan | Kriteria lulus | Pemilik |
|---|---|---|---|---|
| V-01 | Redeploy build yang memuat perbaikan SEO | `curl -s https://product-school.vercel.app/ \| grep -E 'canonical\|robots'`; status `robots.txt`, `sitemap.xml`, `opengraph-image` | canonical `https://product-school.vercel.app`; `index, follow`; sitemap & OG `200` | Andy / akses Vercel |
| V-02 | Env produksi Vercel | Screenshot/daftar env (tanpa nilai secret) | `NEXT_PUBLIC_NOINDEX` tidak diset; `NEXT_PUBLIC_SITE_URL` benar bila diisi | Andy |
| V-03 | Rotasi & purge private key | Lihat `private-key-rotation-runbook.md`; `git log --all -- '*privkey*.pem'` setelah purge | Tidak ada key di HEAD/history; key lama tidak dipakai lagi | Andy |
| V-04 | Pemeriksaan merek “Sakolentra” | Hasil pencarian manual PDKI/DJKI (`pdki-indonesia.dgip.go.id`), domain, akun sosial; simpan tanggal + tangkapan layar | Status jelas: terdaftar / tidak ditemukan / perlu pendaftaran | Andy / konsultan merek |
| V-05 | Lighthouse (mobile + desktop) | Laporan HTML/JSON, dijalankan pada URL live setelah V-01 | Baseline LCP/CLS/INP terdokumentasi; tidak wajib lulus ambang | Andy |
| V-06 | Google Search Console | Properti domain terverifikasi; sitemap disubmit | Status properti + tanggal submit | Andy |

## B. Butuh lingkungan uji, akun, dan data sintetis

| ID | Item | Bukti yang dibutuhkan | Kriteria lulus | Membuka |
|---|---|---|---|---|
| V-10 | Matriks RBAC per role | Akun uji untuk setiap role di `RoleSeeder`; uji menu + akses langsung URL/endpoint | Role hanya melihat/melakukan aksinya; akses langsung → `403`; tidak ada kebocoran menu | Tim ProductSchool |
| V-11 | Isolasi data antar sekolah | Dua sekolah sintetis (A/B); uji IDOR pada siswa, tagihan, rapor, dokumen, kerja sama | Permintaan lintas sekolah → `403`/`404`; tidak ada data sekolah lain | Tim ProductSchool |
| V-12 | Midtrans sandbox | Kredensial sandbox; skenario sukses, pending, gagal, refund, webhook palsu/berulang | Status transisi benar; signature diverifikasi; idempotensi terbukti; retry aman | Tim ProductSchool |
| V-13 | Bank Kaltim VA (classic) | Kredensial/spec sandbox; `BANKALTMITARA_ENABLED` sesuai lingkungan | VA terbentuk, callback terverifikasi, rekonsiliasi cocok | Bank + Tim |
| V-14 | Bankaltimtara SNAP | Spec VASPEC/ISA, sertifikat, akses sandbox | **Tidak berlaku selama fitur disabled.** Bila diaktifkan: semua skenario H2H lulus | Bank + Tim |
| V-15 | Queue, scheduler, webhook | Worker + scheduler berjalan; job gagal, retry, timeout, `failed_jobs` | Job diproses; retry/backoff terbukti; tidak ada job hilang | Tim Ops |
| V-16 | Backup & restore | Salinan DB + storage; restore ke lingkungan terpisah | Waktu restore dan kelengkapan data terukur (RTO/RPO) | Tim Ops |
| V-17 | CI & test suite | Log pipeline, coverage, hasil test | Build/test/secret-scan berjalan; coverage dilaporkan apa adanya | Tim ProductSchool |
| V-18 | Aksesibilitas manual | Uji keyboard penuh, screen reader (NVDA/VoiceOver), kontras | Fokus terlihat, urutan logis, dialog dapat ditutup via keyboard, kontras AA pada teks utama | Andy |
| V-19 | Autentikasi & pembatasan | Uji lockout, rate limit, reset password, 2FA (bila ada) | Tidak ada enumerasi akun; lockout/rate limit terbukti | Tim ProductSchool |

## C. Butuh dokumen pihak ketiga / legal

| ID | Item | Dokumen | Kriteria lulus |
|---|---|---|---|
| V-20 | Kesiapan H2H produksi | Surat persetujuan bank, ISA/VASPEC final, sertifikat & mTLS, berita acara UAT, kontak eskalasi | Semua ada dan berlaku; jika tidak → H2H hanya boleh disebut “terintegrasi (non-produksi)” |
| V-21 | Legalitas merek | Hasil PDKI + pendapat konsultan | Tidak ada konflik sebelum rename publik; jika ada → ganti nama |

## D. Drift yang harus direkonsiliasi

| ID | Temuan | Tindakan |
|---|---|---|
| V-30 | Repo aplikasi kini berada di `/Users/andypratama3/Development/Sakolentra` (sebelumnya `Development/ProductSchool`); sitasi audit memakai path saat audit. | Gunakan `Sakolentra/src/...` untuk navigasi; path di laporan dipertahankan sebagai catatan waktu audit. |
| V-31 | HEAD bergerak dari `994b431f` ke `59f68d81` (“update logs blade”) setelah audit; ada perubahan eksternal branding ke “Sakolentra”. | Re-verifikasi temuan yang menyentuh file berubah sebelum menutup audit; jangan revert perubahan eksternal. |
| V-32 | `CooperationRequest.php` diubah untuk hardening izin/validasi. | Uji ulang V-10/V-11 pada endpoint kerja sama setelah build berikutnya. |

## Urutan eksekusi yang disarankan

1. **V-01/V-02** (SEO live) dan **V-03** (key) — risiko tertinggi, tidak butuh pihak ketiga.
2. **V-11/V-10** — menentukan apakah risiko isolasi data benar-benar terjadi.
3. **V-12/V-13** — baru setelah akun uji tersedia; V-14 tetap dimatikan.
4. **V-04/V-20/V-21** — jalur legal/bank, berjalan paralel.
5. **V-15/V-16/V-17/V-18/V-19** — hardening operasional.
