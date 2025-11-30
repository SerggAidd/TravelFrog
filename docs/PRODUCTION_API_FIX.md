# Исправление ошибки "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

## Проблема

После деплоя в production возникают ошибки:
- `Travel bot init error SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- `Cannot load rates SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Причина:** Запросы к `/api/*` попадают на Nginx, который из-за `try_files` возвращает `index.html` вместо JSON. Stub API работает только в dev режиме через `brojs server`.

## Быстрое решение (уже применено в коде)

Код уже обновлен с fallback обработкой ошибок:
- TravelBot покажет fallback сообщение вместо ошибки
- Currency widget просто не покажет курсы
- Приложение не будет падать с ошибками

## Полное решение: Деплой Backend сервера (рекомендуется)

**Лучший вариант:** Запустите backend сервер на том же сервере через Jenkins.

### Шаг 1: Добавьте деплой backend в Jenkins pipeline

Добавьте stage после деплоя фронтенда:

```groovy
stage('Deploy Backend') {
    steps {
        sh '''
            # Копируем backend файлы
            mkdir -p /usr/share/nginx/html/apps/TravelFrog/backend
            cp -r stubs/api/* /usr/share/nginx/html/apps/TravelFrog/backend/
            cp -r stubs/data /usr/share/nginx/html/apps/TravelFrog/backend/
            cp .env /usr/share/nginx/html/apps/TravelFrog/backend/ || true
            
            # Устанавливаем зависимости
            cd /usr/share/nginx/html/apps/TravelFrog/backend
            npm install --production --silent
            
            # Создаем/обновляем systemd service
            sudo cp scripts/backend.service /etc/systemd/system/travelfrog-api.service
            sudo systemctl daemon-reload
            sudo systemctl restart travelfrog-api.service
        '''
    }
}
```

### Шаг 2: Настройте Nginx

Добавьте в конфигурацию Nginx:

```nginx
# Проксирование API запросов на backend
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Таймауты для долгих запросов (GigaChat)
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

После этого:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Подробная инструкция:** См. `docs/BACKEND_DEPLOY.md`

## Альтернативное решение: Настройка Nginx без backend

Добавьте в конфигурацию Nginx на сервере:

```nginx
# Исключаем API запросы из try_files
location /api/ {
    return 404;
}

# Основной location для SPA
location /apps/TravelFrog/main/ {
    alias /usr/share/nginx/html/apps/TravelFrog/main/;
    
    # НЕ перенаправляем API запросы на index.html
    if ($uri ~ ^/api/) {
        return 404;
    }
    
    try_files $uri $uri/ /apps/TravelFrog/main/index.html;
}
```

После изменения конфигурации:

```bash
sudo nginx -t  # Проверка конфигурации
sudo systemctl reload nginx  # Перезагрузка
```

## Альтернатива: Настройка отдельного backend сервера

Если у вас есть отдельный backend сервер (например, на порту 3000):

```nginx
# Проксирование API запросов на backend
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Основной location для SPA
location /apps/TravelFrog/main/ {
    alias /usr/share/nginx/html/apps/TravelFrog/main/;
    try_files $uri $uri/ /apps/TravelFrog/main/index.html;
}
```

**Требования:**
- Backend сервер должен быть запущен
- Backend должен обрабатывать те же эндпоинты, что и stub API (`/api/cities`, `/api/travelbot/init`, и т.д.)

## Проверка

После настройки:

1. Откройте DevTools → Network
2. Проверьте запросы к `/api/*`:
   - Должны возвращать 404 (если backend нет) или JSON (если backend есть)
   - НЕ должны возвращать HTML (`index.html`)
3. Приложение должно работать без ошибок в консоли
4. TravelBot и Currency widget будут показывать fallback сообщения, если API недоступен

## Текущее состояние

После обновления кода:
- ✅ Приложение не падает с ошибками
- ✅ TravelBot показывает fallback сообщение
- ✅ Currency widget работает без курсов
- ⚠️ Для полной функциональности нужен backend или настройка Nginx

