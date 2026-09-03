import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import notesRouter from './routes/notesRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import notFoundHandler from './middleware/notFoundHandler.js';
import logger from './middleware/logger.js';
import { connectMongoDB } from './db/connectMongoDB.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Базові мідлвари
app.use(cors());
app.use(express.json());

// Застосовуємо мідлвар логування
app.use(logger);

// Реєструємо роутер без префікса шляху
app.use(notesRouter);

// Обробка неіснуючих маршрутів (404)
app.use(notFoundHandler);

// Обов'язковий збирач помилок Celebrate валідації (400)
app.use(errors());

// Глобальний обробник помилок (500 або кастомні http-errors)
app.use(errorHandler);

// Підключення до БД та старт сервера
const startServer = async () => {
  try {
    await connectMongoDB();
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
