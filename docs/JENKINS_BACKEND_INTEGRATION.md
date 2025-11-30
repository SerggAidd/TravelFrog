# Интеграция Backend в Jenkins Pipeline

## Обзор

Backend сервер можно задеплоить в том же Jenkins pipeline, что и фронтенд. Есть два варианта:

1. **Через SSH команду** (рекомендуется) - выполнить скрипт на сервере после деплоя
2. **Через отдельный stage** - добавить stage в pipeline для деплоя backend файлов

## Вариант 1: SSH команда после деплоя (проще)

После этапа `deploy` (где используется `sshPublisher`), добавьте SSH команду для выполнения скрипта на сервере.

### Шаг 1: Убедитесь, что скрипт задеплоен

В этапе `predeploy` или `deploy` убедитесь, что скрипты копируются:

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
            cp scripts/backend.service main/scripts/
            cp .env main/ 2>/dev/null || true
        '''
    }
}
```

### Шаг 2: Добавьте SSH команду после deploy

После `sshPublisher` добавьте:

```groovy
stage('deploy') {
    steps {
        // ... существующий sshPublisher ...
        
        // Деплой backend
        script {
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
        }
    }
}
```

## Вариант 2: Отдельный stage для backend

Добавьте отдельный stage после `deploy`:

```groovy
stage('Deploy Backend') {
    steps {
        script {
            sshPublisher(
                publishers: [
                    sshPublisherDesc(
                        configName: 'bro-js-static',
                        transfers: [
                            // Копируем backend файлы
                            sshTransfer(
                                sourceFiles: 'stubs/api/**',
                                remoteDirectory: '/usr/share/nginx/html/apps/TravelFrog/backend',
                                execCommand: '',
                                flattenFiles: false
                            ),
                            sshTransfer(
                                sourceFiles: 'stubs/data/**',
                                remoteDirectory: '/usr/share/nginx/html/apps/TravelFrog/backend',
                                execCommand: '',
                                flattenFiles: false
                            ),
                            sshTransfer(
                                sourceFiles: 'scripts/setup-backend.sh,scripts/backend.service',
                                remoteDirectory: '/usr/share/nginx/html/apps/TravelFrog/backend',
                                execCommand: '',
                                flattenFiles: false
                            ),
                            // Выполняем скрипт настройки
                            sshTransfer(
                                execCommand: '''
                                    cd /usr/share/nginx/html/apps/TravelFrog/backend
                                    chmod +x setup-backend.sh
                                    ./setup-backend.sh
                                '''
                            )
                        ]
                    )
                ]
            )
        }
    }
}
```

## Вариант 3: Использование готового скрипта deploy-backend.sh

Если у вас есть доступ к файлам проекта на сервере (через git или другой способ):

```groovy
stage('Deploy Backend') {
    steps {
        script {
            sshPublisher(
                publishers: [
                    sshPublisherDesc(
                        configName: 'bro-js-static',
                        transfers: [
                            sshTransfer(
                                execCommand: '''
                                    cd /usr/share/nginx/html/apps/TravelFrog
                                    # Если есть git репозиторий
                                    git pull origin main || true
                                    # Или используйте готовый скрипт
                                    chmod +x scripts/deploy-backend.sh
                                    ./scripts/deploy-backend.sh
                                '''
                            )
                        ]
                    )
                ]
            )
        }
    }
}
```

## Рекомендуемый подход

**Самый простой вариант** - добавить в существующий stage `deploy` после `sshPublisher`:

```groovy
stage('deploy') {
    steps {
        // ... существующий код с sshPublisher для фронтенда ...
        
        // Добавьте это после sshPublisher:
        script {
            def ssh = [:]
            ssh.name = 'bro-js-static'
            ssh.host = '185.152.81.239'
            ssh.user = 'user'
            ssh.port = 60322
            ssh.allowAnyHosts = true
            
            sshCommand remote: ssh, command: '''
                cd /usr/share/nginx/html/apps/TravelFrog/main
                if [ -f scripts/setup-backend.sh ]; then
                    chmod +x scripts/setup-backend.sh
                    ./scripts/setup-backend.sh
                else
                    echo "⚠️  Скрипт setup-backend.sh не найден. Backend не будет настроен."
                fi
            '''
        }
    }
}
```

## Что делает setup-backend.sh

1. ✅ Копирует файлы backend из `main/stubs/` в `backend/`
2. ✅ Создает `package.json` если его нет
3. ✅ Устанавливает зависимости (`npm install --production`)
4. ✅ Создает `.env` с базовыми настройками если его нет
5. ✅ Создает/обновляет systemd service
6. ✅ Запускает и проверяет backend сервер

## Проверка после деплоя

После успешного деплоя проверьте:

```bash
# На сервере
sudo systemctl status travelfrog-api.service
curl http://localhost:3000/health
curl http://localhost:3000/api/cities
```

## Troubleshooting

### Скрипт не найден

Убедитесь, что в `predeploy` скрипты копируются в `main/scripts/`:

```groovy
sh '''
    mkdir -p main/scripts
    cp scripts/setup-backend.sh main/scripts/
    cp scripts/backend.service main/scripts/
'''
```

### Backend не запускается

Проверьте логи на сервере:

```bash
sudo journalctl -u travelfrog-api.service -n 50
```

### Зависимости не устанавливаются

Убедитесь, что на сервере установлен Node.js и npm:

```bash
node -v  # Должно быть v18+
npm -v
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

