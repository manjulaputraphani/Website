#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/sdhhe-deploy.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/assets"
cp "$ROOT/index.html" "$ROOT/favicon.svg" "$ROOT/robots.txt" "$ROOT/sitemap.xml" "$ROOT/_headers" "$STAGE/"
cp -R "$ROOT/assets/." "$STAGE/assets/"

echo "Deploying the public website files from $ROOT"
npx --yes wrangler@4.86.0 pages deploy "$STAGE" \
  --project-name sdhhe \
  --branch main \
  --commit-dirty=true
