const { ValidationError } = require('express-validation');
const { MongoError } = require('mongodb');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Convert error to ApiError if needed
 */
const convertToApiError = (err, req, res, next) => {
  let error = err;

  // Handle validation errors
  if (error instanceof ValidationError) {
    const message = error.details.body || error.details.query || error.details.params || [];
    error = new ApiError(400, 'Validation Error', message);
  }
  // Handle MongoDB duplicate key errors
  else if (error instanceof MongoError && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    error = new ApiError(400, `${field} already exists`);
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  } else if (error.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }
  // Handle invalid ObjectId
  else if (error.name === 'CastError') {
    error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  }
  // Handle validation errors from Mongoose
  else if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    error = new ApiError(400, 'Validation Error', messages);
  }
  // If it's not an instance of ApiError, create a new one
  else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors);
  }

  next(error);
};

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  const { statusCode, message, errors } = err;
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger.error(err.stack);
  }

  // Log error in production (without stack trace)
  if (process.env.NODE_ENV === 'production') {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  // Set status code and send response
  res.status(statusCode).json(response);
};

/**
 * 404 handler
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
};

module.exports = {
  convertToApiError,
  errorHandler,
  notFound
};
