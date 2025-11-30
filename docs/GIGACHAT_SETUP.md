# Настройка GigaChat для TravelBot

## Переменные окружения

Для работы GigaChat необходимо настроить следующие переменные окружения:

```bash
# Обязательные (уже настроены в .env файле)
GIGACHAT_CLIENT_ID=019ad692-c51b-7e19-8294-bed25b837281
GIGACHAT_SECRET=MDE5YWQ2OTItYzUxYi03ZTE5LTgyOTQtYmVkMjViODM3MjgxOmYzMjg2ZTg3LTNlOWYtNDY3MC1hMWJjLTgxNDdlM2M3ZDU0YQ==

# Опциональные
GIGACHAT_SCOPE=GIGACHAT_API_PERS  # По умолчанию
GIGACHAT_MODEL=GigaChat           # По умолчанию
GIGACHAT_TIMEOUT=60               # Таймаут в секундах, по умолчанию 60
GIGACHAT_TLS_VERIFY=0             # Проверка TLS сертификата (0 или 1), по умолчанию 0
```

**Примечание:** В файле `.env` не используйте кавычки вокруг значений - они будут включены в значение переменной.

## Где настроить

### Локальная разработка

**Файл `.env` уже создан** в корне проекта с настроенными credentials. Просто запустите:

```bash
npm run dev
```

Переменные окружения автоматически загружаются из файла `.env` при запуске stub API.

**Важно:** Файл `.env` не коммитится в git (добавлен в `.gitignore`). Для других разработчиков используйте `.env.example` как шаблон.

Если нужно изменить credentials, отредактируйте файл `.env`:

```bash
GIGACHAT_CLIENT_ID=019ad692-c51b-7e19-8294-bed25b837281
GIGACHAT_SECRET=MDE5YWQ2OTItYzUxYi03ZTE5LTgyOTQtYmVkMjViODM3MjgxOmYzMjg2ZTg3LTNlOWYtNDY3MC1hMWJjLTgxNDdlM2M3ZDU0YQ==
```

Альтернативно, можно экспортировать переменные в терминале:

```bash
export GIGACHAT_CLIENT_ID=019ad692-c51b-7e19-8294-bed25b837281
export GIGACHAT_SECRET=MDE5YWQ2OTItYzUxYi03ZTE5LTgyOTQtYmVkMjViODM3MjgxOmYzMjg2ZTg3LTNlOWYtNDY3MC1hMWJjLTgxNDdlM2M3ZDU0YQ==
```

### Production (Jenkins/Server)

Настройте переменные окружения на сервере или в Jenkins pipeline.

## Как получить credentials

1. Зарегистрируйтесь на [GigaChat](https://developers.sber.ru/portal/products/gigachat)
2. Создайте приложение
3. Получите `CLIENT_ID` и `CLIENT_SECRET`

## Fallback механизм

Если GigaChat недоступен (нет credentials, ошибка API, таймаут), система автоматически использует fallback на старую логику с шаблонными ответами. Это гарантирует, что TravelBot всегда будет работать, даже без GigaChat.

## Проверка работы

1. Установите зависимости (если еще не установлены):
   ```bash
   npm install
   ```
   Это установит `dotenv` и `axios`, необходимые для работы GigaChat.

2. Убедитесь, что файл `.env` существует в корне проекта с правильными credentials

3. Запустите dev-сервер: `npm run dev`

4. Откройте TravelBot в приложении

5. Проверьте логи в консоли сервера:
   - Если GigaChat работает: не должно быть ошибок, в логах будет видно успешные запросы
   - Если используется fallback: будет предупреждение "GigaChat недоступен, используем fallback"

6. Проверьте ответы бота:
   - Если GigaChat работает: в `sources` ответа будет `gigachat://init` или `gigachat://context`
   - Если используется fallback: в `sources` будет `travelforge://init` или `travelforge://context`

## Troubleshooting

### Ошибка "GIGACHAT_CLIENT_ID or GIGACHAT_SECRET is not configured"

- Проверьте, что файл `.env` существует в корне проекта
- Убедитесь, что переменные окружения установлены без кавычек:
  ```bash
  GIGACHAT_CLIENT_ID=019ad692-c51b-7e19-8294-bed25b837281
  GIGACHAT_SECRET=MDE5YWQ2OTItYzUxYi03ZTE5LTgyOTQtYmVkMjViODM3MjgxOmYzMjg2ZTg3LTNlOWYtNDY3MC1hMWJjLTgxNDdlM2M3ZDU0YQ==
  ```
- Проверьте, что `dotenv` установлен: `npm install`
- Перезапустите dev-сервер после изменения `.env`

### Ошибка "GigaChat OAuth unauthorized" (401/403)

- Проверьте правильность `CLIENT_ID` и `CLIENT_SECRET`
- Убедитесь, что `SCOPE` указан правильно (обычно `GIGACHAT_API_PERS`)
- Проверьте, что у приложения есть доступ к GigaChat API
- Убедитесь, что credentials не истекли

### Ошибка "GigaChat API недоступен" (502/503/504)

- **502 Bad Gateway** - сервер GigaChat временно недоступен, попробуйте позже
- **503 Service Unavailable** - сервис перегружен, попробуйте позже
- **504 Gateway Timeout** - таймаут запроса, увеличьте `GIGACHAT_TIMEOUT`
- Проверьте сетевое соединение с интернетом
- Убедитесь, что нет блокировки файрвола для `ngw.devices.sberbank.ru` и `gigachat.devices.sberbank.ru`

### Ошибка подключения (ECONNREFUSED, ETIMEDOUT, ENOTFOUND)

- Проверьте сетевое соединение
- Убедитесь, что нет блокировки прокси или файрвола
- Проверьте, что DNS резолвит домены GigaChat API

### TLS ошибки

- Если возникают проблемы с сертификатами, установите `GIGACHAT_TLS_VERIFY=0` в `.env`
- Для production рекомендуется использовать `GIGACHAT_TLS_VERIFY=1`
- Ошибки сертификата обычно связаны с самоподписанными сертификатами на стороне GigaChat

### Проверка работы

Для диагностики проверьте логи в консоли сервера при запуске `npm run dev`:

1. При загрузке модуля должно быть сообщение:
   ```
   [GigaChat] Переменные окружения загружены: { clientId: '019ad692...', ... }
   ```

2. При ошибке подключения будет детальное сообщение:
   ```
   GigaChat недоступен, используем fallback: { message: '...', status: 502, code: '...' }
   ```

3. Если GigaChat работает, в ответах API будет `sources: ['gigachat://init']` или `['gigachat://context']`

4. Если используется fallback, будет `sources: ['travelforge://init']` или `['travelforge://context']`

