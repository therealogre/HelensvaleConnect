const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

/**
 * Booking Service - Handles all booking-related business logic
 * Implements marketplace best practices for booking management
 */
class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(userId, bookingData) {
    try {
      // Validate vendor exists and is active
      const vendor = await Vendor.findById(bookingData.vendorId)
        .populate('user', 'firstName lastName email phone');
      
      if (!vendor || !vendor.isActive) {
        throw new ApiError('Vendor not found or inactive', 404);
      }

      // Check vendor availability for the requested time slot
      const isAvailable = await this.checkVendorAvailability(
        bookingData.vendorId,
        bookingData.serviceDate,
        bookingData.serviceTime
      );

      if (!isAvailable) {
        throw new ApiError('Selected time slot is not available', 400);
      }

      // Calculate pricing
      const pricing = await this.calculateBookingPrice(
        bookingData.vendorId,
        bookingData.services,
        bookingData.serviceDate
      );

      // Create booking
      const booking = new Booking({
        customer: userId,
        vendor: bookingData.vendorId,
        services: bookingData.services,
        serviceDate: new Date(bookingData.serviceDate),
        serviceTime: bookingData.serviceTime,
        duration: bookingData.duration || 60, // Default 1 hour
        location: {
          type: bookingData.locationType || 'vendor_location',
          address: bookingData.address || vendor.location.address,
          coordinates: bookingData.coordinates || vendor.location.coordinates
        },
        pricing: {
          subtotal: pricing.subtotal,
          tax: pricing.tax,
          serviceFee: pricing.serviceFee,
          total: pricing.total,
          currency: 'ZAR'
        },
        paymentMethod: bookingData.paymentMethod,
        specialRequests: bookingData.specialRequests || '',
        status: vendor.settings.requiresApproval ? 'pending_approval' : 'confirmed',
        metadata: {
          source: bookingData.source || 'web',
          userAgent: bookingData.userAgent,
          ipAddress: bookingData.ipAddress
        }
      });

      await booking.save();

      // Send notifications
      await this.sendBookingNotifications(booking, 'created');

      // Update vendor statistics
      await this.updateVendorStats(bookingData.vendorId, 'booking_created');

      logger.info(`New booking created: ${booking._id}`, {
        bookingId: booking._id,
        customerId: userId,
        vendorId: bookingData.vendorId,
        total: pricing.total
      });

      return await this.getBookingById(booking._id, userId);
    } catch (error) {
      logger.error('Error creating booking', {
        error: error.message,
        userId: userId,
        bookingData: bookingData
      });
      throw error;
    }
  }

  /**
   * Check vendor availability for a specific time slot
   */
  async checkVendorAvailability(vendorId, date, time) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return false;

      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

      // Check if vendor operates on this day
      const operatingHours = vendor.operatingHours[dayOfWeek];
      if (!operatingHours || !operatingHours.isOpen) {
        return false;
      }

      // Check if time is within operating hours
      const requestedTime = new Date(`${date} ${time}`);
      const openTime = new Date(`${date} ${operatingHours.open}`);
      const closeTime = new Date(`${date} ${operatingHours.close}`);

      if (requestedTime < openTime || requestedTime > closeTime) {
        return false;
      }

      // Check for existing bookings at the same time
      const existingBooking = await Booking.findOne({
        vendor: vendorId,
        serviceDate: requestedDate,
        serviceTime: time,
        status: { $in: ['confirmed', 'in_progress', 'pending_approval'] }
      });

      return !existingBooking;
    } catch (error) {
      logger.error('Error checking vendor availability', {
        error: error.message,
        vendorId: vendorId,
        date: date,
        time: time
      });
      return false;
    }
  }

  /**
   * Calculate booking price including taxes and fees
   */
  async calculateBookingPrice(vendorId, services, serviceDate) {
    try {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        throw new ApiError('Vendor not found', 404);
      }

      let subtotal = 0;

      // Calculate service costs
      for (const service of services) {
        const vendorService = vendor.services.find(s => s._id.toString() === service.serviceId);
        if (vendorService) {
          subtotal += vendorService.price * (service.quantity || 1);
        }
      }

      // Apply discounts (if any)
      const discount = await this.calculateDiscounts(vendorId, subtotal, serviceDate);
      subtotal -= discount;

      // Calculate tax (15% VAT in South Africa)
      const tax = Math.round(subtotal * 0.15 * 100) / 100;

      // Calculate service fee (5% platform fee)
      const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;

      // Calculate total
      const total = Math.round((subtotal + tax + serviceFee) * 100) / 100;

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: tax,
        serviceFee: serviceFee,
        discount: discount,
        total: total
      };
    } catch (error) {
      logger.error('Error calculating booking price', {
        error: error.message,
        vendorId: vendorId,
        services: services
      });
      throw error;
    }
  }

  /**
   * Calculate applicable discounts
   */
  async calculateDiscounts(vendorId, subtotal, serviceDate) {
    try {
      let totalDiscount = 0;

      // First-time customer discount (20%)
      const isFirstTime = await this.isFirstTimeCustomer(vendorId);
      if (isFirstTime) {
        totalDiscount += Math.min(subtotal * 0.20, 100); // Max R100 discount
      }

      // Early bird discount (10% for bookings made 7+ days in advance)
      const daysInAdvance = Math.ceil((new Date(serviceDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysInAdvance >= 7) {
        totalDiscount += subtotal * 0.10;
      }

      return Math.round(totalDiscount * 100) / 100;
    } catch (error) {
      logger.error('Error calculating discounts', { error: error.message });
      return 0;
    }
  }

  /**
   * Get booking by ID with full details
   */
  async getBookingById(bookingId, userId, userRole = 'customer') {
    try {
      let query = { _id: bookingId };
      
      // Restrict access based on user role
      if (userRole === 'customer') {
        query.customer = userId;
      } else if (userRole === 'vendor') {
        const vendor = await Vendor.findOne({ user: userId });
        if (vendor) {
          query.vendor = vendor._id;
        } else {
          throw new ApiError('Vendor profile not found', 404);
        }
      }

      const booking = await Booking.findOne(query)
        .populate('customer', 'firstName lastName email phone')
        .populate('vendor', 'businessName contact location')
        .populate('vendor.user', 'firstName lastName email phone')
        .lean();

      if (!booking) {
        throw new ApiError('Booking not found', 404);
      }

      return booking;
    } catch (error) {
      logger.error('Error fetching booking', {
        error: error.message,
        bookingId: bookingId,
        userId: userId
      });
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, newStatus, userId, userRole, notes = '') {
    try {
      const booking = await this.getBookingById(bookingId, userId, userRole);
      
      // Validate status transition
      const validTransitions = this.getValidStatusTransitions(booking.status, userRole);
      if (!validTransitions.includes(newStatus)) {
        throw new ApiError(`Cannot change status from ${booking.status} to ${newStatus}`, 400);
      }

      // Update booking
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: newStatus,
          $push: {
            statusHistory: {
              status: newStatus,
              changedBy: userId,
              changedAt: new Date(),
              notes: notes
            }
          }
        },
        { new: true }
      ).populate('customer vendor');

      // Send notifications for status changes
      await this.sendBookingNotifications(updatedBooking, 'status_changed');

      // Handle specific status changes
      if (newStatus === 'completed') {
        await this.handleBookingCompletion(updatedBooking);
      } else if (newStatus === 'cancelled') {
        await this.handleBookingCancellation(updatedBooking, notes);
      }

      logger.info(`Booking status updated: ${bookingId}`, {
        bookingId: bookingId,
        oldStatus: booking.status,
        newStatus: newStatus,
        userId: userId
      });

      return updatedBooking;
    } catch (error) {
      logger.error('Error updating booking status', {
        error: error.message,
        bookingId: bookingId,
        newStatus: newStatus
      });
      throw error;
    }
  }

  /**
   * Get valid status transitions based on current status and user role
   */
  getValidStatusTransitions(currentStatus, userRole) {
    const transitions = {
      customer: {
        'pending_approval': ['cancelled'],
        'confirmed': ['cancelled'],
        'in_progress': [],
        'completed': [],
        'cancelled': []
      },
      vendor: {
        'pending_approval': ['confirmed', 'cancelled'],
        'confirmed': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': []
      },
      admin: {
        'pending_approval': ['confirmed', 'cancelled'],
        'confirmed': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'cancelled'],
        'completed': ['cancelled'],
        'cancelled': ['confirmed']
      }
    };

    return transitions[userRole]?.[currentStatus] || [];
  }

  /**
   * Send booking notifications via email and SMS
   */
  async sendBookingNotifications(booking, eventType) {
    try {
      const customer = booking.customer;
      const vendor = booking.vendor;

      const templates = {
        created: {
          customer: {
            subject: 'Booking Confirmation - Helensvale Connect',
            template: 'booking-confirmation-customer'
          },
          vendor: {
            subject: 'New Booking Received - Helensvale Connect',
            template: 'booking-notification-vendor'
          }
        },
        status_changed: {
          customer: {
            subject: `Booking ${booking.status.replace('_', ' ').toUpperCase()} - Helensvale Connect`,
            template: 'booking-status-customer'
          },
          vendor: {
            subject: `Booking ${booking.status.replace('_', ' ').toUpperCase()} - Helensvale Connect`,
            template: 'booking-status-vendor'
          }
        }
      };

      const customerTemplate = templates[eventType]?.customer;
      const vendorTemplate = templates[eventType]?.vendor;

      // Send customer notifications
      if (customerTemplate && customer.email) {
        await sendEmail({
          to: customer.email,
          subject: customerTemplate.subject,
          template: customerTemplate.template,
          data: { booking, customer, vendor }
        });
      }

      // Send vendor notifications
      if (vendorTemplate && vendor.user?.email) {
        await sendEmail({
          to: vendor.user.email,
          subject: vendorTemplate.subject,
          template: vendorTemplate.template,
          data: { booking, customer, vendor }
        });
      }

      // Send SMS notifications for urgent updates
      if (['confirmed', 'cancelled', 'completed'].includes(booking.status)) {
        if (customer.phone) {
          await sendSMS({
            to: customer.phone,
            message: `Your booking with ${vendor.businessName} is now ${booking.status}. Check the app for details.`
          });
        }
      }

    } catch (error) {
      logger.error('Error sending booking notifications', {
        error: error.message,
        bookingId: booking._id
      });
      // Don't throw error as this shouldn't fail the main operation
    }
  }

  /**
   * Handle booking completion
   */
  async handleBookingCompletion(booking) {
    try {
      // Update vendor statistics
      await this.updateVendorStats(booking.vendor._id, 'booking_completed');

      // Create review request
      await this.createReviewRequest(booking);

      // Process payment if not already processed
      if (booking.payment?.status !== 'completed') {
        await this.processPayment(booking);
      }

    } catch (error) {
      logger.error('Error handling booking completion', {
        error: error.message,
        bookingId: booking._id
      });
    }
  }

  /**
   * Handle booking cancellation
   */
  async handleBookingCancellation(booking, reason) {
    try {
      // Calculate cancellation fee based on timing
      const cancellationFee = this.calculateCancellationFee(booking);

      // Process refund if applicable
      if (booking.payment?.status === 'completed' && cancellationFee < booking.pricing.total) {
        const refundAmount = booking.pricing.total - cancellationFee;
        await this.processRefund(booking, refundAmount);
      }

      // Update vendor statistics
      await this.updateVendorStats(booking.vendor._id, 'booking_cancelled');

    } catch (error) {
      logger.error('Error handling booking cancellation', {
        error: error.message,
        bookingId: booking._id
      });
    }
  }

  /**
   * Calculate cancellation fee based on timing
   */
  calculateCancellationFee(booking) {
    const now = new Date();
    const serviceDate = new Date(booking.serviceDate);
    const hoursUntilService = (serviceDate - now) / (1000 * 60 * 60);

    if (hoursUntilService >= 24) {
      return 0; // No fee for 24+ hours notice
    } else if (hoursUntilService >= 2) {
      return booking.pricing.total * 0.25; // 25% fee for 2-24 hours notice
    } else {
      return booking.pricing.total * 0.50; // 50% fee for less than 2 hours notice
    }
  }

  /**
   * Update vendor statistics
   */
  async updateVendorStats(vendorId, eventType) {
    try {
      const updateQuery = {};
      
      switch (eventType) {
        case 'booking_created':
          updateQuery.$inc = { 'stats.totalBookings': 1 };
          break;
        case 'booking_completed':
          updateQuery.$inc = { 
            'stats.completedBookings': 1,
            'stats.totalRevenue': 1 // This should be the actual amount
          };
          break;
        case 'booking_cancelled':
          updateQuery.$inc = { 'stats.cancelledBookings': 1 };
          break;
      }

      if (Object.keys(updateQuery).length > 0) {
        await Vendor.findByIdAndUpdate(vendorId, updateQuery);
      }

    } catch (error) {
      logger.error('Error updating vendor stats', {
        error: error.message,
        vendorId: vendorId,
        eventType: eventType
      });
    }
  }

  /**
   * Get bookings with filtering and pagination
   */
  async getBookings(filters = {}, pagination = {}, userId, userRole) {
    try {
      const {
        status,
        dateFrom,
        dateTo,
        vendorId,
        customerId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const {
        page = 1,
        limit = 10,
        skip = (page - 1) * limit
      } = pagination;

      // Build query based on user role
      let query = {};
      
      if (userRole === 'customer') {
        query.customer = userId;
      } else if (userRole === 'vendor') {
        const vendor = await Vendor.findOne({ user: userId });
        if (vendor) {
          query.vendor = vendor._id;
        } else {
          return { bookings: [], pagination: { totalItems: 0 } };
        }
      }

      // Apply filters
      if (status) query.status = status;
      if (vendorId) query.vendor = vendorId;
      if (customerId) query.customer = customerId;
      
      if (dateFrom || dateTo) {
        query.serviceDate = {};
        if (dateFrom) query.serviceDate.$gte = new Date(dateFrom);
        if (dateTo) query.serviceDate.$lte = new Date(dateTo);
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const bookings = await Booking.find(query)
        .populate('customer', 'firstName lastName email phone')
        .populate('vendor', 'businessName contact location')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      // Get total count
      const total = await Booking.countDocuments(query);

      return {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      };

    } catch (error) {
      logger.error('Error fetching bookings', {
        error: error.message,
        filters: filters,
        userId: userId
      });
      throw error;
    }
  }
}

module.exports = new BookingService();
