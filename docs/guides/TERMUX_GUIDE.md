---
title: "DikaRoute on Termux"
description: "Menjalankan DikaRoute di Android/Termux: instalasi, cache dir, dan troubleshooting instrumentation."
---

# DikaRoute on Termux (Android)

DikaRoute runs on Android via [Termux](https://termux.dev/). This guide covers the
common platform-specific problems and their fixes.

## Installation

```bash
# Use the Node.js LTS package (not the default), then install globally
pkg install nodejs-lts
npm install -g dikaroute
dikaroute --version
```

> Always keep the global install up to date — fixes for Termux land in every
> release:
>
> ```bash
> npm install -g dikaroute@latest
> ```

## Starting the server

```bash
dikaroute serve
```

The dashboard is served at `http://localhost:20128` and the OpenAI-compatible
API at `http://localhost:20128/v1`.

---

## Troubleshooting

### Dashboard / API returns `Internal Server Error` (HTTP 500) while the CLI says "running"

**Symptom:** `✔ DikaRoute is running!` is printed, but every request returns a
bare HTTP 500 and the dashboard shows _Internal Server Error_.

**Cause:** the Next.js instrumentation hook failed to load. When that hook never
runs, the server still binds its ports (so it _looks_ healthy) but every
DB-touching route 500s forever.

Two common Termux-specific causes:

1. **Missing Next.js cache directory** — Next.js has no `android` branch in its
   cache-dir probe. It only accepts a cache root that already exists (`~/.cache`
   or the tmp dir). The CLI normally creates it for you, but on a fresh install
   it may not have existed yet.
2. **A native module failed to load** — most often the SQLite driver
   (`better-sqlite3`) when its compiled binary does not match the Termux Node
   build, or `node:sqlite` is not available in the Termux Node package.

**Step 1 — see the real error** (the CLI hides child output by default):

```bash
dikaroute serve --log
```

Look for the actual failure line, e.g.:

```
An error occurred while loading instrumentation hook: ...
```

**Step 2 — apply the fixes in order:**

```bash
# 1. Cache probe — make sure ~/.cache exists
mkdir -p ~/.cache
dikaroute serve

# 2. If it still fails, rebuild native modules into a user-writable runtime
#    (works without a C++ toolchain):
dikaroute runtime repair

# 3. Or rebuild the SQLite driver explicitly (needs a C++ toolchain):
npm rebuild better-sqlite3
```

After each fix, restart: `dikaroute serve`.

**Step 3 — if the error persists**, share the full `dikaroute serve --log`
output (especially the `An error occurred while loading instrumentation hook: …`
line) — that identifies the exact module that failed on your device.

### `Unsupported platform: android`

Next.js's `getCacheDirectory()` has no `android` branch. On Termux it falls back
to a generic tmp location, which only succeeds when `~/.cache` (or the tmp dir)
already exists. This is the root cause of the instrumentation failure above:

```bash
mkdir -p ~/.cache
dikaroute serve
```

### `module.register() is deprecated` warning

Harmless Node.js deprecation notice. Ignore it.

### Native module rebuild guidance

Termux usually has no full C++ toolchain. Prefer:

```bash
dikaroute runtime repair
```

This rebuilds required native modules into a user-writable runtime directory
without needing `make`/`gcc`. Only fall back to `npm rebuild …` when a toolchain
is installed.
