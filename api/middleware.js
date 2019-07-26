const jwt = require('jsonwebtoken');
const db = require('../data/dbConfig');
const {validationResult} = require('express-validator');

module.exports = {
  verifyJWT,
  protect,
  onlyOwner,
  validate,
  reqCols,
  reqNestCols,
  onlyCols,
  onlyNestCols
}

// Verifies JWT and stores subject on request as "user_id"
function verifyJWT(req, res, next) {
  const jwtSecret = process.env.JWT_SECRET;
  const token = req.headers.authorization;
  if(!token) {
    next(); // Let protect() handle route protection
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

// Protects route by requiring JWT
// *** Always use after verifyJWT() ***
function protect(req, res, next) {
  !req.headers.authorization
    ? res.status(401).json({ message: 'Authorization token missing.' })
    : next();
}

// "table" = the table of the target entry
// "tableID" = the column name of the associated user ID in that table
// "paramID" = the name of the request parameter that
//     maps to the entry ID in the target table
function onlyOwner(table, tableID = 'id', paramID = 'id') {
  return async (req, res, next) => {
    const {user_id} = req; // Grab user ID from request
    const id = req.params[paramID]; // Grab ID from URL
    // Find user ID on target entry
    const [result] = await db(table)
      .select(tableID)
      .where({id});
    !result && next(); // Let routes handle 404s
    result[tableID] === user_id // Determine if IDs match
      ? next()
      : res.status(403).json({ message: 'Only the user associated with that entry is authorized to make this request.' })
  }
}

function validate(req, res, next)  {
  const errors = validationResult(req);
  !errors.isEmpty()
    ? res.status(400).json({invalid: errors.array()})
    : next();
}

// "required" = array of required columns
// "reqID" = whether or not some field should match
//      the user ID of the user making the request
// "colID" = the name of the field in the request body
//     that should match the user ID of the user making the request
function reqCols(required, reqID = false, colID = 'id') {
  return (req, res, next) => {
    // Filters through array of required columns to flag any missing fields
    const body = Object.keys(req.body);
    let missing = required
      .filter(prop => !body.includes(prop));
    // Checks if ID is required and if user_id isn't already set on the request
    if(!!reqID && !req.user_id && !body.includes(colID)) {
      // If ID is required, but user_id isn't already on request, then adds colID field name to the array of missing values
      missing = [...missing, colID];
    }
    // Rejects request if there are missing columns
    !!missing.length
      ? res.status(400).json({ message: `Your request is missing the following required fields: ${missing.join(', ')}`})
      : next();
  }
}

// Requires sub-fields if parent fields are present
// *** Use reqCols() to require the parent fields themselves ***
// "reqObjs" = object w/ keys equal to parent fields in request body
// and values equal to array of strings representing required fields
function reqNestCols(reqObjs) {
  return (req, res, next) => {
    const body = Object.keys(req.body);
    // Compares request body to specified parents to see which parent fields are available to check
    const checkParents = body
      .filter(prop => Object.keys(reqObjs).includes(prop));
    // Moves on to next middleware if there are no parent fields to check
    if(!checkParents.length) {
      return next()
    }
    let missing = [];
    checkParents.forEach(parent => {
      const absent = reqObjs[parent]
        // Filter out fields that are included
        .filter(prop => !body.includes(prop))
        // Prepend the name of parent field for better error message
        .map(prop => `${parent}.${prop}`);
      // Add any missing fields to collection
      missing = [...missing, ...absent];
    })
    // Reject request if required sub-fields are missing
    !!missing.length
      ? res.status(400).json({ message: `Your request is missing the following required sub-fields: ${missing.join(', ')}`})
      : next();
  }
}

// "allowed" = array of columns that the user is allowed to specify in the request body
function onlyCols(allowed) {
  return (req, res, next) => {
    // Filters through array of allowed columns to flag
    //     any that are included that shouldn't be
    const flagged = Object.keys(req.body)
      .filter(prop => !allowed.includes(prop));
    // Rejects request if there are any unallowed columns
    if (!!flagged.length) {
      return res.status(400).json({
        error: `You are not permitted to submit any of the following fields in the body of this request: ${flagged.join(', ')}`
      })
    } else {
      next();
    }
  }
}

// "allowObjs" = object w/ keys equal to parent fields
//     in request body and values equal to array of strings
//     representing allowed subfields
function onlyNestCols(allowObjs) {
  return (req, res, next) => {
    const body = Object.keys(req.body);
    // Compares request body to specified parents
    // to see which parent fields are available to check
    const checkParents = body
      .filter(prop => Object.keys(reqObjs).includes(prop));
    // Moves on to next middleware if there are no parent fields to check
    if(!checkParents.length) {
      return next()
    }
    let flagged = [];
    checkParents.forEach(parent => {
      const subflags = body
        // Filter down to subfields that shouldn't be included
        .filter(prop => !allowObjs[parent].includes(prop))
        // Prepend the name of parent field for better error message
        .map(prop => `${parent}.${prop}`)
      // Add any missing fields to collection
      flagged = [...flagged, ...subflags];
    })
    // Rejects request if there are any unallowed subfields
    if (!!flagged.length) {
      return res.status(400).json({
        error: `You are not permitted to submit any of the following subfields in the body of this request: ${flagged.join(', ')}`
      })
    } else {
      next();
    }
  }
}
