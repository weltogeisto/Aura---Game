#!/bin/bash
set -euo pipefail

echo "📦 Bundling React app to single HTML artifact..."

# Check if we're in a project directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: No package.json found. Run this script from your project root."
  exit 1
fi

# Check if index.html exists
if [ ! -f "index.html" ]; then
  echo "❌ Error: No index.html found in project root."
  echo "   This script requires an index.html entry point."
  exit 1
fi

REQUIRED_BINARIES=(parcel html-inline)

echo "🔎 Preflight: checking required build tooling..."
for binary in "${REQUIRED_BINARIES[@]}"; do
  if ! pnpm exec "$binary" --version >/dev/null 2>&1; then
    echo "❌ Error: Required binary '$binary' is not available via pnpm exec."
    echo "   Install dependencies first (for reproducible offline builds):"
    echo "   pnpm install --frozen-lockfile"
    exit 1
  fi
done

if [ ! -f ".parcelrc" ]; then
  echo "❌ Error: Missing .parcelrc in project root."
  echo "   This file is committed and required for canonical artifact builds."
  exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist bundle.html

# Build with Parcel
echo "🔨 Building with Parcel..."
pnpm exec parcel build index.html --dist-dir dist --no-source-maps

# Inline everything into single HTML
echo "🎯 Inlining all assets into single HTML file..."
pnpm exec html-inline dist/index.html > bundle.html

# Get file size
FILE_SIZE=$(du -h bundle.html | cut -f1)

echo ""
echo "✅ Bundle complete!"
echo "📄 Output: bundle.html ($FILE_SIZE)"
echo ""
echo "You can now use this single HTML file as an artifact in Claude conversations."
echo "To test locally: open bundle.html in your browser"
