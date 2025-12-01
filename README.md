# TravelFrog ― Budget Compass MFE

Single-page приложение для расчёта и визуализации бюджета путешествий. Проект разворачивается и локально, и на Jenkins одинаковыми командами:

```bash
cd budget-compass-mfe
npm install
npm start
```

`npm start` запускает dev-сервер Create React App (`react-scripts`). Production-сборка делается через `npm run build` (или `npm run build:prod`, который дополнительно собирает артефакты в `dist/` для пайплайна).

## Scripts

- `npm start` — dev-server на `http://localhost:3000`.
- `npm run build` — production сборка в `build/`.
- `npm run build:prod` — build + копирование артефактов (`index.js`, `remote-assets/`, `scripts/`, `stubs/`) в `dist/` для Jenkins.
- `npm test` — unit-тесты (не используются на пайплайне).
- `npm run lint` — проверка тайпскрипта (`tsc --noEmit`).
- `npm run api:start` — локальный запуск express-stub из `stubs/api`.

## Mock backend

Папка `stubs/` содержит express-сервер и мок-данные, которые разворачиваются вместе с фронтендом. Скрипты для сервера лежат в `scripts/` и копируются Jenkins'ом на таргет. Ручки соответствуют `src/services/api.ts`, поэтому фронт может работать без настоящего бэкенда.

### Реальный backend

По умолчанию фронтенд обращается к `http://31.57.158.196:5000/api`. Если адрес изменится, положи `.env` рядом с `package.json`:

```
REACT_APP_API_BASE_URL=http://31.57.158.196:5000/api
```

После изменения переменной окружения перезапусти `npm start` или пересобери прод (`npm run build:prod`), чтобы CRA перехватила новое значение.

## Требования

- Node.js ≥ 18
- npm ≥ 9

## Структура

- `src/` — исходники React-приложения.
- `public/` — статика и HTML-шаблон CRA.
- `remote-assets/` — favicons/manifest для деплоя.
- `scripts/` — systemd-скрипты для запуска stubs.
- `stubs/` — express server + мок-данные.
