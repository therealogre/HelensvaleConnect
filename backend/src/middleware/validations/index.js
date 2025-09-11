const authValidations = require('./authValidations');

// Import other validation modules as they're created
// const bookingValidations = require('./bookingValidations');
// const vendorValidations = require('./vendorValidations');
// const paymentValidations = require('./paymentValidations');

module.exports = {
  ...authValidations,
  // ...bookingValidations,
  // ...vendorValidations,
  // ...paymentValidations
};
