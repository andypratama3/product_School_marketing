---
name: safe-improve
description: Perbaiki dan tingkatkan kualitas project Next.js/React/TypeScript tanpa mengubah tampilan, data, perilaku, struktur, atau dependency. Gunakan saat diminta "improve", "perbaiki", "rapikan", "audit" atau "optimasi" pada project ProductSchool atau project serupa, dan perubahan harus minimal, terverifikasi, dan bisa dibatalkan.
---

# Safe Improve — memperbaiki tanpa mengubah

## Prinsip inti
**Fix, jangan ubah.** Output akhir harus terlihat dan berperilaku identik bagi
pengguna, hanya lebih benar, lebih aman, lebih mudah diakses, dan lebih stabil.

Urutan prioritas saat ragu:
1. Jangan merusak apa pun yang berjalan.
2. Jangan mengubah tampilan/copy/data.
3. Perubahan sekecil mungkin.
4. Baru setelah itu: memperbaiki.

Jika sebuah perbaikan tidak bisa dibuktikan aman → **jangan dikerjakan, laporkan saja.**

## Kontrak "TIDAK BOLEH BERUBAH" (frozen surface)
Daftar ini adalah permukaan publik project. Mengubahnya = melanggar skill ini.

| Kategori | Yang dibekukan |
|---|---|
| Tampilan | Seluruh `app/globals.css` (nilai, selector, urutan), inline `style` pada JSX, ukuran, warna, animasi, urutan section di `app/page.tsx` |
| Copy | Semua teks yang tampil ke pengguna (judul, label, `aria-label`, placeholder, pesan toast/error) |
| Data | Seluruh isi `data/features.ts`, `data/flows.ts`, `data/categories.ts`, `data/sales.ts` (nilai, urutan, id, key) |
| DOM id | `hero stats eco fit flow done cta map stage toast ft q ql` |
| Class CSS | Semua nama class (`.s .r .rv .ck .nd .edge .card .chip .btn .ib .rail .prog .flowpick ...`) — dipakai oleh CSS **dan** GSAP selector di `ScrollFx.tsx` |
| Event | `open-feature`, `open-flow` (nama + bentuk `detail`) |
| Storage | `localStorage['ps-theme']` dan atribut `data-theme` pada `<html>` |
| Export publik | `openFeature`, `openFlow` (SearchDialog), `showToast` (Toast), `scrollToId` (lib/scroll), `useFlow`/`FlowProvider`, `Icon`/`IconName`, semua tipe di `lib/types.ts` |
| File | Tidak rename / pindah / hapus / menambah file kode baru (kecuali laporan & file yang diminta eksplisit) |
| Dependency | `package.json` dan `package-lock.json` tidak disentuh. Port `start -p 3100` tetap |
| Config | `next.config.mjs` dan `tsconfig.json` tidak diubah tanpa persetujuan eksplisit |

## Yang BOLEH diperbaiki (jika terbukti bermasalah)
- **Bug perilaku**: race condition, stale closure, dependency array effect yang salah, memory/event-listener leak, timer yang tidak dibersihkan, error runtime/hydration.
- **Aksesibilitas yang tidak mengubah tampilan**: atribut ARIA yang kurang/salah, `aria-modal`, manajemen fokus (focus trap & restore), `type="button"`, label untuk input, urutan tab, `prefers-reduced-motion` yang belum dihormati.
- **Type safety**: `any`/cast tidak aman, non-null assertion (`!`) yang bisa crash, guard yang hilang. Semua tanpa melonggarkan `strict`.
- **Robustness**: akses `localStorage`/`matchMedia`/`document` yang bisa gagal (SSR, private mode), null-check, fallback untuk data kosong.
- **Performa tanpa efek visual**: memo/useMemo/useCallback yang salah pakai, re-render tak perlu, listener ganda, import dinamis berulang yang bisa dirapikan tanpa mengubah hasil.
- **Kebersihan kode**: import/variabel yang terbukti tidak terpakai (bukti: pencarian grep seluruh repo + typecheck lulus), komentar yang keliru. Bukan gaya penulisan.
- **Konsistensi data (hanya dilaporkan, bukan diubah)**: `category` di fitur yang tidak ada di `categories`, `flow` yang tidak ada di `flowMap`, nama icon yang tidak ada di registry, id duplikat.

## Yang DILARANG (walau terlihat "lebih baik")
- Refactor arsitektur, memecah/menggabung komponen, memindah logika ke hook baru.
- Mengganti CSS global ke Tailwind/CSS Modules, mengganti nama class jadi "lebih bersih".
- Mengganti elemen `<s>`, `<u>`, `<b>` yang dipakai sebagai hook styling di Hero/map (CSS bergantung padanya).
- Mengganti Google Fonts `<link>` ke `next/font`, mengubah strategi caching/rendering, menambah `metadata` baru, mengubah `viewport` atau script tema inline di `layout.tsx` — semuanya berpotensi mengubah tampilan/FOUC. Hanya **saran**.
- Memperbaiki typo/ejaan/kalimat pada copy atau data. Hanya **laporan** (pemilik konten yang memutuskan).
- Format ulang file (Prettier, indent, urutan import) atau reorder properti.
- Menambah ESLint/Prettier/test/library apa pun.
- Menghapus `tsconfig.tsbuildinfo`, `__MACOSX`, atau file lain di luar permintaan (cukup laporkan sebagai saran `.gitignore`).

