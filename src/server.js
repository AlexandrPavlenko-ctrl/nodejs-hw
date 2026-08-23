import 'dotenv/config'; // 1. Подключение dotenv для работы с переменными .env
import express from 'express'; // 1. Подключение express
import cors from 'cors'; // 1. Подключение cors
import { connectMongoDB } from './db/connectMongoDB.js'; // Функция подключения к базе данных
import { loggerMiddleware } from './middleware/logger.js'; // Middleware логгера pino-http
import { notFoundHandler } from './middleware/notFoundHandler.js'; // Middleware обработки 404
import { errorHandler } from './middleware/errorHandler.js'; // Глобальный обработчик ошибок
import notesRouter from './routes/notesRoutes.js'; // Роутер со всеми путями /notes

export const startServer = async () => {
  const app = express();

  // 2. Инициализация соединения с MongoDB строго до запуска сервера
  await connectMongoDB();

  // 3. Подключение стандартных и логгирующих middleware
  app.use(cors()); // Разрешение кросс-доменных запросов
  app.use(express.json()); // Парсинг входящего JSON в req.body
  app.use(loggerMiddleware); // Логирование каждого HTTP-запроса через pino-http

  // Корневой маршрут (Health Check) — нужен, чтобы внешние сервисы и тесты (testIfServerIsUp)
  // при запросе на базовый URL не получали ошибку 404, а видели статус 200 OK.
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      message: 'Server is up and running!',
    });
  });

  // 4. Регистрация маршрутов для работы с коллекцией заметок
  // (Тестовый маршрут /test-error из прошлого ДЗ успешно удален)
  app.use(notesRouter);

  // 6. Добавление middleware notFoundHandler строго ПОСЛЕ всех существующих маршрутов
  app.use(notFoundHandler);

  // 7. Добавление errorHandler как самого последнего middleware в стеке
  app.use(errorHandler);

  // 5. Запуск прослушивания порта сервером
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

// Автоматический вызов функции запуска приложения
startServer().catch((error) => {
  console.error('Application failed to start:', error);
});
