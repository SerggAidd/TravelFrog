#!/bin/bash
# Автоматический запуск backend при деплое
# Этот скрипт будет выполняться автоматически через systemd path watcher

PROJECT_DIR="/usr/share/nginx/html/apps/TravelFrog"
MAIN_DIR="$PROJECT_DIR/main"
BACKEND_DIR="$PROJECT_DIR/backend"
SETUP_SCRIPT="$MAIN_DIR/scripts/setup-backend.sh"

# Проверяем, что файлы задеплоены
if [ ! -f "$SETUP_SCRIPT" ]; then
    exit 0  # Файлы еще не задеплоены, выходим
fi

# Запускаем setup-backend.sh
if [ -x "$SETUP_SCRIPT" ]; then
    "$SETUP_SCRIPT"
elif [ -f "$SETUP_SCRIPT" ]; then
    chmod +x "$SETUP_SCRIPT"
    "$SETUP_SCRIPT"
fi

