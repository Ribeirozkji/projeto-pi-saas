function notFound(req, res, next) {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || 'Erro interno do servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}

module.exports = {
  notFound,
  errorHandler
};
