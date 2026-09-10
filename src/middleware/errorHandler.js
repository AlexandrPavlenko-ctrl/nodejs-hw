// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
  // ЭТОТ ЛОГ НАПРАМУЮ ВЫВЕДЕТ НАСТОЯЩИЙ СТЕК ОШИБКИ В КОНСОЛЬ RENDER:
  console.error('============ КРИТИЧЕСКИЙ СБОЙ СЕРВЕРА ============');
  console.error(err);
  console.error('==================================================');

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ message });
};

export default errorHandler;
