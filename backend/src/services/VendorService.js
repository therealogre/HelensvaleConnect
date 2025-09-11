const Vendor = require('../models/Vendor');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

/**
 * Vendor Service - Handles all vendor-related business logic
 * Implements marketplace best practices for vendor management
 */
class VendorService {
  /**
   * Create a new vendor profile
   */
  async createVendor(userId, vendorData, files = []) {
    try {
      // Check if user already has a vendor profile
      const existingVendor = await Vendor.findOne({ user: userId });
      if (existingVendor) {
        throw new ApiError('User already has a vendor profile', 400);
      }

      // Upload images to cloud storage
      const uploadedImages = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const result = await uploadToCloudinary(file.buffer, {
            folder: 'vendors',
            transformation: [
              { width: 800, height: 600, crop: 'fill', quality: 'auto' }
            ]
          });
          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: `${vendorData.businessName} image`
          });
        }
      }

      // Create vendor with enhanced data structure
      const vendor = new Vendor({
        user: userId,
        businessName: vendorData.businessName,
        description: vendorData.description,
        category: vendorData.category,
        subcategory: vendorData.subcategory,
        location: {
          address: vendorData.address,
          city: vendorData.city,
          province: vendorData.province,
          postalCode: vendorData.postalCode,
          coordinates: vendorData.coordinates || null
        },
        contact: {
          phone: vendorData.phone,
          email: vendorData.email,
          website: vendorData.website,
          whatsapp: vendorData.whatsapp
        },
        operatingHours: vendorData.operatingHours || {},
        services: vendorData.services || [],
        images: uploadedImages,
        pricing: {
          currency: 'ZAR',
          basePrice: vendorData.basePrice || 0,
          priceRange: vendorData.priceRange || 'affordable'
        },
        businessInfo: {
          registrationNumber: vendorData.registrationNumber,
          taxNumber: vendorData.taxNumber,
          yearsInBusiness: vendorData.yearsInBusiness || 0,
          employeeCount: vendorData.employeeCount || '1-5'
        },
        socialMedia: {
          facebook: vendorData.facebook,
          instagram: vendorData.instagram,
          twitter: vendorData.twitter,
          linkedin: vendorData.linkedin
        },
        verification: {
          isVerified: false,
          documentsSubmitted: false,
          verificationLevel: 'basic'
        },
        settings: {
          acceptsOnlineBookings: vendorData.acceptsOnlineBookings !== false,
          instantBooking: vendorData.instantBooking || false,
          requiresApproval: vendorData.requiresApproval !== false,
          cancellationPolicy: vendorData.cancellationPolicy || 'flexible'
        }
      });

      await vendor.save();

      // Update user role to vendor
      await User.findByIdAndUpdate(userId, { 
        role: 'vendor',
        vendorProfile: vendor._id 
      });

      logger.info(`New vendor profile created: ${vendor.businessName}`, {
        vendorId: vendor._id,
        userId: userId,
        category: vendor.category
      });

      return vendor;
    } catch (error) {
      logger.error('Error creating vendor profile', {
        error: error.message,
        userId: userId,
        vendorData: vendorData
      });
      throw error;
    }
  }

  /**
   * Get vendors with advanced filtering and search
   */
  async getVendors(filters = {}, pagination = {}) {
    try {
      const {
        category,
        subcategory,
        city,
        province,
        priceRange,
        rating,
        verified,
        search,
        coordinates,
        radius = 50, // km
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const {
        page = 1,
        limit = 12,
        skip = (page - 1) * limit
      } = pagination;

      // Build query
      const query = { isActive: true };

      // Category filters
      if (category) query.category = category;
      if (subcategory) query.subcategory = subcategory;

      // Location filters
      if (city) query['location.city'] = new RegExp(city, 'i');
      if (province) query['location.province'] = new RegExp(province, 'i');

      // Price range filter
      if (priceRange) query['pricing.priceRange'] = priceRange;

      // Rating filter
      if (rating) query['rating.average'] = { $gte: parseFloat(rating) };

      // Verification filter
      if (verified === 'true') query['verification.isVerified'] = true;

      // Search functionality
      if (search) {
        query.$or = [
          { businessName: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { 'services.name': new RegExp(search, 'i') },
          { 'location.city': new RegExp(search, 'i') }
        ];
      }

      // Geolocation search
      if (coordinates && coordinates.lat && coordinates.lng) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [coordinates.lng, coordinates.lat]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        };
      }

      // Build sort object
      const sort = {};
      if (sortBy === 'rating') {
        sort['rating.average'] = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'price') {
        sort['pricing.basePrice'] = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'distance' && coordinates) {
        // Distance sorting is handled by $near
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Execute query with population
      const vendors = await Vendor.find(query)
        .populate('user', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count for pagination
      const total = await Vendor.countDocuments(query);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        vendors,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        filters: filters
      };
    } catch (error) {
      logger.error('Error fetching vendors', {
        error: error.message,
        filters: filters
      });
      throw error;
    }
  }

  /**
   * Get vendor by ID with detailed information
   */
  async getVendorById(vendorId, includeReviews = true) {
    try {
      let vendor = await Vendor.findById(vendorId)
        .populate('user', 'firstName lastName email createdAt')
        .lean();

      if (!vendor) {
        throw new ApiError('Vendor not found', 404);
      }

      // Include reviews if requested
      if (includeReviews) {
        const Review = require('../models/Review');
        const reviews = await Review.find({ vendor: vendorId })
          .populate('user', 'firstName lastName')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
        
        vendor.recentReviews = reviews;
      }

      // Calculate response rate and other metrics
      const Booking = require('../models/Booking');
      const bookingStats = await Booking.aggregate([
        { $match: { vendor: vendor._id } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            }
          }
        }
      ]);

      if (bookingStats.length > 0) {
        const stats = bookingStats[0];
        vendor.metrics = {
          totalBookings: stats.totalBookings,
          completionRate: stats.totalBookings > 0 
            ? Math.round((stats.completedBookings / stats.totalBookings) * 100) 
            : 0,
          cancellationRate: stats.totalBookings > 0 
            ? Math.round((stats.cancelledBookings / stats.totalBookings) * 100) 
            : 0
        };
      }

      return vendor;
    } catch (error) {
      logger.error('Error fetching vendor by ID', {
        error: error.message,
        vendorId: vendorId
      });
      throw error;
    }
  }

  /**
   * Update vendor profile
   */
  async updateVendor(vendorId, userId, updateData, files = []) {
    try {
      const vendor = await Vendor.findOne({ _id: vendorId, user: userId });
      if (!vendor) {
        throw new ApiError('Vendor not found or unauthorized', 404);
      }

      // Handle image uploads
      if (files && files.length > 0) {
        // Delete old images from cloud storage
        if (vendor.images && vendor.images.length > 0) {
          for (const image of vendor.images) {
            if (image.publicId) {
              await deleteFromCloudinary(image.publicId);
            }
          }
        }

        // Upload new images
        const uploadedImages = [];
        for (const file of files) {
          const result = await uploadToCloudinary(file.buffer, {
            folder: 'vendors',
            transformation: [
              { width: 800, height: 600, crop: 'fill', quality: 'auto' }
            ]
          });
          uploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            alt: `${updateData.businessName || vendor.businessName} image`
          });
        }
        updateData.images = uploadedImages;
      }

      // Update vendor
      const updatedVendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('user', 'firstName lastName email');

      logger.info(`Vendor profile updated: ${updatedVendor.businessName}`, {
        vendorId: vendorId,
        userId: userId
      });

      return updatedVendor;
    } catch (error) {
      logger.error('Error updating vendor profile', {
        error: error.message,
        vendorId: vendorId,
        userId: userId
      });
      throw error;
    }
  }

  /**
   * Get vendor analytics and insights
   */
  async getVendorAnalytics(vendorId, userId, timeframe = '30d') {
    try {
      const vendor = await Vendor.findOne({ _id: vendorId, user: userId });
      if (!vendor) {
        throw new ApiError('Vendor not found or unauthorized', 404);
      }

      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const Booking = require('../models/Booking');
      const Review = require('../models/Review');

      // Booking analytics
      const bookingAnalytics = await Booking.aggregate([
        {
          $match: {
            vendor: vendor._id,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            bookings: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Review analytics
      const reviewAnalytics = await Review.aggregate([
        {
          $match: {
            vendor: vendor._id,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      return {
        timeframe,
        bookings: bookingAnalytics,
        reviews: reviewAnalytics[0] || { totalReviews: 0, averageRating: 0 },
        summary: {
          totalBookings: bookingAnalytics.reduce((sum, day) => sum + day.bookings, 0),
          totalRevenue: bookingAnalytics.reduce((sum, day) => sum + day.revenue, 0),
          completionRate: bookingAnalytics.length > 0 
            ? Math.round((bookingAnalytics.reduce((sum, day) => sum + day.completed, 0) / 
                bookingAnalytics.reduce((sum, day) => sum + day.bookings, 0)) * 100)
            : 0
        }
      };
    } catch (error) {
      logger.error('Error fetching vendor analytics', {
        error: error.message,
        vendorId: vendorId
      });
      throw error;
    }
  }
}

module.exports = new VendorService();
