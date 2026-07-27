#!/usr/bin/env bash
# Wrapper that forces .env values to take precedence over any inherited
# shell environment variables (notably DATABASE_URL, which can leak in
# from a parent process pointing at a stale SQLite file: URL).
#
# Usage: bash scripts/with-env.sh <command> [args...]
#   e.g.  bash scripts/with-env.sh next dev -p 3000
#         bash scripts/with-env.sh prisma db push

set -e

# Resolve project root from script location (works from any cwd).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "scripts/with-env.sh: .env not found at $ENV_FILE" >&2
  exit 1
fi

# Unset the known database env var that may have leaked from the parent shell.
# This lets the value from .env win.
unset DATABASE_URL
unset SHADOW_DATABASE_URL

# Source .env in export mode so all variables become available to child processes.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

# Execute the wrapped command.
exec "$@"
