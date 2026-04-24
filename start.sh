#!/usr/bin/env sh
set -eu

# Railway provides PORT. `serve` v14 expects endpoint format.
PORT="${PORT:-3000}"
LISTEN_ENDPOINT="tcp://0.0.0.0:${PORT}"

exec npx --yes serve@14.2.4 -s . -l "$LISTEN_ENDPOINT"

