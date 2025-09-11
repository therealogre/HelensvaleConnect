const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// Security middleware configurations
const securityConfig = {
  // Helmet configuration for security headers
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.stripe.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // CORS configuration
  cors: cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://helensvaleconnect.netlify.app',
        'https://helensvale-connect.vercel.app'
      ];
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }),

  // Rate limiting rules
  rateLimits: {
    // General API rate limit
    general: createRateLimit(
      15 * 60 * 1000, // 15 minutes
      100, // limit each IP to 100 requests per windowMs
      'Too many requests from this IP, please try again later'
    ),

    // Auth endpoints (stricter)
    auth: createRateLimit(
      15 * 60 * 1000, // 15 minutes
      5, // limit each IP to 5 requests per windowMs
      'Too many authentication attempts, please try again later'
    ),

    // Password reset (very strict)
    passwordReset: createRateLimit(
      60 * 60 * 1000, // 1 hour
      3, // limit each IP to 3 requests per windowMs
      'Too many password reset attempts, please try again later'
    ),

    // File upload
    upload: createRateLimit(
      15 * 60 * 1000, // 15 minutes
      10, // limit each IP to 10 uploads per windowMs
      'Too many file uploads, please try again later'
    ),

    // Search endpoints
    search: createRateLimit(
      1 * 60 * 1000, // 1 minute
      30, // limit each IP to 30 searches per minute
      'Too many search requests, please slow down'
    )
  },

  // Data sanitization
  mongoSanitize: mongoSanitize(),
  
  // XSS protection
  xss: xss(),
  
  // HTTP Parameter Pollution protection
  hpp: hpp({
    whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'location']
  })
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove powered by header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Input validation helpers
const validateInput = {
  // Sanitize string input
  sanitizeString: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number (South African format)
  isValidPhone: (phone) => {
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validate password strength
  isStrongPassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  },

  // Validate ObjectId format
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    // Log suspicious activity
    if (res.statusCode >= 400) {
      console.warn('Suspicious request:', logData);
    }
  });
  
  next();
};

module.exports = {
  securityConfig,
  securityHeaders,
  validateInput,
  requestLogger
};
