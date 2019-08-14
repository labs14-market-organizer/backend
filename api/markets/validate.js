const { body } = require('express-validator');

// Separate specs for markets & booth types
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
      .optional({nullable: true}),
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
      .optional({nullable: true}),
    body('city').isString()
      .withMessage("'city' must be a string")
      .optional({nullable: true}),
    body('state').isString()
      .withMessage("'state' must be a string")
      .optional({nullable: true}),
    body('zipcode').isNumeric()
      .withMessage("'zipcode' must be a string of numbers")
      .optional({nullable: true}),
    body('type').isInt({min: 1, max: 2})
      .withMessage("'type' must be an integer value of 1 or 2")
      .optional({nullable: true}),
    body('website').isURL()
      .withMessage("'website' must be a URL")
      .optional({nullable: true}),
    body('facebook').isString()
      .withMessage("'facebook' must be a string")
      .optional({nullable: true}),
    body('twitter').isString()
      .withMessage("'twitter' must be a string")
      .optional({nullable: true}),
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
    body('rules').isString()
    .withMessage("'rules' must be a string")
    .optional({nullable: true}),
  ],
  booth: [
    body('name').isString()
      .withMessage("'name' must be a string")
      .optional({nullable: true}),
    body('number').isInt()
      .withMessage("'number' must be an integer")
      .optional({nullable: true}),
    body('price').isNumeric()
      .withMessage("'price' must be numeric")
      .optional({nullable: true}),
    body('size').custom(val => Array.isArray(val) && val.length === 2)
      .withMessage("'size' must be an array with exactly two entries")
      .optional({nullable: true}),
    body('size.*').isInt()
      .withMessage("'size' must be an array of integers")
      .optional({nullable: true}),
    body('description').isString()
      .withMessage("'description' must be a string")
      .optional({nullable: true}),
  ],
  reserve: [
    body('reserve_date').isArray()
      .withMessage("'reserve_date' must be an array")
      .optional(),
    body('reserve_date.*').isString()
      .matches(`^[0-9]{4}-(((0[13578]|1[02])-(0[0-9]|1[0-9]|2[0-9]|3[0-1]))|((0[469]|11)-(0[0-9]|1[0-9]|2[0-9]|30))|(02-(0[0-9]|1[0-9]|2[0-9])))$`)
      .withMessage("'reserve_date' must be an array of valid dates in the format 'YYYY-MM-DD'")
      .optional(),
    body('paid').isInt()
      .withMessage("'paid' must be an integer")
      .optional()
  ]
}

