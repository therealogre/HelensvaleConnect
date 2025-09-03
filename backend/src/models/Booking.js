const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  service: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true } // in minutes
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    startTime: { type: String, required: true }, // Format: "14:30"
    endTime: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  participants: {
    type: Number,
    default: 1,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'mobile_money', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    paymentDate: Date,
    dueDate: Date
  },
  customerDetails: {
    notes: String,
    specialRequests: String,
    contactPreference: {
      type: String,
      enum: ['email', 'sms', 'phone'],
      default: 'email'
    }
  },
  vendorNotes: {
    type: String,
    maxlength: 500
  },
  cancellation: {
    cancelledBy: {
      type: String,
      enum: ['customer', 'vendor', 'admin']
    },
    cancelledAt: Date,
    reason: String,
    refundStatus: {
      type: String,
      enum: ['none', 'partial', 'full', 'processing'],
      default: 'none'
    }
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending'
    }
  }],
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },
  checkIn: {
    checkedInAt: Date,
    location: {
      latitude: Number,
      longitude: Number
    },
    verificationCode: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookingSchema.index({ customer: 1, bookingDate: -1 });
bookingSchema.index({ vendor: 1, bookingDate: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ 'payment.status': 1 });

// Virtual for booking duration in hours
bookingSchema.virtual('durationHours').get(function() {
  return this.service.duration / 60;
});

// Virtual for full booking time
bookingSchema.virtual('fullDateTime').get(function() {
  const date = new Date(this.bookingDate);
  const [hours, minutes] = this.timeSlot.startTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes));
  return date;
});

// Generate verification code before saving
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.checkIn.verificationCode) {
    this.checkIn.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Static method to find available time slots
bookingSchema.statics.findAvailableSlots = async function(vendorId, date, serviceDuration) {
  const bookings = await this.find({
    vendor: vendorId,
    bookingDate: date,
    status: { $in: ['confirmed', 'in_progress'] }
  }).sort({ 'timeSlot.startTime': 1 });

  // This would need to be implemented based on vendor operating hours
  // and existing bookings to return available time slots
  return [];
};

module.exports = mongoose.model('Booking', bookingSchema);