## Prosedur

### 0. Persiapan
```bash
git status --porcelain          # harus bersih; jika tidak, berhenti dan tanyakan
git checkout -b improve/safe 2>/dev/null || true
```

### 1. Baseline (catat apa adanya, jangan "memperbaiki" lingkungan)
```bash
npm ci || npm install
npm run typecheck 2>&1 | tee /tmp/baseline-typecheck.txt
npm run build     2>&1 | tee /tmp/baseline-build.txt
```
Simpan juga "sidik jari" frozen surface untuk pembuktian di akhir:
```bash
git ls-files app/globals.css data package.json package-lock.json next.config.mjs tsconfig.json \
  | xargs sha256sum > /tmp/frozen.sha
```
Jika baseline sudah gagal, catat sebagai temuan awal (IMP-00). Jangan lanjut
mengedit sebelum penyebabnya dipahami.

### 2. Audit (read-only) — checklist
Periksa setiap butir. Hanya laporkan yang **terbukti** dengan kutipan kode.

**A. Perilaku & lifecycle**
- [ ] Setiap `addEventListener` punya `removeEventListener` dengan referensi yang sama.
- [ ] Setiap `setTimeout/setInterval/requestAnimationFrame` dibersihkan saat unmount (cek `Toast.tsx`, `FlowSection.tsx`, `SearchDialog.openFlow`).
- [ ] Dependency array `useEffect/useCallback/useMemo` benar (tidak stale, tidak memicu loop).
- [ ] GSAP: setiap `gsap.context`/`ScrollTrigger.create` di-`revert`/`kill` saat cleanup; tidak ada trigger ganda saat StrictMode double-invoke (`ScrollFx`, `FeaturesSection`, `FlowSection`).
- [ ] Efek async (`import('gsap')`) aman terhadap unmount (flag `cancelled`).
- [ ] Dua dialog (`SearchDialog`, `FeatureDialog`) yang sama-sama mengunci `document.body.style.overflow`: pastikan nilai awal dipulihkan dengan benar bila tumpang-tindih.
- [ ] Hydration: nilai awal state yang dibaca dari `window/localStorage/matchMedia` tidak menyebabkan mismatch SSR (mis. state tema di `Header`).
- [ ] Handler keyboard global (`Ctrl/⌘+K`, panah di FlowSection) tidak bentrok dengan input/dialog.

**B. Aksesibilitas (tanpa ubah tampilan)**
- [ ] Dialog custom (`SearchDialog`, `FeatureDialog`): `role="dialog"`, `aria-modal="true"`, label, fokus masuk, **focus trap**, fokus kembali ke pemicu.
- [ ] Semua `<button>` non-submit memakai `type="button"` bila berada di dalam form (saat ini tidak ada form → hanya laporkan).
- [ ] `aria-pressed`, `aria-current`, `aria-label` konsisten dengan state nyata.
- [ ] Elemen dekoratif memakai `aria-hidden`; `Icon` benar-benar meneruskan prop `aria-hidden` (cek `lib/icons.tsx`).
- [ ] Animasi mengikuti `prefers-reduced-motion` (GSAP sudah; cek animasi SVG `animateMotion` di `EcosystemMapClient` — hanya laporkan bila tidak ada penanganan).
- [ ] Kontras warna: hanya **laporkan** (mengubah warna = mengubah tampilan).

**C. Type safety**
- [ ] Cari `any`, `as unknown as`, `!` (non-null), `@ts-ignore`, `@ts-expect-error`.
- [ ] Cast event (`e as CustomEvent<...>`) punya validasi runtime bila datanya dipakai langsung.
- [ ] `FlowKey` di `lib/types.ts` sinkron dengan key yang ada di `data/flows.ts`.

**D. Konsistensi data (laporkan, jangan ubah data)**
Jalankan pemeriksaan read-only (jangan commit skripnya):
```bash
npx tsc --noEmit            # nama icon / FlowKey yang salah akan tertangkap tipe
```
Lalu periksa manual/grep:
- Setiap `feature.category` ada di `categories[].id`.
- Setiap `feature.flow` ada di `flowMap`.
- Tidak ada `feature.id` duplikat; tidak ada `flow.key` duplikat.
- Angka yang di-hardcode di `data/sales.ts` (`'226'`, `'380'`) vs klaim di copy lain — hanya laporkan bila bertentangan.
- `stack` menyebut "Next.js 15" sementara project ini memakai Next ^16: **jangan ubah** — itu copy tentang produk yang dijual; laporkan sebagai catatan untuk pemilik konten.

**E. Robustness**
- [ ] `localStorage`, `matchMedia`, `navigator`, `document` hanya diakses di client/effect dan dibungkus try/catch bila perlu.
- [ ] `Toast`/`showToast` aman bila elemen `#toast` belum ada (sudah ada guard — pastikan tetap).
- [ ] Komponen aman terhadap array/data kosong.

