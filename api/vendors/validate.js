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
    .optional({ nullable: true }),
  body('items').isArray()
    .withMessage("'items' must be an array")
    .optional(),
  body('items.*').isString()
    .withMessage("Values within 'items' must be strings")
    .optional(),
  body('electricity').isBoolean()
    .withMessage("'electricity must be a boolean value")
    .optional({ nullable: true }),
  body('ventilation').isBoolean()
    .withMessage("'ventilation' must be a boolean value")
    .optional({ nullable: true }),
  body('loud').isBoolean()
    .withMessage("'loud' must be a boolean value")
    .optional({ nullable: true }),
  body('other_special').isString()
    .withMessage("'other_special' must be a string")
    .optional({ nullable: true }),
  body('website').isURL()
    .withMessage("'website' must be a URL")
    .optional({ nullable: true }),
  body('facebook').isString()
    .withMessage("'facebook' must be a string")
    .optional({ nullable: true }),
  body('twitter').isString()
    .withMessage("'twitter' must be a string")
    .optional({ nullable: true }),
  body('instagram').isString()
    .withMessage("'instagram' must be a string")
    .optional({ nullable: true }),
  body('email').isEmail()
    .withMessage("'email' must be a vaild email")
    .optional(),
  body('phone').isString()
    .matches(`^[0-9]{3}-[0-9]{3}-[0-9]{4}$`)
    .withMessage("'phone' must be in the format '###-###-####'")
    .optional(),
]
