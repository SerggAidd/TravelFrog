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

### 3. API запросы (Backend сервер)

**Решение:** Запустите отдельный backend сервер на том же сервере.

**Деплой backend через Jenkins:**

### Вариант 1: Модификация predeploy и deploy stages

**1. В этапе `predeploy` добавьте копирование backend файлов:**

```groovy
stage('predeploy') {
    steps {
        sh '''
            mkdir main
            mv dist/index.js dist/index.js.LICENSE.txt dist/remote-assets main
            
            # Копируем backend файлы для деплоя
            mkdir -p main/stubs/api main/stubs/data main/scripts
            cp -r stubs/api/* main/stubs/api/
            cp -r stubs/data main/stubs/data/
            cp scripts/setup-backend.sh main/scripts/
            cp scripts/backend.service main/scripts/ 2>/dev/null || true
            cp .env main/ 2>/dev/null || true
        '''
    }
}
```

**2. В этапе `deploy` после `sshPublisher` добавьте SSH команду:**

```groovy
stage('deploy') {
    steps {
        // ... существующий sshPublisher ...
        
        // Деплой backend через SSH
        script {
            def ssh = [:]
            ssh.name = 'bro-js-static'
            ssh.host = '185.152.81.239'
            ssh.user = 'user'
            ssh.port = 60322
            ssh.allowAnyHosts = true
            
            sshCommand remote: ssh, command: '''
                cd /usr/share/nginx/html/apps/TravelFrog/main
                chmod +x scripts/setup-backend.sh
                ./scripts/setup-backend.sh
            '''
        }
    }
}
```

**Подробная инструкция:** См. `JENKINS_BACKEND.md` в корне проекта.

**Настройка Nginx для проксирования:**

После деплоя backend настройте Nginx:

```nginx
# Проксирование API запросов на backend сервер
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

Подробнее см. `docs/BACKEND_DEPLOY.md`.

**Старое решение (без backend):**

Если backend не настроен, можно исключить API запросы из `try_files`:
   ```nginx
   location /api/ {
       proxy_pass http://your-backend-server:port;
       proxy_set_header Host $host;
   }
   ```

2. **Или исключить API запросы из `try_files`** в Nginx:
   ```nginx
   location /apps/TravelFrog/main/ {
       if ($uri ~ ^/api/) {
           return 404;
       }
       try_files $uri $uri/ /apps/TravelFrog/main/index.html;
   }
   ```

3. **Или использовать mock данные** на фронтенде для production (не рекомендуется для production)

### 4. Статические ресурсы

`bro.config.js` использует `publicPath: /static/travelforge-app/0.1.0/`, но это может не соответствовать реальному пути деплоя. Если ресурсы не загружаются:

1. Проверьте пути к ресурсам в браузере (DevTools → Network)
2. Обновите `publicPath` в `bro.config.js` или настройте Nginx для проксирования статических ресурсов

### 4. index.html

В логах Jenkins не видно создания `index.html`. Если `brojs` не генерирует его автоматически:

1. Проверьте, создается ли `index.html` при сборке
2. Если нет, нужно создать его вручную или настроить `brojs` для генерации

## Возможные проблемы

### Ошибка "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Причина:** Запросы к `/api/*` попадают на Nginx, который из-за `try_files` возвращает `index.html` вместо JSON. Stub API работает только в dev режиме.

**Решение:** Исключите API запросы из `try_files` в Nginx:

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

Или настройте проксирование на отдельный backend сервер:

```nginx
location /api/ {
    proxy_pass http://your-backend-server:port;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

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

