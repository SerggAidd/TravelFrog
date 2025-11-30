#!/bin/bash
# Скрипт для автоматической проверки и запуска backend
# Запускается через systemd timer каждые 2 минуты

PROJECT_DIR="/usr/share/nginx/html/apps/TravelFrog"
MAIN_DIR="$PROJECT_DIR/main"
BACKEND_DIR="$PROJECT_DIR/backend"
SETUP_SCRIPT="$MAIN_DIR/scripts/setup-backend.sh"
SERVICE_NAME="travelfrog-api"

# Проверяем, что файлы задеплоены
if [ ! -f "$SETUP_SCRIPT" ]; then
    exit 0  # Файлы еще не задеплоены
fi

# Проверяем, запущен ли backend
if sudo systemctl is-active --quiet "${SERVICE_NAME}.service" 2>/dev/null; then
    exit 0  # Backend уже запущен
fi

# Если backend не запущен, но файлы есть - запускаем setup
echo "🔍 Backend не запущен, но файлы найдены. Запускаем setup..."
if [ -x "$SETUP_SCRIPT" ]; then
    "$SETUP_SCRIPT"
elif [ -f "$SETUP_SCRIPT" ]; then
    chmod +x "$SETUP_SCRIPT"
    "$SETUP_SCRIPT"
fi

