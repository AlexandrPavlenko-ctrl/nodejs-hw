import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import { loggerMiddleware } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRouter from './routes/notesRoutes.js';

export const startServer = async () => {
  const app = express();

  // соединение с базой данных
  await connectMongoDB();

  //  Подключаем базовые middleware
  app.use(cors());
  app.use(express.json());
  app.use(loggerMiddleware);

  //  Подключаем роутер заметок (префикс /notes прописан внутри роутера)
  app.use(notesRouter);

  // Обработка несуществующих маршрутов (всегда после роутов)
  app.use(notFoundHandler);

  // перехватчик ошибок приложения
  app.use(errorHandler);

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Application failed to start:', error);
});
