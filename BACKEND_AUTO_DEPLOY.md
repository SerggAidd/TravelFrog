# Автоматический деплой Backend через brojs

## ✅ Работает из коробки!

Backend файлы **автоматически** копируются в `dist/` при каждой сборке через `brojs build`.

## Как это работает

1. **При сборке** (`npm run build:prod`):
   - brojs собирает фронтенд
   - Webpack plugin автоматически копирует backend файлы в `dist/`:
     - `stubs/api/*` → `dist/stubs/api/`
     - `stubs/data/*` → `dist/stubs/data/`
     - `scripts/setup-backend.sh` → `dist/scripts/setup-backend.sh`
     - `scripts/backend.service` → `dist/scripts/backend.service`
     - `.env` → `dist/.env` (если существует)

2. **При деплое через Jenkins**:
   - Jenkins копирует все из `dist/` в `main/`
   - Backend файлы уже там!
   - Нужно только добавить выполнение скрипта на сервере

## Что нужно сделать в Jenkins

### Только один шаг: Добавить выполнение скрипта в `deploy`

В этапе `deploy` после `sshPublisher` (который загружает фронтенд), добавьте:

```groovy
// Деплой backend - выполняется на сервере автоматически
sshPublisher(
    publishers: [
        sshPublisherDesc(
            configName: 'bro-js-static',
            transfers: [
                sshTransfer(
                    execCommand: '''
                        cd /usr/share/nginx/html/apps/TravelFrog/main
                        if [ -f scripts/setup-backend.sh ]; then
                            chmod +x scripts/setup-backend.sh
                            ./scripts/setup-backend.sh
                        fi
                    '''
                )
            ]
        )
    ]
)
```

**Всё!** Больше ничего не нужно - файлы уже в `dist/` благодаря brojs!

## Проверка

После сборки проверьте:

```bash
npm run build:prod
ls -la dist/
# Должны быть:
# - dist/stubs/api/
# - dist/stubs/data/
# - dist/scripts/setup-backend.sh
# - dist/scripts/backend.service
# - dist/.env (если существует)
```

## Что делает setup-backend.sh

Скрипт автоматически:
1. ✅ Копирует файлы из `main/stubs/` в `backend/`
2. ✅ Создает `package.json` для backend
3. ✅ Устанавливает зависимости
4. ✅ Создает `.env` с базовыми настройками (если нет)
5. ✅ Настраивает systemd service
6. ✅ Запускает backend сервер

## Настройка Nginx (один раз)

После первого деплоя нужно один раз настроить Nginx:

```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

## Итого

✅ **Backend файлы копируются автоматически** при каждой сборке  
✅ **Не нужно модифицировать `predeploy`** - файлы уже в `dist/`  
✅ **Нужно только добавить один `sshPublisher`** в `deploy` для выполнения скрипта  
✅ **Все работает из коробки через brojs!**

