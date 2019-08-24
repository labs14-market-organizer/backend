const jwt = require('jsonwebtoken');

module.exports = (user, redirect = false) => {
  const { id } = user;
  const payload = { subject: id };
  const jwtSecret = process.env.JWT_SECRET;
  const exp = 1000*60*60*2; // 2 hours
  const opt = { expiresIn: `${exp}ms` };
  const token = jwt.sign(payload, jwtSecret, opt);
  return !!redirect
    ? `${FE_URL}/auth/token?jwt=${jwt}&exp=${exp}`
    : {token, exp};
}
