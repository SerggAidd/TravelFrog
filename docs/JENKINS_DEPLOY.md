# Деплой через Jenkins

## Процесс деплоя

Проект деплоится через Jenkins pipeline в директорию `/usr/share/nginx/html/apps/TravelFrog/main/`.

### Этапы деплоя:

1. **Сборка** (`npm run build:prod`)
   - Создает `dist/` с файлами: `index.js`, `index.js.LICENSE.txt`, `remote-assets/`
   - Файлы копируются в `main/` директорию

2. **Деплой**
   - Файлы загружаются через SSH на сервер
   - Путь на сервере: `/usr/share/nginx/html/apps/TravelFrog/main/`
   - URL приложения: `https://your-domain.com/apps/TravelFrog/main/`

## Что нужно проверить

### 1. Nginx конфигурация

Убедитесь, что в Nginx настроен правильный `location` блок для SPA:

```nginx
location /apps/TravelFrog/main/ {
    alias /usr/share/nginx/html/apps/TravelFrog/main/;
    try_files $uri $uri/ /apps/TravelFrog/main/index.html;
}
```

**Важно:** `try_files` должен перенаправлять все запросы на `index.html` для поддержки client-side routing.

### 2. Basename роутера

Логика в `src/App.tsx` автоматически определяет basename:
- Для пути `/apps/TravelFrog/main/` → basename = `/apps/TravelFrog/main`
- Для пути `/apps/TravelFrog/main/explore` → basename = `/apps/TravelFrog/main`

### 3. Статические ресурсы

`bro.config.js` использует `publicPath: /static/travelforge-app/0.1.0/`, но это может не соответствовать реальному пути деплоя. Если ресурсы не загружаются:

1. Проверьте, что `publicPath` в `bro.config.js` соответствует реальному пути
2. Или настройте Nginx для проксирования статических ресурсов

### 4. index.html

В логах Jenkins не видно создания `index.html`. Если `brojs` не генерирует его автоматически:

1. Проверьте, создается ли `index.html` при сборке
2. Если нет, нужно создать его вручную или настроить `brojs` для генерации

## Возможные проблемы

### Маршруты возвращают 404

**Причина:** Nginx не настроен для SPA или `try_files` указан неправильно.

**Решение:** Добавьте в конфигурацию Nginx:
```nginx
try_files $uri $uri/ /apps/TravelFrog/main/index.html;
```

### Статические ресурсы не загружаются

**Причина:** `publicPath` в `bro.config.js` не соответствует реальному пути.

**Решение:** 
1. Проверьте пути к ресурсам в браузере (DevTools → Network)
2. Обновите `publicPath` в `bro.config.js` или настройте Nginx для проксирования

### Basename определяется неправильно

**Причина:** Логика `computeBasename()` не распознает путь деплоя.

**Решение:** Проверьте логику в `src/App.tsx`. Для деплоя в `/apps/TravelFrog/main/` она должна вернуть `/apps/TravelFrog/main`.

## Проверка после деплоя

После деплоя проверьте:

1. ✅ `https://your-domain.com/apps/TravelFrog/main/` - открывается главная страница
2. ✅ `https://your-domain.com/apps/TravelFrog/main/explore` - открывается страница Explore (не 404)
3. ✅ Обновление страницы на любом маршруте работает
4. ✅ Статические ресурсы (JS, CSS, изображения) загружаются корректно
5. ✅ Навигация по приложению работает

## Логи Jenkins

Если что-то не работает, проверьте логи Jenkins pipeline:
- Этап `production build` - проверьте, что сборка прошла успешно
- Этап `deploy` - проверьте, что файлы загружены на сервер
- SSH соединение - проверьте, что файлы скопированы в правильную директорию

