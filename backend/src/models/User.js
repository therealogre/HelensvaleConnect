const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'vendor'
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
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
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
  lastLogin: {
    type: Date,
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

module.exports = mongoose.model('User', userSchema);
