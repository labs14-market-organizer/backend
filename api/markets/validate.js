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
  body('operation').isArray()
    .withMessage("'operation' must be an array")
    .optional(),
  body('operation.*').isJSON()
    .withMessage("'operation' must be an array of objects")
    .optional(),
  body('operation.*.day').isString()
    .withMessage("'day' under 'operation' must be a string")
    .optional(),
  body('address').isString()
    .withMessage("'address' must be a string")
    .optional(),
  body('city').isString()
    .withMessage("'city' must be a string")
    .optional(),
  body('state').isString()
    .withMessage("'state' must be a string")
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
