const { body, param } = require('express-validator');
const { isValidObjectId } = require('mongoose');

// Import validation modules
const authValidations = require('./validations/authValidations');

// Re-export all validations
module.exports = {
  // Authentication validations
  ...authValidations,
  
  // Store validation
  validateStore: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Store name is required')
      .isLength({ max: 100 })
      .withMessage('Store name must be less than 100 characters'),
    
    body('description')
      .trim()
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    
    body('address')
      .optional()
      .isObject()
      .withMessage('Address must be an object'),
    
    body('location')
      .optional()
      .isObject()
      .withMessage('Location must be an object with lat and lng'),
    
    body('contact')
      .optional()
      .isObject()
      .withMessage('Contact must be an object'),
    
    body('operatingHours')
      .optional()
      .isObject()
      .withMessage('Operating hours must be an object'),
    
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],
  
  // ID parameter validation
  validateId: [
    param('id')
      .custom((value) => {
        if (!isValidObjectId(value)) {
          throw new Error('Invalid ID format');
        }
        return true;
      })
  ]
};
