#!/usr/bin/env sh
set -eu

# Railway provides PORT. Serve static files from current directory.
PORT="${PORT:-3000}"

exec npx --yes serve@14.2.4 -s . -l "$PORT"

