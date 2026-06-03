function notFound(req, res, next) {
  const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erro interno do servidor.';

  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;

    message = 'Registro duplicado. Verifique campos únicos como email, SKU, nome ou CNPJ/CPF.';
main
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}

module.exports = {
  notFound,
  errorHandler

};

