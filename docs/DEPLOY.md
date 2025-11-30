# Руководство по деплою TravelForge

## Проблема с маршрутами при деплое SPA

При деплое Single Page Application (SPA) на статический хостинг могут возникнуть проблемы с маршрутизацией:

1. **Прямые переходы на маршруты** - если пользователь напрямую перейдет на `/explore` или обновит страницу, сервер может вернуть 404, так как такого файла не существует
2. **Basename роутера** - нужно правильно настроить базовый путь для роутера, если приложение деплоится в поддиректорию

## Решение

В проекте уже настроены конфигурационные файлы для популярных платформ деплоя:

### 1. Netlify

Файлы: `netlify.toml` и `public/_redirects`

```bash
npm run build:prod
# Загрузите содержимое dist/ в Netlify
```

Netlify автоматически использует `_redirects` из директории `public/`, которая копируется в `dist/` при сборке.

### 2. Vercel

Файл: `vercel.json`

```bash
npm run build:prod
vercel --prod
```

Или подключите репозиторий к Vercel - он автоматически обнаружит `vercel.json`.

### 3. Apache

Файл: `public/.htaccess`

```bash
npm run build:prod
# Скопируйте содержимое dist/ на Apache сервер
# Убедитесь, что .htaccess скопирован в корень dist/
```

Убедитесь, что на сервере включен модуль `mod_rewrite`.

### 4. Nginx

Добавьте в конфигурацию Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Для деплоя в `/apps/TravelFrog/main/` (Jenkins):**

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

Подробнее см. `docs/NGINX_CONFIG.md`.

### 5. GitHub Pages

Если деплоите в поддиректорию (например, `username.github.io/repo-name`):

1. Убедитесь, что `publicPath` в `bro.config.js` соответствует пути деплоя
2. Используйте GitHub Actions для автоматического деплоя
3. Добавьте скрипт в `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build:prod && gh-pages -d dist"
  }
}
```

## Проверка после деплоя

После деплоя проверьте:

1. ✅ Главная страница открывается
2. ✅ Навигация по ссылкам работает
3. ✅ Прямой переход на `/explore` работает (не 404)
4. ✅ Обновление страницы на любом маршруте работает
5. ✅ Статические ресурсы (CSS, JS, изображения) загружаются

## Настройка basename

Логика basename в `src/App.tsx` автоматически определяет базовый путь:

- **Деплой в корень** (`example.com`): basename = `/`
- **Деплой в поддиректорию** (`example.com/travelforge-app`): basename = `/travelforge-app`
- **Деплой через Jenkins** (`example.com/apps/TravelFrog/main/`): basename = `/apps/TravelFrog/main`

Логика автоматически определяет путь до приложения, ища сегмент `main` или известные маршруты (`explore`, `trips`, `intelligence`, `auth`).

Если нужно явно задать basename, можно использовать переменную окружения:

```typescript
const basename = process.env.REACT_APP_BASENAME || computeBasename()
```

## Troubleshooting

### Маршруты возвращают 404

- Убедитесь, что файл конфигурации для вашей платформы создан
- Проверьте, что файл скопирован в `dist/` при сборке
- Для Apache: проверьте, что `.htaccess` не блокируется настройками сервера

### Статические ресурсы не загружаются

- Проверьте `publicPath` в `bro.config.js`
- Убедитесь, что пути к ресурсам корректны относительно базового URL

### Basename определяется неправильно

- Проверьте логику в `computeBasename()` в `src/App.tsx`
- При необходимости задайте basename явно через переменную окружения

