# Настройка API для Production

## Проблема

Stub API (`stubs/api`) работает **только в dev режиме** через `brojs server`. В production при деплое на статический хостинг (Nginx) запросы к `/api/*` попадают на Nginx, который из-за `try_files` возвращает `index.html` вместо JSON.

Это вызывает ошибку: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

## Решения

### Вариант 1: Исключить API запросы из try_files (быстрое решение)

Добавьте в конфигурацию Nginx:

```nginx
location /apps/TravelFrog/main/ {
    alias /usr/share/nginx/html/apps/TravelFrog/main/;
    
    # Исключаем API запросы из try_files
    if ($uri ~ ^/api/) {
        return 404;
    }
    
    try_files $uri $uri/ /apps/TravelFrog/main/index.html;
}
```

**Результат:** API запросы будут возвращать 404, но приложение не будет падать с ошибкой парсинга JSON. Функции, требующие API, просто не будут работать.

### Вариант 2: Проксирование на отдельный backend сервер (рекомендуется)

Если у вас есть отдельный backend сервер:

```nginx
# Проксирование API запросов
location /api/ {
    proxy_pass http://localhost:3000;  # или другой порт вашего backend
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
- Отдельный backend сервер должен быть запущен
- Backend должен обрабатывать те же эндпоинты, что и stub API
- Backend должен быть доступен на том же домене или настроен CORS

### Вариант 3: Запустить stub API как отдельный сервис

Можно запустить stub API как отдельный Node.js сервис:

1. На сервере установите Node.js и зависимости
2. Запустите stub API:
   ```bash
   cd /path/to/TravelFrog/stubs/api
   npm install
   node index.js  # или используйте PM2 для production
   ```
3. Настройте Nginx для проксирования (см. Вариант 2)

### Вариант 4: Использовать mock данные на фронтенде

Можно добавить fallback на mock данные, если API недоступен. Но это не рекомендуется для production.

## Проверка

После настройки проверьте:

1. Запрос к `/api/cities` должен возвращать JSON или 404, но не HTML
2. В консоли браузера не должно быть ошибок `Unexpected token '<'`
3. Приложение должно работать (даже если некоторые функции не работают без API)

## Текущая ситуация

С текущей конфигурацией:
- ✅ SPA маршруты работают
- ✅ Статические ресурсы загружаются
- ❌ API запросы возвращают HTML вместо JSON
- ❌ TravelBot, Currency Widget и другие функции, требующие API, не работают

## Рекомендации

Для полноценной работы в production:
1. Настройте отдельный backend сервер
2. Или используйте Вариант 1 для предотвращения ошибок (но функции API не будут работать)

