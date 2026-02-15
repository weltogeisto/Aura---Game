#!/usr/bin/env bash
set -euo pipefail

if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Run from aura-game/."
  exit 1
fi

VERSION=$(node -p "require('./package.json').version")
RELEASE_ROOT="../release/web"
TARGET_DIR="$RELEASE_ROOT/v$VERSION"

mkdir -p "$TARGET_DIR"
rm -rf "$TARGET_DIR/dist"
cp -R dist "$TARGET_DIR/dist"

if [ -f bundle.html ]; then
  cp bundle.html "$TARGET_DIR/bundle.html"
fi

mkdir -p "$RELEASE_ROOT/current"
rm -rf "$RELEASE_ROOT/current/dist"
cp -R dist "$RELEASE_ROOT/current/dist"

if [ -f bundle.html ]; then
  cp bundle.html "$RELEASE_ROOT/current/bundle.html"
fi

echo "✅ Staged web artifacts in $TARGET_DIR and $RELEASE_ROOT/current"
