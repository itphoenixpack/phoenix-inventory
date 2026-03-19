const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  
  // Don't leak stack traces in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  res.json({
    message: err.message || 'Internal Server Error',
    stack: isProduction ? null : err.stack,
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
