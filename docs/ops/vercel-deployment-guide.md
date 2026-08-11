---
title: "Vercel Deployment"
description: "Stateless preview/demo deployment on Vercel: what works, what doesn't, and how to configure it."
---

> **tl;dr** DikaRoute is built to run as a *persistent, self-hosted daemon*
> (Docker / VPS / npm / desktop) with an on-disk SQLite database and native
> modules. **Vercel is a serverless/edge platform** — stateless function
> invocations and an ephemeral filesystem — so it is **not** a drop-in target
> for a full production gateway. This guide configures a **stateless preview /
> demo** deployment where the dashboard, docs, landing pages and **most** API
> routes render, but **nothing is persisted between requests and no long-lived
> listeners run.**

The config lives in three files:

| File | Purpose |
| --- | --- |
| `vercel.json` | Framework detection, build/install commands, headers. |
| `scripts/deploy/vercel-install.sh` | Repo-aware `npm install` for the serverless build. |
| `scripts/deploy/vercel-build.sh` | Runs `next build` directly (no standalone assembly). |

## How the deploy works

The repo normally builds a **Next.js standalone bundle**
(`scripts/build/build-next-isolated.mjs` → `.build/next/standalone`) and boots
a custom Node HTTP server (`run-next.mjs` / `server-ws.mjs`) with WebSocket
bridges, MITM proxy, VNC, ngrok and background workers.

**Vercel ignores all of that.** It runs `next build` and emits **serverless
functions** from your route handlers. The build/install overrides in this repo
make that explicit and CDN-friendly.

### Runtime "cloud" mode

DikaRoute already carries a cloud-aware code path. It is detected by:

```ts
const isCloud = typeof globalThis.caches === "object" && globalThis.caches !== null;
```

`globalThis.caches` (the Cache API) is present on Vercel's Node runtime, so on
Vercel `isCloud` is `true`, which means:

- `DATA_DIR` resolves to `/tmp`, `SQLITE_FILE` is `null`.
- `getDbInstance()` opens **in-memory SQLite** (`:memory:`) with an empty,
  freshly-migrated schema on every cold start.
- Checkpoints / WAL / persistence code is short-circuited (`if (isCloud) return`).

That is exactly why Vercel works at all: the app degrades to a **stateless**
router instead of crashing on a read-only filesystem.

### Build phase

`NEXT_PHASE=phase-production-build` (set by Next during build) makes the DB
layer `isBuildPhase`, so `next build` also uses in-memory SQLite and never
writes to disk during the build. `.source/` (fumadocs MDX output) is regenerated
by the `createMDX()` plugin in `next.config.mjs`.

## What works on Vercel

- ✅ **Dashboard, docs, landing, auth, status pages** — static + server-rendered.
- ✅ **OpenAI-compatible API routes** (`/api/v1/*`, `/v1/*`, `/v1beta/*`,
  `/chat/completions`, `/responses`, `/models`, `/metrics`, `/healthz`, ...).
- ✅ **Provider/model metadata, catalog, feature flags** — the in-memory DB is
  seeded from bundled static data at boot.
- ✅ **Rewrites & redirects** from `next.config.mjs` (Vercel honors them).
- ✅ **Security headers** (CSP, HSTS, nosniff) — re-applied in `vercel.json`.

## What does NOT work / is stubbed

- ❌ **Persistent storage.** Any API that reads/writes SQLite
  (`storage.sqlite`), backups, call logs, usage telemetry, access tokens, API
  keys, provider connections that expect `enc:v1:` encrypted blobs, etc. Data
  lives **only for the lifetime of a single function invocation.**
- ❌ **Long-lived listeners.** WebSocket bridges (`/responses` streaming over
  WS, Live WS), MITM/proxy servers, VNC sessions, ngrok tunnels, background
  pollers/schedulers. Serverless functions are torn down after each request.
- ❌ **Native / privileged modules.** `better-sqlite3`, `keytar`,
  `tls-client-node`, `wreq-js` are skipped at install and unavailable at
  runtime. Features that require them (OAuth keychain, anti-GPT MITM, exotic
  provider TLS wrappers) don't function.
- ❌ **File uploads / large bodies.** Vercel caps function request bodies at
  ~4.5 MB (Hobby) up to ~160 MB (Ultimate). DikaRoute configures a 50 MB
  Server-Actions cap, but the platform limit is the real ceiling.
- ❌ **Server Actions / dashboard interactivity** that relies on persisted
  server state.

## Deploying

### Option A — Vercel Dashboard (recommended for a quick demo)

Import `https://github.com/dikaofc/DikaRoute`, then:

1. **Build Command**: is auto-read from `vercel.json`
   (`scripts/deploy/vercel-build.sh`).
2. **Install Command**: auto-read (`scripts/deploy/vercel-install.sh`).
3. **Node.js Version**: set to **22** (repo engine: `>=22.22.2 <23 || >=24`).
4. **Environment Variables** you may want to set (all optional for a demo):
   - `DIKAROUTE_BASE_PATH` — leave empty for a root deploy.
   - `JWT_SECRET`, `STORAGE_ENCRYPTION_KEY` — accepted, but in-memory session
     secrets won't survive cold-starts meaningfully.
   - `NEXT_PUBLIC_DIKAROUTE_ENABLE_...` — per your provider config.
5. Click **Deploy**.

The dashboard will boot, the docs will render, and `/healthz`, `/v1/models`,
`/v1/chat/completions` will respond. Everything is ephemeral.

### Option B — Vercel CLI / Git

```bash
npm i -g vercel
vercel login
vercel pull
vercel build         # runs scripts/deploy/vercel-build.sh
vercel deploy --prebuilt
```

For CI, a Vercel Git integration (push to `main` → auto-deploy) or the
`vercel-deploy.yml` GitHub workflow (in `.github/workflows/`) can be enabled —
both just call the same build/install scripts.

## Configuration notes

- **Don't set `output: "standalone"` expectations on Vercel** — it's ignored;
  Vercel uses its own adapter.
- **`NEXT_DIST_DIR=.next`** is forced in `vercel-build.sh` so Vercel's Next
  adapter finds the build output in the standard location.
- **Docs are bundled from the `docs/` tree** at build time (fumadocs MDX →
  `.source/`), served server-side on `/docs/*`.

## Recommended alternative

For a real, persistent DikaRoute instance, use one of the native targets this
repo was designed for:

- **Docker / VPS** (`docker-compose.yml`, `Dockerfile`) — the default.
- **Self-hosted VPS** (`npm run build && npm start`, or the standalone bundle).
- **Desktop (Electron)** / **npm global** (`npx dikaroute`) — with real SQLite
  + native modules.

Use **Vercel only as a hosted preview / marketing front**, or as a thin
HTTPS reverse proxy in front of your own persistent instance via the
`/v1/...` routes pointing upstream — never as the stateful gateway.