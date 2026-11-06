#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/sdhhe-deploy.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/assets" "$STAGE/functions"
cp "$ROOT/index.html" "$ROOT/chamundi.js" "$ROOT/chamundi.css" "$ROOT/favicon.svg" "$ROOT/robots.txt" "$ROOT/sitemap.xml" "$ROOT/_headers" "$STAGE/"
cp -R "$ROOT/assets/." "$STAGE/assets/"
cp -R "$ROOT/functions/." "$STAGE/functions/"

echo "Deploying the site, Chamundi widget and Functions from $ROOT"
npx --yes wrangler@4.86.0 pages deploy "$STAGE" \
  --project-name sdhhe \
  --branch main \
  --commit-dirty=true
