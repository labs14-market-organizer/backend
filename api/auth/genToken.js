const jwt = require('jsonwebtoken');

module.exports = (user, expire) => {
  const { id } = user;
  const payload = { subject: id };
  const jwtSecret = process.env.JWT_SECRET;
  const opt = { expiresIn: `${expire}ms` };
  return jwt.sign(payload, jwtSecret, opt);
}
