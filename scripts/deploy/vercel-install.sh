#!/usr/bin/env bash
# DikaRoute — Vercel install command
#
# A thin pass-through to `npm install`. The repo .npmrc already pins
# legacy-peer-deps and npm fetch retries, so Vercel's default install is
# correct. We just add benefit-of-the-doubt robustness and clean logs.
#
# Native optional deps (better-sqlite3, keytar, tls-client-node, wreq-js):
# on Vercel's runtime the app runs in `isCloud` in-memory mode and never loads
# them, and npm >= 11 blocks optional-dep install scripts by default — so they
# are simply not built here. That is exactly what we want; nothing to do.
#
# The repo's own `postinstall` (scripts/build/postinstall.mjs) is a safe no-op
# when there is no committed standalone bundle (it early-returns on the
# `hasStandaloneAppBundle` guard and never throws — guarded internally).
set -euo pipefail

node -v
npm -v

npm install --no-audit --no-fund

echo "[vercel-install] Dependencies installed for serverless build."