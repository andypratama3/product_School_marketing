---
name: sync-check
description: Cross-check klaim situs marketing ProductSchool terhadap kode aplikasi asli (Laravel di ProductSchool/src) — route API, permission/policy, stack, dan keberadaan modul fitur. Read-only terhadap kedua repo; tidak mengubah data/* situs (angka adalah keputusan pemilik konten).
---

# Sync Check — situs vs aplikasi asli

## Prinsip
**Bukti, bukan klaim.** Setiap angka di situs (`data/sales.ts`, Hero, audiences,
stack) harus bisa ditelusuri ke file di aplikasi asli. Skill ini hanya membaca;
perubahan angka situs = keputusan pemilik konten, bukan tindakan skill ini.

## Lokasi
- Situs: repo ini (`data/`, `lib/`, `components/`).
- Aplikasi: `/Users/andypratama3/Development/ProductSchool/src` (selalu verifikasi
  path ini masih ada sebelum mulai; bila pindah, minta path baru dan berhenti).

## Prosedur (read-only, tanpa artisan/DB)

### 1. Inventarisasi klaim situs
```bash
node -e "
const fs=require('fs');
const src=fs.readFileSync('data/features.ts','utf8');
const cats={}; [...src.matchAll(/category:\s*'([^']+)'/g)].forEach(m=>cats[m[1]]=(cats[m[1]]||0)+1);
console.log('fitur:', [...src.matchAll(/\bid:\s*'([^']+)'/g)].length, JSON.stringify(cats));
console.log(fs.readFileSync('data/sales.ts','utf8').match(/value: '[^']*'|value: String\([^)]*\)/g).join(' | '));
"
```

### 2. Route API (`routes/api.php` — satu-satunya API)
```bash
S=/Users/andypratama3/Development/ProductSchool/src
grep -cE "^\s*Route::(get|post|put|patch|delete|match)\b" $S/routes/api.php   # deklarasi
grep -c "Route::" $S/routes/api.php                                          # kasar (termasuk grup)
```
Bandingkan dengan klaim "226 route API". Angka pasti butuh `php artisan route:list`
(di dalam repo app, butuh DB) — catat bila belum dijalankan, jangan mengarang.

### 3. Permission & policy
```bash
S=/Users/andypratama3/Development/ProductSchool/src
ls $S/app/Policies/*.php | wc -l                       # klaim "34 policy"
grep -o "'[a-z0-9-]*'" $S/database/seeders/RoleSeeder.php | sort -u | wc -l   # klaim "380 permission"
grep -rn "272\|380 permission" $S/ROLES_PERMISSIONS.md $S/PRODUCTSCHOOL_DOKUMENTASI.md 2>/dev/null | head -5
```

### 4. Stack (composer.json + package.json app)
```bash
S=/Users/andypratama3/Development/ProductSchool/src
grep -E '"(laravel/framework|php|laravel/sanctum|spatie/laravel-permission|midtrans/midtrans-php|laravel/reverb)"' $S/composer.json
grep -E '"(react|next)"' $S/package.json
grep -rli "maps.googleapis\|@googlemaps" $S/config $S/app $S/resources 2>/dev/null | head -3 || echo "tanpa Google Maps"
ls $S/vendor/sentry 2>/dev/null || echo "Sentry SDK tidak terpasang"
grep -ril "leaflet\|openstreetmap" $S/resources/views 2>/dev/null | head -3
```

### 5. Keberadaan modul fitur yang diragukan
Untuk tiap nama meragukan di `data/*`, cari padanannya (`find $S/app -iname "*kata*"`).
Contoh yang pernah diperiksa: CCTV, Timesheet, InstagramOAuth, CmsController,
PaymentExport, AdmissionService, PayrollService, KmlService, MidtransService.

### 6. evidence flow vs kelas asli
```bash
grep -o "evidence: '[^']*'" data/flows.ts
```
Setiap nama kelas yang disebut harus `find`-able di `$S/app`. Drift nama → catat,
jangan ubah (teks ilustrasi + butuh keputusan pemilik).

## Format temuan
```
### SYNC-xx — <klaim>
- Situs: <file:baris situs> = <nilai>
- Realita: <file:baris app> = <nilai>
- Status: COCOK | OVERCLAIM | UNDERCOUNT | BERTENTANGAN | TAK TERBUKTI
- Aksi: <ubah angka (butuh pemilik) | selaraskan nama | cabut klaim | biarkan>
```

## Aturan komunikasi
- Bahasa Indonesia, ringkas. Bedakan "fakta kode" dari "estimasi".
- Jangan mengubah `data/*` situs dalam skill ini — hanya laporkan.
- "Semua cocok" adalah hasil valid. Jangan mengarang angka artisan.
