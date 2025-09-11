const express = require('express');
const authController = require('../controllers/authController');
const { 
  validateRegister, 
  validateLogin, 
  validateUpdatePassword, 
  validateForgotPassword, 
  validateResetPassword,
  validateUpdateDetails,
  validateEmailVerification,
  validateResendVerification
} = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password/:token', validateResetPassword, authController.resetPassword);
router.get('/verify-email/:token', validateEmailVerification, authController.verifyEmail);
router.post('/resend-verification', validateResendVerification, authController.resendVerification);

// Protected routes (authentication required)
router.use(protect);

router.get('/me', authController.getMe);
router.put('/update-details', validateUpdateDetails, authController.updateDetails);
router.put('/update-password', validateUpdatePassword, authController.updatePassword);
router.post('/logout', authController.logout);

// Admin only routes
router.use(authorize('admin'));
router.get('/users', authController.getUsers);

module.exports = router;
