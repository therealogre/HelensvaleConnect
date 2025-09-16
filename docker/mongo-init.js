// MongoDB initialization script for Helensvale Connect
// This script creates collections and indexes for optimal performance

db = db.getSiblingDB('helensvale_connect');

// Create collections
db.createCollection('users');
db.createCollection('vendors');
db.createCollection('bookings');
db.createCollection('payments');
db.createCollection('reviews');
db.createCollection('notifications');
db.createCollection('stores');

// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phone: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ isEmailVerified: 1 });

// Vendors collection indexes
db.vendors.createIndex({ userId: 1 }, { unique: true });
db.vendors.createIndex({ businessName: 1 });
db.vendors.createIndex({ category: 1 });
db.vendors.createIndex({ location: '2dsphere' });
db.vendors.createIndex({ isVerified: 1 });
db.vendors.createIndex({ rating: -1 });
db.vendors.createIndex({ createdAt: -1 });

// Bookings collection indexes
db.bookings.createIndex({ customerId: 1 });
db.bookings.createIndex({ vendorId: 1 });
db.bookings.createIndex({ bookingDate: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ createdAt: -1 });
db.bookings.createIndex({ paymentStatus: 1 });

// Payments collection indexes
db.payments.createIndex({ bookingId: 1 });
db.payments.createIndex({ customerId: 1 });
db.payments.createIndex({ vendorId: 1 });
db.payments.createIndex({ paymentMethod: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ paynowReference: 1 });
db.payments.createIndex({ createdAt: -1 });

// Reviews collection indexes
db.reviews.createIndex({ vendorId: 1 });
db.reviews.createIndex({ customerId: 1 });
db.reviews.createIndex({ bookingId: 1 }, { unique: true });
db.reviews.createIndex({ rating: -1 });
db.reviews.createIndex({ createdAt: -1 });

// Notifications collection indexes
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully!');
