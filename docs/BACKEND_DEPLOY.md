# Деплой Backend API сервера

## Обзор

Backend API сервер запускается как отдельный Express сервер на порту 3000 (по умолчанию) и обслуживает все запросы к `/api/*`.

## Структура

- `stubs/api/server.js` - standalone Express сервер для production
- `stubs/api/index.js` - роутер с API эндпоинтами
- `stubs/api/gigachat.js` - сервис GigaChat
- `stubs/data/` - JSON данные (cities, currencies, users)

## Быстрый старт (локально)

```bash
# Установить зависимости
npm install

# Запустить backend сервер
npm run api:start

# Или в dev режиме
npm run api:dev
```

Сервер запустится на `http://localhost:3000`

## Деплой через Jenkins

### Вариант 1: Автоматический деплой через скрипт

Добавьте в Jenkins pipeline после деплоя фронтенда:

```groovy
stage('Deploy Backend') {
    steps {
        sh '''
            chmod +x scripts/deploy-backend.sh
            ./scripts/deploy-backend.sh
        '''
    }
}
```

### Вариант 2: Ручной деплой

1. **Скопируйте файлы на сервер:**

```bash
# На сервере
mkdir -p /usr/share/nginx/html/apps/TravelFrog/backend
cd /usr/share/nginx/html/apps/TravelFrog/backend

# Скопируйте файлы:
# - stubs/api/* → backend/
# - stubs/data/ → backend/data/
# - .env → backend/.env
```

2. **Установите зависимости:**

```bash
cd /usr/share/nginx/html/apps/TravelFrog/backend
npm install --production
```

3. **Создайте systemd service:**

```bash
sudo cp scripts/backend.service /etc/systemd/system/travelfrog-api.service
sudo systemctl daemon-reload
sudo systemctl enable travelfrog-api.service
sudo systemctl start travelfrog-api.service
```

4. **Проверьте статус:**

```bash
sudo systemctl status travelfrog-api.service
sudo journalctl -u travelfrog-api.service -f
```

## Настройка Nginx

Добавьте проксирование API запросов в конфигурацию Nginx:

```nginx
# Проксирование API запросов на backend сервер
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Таймауты для долгих запросов (GigaChat может занимать время)
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Основной location для SPA
location /apps/TravelFrog/main/ {
    alias /usr/share/nginx/html/apps/TravelFrog/main/;
    try_files $uri $uri/ /apps/TravelFrog/main/index.html;
}
```

После изменения конфигурации:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Переменные окружения

Создайте файл `.env` в директории backend:

```bash
# Backend настройки
API_PORT=3000
API_HOST=0.0.0.0
NODE_ENV=production

# GigaChat (если используется)
GIGACHAT_CLIENT_ID=019ad692-c51b-7e19-8294-bed25b837281
GIGACHAT_SECRET=MDE5YWQ2OTItYzUxYi03ZTE5LTgyOTQtYmVkMjViODM3MjgxOmYzMjg2ZTg3LTNlOWYtNDY3MC1hMWJjLTgxNDdlM2M3ZDU0YQ==
GIGACHAT_SCOPE=GIGACHAT_API_PERS
GIGACHAT_MODEL=GigaChat
GIGACHAT_TIMEOUT=60
GIGACHAT_TLS_VERIFY=0
```

## Управление сервисом

```bash
# Статус
sudo systemctl status travelfrog-api.service

# Запуск
sudo systemctl start travelfrog-api.service

# Остановка
sudo systemctl stop travelfrog-api.service

# Перезапуск
sudo systemctl restart travelfrog-api.service

# Логи
sudo journalctl -u travelfrog-api.service -f
sudo journalctl -u travelfrog-api.service -n 100
```

## Проверка работы

1. **Health check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **API endpoint:**
   ```bash
   curl http://localhost:3000/api/cities
   ```

3. **Через Nginx:**
   ```bash
   curl https://your-domain.com/api/health
   ```

## Troubleshooting

### Сервер не запускается

1. Проверьте логи:
   ```bash
   sudo journalctl -u travelfrog-api.service -n 50
   ```

2. Проверьте права доступа:
   ```bash
   ls -la /usr/share/nginx/html/apps/TravelFrog/backend/
   ```

3. Проверьте переменные окружения:
   ```bash
   cat /usr/share/nginx/html/apps/TravelFrog/backend/.env
   ```

### Порт уже занят

Измените порт в `.env`:
```bash
API_PORT=3001
```

И обновите Nginx конфигурацию:
```nginx
proxy_pass http://localhost:3001;
```

### GigaChat не работает

1. Проверьте переменные окружения в `.env`
2. Проверьте логи сервера на ошибки GigaChat
3. Убедитесь, что сервер имеет доступ к интернету

### Nginx возвращает 502

1. Проверьте, что backend сервер запущен:
   ```bash
   sudo systemctl status travelfrog-api.service
   ```

2. Проверьте, что порт правильный в Nginx конфигурации

3. Проверьте логи Nginx:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

## Обновление backend

При обновлении кода:

```bash
# На сервере
cd /usr/share/nginx/html/apps/TravelFrog/backend
git pull  # или скопируйте новые файлы
npm install --production
sudo systemctl restart travelfrog-api.service
```

## Мониторинг

Для мониторинга можно использовать:

- `systemctl status` - статус сервиса
- `journalctl` - логи
- Health check endpoint: `/health`
- Nginx access/error logs

## Безопасность

- ✅ Backend работает только на localhost (0.0.0.0 внутри, но доступен только через Nginx)
- ✅ Nginx проксирует запросы с правильными заголовками
- ✅ .env файл с credentials не должен быть доступен через веб-сервер
- ⚠️ Убедитесь, что файрвол блокирует прямой доступ к порту 3000 извне