**F. Performa (hanya yang tidak mengubah hasil)**
- [ ] Re-render tidak perlu pada daftar besar (`FeaturesSection`), `memo` yang tidak efektif karena prop tidak stabil.
- [ ] Listener `mousemove` per kartu — laporkan, jangan ubah bila perubahan memengaruhi efek visual.
- [ ] Ukuran bundle: hanya laporkan (`npm run build` output).

**G. Hygiene repo (saran saja, jangan eksekusi)**
- `.gitignore` belum ada; `tsconfig.tsbuildinfo` dan `.next/` seharusnya tidak di-commit.
- Tidak ada `README`/ESLint/test — saran, bukan tindakan.

### 3. Klasifikasi temuan
Setiap temuan wajib berformat:

```
### IMP-01 — <judul singkat>
- File: components/X.tsx:42-55
- Bukti: <kutipan kode asli, maks 8 baris>
- Dampak: <apa yang bisa salah, kapan>
- Risiko perubahan: AMAN | PERLU-PERSETUJUAN
- Usulan minimal: <diff konseptual 1-5 baris>
- Alasan tidak mengubah tampilan/perilaku: <1 kalimat>
```

**AMAN** = memenuhi SEMUA: (1) tidak menyentuh frozen surface, (2) tidak mengubah
output DOM/CSS yang terlihat, (3) tidak mengubah urutan efek/animasi, (4) diff
≤ ~10 baris, (5) bisa diverifikasi typecheck/build.
Selain itu = **PERLU-PERSETUJUAN** (hanya dilaporkan).

### 4. Berhenti & tunggu persetujuan
Tulis `IMPROVE-REPORT.md` (template di bawah), tampilkan ringkasannya, lalu
**berhenti**. Jangan mengedit kode sebelum pengguna menjawab.

### 5. Eksekusi (setelah disetujui)
Untuk setiap temuan yang disetujui, berurutan dari risiko terendah:
1. Buat perubahan **sekecil mungkin** dengan `str_replace`/edit terarah (jangan menulis ulang file).
2. `npm run typecheck`. Gagal → batalkan perubahan itu (`git checkout -- <file>`), tandai "dibatalkan".
3. `git add -p`/`git add <file>` lalu commit: `fix(<area>): <ringkas> [IMP-xx]`.
4. Setelah semua selesai: `npm run build`.

Aturan edit:
- Pertahankan gaya penulisan, tanda kutip, indentasi, dan komentar asli di sekitar baris yang diubah.
- Jangan menyentuh baris yang tidak berkaitan, termasuk "sekalian merapikan".
- Jangan menambah komentar panjang; maksimal satu baris bila alasan perbaikan tidak jelas.
- Jika perubahan membutuhkan file baru, dependency baru, atau mengubah class/id/event → berhenti, jadikan "PERLU-PERSETUJUAN".

### 6. Pembuktian "tidak ada yang berubah"
Wajib dijalankan di akhir dan hasilnya dilampirkan di laporan:
```bash
# 1. Frozen surface tidak berubah
sha256sum -c /tmp/frozen.sha                 # semua harus OK

# 2. Hanya file yang dimaksud yang berubah
git diff --stat main..HEAD 2>/dev/null || git diff --stat HEAD~N..HEAD

# 3. Tidak ada perubahan CSS / data / manifest
git diff --name-only main..HEAD | grep -E 'globals\.css|^data/|package(-lock)?\.json|next\.config|tsconfig\.json' \
  && echo "PELANGGARAN: frozen surface berubah" || echo "OK: frozen surface utuh"

# 4. Kualitas
npm run typecheck && npm run build
```
Bila ada pelanggaran → revert commit terkait sebelum melapor.

## Template `IMPROVE-REPORT.md`

```markdown
# Laporan Safe Improve — ProductSchool

## Ringkasan
- Baseline: typecheck <OK/GAGAL>, build <OK/GAGAL>
- Temuan: <n> (AMAN: <a>, PERLU-PERSETUJUAN: <p>)
- Diubah: <jumlah file / baris>   | Sengaja tidak diubah: <jumlah>

## Temuan
(IMP-xx sesuai format di bagian 3)

## Saran (butuh persetujuan pemilik)
- ...

## Catatan konten (typo, angka, klaim) — tidak diubah
- ...

## Hasil eksekusi (diisi setelah Fase 2)
| ID | Status (selesai/dibatalkan/dilewati) | Commit | File |
|----|------|--------|------|

## Bukti no-change
- sha256 frozen surface: OK/PELANGGARAN
- git diff --stat: <ringkasan>
- typecheck sebelum → sesudah: ...
- build sebelum → sesudah: ...
```

## Aturan komunikasi
- Bahasa Indonesia, ringkas, faktual.
- Jangan mengklaim sesuatu "sudah dites/dicek" kalau perintahnya tidak dijalankan.
- Jangan membuat temuan untuk memenuhi kuota. **"Tidak ada yang perlu diperbaiki" adalah hasil yang valid.**
- Jika permintaan pengguna berbenturan dengan kontrak frozen surface, tanyakan dulu; jangan menebak.
