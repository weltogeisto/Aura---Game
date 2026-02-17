#!/bin/bash
set -euo pipefail

echo "📦 Bundling React app to single HTML artifact..."

# Check if we're in a project directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: No package.json found. Run this script from your project root."
  exit 1
fi

# Check if Vite build output exists
if [ ! -f "dist/index.html" ]; then
  echo "❌ Error: No dist/index.html found."
  echo "   Run the Vite production build first (for example: pnpm run build:web)."
  exit 1
fi

# Ensure html-inline is available
if ! pnpm exec html-inline --version >/dev/null 2>&1; then
  echo "📦 Installing html-inline dependency..."
  pnpm add -D html-inline
fi

# Prepare isolated working output (keeps dist/ authoritative and untouched)
BUNDLE_WORK_DIR="dist-bundle"
echo "🧹 Preparing bundle workspace: ${BUNDLE_WORK_DIR}/"
rm -rf "${BUNDLE_WORK_DIR}" bundle.html
mkdir -p "${BUNDLE_WORK_DIR}"
cp -R dist/. "${BUNDLE_WORK_DIR}/"

# Normalize root-relative local asset paths for inlining in isolated workspace
echo "🔧 Normalizing asset paths for inlining..."
python3 - <<'PY'
from pathlib import Path
import re

index_path = Path("dist-bundle/index.html")
content = index_path.read_text(encoding="utf-8")

# Convert root-relative local references ("/assets/...", "/favicon.ico", etc.)
# to workspace-relative paths while preserving protocol URLs and fragment links.
content = re.sub(
    r'((?:src|href)=)(["\'])/(?!/|#|[a-zA-Z][a-zA-Z0-9+.-]*:)',
    r'\1\2./',
    content,
)

index_path.write_text(content, encoding="utf-8")
PY

# Inline everything into single HTML
echo "🎯 Inlining all assets into single HTML file..."
pnpm exec html-inline "${BUNDLE_WORK_DIR}/index.html" > bundle.html

# Get file size
FILE_SIZE=$(du -h bundle.html | cut -f1)

echo ""
echo "✅ Bundle complete!"
echo "📄 Output: bundle.html ($FILE_SIZE)"
echo ""
echo "You can now use this single HTML file as an artifact in Claude conversations."
echo "To test locally: open bundle.html in your browser"
