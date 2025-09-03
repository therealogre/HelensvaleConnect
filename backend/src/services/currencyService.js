class CurrencyService {
  constructor() {
    this.exchangeRates = {
      USD: 1, // Base currency - USD only
      lastUpdated: new Date()
    };
  }

  // Simple USD-only service - no currency conversion needed
  async fetchExchangeRates() {
    try {
      console.log('💵 Using USD as base currency');
      
      this.exchangeRates = {
        USD: 1,
        lastUpdated: new Date()
      };
      
      console.log('✅ Currency service ready (USD only):', this.exchangeRates);
      return this.exchangeRates;
    } catch (error) {
      console.error('❌ Error in currency service:', error.message);
      return this.exchangeRates;
    }
  }

  // Convert between currencies (simplified for USD only)
  convertCurrency(amount, fromCurrency, toCurrency) {
    // Since we only use USD, return the same amount
    if (fromCurrency === 'USD' && toCurrency === 'USD') {
      return amount;
    }
    
    throw new Error(`Currency conversion not supported. Platform uses USD only.`);
  }

  // Format currency for display (USD only)
  formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    if (currency !== 'USD') {
      throw new Error('Only USD currency is supported');
    }
    
    return `$${amount.toLocaleString(locale, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  // Get current exchange rates
  getCurrentRates() {
    return {
      ...this.exchangeRates,
      lastUpdated: this.exchangeRates.lastUpdated
    };
  }

  // Calculate payment breakdown for USD transactions
  calculatePaymentBreakdown(amount, currency = 'USD') {
    if (currency !== 'USD') {
      throw new Error('Only USD transactions are supported');
    }

    return {
      original: { amount, currency: 'USD' },
      usd: { amount, formatted: this.formatCurrency(amount, 'USD') },
      methods: {
        credit_card: {
          available: true,
          fee: amount * 0.029, // 2.9% fee
          total: amount * 1.029,
          formatted: this.formatCurrency(amount * 1.029, 'USD')
        },
        paypal: {
          available: true,
          fee: amount * 0.034, // 3.4% fee
          total: amount * 1.034,
          formatted: this.formatCurrency(amount * 1.034, 'USD')
        },
        bank_transfer: {
          available: true,
          fee: 0,
          total: amount,
          formatted: this.formatCurrency(amount, 'USD')
        }
      }
    };
  }
}

// Singleton instance
const currencyService = new CurrencyService();

module.exports = currencyService;
