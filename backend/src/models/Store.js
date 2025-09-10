const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    // Basic Store Information
    storeName: {
        type: String,
        required: true,
        trim: true
    },
    storeSlug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    tagline: {
        type: String,
        maxlength: 100
    },
    
    // Owner Information
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EarlyAccessApplication',
        required: true
    },
    ownerName: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true,
        lowercase: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    
    // Business Details
    businessType: {
        type: String,
        required: true,
        enum: [
            'restaurant', 'salon_spa', 'automotive', 'home_services', 
            'healthcare', 'fitness', 'retail', 'professional_services',
            'education', 'entertainment', 'other'
        ]
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String
    },
    
    // Location
    address: {
        street: String,
        city: { type: String, required: true },
        province: String,
        country: { type: String, default: 'Zimbabwe' },
        postalCode: String
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    serviceArea: {
        radius: { type: Number, default: 10 }, // km
        cities: [String]
    },
    
    // Visual Branding
    logo: {
        url: String,
        publicId: String // Cloudinary public ID
    },
    coverImage: {
        url: String,
        publicId: String
    },
    gallery: [{
        url: String,
        publicId: String,
        caption: String,
        order: { type: Number, default: 0 }
    }],
    
    // Brand Colors & Theme
    brandColors: {
        primary: { type: String, default: '#6366f1' },
        secondary: { type: String, default: '#8b5cf6' },
        accent: { type: String, default: '#06b6d4' }
    },
    theme: {
        type: String,
        enum: ['modern', 'classic', 'minimal', 'bold', 'elegant'],
        default: 'modern'
    },
    
    // Services/Products
    services: [{
        name: { type: String, required: true },
        description: String,
        price: {
            amount: Number,
            currency: { type: String, default: 'USD' },
            type: { type: String, enum: ['fixed', 'from', 'range'], default: 'fixed' },
            maxAmount: Number // for range pricing
        },
        duration: Number, // minutes
        category: String,
        images: [String],
        active: { type: Boolean, default: true }
    }],
    
    // Operating Hours
    operatingHours: {
        monday: { open: String, close: String, closed: { type: Boolean, default: false } },
        tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
        friday: { open: String, close: String, closed: { type: Boolean, default: false } },
        saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
        sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
    },
    
    // Store Features & Policies
    features: {
        onlineBooking: { type: Boolean, default: true },
        homeService: { type: Boolean, default: false },
        delivery: { type: Boolean, default: false },
        pickupAvailable: { type: Boolean, default: false },
        wheelchairAccessible: { type: Boolean, default: false },
        parkingAvailable: { type: Boolean, default: false },
        wifiAvailable: { type: Boolean, default: false }
    },
    
    policies: {
        cancellationPolicy: String,
        refundPolicy: String,
        termsOfService: String,
        privacyPolicy: String
    },
    
    // Payment Methods
    paymentMethods: {
        cash: { type: Boolean, default: true },
        ecocash: { type: Boolean, default: false },
        onemoney: { type: Boolean, default: false },
        bankTransfer: { type: Boolean, default: false },
        card: { type: Boolean, default: false }
    },
    
    // Store Status & Metrics
    status: {
        type: String,
        enum: ['draft', 'pending_review', 'active', 'suspended', 'closed'],
        default: 'draft'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    
    // Analytics
    metrics: {
        totalViews: { type: Number, default: 0 },
        totalBookings: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 }
    },
    
    // SEO
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },
    
    // Social Media
    socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String,
        website: String
    },
    
    // Store Template
    template: {
        type: String,
        enum: ['restaurant', 'salon', 'automotive', 'services', 'retail', 'healthcare', 'custom'],
        default: 'services'
    },
    customDesignRequested: {
        type: Boolean,
        default: false
    },
    designNotes: String,
    
    // Launch Status
    isLaunched: {
        type: Boolean,
        default: false
    },
    launchedAt: Date,
    
    // Homepage Showcase
    showcaseOnHomepage: {
        type: Boolean,
        default: true
    },
    showcaseOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
storeSchema.index({ storeSlug: 1 });
storeSchema.index({ businessType: 1 });
storeSchema.index({ status: 1 });
storeSchema.index({ isLaunched: 1 });
storeSchema.index({ 'address.city': 1 });
storeSchema.index({ showcaseOnHomepage: 1, showcaseOrder: 1 });

// Virtual for store URL
storeSchema.virtual('storeUrl').get(function() {
    return `https://helensvaleconnect.art/store/${this.storeSlug}`;
});

// Method to generate unique slug
storeSchema.methods.generateSlug = function() {
    const baseSlug = this.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    
    return baseSlug + '-' + this._id.toString().slice(-6);
};

// Method to get template configuration
storeSchema.methods.getTemplateConfig = function() {
    const templates = {
        restaurant: {
            primaryColor: '#dc2626',
            sections: ['hero', 'menu', 'about', 'gallery', 'reviews', 'contact'],
            features: ['onlineBooking', 'delivery']
        },
        salon: {
            primaryColor: '#ec4899',
            sections: ['hero', 'services', 'gallery', 'team', 'reviews', 'booking'],
            features: ['onlineBooking']
        },
        automotive: {
            primaryColor: '#1f2937',
            sections: ['hero', 'services', 'about', 'gallery', 'contact'],
            features: ['onlineBooking', 'homeService']
        },
        services: {
            primaryColor: '#6366f1',
            sections: ['hero', 'services', 'about', 'testimonials', 'contact'],
            features: ['onlineBooking', 'homeService']
        },
        retail: {
            primaryColor: '#059669',
            sections: ['hero', 'products', 'about', 'gallery', 'contact'],
            features: ['delivery', 'pickupAvailable']
        },
        healthcare: {
            primaryColor: '#0284c7',
            sections: ['hero', 'services', 'team', 'about', 'contact'],
            features: ['onlineBooking']
        }
    };
    
    return templates[this.template] || templates.services;
};

module.exports = mongoose.model('Store', storeSchema);
