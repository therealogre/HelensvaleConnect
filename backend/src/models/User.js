const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const ApiError = require('../utils/ApiError');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetRetries: {
    type: Number,
    default: 0,
    max: [3, 'Too many password reset attempts. Please try again later.']
  },
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  businessType: {
    type: String,
    enum: ['beauty_wellness', 'automotive', 'food_beverage', 'home_services', 'professional_services', 'retail', 'health_fitness', 'education', 'technology', 'other'],
    required: function() { return this.role === 'vendor'; }
  },
  subscriptionPlan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['inactive', 'active', 'cancelled', 'past_due'],
    default: 'inactive'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now,
    select: false
  },
  deviceInfo: [
    {
      userAgent: String,
      ipAddress: String,
      lastUsed: Date,
      isCurrent: Boolean
    }
  ],
  securityQuestions: [
    {
      question: String,
      answer: String,
      createdAt: Date
    }
  ],
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    select: false
  },
  mfaBackupCodes: [
    {
      code: String,
      used: {
        type: Boolean,
        default: false
      }
    }
  ],
  tokenVersion: {
    type: Number,
    default: 0,
    select: false
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Australia'
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  avatar: {
    type: String,
    default: null
  },
  businessType: {
    type: String,
    enum: ['beauty_wellness', 'automotive', 'food_beverage', 'home_services', 'professional_services', 'retail', 'health_fitness', 'education', 'technology', 'other'],
    required: function() { return this.role === 'vendor'; }
  },
  subscriptionPlan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise'],
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['inactive', 'active', 'cancelled', 'past_due'],
    default: 'inactive'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // Lock for 30 minutes
  }
  
  return await this.updateOne(updates);
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Check if account is locked
    if (this.isLocked) {
      const now = Date.now();
      const lockTime = this.lockUntil.getTime();
      const timeLeft = Math.ceil((lockTime - now) / 1000 / 60); // in minutes
      
      if (now < lockTime) {
        throw new ApiError(
          `Account is locked. Try again in ${timeLeft} minutes.`,
          423
        );
      }
      
      // Unlock account if lock has expired
      this.isLocked = false;
      this.loginAttempts = 0;
      this.lockUntil = undefined;
      await this.save({ validateBeforeSave: false });
    }
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    // Reset login attempts on successful login
    if (isMatch && (this.loginAttempts > 0 || this.lockUntil)) {
      this.loginAttempts = 0;
      this.lockUntil = undefined;
      this.lastLogin = Date.now();
      await this.save({ validateBeforeSave: false });
    }
    
    return isMatch;
  } catch (error) {
    // Only increment attempts for invalid password errors
    if (error.name !== 'ApiError') {
      // Increment failed login attempts
      this.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 30 minutes
      if (this.loginAttempts >= 5) {
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        this.isLocked = true;
        
        await this.save({ validateBeforeSave: false });
        
        throw new ApiError(
          'Account locked due to too many failed login attempts. Try again in 30 minutes.',
          423
        );
      }
      
      await this.save({ validateBeforeSave: false });
    }
    
    throw error;
  }
};

// Generate JWT access token
userSchema.methods.getSignedJwtAccessToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role,
      tokenVersion: this.tokenVersion
    },
    process.env.JWT_ACCESS_SECRET,
    { 
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m', // 15 minutes
      algorithm: 'HS256'
    }
  );
};

// Generate JWT refresh token
userSchema.methods.getSignedJwtRefreshToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      tokenVersion: this.tokenVersion
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d', // 7 days
      algorithm: 'HS256'
    }
  );
};

// Generate password reset token with expiration
userSchema.methods.getPasswordResetToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate email verification token with expiration
userSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire (24 hours)
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  this.emailVerificationLastSent = Date.now();

  return verificationToken;
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// Generate MFA secret for two-factor authentication
userSchema.methods.generateMfaSecret = function() {
  const secret = crypto.randomBytes(20).toString('hex');
  this.mfaSecret = secret;
  
  // Generate backup codes
  const backupCodes = [];
  for (let i = 0; i < 10; i++) {
    backupCodes.push({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      used: false
    });
  }
  
  this.mfaBackupCodes = backupCodes;
  return { secret, backupCodes };
};

// Verify MFA token
userSchema.methods.verifyMfaToken = function(token) {
  if (!this.mfaEnabled || !this.mfaSecret) {
    throw new ApiError('MFA is not enabled for this account', 400);
  }
  
  // In a real app, you would use a TOTP library like speakeasy
  // This is a simplified example
  const isValid = true; // Replace with actual TOTP verification
  
  if (!isValid) {
    throw new ApiError('Invalid verification code', 401);
  }
  
  return true;
};

// Verify MFA backup code
userSchema.methods.verifyBackupCode = function(code) {
  if (!this.mfaBackupCodes || !this.mfaBackupCodes.length) {
    throw new ApiError('No backup codes available', 400);
  }
  
  const backupCode = this.mfaBackupCodes.find(
    bc => bc.code === code && !bc.used
  );
  
  if (!backupCode) {
    throw new ApiError('Invalid or used backup code', 401);
  }
  
  // Mark code as used
  backupCode.used = true;
  return true;
};

// Document middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash the password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set password changed timestamp (1 second in the past to ensure token is created after)
    this.passwordChangedAt = Date.now() - 1000;
    
    // Clear reset token if it exists
    if (this.resetPasswordToken) {
      this.resetPasswordToken = undefined;
      this.resetPasswordExpires = undefined;
      this.resetPasswordRetries = 0;
    }
    
    // Clear verification token if it exists
    if (this.emailVerificationToken) {
      this.emailVerificationToken = undefined;
      this.emailVerificationExpires = undefined;
    }
    
    // Increment token version to invalidate all existing tokens
    this.tokenVersion = (this.tokenVersion || 0) + 1;
    
    next();
  } catch (error) {
    next(error);
  }
});

// Query middleware to filter out inactive users by default
userSchema.pre(/^find/, function(next) {
  // Only include active users in query results
  this.find({ isActive: { $ne: false } });
  next();
});

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email }).select('+password +loginAttempts +lockUntil');
  
  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    throw new ApiError('Invalid email or password', 401);
  }
  
  // Update last login timestamp
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  
  return user;
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ emailVerificationToken: 1 });

module.exports = mongoose.model('User', userSchema);
