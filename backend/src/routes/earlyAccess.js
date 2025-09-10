const express = require('express');
const { body } = require('express-validator');
const earlyAccessController = require('../controllers/earlyAccessController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Validation middleware
const validateApplication = [
    body('businessName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),
    body('ownerName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Owner name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('phone')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('businessType')
        .isIn(['restaurant', 'salon_spa', 'automotive', 'home_services', 'healthcare', 'fitness', 'retail', 'professional_services', 'education', 'entertainment', 'other'])
        .withMessage('Please select a valid business type'),
    body('businessDescription')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Business description must be between 10 and 500 characters'),
    body('city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
    body('selectedPlan')
        .isIn(['starter', 'professional', 'enterprise'])
        .withMessage('Please select a valid plan')
];

// Public routes
router.post('/apply', validateApplication, earlyAccessController.submitApplication);
router.get('/status/:applicationId', earlyAccessController.getApplicationStatus);
router.post('/payment/:applicationId', earlyAccessController.createPayment);
router.get('/payment/status/:applicationId', earlyAccessController.checkPaymentStatus);

// Admin routes (require authentication)
router.get('/admin/applications', auth, adminAuth, earlyAccessController.getAllApplications);
router.post('/admin/applications/:applicationId/approve', auth, adminAuth, earlyAccessController.approveApplication);
router.post('/admin/applications/:applicationId/reject', auth, adminAuth, earlyAccessController.rejectApplication);
router.get('/admin/dashboard/stats', auth, adminAuth, earlyAccessController.getDashboardStats);

module.exports = router;
