#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f dist-pages/index.html ] || [ ! -f dist-pages/.nojekyll ]; then
  echo 'Run npm run build:pages first.' >&2
  exit 1
fi

# Stage only generated web files; leave the source checkout and branch alone.
pages_origin="$(git remote get-url origin)"
pages_revision="$(git rev-parse --short HEAD)"
pages_staging="$(mktemp -d "${TMPDIR:-/tmp}/felted-pages.XXXXXX")"
trap 'rm -rf "$pages_staging"' EXIT
git init --quiet --initial-branch=gh-pages "$pages_staging"
git -C "$pages_staging" config user.name "$(git config user.name)"
git -C "$pages_staging" config user.email "$(git config user.email)"
git -C "$pages_staging" remote add origin "$pages_origin"
pages_remote="$(git -C "$pages_staging" ls-remote --heads origin refs/heads/gh-pages)"
if [ -n "$pages_remote" ]; then
  git -C "$pages_staging" fetch --quiet --depth=1 origin gh-pages
  git -C "$pages_staging" checkout --quiet -B gh-pages FETCH_HEAD
  git -C "$pages_staging" rm --quiet -r --ignore-unmatch .
fi
cp -a dist-pages/. "$pages_staging/"
git -C "$pages_staging" add --all
if git -C "$pages_staging" diff --cached --quiet; then
  echo 'The gh-pages build is already up to date.'
  exit 0
fi
git -C "$pages_staging" commit --quiet -m "Publish Felted web ($pages_revision)"
# A normal push preserves history and rejects concurrent branch updates.
git -C "$pages_staging" push origin HEAD:refs/heads/gh-pages
