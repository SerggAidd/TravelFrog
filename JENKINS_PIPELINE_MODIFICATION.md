# Модификация Jenkins Pipeline для Backend

## Ваша ситуация

- ✅ Доступ к Jenkins панели (конфигурации pipeline)
- ❌ Нет прямого доступа к серверу
- ✅ Нужно, чтобы все поднялось автоматически через pipeline

## Решение

Нужно модифицировать **2 места** в вашем Jenkins pipeline через панель Jenkins.

---

## Шаг 1: Модифицируйте этап `predeploy`

**Найдите в Jenkins панели этап `predeploy`** (где сейчас код):

```groovy
sh '''
    mkdir main
    mv dist/index.js dist/index.js.LICENSE.txt dist/remote-assets main
'''
```

**Замените на:**

```groovy
sh '''
    mkdir main
    mv dist/index.js dist/index.js.LICENSE.txt dist/remote-assets main
    
    # Копируем backend файлы для деплоя на сервер
    mkdir -p main/stubs/api main/stubs/data main/scripts
    cp -r stubs/api/* main/stubs/api/
    cp -r stubs/data main/stubs/data/
    cp scripts/setup-backend.sh main/scripts/
    cp scripts/backend.service main/scripts/ 2>/dev/null || true
    cp .env main/ 2>/dev/null || true
'''
```

**Что это делает:**
- Копирует все backend файлы в `main/` директорию
- Эти файлы будут загружены на сервер вместе с фронтендом через `sshPublisher`

---

## Шаг 2: Добавьте деплой backend в этап `deploy`

**Найдите в Jenkins панели этап `deploy`** (где используется `sshPublisher`).

**После существующего `sshPublisher`** (который загружает фронтенд), **добавьте еще один `sshPublisher`**:

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
                            echo "🚀 Настройка backend..."
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

**Что это делает:**
- Подключается к серверу через SSH (используя те же credentials, что и для фронтенда)
- Выполняет скрипт `setup-backend.sh` на сервере
- Скрипт автоматически:
  - Копирует файлы из `main/stubs/` в `backend/`
  - Устанавливает зависимости
  - Создает systemd service
  - Запускает backend сервер

---

## Полный пример изменений

### До изменений:

**predeploy:**
```groovy
sh '''
    mkdir main
    mv dist/index.js dist/index.js.LICENSE.txt dist/remote-assets main
'''
```

**deploy:**
```groovy
sshPublisher(...) // только фронтенд
```

### После изменений:

**predeploy:**
```groovy
sh '''
    mkdir main
    mv dist/index.js dist/index.js.LICENSE.txt dist/remote-assets main
    
    # Backend файлы
    mkdir -p main/stubs/api main/stubs/data main/scripts
    cp -r stubs/api/* main/stubs/api/
    cp -r stubs/data main/stubs/data/
    cp scripts/setup-backend.sh main/scripts/
    cp scripts/backend.service main/scripts/ 2>/dev/null || true
    cp .env main/ 2>/dev/null || true
'''
```

**deploy:**
```groovy
sshPublisher(...) // фронтенд

// Backend
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

---

## Что произойдет после деплоя

1. ✅ Jenkins соберет проект
2. ✅ В `predeploy` скопирует backend файлы в `main/`
3. ✅ `sshPublisher` загрузит фронтенд + backend файлы на сервер
4. ✅ Второй `sshPublisher` выполнит `setup-backend.sh` на сервере
5. ✅ Backend автоматически настроится и запустится
6. ✅ Systemd service будет создан и включен
7. ✅ API будет доступен на `http://localhost:3000/api`

**Все автоматически, без доступа к серверу!**

---

## Важно: Настройка Nginx

После первого деплоя backend нужно **один раз** настроить Nginx на сервере (если есть доступ к серверу, или попросите администратора):

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

Если нет доступа к серверу - попросите администратора добавить эту конфигурацию один раз.

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

Если что-то пошло не так, в логах будет видно ошибку.

---

## Troubleshooting

### Скрипт не найден

**Проблема:** В логах `⚠️ Скрипт setup-backend.sh не найден`

**Решение:** Убедитесь, что в `predeploy` вы добавили:
```groovy
cp scripts/setup-backend.sh main/scripts/
```

### Backend не запускается

**Проблема:** В логах ошибки при запуске

**Решение:** Проверьте логи на сервере (если есть доступ) или попросите администратора:
```bash
sudo journalctl -u travelfrog-api.service -n 50
```

### Зависимости не устанавливаются

**Проблема:** Ошибки при `npm install`

**Решение:** Убедитесь, что на сервере установлен Node.js:
```bash
node -v  # Должно быть v18+
npm -v
```

---

## Итого

✅ **Все работает автоматически через Jenkins**
✅ **Не нужен доступ к серверу** (кроме одноразовой настройки Nginx)
✅ **Backend поднимется при каждом деплое**
✅ **Systemd service автоматически создастся и запустится**

Просто модифицируйте pipeline в Jenkins панели по инструкции выше!

