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
- **Визуализации**: Recharts, Leaflet.
- **Тесты**: Vitest.

### Быстрый старт
```bash
npm install
npm run dev           # http://localhost:4173/travelforge-app
npm run build         # production сборка в dist/
npm test              # unit-тесты
```

Документация продукта: `docs/TRAVELFORGE.md`.

