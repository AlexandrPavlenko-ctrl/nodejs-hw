import { isHttpError } from 'http-errors';

export const errorHandler = (error, req, res, next) => {
  if (isHttpError(error)) {
    return res.status(error.status).json({
      message: error.message,
    });
  }

  res.status(500).json({
    message: error.message || 'Internal Server Error',
  });
};
