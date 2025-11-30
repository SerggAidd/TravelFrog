#!/bin/bash
# Универсальный скрипт для установки автоматического запуска backend
# Выполняется ОДИН РАЗ на сервере (можно через SSH вручную или через первый деплой)

PROJECT_DIR="/usr/share/nginx/html/apps/TravelFrog"
MAIN_DIR="$PROJECT_DIR/main"
CHECK_SCRIPT="$PROJECT_DIR/scripts/check-and-start-backend.sh"
TIMER_NAME="travelfrog-backend-check"

echo "🔧 Установка автоматического запуска backend..."

# Создаем директорию для скриптов
mkdir -p "$PROJECT_DIR/scripts"

# Создаем скрипт проверки если его нет
if [ ! -f "$CHECK_SCRIPT" ]; then
    cat > "$CHECK_SCRIPT" <<'CHECK_EOF'
#!/bin/bash
PROJECT_DIR="/usr/share/nginx/html/apps/TravelFrog"
MAIN_DIR="$PROJECT_DIR/main"
SETUP_SCRIPT="$MAIN_DIR/scripts/setup-backend.sh"
SERVICE_NAME="travelfrog-api"

if [ ! -f "$SETUP_SCRIPT" ]; then
    exit 0
fi

if sudo systemctl is-active --quiet "${SERVICE_NAME}.service" 2>/dev/null; then
    exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔍 Backend не запущен, но файлы найдены. Запускаем setup..."
if [ -x "$SETUP_SCRIPT" ]; then
    "$SETUP_SCRIPT"
elif [ -f "$SETUP_SCRIPT" ]; then
    chmod +x "$SETUP_SCRIPT"
    "$SETUP_SCRIPT"
fi
CHECK_EOF
    chmod +x "$CHECK_SCRIPT"
fi

# Создаем systemd service
sudo tee "/etc/systemd/system/${TIMER_NAME}.service" > /dev/null <<TIMER_SERVICE_EOF
[Unit]
Description=TravelForge Backend Check Service
After=network.target

[Service]
Type=oneshot
ExecStart=$CHECK_SCRIPT
User=user
TIMER_SERVICE_EOF

# Создаем systemd timer
sudo tee "/etc/systemd/system/${TIMER_NAME}.timer" > /dev/null <<'TIMER_EOF'
[Unit]
Description=TravelForge Backend Check Timer
After=network.target

[Timer]
OnBootSec=1min
OnUnitActiveSec=2min

[Install]
WantedBy=timers.target
TIMER_EOF

# Включаем и запускаем timer
sudo systemctl daemon-reload
sudo systemctl enable "${TIMER_NAME}.timer"
sudo systemctl start "${TIMER_NAME}.timer"

echo "✅ Автоматический запуск backend установлен!"
echo "📊 Timer проверяет наличие backend каждые 2 минуты"
echo "🚀 Backend будет запускаться автоматически при деплое"

# Запускаем проверку сразу (на случай если файлы уже есть)
"$CHECK_SCRIPT"

