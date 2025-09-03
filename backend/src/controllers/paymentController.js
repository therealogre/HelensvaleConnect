const paymentService = require('../services/paymentService');
const currencyService = require('../services/currencyService');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Get supported payment methods
// @route   GET /api/payments/methods
// @access  Public
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const methods = paymentService.getSupportedMethods();
    const exchangeRates = currencyService.getCurrentRates();
    
    res.status(200).json({
      success: true,
      data: {
        methods,
        exchangeRates,
        baseCurrency: 'ZIG'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current exchange rates
// @route   GET /api/payments/exchange-rates
// @access  Public
exports.getExchangeRates = async (req, res, next) => {
  try {
    const rates = currencyService.getCurrentRates();
    const popularPairs = currencyService.getPopularPairs();
    
    res.status(200).json({
      success: true,
      data: {
        rates,
        popularPairs,
        lastUpdated: rates.lastUpdated
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate payment breakdown
// @route   POST /api/payments/calculate
// @access  Public
exports.calculatePayment = async (req, res, next) => {
  try {
    const { amount, currency = 'ZIG', method = 'paynow' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    const breakdown = currencyService.calculatePaymentBreakdown(amount, currency);
    const methodBreakdown = breakdown.methods[method];
    
    if (!methodBreakdown) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        breakdown,
        selectedMethod: {
          method,
          ...methodBreakdown
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create payment for booking
// @route   POST /api/payments/create
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { bookingId, paymentMethod, phone } = req.body;
    
    // Get booking details
    const booking = await Booking.findById(bookingId).populate('vendor customer');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns this booking
    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }
    
    // Check if already paid
    if (booking.payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }
    
    const paymentData = {
      amount: booking.totalAmount,
      currency: 'ZIG',
      reference: `BOOKING_${bookingId}`,
      email: booking.customer.email,
      phone: phone || booking.customer.phone,
      description: `Payment for ${booking.service.name} - ${booking.vendor.businessName}`,
      bookingId: bookingId
    };
    
    let paymentResult;
    
    switch (paymentMethod) {
      case 'paynow':
        paymentResult = await paymentService.createPayNowPayment(paymentData);
        break;
      case 'ecocash':
        paymentResult = await paymentService.createEcoCashPayment(paymentData);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }
    
    // Update booking with payment details
    booking.payment = {
      ...booking.payment,
      method: paymentMethod,
      status: 'pending',
      reference: paymentResult.reference,
      amount: paymentResult.amount
    };
    
    await booking.save();
    
    res.status(201).json({
      success: true,
      data: {
        payment: paymentResult,
        booking: {
          id: booking._id,
          status: booking.status,
          payment: booking.payment
        }
      },
      message: 'Payment initiated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check payment status
// @route   GET /api/payments/:reference/status
// @access  Private
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { reference } = req.params;
    
    // Find booking by payment reference
    const booking = await Booking.findOne({ 'payment.reference': reference });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if user owns this booking
    if (booking.customer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to check this payment'
      });
    }
    
    // If already paid, return current status
    if (booking.payment.status === 'paid') {
      return res.status(200).json({
        success: true,
        data: {
          status: 'paid',
          reference: reference,
          amount: booking.payment.amount,
          booking: {
            id: booking._id,
            status: booking.status
          }
        }
      });
    }
    
    // Check with payment provider if still pending
    if (booking.payment.pollUrl) {
      try {
        const statusResult = await paymentService.checkPaymentStatus(booking.payment.pollUrl);
        
        if (statusResult.paid) {
          // Update booking status
          booking.payment.status = 'paid';
          booking.payment.paidAmount = statusResult.amount;
          booking.payment.paymentDate = new Date();
          booking.status = 'confirmed';
          
          await booking.save();
        }
        
        res.status(200).json({
          success: true,
          data: {
            status: statusResult.paid ? 'paid' : 'pending',
            reference: reference,
            amount: booking.payment.amount,
            booking: {
              id: booking._id,
              status: booking.status
            }
          }
        });
      } catch (error) {
        console.error('Payment status check error:', error);
        res.status(200).json({
          success: true,
          data: {
            status: booking.payment.status,
            reference: reference,
            amount: booking.payment.amount,
            booking: {
              id: booking._id,
              status: booking.status
            }
          }
        });
      }
    } else {
      res.status(200).json({
        success: true,
        data: {
          status: booking.payment.status,
          reference: reference,
          amount: booking.payment.amount,
          booking: {
            id: booking._id,
            status: booking.status
          }
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    PayNow callback handler
// @route   POST /api/payments/paynow/callback
// @access  Public (webhook)
exports.paynowCallback = async (req, res, next) => {
  try {
    const callbackData = req.body;
    
    // Validate callback
    if (!paymentService.validatePayNowCallback(callbackData)) {
      return res.status(400).send('Invalid callback');
    }
    
    const { reference, status, amount } = callbackData;
    
    // Find booking by reference
    const booking = await Booking.findOne({ 'payment.reference': reference });
    if (!booking) {
      return res.status(404).send('Booking not found');
    }
    
    // Update payment status
    if (status === 'Paid') {
      booking.payment.status = 'paid';
      booking.payment.paidAmount = parseFloat(amount);
      booking.payment.paymentDate = new Date();
      booking.status = 'confirmed';
    } else if (status === 'Cancelled') {
      booking.payment.status = 'failed';
    }
    
    await booking.save();
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('PayNow callback error:', error);
    res.status(500).send('Error processing callback');
  }
};

// @desc    Convert currency
// @route   POST /api/payments/convert
// @access  Public
exports.convertCurrency = async (req, res, next) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'Amount, fromCurrency, and toCurrency are required'
      });
    }
    
    const convertedAmount = currencyService.convertCurrency(amount, fromCurrency, toCurrency);
    const rates = currencyService.getCurrentRates();
    
    res.status(200).json({
      success: true,
      data: {
        original: {
          amount,
          currency: fromCurrency,
          formatted: currencyService.formatCurrency(amount, fromCurrency)
        },
        converted: {
          amount: convertedAmount,
          currency: toCurrency,
          formatted: currencyService.formatCurrency(convertedAmount, toCurrency)
        },
        exchangeRate: rates[toCurrency] / rates[fromCurrency],
        timestamp: rates.lastUpdated
      }
    });
  } catch (error) {
    next(error);
  }
};
