const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const path = require('path');
const { getFileUrl, deleteFile } = require('../middleware/upload');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res, next) => {
  try {
    let query = Vendor.find({ isActive: true });

    // Filtering
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = query.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Vendor.countDocuments({ isActive: true });

    query = query.skip(startIndex).limit(limit);

    // Populate user data
    query = query.populate({
      path: 'user',
      select: 'firstName lastName email phone'
    });

    // Execute query
    const vendors = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: vendors.length,
      pagination,
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Public
exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate({
      path: 'user',
      select: 'firstName lastName email phone'
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private (Vendor, Admin)
exports.createVendor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user already has a vendor profile
    const existingVendor = await Vendor.findOne({ user: req.user.id });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'User already has a vendor profile'
      });
    }

    // Add user to req.body
    req.body.user = req.user.id;

    const vendor = await Vendor.create(req.body);

    // Update user role to vendor
    await User.findByIdAndUpdate(req.user.id, { role: 'vendor' });

    await vendor.populate({
      path: 'user',
      select: 'firstName lastName email phone'
    });

    res.status(201).json({
      success: true,
      data: vendor,
      message: 'Vendor profile created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Vendor owner, Admin)
exports.updateVendor = async (req, res, next) => {
  try {
    let vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Make sure user is vendor owner or admin
    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this vendor'
      });
    }

    vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'user',
      select: 'firstName lastName email phone'
    });

    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Vendor owner, Admin)
exports.deleteVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Make sure user is vendor owner or admin
    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this vendor'
      });
    }

    // Soft delete - set isActive to false
    await Vendor.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendors within a radius
// @route   GET /api/vendors/location/:radius/:zipcode
// @access  Public
exports.getVendorsByLocation = async (req, res, next) => {
  try {
    const { radius, zipcode } = req.params;

    // Get lat/lng from geocoder (simplified for now)
    // In production, you'd use a geocoding service
    const lat = -27.8629; // Helensvale coordinates
    const lng = 153.3267;

    // Calc radius using radians
    // Divide distance by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radiusInRadians = radius / 6378;

    const vendors = await Vendor.find({
      'location.geoLocation': {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians]
        }
      },
      isActive: true
    }).populate({
      path: 'user',
      select: 'firstName lastName email phone'
    });

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload photo for vendor
// @route   PUT /api/vendors/:id/photo
// @access  Private (Vendor owner, Admin)
exports.uploadVendorPhoto = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Make sure user is vendor owner or admin
    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this vendor'
      });
    }

    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Check filesize
    if (file.size > process.env.MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `Please upload an image less than ${process.env.MAX_FILE_SIZE}`
      });
    }

    // Create custom filename
    file.name = `photo_${vendor._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Problem with file upload'
        });
      }

      await Vendor.findByIdAndUpdate(req.params.id, { logo: file.name });

      res.status(200).json({
        success: true,
        data: file.name,
        message: 'Photo uploaded successfully'
      });
    });
  } catch (error) {
    next(error);
  }
};
