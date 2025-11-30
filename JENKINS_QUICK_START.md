# Быстрый старт: Backend в Jenkins Pipeline

**Важно:** Эта инструкция для тех, у кого есть доступ только к Jenkins панели, но не к серверу напрямую. Все поднимется автоматически через pipeline!

## Что нужно сделать

### 1. Модифицируйте этап `predeploy` в Jenkins панели

Найдите в вашем Jenkins pipeline этап `predeploy` и добавьте после копирования фронтенда:

```groovy
sh '''
    mkdir main
    mv dist/index.js dist/index.js.LICENSE.txt dist/remote-assets main
    
    # ⬇️ ДОБАВЬТЕ ЭТО:
    mkdir -p main/stubs/api main/stubs/data main/scripts
    cp -r stubs/api/* main/stubs/api/
    cp -r stubs/data main/stubs/data/
    cp scripts/setup-backend.sh main/scripts/
    cp scripts/backend.service main/scripts/ 2>/dev/null || true
    cp .env main/ 2>/dev/null || true
'''
```

### 2. Добавьте деплой backend в этап `deploy` в Jenkins панели

**Найдите существующий `sshPublisher`** (который деплоит фронтенд) и **добавьте после него** еще один `sshPublisher`:

```groovy
// Деплой backend
sshPublisher(
    publishers: [
        sshPublisherDesc(
            configName: 'bro-js-static',
            transfers: [
                sshTransfer(
                    execCommand: '''
                        cd /usr/share/nginx/html/apps/TravelFrog/main
                        chmod +x scripts/setup-backend.sh
                        ./scripts/setup-backend.sh
                    '''
                )
            ]
        )
    ]
)
```

## Готово!

После следующего деплоя **все поднимется автоматически**:
- ✅ Backend файлы будут скопированы в `main/` и загружены на сервер
- ✅ Скрипт `setup-backend.sh` выполнится на сервере через SSH
- ✅ Backend сервер автоматически настроится и запустится
- ✅ Systemd service будет создан и включен
- ✅ API будет доступен на `http://localhost:3000/api`

**Все работает автоматически, без доступа к серверу!**

## Проверка

После деплоя в логах Jenkins вы увидите:

```
🚀 Настройка TravelForge Backend API...
📦 Копирование файлов...
📥 Установка зависимостей...
✅ Backend сервер успешно запущен!
```

Если есть доступ к серверу, можно проверить:

```bash
sudo systemctl status travelfrog-api.service
curl http://localhost:3000/health
```

## Настройка Nginx (один раз)

**Важно:** После первого деплоя backend нужно **один раз** настроить Nginx на сервере. Если нет доступа к серверу - попросите администратора добавить:

```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

## Подробная инструкция

См. `JENKINS_BACKEND.md` для детальной информации и troubleshooting.

