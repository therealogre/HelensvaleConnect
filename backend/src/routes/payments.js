const express = require('express');
const {
  createPayment,
  handlePayNowResult,
  checkPaymentStatus,
  getPaymentHistory,
  processVendorPayout
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/paynow/result', handlePayNowResult);

// Protected routes
router.use(protect);

// Customer payment routes
router.post('/create', createPayment);
router.get('/status/:reference', checkPaymentStatus);
router.get('/history', getPaymentHistory);

// Admin routes
router.post('/payout/:vendorId', authorize('admin'), processVendorPayout);

module.exports = router;
