# Laporan Safe Improve — ProductSchool

## Ringkasan
- Baseline: typecheck **OK** (exit 0), build **OK** (exit 0, Next.js 16.3.8 Turbopack)
- Catatan baseline: `npm ci` tidak dijalankan (node_modules sudah terinstal dari package-lock yang ada; instal ulang hanya akan mengaduk tanpa nilai audit).
- Temuan: **9** (AMAN: **5**, PERLU-PERSETUJUAN: **4**) + **2** permintaan user (REQ-01, REQ-02)
- Diubah: **5** file / +80 −28 baris (Fase 2, commit per temuan) | Sengaja tidak diubah: seluruh frozen surface

## Temuan

### IMP-01 — Cleanup lockTimer tidak pernah membersihkan timer
- File: components/FlowSection.tsx:25-30
- Bukti:
  ```
  useEffect(() => {
    const timer = lockTimer.current;   // selalu null saat mount
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);
  ```
- Dampak: timeout 1200ms dari `go()` tidak pernah di-clear saat unmount; kecil (hanya me-reset ref boolean), tapi cleanup-nya mati.
- Risiko perubahan: AMAN
- Usulan minimal: baca ref di dalam cleanup (`if (lockTimer.current) clearTimeout(lockTimer.current);`)
- Alasan tidak mengubah tampilan/perilaku: hanya membatalkan timer yang sudah tidak relevan setelah unmount.

### IMP-02 — SearchDialog tanpa aria-modal
- File: components/SearchDialog.tsx:116-118
- Bukti: `role="dialog" aria-label="Pencarian"` tanpa `aria-modal="true"` (FeatureDialog sudah punya).
- Dampak: screen reader tidak tahu konten latar nonaktif saat dialog cari terbuka.
- Risiko perubahan: AMAN
- Usulan minimal: tambah `aria-modal="true"` satu atribut.
- Alasan tidak mengubah tampilan/perilaku: atribut semantik saja, tidak ada piksel/DOM visual berubah.

### IMP-03 — Input pencarian tanpa nama aksesibel
- File: components/SearchDialog.tsx:128-139
- Bukti: `<input id="q" placeholder="Cari fitur atau alur" ...>` tanpa `<label>` maupun `aria-label`.
- Dampak: screen reader mengumumkan input tanpa nama (hanya "textbox").
- Risiko perubahan: AMAN
- Usulan minimal: tambah `aria-label="Cari fitur atau alur"` pada input.
- Alasan tidak mengubah tampilan/perilaku: tidak ada perubahan visual; placeholder tetap sama.

### IMP-04 — Animasi SMIL peta tidak menghormati prefers-reduced-motion
- File: components/EcosystemMapClient.tsx:100-124
- Bukti: `<animateMotion … repeatCount="indefinite">` dan `<animate … repeatCount="indefinite">` selalu dirender; GSAP di `ScrollFx.tsx:24` sudah di-guard, SMIL belum.
- Dampak: panah tetap bergerak untuk user yang meminta minimasi gerak. (CSS tidak bisa dipakai untuk fix karena `globals.css` dibekukan.)
- Risiko perubahan: AMAN
- Usulan minimal: hook kecil `useReducedMotion` di file ini; bila aktif, render panah statis tanpa `animateMotion`/`animate`.
- Alasan tidak mengubah tampilan/perilaku: untuk user default tidak ada yang berubah; hanya user reduced-motion yang berhenti melihat gerak (sesuai permintaan sistem mereka).

### IMP-05 — Non-null assertion yang tidak perlu
- File: components/FeatureDialog.tsx:110-116
- Bukti: di dalam cabang `feature.flow ? … : …`, tombol memanggil `openFlow(feature.flow!)`.
- Dampak: lolos typecheck hari ini, tapi `!` menyembunyikan penyempitan tipe; bila cabang refactor kelak, bisa jadi runtime crash.
- Risiko perubahan: AMAN
- Usulan minimal: simpan `const flowKey = feature.flow;` lalu `flowKey ? <button … onClick={() => openFlow(flowKey)}>` — `!` hilang tanpa ubah JSX visual.
- Alasan tidak mengubah tampilan/perilaku: alur tipe yang sama, output DOM identik.

