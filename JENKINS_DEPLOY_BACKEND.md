# 🚀 Запуск Backend в Jenkins Pipeline

## Проблема

Backend файлы копируются в `dist/` автоматически, но **backend сервер не запускается** на production сервере. Поэтому вы видите ошибки:
- `API недоступен. Stub API работает только в dev режиме`
- `Cannot load rates Error`
- `Travel bot init error`

## Решение

Нужно добавить **один шаг** в Jenkins pipeline для автоматического запуска backend на сервере.

---

## Что нужно сделать

### В Jenkins панели найдите этап `deploy`

После существующего `sshPublisher` (который загружает фронтенд), **добавьте еще один `sshPublisher`**:

```groovy
// Деплой и запуск backend
sshPublisher(
    publishers: [
        sshPublisherDesc(
            configName: 'bro-js-static',
            transfers: [
                sshTransfer(
                    execCommand: '''
                        cd /usr/share/nginx/html/apps/TravelFrog/main
                        if [ -f scripts/setup-backend.sh ]; then
                            echo "🚀 Запуск backend..."
                            chmod +x scripts/setup-backend.sh
                            ./scripts/setup-backend.sh
                        else
                            echo "⚠️  Скрипт setup-backend.sh не найден"
                            ls -la scripts/ || echo "Директория scripts не существует"
                        fi
                    '''
                )
            ]
        )
    ]
)
```

---

## Что произойдет

1. ✅ Jenkins загрузит фронтенд через первый `sshPublisher`
2. ✅ Второй `sshPublisher` выполнит скрипт `setup-backend.sh` на сервере
3. ✅ Скрипт автоматически:
   - Скопирует файлы из `main/stubs/` в `backend/`
   - Установит зависимости
   - Создаст systemd service
   - Запустит backend сервер на порту 3000
4. ✅ API будет доступен на `http://localhost:3000/api`

---

## Настройка Nginx (один раз)

После первого деплоя backend нужно **один раз** настроить Nginx (если нет доступа к серверу - попросите администратора):

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

После этого перезагрузите Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Проверка после деплоя

После успешного деплоя в логах Jenkins вы увидите:

```
🚀 Настройка TravelForge Backend API...
📦 Копирование файлов из /usr/share/nginx/html/apps/TravelFrog/main/stubs...
📥 Установка зависимостей...
📝 Создание systemd service...
✅ Backend сервер успешно запущен!
```

Если есть доступ к серверу, можно проверить:

```bash
# Статус сервиса
sudo systemctl status travelfrog-api.service

# Health check
curl http://localhost:3000/health

# API endpoint
curl http://localhost:3000/api/cities
```

---

## Итого

✅ **Backend файлы уже копируются автоматически** в `dist/` при сборке  
✅ **Нужно только добавить один `sshPublisher`** в `deploy` для запуска backend  
✅ **После этого API будет работать автоматически при каждом деплое**

