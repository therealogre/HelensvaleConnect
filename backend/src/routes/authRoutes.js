const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', authController.getMe);
router.put('/update-details', authController.updateDetails);
router.put('/update-password', authController.updatePassword);
router.post('/logout', authController.logout);

// Admin only routes
router.use(authorize('admin'));
router.get('/users', authController.getUsers);

module.exports = router;
