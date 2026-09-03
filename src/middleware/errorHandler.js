const errorHandler = (err, req, res, next) => {
  // Якщо помилка прийшла від http-errors, вона матиме властивість status
  const { status = 500, message = 'Internal Server Error' } = err;
  res.status(status).json({ message });
};

export default errorHandler;
