const express = require('express');
const {
  getPaymentMethods,
  getExchangeRates,
  calculatePayment,
  createPayment,
  checkPaymentStatus,
  paynowCallback,
  convertCurrency
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);
router.get('/exchange-rates', getExchangeRates);
router.post('/calculate', calculatePayment);
router.post('/convert', convertCurrency);

// Webhook routes (no auth required)
router.post('/paynow/callback', paynowCallback);

// Protected routes
router.use(protect);
router.post('/create', createPayment);
router.get('/:reference/status', checkPaymentStatus);

module.exports = router;
