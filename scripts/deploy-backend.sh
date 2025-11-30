#!/bin/bash
# Скрипт для деплоя backend сервера на production

set -e

PROJECT_DIR="/usr/share/nginx/html/apps/TravelFrog"
BACKEND_DIR="$PROJECT_DIR/backend"
SERVICE_NAME="travelfrog-api"
USER="user"  # Измените на вашего пользователя

echo "🚀 Деплой TravelForge Backend API..."

# Создаем директорию для backend
mkdir -p "$BACKEND_DIR"

# Копируем необходимые файлы
echo "📦 Копирование файлов..."
cp -r stubs/api/* "$BACKEND_DIR/"
cp -r stubs/data "$BACKEND_DIR/"
cp .env "$BACKEND_DIR/" 2>/dev/null || echo "⚠️  .env файл не найден, создайте его вручную"

# Устанавливаем зависимости (если нужно)
if [ -f "$BACKEND_DIR/package.json" ]; then
    echo "📥 Установка зависимостей..."
    cd "$BACKEND_DIR"
    npm install --production --silent
fi

# Создаем systemd service (если еще не создан)
if [ ! -f "/etc/systemd/system/${SERVICE_NAME}.service" ]; then
    echo "📝 Создание systemd service..."
    sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" > /dev/null <<EOF
[Unit]
Description=TravelForge API Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment=NODE_ENV=production
EnvironmentFile=$BACKEND_DIR/.env
ExecStart=/usr/bin/node $BACKEND_DIR/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable "${SERVICE_NAME}.service"
    echo "✅ Systemd service создан и включен"
fi

# Перезапускаем сервис
echo "🔄 Перезапуск сервиса..."
sudo systemctl restart "${SERVICE_NAME}.service"

# Проверяем статус
sleep 2
if sudo systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    echo "✅ Backend сервер успешно запущен!"
    echo "📊 Статус: $(sudo systemctl status ${SERVICE_NAME}.service --no-pager -l | head -n 3)"
else
    echo "❌ Ошибка запуска сервера. Проверьте логи:"
    echo "   sudo journalctl -u ${SERVICE_NAME}.service -n 50"
    exit 1
fi

echo "🎉 Деплой завершен!"
echo "🔗 API доступен на http://localhost:3000/api"
echo "💚 Health check: http://localhost:3000/health"

