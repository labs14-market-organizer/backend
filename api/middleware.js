const jwt = require('jsonwebtoken');

module.exports = {
  verifyJWT,
  reqCols,
  onlyCols,
}

function verifyJWT(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  const token = req.headers.authorization;
  if(!token) {
    next();
  } else {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if(!err) {
        req.user_id = decoded.subject;
        next();
      } else {
        res.status(403).json({ message: 'Invalid authorization token.' })
      }
    })
  }
}

function reqCols(required, reqID = false, colID = 'id') {
  return (req, res, next) => {
    let missing = required
      .filter(prop => !Object.keys(req.body).includes(prop));
    if(!!reqID && !req.user_id) {
      missing = [...missing, colID];
    }
    !!missing.length
      ? res.status(400).json({ message: `Your request is missing the following required fields: ${missing.join(', ')}`})
      : next();
  }
}

function onlyCols(allowed) {
  return (req, res, next) => {
    const flagged = Object.keys(req.body)
      .filter(prop => !allowed.includes(prop))
      .join(', ')
    if (!!flagged.length) {
      return res.status(400).json({
        error: `You are not permitted to submit any of the following fields in the body of this request: ${flagged}`
      })
    }
    next();
  }
}
