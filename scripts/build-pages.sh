#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export FELTED_WEB_BASE_PATH="${FELTED_WEB_BASE_PATH:-/felted}"
bash scripts/expo.sh export --platform web --output-dir dist-pages "$@"
# GitHub Pages must serve Expo's _expo directory without Jekyll processing.
touch dist-pages/.nojekyll
