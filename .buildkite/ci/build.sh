#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(
  CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd
)"
readonly SCRIPT_DIR

# shellcheck source=.buildkite/ci/setup-env.sh
source "${SCRIPT_DIR}/setup-env.sh"

# `install` step ran in a separate job; node_modules may not be present here
# if the agent doesn't share state between steps. Re-install if missing.
NPM_INSTALL_FLAGS=(--no-audit --no-fund --prefer-offline)
if [[ ! -d node_modules ]]; then
  if [[ -f package-lock.json ]]; then
    JOBS=1 npm ci "${NPM_INSTALL_FLAGS[@]}"
  else
    JOBS=1 npm install "${NPM_INSTALL_FLAGS[@]}"
  fi
fi

# Cap V8 heap below the 1.5 GB agent RAM limit so a runaway bundler
# fails with "JS heap out of memory" instead of swap-thrashing the VM.
# The root build script runs workspaces sequentially.
NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=1024" \
  npm run build
