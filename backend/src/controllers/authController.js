const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { getSignedJwtToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, password, role, businessType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'vendor',
      businessType: businessType || 'other'
    });

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await emailService.sendVerificationEmail(user.email, user.firstName, verificationUrl);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Send token response
    sendTokenResponse(user, 201, res, 'Registration successful! Please check your email to verify your account.');

  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in.',
        requiresVerification: true
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // If user is a vendor, get vendor details
    let vendorDetails = null;
    if (user.role === 'vendor') {
      vendorDetails = await Vendor.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        vendor: vendorDetails
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      address: req.body.address,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // For now, return the token (in production, this should be sent via email)
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetToken: resetToken // Remove this in production
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    // Get hashed token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Verify user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
      await emailService.sendVerificationEmail(user.email, user.firstName, verificationUrl);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = getSignedJwtToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
};
