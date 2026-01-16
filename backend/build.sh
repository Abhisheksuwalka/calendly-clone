#!/bin/bash
# Render Build Script

set -e

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🔧 Generating Prisma client..."
prisma generate

echo "📥 Fetching Prisma binaries..."
prisma py fetch

echo "📋 Looking for Prisma binary..."

# List what's in the cache directory
PRISMA_CACHE_DIR="/opt/render/.cache/prisma-python/binaries"
echo "Contents of $PRISMA_CACHE_DIR:"
ls -la "$PRISMA_CACHE_DIR" 2>/dev/null || echo "Directory not found"

# Find the version directory
VERSION_DIR=$(find "$PRISMA_CACHE_DIR" -maxdepth 2 -type d 2>/dev/null | tail -1)
echo "Version directory: $VERSION_DIR"
ls -la "$VERSION_DIR" 2>/dev/null || echo "Version dir not found"

# Look for the binary with any name pattern
echo "Looking for query engine binary..."
find /opt/render/.cache -name "*query-engine*" -o -name "*query_engine*" 2>/dev/null || echo "No binaries found"

# Try copying any found binary
BINARY=$(find /opt/render/.cache -name "*query-engine*" -type f 2>/dev/null | head -1)
if [ -n "$BINARY" ]; then
    echo "Found binary: $BINARY"
    cp "$BINARY" ./prisma-query-engine-debian-openssl-3.0.x
    chmod +x ./prisma-query-engine-debian-openssl-3.0.x
    echo "✅ Binary copied!"
else
    echo "❌ No binary found in cache"
    # Try to download directly
    echo "Trying direct download..."
    PRISMA_BINARY_PLATFORM="debian-openssl-3.0.x" prisma py fetch
fi

echo "✅ Build complete!"
ls -la ./prisma* 2>/dev/null || echo "No prisma files in current dir"
