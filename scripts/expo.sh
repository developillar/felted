#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Expo's supported shell-only settings location avoids an unwritable home.
export __UNSAFE_EXPO_HOME_DIRECTORY="${__UNSAFE_EXPO_HOME_DIRECTORY:-$PWD/.expo}"
export EXPO_NO_TELEMETRY=1
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$PWD/.cache}"
if [ "$(uname -s)" = Linux ] && [ -z "${DISPLAY:-}" ]; then
  # Keep Metro watching; omit the desktop debugger shell on headless machines.
  export EXPO_UNSTABLE_HEADLESS="${EXPO_UNSTABLE_HEADLESS:-1}"
fi
mkdir -p "$__UNSAFE_EXPO_HOME_DIRECTORY"
exec node node_modules/expo/bin/cli "$@"
