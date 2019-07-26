const { body } = require('express-validator');

module.exports = [
  body('admin_id').isInt()
    .withMessage("'admin_id' must be an integer")
    .optional(),
  body('name').isString()
    .withMessage("'name' must be a string")
    .optional(),
  body('description').isString()
    .withMessage("'description must be a string")
    .optional(),
  body('address').isAlphanumeric()
    .withMessage("'address' must be a string of numbers and letters")
    .optional(),
  body('city').isAlpha()
    .withMessage("'city' must be a string of letters")
    .optional(),
  body('state').isAlpha()
    .withMessage("'state' must be a string of letters")
    .optional(),
  body('zipcode').isNumeric()
    .withMessage("'zipcode' must be a string of numbers")
    .optional(),
  body('type').isInt({min: 1, max: 2})
    .withMessage("'type' must be an integer value of 1 or 2")
    .optional(),
  body('website').isURL()
    .withMessage("'website' must be a URL")
    .optional(),
  body('facebook').isString()
    .withMessage("'facebook' must be a string")
    .optional(),
  body('twitter').isString()
    .withMessage("'twitter' must be a string")
    .optional(),
  body('instagram').isString()
    .withMessage("'instagram' must be a string")
    .optional(),
];
