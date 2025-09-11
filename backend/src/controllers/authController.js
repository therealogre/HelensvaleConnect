const crypto = require('crypto');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const { sendTokenResponse } = require('../middleware/auth');

// Rate limiting and security headers are applied in the auth routes

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, errors.array());
    }

    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      role = 'customer', // Default to customer
      businessType = 'other' 
    } = req.body;

    // Check if user already exists (case-insensitive email check)
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (existingUser) {
      throw new ApiError('User with this email already exists', 400);
    }

    // Create user with trimmed and validated data
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.replace(/\s+/g, ''), // Remove all whitespace
      password,
      role,
      businessType: role === 'vendor' ? businessType : undefined
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

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError('Please provide email and password', 400);
    }

    // Check for user (case-insensitive email check)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      logger.warn(`Failed login attempt - User not found: ${email}`);
      throw new ApiError('Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      const retryAfter = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      throw new ApiError(
        `Account locked. Try again in ${retryAfter} minutes.`,
        423, // Locked status
        { retryAfter: user.lockUntil }
      );
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts on failed login
      await user.incrementLoginAttempts();
      
      const attemptsLeft = 5 - (user.loginAttempts + 1);
      const message = attemptsLeft > 0 
        ? `Invalid email or password. ${attemptsLeft} attempts left.`
        : 'Too many failed attempts. Account locked for 30 minutes.';
      
      logger.warn(`Failed login attempt for user: ${user.email}`);
      
      throw new ApiError(message, 401, { 
        attemptsLeft: Math.max(0, attemptsLeft) 
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new ApiError('Please verify your email address before logging in', 403);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ApiError('Your account has been deactivated', 403);
    }

    // Check if password change is required
    if (user.mustChangePassword) {
      return res.status(200).json({
        success: true,
        mustChangePassword: true,
        message: 'Password change required',
        tempToken: user.getSignedJwtToken() // Short-lived token for password change only
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // Populate additional user data based on role
    const user = await User.findById(req.user.id)
      .select('-password -__v -loginAttempts -lockUntil')
      .lean();

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Add sensitive data to audit log (not sent to client)
    logger.info(`User profile accessed: ${user.email}`, {
      userId: user._id,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Get user profile error: ${error.message}`, {
      userId: req.user?.id,
      error: error.stack
    });
    next(error);
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/v1/auth/me
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, address, preferences } = req.body;
    
    // Validate input
    if (!firstName && !lastName && !email && !phone && !address && !preferences) {
      throw new ApiError('At least one field is required to update', 400);
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName.trim();
    if (lastName) updateFields.lastName = lastName.trim();
    if (phone) updateFields.phone = phone.replace(/\s+/g, '');
    if (address) updateFields.address = address;
    if (preferences) updateFields.preferences = preferences;

    // Handle email update separately as it requires verification
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if email is already in use
      const existingUser = await User.findOne({ 
        email: normalizedEmail,
        _id: { $ne: req.user.id } // Exclude current user
      });
      
      if (existingUser) {
        throw new ApiError('Email is already in use', 400);
      }
      
      // If email is being updated, require verification
      if (normalizedEmail !== req.user.email) {
        updateFields.email = normalizedEmail;
        updateFields.isVerified = false;
        
        // Generate new verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        updateFields.emailVerificationToken = crypto
          .createHash('sha256')
          .update(verificationToken)
          .digest('hex');
        updateFields.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        
        // Send verification email
        try {
          const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
          await emailService.sendVerificationEmail(
            normalizedEmail, 
            req.user.firstName, 
            verificationUrl
          );
        } catch (emailError) {
          logger.error(`Email verification error during update: ${emailError.message}`, {
            userId: req.user.id,
            email: normalizedEmail
          });
          throw new ApiError('Failed to send verification email', 500);
        }
      }
    }

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => 
      updateFields[key] === undefined && delete updateFields[key]
    );

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).select('-password -__v -loginAttempts -lockUntil');
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Log the update
    logger.info(`User profile updated: ${user.email}`, {
      userId: user._id,
      updatedFields: Object.keys(updateFields)
    });

    res.status(200).json({
      success: true,
      data: user,
      message: updateFields.isVerified === false 
        ? 'Profile updated successfully. Please verify your new email address.' 
        : 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      throw new ApiError('Please provide both current and new password', 400);
    }
    
    // Prevent setting the same password
    if (currentPassword === newPassword) {
      throw new ApiError('New password must be different from current password', 400);
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password +passwordChangedAt');
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check current password
    if (!(await user.comparePassword(currentPassword))) {
      // Track failed password attempts
      user.passwordAttempts = (user.passwordAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      
      const attemptsLeft = 5 - user.passwordAttempts;
      
      if (attemptsLeft <= 0) {
        // Lock account after too many failed attempts
        user.accountLockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save({ validateBeforeSave: false });
        
        throw new ApiError(
          'Too many failed attempts. Account locked for 30 minutes.',
          423,
          { retryAfter: 30 * 60 } // 30 minutes in seconds
        );
      }
      
      throw new ApiError(
        `Incorrect current password. ${attemptsLeft} attempts remaining.`,
        401,
        { attemptsLeft }
      );
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    user.passwordAttempts = 0; // Reset failed attempts
    user.accountLockedUntil = undefined; // Unlock if previously locked
    user.mustChangePassword = false; // Reset password change flag if set
    
    await user.save();
    
    // Log the password change
    logger.info(`Password updated for user: ${user.email}`, {
      userId: user._id,
      passwordChangedAt: user.passwordChangedAt
    });
    
    // Invalidate all sessions by changing the token version
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save({ validateBeforeSave: false });

    // Send password change confirmation email
    try {
      await emailService.sendPasswordChangeConfirmation(
        user.email,
        user.firstName,
        new Date().toLocaleString()
      );
    } catch (emailError) {
      // Log but don't fail the request
      logger.error('Failed to send password change confirmation email', {
        userId: user._id,
        error: emailError.message
      });
    }

    // Send new token with updated user data
    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot password - Generate reset token and send email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ApiError('Please provide an email address', 400);
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    // Always return success to prevent email enumeration
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent'
      });
    }
    
    // Check if there's a recent reset attempt
    if (user.resetPasswordExpires && user.resetPasswordExpires > Date.now()) {
      const retryAfter = Math.ceil((user.resetPasswordExpires - Date.now()) / 1000 / 60);
      throw new ApiError(
        `A password reset has already been requested. Please wait ${retryAfter} minutes before requesting another.`,
        429,
        { retryAfter: user.resetPasswordExpires }
      );
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetUrl
      );

      logger.info(`Password reset email sent to: ${user.email}`, {
        userId: user._id,
        resetUrl: resetUrl // Log hashed URL in production
      });

      res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent'
      });
    } catch (error) {
      // Reset token on email failure
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      logger.error(`Failed to send password reset email: ${error.message}`, {
        userId: user._id,
        error: error.stack
      });

      throw new ApiError('Failed to send password reset email. Please try again later.', 500);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password with token
 * @route   PUT /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      throw new ApiError('Invalid or missing reset token', 400);
    }

    if (!password || !confirmPassword) {
      throw new ApiError('Please provide both password and confirm password', 400);
    }

    if (password !== confirmPassword) {
      throw new ApiError('Passwords do not match', 400);
    }

    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token and check expiration
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError('Invalid or expired reset token', 400);
    }

    // Check if password was used recently
    const isRecentPassword = await user.comparePassword(password);
    if (isRecentPassword) {
      throw new ApiError('Cannot use a previously used password', 400);
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordChangedAt = Date.now();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordAttempts = 0; // Reset any failed attempts
    user.accountLockedUntil = undefined; // Unlock if previously locked
    
    // Invalidate all sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    
    await user.save();
    
    // Log the password reset
    logger.info(`Password reset successful for user: ${user.email}`, {
      userId: user._id,
      passwordChangedAt: user.passwordChangedAt
    });
    
    // Send password change confirmation
    try {
      await emailService.sendPasswordChangeConfirmation(
        user.email,
        user.firstName,
        new Date().toLocaleString()
      );
    } catch (emailError) {
      logger.error('Failed to send password reset confirmation email', {
        userId: user._id,
        error: emailError.message
      });
    }

    sendTokenResponse(user, 200, res, 'Password has been reset successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email with token
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      throw new ApiError('Invalid or missing verification token', 400);
    }

    // Hash the token from URL
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by token and check expiration
    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ApiError('Invalid or expired verification token', 400);
    }

    // Update user verification status
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    // If this is a new signup, log the verification
    const isNewUser = user.signupDate && 
      (Date.now() - new Date(user.signupDate).getTime()) < 24 * 60 * 60 * 1000; // Within 24h of signup
    
    await user.save({ validateBeforeSave: false });
    
    // Log the verification
    logger.info(`Email verified for user: ${user.email}`, {
      userId: user._id,
      isNewUser
    });
    
    // Send welcome email for new users
    if (isNewUser) {
      try {
        await emailService.sendWelcomeEmail(
          user.email,
          user.firstName,
          `${process.env.FRONTEND_URL}/dashboard`
        );
      } catch (emailError) {
        logger.error('Failed to send welcome email', {
          userId: user._id,
          error: emailError.message
        });
      }
    }

    // Redirect to login with success message
    const redirectUrl = `${process.env.FRONTEND_URL}/login?verified=true`;
    return res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend verification email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Public
 */
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ApiError('Please provide an email address', 400);
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    // Always return success to prevent email enumeration
    if (!user) {
      logger.warn(`Verification resend requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a verification link has been sent'
      });
    }
    
    // Check if already verified
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'This email has already been verified. You can now log in.'
      });
    }
    
    // Check rate limiting for verification emails
    const now = Date.now();
    const lastSent = user.emailVerificationLastSent || 0;
    const timeSinceLastSent = now - lastSent;
    const minTimeBetweenEmails = 5 * 60 * 1000; // 5 minutes
    
    if (timeSinceLastSent < minTimeBetweenEmails) {
      const waitTime = Math.ceil((minTimeBetweenEmails - timeSinceLastSent) / 1000 / 60);
      throw new ApiError(
        `Please wait ${waitTime} minutes before requesting another verification email`,
        429,
        { retryAfter: lastSent + minTimeBetweenEmails }
      );
    }

    // Generate new verification token
    const verificationToken = user.getEmailVerificationToken();
    user.emailVerificationLastSent = Date.now();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await emailService.sendVerificationEmail(
        user.email, 
        user.firstName, 
        verificationUrl
      );
      
      logger.info(`Verification email resent to: ${user.email}`, {
        userId: user._id
      });

      res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a verification link has been sent'
      });
    } catch (error) {
      // Reset token on email failure
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      user.emailVerificationLastSent = undefined;
      await user.save({ validateBeforeSave: false });
      
      logger.error(`Failed to resend verification email: ${error.message}`, {
        userId: user._id,
        error: error.stack
      });

      throw new ApiError('Failed to send verification email. Please try again later.', 500);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user / clear cookies
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
exports.logout = (req, res, next) => {
  try {
    // Clear all auth cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined
    };

    res
      .status(200)
      .clearCookie('token', cookieOptions)
      .clearCookie('refreshToken', { ...cookieOptions, path: '/api/v1/auth/refresh-token' })
      .json({
        success: true,
        message: 'Successfully logged out'
      });
      
    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);
  } catch (error) {
    logger.error(`Logout error: ${error.message}`, { error: error.stack });
    next(error);
  }
};

