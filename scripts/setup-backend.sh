#!/bin/bash
# Скрипт для настройки backend на сервере
# Выполняется на сервере после деплоя через SSH

set -e

PROJECT_DIR="/usr/share/nginx/html/apps/TravelFrog"
BACKEND_DIR="$PROJECT_DIR/backend"
SERVICE_NAME="travelfrog-api"
SOURCE_DIR="$PROJECT_DIR/main"  # Файлы задеплоены в main

echo "🚀 Настройка TravelForge Backend API..."

# Проверяем, что мы в правильной директории
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Директория проекта не найдена: $PROJECT_DIR"
    exit 1
fi

# Создаем директорию для backend
mkdir -p "$BACKEND_DIR"

# Ищем исходные файлы - они могут быть в разных местах
# Вариант 1: в main/stubs и main/scripts (если задеплоены через Jenkins из dist)
if [ -d "$SOURCE_DIR/stubs" ]; then
    echo "📦 Копирование файлов из $SOURCE_DIR/stubs..."
    cp -r "$SOURCE_DIR/stubs/api"/* "$BACKEND_DIR/" 2>/dev/null || true
    cp -r "$SOURCE_DIR/stubs/data" "$BACKEND_DIR/" 2>/dev/null || true
    cp "$SOURCE_DIR/.env" "$BACKEND_DIR/" 2>/dev/null || echo "⚠️  .env не найден в $SOURCE_DIR"
    if [ -f "$SOURCE_DIR/scripts/backend.service" ]; then
        cp "$SOURCE_DIR/scripts/backend.service" "$BACKEND_DIR/"
    fi
# Вариант 2: в корне проекта (если есть git репозиторий или файлы скопированы)
elif [ -d "$PROJECT_DIR/stubs" ]; then
    echo "📦 Копирование файлов из $PROJECT_DIR/stubs..."
    cp -r "$PROJECT_DIR/stubs/api"/* "$BACKEND_DIR/"
    cp -r "$PROJECT_DIR/stubs/data" "$BACKEND_DIR/"
    cp "$PROJECT_DIR/.env" "$BACKEND_DIR/" 2>/dev/null || echo "⚠️  .env не найден"
    if [ -f "$PROJECT_DIR/scripts/backend.service" ]; then
        cp "$PROJECT_DIR/scripts/backend.service" "$BACKEND_DIR/"
    fi
else
    echo "❌ Не найдены исходные файлы backend"
    echo "   Искали в: $SOURCE_DIR/stubs и $PROJECT_DIR/stubs"
    echo "   Текущая директория: $(pwd)"
    echo "   Содержимое $PROJECT_DIR:"
    ls -la "$PROJECT_DIR" || true
    echo "   Содержимое $SOURCE_DIR:"
    ls -la "$SOURCE_DIR" || true
    exit 1
fi

# Создаем package.json для backend если его нет
if [ ! -f "$BACKEND_DIR/package.json" ]; then
    echo "📝 Создание package.json для backend..."
    cat > "$BACKEND_DIR/package.json" <<EOF
{
  "name": "travelfrog-api",
  "version": "0.1.0",
  "type": "commonjs",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "axios": "^1.7.7"
  }
}
EOF
fi

# Устанавливаем зависимости
echo "📥 Установка зависимостей..."
cd "$BACKEND_DIR"
npm install --production --silent 2>&1 | grep -v "npm WARN" || true

# Создаем .env если его нет (с базовыми настройками)
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "📝 Создание .env файла с базовыми настройками..."
    cat > "$BACKEND_DIR/.env" <<EOF
# Backend настройки
API_PORT=3000
API_HOST=0.0.0.0
NODE_ENV=production

# GigaChat (настройте вручную)
# GIGACHAT_CLIENT_ID=your_client_id
# GIGACHAT_SECRET=your_secret
EOF
    echo "⚠️  .env создан с базовыми настройками. Настройте GigaChat credentials вручную!"
fi

# Создаем systemd service
if [ -f "$BACKEND_DIR/backend.service" ]; then
    echo "📝 Копирование systemd service из проекта..."
    sudo cp "$BACKEND_DIR/backend.service" "/etc/systemd/system/${SERVICE_NAME}.service"
elif [ ! -f "/etc/systemd/system/${SERVICE_NAME}.service" ]; then
    echo "📝 Создание systemd service..."
    sudo tee "/etc/systemd/system/${SERVICE_NAME}.service" > /dev/null <<EOF
[Unit]
Description=TravelForge API Server
After=network.target

[Service]
Type=simple
User=user
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
fi

# Обновляем systemd
sudo systemctl daemon-reload

# Включаем сервис (если еще не включен)
if ! sudo systemctl is-enabled --quiet "${SERVICE_NAME}.service" 2>/dev/null; then
    echo "🔧 Включение сервиса..."
    sudo systemctl enable "${SERVICE_NAME}.service"
fi

# Перезапускаем сервис
echo "🔄 Перезапуск сервиса..."
sudo systemctl restart "${SERVICE_NAME}.service"

# Проверяем статус
sleep 3
if sudo systemctl is-active --quiet "${SERVICE_NAME}.service"; then
    echo "✅ Backend сервер успешно запущен!"
    echo "📊 Статус:"
    sudo systemctl status "${SERVICE_NAME}.service" --no-pager -l | head -n 5
    echo ""
    echo "🔗 API доступен на http://localhost:3000/api"
    echo "💚 Health check: http://localhost:3000/health"
else
    echo "❌ Ошибка запуска сервера"
    echo "📋 Логи:"
    sudo journalctl -u "${SERVICE_NAME}.service" -n 20 --no-pager
    exit 1
fi

echo "🎉 Backend настроен и запущен!"