### IMP-06 — Dialog tanpa focus trap (PERLU-PERSETUJUAN)
- File: components/SearchDialog.tsx:76-90, components/FeatureDialog.tsx:20-35
- Bukti: fokus masuk + restore sudah ada, tapi tidak ada jebakan Tab; Tab dapat keluar ke latar saat dialog terbuka.
- Dampak: navigasi keyboard lolos dari modal.
- Risiko perubahan: PERLU-PERSETUJUAN
- Usulan minimal: handler Tab wrap-around di masing-masing dialog (±10 baris).
- Alasan ditahan: mengubah perilaku keyboard (disengaja untuk a11y, tapi tetap perilaku) → butuh persetujuan.

### IMP-07 — Kunci scroll latar bila dua dialog tumpang-tindih (PERLU-PERSETUJUAN)
- File: components/SearchDialog.tsx:80-88, components/FeatureDialog.tsx:24-34
- Bukti: keduanya menyimpan `prevOverflow` lalu memulihkan; bila dibuka/ ditutup di luar urutan LIFO, satu penutupan bisa membuka scroll saat dialog lain masih terbuka. (Skenario: FeatureDialog terbuka → Ctrl+K membuka SearchDialog → tutup SearchDialog dulu = aman; tutup FeatureDialog dulu = scroll terbuka padahal SearchDialog masih tampil.)
- Dampak: latar bisa di-scroll saat modal masih terbuka (edge case langka).
- Risiko perubahan: PERLU-PERSETUJUAN
- Usulan minimal: penghitung lock global di modul Toast/lib (±8 baris).
- Alasan ditahan: menyentuh mekanisme bersama dua komponen → butuh persetujuan.

### IMP-08 — Icon selalu aria-hidden (PERLU-PERSETUJUAN)
- File: lib/icons.tsx:189-192
- Bukti: `return <Component aria-hidden focusable="false" {...props} />;` — semua ikon disembunyikan dari AT, termasuk yang bermakna di tombol (mis. `aria-label` sudah menutupi di tombol, tapi asumsi global ini rapuh).
- Dampak: keputusan a11y arsitektural; hari ini aman karena semua tombol ikon punya `aria-label`, tapi kontraknya implisit.
- Risiko perubahan: PERLU-PERSETUJUAN
- Usulan minimal: tidak ada perubahan kode; dokumentasikan kontrak (satu baris komentar) atau biarkan.
- Alasan ditahan: mengubah default ini berisiko mengubah pohon aksesibilitas → keputusan pemilik.

### IMP-09 — Roving tabindex + hover membuka kategori peta (PERLU-PERSETUJUAN, info)
- File: components/EcosystemMapClient.tsx:133-153
- Bukti: `onMouseEnter={() => setActive(i)}` + `tabIndex={i === active ? 0 : -1}`; panel info memakai `aria-live="polite"`.
- Dampak: pengguna keyboard yang Tab melintasi node memicu render ulang panel tiap fokus (bising SR ringan); hover-tukar juga bisa mengganggu pengguna motorik.
- Risiko perubahan: PERLU-PERSETUJUAN
- Usulan minimal: tidak ada (perilaku inti sesuai desain "arahkan untuk melihat"); hanya dicatat.
- Alasan ditahan: mengubah interaksi inti = mengubah perilaku → butuh persetujuan.

## Permintaan user (di luar garansi no-change)

### REQ-01 — Node default peta: Akademik (bukan CMS)
- File: components/EcosystemMapClient.tsx:29-32
- Bukti: `categories.findIndex((c) => c.id === 'CMS')` → glow + panah spawn tengah→CMS saat muat.
- Yang diminta: spawn (glow + panah edge-flow) berangkat dari tengah ke **Akademik** (item pertama, node tengah-atas lingkaran).
- Usulan minimal: default `findIndex((c) => c.id === 'Akademik')` (fallback 0 sudah mencakupnya).
- Catatan: ini mengubah state visual awal → dikeluarkan dari pembuktian no-change, dikerjakan di Fase 2 atas instruksi eksplisit.

