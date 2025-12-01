#!/usr/bin/env bash
set -euo pipefail

SERVICE="travelfrog-backend"
SERVICE_FILE="/etc/systemd/system/${SERVICE}.service"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[install] Installing $SERVICE service to $SERVICE_FILE"
sudo install -Dm644 "$SCRIPT_DIR/backend.service" "$SERVICE_FILE"
sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE"
sudo systemctl restart "$SERVICE"
sudo systemctl status "$SERVICE" --no-pager

