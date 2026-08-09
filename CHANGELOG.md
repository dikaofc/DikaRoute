# Changelog

Semua perubahan penting pada **DikaRoute** didokumentasikan di sini.
File ini juga dirender di dalam dashboard aplikasi (halaman Changelog).

Format mengikuti [Keep a Changelog](https://keepachangelog.com/) dan versi
mengikuti [Semantic Versioning](https://semver.org/).

## [3.8.55] - 2026-08-09

### Changed

- **README ditulis ulang** — hero 3D animasi (SVG), badge dinamis, dan dokumentasi
  lengkap (fitur, arsitektur, quickstart, API reference, konfigurasi env, FAQ,
  troubleshooting).
- **Stempel versi disinkronkan di seluruh repo** — commit `chore: sync version
stamp to 3.8.54 across all files` membuat setiap file menampilkan versi terbaru
  di GitHub.
- **`publish.sh` dihapus** — publikasi ke npm kini sepenuhnya ditangani GitHub
  Actions (`publish.yml`).

## [3.8.54] - 2026-08-09

### Fixed

- **CI build (Turbopack) dipulihkan** — 130 file di `src/lib` dikembalikan
  dari import relatif ber-ekstensi `.js` menjadi tanpa ekstensi. Commit
  sebelumnya memperkenalkan gaya import ESM `./x.js` yang tidak bisa
  diselesaikan Turbopack (`next build --turbopack`) ke file `.ts`, sehingga
  build publish di GitHub Actions gagal dengan `Module not found`
  (upstream [vercel/next.js#82945](https://github.com/vercel/next.js/issues/82945)).
- **Utilitas MITM kini ter-bundle sebagai JavaScript asli** — pipeline
  publish npm sebelumnya diam-diam menyalin source `.ts` mentah ke
  `dist/src/mitm/` karena kompilasi per-file `tsc` dengan
  `moduleResolution: NodeNext` selalu gagal. Kini `src/mitm/manager.ts`
  di-bundle dengan esbuild menjadi satu file `manager.js` yang siap jalan.
- **tsconfig** — menambahkan `ignoreDeprecations: "6.0"` agar TypeScript 6
  tidak lagi hard-error pada opsi `baseUrl`; `npm run typecheck:*` berfungsi
  kembali.
- **Traffic Inspector ingest** — menghapus key `requestBody`/`responseBody`
  duplikat (satu key menimpa yang lain secara diam-diam) dan memperbaiki
  tipe field `agent`.
- **HTTP proxy** — memperbaiki tipe body `fetch()` di inspector proxy.
- **CLI** — memperbaiki tautan release/changelog pada `dikaroute update`
  (placeholder `your-org/dikaroute` → `dikaofc/DikaRoute`).
- **Workflow publish** — job `publish` kini berjalan dengan
  `contents: write` sehingga step "Create GitHub Release" tidak lagi gagal
  dengan 403 akibat `GITHUB_TOKEN` default yang read-only.

## [3.8.52] - 2026-08-09

- Maintenance dan perbaikan stabilitas (detail lengkap lihat riwayat commit).

## [3.8.51] - 2026-08-09

- Maintenance dan perbaikan stabilitas (detail lengkap lihat riwayat commit).

## [3.8.50] - 2026-08-09

- Maintenance dan perbaikan stabilitas (detail lengkap lihat riwayat commit).
