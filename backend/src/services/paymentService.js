const axios = require('axios');
const crypto = require('crypto');
const currencyService = require('./currencyService');

class PaymentService {
  constructor() {
    // Stripe configuration for USD payments
    this.stripeConfig = {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    };

    // PayPal configuration
    this.paypalConfig = {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      baseUrl: process.env.PAYPAL_BASE_URL || 'https://api.sandbox.paypal.com'
    };
  }

  // Create Stripe payment intent
  async createStripePayment(paymentData) {
    try {
      const {
        amount,
        currency = 'USD',
        reference,
        email,
        description,
        bookingId
      } = paymentData;

      if (currency !== 'USD') {
        throw new Error('Only USD payments are supported');
      }

      // Convert to cents for Stripe
      const amountInCents = Math.round(amount * 100);
      
      const paymentIntent = {
        amount: amountInCents,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          bookingId,
          reference,
          platform: 'helensvale_connect'
        },
        description: description || 'Helensvale Connect Service Payment'
      };

      return {
        success: true,
        paymentIntent,
        clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        currency: 'USD',
        reference
      };
    } catch (error) {
      console.error('Stripe payment creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create PayPal payment
  async createPayPalPayment(paymentData) {
    try {
      const {
        amount,
        currency = 'USD',
        reference,
        description,
        bookingId
      } = paymentData;

      if (currency !== 'USD') {
        throw new Error('Only USD payments are supported');
      }

      const payment = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal'
        },
        transactions: [{
          amount: {
            total: amount.toFixed(2),
            currency: 'USD'
          },
          description: description || 'Helensvale Connect Service Payment',
          custom: bookingId,
          invoice_number: reference
        }],
        redirect_urls: {
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
        }
      };

      return {
        success: true,
        payment,
        approvalUrl: `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${Date.now()}`,
        amount: amount,
        currency: 'USD',
        reference
      };
    } catch (error) {
      console.error('PayPal payment creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process bank transfer (manual verification)
  async createBankTransferPayment(paymentData) {
    try {
      const {
        amount,
        currency = 'USD',
        reference,
        email,
        description,
        bookingId
      } = paymentData;

      if (currency !== 'USD') {
        throw new Error('Only USD payments are supported');
      }

      return {
        success: true,
        paymentMethod: 'bank_transfer',
        amount: amount,
        currency: 'USD',
        reference,
        instructions: {
          bankName: 'Helensvale Connect Business Account',
          accountNumber: '****-****-1234',
          routingNumber: '****5678',
          reference: reference,
          amount: `$${amount.toFixed(2)}`,
          note: 'Please include the reference number in your transfer'
        },
        status: 'pending_verification'
      };
    } catch (error) {
      console.error('Bank transfer setup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify payment status
  async verifyPayment(paymentId, method = 'stripe') {
    try {
      switch (method) {
        case 'stripe':
          return await this.verifyStripePayment(paymentId);
        case 'paypal':
          return await this.verifyPayPalPayment(paymentId);
        case 'bank_transfer':
          return await this.verifyBankTransfer(paymentId);
        default:
          throw new Error('Unsupported payment method');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyStripePayment(paymentIntentId) {
    // Simulate Stripe verification
    return {
      success: true,
      status: 'succeeded',
      amount: 0,
      currency: 'USD',
      paymentMethod: 'stripe'
    };
  }

  async verifyPayPalPayment(paymentId) {
    // Simulate PayPal verification
    return {
      success: true,
      status: 'completed',
      amount: 0,
      currency: 'USD',
      paymentMethod: 'paypal'
    };
  }

  async verifyBankTransfer(transferId) {
    // Manual verification required
    return {
      success: true,
      status: 'pending_verification',
      amount: 0,
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      requiresManualVerification: true
    };
  }

  // Calculate payment breakdown with fees
  calculatePaymentBreakdown(amount, method = 'stripe') {
    return currencyService.calculatePaymentBreakdown(amount, 'USD');
  }

  // Get available payment methods
  getAvailablePaymentMethods() {
    return [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        fee: '2.9%',
        processingTime: 'Instant',
        icon: 'credit_card'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        fee: '3.4%',
        processingTime: 'Instant',
        icon: 'paypal'
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer (manual verification)',
        fee: 'Free',
        processingTime: '1-3 business days',
        icon: 'account_balance'
      }
    ];
  }

  // Process refund
  async processRefund(paymentId, amount, method = 'stripe') {
    try {
      switch (method) {
        case 'stripe':
          return {
            success: true,
            refundId: `re_${Date.now()}`,
            amount,
            currency: 'USD',
            status: 'succeeded'
          };
        case 'paypal':
          return {
            success: true,
            refundId: `RF_${Date.now()}`,
            amount,
            currency: 'USD',
            status: 'completed'
          };
        case 'bank_transfer':
          return {
            success: true,
            refundId: `BT_${Date.now()}`,
            amount,
            currency: 'USD',
            status: 'pending_manual_processing'
          };
        default:
          throw new Error('Unsupported payment method for refund');
      }
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Singleton instance
const paymentService = new PaymentService();

module.exports = paymentService;
