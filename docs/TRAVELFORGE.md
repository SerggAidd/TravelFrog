## TravelForge Product Dossier

### 1. Концепция и позиционирование
- **TravelForge** — учебный "стартап" вокруг бюджетного туристического рекомендательного движка.  
- Продаём интерактивный подбор направлений с динамическим бюджетом и моментальными deep-link для Travelpayouts (Aviasales/Booking/экскурсии).  
- Работает на фейковых данных и моках, но демонстрирует полный пользовательский сценарий, коммуникацию с REST-API и визуализации бюджета.

---

### 2. Архитектура
- **Фреймворк:** brojs + SystemJS host (`@brojs/fire.app`) + React 18 внутри микрофронтенда.  
- **State management:** Zustand store (`src/store/useTravelStore.ts`).  
- **CSS-in-JS:** Emotion (`src/styles/global.tsx`).  
- **Сборка:** `@brojs/cli` + `@brojs/webpack-config`.  
- **Stub API:** Express сервер из `stubs/api/index.js`, подключаемый через `bro.config.js`.  
- **Диаграмма (словами):**  
  - fire.app shell → загружает МФЕ `@travelforge/app`  
  - МФЕ → React Router (pages), Zustand store, UI-компоненты  
  - Store → REST-клиент `src/services/travelApi.ts` → stubs API  
  - Stubs API → JSON данные (`stubs/data/*.json`) + in-memory sessions  
  - Компоненты → визуализация (Recharts, Leaflet) + forms + TravelBot.

---

### 3. Структура микрофронтендов
Проект развёрнут как **один SPA-модуль** `@travelforge/app`, но разбит на четыре функциональные зоны (потенциальные модули для масштабирования):
1. **Core Planner (Dashboard + Explore)** — подбор маршрутов, карта, бюджетный пай-чарт.  
2. **Trips Vault** — сохранённые гипотетические поездки и работа с лидами.  
3. **Intelligence Deck** — конкурентный анализ, unit-экономика, feature flags.  
4. **System Services** — TravelBot, Currency Widget, Auth stub.

В `bro.config.js` заданы маршруты (`/`, `/explore`, `/trips`, `/intelligence`) и feature-флаги, что позволяет при необходимости выделить каждую зону в автономный МФЕ.

---

### 4. Основные модули
- `src/App.tsx` — хост React Router + глобальные стили.  
- `src/layout/AppLayout.tsx` — shell навигация, профиль, responsive sidebar.  
- `src/store/useTravelStore.ts` — Zustand store, экшены (`fetchResults`, `saveTrip`, `askTravelBot`, `login`, `toggleFeature`, ...).  
- `src/services/travelApi.ts` — обёртка над REST (все ответы унифицированы).  
- Компоненты (папка `src/components/`):  
  - `HeroPanel`, `SearchForm`, `CityMatchCard`, `BudgetChart`, `MapPanel`,  
    `TravelBotPanel`, `CurrencyWidget`, `SavedTripsBoard`, `InsightsGrid`.  
- Страницы (`src/pages/`): `Dashboard`, `Explore`, `Trips`, `Intelligence`.

---

### 5. API и фейковые данные
- Stub сервер (`stubs/api/index.js`) использует Express Router и подключается к dev-серверу brojs (`/api/**`).  
- **Эндпоинты:**  
  - `GET /api/cities`, `GET /api/cities/:id`, `POST /api/cities/search` (возвращает `CityMatch[]`).  
  - `GET/POST/DELETE /api/trips` — сохранённые сценарии.  
  - `GET /api/currencies/rates`, `POST /api/currencies/convert`.  
  - `POST /api/travelbot/ask` — синтетический ответ AI.  
  - `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/profile`.  
  - `GET /api/insights` — карточки для Intelligence Deck.  
- **Данные:**  
  - `stubs/data/cities.json` — 5 направлений (Лиссабон, Тбилиси, Анталья, Белград, Бангкок) с координатами, cost breakdown, highlights, deep-link.  
  - `stubs/data/currencies.json` — условные курсы.  
  - Users/trips живут in-memory (очищаются при рестарте).  
- **Иллюзорность:** данные выдуманы, но форматы и бизнес-логика повторяют реальный продукт (бюджет, партнёрка, TravelBot).

---

### 6. User Flow
1. Пользователь попадает на `/` → видит hero, параметры поиска, быстрые инсайты.  
2. Заполняет форму (бюджет, даты, предпочтения) → `fetchResults` вызывает `/cities/search`.  
3. Dashboard показывает карту, пай-чарт, TravelBot. Кнопка "Собрать маршрут" обновляет выдачу.  
4. На `/explore` пользователь сравнивает карточки направлений и сохраняет понравившиеся в Trips.  
5. В `/trips` — реестр лидов, можно удалить элементы.  
6. `/intelligence` — проверка гипотез, включение/выключение фичей, просмотр ключевых метрик.  
7. Currency widget + TravelBot доступны на главной для дополнительной "магии".  
8. Быстрый вход ("demo") демонстрирует работу auth-API.

---

### 7. Гайд по запуску / сборке / деплою
```bash
npm install
npm run dev        # brojs dev-server + stubs
npm run build      # production bundle (dist/)
npm run build:dev  # development bundle
npm test           # vitest unit tests
```
- Dev-сервер стартует на `http://localhost:4173/@travelforge/app`.  
- Для деплоя публикации МФЕ — загрузить `dist/` в CDN и настроить import map fire.app.  
- Stub API нужен только в dev; для демо можно зафиксировать JSON и выключить сервер.

---

### 8. Технические решения и обоснование
- **brojs + SystemJS** — соответствует требованию курса и демонстрирует микрофронтенд-подход.  
- **React + Zustand** — декларативный UI + предсказуемый store (компактнее Redux Toolkit для MVP).  
- **Emotion** — выполняет требование CSS-in-JS и ускоряет стилизацию.  
- **Recharts + Leaflet** — визуализация бюджета/карты для "sexy" UI.  
- **Fake REST** — Express-stub полностью покрывает требования API/форм.  
- **Unit tests (Vitest)** — проверяют расчёты матчей и бюджетов.  
- **Feature flags** — показывают инженерный подход к запуску экспериментов.

---

### 9. Структура проекта (ключевое)
```
src/
  components/      # UI блоки TravelForge
  layout/          # AppLayout (shell)
  pages/           # Dashboard, Explore, Trips, Intelligence
  services/        # travelApi (REST)
  store/           # Zustand store
  styles/          # Emotion global styles
  utils/           # расчёты бюджета
stubs/
  api/index.js     # Express router
  data/*.json      # исходные данные
docs/TRAVELFORGE.md
bro.config.js
```

---

### 10. Дополнительные материалы
- **Feature flags & navigations** документированы в `bro.config.js`.  
- **Testing:** `tests/budget.test.ts`.  
- **CI идеи:** запустить `npm run build && npm test` в GitHub Actions.  
- **Дальнейшие шаги:** вынести Trips/Intelligence в отдельные микрофронтенды, подключить реальный Travelpayouts API, добавить авторизацию через OAuth.

