const AppError = require('../utils/appError');

const handleJWTExpired = () =>
  new AppError('Your token has expired! please login in again', 401);

const handleJWTError = () =>
  new AppError('Invalid token! please login in', 401);

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((err) => err.message)
    .join(', ');
  const message = `Invalid input: ${errors}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: '${err.keyValue.name}', please use another value`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  // Error For APIs
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      stack: err.stack,
      message: err.message
    });
  }
  // Error For Rendered Website In Development
  console.log('Error 💥💥💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // Error For APIs in productions
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // Unknown Errors
    console.log('Error 💥💥💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'something went wrong! please try again later'
    });
  }

  // Errors For Rendered Website in productions
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  // Unknown Errors For Rendered Website
  console.log('Error 💥💥💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later!'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // these properties (name, message) are inherited by the err object so it's not directly available
    // inside the err object so we can't clone them
    error.name = err.name;
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // jsonwebtoken error object has the name property
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, req, res);
  }
};
