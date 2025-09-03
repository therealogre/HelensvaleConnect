const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  checkInBooking,
  addFeedback
} = require('../controllers/bookingController');

const { validateBooking } = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Customer and vendor routes
router.get('/', getBookings);
router.get('/:id', getBooking);
router.post('/', authorize('customer'), validateBooking, createBooking);
router.put('/:id', updateBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/checkin', checkInBooking);
router.put('/:id/feedback', authorize('customer'), addFeedback);

module.exports = router;
