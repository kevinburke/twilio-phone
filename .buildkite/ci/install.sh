#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(
  CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd
)"
readonly SCRIPT_DIR

# shellcheck source=.buildkite/ci/setup-env.sh
source "${SCRIPT_DIR}/setup-env.sh"

# --jobs=1 serializes node-gyp native compiles, which are the actual
# memory peaks during install. --no-audit/--no-fund skip the audit and
# funding passes; audit runs as its own pipeline step. --prefer-offline
# uses the agent's npm cache when present.
NPM_INSTALL_FLAGS=(--jobs=1 --no-audit --no-fund --prefer-offline)

if [[ -f package-lock.json ]]; then
  npm ci "${NPM_INSTALL_FLAGS[@]}"
else
  echo "package-lock.json missing; falling back to npm install" >&2
  npm install "${NPM_INSTALL_FLAGS[@]}"
fi
