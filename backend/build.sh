#!/bin/bash
# Build script for Vercel deployment
# This script runs during the build phase to generate the Prisma client

echo "🔧 Installing dependencies..."
pip install -r requirements.txt

echo "🔧 Generating Prisma client..."
python -m prisma generate

echo "✅ Build complete!"
