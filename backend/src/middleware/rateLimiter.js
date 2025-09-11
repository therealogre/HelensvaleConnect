const rateLimit = require('express-rate-limit');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory rate limiter for sensitive operations
const sensitiveOperationLimiter = new RateLimiterMemory({
  points: 5, // 5 points
  duration: 3600, // Per hour
  blockDuration: 3600, // Block for 1 hour if exceeded
});

// Rate limiter middleware for sensitive operations
const sensitiveLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    await sensitiveOperationLimiter.consume(ip);
    next();
  } catch (error) {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
    });
  }
};

module.exports = {
  authLimiter,
  apiLimiter,
  sensitiveLimiter,
};
