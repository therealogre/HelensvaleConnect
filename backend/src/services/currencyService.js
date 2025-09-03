const axios = require('axios');

class CurrencyService {
  constructor() {
    this.exchangeRates = {
      ZIG: 1, // Base currency
      USD: 0.0001, // Default fallback rate
      ZWL: 1000, // Zimbabwe Dollar (legacy)
      lastUpdated: null
    };
    this.updateInterval = 30 * 60 * 1000; // 30 minutes
    this.startPeriodicUpdate();
  }

  // Fetch latest exchange rates from multiple sources
  async fetchExchangeRates() {
    try {
      console.log('🔄 Fetching latest exchange rates...');
      
      // Try multiple sources for exchange rates
      const rates = await this.getExchangeRatesFromSources();
      
      if (rates) {
        this.exchangeRates = {
          ...this.exchangeRates,
          ...rates,
          lastUpdated: new Date()
        };
        console.log('✅ Exchange rates updated:', this.exchangeRates);
        return this.exchangeRates;
      }
      
      console.log('⚠️ Using cached exchange rates');
      return this.exchangeRates;
    } catch (error) {
      console.error('❌ Error fetching exchange rates:', error.message);
      return this.exchangeRates;
    }
  }

  // Get exchange rates from various sources
  async getExchangeRatesFromSources() {
    const sources = [
      this.getEcoCashRates.bind(this),
      this.getReserveBankRates.bind(this),
      this.getFallbackRates.bind(this)
    ];

    for (const source of sources) {
      try {
        const rates = await source();
        if (rates) return rates;
      } catch (error) {
        console.log(`Source failed: ${error.message}`);
        continue;
      }
    }

    return null;
  }

  // Simulate EcoCash API rates (replace with actual API when available)
  async getEcoCashRates() {
    try {
      // This would be the actual EcoCash API endpoint
      // For now, we'll simulate realistic rates
      const simulatedRates = {
        ZIG: 1,
        USD: 0.000076, // 1 ZIG = ~0.000076 USD (realistic rate)
        ZWL: 1320, // Legacy Zimbabwe Dollar
        EUR: 0.000070,
        GBP: 0.000060,
        ZAR: 0.0014
      };

      // Add some realistic fluctuation
      const fluctuation = 0.02; // 2% max fluctuation
      Object.keys(simulatedRates).forEach(currency => {
        if (currency !== 'ZIG') {
          const rate = simulatedRates[currency];
          const change = (Math.random() - 0.5) * 2 * fluctuation;
          simulatedRates[currency] = rate * (1 + change);
        }
      });

      return simulatedRates;
    } catch (error) {
      throw new Error('EcoCash API unavailable');
    }
  }

  // Simulate Reserve Bank of Zimbabwe rates
  async getReserveBankRates() {
    try {
      // Fallback rates from RBZ
      return {
        ZIG: 1,
        USD: 0.000075,
        ZWL: 1300,
        EUR: 0.000069,
        GBP: 0.000059,
        ZAR: 0.0013
      };
    } catch (error) {
      throw new Error('RBZ API unavailable');
    }
  }

  // Fallback static rates
  async getFallbackRates() {
    return {
      ZIG: 1,
      USD: 0.000076,
      ZWL: 1320,
      EUR: 0.000070,
      GBP: 0.000060,
      ZAR: 0.0014
    };
  }

  // Convert between currencies
  convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = this.exchangeRates[fromCurrency];
    const toRate = this.exchangeRates[toCurrency];

    if (!fromRate || !toRate) {
      throw new Error(`Exchange rate not available for ${fromCurrency} or ${toCurrency}`);
    }

    // Convert to ZIG first, then to target currency
    const zigAmount = fromCurrency === 'ZIG' ? amount : amount / fromRate;
    const convertedAmount = toCurrency === 'ZIG' ? zigAmount : zigAmount * toRate;

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }

  // Format currency for display
  formatCurrency(amount, currency = 'ZIG', locale = 'en-ZW') {
    const currencySymbols = {
      ZIG: 'ZiG',
      USD: '$',
      ZWL: 'Z$',
      EUR: '€',
      GBP: '£',
      ZAR: 'R'
    };

    const symbol = currencySymbols[currency] || currency;
    
    if (currency === 'ZIG') {
      return `${symbol} ${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    return `${symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  }

  // Get current exchange rates
  getCurrentRates() {
    return {
      ...this.exchangeRates,
      lastUpdated: this.exchangeRates.lastUpdated
    };
  }

  // Start periodic updates
  startPeriodicUpdate() {
    // Initial fetch
    this.fetchExchangeRates();
    
    // Set up periodic updates
    setInterval(() => {
      this.fetchExchangeRates();
    }, this.updateInterval);
  }

  // Get popular currency pairs for Zimbabwe
  getPopularPairs() {
    return [
      { from: 'ZIG', to: 'USD', name: 'ZiG to US Dollar' },
      { from: 'USD', to: 'ZIG', name: 'US Dollar to ZiG' },
      { from: 'ZIG', to: 'ZAR', name: 'ZiG to South African Rand' },
      { from: 'ZAR', to: 'ZIG', name: 'South African Rand to ZiG' }
    ];
  }

  // Calculate payment breakdown for different methods
  calculatePaymentBreakdown(amount, currency = 'ZIG') {
    const zigAmount = currency === 'ZIG' ? amount : this.convertCurrency(amount, currency, 'ZIG');
    const usdAmount = this.convertCurrency(zigAmount, 'ZIG', 'USD');

    return {
      original: { amount, currency },
      zig: { amount: zigAmount, formatted: this.formatCurrency(zigAmount, 'ZIG') },
      usd: { amount: usdAmount, formatted: this.formatCurrency(usdAmount, 'USD') },
      methods: {
        ecocash: {
          available: true,
          fee: zigAmount * 0.02, // 2% fee
          total: zigAmount * 1.02,
          formatted: this.formatCurrency(zigAmount * 1.02, 'ZIG')
        },
        paynow: {
          available: true,
          fee: Math.max(zigAmount * 0.015, 0.50), // 1.5% or min 50 cents
          total: zigAmount + Math.max(zigAmount * 0.015, 0.50),
          formatted: this.formatCurrency(zigAmount + Math.max(zigAmount * 0.015, 0.50), 'ZIG')
        },
        bank_transfer: {
          available: true,
          fee: 0,
          total: zigAmount,
          formatted: this.formatCurrency(zigAmount, 'ZIG')
        }
      }
    };
  }
}

// Singleton instance
const currencyService = new CurrencyService();

module.exports = currencyService;
