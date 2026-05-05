#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(
  CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd
)"
readonly SCRIPT_DIR

# shellcheck source=.buildkite/ci/setup-env.sh
source "${SCRIPT_DIR}/setup-env.sh"

NPM_INSTALL_FLAGS=(--no-audit --no-fund --prefer-offline)
if [[ ! -d node_modules ]]; then
  if [[ -f package-lock.json ]]; then
    JOBS=1 npm ci "${NPM_INSTALL_FLAGS[@]}"
  else
    JOBS=1 npm install "${NPM_INSTALL_FLAGS[@]}"
  fi
fi

# Tests require the build output (tests `require()` the compiled dist/).
if [[ ! -d packages/plugin-dev-phone/dist ]] || [[ ! -d packages/dev-phone-ui/dist ]]; then
  NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=1024" \
    npm run build
fi

# Cap V8 heap on the mocha runner too; coverage instrumentation can
# push memory up unpredictably on agents with limited RAM.
NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=1024" \
  npm test --workspace=@twilio-labs/plugin-dev-phone
