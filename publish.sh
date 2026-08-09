#!/bin/bash
# DikaRoute Auto Build + Publish Script
# Jalankan di mesin dengan RAM >= 6GB
#
# Cara pakai:
#   chmod +x publish.sh
#   ./publish.sh [otp-code]

set -e

echo "=================================================="
echo "  DikaRoute Auto Build + Publish"
echo "=================================================="

# Verifikasi Node versi (20+)
NODE_VER=$(node -v 2>/dev/null || echo "not found")
if [[ ! "$NODE_VER" =~ ^v(2[0-9]|[3-9][0-9]) ]]; then
    echo "ERROR: Node 20+ tidak ditemukan"
    echo "Current: $NODE_VER"
    exit 1
fi
echo "Node: $NODE_VER"

# Verifikasi npm login
echo ""
echo "Memeriksa status login npm..."
NPM_USER=$(npm whoami 2>/dev/null || echo "")
if [[ -z "$NPM_USER" ]]; then
    echo "ERROR: Belum login ke npm"
    echo "Jalankan: npm login"
    exit 1
fi
echo "Logged in as: $NPM_USER"

# Verifikasi version
VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
echo "Version: $VERSION"

# Cek apakah versi sudah ada di npm
REMOTE_VER=$(npm view dikaroute version 2>/dev/null || echo "not published")
if [[ "$REMOTE_VER" == "$VERSION" ]]; then
    echo ""
    echo "WARNING: Versi $VERSION sudah ada di npm!"
    echo "Ubah version di package.json sebelum publish."
    exit 1
fi

echo ""
echo "=================================================="
echo "  STEP 1: Clean previous build"
echo "=================================================="
rm -rf .next .turbo dist .build 2>/dev/null || true
echo "Clean done"

echo ""
echo "=================================================="
echo "  STEP 2: Install dependencies"
echo "=================================================="
if [[ ! -f "node_modules/.package-lock.json" ]]; then
    echo "Running npm ci..."
    npm ci
else
    echo "node_modules sudah ada, skip npm ci"
fi

echo ""
echo "=================================================="
echo "  STEP 3: Build (memory-safe)"
echo "=================================================="

# Detect RAM
RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
echo "RAM detected: ${RAM_GB}GB"

# Build dengan heap limit
if [[ "$RAM_GB" -ge 8 ]]; then
    HEAP_MB=4096
    echo "Mode: Webpack (heap ${HEAP_MB}MB)"
    DIKAROUTE_BUILD_MEMORY_MB=$HEAP_MB DIKAROUTE_USE_TURBOPACK=0 npm run build:cli
else
    HEAP_MB=2048
    echo "Mode: Default Next.js (heap ${HEAP_MB}MB)"
    NODE_OPTIONS="--max-old-space-size=$HEAP_MB" npm run build:cli
fi

# Verifikasi build
if [[ ! -d "dist" ]]; then
    echo "ERROR: Build gagal - dist tidak ditemukan"
    exit 1
fi

echo ""
echo "Build SUCCESS!"
echo "dist size: $(du -sh dist 2>/dev/null | cut -f1)"

echo ""
echo "=================================================="
echo "  STEP 4: Publish to npm"
echo "=================================================="

OTP_ARG=""
if [[ -n "$1" ]]; then
    OTP_ARG="--otp=$1"
    echo "Publishing with OTP..."
else
    echo "Publishing without OTP..."
fi

npm publish $OTP_ARG

echo ""
echo "=================================================="
echo "  PUBLISH SUCCESS!"
echo "=================================================="
echo ""
echo "dikaroute@$VERSION published to npm!"
echo ""
echo "Test:"
echo "  npm install -g dikaroute"
echo "  dikaroute --version"
echo "  dikaroute"
echo ""
echo "https://www.npmjs.com/package/dikaroute"
echo "=================================================="

