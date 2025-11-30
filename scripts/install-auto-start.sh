#!/bin/bash
# Скрипт для установки автоматического запуска backend
# Выполняется один раз на сервере (можно через SSH вручную или через первый деплой)

PROJECT_DIR="/usr/share/nginx/html/apps/TravelFrog"
MAIN_DIR="$PROJECT_DIR/main"
AUTO_START_SCRIPT="$PROJECT_DIR/scripts/auto-start-backend.sh"
SERVICE_NAME="travelfrog-backend-auto"

echo "🔧 Установка автоматического запуска backend..."

# Создаем директорию для скриптов
mkdir -p "$PROJECT_DIR/scripts"

# Копируем скрипт автоматического запуска
if [ -f "$MAIN_DIR/scripts/auto-start-backend.sh" ]; then
    cp "$MAIN_DIR/scripts/auto-start-backend.sh" "$AUTO_START_SCRIPT"
    chmod +x "$AUTO_START_SCRIPT"
elif [ -f "scripts/auto-start-backend.sh" ]; then
    cp "scripts/auto-start-backend.sh" "$AUTO_START_SCRIPT"
    chmod +x "$AUTO_START_SCRIPT"
fi

# Создаем systemd path unit для отслеживания изменений
sudo tee "/etc/systemd/system/${SERVICE_NAME}.path" > /dev/null <<EOF
[Unit]
Description=TravelForge Backend Auto-Start Path
After=network.target

[Path]
PathChanged=$MAIN_DIR/scripts/setup-backend.sh
Unit=${SERVICE_NAME}.service

[Install]
WantedBy=multi-user.target
EOF

# Создаем systemd service для запуска backend
sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" > /dev/null <<EOF
[Unit]
Description=TravelForge Backend Auto-Start Service
After=network.target

[Service]
Type=oneshot
ExecStart=$AUTO_START_SCRIPT
User=user
EOF

# Включаем и запускаем path watcher
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}.path"
sudo systemctl start "${SERVICE_NAME}.path"

echo "✅ Автоматический запуск backend настроен!"
echo "📝 Backend будет запускаться автоматически при каждом деплое"

