const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const storeController = require('../controllers/storeController');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Validation middleware for store creation
const validateStore = [
    body('storeName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Store name must be between 2 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('category')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Category is required'),
    body('services')
        .optional()
        .isArray()
        .withMessage('Services must be an array'),
    body('operatingHours')
        .optional()
        .isObject()
        .withMessage('Operating hours must be an object')
];

// Public routes
router.get('/homepage', storeController.getHomepageStores);
router.get('/:slug', storeController.getStoreBySlug);

// Protected routes
router.get('/create/:applicationId', storeController.getStoreCreationForm);
router.post('/create/:applicationId', validateStore, storeController.createStore);
router.post('/:storeId/images', upload.array('images', 10), storeController.uploadStoreImages);
router.post('/:storeId/launch', storeController.launchStore);
router.post('/:storeId/custom-design', storeController.requestCustomDesign);

module.exports = router;
