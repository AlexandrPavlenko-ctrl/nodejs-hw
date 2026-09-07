// import pinoHttp from 'pino-http';
// import pino from 'pino';

export const logger = (req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next(); // <-- Обязательно вызываем функцию next!
};

export default logger;
