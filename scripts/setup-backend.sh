#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/usr/share/nginx/html/apps/TravelFrog/main}"
API_DIR="$APP_ROOT/stubs/api"

echo "[setup] Installing stub API dependencies"
cd "$API_DIR"
npm install --production

echo "[setup] Restarting travelfrog-backend service"
systemctl restart travelfrog-backend || true
systemctl status travelfrog-backend --no-pager || true

