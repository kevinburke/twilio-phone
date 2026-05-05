#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(
  CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd
)"
readonly SCRIPT_DIR

# shellcheck source=.buildkite/ci/setup-env.sh
source "${SCRIPT_DIR}/setup-env.sh"

# --no-audit/--no-fund skip the audit and funding passes (audit runs as
# its own pipeline step). --prefer-offline uses the agent's npm cache
# when present. JOBS=1 is read by node-gyp's underlying make to
# serialize native compiles, which are the actual memory peaks during
# install.
NPM_INSTALL_FLAGS=(--no-audit --no-fund --prefer-offline)

if [[ -f package-lock.json ]]; then
  JOBS=1 npm ci "${NPM_INSTALL_FLAGS[@]}"
else
  echo "package-lock.json missing; falling back to npm install" >&2
  JOBS=1 npm install "${NPM_INSTALL_FLAGS[@]}"
fi
