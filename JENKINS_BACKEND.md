# Интеграция Backend в Jenkins Pipeline

## Как добавить деплой backend в существующий Jenkins pipeline

Ваш Jenkins pipeline использует внешние скрипты из `itPark_Jenkins_Scriptss`. Чтобы добавить деплой backend, нужно модифицировать этап `predeploy` и добавить SSH команду после `deploy`.

## Шаг 1: Модифицируйте этап predeploy

В этапе `predeploy` (где создается директория `main`), добавьте копирование backend файлов:

**Текущий код:**
```groovy
sh '''
    mkdir main
    mv dist/index.js dist/index.js.LICENSE.txt dist/remote-assets main
'''
```

**Добавьте после этого:**
```groovy
sh '''
    # Копируем backend файлы для деплоя на сервер
    mkdir -p main/stubs/api main/stubs/data main/scripts
    cp -r stubs/api/* main/stubs/api/
    cp -r stubs/data main/stubs/data/
    cp scripts/setup-backend.sh main/scripts/
    cp scripts/backend.service main/scripts/ 2>/dev/null || true
    cp .env main/ 2>/dev/null || true
'''
```

## Шаг 2: Добавьте SSH команду после deploy

После `sshPublisher` в этапе `deploy`, добавьте выполнение скрипта на сервере:

**Найдите в pipeline:**
```groovy
sshPublisher
    ...
    Transferred 5 file(s)
```

**Добавьте после sshPublisher (рекомендуется через sshPublisher):**

```groovy
// Деплой backend через отдельный sshPublisher с execCommand
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

**Альтернатива (если sshCommand доступен):**

```groovy
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
```

## Полный пример модифицированного pipeline

```groovy
stage('predeploy') {
    steps {
        sh '''
            mkdir main
            mv dist/index.js dist/index.js.LICENSE.txt dist/remote-assets main
            
            # Копируем backend файлы
            mkdir -p main/stubs/api main/stubs/data main/scripts
            cp -r stubs/api/* main/stubs/api/
            cp -r stubs/data main/stubs/data/
            cp scripts/setup-backend.sh main/scripts/
            cp scripts/backend.service main/scripts/ 2>/dev/null || true
            cp .env main/ 2>/dev/null || true
        '''
    }
}

stage('deploy') {
    steps {
        // ... существующий sshPublisher для фронтенда ...
        
        // Деплой backend
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

## Альтернатива: Модификация через groovy скрипт

Если у вас есть доступ к редактированию groovy скриптов в `itPark_Jenkins_Scriptss/predeploy/`, добавьте туда копирование backend файлов.

## Что делает setup-backend.sh

Скрипт `scripts/setup-backend.sh`:
1. ✅ Копирует файлы из `main/stubs/` в `backend/`
2. ✅ Создает `package.json` для backend
3. ✅ Устанавливает зависимости
4. ✅ Создает `.env` если его нет
5. ✅ Настраивает systemd service
6. ✅ Запускает backend сервер

## Проверка после деплоя

После успешного деплоя проверьте на сервере:

```bash
# Статус сервиса
sudo systemctl status travelfrog-api.service

# Health check
curl http://localhost:3000/health

# API endpoint
curl http://localhost:3000/api/cities
```

## Настройка Nginx

После деплоя backend настройте Nginx (см. `docs/BACKEND_DEPLOY.md`):

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

## Troubleshooting

### Скрипт не найден на сервере

Убедитесь, что в `predeploy` скрипты копируются:
```groovy
cp scripts/setup-backend.sh main/scripts/
```

### Backend не запускается

Проверьте логи:
```bash
sudo journalctl -u travelfrog-api.service -n 50
```

### Зависимости не устанавливаются

Убедитесь, что на сервере есть Node.js:
```bash
node -v
npm -v
```

