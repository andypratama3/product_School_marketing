# Runbook — Rotasi & Purge Private Key (P0)

- **Temuan:** `RISK-007` / audit `05-security-and-privacy.md`
- **Status:** `TERVERIFIKASI` — private key nyata tersimpan di repo dan tercatat di Git.
- **Repo:** `/Users/andypratama3/Development/Sakolentra` (saat audit: `Development/ProductSchool`)
- **Jangan** menyalin isi key ke chat, tiket, atau laporan. Dokumen ini hanya menyebut path.

## 1. Fakta yang sudah diverifikasi

| File | Status | Commit | Catatan |
|---|---|---|---|
| `privkey.pem` | tracked | `b0cbeb60` (2026-04-08) | PKCS#8 `BEGIN PRIVATE KEY`, 1704 byte |
| `docker/ssl/live/school.andypratama.studio/privkey.pem` | tracked | `3de5949f` (2026-04-11) | key TLS domain `school.andypratama.studio` |
| `docker/ssl/archive/school.andypratama.studio/privkey1.pem` | tracked | `18f426cc` (2026-04-19) | arsip |
| `docker/ssl/archive/school.andypratama.studio/privkey2.pem` | tracked | `18f426cc` (2026-04-19) | arsip |
| `src/storage/snap-keys/snap_private.pem` | **tidak** tracked (ignored) | — | tetap periksa history & backup |

Sertifikat `docker/ssl/live/school.andypratama.studio/cert.pem` (Let's Encrypt E7) berlaku **11 Apr 2026 – 10 Jul 2026**, sehingga **sudah kedaluwarsa** pada 2026-10-28. Dampak: key tidak lagi dapat dipakai untuk impersonasi TLS dengan sertifikat tersebut, tetapi key tetap harus dianggap bocor (pernah ada di repo, mungkin sudah di-clone/fork). Jangan menganggap kedaluwarsa = aman.

## 2. Prinsip

1. **Rotasi dulu, purge kemudian.** Jangan menulis ulang history sebelum pengganti aktif.
2. **Anggap semua salinan bocor.** Clone, fork, CI cache, backup, dan mesin developer mungkin menyimpan key.
3. **History rewrite = operasi koordinasi.** Menulis ulang history mengubah semua commit hash; semua kolaborator harus re-clone. Butuh persetujuan pemilik repo.
4. **Jangan pernah** `git rm` saja — key tetap ada di history.

## 3. Langkah rotasi

### 3.1 Identifikasi pemakaian
Key root disalin oleh `set-up.sh:70,108,117` ke `ssl/privkey.pem` dan dipakai nginx (`nginx/conf.d/default.conf:22`, `docker/nginx/conf.d/*.conf`). Konfirmasi apakah masih ada server yang memakai key ini.

```bash
cd /Users/andypratama3/Development/Sakolentra
grep -rn "privkey.pem" --include="*.conf" --include="*.sh" --include="*.yml" . | grep -v node_modules | grep -v vendor
```

### 3.2 Terbitkan key baru
- **TLS:** terbitkan sertifikat baru (Let's Encrypt/ACME atau CA institusi) — jangan gunakan ulang key lama. Simpan hanya di server/secret manager.
- **SNAP:** bila `src/storage/snap-keys/snap_private.pem` pernah dipakai, minta key baru ke bank dan revoke yang lama.
- **Lainnya:** ganti semua secret turunan (JWT/signature) yang mungkin memakai key ini; invalidasi sesi/token bila relevan.

### 3.3 Pasang di lokasi aman
- Simpan sebagai file dengan permission `600`, owner service, di luar repo (mis. `/etc/ssl/private/...`), atau di secret manager (Vault/AWS Secrets Manager/Doppler).
- Update deployment (`set-up.sh`, compose, CI) agar mengambil dari env/secret, bukan dari repo.
- Pastikan `.gitignore` mencakup `*.pem`, `*.key`, `privkey*`, `storage/snap-keys/`.

### 3.4 Verifikasi pengganti
```bash
openssl x509 -in /path/cert.pem -noout -subject -dates
curl -vI https://<domain> 2>&1 | grep -E "subject|issuer|expire"
```
Pastikan layanan berjalan dengan key baru **sebelum** langkah 4.

## 4. Hapus dari HEAD

```bash
cd /Users/andypratama3/Development/Sakolentra
git rm --cached privkey.pem \
  docker/ssl/live/school.andypratama.studio/privkey.pem \
  docker/ssl/archive/school.andypratama.studio/privkey1.pem \
  docker/ssl/archive/school.andypratama.studio/privkey2.pem
# tambahkan pola ke .gitignore, lalu
git add .gitignore
git commit -m "chore(security): stop tracking TLS private keys"
```

Key masih ada di history sampai langkah 5.

## 5. Purge history (butuh persetujuan, koordinasi, dan force-push)

> **Peringatan:** menulis ulang history `main` mengubah hash semua commit setelah key pertama masuk. Fork/PR lama bisa rusak. Lakukan di jendela perubahan yang disepakati, beri tahu semua kolaborator, dan pastikan backup mirror tersedia.

Opsi A — `git-filter-repo` (disarankan):
```bash
# backup
git clone --mirror . /tmp/Sakolentra-backup.git
# purge semua key
git filter-repo --invert-paths \
  --path privkey.pem \
  --path docker/ssl/live/school.andypratama.studio/privkey.pem \
  --path docker/ssl/archive/school.andypratama.studio/privkey1.pem \
  --path docker/ssl/archive/school.andypratama.studio/privkey2.pem \
  --force
```
Opsi B — BFG Repo-Cleaner:
```bash
bfg --delete-files 'privkey*.pem' --delete-files 'snap_private.pem'
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

Lalu:
```bash
git push --force --all
git push --force --tags
```

Tindak lanjut wajib:
1. Minta GitHub **revoke/cache purge** untuk commit lama (atau hapus fork yang memuat key).
2. Aktifkan **secret scanning + push protection**.
3. Rotasi ulang bila ada indikasi key sempat dipakai setelah bocor.
4. Semua developer re-clone; hapus clone lama.

## 6. Verifikasi

```bash
git log --all --oneline -- '*privkey*.pem' '*snap_private.pem'   # harus kosong
git grep -n "BEGIN PRIVATE KEY" $(git rev-list --all) | head     # harus kosong
git ls-files | grep -Ei 'privkey|\.key$|snap_private'            # harus kosong
```

Kriteria selesai:
- [ ] Key baru aktif di server/secret manager.
- [ ] Key lama dicabut/diganti di semua sistem.
- [ ] Tidak ada key di HEAD maupun history.
- [ ] Secret scanning CI aktif dan memblokir push berikutnya.
- [ ] Catatan insiden (tanggal, dampak, keputusan) disimpan di luar repo.
