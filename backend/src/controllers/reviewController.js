const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');

// Mock review data structure - in production this would be a database model
let reviews = [];

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Private
const getReviews = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userReviews = reviews.filter(review => review.customer === userId);

  res.status(200).json({
    success: true,
    data: userReviews
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Private
const getReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = reviews.find(review => review.id === id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Customer only)
const createReview = asyncHandler(async (req, res) => {
  const { vendorId, bookingId, rating, comment, serviceQuality, communication, value } = req.body;
  const customerId = req.user.id;

  // Verify booking exists and belongs to user
  const booking = await Booking.findOne({ 
    _id: bookingId, 
    customer: customerId,
    status: 'completed'
  });

  if (!booking) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking or booking not completed'
    });
  }

  // Check if review already exists for this booking
  const existingReview = reviews.find(review => 
    review.bookingId === bookingId && review.customer === customerId
  );

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'Review already exists for this booking'
    });
  }

  const review = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    vendor: vendorId,
    customer: customerId,
    booking: bookingId,
    rating: parseInt(rating),
    comment,
    serviceQuality: parseInt(serviceQuality),
    communication: parseInt(communication),
    value: parseInt(value),
    helpful: 0,
    helpfulVotes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  reviews.push(review);

  // Update vendor rating (simplified calculation)
  updateVendorRating(vendorId);

  res.status(201).json({
    success: true,
    data: review,
    message: 'Review created successfully'
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment, serviceQuality, communication, value } = req.body;
  const customerId = req.user.id;

  const reviewIndex = reviews.findIndex(review => 
    review.id === id && review.customer === customerId
  );

  if (reviewIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Review not found or unauthorized'
    });
  }

  reviews[reviewIndex] = {
    ...reviews[reviewIndex],
    rating: parseInt(rating),
    comment,
    serviceQuality: parseInt(serviceQuality),
    communication: parseInt(communication),
    value: parseInt(value),
    updatedAt: new Date()
  };

  // Update vendor rating
  updateVendorRating(reviews[reviewIndex].vendor);

  res.status(200).json({
    success: true,
    data: reviews[reviewIndex],
    message: 'Review updated successfully'
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;

  const reviewIndex = reviews.findIndex(review => 
    review.id === id && review.customer === customerId
  );

  if (reviewIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Review not found or unauthorized'
    });
  }

  const vendorId = reviews[reviewIndex].vendor;
  reviews.splice(reviewIndex, 1);

  // Update vendor rating
  updateVendorRating(vendorId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markReviewHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { helpful } = req.body; // true or false
  const userId = req.user.id;

  const reviewIndex = reviews.findIndex(review => review.id === id);

  if (reviewIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  const review = reviews[reviewIndex];
  
  // Remove existing vote if any
  review.helpfulVotes = review.helpfulVotes.filter(vote => vote.userId !== userId);
  
  // Add new vote
  if (helpful !== undefined) {
    review.helpfulVotes.push({ userId, helpful, createdAt: new Date() });
  }

  // Recalculate helpful count
  review.helpful = review.helpfulVotes.filter(vote => vote.helpful).length;

  res.status(200).json({
    success: true,
    message: 'Vote recorded successfully'
  });
});

// @desc    Get vendor reviews
// @route   GET /api/reviews/vendor/:vendorId
// @access  Public
const getVendorReviews = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const vendorReviews = reviews
    .filter(review => review.vendor === vendorId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(skip, skip + limit);

  const total = reviews.filter(review => review.vendor === vendorId).length;

  res.status(200).json({
    success: true,
    data: vendorReviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get vendor review stats
// @route   GET /api/reviews/vendor/:vendorId/stats
// @access  Public
const getReviewStats = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const vendorReviews = reviews.filter(review => review.vendor === vendorId);

  if (vendorReviews.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    });
  }

  const totalReviews = vendorReviews.length;
  const averageRating = vendorReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  vendorReviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });

  res.status(200).json({
    success: true,
    data: {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution
    }
  });
});

// Helper function to update vendor rating
const updateVendorRating = async (vendorId) => {
  const vendorReviews = reviews.filter(review => review.vendor === vendorId);
  
  if (vendorReviews.length > 0) {
    const averageRating = vendorReviews.reduce((sum, review) => sum + review.rating, 0) / vendorReviews.length;
    
    try {
      await Vendor.findByIdAndUpdate(vendorId, {
        rating: Math.round(averageRating * 10) / 10,
        reviewCount: vendorReviews.length
      });
    } catch (error) {
      console.error('Error updating vendor rating:', error);
    }
  }
};

module.exports = {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getVendorReviews,
  getReviewStats
};
