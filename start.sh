#!/usr/bin/env sh
set -eu

# Railway provides PORT. Run simple static server.
exec npx --yes http-server . -p "${PORT:-3000}" -a 0.0.0.0

