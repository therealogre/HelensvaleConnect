const express = require('express');
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorsByLocation,
  uploadVendorPhoto
} = require('../controllers/vendorController');
const { vendorPhotoUpload, handleUploadError } = require('../middleware/upload');

const { validateVendorRegistration } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getVendors);
router.get('/:id', getVendor);
router.get('/location/:radius/:zipcode', getVendorsByLocation);

// Protected routes
router.post('/', protect, authorize('vendor', 'admin'), validateVendorRegistration, createVendor);
router.put('/:id', protect, authorize('vendor', 'admin'), updateVendor);
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteVendor);
router.put('/:id/photo', protect, authorize('vendor', 'admin'), uploadVendorPhoto);

module.exports = router;
