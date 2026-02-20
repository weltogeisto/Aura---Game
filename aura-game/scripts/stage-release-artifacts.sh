#!/usr/bin/env bash
set -euo pipefail

if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Run from aura-game/."
  exit 1
fi

VERSION=$(node -p "require('./package.json').version")
RELEASE_ROOT="../release/web"
TARGET_DIR="$RELEASE_ROOT/v$VERSION"
CURRENT_DIR="$RELEASE_ROOT/current"

mkdir -p "$TARGET_DIR"
rm -rf "$TARGET_DIR/dist"
cp -R dist "$TARGET_DIR/dist"

if [ -f bundle.html ]; then
  cp bundle.html "$TARGET_DIR/bundle.html"
fi

mkdir -p "$CURRENT_DIR"
rm -rf "$CURRENT_DIR/dist"
cp -R dist "$CURRENT_DIR/dist"

if [ -f bundle.html ]; then
  cp bundle.html "$CURRENT_DIR/bundle.html"
fi

(
  cd "$CURRENT_DIR"
  if [ -f bundle.html ]; then
    find dist -type f -print0 | sort -z | xargs -0 sha256sum > checksums.sha256
    sha256sum bundle.html >> checksums.sha256
  else
    find dist -type f -print0 | sort -z | xargs -0 sha256sum > checksums.sha256
  fi
)

echo "✅ Staged web artifacts in $TARGET_DIR and $CURRENT_DIR"
echo "✅ Wrote checksums file: $CURRENT_DIR/checksums.sha256"
