#!/usr/bin/env bash
set -euo pipefail

SERVICE="travelfrog-backend"

echo "[watcher] Checking $SERVICE"
if systemctl is-active --quiet "$SERVICE"; then
  echo "[watcher] Service already running"
  exit 0
fi

echo "[watcher] Starting $SERVICE"
systemctl start "$SERVICE"
systemctl status "$SERVICE" --no-pager