/**
 * Helper function to generate JWT token, set secure HTTP-only cookies, and send response
 */
/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public - requires refresh token in cookies
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      throw new ApiError('No refresh token provided', 401);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and verify token version
    const user = await User.findOne({
      _id: decoded.id,
      isActive: true,
      isVerified: true
    }).select('+tokenVersion');

    if (!user) {
      throw new ApiError('User not found or account not active', 401);
    }

    // Check if token was revoked
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new ApiError('Refresh token is no longer valid', 401);
    }

    // Generate new tokens
    const newAccessToken = user.getSignedJwtAccessToken();
    const newRefreshToken = user.getSignedJwtRefreshToken();

    // Update token version to invalidate old refresh token
    user.tokenVersion += 1;
    await user.save({ validateBeforeSave: false });

    // Set secure cookie options
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: process.env.ACCESS_TOKEN_EXPIRES_IN * 1000,
      domain: process.env.COOKIE_DOMAIN || undefined
    };

    const refreshTokenOptions = {
      ...cookieOptions,
      maxAge: process.env.REFRESH_TOKEN_EXPIRES_IN * 1000,
      path: '/api/v1/auth/refresh-token'
    };

    // Set new cookies
    res.cookie('token', newAccessToken, cookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshTokenOptions);

    // Log token refresh
    logger.info(`Token refreshed for user: ${user.email}`, {
      userId: user._id,
      tokenVersion: user.tokenVersion
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      tokenType: 'Bearer'
    });
  } catch (error) {
    // Clear invalid refresh token
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.clearCookie('refreshToken', {
        path: '/api/v1/auth/refresh-token',
        domain: process.env.COOKIE_DOMAIN || undefined
      });
      logger.warn('Invalid or expired refresh token used', { error: error.message });
      return next(new ApiError('Session expired. Please log in again.', 401));
    }
    next(error);
  }
};
