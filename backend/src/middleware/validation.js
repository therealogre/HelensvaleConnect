const { body } = require('express-validator');

// User registration validation
exports.validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['customer', 'vendor'])
    .withMessage('Role must be either customer or vendor')
];

// User login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Update password validation
exports.validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Forgot password validation
exports.validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// Reset password validation
exports.validateResetPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Vendor registration validation
exports.validateVendorRegistration = [
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  
  body('businessType')
    .isIn(['restaurant', 'retail', 'service', 'health', 'beauty', 'fitness', 'education', 'entertainment', 'other'])
    .withMessage('Please select a valid business type'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('location.address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('location.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('location.address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  
  body('location.address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  
  body('location.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  
  body('location.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  
  body('contact.phone')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  
  body('contact.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

// Booking validation
exports.validateBooking = [
  body('vendor')
    .isMongoId()
    .withMessage('Valid vendor ID is required'),
  
  body('service.id')
    .isMongoId()
    .withMessage('Valid service ID is required'),
  
  body('bookingDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid booking date is required'),
  
  body('timeSlot.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required (HH:MM format)'),
  
  body('timeSlot.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required (HH:MM format)'),
  
  body('participants')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Participants must be between 1 and 20'),
  
  body('payment.method')
    .isIn(['cash', 'card', 'mobile_money', 'bank_transfer'])
    .withMessage('Valid payment method is required')
];
