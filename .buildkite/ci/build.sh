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

# Cap V8 heap so a runaway bundler fails with "JS heap out of memory"
# instead of swap-thrashing the agent VM. Run turbo with concurrency=1
# so workspaces build sequentially, halving peak working set.
NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=2048" \
  npm run build -- --concurrency=1
