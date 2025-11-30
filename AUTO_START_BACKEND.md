# Автоматический запуск Backend без изменения Pipeline

## ✅ Решение работает из коробки!

Backend будет **автоматически запускаться** при каждом деплое **без изменения Jenkins pipeline**.

## Как это работает

1. **При первом деплое:**
   - Backend файлы копируются в `dist/` автоматически (через brojs)
   - Jenkins загружает файлы на сервер в `main/`
   - При первом запуске `setup-backend.sh` автоматически устанавливает **systemd path watcher**
   - Path watcher отслеживает изменения файла `main/scripts/setup-backend.sh`

2. **При каждом следующем деплое:**
   - Jenkins загружает новые файлы (включая обновленный `setup-backend.sh`)
   - Systemd path watcher **автоматически обнаруживает изменение** файла
   - **Автоматически запускается** `setup-backend.sh`
   - Backend обновляется и перезапускается

## Что нужно сделать

### Первый деплой: Один раз запустить setup-backend.sh

После первого деплоя нужно **один раз** запустить скрипт на сервере (если есть доступ к серверу):

```bash
cd /usr/share/nginx/html/apps/TravelFrog/main
chmod +x scripts/setup-backend.sh
./scripts/setup-backend.sh
```

Это установит:
- Backend сервер
- Systemd path watcher (автоматический запуск при деплое)
- Systemd timer (резервный механизм)

### Следующие деплои: Всё работает автоматически!

После первого запуска:
1. Файлы обновляются при деплое
2. Path watcher автоматически обнаруживает изменения
3. Backend автоматически обновляется и перезапускается
4. Timer проверяет каждые 5 минут (на случай если watcher не сработал)

## Проверка

После первого деплоя проверьте на сервере (если есть доступ):

```bash
# Проверка path watcher
sudo systemctl status travelfrog-backend-auto.path

# Проверка backend сервера
sudo systemctl status travelfrog-api.service

# Health check
curl http://localhost:3000/health
```

## Настройка Nginx (один раз)

После первого деплоя нужно один раз настроить Nginx (если нет доступа - попросите администратора):

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

✅ **Не нужно менять Jenkins pipeline**  
✅ **Backend запускается автоматически при каждом деплое**  
✅ **Всё работает из коробки через systemd path watcher**  
✅ **При первом деплое автоматически устанавливается watcher**

## Как это работает технически

1. `setup-backend.sh` при первом запуске создает:
   - `/etc/systemd/system/travelfrog-backend-auto.path` - отслеживает изменения файлов
   - `/etc/systemd/system/travelfrog-backend-auto.service` - запускает backend при изменениях
   - `/etc/systemd/system/travelfrog-backend-check.timer` - периодическая проверка (резерв)
   - `/etc/systemd/system/travelfrog-backend-check.service` - проверяет и запускает backend

2. Path watcher отслеживает изменения файлов:
   - `/usr/share/nginx/html/apps/TravelFrog/main/stubs/api/server.js`
   - `/usr/share/nginx/html/apps/TravelFrog/main/stubs/api/index.js`
   - `/usr/share/nginx/html/apps/TravelFrog/main/scripts/setup-backend.sh`

3. При изменении файла (новый деплой):
   - Systemd автоматически запускает service
   - Service выполняет `setup-backend.sh`
   - Backend обновляется и перезапускается

4. Timer (резервный механизм):
   - Проверяет каждые 5 минут наличие backend
   - Если backend не запущен, но файлы есть - запускает его
   - Гарантирует работу даже если path watcher не сработал

## Troubleshooting

### Backend не запускается автоматически

Проверьте статус path watcher:
```bash
sudo systemctl status travelfrog-backend-auto.path
```

Если не установлен, запустите вручную один раз:
```bash
cd /usr/share/nginx/html/apps/TravelFrog/main
chmod +x scripts/setup-backend.sh
./scripts/setup-backend.sh
```

### Path watcher не работает

Проверьте логи:
```bash
sudo journalctl -u travelfrog-backend-auto.path -f
sudo journalctl -u travelfrog-backend-auto.service -n 50
```

