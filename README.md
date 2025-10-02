# Ukrainian E-commerce Backend

Бэкенд для украинского интернет-магазина с админ-панелью и чатом в реальном времени.

## Особенности

- ✅ Полная поддержка украинского языка
- ✅ Админ-панель для управления категориями, товарами, чатами и отзывами  
- ✅ Чат в реальном времени между клиентами и админами
- ✅ Иерархические категории товаров
- ✅ Система отзывов
- ✅ RESTful API
- ✅ WebSocket для чата
- ✅ Валидация данных
- ✅ Rate limiting
- ✅ Обработка ошибок

## Технологии

- Node.js + Express.js
- Prisma ORM + PostgreSQL
- Socket.io для WebSocket
- JWT для аутентификации
- bcryptjs для хеширования паролей
- Joi + express-validator для валидации

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd ecommerce-backend
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Настройте переменные окружения в `.env`:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"
JWT_SECRET=your-super-secret-jwt-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
CLIENT_URL=http://localhost:3000
```

5. Выполните миграции базы данных:
```bash
npm run generate
npm run migrate
```

6. Заполните базу данных тестовыми данными:
```bash
npm run seed
```

7. Запустите сервер:
```bash
npm run dev
```

## API Endpoints

### Публичные маршруты

#### Категории
- `GET /api/categories` - Получить все категории
- `GET /api/categories/:id` - Получить категорию по ID
- `GET /api/categories/:id/products` - Получить товары категории

#### Товары
- `GET /api/products` - Получить все товары (с пагинацией и фильтрами)
- `GET /api/products/:id` - Получить товар по ID  
- `GET /api/products/search` - Поиск товаров

#### Чат
- `POST /api/chat/start` - Начать новый чат
- `POST /api/chat/:chatId/messages` - Отправить сообщение
- `GET /api/chat/:chatId/messages` - Получить сообщения чата

#### Отзывы
- `GET /api/reviews` - Получить все отзывы
- `POST /api/reviews` - Создать отзыв

### Админские маршруты

Требуют аутентификации с токеном админа.

#### Аутентификация
- `POST /api/admin/login` - Войти как админ

#### Управление категориями
- `POST /api/admin/categories` - Создать категорию
- `PUT /api/admin/categories/:id` - Обновить категорию
- `DELETE /api/admin/categories/:id` - Удалить категорию

#### Управление товарами
- `POST /api/admin/products` - Создать товар
- `PUT /api/admin/products/:id` - Обновить товар
- `DELETE /api/admin/products/:id` - Удалить товар

#### Управление чатами
- `GET /api/admin/chats` - Получить все чаты
- `GET /api/admin/chats/:id/messages` - Получить сообщения чата
- `POST /api/admin/chats/:id/messages` - Отправить сообщение от админа

#### Управление отзывами
- `GET /api/admin/reviews` - Получить все отзывы
- `POST /api/admin/reviews` - Создать отзыв
- `PUT /api/admin/reviews/:id` - Обновить отзыв
- `DELETE /api/admin/reviews/:id` - Удалить отзыв

## WebSocket События

### Клиентские события
- `join-chat` - Присоединиться к чату
- `client-message` - Отправить сообщение от клиента

### Админские события
- `admin-connect` - Подключение админа
- `admin-message` - Отправить сообщение от админа

### Серверные события
- `new-message` - Новое сообщение в чате
- `admin-notification` - Уведомление для админов
- `error` - Ошибка

## Структура проекта

```
src/
├── controllers/     # Контроллеры для обработки HTTP запросов
├── services/        # Бизнес-логика и работа с БД
├── routes/          # Определение маршrutов
├── middleware/      # Промежуточное ПО (auth, validation, etc.)
├── scripts/         # Скрипты (seed, migration helpers)
└── server.js        # Точка входа приложения
```

## Цветовая схема

- Основной: зелёный (#0B3D2E)
- Дополнительные: светлый фон (#F5F5F5), акцентный жёлтый (#FDE6A2), бежевый (#FFF5E1)
- Текст: тёмно-серый (#333333)

## Лицензия

MIT