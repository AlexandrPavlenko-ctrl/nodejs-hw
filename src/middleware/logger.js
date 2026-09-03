import pinoHttp from 'pino-http';
import pino from 'pino';

const loggerMiddleware = pinoHttp({
  logger: pino({
    transport: {
      target: 'pino-pretty',
    },
  }),
});

export default loggerMiddleware;
