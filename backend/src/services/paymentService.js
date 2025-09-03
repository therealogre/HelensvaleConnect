const axios = require('axios');
const crypto = require('crypto');
const currencyService = require('./currencyService');

class PaymentService {
  constructor() {
    this.paynowConfig = {
      integrationId: process.env.PAYNOW_INTEGRATION_ID,
      integrationKey: process.env.PAYNOW_INTEGRATION_KEY,
      baseUrl: process.env.PAYNOW_BASE_URL || 'https://www.paynow.co.zw/interface/',
      returnUrl: process.env.PAYNOW_RETURN_URL || 'http://localhost:3000/payment/return',
      resultUrl: process.env.PAYNOW_RESULT_URL || 'http://localhost:3001/api/payments/paynow/callback'
    };
  }

  // Generate PayNow payment
  async createPayNowPayment(paymentData) {
    try {
      const {
        amount,
        currency = 'ZIG',
        reference,
        email,
        phone,
        description,
        bookingId
      } = paymentData;

      // Convert to ZIG if needed
      const zigAmount = currency === 'ZIG' ? amount : currencyService.convertCurrency(amount, currency, 'ZIG');
      
      // Generate unique reference
      const paymentRef = `HC_${bookingId}_${Date.now()}`;
      
      // Prepare PayNow data
      const paynowData = {
        id: this.paynowConfig.integrationId,
        reference: paymentRef,
        amount: zigAmount.toFixed(2),
        additionalinfo: description || 'Helensvale Connect Service Payment',
        returnurl: this.paynowConfig.returnUrl,
        resulturl: this.paynowConfig.resultUrl,
        authemail: email,
        phone: phone,
        status: 'Message'
      };

      // Generate hash
      const hash = this.generatePayNowHash(paynowData);
      paynowData.hash = hash;

      // Send to PayNow
      const response = await axios.post(
        `${this.paynowConfig.baseUrl}initiatetransaction`,
        new URLSearchParams(paynowData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const result = this.parsePayNowResponse(response.data);
      
      if (result.status === 'Ok') {
        return {
          success: true,
          paymentUrl: result.browserurl,
          pollUrl: result.pollurl,
          reference: paymentRef,
          amount: zigAmount,
          currency: 'ZIG',
          provider: 'paynow'
        };
      } else {
        throw new Error(result.error || 'PayNow payment creation failed');
      }
    } catch (error) {
      console.error('PayNow payment error:', error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  // Generate EcoCash payment
  async createEcoCashPayment(paymentData) {
    try {
      const {
        amount,
        currency = 'ZIG',
        phone,
        reference,
        description,
        bookingId
      } = paymentData;

      // Convert to ZIG if needed
      const zigAmount = currency === 'ZIG' ? amount : currencyService.convertCurrency(amount, currency, 'ZIG');
      
      // Calculate EcoCash fees
      const breakdown = currencyService.calculatePaymentBreakdown(zigAmount, 'ZIG');
      const totalAmount = breakdown.methods.ecocash.total;

      // Generate unique reference
      const paymentRef = `EC_${bookingId}_${Date.now()}`;

      // Prepare EcoCash data via PayNow
      const paynowData = {
        id: this.paynowConfig.integrationId,
        reference: paymentRef,
        amount: totalAmount.toFixed(2),
        additionalinfo: description || 'Helensvale Connect Service Payment',
        returnurl: this.paynowConfig.returnUrl,
        resulturl: this.paynowConfig.resultUrl,
        phone: phone,
        method: 'ecocash',
        status: 'Message'
      };

      const hash = this.generatePayNowHash(paynowData);
      paynowData.hash = hash;

      const response = await axios.post(
        `${this.paynowConfig.baseUrl}remotetransaction`,
        new URLSearchParams(paynowData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const result = this.parsePayNowResponse(response.data);
      
      if (result.status === 'Ok') {
        return {
          success: true,
          reference: paymentRef,
          amount: zigAmount,
          totalAmount: totalAmount,
          fee: breakdown.methods.ecocash.fee,
          currency: 'ZIG',
          provider: 'ecocash',
          instructions: result.instructions || 'Check your phone for EcoCash prompt'
        };
      } else {
        throw new Error(result.error || 'EcoCash payment creation failed');
      }
    } catch (error) {
      console.error('EcoCash payment error:', error);
      throw new Error(`EcoCash payment failed: ${error.message}`);
    }
  }

  // Check payment status
  async checkPaymentStatus(pollUrl) {
    try {
      const response = await axios.post(pollUrl);
      const result = this.parsePayNowResponse(response.data);
      
      return {
        status: result.status,
        paid: result.status === 'Paid',
        amount: result.amount,
        reference: result.reference,
        paynowreference: result.paynowreference,
        pollurl: result.pollurl
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  // Generate PayNow hash
  generatePayNowHash(data) {
    const values = Object.keys(data)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => data[key])
      .join('');
    
    const stringToHash = values + this.paynowConfig.integrationKey;
    return crypto.createHash('sha512').update(stringToHash).digest('hex').toUpperCase();
  }

  // Parse PayNow response
  parsePayNowResponse(responseText) {
    const lines = responseText.split('\n');
    const result = {};
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        result[key.toLowerCase()] = value;
      }
    });
    
    return result;
  }

  // Validate PayNow callback
  validatePayNowCallback(data) {
    const receivedHash = data.hash;
    delete data.hash;
    
    const calculatedHash = this.generatePayNowHash(data);
    return receivedHash === calculatedHash;
  }

  // Get supported payment methods
  getSupportedMethods() {
    return [
      {
        id: 'paynow',
        name: 'PayNow',
        description: 'Pay with PayNow - supports all major banks and mobile money',
        icon: 'paynow',
        currencies: ['ZIG', 'USD'],
        fees: {
          percentage: 1.5,
          minimum: 0.50,
          currency: 'ZIG'
        }
      },
      {
        id: 'ecocash',
        name: 'EcoCash',
        description: 'Pay directly with your EcoCash wallet',
        icon: 'ecocash',
        currencies: ['ZIG'],
        fees: {
          percentage: 2.0,
          minimum: 0,
          currency: 'ZIG'
        }
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer - no fees',
        icon: 'bank',
        currencies: ['ZIG', 'USD'],
        fees: {
          percentage: 0,
          minimum: 0,
          currency: 'ZIG'
        }
      }
    ];
  }

  // Calculate total with fees
  calculatePaymentTotal(amount, currency, method) {
    const breakdown = currencyService.calculatePaymentBreakdown(amount, currency);
    return breakdown.methods[method] || breakdown.methods.paynow;
  }

  // Generate payment summary
  generatePaymentSummary(bookingData, paymentMethod) {
    const { service, participants = 1, totalAmount, currency = 'ZIG' } = bookingData;
    
    const breakdown = currencyService.calculatePaymentBreakdown(totalAmount, currency);
    const methodBreakdown = breakdown.methods[paymentMethod];
    
    return {
      service: {
        name: service.name,
        price: service.price,
        participants: participants,
        subtotal: totalAmount
      },
      currency: {
        original: currency,
        display: 'ZIG',
        exchangeRate: currency !== 'ZIG' ? currencyService.getCurrentRates()[currency] : 1
      },
      payment: {
        method: paymentMethod,
        subtotal: breakdown.zig.amount,
        fee: methodBreakdown.fee,
        total: methodBreakdown.total,
        formatted: {
          subtotal: breakdown.zig.formatted,
          fee: currencyService.formatCurrency(methodBreakdown.fee, 'ZIG'),
          total: methodBreakdown.formatted
        }
      },
      exchangeRates: currencyService.getCurrentRates()
    };
  }
}

module.exports = new PaymentService();
