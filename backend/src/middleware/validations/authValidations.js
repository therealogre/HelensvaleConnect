const { body, param } = require('express-validator');
const crypto = require('crypto');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');

/**
 * User registration validation
 * Validates all required fields and checks for existing email
 */
const validateRegister = [
  // First name validation
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage('First name can only contain letters, spaces, and hyphens'),
  
  // Last name validation
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage('Last name can only contain letters, spaces, and hyphens'),
  
  // Email validation
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        throw new Error('Email is already in use');
      }
      return true;
    }),
  
  // Phone validation
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('en-AU')
    .withMessage('Please provide a valid Australian phone number')
    .customSanitizer(phone => phone.replace(/[^\d+]/g, '')), // Remove non-numeric chars except +
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)')
    .custom((value, { req }) => {
      if (value === req.body.email) {
        throw new Error('Password cannot be the same as your email');
      }
      return true;
    }),
  
  // Confirm password validation
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  // Role validation
  body('role')
    .optional()
    .isIn(['customer', 'vendor', 'admin'])
    .withMessage('Invalid role specified'),
  
  // Business name validation (for vendors)
  body('businessName')
    .if((value, { req }) => req.body.role === 'vendor')
    .trim()
    .notEmpty().withMessage('Business name is required for vendors')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters')
    .matches(/^[A-Za-z0-9\s\-&',.()]+$/i)
    .withMessage('Business name contains invalid characters'),
  
  // Terms acceptance
  body('acceptTerms')
    .exists()
    .withMessage('You must accept the terms and conditions')
    .isBoolean()
    .withMessage('Invalid terms acceptance value')
    .toBoolean()
    .isBoolean({ strict: true })
    .withMessage('You must accept the terms and conditions')
    .custom(value => {
      if (value !== true) {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    })
];

/**
 * User login validation
 * Validates login credentials
 */
const validateLogin = [
  // Email validation
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+loginAttempts +lockUntil +isActive');
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check if account is locked
      if (user.isLocked && user.lockUntil > Date.now()) {
        const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
        throw new Error(`Account is locked. Try again in ${minutesLeft} minutes.`);
      }
      
      // Attach user to request for further validation
      req.user = user;
      return true;
    }),
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Password is required')
    .custom(async (password, { req }) => {
      if (!req.user) return true; // Skip if user not found (handled by email check)
      
      const isMatch = await req.user.comparePassword(password);
      if (!isMatch) {
        // Increment login attempts
        await req.user.incrementLoginAttempts();
        throw new Error('Invalid email or password');
      }
      
      // Reset login attempts on successful login
      if (req.user.loginAttempts > 0 || req.user.lockUntil) {
        req.user.loginAttempts = 0;
        req.user.lockUntil = undefined;
        await req.user.save();
      }
      
      return true;
    })
];

/**
 * Forgot password request validation
 * Validates email for password reset request
 */
const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        // Don't reveal if email doesn't exist (security best practice)
        return true;
      }
      
      // Rate limiting check for password reset requests
      if (user.resetPasswordRetries >= 5) {
        const lastReset = user.resetPasswordLastAttempt || 0;
        const timeSinceLastReset = Date.now() - lastReset;
        const cooldownPeriod = 15 * 60 * 1000; // 15 minutes
        
        if (timeSinceLastReset < cooldownPeriod) {
          const minutesLeft = Math.ceil((cooldownPeriod - timeSinceLastReset) / (60 * 1000));
          throw new Error(`Too many reset attempts. Please try again in ${minutesLeft} minutes.`);
        } else {
          // Reset counter if cooldown period has passed
          user.resetPasswordRetries = 0;
          await user.save();
        }
      }
      
      return true;
    })
];

/**
 * Reset password validation
 * Validates password reset token and new password
 */
const validateResetPassword = [
  // Token validation
  param('token')
    .trim()
    .notEmpty().withMessage('Reset token is required')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid reset token format')
    .custom(async (token, { req }) => {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Password reset token is invalid or has expired');
      }
      
      // Attach user to request for further processing
      req.user = user;
      return true;
    }),
    
  // New password validation
  body('password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)')
    .custom((value, { req }) => {
      // Check if new password is different from old password
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
    
  // Confirm password validation
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/**
 * Update password validation
 * Validates current and new password for password update
 */
const validateUpdatePassword = [
  // Current password validation
  body('currentPassword')
    .notEmpty().withMessage('Current password is required')
    .custom(async (password, { req }) => {
      if (!req.user) {
        throw new Error('User not authenticated');
      }
      
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }
      
      return true;
    }),
    
  // New password validation
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)')
    .custom((value, { req }) => {
      // Check if new password is different from current password
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
    
  // Confirm new password validation
  body('confirmNewPassword')
    .notEmpty().withMessage('Please confirm your new password')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

/**
 * Update user details validation
 * Validates user profile updates
 */
const validateUpdateDetails = [
  // First name validation
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage('First name can only contain letters, spaces, and hyphens'),
    
  // Last name validation
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[A-Za-z\s-]+$/)
    .withMessage('Last name can only contain letters, spaces, and hyphens'),
    
  // Email validation
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email, { req }) => {
      if (email === req.user.email) {
        return true; // No change to email
      }
      
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        throw new Error('Email is already in use');
      }
      
      return true;
    }),
    
  // Phone validation
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('en-AU')
    .withMessage('Please provide a valid Australian phone number')
    .customSanitizer(phone => phone.replace(/[^\d+]/g, '')), // Remove non-numeric chars except +
    
  // Avatar URL validation
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL for the avatar')
    .matches(/\.(jpeg|jpg|gif|png|webp)$/i)
    .withMessage('Avatar must be a valid image URL (JPEG, JPG, GIF, PNG, or WebP)')
];

/**
 * Email verification validation
 * Validates email verification token
 */
const validateEmailVerification = [
  param('token')
    .trim()
    .notEmpty().withMessage('Verification token is required')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid verification token format')
    .custom(async (token, { req }) => {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new Error('Email verification token is invalid or has expired');
      }
      
      // Check if email is already verified
      if (user.isVerified) {
        throw new Error('Email is already verified');
      }
      
      // Attach user to request for further processing
      req.user = user;
      return true;
    })
];

/**
 * Resend verification email validation
 * Validates email for resending verification
 */
const validateResendVerification = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        throw new Error('No account found with this email');
      }
      
      if (user.isVerified) {
        throw new Error('Email is already verified');
      }
      
      // Rate limiting check for verification requests
      if (user.emailVerificationLastSent) {
        const timeSinceLastSent = Date.now() - user.emailVerificationLastSent;
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes
        
        if (timeSinceLastSent < cooldownPeriod) {
          const minutesLeft = Math.ceil((cooldownPeriod - timeSinceLastSent) / (60 * 1000));
          throw new Error(`Please wait ${minutesLeft} minutes before requesting another verification email`);
        }
      }
      
      return true;
    })
];

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
  validateUpdateDetails,
  validateEmailVerification,
  validateResendVerification
};
