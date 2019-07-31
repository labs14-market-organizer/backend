const { body } = require('express-validator');

module.exports = {
  market: [
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
    body('operation.*.day').isString()
      .withMessage("'day' under 'operation' must be a string")
      .optional(),
    body('operation.*.start').isString()
      .matches(`^(0[0-9]|1[0-9]|2[0-3]|[0-9])(:[0-5][0-9]){1,2}$`)
      .withMessage("'start' under 'operation' must be a string in the format 'hh:mm' or 'hh:mm:ss'")
      .optional(),
    body('operation.*.end').isString()
      .matches(`^(0[0-9]|1[0-9]|2[0-3]|[0-9])(:[0-5][0-9]){1,2}$`)
      .withMessage("'end' under 'operation' must be a string in the format 'hh:mm' or 'hh:mm:ss'")
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
  ],
  booth: [
    body('type').isString()
      .withMessage("'type' must be a string")
      .optional(),
    body('number').isInt()
      .withMessage("'number' must be an integer")
      .optional(),
    body('price').isNumeric()
      .withMessage("'price' must be numeric")
      .optional(),
    body('size').custom(val => Array.isArray(val) && val.length === 2)
      .withMessage("'size' must be an array with exactly two entries")
      .optional(),
    body('size.*').isInt()
      .withMessage("'size' must be an array of integers")
      .optional(),
    body('description').isString()
      .withMessage("'description' must be a string")
      .optional(),
  ]
}

