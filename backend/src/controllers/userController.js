const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Booking = require('../models/Booking');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, location, preferences } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      firstName,
      lastName,
      phone,
      location,
      preferences,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getUserFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'favorites',
    model: 'Vendor',
    select: 'businessName description location rating photos services'
  });

  res.status(200).json({
    success: true,
    data: user.favorites || []
  });
});

// @desc    Add vendor to favorites
// @route   POST /api/users/favorites/:vendorId
// @access  Private
const addToFavorites = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  const user = await User.findById(req.user.id);
  
  if (user.favorites.includes(vendorId)) {
    return res.status(400).json({
      success: false,
      message: 'Vendor already in favorites'
    });
  }

  user.favorites.push(vendorId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Vendor added to favorites'
  });
});

// @desc    Remove vendor from favorites
// @route   DELETE /api/users/favorites/:vendorId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const user = await User.findById(req.user.id);
  user.favorites = user.favorites.filter(id => id.toString() !== vendorId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Vendor removed from favorites'
  });
});

// @desc    Get user activity feed
// @route   GET /api/users/activity-feed
// @access  Private
const getUserActivityFeed = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  // Get recent bookings
  const recentBookings = await Booking.find({ customer: userId })
    .populate('vendor', 'businessName')
    .populate('service.id', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  // Format activity feed
  const activities = recentBookings.map(booking => ({
    id: booking._id,
    type: 'booking',
    action: `Booked ${booking.service.name} with ${booking.vendor.businessName}`,
    date: booking.createdAt,
    status: booking.status,
    metadata: {
      bookingId: booking._id,
      vendorId: booking.vendor._id,
      serviceId: booking.service.id
    }
  }));

  res.status(200).json({
    success: true,
    data: activities,
    pagination: {
      page,
      limit,
      total: activities.length
    }
  });
});

// @desc    Get user loyalty points
// @route   GET /api/users/loyalty
// @access  Private
const getUserLoyalty = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('loyaltyPoints loyaltyTier');

  const loyaltyData = {
    points: user.loyaltyPoints || 0,
    tier: user.loyaltyTier || 'Bronze',
    nextTierPoints: getNextTierPoints(user.loyaltyTier),
    benefits: getTierBenefits(user.loyaltyTier)
  };

  res.status(200).json({
    success: true,
    data: loyaltyData
  });
});

// @desc    Update user loyalty points
// @route   PUT /api/users/loyalty
// @access  Private
const updateUserLoyalty = asyncHandler(async (req, res) => {
  const { points, action } = req.body; // action: 'add' or 'redeem'

  const user = await User.findById(req.user.id);
  
  if (action === 'add') {
    user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
  } else if (action === 'redeem') {
    if ((user.loyaltyPoints || 0) < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient loyalty points'
      });
    }
    user.loyaltyPoints = (user.loyaltyPoints || 0) - points;
  }

  // Update tier based on points
  user.loyaltyTier = calculateLoyaltyTier(user.loyaltyPoints);
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      points: user.loyaltyPoints,
      tier: user.loyaltyTier
    }
  });
});

// Helper functions
const getNextTierPoints = (currentTier) => {
  const tiers = {
    'Bronze': 500,
    'Silver': 1000,
    'Gold': 2500,
    'Platinum': 5000,
    'Diamond': null
  };
  return tiers[currentTier];
};

const getTierBenefits = (tier) => {
  const benefits = {
    'Bronze': ['5% discount on bookings'],
    'Silver': ['10% discount on bookings', 'Priority support'],
    'Gold': ['15% discount on bookings', 'Priority support', 'Free cancellations'],
    'Platinum': ['20% discount on bookings', 'Priority support', 'Free cancellations', 'Exclusive services'],
    'Diamond': ['25% discount on bookings', 'VIP support', 'Free cancellations', 'Exclusive services', 'Personal concierge']
  };
  return benefits[tier] || [];
};

const calculateLoyaltyTier = (points) => {
  if (points >= 5000) return 'Diamond';
  if (points >= 2500) return 'Platinum';
  if (points >= 1000) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'Bronze';
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  getUserActivityFeed,
  getUserLoyalty,
  updateUserLoyalty
};
