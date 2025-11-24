# Документация Budget Compass (BroJS)

## 1. Обзор платформы

- **Фреймворк**: BroJS (webpack + SystemJS + fire.app)
- **UI**: React 19, React Router 7, TypeScript
- **Dev API**: Express Router (stubs), in-memory модели
- **Точка входа**: `src/index.tsx` (указана в `package.json` → `main` и `bro.config.js`)
- **Путь раздачи MFE**: `/<cleanName>/<version>/index.js`, где `cleanName` = `budget-compass`

## 2. Стек и зависимости

| Категория | Пакеты |
|-----------|--------|
| UI | `react`, `react-dom`, `react-router-dom`, `react-leaflet`, `recharts` |
| Стили | CSS-модули + `leaflet-defaulticon-compatibility` |
| Состояние | React Context (`AuthContext`, `BudgetContext`) |
| API и утилиты | `express`, `bcryptjs`, `jsonwebtoken`, `uuid` |
| BroJS | `@brojs/cli` (devDependency), `bro.config.js` |

## 3. Конфигурация BroJS

Файл `bro.config.js` экспортирует объект `default`:

- `entryPoint: './src/index.tsx'`
- `apiPath: './stubs/api'`
- `apps`: привязывает маршрут `/<budget-compass>` к текущей версии пакета
- `config.baseUrl: '/static'` — используется fire.app для загрузки модулей
- `webpackConfig.resolve.alias['@'] = <root>/src` для удобных импортов

## 4. Фронтенд

```
src/
├── App.tsx                  # Layout + маршруты
├── index.tsx                # mount/unmount для fire.app
├── components/              # Блоки UI (карты, слайдеры, графики)
├── context/                 # AuthContext, BudgetContext
├── pages/                   # Home, Results, CityDetail, SavedTrips, Login, Register
├── services/api.ts          # Обёртка над REST API (базовый адрес /api)
├── data/mockCities.ts       # Локальные мок-данные (для instant UI)
├── types.ts                 # Общие типы
└── styles.css               # Глобальные стили
```

### Навигация

`BrowserRouter` монтируется с динамическим `basename` (первый сегмент URL), поэтому приложение корректно работает внутри `/${cleanName}`.

### Контексты

- **BudgetContext** — хранит фильтры поиска, распределение бюджета, список сохранённых маршрутов. Поддерживает fallback в `localStorage`, если API недоступно.
- **AuthContext** — управляет JWT (localStorage), умеет логин/регистрацию и загрузку профиля.

## 5. Dev API (stubs)

```
stubs/api/
├── index.js                 # Собирает Express Router
├── controllers/             # Бизнес-логика
├── models/                  # In-memory данные (города, валюты, поездки, пользователи)
├── routes/                  # CRUD-маршруты
├── services/travelBot...    # Генератор советов и перераспределения
└── middleware/auth.js       # JWT-проверка
```

### Маршруты

| Путь | Описание |
|------|----------|
| `/cities`        | GET список, `search` по бюджету |
| `/trips`         | GET/POST/DELETE, защищено JWT |
| `/currencies`    | `rates`, `convert` |
| `/travelbot`     | `ask`, `rebalance` |
| `/auth`          | `register`, `login`, `profile` |

Все ответы соответствуют схеме `{ success: boolean, data?: T, error?: string }`, что ожидается `src/services/api.ts`.

## 6. Скрипты npm

- `npm run dev` – запускает BroJS dev server (`brojs server --port 4000 --with-open-browser`)
- `npm run build` – production-бандл для публикации MFE
- `npm run typecheck` – `tsc --noEmit`

## 7. CI/CD (рекомендации)

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. Опубликовать содержимое `dist/` в артефакт и задеплоить как Node package (fire.app ожидает, что пакет будет доступен внутри `node_modules`).

## 8. Расширение

- **Новые города** — `stubs/api/data/cities.js`
- **Собственные курсы валют** — `stubs/api/data/currencies.js`
- **TravelBot** — `stubs/api/services/travelBotService.js` (подмена алгоритма генерации текста)
- **Особые страницы** — добавить маршрут в `App.tsx` и обновить `bro.config.js > navigations`

## 9. Отладка

- Dev server автоматически прогружает изменения UI через HMR.
- Изменения в `stubs/api` подхватываются без перезапуска благодаря `safeConnectApi`.
- Если нужно форсировать обновление приложения в fire.app, очистите `dist/` и пересоберите (`npm run build`).

## 10. Полезные ссылки

- [BroJS CLI](https://www.npmjs.com/package/@brojs/cli)
- [fire.app runtime](https://www.npmjs.com/package/@brojs/fire.app)
- [React Router 7 docs](https://reactrouter.com/)

