const { body } = require('express-validator');

module.exports = [
  body('name').isString()
    .withMessage("'name' must be a string")
    .optional(),
  body('description').isString()
    .withMessage("'description must be a string")
    .optional(),
  body('items').isArray()
    .withMessage("'items' must be an array")
    .optional(),
  body('items.*').isString()
    .withMessage("Values within 'items' must be strings")
    .optional(),
  body('electricity').isBoolean()
    .withMessage("'electricity must be a boolean value")
    .optional(),
  body('ventilation').isBoolean()
    .withMessage("'ventilation' must be a boolean value")
    .optional(),
  body('loud').isBoolean()
    .withMessage("'loud' must be a boolean value")
    .optional(),
  body('other_special').isString()
    .withMessage("'other_special' must be a string")
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
