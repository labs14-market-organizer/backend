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
    next(); // Temporary fix until everything uses JWT's subject as user_id
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

// "required" = array of required columns
// "reqID" = whether or not some field should match the user ID of the user making the request
// "colID" = the name of the field in the request body that should match the user ID of the user making the request
function reqCols(required, reqID = false, colID = 'id') {
  return (req, res, next) => {
    // filters through array of required columns to flag any missing fields
    let 
     = required
      .filter(prop => !Object.keys(req.body).includes(prop));
    // checks if ID is required and if user_id isn't already set on the request
    if(!!reqID && !req.user_id) {
      missing = [...missing, colID];
      // if ID is required, but user_id isn't already on request, then adds colID field name to the array of missing values
    }
    // rejects request if there are missing columns
    !!missing.length
      ? res.status(400).json({ message: `Your request is missing the following required fields: ${missing.join(', ')}`})
      : next();
  }
}

// "allowed" = array of columns that the user is allowed to specify in the request body
function onlyCols(allowed) {
  return (req, res, next) => {
    // filters through array of allowed columns to flag any that are included that shouldn't be
    const flagged = Object.keys(req.body)
      .filter(prop => !allowed.includes(prop))
      .join(', ');
    // rejects request if there are any unallowed columns
    if (!!flagged.length) {
      return res.status(400).json({
        error: `You are not permitted to submit any of the following fields in the body of this request: ${flagged}`
      })
    } else {
      next();
    }
  }
}