## Saran (butuh persetujuan pemilik)
- Tambah `README.md` singkat (cara dev/build) — tidak ada README saat ini.
- `.gitignore` sudah ada dan benar (`node_modules/ .next/ *.tsbuildinfo .DS_Store`); tidak ada file terlarang yang ter-commit (terverifikasi via `git ls-files`).
- Tidak ada ESLint/test — saran, bukan tindakan (dilarang oleh skill).

## Catatan konten (typo, angka, klaim) — tidak diubah
- `data/sales.ts` stack menyebut "Next.js 15 + React 19" sementara `package.json` memakai Next ^16 — ini copy tentang produk yang dijual, bukan versi repo; keputusan pemilik konten.
- `app/not-found.tsx:20` hardcode "75 fitur terverifikasi" — saat ini cocok dengan `features.length` (75), tapi rapuh bila data berubah.
- Angka `226` / `380` konsisten antara `stats` dan copy `audiences` — tidak ada konflik.

## Hasil eksekusi (diisi setelah Fase 2)
| ID | Status (selesai/dibatalkan/dilewati) | Commit | File |
|----|------|--------|------|
| IMP-01 | selesai | d506ab2 | components/FlowSection.tsx |
| IMP-02 | selesai | f540b54 | components/SearchDialog.tsx |
| IMP-03 | selesai | 5e2680f | components/SearchDialog.tsx |
| IMP-04 | selesai | c89eb53 | components/EcosystemMapClient.tsx |
| IMP-05 | selesai | 12308f3 | components/FeatureDialog.tsx |
| IMP-06 | selesai | 08cc0a2 | SearchDialog/FeatureDialog |
| IMP-07 | selesai | 364f31f | SearchDialog/FeatureDialog |
| IMP-08 | selesai (komentar saja) | b473610 | lib/icons.tsx |
| IMP-09 | info saja (tanpa perubahan) | — | components/EcosystemMapClient.tsx |
| REQ-01 | selesai (atas instruksi user) | f4a2651 | components/EcosystemMapClient.tsx |
| REQ-02 | dibatalkan (user: "bukan begitu maksud", revert f5b4342) | — | — |

## Bukti no-change
- sha256 frozen surface: **OK** (9/9 file cocok, `shasum -c /tmp/frozen.sha`).
- git diff --stat main..HEAD: 5 file (`EcosystemMapClient, FeatureDialog, FlowSection, SearchDialog, icons.tsx`); tidak ada `globals.css` / `data/` / manifest / config.
- typecheck sebelum → sesudah: OK → OK (dicek ulang setelah setiap commit).
- build sebelum → sesudah: OK → OK.

## Yang sengaja TIDAK dianggap temuan (diperiksa, bersih)
- Listener: semua `addEventListener` punya `removeEventListener` berpasangan (FeatureDialog, FlowContext, FlowSection, Header, SearchDialog).
- GSAP: `gsap.context().revert()` (ScrollFx, FeaturesSection) dan `trigger.kill()` (FlowSection) + flag `cancelled` untuk import async — aman untuk StrictMode double-invoke (`reactStrictMode: true`).
- Data: 75 fitur tanpa id duplikat; semua `category` dan `flow` merujuk ke entri yang ada; semua nama icon ada di registry; `FlowKey` sinkron dengan `data/flows.ts` (9 key).
- `localStorage`/`matchMedia` hanya di client/effect; `setItem` ber-try/catch; script tema inline ber-try/catch; `showToast` guard bila `#toast` hilang; `scrollToId` guard + hormati reduced-motion.
- Tidak ada `any`, `@ts-ignore`, atau cast tak-terjaga (cast `CustomEvent` dijaga `isFlowKey`; `find` yang kosong me-render `null`).
