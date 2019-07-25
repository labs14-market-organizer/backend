const jwt = require('jsonwebtoken');
const db = require('../data/dbConfig');

module.exports = {
  verifyJWT,
  onlyOwner,
  reqCols,
  onlyCols,
}

// "protected" = whether or not the route(s) are protected, requiring a valid JWT
function verifyJWT(protected = true) {
  return (req, res, next) => {
    const jwtSecret = process.env.JWT_SECRET;
    const token = req.headers.authorization;
    if(!!protected && !token) {
      res.status(401).json({ message: 'Authorization token required, but not provided.' })
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
}

// "table" = the table of the target entry
// "tableID" = the column name of the associated user ID in that table
// "paramID" = the name of the request parameter that maps to the entry ID in the target table
function onlyOwner(table, tableID = 'id', paramID = 'id') {
  return async (req, res, next) => {
    const {user_id} = req; // grab user ID from request
    const id = req.params[paramID]; // grab ID from URL
    // find user ID on target entry
    const [result] = await db(table)
      .select(tableID)
      .where({id});
    !result && next(); // let routes handle 404s
    result[tableID] === user_id // determine if IDs match
      ? next()
      : res.status(403).json({ message: 'Only the user associated with that entry is authorized to make this request.' })
  }
}

// "required" = array of required columns
// "reqID" = whether or not some field should match the user ID of the user making the request
// "colID" = the name of the field in the request body that should match the user ID of the user making the request
function reqCols(required, reqID = false, colID = 'id') {
  return (req, res, next) => {
    // filters through array of required columns to flag any missing fields
    const body = Object.keys(req.body);
    let missing = required
      .filter(prop => !body.includes(prop));
    // checks if ID is required and if user_id isn't already set on the request
    if(!!reqID && !req.user_id && !body.includes(colID)) {
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
