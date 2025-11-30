# Конфигурация Nginx для TravelFrog

## Деплой в `/apps/TravelFrog/main/`

Для корректной работы SPA при деплое в поддиректорию `/apps/TravelFrog/main/` добавьте следующую конфигурацию в Nginx:

```nginx
# Проксирование API запросов (если есть отдельный backend сервер)
location /api/ {
    # Если есть отдельный backend сервер, раскомментируйте и настройте:
    # proxy_pass http://localhost:3000;
    # proxy_set_header Host $host;
    # proxy_set_header X-Real-IP $remote_addr;
    # proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # Если backend нет, возвращаем 404 для API запросов
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
    
    # Кеширование статических ресурсов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Отключаем кеширование для HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

**Важно:** Stub API работает только в dev режиме. В production нужен отдельный backend сервер или настройте проксирование API запросов.

**Если backend нет:** Приложение будет работать, но функции, требующие API (TravelBot, курсы валют, сохранение поездок), будут показывать fallback сообщения вместо ошибок.

## Альтернативная конфигурация (если приложение в корне `/apps/TravelFrog/main/`)

Если приложение должно быть доступно по пути `/apps/TravelFrog/main/`, но файлы лежат в `/usr/share/nginx/html/apps/TravelFrog/main/`:

```nginx
location /apps/TravelFrog/main {
    alias /usr/share/nginx/html/apps/TravelFrog/main;
    index index.html;
    try_files $uri $uri/ /apps/TravelFrog/main/index.html;
}
```

## Важные моменты

1. **`try_files`** - критически важно для SPA. Все запросы, которые не находят файл, должны перенаправляться на `index.html`
2. **`alias`** - указывает на физический путь к файлам приложения
3. **Кеширование** - статические ресурсы (JS, CSS, изображения) кешируются на год, HTML - не кешируется

## Проверка после настройки

После настройки Nginx проверьте:

1. ✅ `https://your-domain.com/apps/TravelFrog/main/` - открывается главная страница
2. ✅ `https://your-domain.com/apps/TravelFrog/main/explore` - открывается страница Explore (не 404)
3. ✅ Обновление страницы на любом маршруте работает
4. ✅ Статические ресурсы (JS, CSS) загружаются корректно

## Перезагрузка Nginx

После изменения конфигурации:

```bash
sudo nginx -t  # Проверка конфигурации
sudo systemctl reload nginx  # Перезагрузка без простоя
```

