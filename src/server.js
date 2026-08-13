import 'dotenv/config'; // Подгружаем переменные из .env в самом начале
import express from 'express';
import cors from 'cors';
import pino from 'pino-http';

const app = express();

// Логер pino-http для отслеживания запросов
app.use(
  pino({
    transport: {
      target: 'pino-pretty',
    },
  }),
);

// Обязательные Middleware из ТЗ
app.use(cors());
app.use(express.json());

// === РЕАЛИЗАЦИЯ МАРШРУТОВ ===

// 1. GET /notes
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

// 2. GET /notes/:noteId
app.get('/notes/:noteId', (req, res) => {
  const { noteId } = req.params;
  res.status(200).json({
    message: `Retrieved note with ID: ${noteId}`,
  });
});

// 3. GET /test-error
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// === МИДЛВАР ДЛЯ ОБРАБОТКИ 404 (НЕ СУЩЕСТВУЮЩИЕ МАРШРУТЫ) ===
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// === МИДЛВАР ДЛЯ ОБРАБОТКИ ОШИБОК 500 ===
app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message || 'Something went wrong',
  });
});

// Запуск сервера считывает PORT из dotenv или ставит 3000
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
