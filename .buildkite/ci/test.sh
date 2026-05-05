#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(
  CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd
)"
readonly SCRIPT_DIR

# shellcheck source=.buildkite/ci/setup-env.sh
source "${SCRIPT_DIR}/setup-env.sh"

if [[ ! -d node_modules ]]; then
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
fi

# Tests require the build output (tests `require()` the compiled dist/).
if [[ ! -d packages/plugin-dev-phone/dist ]] || [[ ! -d packages/dev-phone-ui/dist ]]; then
  npm run build
fi

npm test --workspace=@twilio-labs/plugin-dev-phone
