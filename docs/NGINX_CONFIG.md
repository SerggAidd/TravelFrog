# Конфигурация Nginx для TravelFrog

## Деплой в `/apps/TravelFrog/main/`

Для корректной работы SPA при деплое в поддиректорию `/apps/TravelFrog/main/` добавьте следующую конфигурацию в Nginx:

```nginx
location /apps/TravelFrog/main/ {
    alias /usr/share/nginx/html/apps/TravelFrog/main/;
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

