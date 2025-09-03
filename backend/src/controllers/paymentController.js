const paymentService = require('../services/paymentService');
const currencyService = require('../services/currencyService');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// @desc    Get supported payment methods
// @route   GET /api/payments/methods
// @access  Public
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const methods = paymentService.getAvailablePaymentMethods();
    const exchangeRates = currencyService.getCurrentRates();
    
    res.status(200).json({
      success: true,
      data: {
        methods,
        exchangeRates,
        baseCurrency: 'USD'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current exchange rates (USD only)
// @route   GET /api/payments/exchange-rates
// @access  Public
exports.getExchangeRates = async (req, res, next) => {
  try {
    const rates = currencyService.getCurrentRates();
    
    res.status(200).json({
      success: true,
      data: {
        rates,
        baseCurrency: 'USD',
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
    const { amount, currency = 'USD', method = 'stripe' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (currency !== 'USD') {
      return res.status(400).json({
        success: false,
        message: 'Only USD currency is supported'
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
    
    const { bookingId, paymentMethod } = req.body;
    
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
      currency: 'USD',
      reference: `BOOKING_${bookingId}`,
      email: booking.customer.email,
      description: `Payment for ${booking.service.name} - ${booking.vendor.businessName}`,
      bookingId: bookingId
    };
    
    let paymentResult;
    
    switch (paymentMethod) {
      case 'stripe':
        paymentResult = await paymentService.createStripePayment(paymentData);
        break;
      case 'paypal':
        paymentResult = await paymentService.createPayPalPayment(paymentData);
        break;
      case 'bank_transfer':
        paymentResult = await paymentService.createBankTransferPayment(paymentData);
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
    try {
      const statusResult = await paymentService.verifyPayment(reference, booking.payment.method);
      
      if (statusResult.success && statusResult.status === 'succeeded') {
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
          status: statusResult.success && statusResult.status === 'succeeded' ? 'paid' : 'pending',
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
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/payments/stripe/webhook
// @access  Public (webhook)
exports.stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;
    
    // Verify webhook signature (simplified for demo)
    const event = payload;
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const reference = paymentIntent.metadata.reference;
      
      // Find booking by reference
      const booking = await Booking.findOne({ 'payment.reference': reference });
      if (booking) {
        booking.payment.status = 'paid';
        booking.payment.paidAmount = paymentIntent.amount / 100; // Convert from cents
        booking.payment.paymentDate = new Date();
        booking.status = 'confirmed';
        
        await booking.save();
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).send('Error processing webhook');
  }
};

// @desc    Process refund
// @route   POST /api/payments/:reference/refund
// @access  Private
exports.processRefund = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const { amount, reason } = req.body;
    
    // Find booking by payment reference
    const booking = await Booking.findOne({ 'payment.reference': reference });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Check if payment was successful
    if (booking.payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund unpaid booking'
      });
    }
    
    const refundAmount = amount || booking.payment.paidAmount;
    
    const refundResult = await paymentService.processRefund(
      booking.payment.reference,
      refundAmount,
      booking.payment.method
    );
    
    if (refundResult.success) {
      booking.payment.refund = {
        amount: refundAmount,
        status: refundResult.status,
        refundId: refundResult.refundId,
        reason: reason || 'Customer request',
        processedAt: new Date()
      };
      
      await booking.save();
      
      res.status(200).json({
        success: true,
        data: {
          refund: refundResult,
          booking: {
            id: booking._id,
            payment: booking.payment
          }
        },
        message: 'Refund processed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: refundResult.error || 'Refund processing failed'
      });
    }
  } catch (error) {
    next(error);
  }
};
