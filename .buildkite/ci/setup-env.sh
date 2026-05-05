#!/usr/bin/env bash
set -euo pipefail

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  echo "source .buildkite/ci/setup-env.sh from another script" >&2
  exit 1
fi

if [[ -n "${DEV_PHONE_CI_ENV_READY:-}" ]]; then
  return 0
fi
export DEV_PHONE_CI_ENV_READY=1

SETUP_ENV_SCRIPT_DIR="$(
  CDPATH='' cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd
)"
readonly SETUP_ENV_SCRIPT_DIR
SETUP_ENV_REPO_ROOT="$(
  CDPATH='' cd -- "${SETUP_ENV_SCRIPT_DIR}/../.." && pwd
)"
readonly SETUP_ENV_REPO_ROOT

cd "${SETUP_ENV_REPO_ROOT}"

export TZ="${TZ:-UTC}"
export CI=1

# Keep caches outside the checkout so clean-checkout jobs do not trip over
# read-only files left behind by previous runs.
readonly DEFAULT_CI_CACHE_ROOT="${XDG_CACHE_HOME:-${HOME}/.cache}/dev-phone-buildkite"
export DEV_PHONE_CI_CACHE_ROOT="${DEV_PHONE_CI_CACHE_ROOT:-${DEFAULT_CI_CACHE_ROOT}}"

export npm_config_cache="${npm_config_cache:-${DEV_PHONE_CI_CACHE_ROOT}/npm}"
mkdir -p "${npm_config_cache}"

if command -v node >/dev/null 2>&1; then
  echo "Using node $(node --version) and npm $(npm --version)"
else
  echo "node is not installed on this agent" >&2
  exit 1
fi
