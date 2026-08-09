# DikaRoute

Unified AI gateway/router — multi-provider routing, auto-fallback, context & response
compression, dengan fokus utama **low latency, stabilitas, dan kecepatan**.

Satu instalasi, satu endpoint OpenAI-compatible (`/v1`), banyak provider AI —
dipilih otomatis berdasarkan health, latency, dan strategi routing (combos).

## Fitur Utama

- **Satu endpoint OpenAI-compatible** (`/v1`) untuk banyak provider sekaligus
- **Auto-fallback & routing stratégis (combos)** — tetap jalan saat provider down
- **Compression RTK + Caveman** — hemat token, respons lebih cepat
- **Dashboard ringan & cepat** — statistik real-time, token usage super detail,
  analytics per provider/model/key, heatmap aktivitas
- **CLI global** — ketik `dikaroute` di mana saja langsung jalan (auto setup,
  auto install dependency, auto start dashboard)
- **Self-update** — `dikaroute update --apply` update versi npm sendiri
- **2 bahasa untuk dashboard** (Indonesia 🇮🇩 & English 🇬🇧)
- **ZERO bloat** — tanpa docs/tests/electron bawaan, lebih bersih & hemat
  storage (cocok untuk VPS kecil dan Termux/Android)

## ⚡ Quick Start

```bash
npm install -g dikaroute
dikaroute
```

Tanpa sub-perintah, `dikaroute` **langsung menjalankan server + dashboard**:

- Dashboard: `http://localhost:20128`
- API (OpenAI-compatible): `http://localhost:20128/v1`

Semua dependency dan setup pertama di-handle otomatis oleh postinstall.
Support: Linux, Windows, macOS, VPS, Android/Termux, Docker.

### Jalankan di latar belakang

```bash
dikaroute serve --daemon   # daemon
dikaroute stop             # stop
dikaroute logs             # lihat logs
```

### Update ke versi terbaru

```bash
dikaroute update --apply
```

## 🖥️ CLI Reference (ringkas)

```bash
dikaroute                    # = serve — langsung start dashboard + API
dikaroute serve              # jalankan server (opsional flag: --port, --no-open, --daemon, --log)
dikaroute stop               # stop server
dikaroute restart            # restart server
dikaroute dashboard          # buka dashboard di browser
dikaroute doctor             # cek kesehatan instalasi & environment
dikaroute update --apply     # self-update dari npm
dikaroute status             # status server & provider
dikaroute health             # health check API

# Provider & kunci API
dikaroute providers list
dikaroute add-provider --help          # tambah provider
dikaroute config list                  # konfigurasi
dikaroute keys list                    # kelola API keys

# Penggunaan & biaya
dikaroute usage                        # token usage
dikaroute cost                         # estimasi biaya per provider/model

# Lainnya
dikaroute mcp                          # MCP server (stdio)
dikaroute chat                         # sesi chat langsung dari terminal
dikaroute logs --tail                  # stream logs
dikaroute backup                       # backup data
dikaroute update                      # cek/terapkan update
dikaroute --version                    # versi terpasang
dikaroute --help                       # semua sub-perintah lengkap
```

> Jalankan `dikaroute --help` untuk daftar lengkap 80+ sub-perintah.

## 🚀 Docker

```bash
docker compose up -d
```

- `docker-compose.yml` — dev
- `docker-compose.prod.yml` — production (volume untuk data)

## 💻 Development (dari source)

Butuh **Node.js >= 22.22** (disarankan 22.22.2).

```bash
git clone https://github.com/dikaofc/DikaRoute
cd DikaRoute
npm ci
npm run dev
```

- Dashboard: `http://localhost:20128`
- Data tersimpan di `~/.dikaroute/` (storage.sqlite)

## ⚙️ Env yang sering dipakai

| Variable | Fungsi |
|---|---|
| `PORT` | Port server (default `20128`) |
| `DATA_DIR` | Direktori data (`storage.sqlite`, `.env`) |
| `JWT_SECRET` / `API_KEY_SECRET` / `STORAGE_ENCRYPTION_KEY` | Keamanan (auto-generated saat instalasi) |
| `DIKAROUTE_LANG` | Bahasa CLI (default auto-detected) |
| `DIKAROUTE_API_KEY` | API key untuk perintah CLI |

Lengkap ada di `.env.example`.

## 🛡️ Keamanan

- Kredensial provider dienkripsi (AES-GCM) sebelum disimpan
- `STORAGE_ENCRYPTION_KEY` dibuat otomatis di instalasi pertama, dipakai untuk
  enkripsi storage (lihat `.env`)
- Tidak ada traffic telemetry ke luar tanpa izin

## 🌍 Komunitas

- Repo: https://github.com/dikaofc/DikaRoute
- Website: https://obitoglory.tech
- Owner: [@dikaacode](https://t.me/dikaacode)
- Channel: [@execuidorbaru](https://t.me/execuidorbaru)

## 🩺 Troubleshooting

| Masalah | Solusi |
|---|---|
| **Termux crash `validationLevel`** | Sudah fixed di ≥ 3.8.52 (instrumentation hook aman di Android). Update: `dikaroute update --apply` |
| Server tidak jalan di Android | Pastikan direktori cache ada: jalankan sekali `dikaroute serve` → otomatis dibuat |
| Update tidak diterapkan | `dikaroute update --apply` |
| Lupa password dashboard | `dikaroute reset-password` |
| Port bentrok | `dikaroute serve --port 20129` |

## 🔐 Lisensi

[MIT](./LICENSE) © 2026 DikaRoute