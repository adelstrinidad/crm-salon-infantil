#!/usr/bin/env bash
# Rebuild + restart the dev server.
#
# Why this exists: proxy.ts (route protection) and the Prisma adapter config are
# NOT hot-reloaded — editing them leaves a stale server that still redirects or
# still queries the old schema. This clears the build cache, regenerates the
# Prisma client, and brings the server back up.
#
# Usage:
#   npm run dev:restart            # foreground (Ctrl+C stops it)
#   npm run dev:restart -- --bg    # background, logs to .next-dev.log
#   npm run dev:restart -- --stop  # just stop whatever is on the port
set -euo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-3000}"
LOG_FILE=".next-dev.log"
BACKGROUND=false
STOP_ONLY=false
KEEP_CACHE=false

for arg in "$@"; do
  case "$arg" in
    --bg)         BACKGROUND=true ;;
    --stop)       STOP_ONLY=true ;;
    --keep-cache) KEEP_CACHE=true ;;
    *) echo "Unknown option: $arg"; echo "Usage: npm run dev:restart -- [--bg] [--stop] [--keep-cache]"; exit 1 ;;
  esac
done

# ── Stop whatever holds the port ─────────────────────────────────────────────
pids="$(lsof -ti ":$PORT" 2>/dev/null || true)"
if [ -n "$pids" ]; then
  echo "→ Stopping process on :$PORT ($(echo "$pids" | tr '\n' ' '))"
  # SIGTERM first so Next flushes; escalate only if it ignores it.
  echo "$pids" | xargs kill 2>/dev/null || true
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    lsof -ti ":$PORT" >/dev/null 2>&1 || break
    sleep 0.5
  done
  if lsof -ti ":$PORT" >/dev/null 2>&1; then
    echo "  still up — sending SIGKILL"
    lsof -ti ":$PORT" | xargs kill -9 2>/dev/null || true
  fi
else
  echo "→ Nothing listening on :$PORT"
fi

if [ "$STOP_ONLY" = true ]; then
  echo "✓ Stopped."
  exit 0
fi

# ── Rebuild ──────────────────────────────────────────────────────────────────
if [ "$KEEP_CACHE" = false ]; then
  echo "→ Clearing .next build cache"
  # The dying server can still be writing into .next for a moment, which makes
  # rm fail with "Directory not empty". Retry instead of aborting the restart.
  for attempt in 1 2 3 4 5; do
    rm -rf .next 2>/dev/null && break
    [ "$attempt" = 5 ] && echo "  could not fully clear .next — continuing anyway"
    sleep 1
  done
fi

echo "→ Regenerating Prisma client"
npx prisma generate >/dev/null

# ── Start ────────────────────────────────────────────────────────────────────
if [ "$BACKGROUND" = true ]; then
  echo "→ Starting dev server in the background (log: $LOG_FILE)"
  nohup npm run dev > "$LOG_FILE" 2>&1 &
  for _ in $(seq 1 60); do
    if curl -sf -o /dev/null "http://localhost:$PORT/login"; then
      echo "✓ Ready on http://localhost:$PORT  —  tail -f $LOG_FILE"
      exit 0
    fi
    sleep 1
  done
  echo "✗ Server did not answer within 60s. Last lines of $LOG_FILE:"
  tail -20 "$LOG_FILE"
  exit 1
fi

echo "→ Starting dev server (Ctrl+C to stop)"
exec npm run dev
