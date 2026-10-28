# Aturan Kerja Audit (dibaca semua agen)

Tanggal audit: **2026-10-28**. Bahasa laporan: **Indonesia**.

## Sumber yang diaudit
- Brief & ruang lingkup: `/Users/andypratama3/Development/sales_web/ProductSchool_Konteks_Audit_Menyeluruh.md` (termasuk 3.16 Kerja Sama / Mitra).
- Situs marketing (repo ini): `/Users/andypratama3/Development/sales_web`.
- Aplikasi asli (Laravel + Blade + Vite): `/Users/andypratama3/Development/ProductSchool/src`.
- Situs marketing lengkap: `/Users/andypratama3/Development/landing_product`.
- Situs live (hanya baca pasif): `https://product-school.vercel.app/`.
- Dokumen audit lama di repo aplikasi (klaim untuk diverifikasi ulang, bukan kebenaran): `AUDIT_FINDINGS_2026_10_05.md`, `AUDIT_OUTSTANDING.md`, `AUDIT_PLAN_2026_10_05.md`, `FEATURES_MASTER.md`, `PRODUCTION_CHECKLIST.md`, `src/PRODUCTSCHOOL_DOKUMENTASI.md`.

## Aturan wajib
1. **Bukti, bukan klaim.** Setiap pernyataan harus punya `file:line`, hasil perintah, atau URL bertanggal. Jangan mengarang endpoint, hasil tes, angka, atau status integrasi.
2. **Label status bukti:** `TERVERIFIKASI` (dibaca/diuji dan dicatat), `TERINDIKASI` (bukti pendukung, belum tuntas), `BELUM DIVERIFIKASI`, `GAGAL` (diuji dan gagal), `TIDAK BERLAKU`, `BLOCKED` (akses/bukti tidak ada; jelaskan yang dibutuhkan).
3. **Read-only.** Jangan mengubah kode/sumber. Hanya menulis file di `/Users/andypratama3/Development/sales_web/audit-productschool/`. Jangan `git checkout/commit/reset`.
4. **Dilarang** membuat transaksi/pembayaran, mengirim email/WhatsApp, submit form, membuat/menghapus user, mengubah setting, memanggil endpoint yang mengubah data, menembus auth, atau memindai/eksploitasi.
5. **Redaksi.** Jangan tulis secret/token/API key/password/private key/nomor rekening lengkap/PII. Ganti dengan `[REDACTED]`. Data siswa/guru harus sintetis.
6. **Jangan jalankan** `php artisan` yang butuh DB atau mengubah state, `npm run build`/`next build`. `rg`, `find`, `sed`, `php -l`, dan pembacaan file diperbolehkan. Typecheck hanya oleh agen arsitektur.
7. **Bedakan** fakta kode, hasil uji, klaim pemasaran, dan asumsi. Menu/route bukan bukti fitur selesai; integrasi bukan bukti transaksi end-to-end.
8. **Format temuan** (untuk file .md):
   - ID: `PS-AUD-XXX`
   - Judul, Area, Status bukti, Severity (Critical/High/Medium/Low/Informational)
   - Dampak, Prasyarat & langkah reproduksi, Expected, Actual, Bukti (`file:line`), Rekomendasi, Kriteria penerimaan, PIC/target (jika ada).
9. **Batasan runtime:** tidak ada kredensial/akun uji. Semua uji dinamis ditandai `BLOCKED` dengan alasan, bukan dikarang.
10. **Konsistensi:** jangan menduplikasi ID temuan antar-file; gunakan prefix area (mis. `PS-AUD-SEC-001`, `PS-AUD-PAY-001`) dan sebutkan ID di ringkasan.
