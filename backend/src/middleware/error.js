const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Error handling middleware
 * Handles various types of errors and sends appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  // Log the error for debugging
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - Stack: ${err.stack}`);

  // Handle validation errors from express-validator
  if (err.name === 'ValidationError' || (err.errors && Array.isArray(err.errors))) {
    const messages = err.errors.map(error => ({
      field: error.param || error.path,
      message: error.msg || error.message,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'One or more validation errors occurred',
      errors: messages,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ApiError(message, 401);
  }

  // Handle JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired';
    error = new ApiError(message, 401);
  }

  // Handle MongoDB duplicate field errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new ApiError(message, 400);
  }

  // Handle MongoDB validation errors
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(message, 404);
  }

  // Handle invalid ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    const message = 'Invalid ID format';
    error = new ApiError(message, 400);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || 'Server Error';

  // Log the error to the console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    message: errorMessage,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    ...(process.env.NODE_ENV === 'development' && { error: error })
  });
};

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
