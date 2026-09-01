# BOTAN COMIC CLIP FACTORY v2.0

AI-инструмент для сборки комикс-клипа: идея и трек превращаются в storyboard, keyframes и редактируемые motion-сегменты. Интерфейс демонстрирует проект **«Мегаполис просыпается»** и тестовый трек `medals_test.wav`.

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте URL, который выведет Vite (обычно `http://localhost:5173`). Для API в отдельном терминале используйте `npm run api`.

## Архитектура

- `apps/web` — место для production web-клиента.
- `apps/api` — место для API-сервиса.
- `packages/*` — границы доменных движков: история, персонажи, стиль, continuity, таймлайн, motion и рендер.
- `providers/*` — адаптеры SVI, Wan, LTX, CogVideoX и LightX2V.
- `projects` — сохраняемые проекты и экспортированные клипы.

`POST /api/generate` возвращает очередь из трёх сцен и выбранный video provider. В демонстрационном UI генерация намеренно локальная: она показывает ожидаемую последовательность keyframe → motion segment без требования GPU или ключей модели.
