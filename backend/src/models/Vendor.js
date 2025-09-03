const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: ['restaurant', 'retail', 'service', 'health', 'beauty', 'fitness', 'education', 'entertainment', 'other']
  },
  description: {
    type: String,
    required: [true, 'Business description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  logo: {
    type: String,
    default: null
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  location: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'Australia' }
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    geoLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String
    }
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    isOpen: { type: Boolean, default: true },
    openTime: String, // Format: "09:00"
    closeTime: String, // Format: "17:00"
    breaks: [{
      startTime: String,
      endTime: String,
      reason: String
    }]
  }],
  services: [{
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    duration: Number, // in minutes
    category: String,
    isActive: { type: Boolean, default: true },
    bookingRequired: { type: Boolean, default: false },
    maxCapacity: { type: Number, default: 1 }
  }],
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: Date,
    documents: [{
      type: String, // 'business_license', 'tax_certificate', 'insurance'
      url: String,
      uploadDate: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }]
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  subscription: {
    plan: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
    startDate: Date,
    endDate: Date,
    isActive: { type: Boolean, default: true }
  },
  analytics: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 }
  },
  settings: {
    acceptOnlineBookings: { type: Boolean, default: true },
    requireDeposit: { type: Boolean, default: false },
    depositAmount: { type: Number, default: 0 },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    autoConfirmBookings: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
vendorSchema.index({ 'location.geoLocation': '2dsphere' });
vendorSchema.index({ businessType: 1 });
vendorSchema.index({ 'verification.isVerified': 1 });
vendorSchema.index({ isActive: 1 });
vendorSchema.index({ isFeatured: 1 });
vendorSchema.index({ 'ratings.average': -1 });

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Set geoLocation coordinates before saving
vendorSchema.pre('save', function(next) {
  if (this.location && this.location.coordinates) {
    this.location.geoLocation = {
      type: 'Point',
      coordinates: [this.location.coordinates.longitude, this.location.coordinates.latitude]
    };
  }
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);
