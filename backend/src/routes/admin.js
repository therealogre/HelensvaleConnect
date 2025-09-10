const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Applications management
router.get('/applications', adminController.getApplications);
router.post('/applications/bulk-approve', adminController.bulkApproveApplications);
router.post('/applications/payment-reminders', adminController.sendPaymentReminders);

// Stores management
router.get('/stores', adminController.getStores);
router.put('/stores/showcase-order', adminController.updateStoreShowcaseOrder);
router.put('/stores/:storeId/featured', adminController.toggleStoreFeatured);

module.exports = router;
