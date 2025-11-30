## TravelForge (brojs edition)

### Что это
- Учебный SPA микрофронтенд на **brojs**, который переосмысливает старый React-проект "Budget Compass" в формат стартап-презентации TravelForge.
- Выполнены требования преподавателя: SPA, REST, формы, минимум 3 экрана, визуализации, unit-тесты, Express stubs, CSS-in-JS, data-manipulation library.

### Основные возможности
- Интерактивная форма подбора маршрута с бюджетом, датами и предпочтениями.
- Карточки направлений, карта Leaflet, пай-чарт распределения бюджета, TravelBot и currency widget.
- Раздел Trips с сохранёнными "лидами".
- Intelligence Deck с конкурентным анализом и feature flags.

### Технологии
- **brojs** (`@brojs/cli`, `@brojs/fire.app`) + React 18 + Emotion + Zustand.
- **Stub API** на Express (`stubs/api`), данные в `stubs/data`.
- **TravelBot** с интеграцией **GigaChat** (LLM от Сбера) для умных ответов.
- **Визуализации**: Recharts, Leaflet.
- **Тесты**: Vitest.

### Быстрый старт
```bash
npm install
npm run dev           # http://localhost:4173/travelforge-app
npm run build         # production сборка в dist/
npm test              # unit-тесты
```

**Примечание:** GigaChat credentials уже настроены в файле `.env`. При первом запуске убедитесь, что установлены все зависимости (включая `dotenv` для загрузки переменных окружения).

Документация продукта: `docs/TRAVELFORGE.md`.

### Настройка GigaChat (опционально)

TravelBot использует GigaChat для умных ответов. Если GigaChat недоступен, используется fallback на шаблонные ответы.

Для настройки GigaChat см. `docs/GIGACHAT_SETUP.md`.

### Backend API сервер

Для production доступен standalone Express сервер:

```bash
# Локально
npm run api:start

# Production деплой
# См. docs/BACKEND_DEPLOY.md
```

Backend сервер работает на порту 3000 и обслуживает все запросы к `/api/*`. 

**Автоматический деплой:** Backend файлы автоматически копируются в `dist/` при сборке через brojs! 

**⚠️ Важно:** После первого деплоя нужно один раз запустить на сервере:
```bash
cd /usr/share/nginx/html/apps/TravelFrog/main
sudo ./scripts/install-backend-watcher.sh
```

После этого backend будет запускаться автоматически при каждом деплое. См. `QUICK_FIX.md` или `INSTALL_BACKEND.md` для инструкции.

