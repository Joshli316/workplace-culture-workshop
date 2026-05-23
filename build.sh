#!/usr/bin/env bash
# Build a curated dist/ for `wrangler pages deploy`. Keeps tests/, docs, configs,
# and the .wrangler cache off the production deploy. Run before `wrangler pages deploy dist`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST="$ROOT/dist"

rm -rf "$DIST"
mkdir -p "$DIST"

# Page entrypoints
cp "$ROOT/index.html"       "$DIST/"
cp "$ROOT/resources.html"   "$DIST/"
cp "$ROOT/404.html"         "$DIST/"

# CSS
cp "$ROOT/styles.css"       "$DIST/"
cp "$ROOT/print.css"        "$DIST/"

# JS
cp "$ROOT/app.js"           "$DIST/"
cp "$ROOT/resources.js"     "$DIST/"
cp "$ROOT/notfound.js"      "$DIST/"
cp "$ROOT/qrcode.min.js"    "$DIST/"
cp "$ROOT/sw.js"            "$DIST/"

# Static assets + CF Pages config
cp "$ROOT/og.png"           "$DIST/"
cp "$ROOT/apple-touch-icon.png" "$DIST/"
cp "$ROOT/robots.txt"       "$DIST/"
cp "$ROOT/sitemap.xml"      "$DIST/"
cp "$ROOT/_headers"         "$DIST/"

echo "dist/ contents:"
ls -la "$DIST"
