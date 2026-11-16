# Backend

Для локального запуска нужны Node.js 26, Yarn 4 и PostgreSQL. Скопируйте `.env.example` в `.env` и заполните параметры подключения, данные приложения Яндекс OAuth и случайный секрет JWT. `FRONTEND_ORIGIN` и Redirect URI должны точно соответствовать адресам frontend и настройкам Яндекс OAuth. Секреты не добавляются в Git.

После установки зависимостей выполните `yarn migration:run`, затем `yarn dev`. Для frontend задайте `NEXT_PUBLIC_API_URL` в `front/.env.local`, например `http://localhost:3002/api/v1`. Изменение публичной переменной требует перезапуска frontend.

Сессионная cookie использует `Secure`; для локальной разработки используйте `localhost`, который современные браузеры считают безопасным контекстом.
