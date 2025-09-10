const mongoose = require('mongoose');

const earlyAccessApplicationSchema = new mongoose.Schema({
    // Basic Information
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    businessType: {
        type: String,
        required: true,
        enum: [
            'restaurant', 'salon_spa', 'automotive', 'home_services', 
            'healthcare', 'fitness', 'retail', 'professional_services',
            'education', 'entertainment', 'other'
        ]
    },
    businessDescription: {
        type: String,
        required: true,
        maxlength: 500
    },
    
    // Location
    city: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        default: 'Zimbabwe'
    },
    
    // Plan Selection
    selectedPlan: {
        type: String,
        required: true,
        enum: ['starter', 'professional', 'enterprise']
    },
    planPrice: {
        type: Number,
        required: true
    },
    
    // Application Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'payment_pending', 'active'],
        default: 'pending'
    },
    
    // Payment Information
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentReference: {
        type: String,
        sparse: true
    },
    paynowPollUrl: {
        type: String,
        sparse: true
    },
    
    // Admin Notes
    adminNotes: {
        type: String,
        maxlength: 1000
    },
    
    // Email Marketing
    emailMarketingConsent: {
        type: Boolean,
        default: true
    },
    mailerliteSubscriberId: {
        type: String,
        sparse: true
    },
    
    // Store Creation Status
    storeCreated: {
        type: Boolean,
        default: false
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        sparse: true
    },
    
    // Timestamps
    appliedAt: {
        type: Date,
        default: Date.now
    },
    approvedAt: {
        type: Date
    },
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
earlyAccessApplicationSchema.index({ email: 1 });
earlyAccessApplicationSchema.index({ status: 1 });
earlyAccessApplicationSchema.index({ businessType: 1 });
earlyAccessApplicationSchema.index({ appliedAt: -1 });

// Virtual for application age
earlyAccessApplicationSchema.virtual('applicationAge').get(function() {
    return Math.floor((Date.now() - this.appliedAt) / (1000 * 60 * 60 * 24)); // days
});

// Method to check if application is eligible for auto-approval
earlyAccessApplicationSchema.methods.isEligibleForAutoApproval = function() {
    // Auto-approve if payment is completed and basic validation passes
    return this.paymentStatus === 'completed' && 
           this.businessName && 
           this.email && 
           this.businessType;
};

module.exports = mongoose.model('EarlyAccessApplication', earlyAccessApplicationSchema);
