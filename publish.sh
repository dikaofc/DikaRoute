#!/bin/bash
# DikaRoute Auto Build + Publish Script
# Jalankan di mesin dengan RAM >= 8GB atau di Termux
#
# Cara pakai:
#   chmod +x publish.sh
#   ./publish.sh [otp-code]
#
# Contoh:
#   ./publish.sh 123456   # dengan OTP
#   ./publish.sh          # tanpa OTP (jika 2FA non-OTP)

set -e

echo "=================================================="
echo "  DikaRoute Auto Build + Publish"
echo "=================================================="

# Setup Node 22
export PATH="$HOME/node22/bin:$PATH"

# Verifikasi Node versi
NODE_VER=$(node -v 2>/dev/null || echo "not found")
if [[ ! "$NODE_VER" =~ ^v22 ]]; then
    echo "ERROR: Node 22 tidak ditemukan di PATH"
    echo "Install Node 22 atau sesuaikan PATH di script ini"
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
    echo ""
    read -p "Lanjutkan dengan force? (y/N): " CONFIRM
    if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
        exit 1
    fi
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
# Cek apakah node_modules ada dan lengkap
if [[ ! -f "node_modules/.package-lock.json" ]]; then
    echo "Running npm ci..."
    npm ci --allow-scripts
else
    echo "node_modules sudah ada, skip npm ci"
fi

echo ""
echo "=================================================="
echo "  STEP 3: Build (memory-safe)"
echo "=================================================="
# Set memory limit sesuai RAM available
RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
if [[ "$RAM_GB" -ge 16 ]]; then
    HEAP_MB=8192
elif [[ "$RAM_GB" -ge 12 ]]; then
    HEAP_MB=6144
elif [[ "$RAM_GB" -ge 8 ]]; then
    HEAP_MB=4096
else
    # Untuk RAM < 8GB, pakai Turbopack (lebih hemat memory)
    HEAP_MB=2048
    USE_TURBOPACK=1
fi

echo "RAM detected: ${RAM_GB}GB"
echo "Heap: ${HEAP_MB}MB"

# Untuk RAM kecil, pakai Turbopack (lebih hemat memory)
if [[ "$USE_TURBOPACK" == "1" ]]; then
    echo "Mode: Turbopack (RAM terbatas)"
    echo ""
    NODE_OPTIONS="--max-old-space-size=$HEAP_MB" npm run build:cli
else
    echo "Mode: Webpack"
    echo ""
    DIKAROUTE_BUILD_MEMORY_MB=$HEAP_MB \
    DIKAROUTE_USE_TURBOPACK=0 \
    npm run build:cli
fi

# Verifikasi build berhasil
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
echo "Update URL:"
echo "  https://www.npmjs.com/package/dikaroute"
echo "=================================================="
