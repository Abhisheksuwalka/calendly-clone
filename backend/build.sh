#!/bin/bash
# Render Build Script

set -e

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🔧 Generating Prisma client..."
prisma generate

echo "📥 Fetching Prisma binaries..."
prisma py fetch

echo "📋 Copying Prisma binary to project directory..."
# Find and copy the query engine binary
PRISMA_CACHE_DIR="/opt/render/.cache/prisma-python/binaries"
if [ -d "$PRISMA_CACHE_DIR" ]; then
    BINARY_PATH=$(find "$PRISMA_CACHE_DIR" -name "prisma-query-engine-*" -type f 2>/dev/null | head -1)
    if [ -n "$BINARY_PATH" ]; then
        cp "$BINARY_PATH" ./
        chmod +x ./prisma-query-engine-*
        echo "✅ Binary copied: $(basename $BINARY_PATH)"
    else
        echo "⚠️ No binary found in cache, trying alternate location..."
    fi
fi

echo "✅ Build complete!"
