import pinoHttp from 'pino-http';
import pino from 'pino';

export const loggerMiddleware = pinoHttp({
  logger: pino({
    transport: {
      target: 'pino-pretty',
    },
  }),
});
