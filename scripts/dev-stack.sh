#!/usr/bin/env bash
# Start Postgres (Docker), run migrations, Nest API, and Vite for local testing.
# Stops anything already listening on API (3000) and Vite (5173) first.
#
# Usage (from repo root):
#   npm run dev:stack
#   bash scripts/dev-stack.sh
#
# Requires: Docker, Node/npm, apps/api/.env (copy from .env.example)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$ROOT/apps/api"

kill_port() {
  local port=$1
  local label=$2
  local pids
  pids=$(lsof -ti TCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "[dev-stack] Stopping process(es) on port $port ($label): $pids"
    kill -9 $pids 2>/dev/null || true
    sleep 0.3
  fi
}

cleanup() {
  echo ""
  echo "[dev-stack] Stopping API and Vite (ports 3000, 5173)..."
  kill_port 3000 "API"
  kill_port 5173 "Vite"
}

trap cleanup INT TERM

echo "[dev-stack] Ensuring ports 3000 (API) and 5173 (Vite) are free..."
kill_port 3000 "API"
kill_port 5173 "Vite"

if [ ! -f "$API_DIR/.env" ]; then
  echo "[dev-stack] ERROR: Missing $API_DIR/.env — copy apps/api/.env.example to apps/api/.env"
  exit 1
fi

cd "$API_DIR"

echo "[dev-stack] Starting PostgreSQL (docker compose)..."
if docker compose up -d --wait 2>/dev/null; then
  :
else
  docker compose up -d
  echo "[dev-stack] Waiting for Postgres (no --wait support or health pending)..."
  sleep 5
fi

echo "[dev-stack] Running database migrations..."
npm run migration:run

echo "[dev-stack] Starting Nest API in background (port 3000)..."
npm run start:dev &
API_JOB=$!

echo "[dev-stack] Waiting for API to listen on :3000..."
ready=0
for _ in $(seq 1 90); do
  if lsof -ti TCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
    ready=1
    break
  fi
  if ! kill -0 "$API_JOB" 2>/dev/null; then
    echo "[dev-stack] ERROR: Nest process exited before binding to port 3000"
    wait "$API_JOB" || true
    exit 1
  fi
  sleep 1
done

if [ "$ready" -ne 1 ]; then
  echo "[dev-stack] ERROR: API did not become ready on port 3000 in time"
  cleanup
  kill "$API_JOB" 2>/dev/null || true
  wait "$API_JOB" 2>/dev/null || true
  exit 1
fi

cd "$ROOT"
echo "[dev-stack] Starting Vite (port 5173). Press Ctrl+C to stop API + Vite."
echo "[dev-stack] App: http://localhost:5173  |  API docs: http://localhost:3000/api/docs"
LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [ -z "$LAN_IP" ]; then
  LAN_IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi
if [ -n "$LAN_IP" ]; then
  echo "[dev-stack] Same Wi‑Fi (phone/tablet): http://${LAN_IP}:5173"
  echo "[dev-stack] On the device, add repo-root .env.local: VITE_API_URL=http://${LAN_IP}:3000/api (then restart Vite)"
else
  echo "[dev-stack] Same Wi‑Fi: run ipconfig getifaddr en0 (or en1) to find your LAN IP for http://<ip>:5173"
fi
echo "[dev-stack] Postgres container left running; stop with: cd apps/api && docker compose down"
echo ""

npm run dev
EXIT_CODE=$?

cleanup
if kill -0 "$API_JOB" 2>/dev/null; then
  kill "$API_JOB" 2>/dev/null || true
  wait "$API_JOB" 2>/dev/null || true
fi

exit "$EXIT_CODE"
