const VendorService = require('../src/services/VendorService');
const BookingService = require('../src/services/BookingService');
const PaymentService = require('../src/services/PaymentService');
const mongoose = require('mongoose');

describe('Service Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helensvale_connect_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('VendorService', () => {
    test('should create vendor profile', async () => {
      const vendorData = {
        userId: new mongoose.Types.ObjectId(),
        businessName: 'Test Business',
        category: 'cleaning',
        description: 'Test cleaning service',
        location: {
          address: '123 Test St, Helensvale',
          coordinates: [-27.8574, 153.3648]
        },
        services: [{
          name: 'House Cleaning',
          price: 150,
          duration: 120
        }]
      };

      const result = await VendorService.createVendor(vendorData);
      expect(result.success).toBe(true);
      expect(result.vendor.businessName).toBe('Test Business');
    });

    test('should get vendors with filters', async () => {
      const filters = {
        category: 'cleaning',
        location: [-27.8574, 153.3648],
        radius: 10
      };

      const result = await VendorService.getVendors(filters);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.vendors)).toBe(true);
    });
  });

  describe('BookingService', () => {
    test('should create booking', async () => {
      const bookingData = {
        customerId: new mongoose.Types.ObjectId(),
        vendorId: new mongoose.Types.ObjectId(),
        serviceId: new mongoose.Types.ObjectId(),
        scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
        scheduledTime: '10:00',
        duration: 120,
        basePrice: 150,
        customerInfo: {
          name: 'John Doe',
          phone: '0412345678',
          email: 'john@example.com'
        },
        serviceAddress: {
          street: '123 Test St',
          suburb: 'Helensvale',
          postcode: '4212',
          state: 'QLD'
        }
      };

      const result = await BookingService.createBooking(bookingData);
      expect(result.success).toBe(true);
      expect(result.booking.status).toBe('pending');
    });

    test('should check availability', async () => {
      const availabilityData = {
        vendorId: new mongoose.Types.ObjectId(),
        date: new Date(Date.now() + 86400000),
        duration: 120
      };

      const result = await BookingService.checkAvailability(availabilityData);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.availableSlots)).toBe(true);
    });
  });

  describe('PaymentService', () => {
    test('should get available payment methods', () => {
      const methods = PaymentService.getAvailablePaymentMethods();
      expect(Array.isArray(methods)).toBe(true);
      expect(methods.length).toBeGreaterThan(0);
      
      const ecocash = methods.find(m => m.id === 'ecocash');
      expect(ecocash).toBeDefined();
      expect(ecocash.local).toBe(true);
    });

    test('should calculate payment breakdown', () => {
      const breakdown = PaymentService.calculatePaymentBreakdown(100, 'ecocash');
      expect(breakdown.subtotal).toBe(100);
      expect(breakdown.fee).toBe(2.5);
      expect(breakdown.total).toBe(102.5);
      expect(breakdown.currency).toBe('ZAR');
    });

    test('should create EcoCash payment', async () => {
      const paymentData = {
        amount: 150,
        currency: 'ZAR',
        reference: 'TEST123',
        phone: '0712345678',
        description: 'Test payment',
        bookingId: new mongoose.Types.ObjectId()
      };

      const result = await PaymentService.createEcoCashPayment(paymentData);
      expect(result.success).toBe(true);
      expect(result.paymentMethod).toBe('ecocash');
      expect(result.instructions).toBeDefined();
    });
  });
});
