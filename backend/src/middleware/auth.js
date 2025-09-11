const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// Rate limiting for auth routes
const rateLimit = require('express-rate-limit');

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip; // Use IP + user agent for better rate limiting
  }
});

const refreshTokenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 refresh token requests per hour
  message: 'Too many refresh attempts, please try again later',
  skip: (req) => {
    // Skip rate limiting for valid refresh tokens
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return false;
    
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      return !!decoded;
    } catch (error) {
      return false;
    }
  }
});

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: http:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.yourapi.com"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  next();
};

/**
 * Protect routes - verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    // Check if token exists in header
    if (authHeader && authHeader.startsWith('Bearer')) {
      // Get token from header
      token = authHeader.split(' ')[1];
    } 
    // Check for token in cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return next(new ApiError('Not authorized to access this route', 401));
    }

    try {
      // Verify access token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      // Get user from database with sensitive fields
      const user = await User.findById(decoded.id)
        .select('+tokenVersion +isActive +mustChangePassword +passwordChangedAt');
      
      if (!user) {
        return next(new ApiError('No user found with this token', 401));
      }

      // Check if user account is active
      if (!user.isActive) {
        return next(new ApiError('User account is deactivated', 401));
      }

      // Check if user needs to change password
      if (user.mustChangePassword) {
        return next(new ApiError('Password change required', 403));
      }

      // Check if token version matches
      if (decoded.tokenVersion !== user.tokenVersion) {
        return next(new ApiError('Session expired. Please log in again.', 401));
      }

      // Check if JWT was issued before password was last changed
      if (user.changedPasswordAfter(decoded.iat)) {
        return next(
          new ApiError('User recently changed password. Please log in again.', 401)
        );
      }

      // Add user to request object (without sensitive data)
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        mustChangePassword: user.mustChangePassword,
        tokenVersion: user.tokenVersion
      };
      
      // Log successful authentication
      logger.info(`User authenticated: ${user.email}`, {
        userId: user._id,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      
      next();
    } catch (error) {
      // Handle token expiration specifically
      if (error.name === 'TokenExpiredError') {
        return next(new ApiError('Your session has expired. Please log in again.', 401));
      }
      
      // Handle invalid token
      if (error.name === 'JsonWebTokenError') {
        return next(new ApiError('Invalid token. Please log in again.', 401));
      }
      
      logger.error(`Authentication error: ${error.message}`, {
        error: error.stack,
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      
      return next(new ApiError('Not authorized to access this route', 401));
    }
  } catch (error) {
    logger.error(`Unexpected error in protect middleware: ${error.message}`, {
      error: error.stack,
      ip: req?.ip,
      userAgent: req?.get('user-agent')
    });
    next(error);
  }
};

/**
 * Grant access to specific roles
 * @param  {...String} roles - Allowed user roles
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError('Authentication required', 401));
      }
      
      // Check if user has one of the required roles
      if (!roles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role} to route ${req.originalUrl}`);
        return next(
          new ApiError(
            `User role ${req.user.role} is not authorized to access this route`,
            403
          )
        );
      }
      
      // Log successful authorization
      logger.info(`User ${req.user.id} authorized for role(s): ${roles.join(', ')}`);
      
      next();
    } catch (error) {
      logger.error(`Authorization error: ${error.message}`, {
        error: error.stack,
        userId: req.user?.id,
        route: req.originalUrl
      });
      next(error);
    }
  };
};

/**
 * Check if user's email is verified
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireVerification = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }
    
    if (!req.user.isVerified) {
      logger.warn(`Unverified email access attempt by user ${req.user.id}`);
      return next(
        new ApiError(
          'Please verify your email address to access this resource',
          403
        )
      );
    }
    
    next();
  } catch (error) {
    logger.error(`Email verification check error: ${error.message}`, {
      error: error.stack,
      userId: req.user?.id
    });
    next(error);
  }
};

/**
 * Check if user has completed onboarding
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireOnboarding = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError('Authentication required', 401));
    }
    
    // Check if user has completed onboarding
    if (!req.user.onboardingComplete) {
      return next(
        new ApiError('Please complete your profile setup to continue', 403)
      );
    }
    
    next();
  } catch (error) {
    logger.error(`Onboarding check error: ${error.message}`, {
      error: error.stack,
      userId: req.user?.id
    });
    next(error);
  }
};

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @returns {String} JWT access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion
    },
    process.env.JWT_ACCESS_SECRET,
    { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
      algorithm: 'HS256',
      issuer: 'helensvale-connect-api',
      audience: ['helensvale-connect-web', 'helensvale-connect-mobile']
    }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} user - User object
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      tokenVersion: user.tokenVersion,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      algorithm: 'HS256',
      issuer: 'helensvale-connect-api',
      audience: ['helensvale-connect-web', 'helensvale-connect-mobile']
    }
  );
};

/**
 * Generate and set JWT tokens in HTTP-only cookies
 * @param {Object} user - User object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {String} [message] - Optional success message
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // Set secure cookie options
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    path: '/',
    maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || '900') * 1000, // 15 minutes
    domain: process.env.COOKIE_DOMAIN || undefined
  };

  // Set refresh token cookie with longer expiration
  const refreshTokenOptions = {
    ...cookieOptions,
    maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN || '604800') * 1000, // 7 days
    path: '/api/v1/auth/refresh-token' // Only send refresh token on refresh endpoint
  };

  // Set secure HTTP-only cookies
  res.cookie('token', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenOptions);

  // Remove sensitive data from response
  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;
  delete userData.resetPasswordToken;
  delete userData.emailVerificationToken;
  delete userData.tokenVersion;
  delete userData.loginAttempts;
  delete userData.lockUntil;

  // Log successful token generation
  logger.info(`Generated tokens for user: ${user.email}`, {
    userId: user._id,
    ip: res.req.ip,
    userAgent: res.req.get('user-agent')
  });

  // Send response
  res.status(statusCode).json({
    success: true,
    accessToken,
    expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN || '900'),
    refreshToken: undefined, // Don't send refresh token in response body
    tokenType: 'Bearer',
    user: userData,
    message
  });
};

/**
 * Generate a random token for email verification, password reset, etc.
 * @param {Number} [bytes=32] - Number of random bytes to generate
 * @returns {String} Hex-encoded random string
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

// Export middleware functions
module.exports = {
  protect,
  authorize,
  requireVerification,
  requireOnboarding,
  authLimiter,
  refreshTokenLimiter,
  securityHeaders,
  generateAccessToken,
  generateRefreshToken,
  sendTokenResponse,
  generateRandomToken
};
