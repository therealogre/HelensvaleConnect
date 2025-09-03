const Booking = require('../models/Booking');
const Vendor = require('../models/Vendor');
const { validationResult } = require('express-validator');

// @desc    Get all bookings for user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'customer') {
      query = Booking.find({ customer: req.user.id });
    } else if (req.user.role === 'vendor') {
      // Get vendor profile first
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found'
        });
      }
      query = Booking.find({ vendor: vendor._id });
    } else {
      // Admin can see all bookings
      query = Booking.find();
    }

    // Filtering
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    const filterQuery = JSON.parse(queryStr);
    Object.keys(filterQuery).forEach(key => {
      query = query.where(key, filterQuery[key]);
    });

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-bookingDate');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    query = query.skip(startIndex).limit(limit);

    // Populate related data
    query = query.populate([
      {
        path: 'customer',
        select: 'firstName lastName email phone'
      },
      {
        path: 'vendor',
        select: 'businessName businessType location contact',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      }
    ]);

    const bookings = await query;

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate([
      {
        path: 'customer',
        select: 'firstName lastName email phone'
      },
      {
        path: 'vendor',
        select: 'businessName businessType location contact',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    const vendor = await Vendor.findOne({ user: req.user.id });
    const hasAccess = 
      booking.customer.toString() === req.user.id ||
      (vendor && booking.vendor._id.toString() === vendor._id.toString()) ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Get vendor and service details
    const vendor = await Vendor.findById(req.body.vendor);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Find the service
    const service = vendor.services.id(req.body.service.id);
    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or inactive'
      });
    }

    // Check if booking date is in the future
    const bookingDateTime = new Date(req.body.bookingDate);
    if (bookingDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Booking date must be in the future'
      });
    }

    // Check for conflicts (simplified - would need more complex logic)
    const conflictingBooking = await Booking.findOne({
      vendor: req.body.vendor,
      bookingDate: req.body.bookingDate,
      'timeSlot.startTime': req.body.timeSlot.startTime,
      status: { $in: ['confirmed', 'in_progress'] }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Calculate total amount
    const participants = req.body.participants || 1;
    const totalAmount = service.price * participants;

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      vendor: req.body.vendor,
      service: {
        id: service._id,
        name: service.name,
        price: service.price,
        duration: service.duration
      },
      bookingDate: req.body.bookingDate,
      timeSlot: req.body.timeSlot,
      participants,
      totalAmount,
      payment: {
        method: req.body.payment.method,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      customerDetails: req.body.customerDetails || {}
    });

    await booking.populate([
      {
        path: 'customer',
        select: 'firstName lastName email phone'
      },
      {
        path: 'vendor',
        select: 'businessName businessType location contact'
      }
    ]);

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const vendor = await Vendor.findOne({ user: req.user.id });
    const isCustomer = booking.customer.toString() === req.user.id;
    const isVendor = vendor && booking.vendor.toString() === vendor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Restrict what customers can update
    if (isCustomer && !isAdmin) {
      const allowedFields = ['customerDetails', 'participants'];
      const updateFields = Object.keys(req.body);
      const isValidUpdate = updateFields.every(field => allowedFields.includes(field));
      
      if (!isValidUpdate) {
        return res.status(400).json({
          success: false,
          message: 'Customers can only update customer details and participants'
        });
      }
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      {
        path: 'customer',
        select: 'firstName lastName email phone'
      },
      {
        path: 'vendor',
        select: 'businessName businessType location contact'
      }
    ]);

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const vendor = await Vendor.findOne({ user: req.user.id });
    const isCustomer = booking.customer.toString() === req.user.id;
    const isVendor = vendor && booking.vendor.toString() === vendor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: isCustomer ? 'customer' : isVendor ? 'vendor' : 'admin',
      cancelledAt: new Date(),
      reason: req.body.reason || 'No reason provided'
    };

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check in to booking
// @route   PUT /api/bookings/:id/checkin
// @access  Private
exports.checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only customer can check in
    if (booking.customer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Only the customer can check in'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Booking must be confirmed to check in'
      });
    }

    // Check if it's the right time (within 30 minutes of start time)
    const now = new Date();
    const bookingDateTime = new Date(booking.fullDateTime);
    const timeDiff = Math.abs(now - bookingDateTime) / (1000 * 60); // minutes

    if (timeDiff > 30) {
      return res.status(400).json({
        success: false,
        message: 'Check-in is only allowed within 30 minutes of booking time'
      });
    }

    // Update booking
    booking.status = 'in_progress';
    booking.checkIn = {
      checkedInAt: new Date(),
      location: req.body.location || {}
    };

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Checked in successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add feedback to booking
// @route   PUT /api/bookings/:id/feedback
// @access  Private (Customer)
exports.addFeedback = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only customer can add feedback
    if (booking.customer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Only the customer can add feedback'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add feedback to completed bookings'
      });
    }

    if (booking.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already provided for this booking'
      });
    }

    // Add feedback
    booking.feedback = {
      rating: req.body.rating,
      comment: req.body.comment || '',
      submittedAt: new Date()
    };

    await booking.save();

    // Update vendor rating (simplified calculation)
    const vendor = await Vendor.findById(booking.vendor);
    const allBookings = await Booking.find({
      vendor: booking.vendor,
      'feedback.rating': { $exists: true }
    });

    const totalRating = allBookings.reduce((sum, b) => sum + b.feedback.rating, 0);
    const averageRating = totalRating / allBookings.length;

    vendor.ratings.average = averageRating;
    vendor.ratings.count = allBookings.length;
    await vendor.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Feedback added successfully'
    });
  } catch (error) {
    next(error);
  }
};
